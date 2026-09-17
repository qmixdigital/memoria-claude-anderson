# BRIEFING TÉCNICO: App de Lista de Compras e Tarefas da Família

Projeto interno de uso familiar. Sem SEO, sem AdSense, sem indexação. Prioridade: simplicidade, custo zero e facilidade de uso no celular.

---

## 1. Objetivo

Aplicativo web (PWA) para a família gerenciar de forma compartilhada:

1. Listas de compras por categoria (Supermercado, Frutaria, Farmácia, Viagem e categorias customizáveis)
2. Lembretes e tarefas (ex.: marcar consulta, pagar conta, buscar exame), com responsável e data opcional
3. Itens frequentes para adicionar com um toque

Todos os membros veem as mesmas listas em tempo quase real.

---

## 2. Stack (100% Cloudflare, plano gratuito)

| Camada | Tecnologia |
|---|---|
| Backend/API | Cloudflare Workers + Hono |
| Banco | Cloudflare D1 (SQLite gerenciado) |
| Frontend | SPA leve servida pelo próprio Worker (assets estáticos via Workers Static Assets) |
| Sync | Polling a cada 5 segundos quando a aba está ativa (suficiente para família; não usar Durable Objects nesta versão) |
| Deploy | Wrangler CLI |
| Domínio | Subdomínio próprio ou workers.dev |

Frontend sem framework pesado: HTML + CSS + JavaScript vanilla ou Preact via CDN. Nada de build complexo. O objetivo é um único projeto simples de manter.

Estrutura do projeto:

```
lista-familia/
├── wrangler.toml
├── schema.sql
├── src/
│   └── index.ts        (Worker com Hono: API + serve assets)
├── public/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── manifest.json
│   ├── sw.js           (service worker do PWA)
│   └── icons/          (192px e 512px)
└── package.json
```

---

## 3. Autenticação (simples, para família)

- Sem OAuth, sem email. Login por seleção de membro + PIN de 4 dígitos.
- Tela inicial mostra os membros cadastrados (nome + avatar emoji). O membro toca no seu nome e digita o PIN.
- Ao validar, o Worker gera um token de sessão (UUID) salvo na tabela `sessions` e enviado como cookie HttpOnly com validade de 90 dias.
- Existe um membro "admin" (o primeiro criado) que pode cadastrar/remover membros e categorias.
- Seed inicial: criar o admin via variável de ambiente no primeiro deploy (ADMIN_NAME e ADMIN_PIN em wrangler.toml como vars, com instrução para trocar o PIN depois).
- Rate limit de tentativas de PIN: máximo 5 tentativas por IP a cada 10 minutos (controle simples em tabela `login_attempts` com limpeza automática).

---

## 4. Modelo de dados (schema.sql para D1)

```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🙂',
  pin_hash TEXT NOT NULL,          -- SHA-256 do PIN + salt
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  expires_at TEXT NOT NULL
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🛒',
  sort_order INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  quantity TEXT,                   -- texto livre: "2kg", "3 caixas"
  note TEXT,
  done INTEGER DEFAULT 0,
  added_by INTEGER REFERENCES members(id),
  done_by INTEGER REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  done_at TEXT
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  note TEXT,
  assignee_id INTEGER REFERENCES members(id),  -- opcional
  due_date TEXT,                                -- opcional, YYYY-MM-DD
  done INTEGER DEFAULT 0,
  added_by INTEGER REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  done_at TEXT
);

CREATE TABLE frequent_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  times_used INTEGER DEFAULT 1,
  UNIQUE(category_id, name)
);

CREATE TABLE login_attempts (
  ip TEXT NOT NULL,
  attempted_at TEXT DEFAULT (datetime('now'))
);

-- Categorias iniciais
INSERT INTO categories (name, emoji, sort_order) VALUES
  ('Supermercado', '🛒', 1),
  ('Frutaria', '🍎', 2),
  ('Farmácia', '💊', 3),
  ('Viagem', '🧳', 4);
```

Regra de frequentes: toda vez que um item é adicionado, fazer upsert em `frequent_items` incrementando `times_used`. A tela de adicionar mostra os 10 mais usados da categoria como chips de um toque.

---

## 5. API (Hono)

Todas as rotas sob `/api`, protegidas por middleware de sessão exceto login.

```
POST   /api/login                { member_id, pin }
POST   /api/logout
GET    /api/me

GET    /api/bootstrap            -- retorna tudo de uma vez: categorias, itens abertos,
                                 -- tarefas abertas, membros, frequentes (1 request no load)

GET    /api/items?category_id=X&since=TIMESTAMP   -- polling incremental
POST   /api/items                { category_id, name, quantity?, note? }
PATCH  /api/items/:id            { done?, name?, quantity?, note? }
DELETE /api/items/:id

POST   /api/items/clear-done     { category_id }   -- limpar comprados da categoria

GET    /api/tasks
POST   /api/tasks                { title, note?, assignee_id?, due_date? }
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/categories
POST   /api/categories           (admin)
PATCH  /api/categories/:id       (admin)

GET    /api/members
POST   /api/members              (admin) { name, emoji, pin }
DELETE /api/members/:id          (admin)
PATCH  /api/members/:id/pin      -- membro troca o próprio PIN
```

Polling: o frontend guarda o timestamp da última sync e chama `/api/items?since=...` e `/api/tasks?since=...` a cada 5 segundos quando `document.visibilityState === 'visible'`. Quando a aba volta ao foco, sync imediata.

---

## 6. Telas (mobile first)

1. **Login**: grade de membros com emoji e nome, teclado numérico para o PIN.
2. **Home**: abas ou cards das categorias, cada um com contador de itens pendentes. Aba separada "Tarefas" com badge de pendentes e destaque para tarefas com data vencida ou de hoje.
3. **Lista da categoria**:
   - Campo de adicionar no topo (nome + quantidade opcional), com chips dos frequentes logo abaixo
   - Itens pendentes em cima, comprados embaixo (riscados, agrupados, colapsáveis)
   - Toque no item marca/desmarca como comprado
   - Mostrar quem adicionou (emoji pequeno)
   - Botão "Limpar comprados"
4. **Tarefas**: lista com título, responsável (emoji), data. Ordenar por data (vencidas primeiro, sem data por último). Toque marca como concluída.
5. **Ajustes**: trocar meu PIN; se admin: gerenciar membros e categorias.

Visual: limpo, botões grandes para toque, dark mode automático via `prefers-color-scheme`. Toda interação com feedback otimista (atualiza a UI antes da resposta da API e reverte em caso de erro).

---

## 7. PWA

- `manifest.json` com nome "Lista da Família", ícones 192 e 512, `display: standalone`, tema conforme paleta escolhida.
- Service worker com cache dos assets estáticos (estratégia cache-first para assets, network-only para `/api`).
- Não implementar modo offline de escrita nesta versão. Se estiver sem rede, mostrar aviso "Sem conexão" e bloquear ações.
- Instruir na primeira visita como adicionar à tela inicial (banner simples dispensável).

---

## 8. Deploy

```bash
npm create hono@latest lista-familia   # template cloudflare-workers
cd lista-familia
npx wrangler d1 create lista-familia
# copiar database_id para o wrangler.toml
npx wrangler d1 execute lista-familia --file=./schema.sql --remote
npx wrangler deploy
```

wrangler.toml deve conter:

```toml
name = "lista-familia"
main = "src/index.ts"
compatibility_date = "2026-08-01"

[assets]
directory = "./public"

[[d1_databases]]
binding = "DB"
database_name = "lista-familia"
database_id = "..."

[vars]
ADMIN_NAME = "Anderson"
ADMIN_PIN = "0000"   # trocar no primeiro acesso
```

No primeiro request, se a tabela `members` estiver vazia, criar o admin com ADMIN_NAME e ADMIN_PIN.

Depois do deploy, apontar um subdomínio (ex.: lista.seudominio.com.br) via Workers Routes ou Custom Domain no painel da Cloudflare.

---

## 9. Regras de execução para o Claude Code

1. Gerar o projeto completo e funcional, sem placeholders e sem TODO pendente.
2. TypeScript no Worker. Frontend em JavaScript vanilla, sem bundler.
3. Nenhuma dependência além de Hono no backend. Frontend sem dependências (ou Preact via CDN se necessário).
4. Validar entradas na API (nomes não vazios, PIN de 4 dígitos, ids existentes).
5. PIN sempre com hash + salt, nunca em texto puro no banco.
6. Testar localmente com `wrangler dev` e D1 local antes de instruir o deploy.
7. Ao final, entregar um README curto com: comandos de deploy, como criar membros, como trocar o PIN do admin.
8. Não usar travessões em nenhum texto da interface ou documentação.

---

## 10. Fora de escopo (não implementar nesta versão)

- Notificações push
- Modo offline com fila de sincronização
- Compartilhamento externo de listas
- Histórico de preços ou orçamento
- Durable Objects / WebSockets

Essas melhorias podem entrar numa v2 se a família sentir falta.
