# Planejamento: MCP Server de publicação em portais WordPress (QMIX)

Objetivo: permitir que a Kátia publique artigos com imagem em qualquer portal parceiro direto de um projeto no claude.ai, sem instalar nada na máquina dela e sem instalar plugin nos sites dos parceiros.

Princípio: o servidor fica no Hetzner, guarda as credenciais e fala com cada portal pela REST API nativa do WordPress usando Senhas de aplicativo. O Claude só enxerga ferramentas de alto nível (listar sites, subir imagem, criar post).

---

## 1. Arquitetura

```
Kátia (claude.ai, projeto "Publicações")
        |
        |  conector MCP (HTTPS, OAuth)
        v
mcp.qmix.com.br  (Hetzner, Bun + TypeScript, PM2, Nginx, Cloudflare)
        |
        |  REST API + Basic Auth (senha de aplicativo)
        v
portal1.com.br/wp-json/wp/v2/...   portal2.com.br/wp-json/...   ...
```

Componentes do servidor:

1. Transporte MCP Streamable HTTP em `/mcp`.
2. Camada OAuth 2.1 mínima (necessária para o claude.ai aceitar o conector).
3. Cofre de sites: lista de portais com usuário e senha de aplicativo, cifrada em disco.
4. Cliente WordPress: funções que encapsulam os endpoints `media`, `posts`, `categories`, `tags`.
5. Módulo de imagem: baixa por URL ou gera via API externa, e sobe para a mídia do portal.

---

## 2. Pré-requisitos

### 2.1 Site piloto
- Escolha um portal seu (não de parceiro) para o teste. Ideal: um dos 17 portais receptores que já existem.
- Confirme que a REST API está aberta: abrir `https://SITE/wp-json/wp/v2/posts` no navegador deve retornar JSON.
- Confirme HTTPS ativo (Senhas de aplicativo não funcionam em HTTP).

### 2.2 Usuário e senha de aplicativo no site piloto
1. Crie um usuário dedicado com papel **Editor** (ou Autor, se não precisar publicar sem revisão). Nome sugerido: `qmix-publicador`.
2. Logado com esse usuário: Usuários > Perfil > seção "Senhas de aplicativo" > nome `QMIX MCP` > Adicionar.
3. Copie a senha gerada (formato `<<REMOVIDO>>`). Ela só aparece uma vez.
4. Teste no terminal antes de escrever qualquer código:

```bash
curl -u "qmix-publicador:<<REMOVIDO>>" \
  https://SITE/wp-json/wp/v2/users/me
```
Deve retornar o JSON do usuário. Se der 401, algum plugin de segurança está bloqueando (ver seção 11).

### 2.3 Servidor e domínio
- Hetzner: pode reaproveitar o CX32 do Google News Discovery ou criar um CX22 só para isso (o serviço é leve).
- Subdomínio `mcp.qmix.com.br` apontado no Cloudflare para o IP do servidor, proxy laranja ligado, SSL modo Full (strict).
- Bun instalado no servidor, PM2 e Nginx já no padrão dos seus outros projetos.

---

## 3. Stack e estrutura do projeto

Stack: Bun, TypeScript strict, `@modelcontextprotocol/sdk`, Hono ou Express para HTTP, `zod` para schemas, SQLite (via `bun:sqlite`) para sites e tokens OAuth.

```
wp-mcp/
  src/
    index.ts             # sobe o servidor HTTP, monta /mcp e rotas OAuth
    mcp/
      server.ts          # cria o McpServer e registra as tools
      tools/
        listar-sites.ts
        listar-categorias.ts
        subir-imagem.ts
        criar-post.ts
        atualizar-post.ts
        gerar-imagem.ts  # opcional, fase 2
    wp/
      client.ts          # fetch com Basic Auth, tratamento de erro
      media.ts           # upload de mídia
      posts.ts           # criar/atualizar/consultar posts
      taxonomies.ts      # categorias e tags
    vault/
      sites.ts           # leitura/escrita do cofre cifrado
      crypto.ts          # AES-256-GCM com MASTER_KEY do .env
    auth/
      oauth.ts           # endpoints OAuth 2.1 (metadata, register, authorize, token)
      store.ts           # clients, codes e tokens em SQLite
    images/
      fetch.ts           # baixa imagem por URL, valida tipo e tamanho
      generate.ts        # chama API de geração (fase 2)
  scripts/
    add-site.ts          # CLI: bun run scripts/add-site.ts
    test-site.ts         # CLI: valida credenciais de um site
  data/
    vault.db             # SQLite cifrado, fora do git
  .env
  package.json
  tsconfig.json
```

Regras: Bun sempre (nunca npm), `data/` e `.env` no `.gitignore`, logs sem senha.

---

## 4. Cofre de credenciais

Tabela `sites` no SQLite:

| campo | descrição |
|---|---|
| slug | identificador curto usado nas tools (ex.: `portal-saude-go`) |
| nome | nome legível para a Kátia |
| url | base do site, sem barra final |
| usuario | login do WordPress |
| senha_cifrada | senha de aplicativo cifrada com AES-256-GCM |
| categoria_padrao | id da categoria default (opcional) |
| ativo | 1/0 |
| observacoes | ex.: "parceiro aceita só rascunho" |

`MASTER_KEY` no `.env` (32 bytes em base64, gerada com `openssl rand -base64 32`). Nunca sai do servidor.

CLI para cadastrar:

```bash
bun run scripts/add-site.ts \
  --slug portal-saude-go \
  --nome "Portal Saúde Goiás" \
  --url https://portalsaude.com.br \
  --usuario qmix-publicador
# a senha é pedida de forma interativa, sem ficar no histórico do shell
```

`test-site.ts` chama `/wp-json/wp/v2/users/me` e `/wp-json/wp/v2/categories` e imprime OK ou o erro.

---

## 5. Ferramentas MCP

Todas com nomes e descrições em português, porque a Kátia vai vê-las.

### listar_sites
Sem parâmetros. Retorna slug, nome, url, ativo. O Claude usa para resolver "publica no Portal Saúde" para o slug certo.

### listar_categorias
`{ site: string }`. Retorna `[{ id, nome, slug }]`. Também expõe tags se necessário.

### subir_imagem
```
{
  site: string,
  url_imagem: string,        // URL pública (banco de imagens)
  nome_arquivo?: string,     // ex.: dor-no-joelho.jpg (bom para SEO)
  alt?: string,
  legenda?: string
}
```
Retorna `{ media_id, url_final }`. Internamente: baixa a URL, valida `content-type` (jpeg/png/webp), limita a 8 MB, envia `POST /wp-json/wp/v2/media` com `Content-Disposition: attachment; filename="..."` e o binário no body, depois `POST /wp-json/wp/v2/media/{id}` com `alt_text` e `caption`.

### criar_post
```
{
  site: string,
  titulo: string,
  conteudo_html: string,
  resumo?: string,
  slug?: string,
  categorias?: number[],
  tags?: string[],           // nomes; o servidor cria se não existir
  imagem_destaque_id?: number,
  status?: "draft" | "pending" | "publish",   // default: draft
  agendar_para?: string      // ISO, muda status para "future"
}
```
Retorna `{ post_id, link, status, link_edicao }`. `link_edicao` = `SITE/wp-admin/post.php?post=ID&action=edit`, para a Kátia revisar em um clique.

### atualizar_post
`{ site, post_id, ...campos opcionais de criar_post }`. Usado para trocar status de draft para publish depois da revisão.

### gerar_imagem (fase 2)
`{ site, prompt, nome_arquivo, alt }`. Gera via API (Replicate/Flux, OpenAI Images ou outra), salva temporariamente e chama o mesmo fluxo de `subir_imagem`. Retorna `media_id`.

Padrões de segurança nas tools:
- `status` só vira `publish` se o site tiver `permite_publicar = 1` no cofre; senão o servidor força `draft` e avisa na resposta.
- Toda resposta de erro devolve mensagem clara ("Site X respondeu 401: verifique a senha de aplicativo") em vez de stack trace.

---

## 6. Referência REST do WordPress usada

Header de autenticação em todas as chamadas:
```
Authorization: Basic base64("usuario:senha de aplicativo")
```

| ação | método e endpoint | campos principais |
|---|---|---|
| validar credencial | GET `/wp-json/wp/v2/users/me` | |
| categorias | GET `/wp-json/wp/v2/categories?per_page=100` | |
| criar tag | POST `/wp-json/wp/v2/tags` | `name` |
| upload de mídia | POST `/wp-json/wp/v2/media` | body binário, headers `Content-Type: image/jpeg`, `Content-Disposition: attachment; filename="x.jpg"` |
| metadados da mídia | POST `/wp-json/wp/v2/media/{id}` | `alt_text`, `caption`, `title` |
| criar post | POST `/wp-json/wp/v2/posts` | `title`, `content`, `excerpt`, `slug`, `status`, `categories`, `tags`, `featured_media`, `date` |
| atualizar post | POST `/wp-json/wp/v2/posts/{id}` | mesmos campos |

Teste manual do fluxo completo com curl, antes do código:

```bash
# 1. upload
curl -u "USER:SENHA" -X POST https://SITE/wp-json/wp/v2/media \
  -H "Content-Type: image/jpeg" \
  -H 'Content-Disposition: attachment; filename="teste.jpg"' \
  --data-binary @teste.jpg
# anote o "id" retornado

# 2. post
curl -u "USER:SENHA" -X POST https://SITE/wp-json/wp/v2/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste MCP","content":"<p>Olá</p>","status":"draft","featured_media":ID}'
```
Se os dois funcionarem, o resto é só embrulhar isso em código.

---

## 7. Autenticação do conector (OAuth)

O claude.ai exige que conectores personalizados usem OAuth 2.1 com Dynamic Client Registration e PKCE (ou sejam abertos, o que não serve aqui porque o servidor tem poder de escrita).

Implementação mínima, sem provedor externo:
- `GET /.well-known/oauth-authorization-server` e `/.well-known/oauth-protected-resource` com os metadados.
- `POST /register`: aceita qualquer cliente e devolve `client_id` (DCR).
- `GET /authorize`: mostra uma tela simples de login (usuário e senha fixos no `.env`, ou uma lista pequena de usuários na SQLite: Anderson, Kátia). Ao aprovar, gera `code` vinculado ao `code_challenge`.
- `POST /token`: troca `code` + `code_verifier` por `access_token` (validade 30 dias) e `refresh_token`.
- Middleware em `/mcp`: valida o Bearer token na SQLite.

O SDK oficial traz utilitários para montar essas rotas a partir de um provedor que você implementa; confira a versão instalada porque a API dessa parte mudou algumas vezes. Peça ao Claude Code para gerar essa camada a partir da documentação atual do SDK e testar com o MCP Inspector.

Ordem sugerida: primeiro faça o servidor funcionar sem OAuth, testado localmente com o MCP Inspector (`bunx @modelcontextprotocol/inspector`) ou via Claude Code (`claude mcp add --transport http wp http://localhost:3000/mcp`). Só depois adicione OAuth e conecte no claude.ai.

---

## 8. Deploy no Hetzner

```bash
# no servidor
git clone <repo> /opt/wp-mcp && cd /opt/wp-mcp
bun install
cp .env.example .env   # preencher MASTER_KEY, PUBLIC_URL, OAUTH_USERS, PORT=3000
bun run scripts/add-site.ts ...   # cadastrar o site piloto
pm2 start "bun run src/index.ts" --name wp-mcp
pm2 save
```

Nginx (`/etc/nginx/sites-available/mcp.qmix.com.br`):
```
server {
  server_name mcp.qmix.com.br;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_buffering off;          # necessário para o streaming do MCP
    proxy_read_timeout 300s;      # uploads e geração de imagem
    client_max_body_size 20m;
  }
}
```

Cloudflare: proxy ligado, SSL Full (strict), certificado de origem ou Let's Encrypt no Nginx. Desligue "Rocket Loader" e cache para esse subdomínio (regra de cache: bypass em `mcp.qmix.com.br/*`).

`.env` mínimo:
```
PORT=3000
PUBLIC_URL=https://mcp.qmix.com.br
MASTER_KEY=<base64 32 bytes>
OAUTH_USERS=anderson:<hash bcrypt>,katia:<hash bcrypt>
IMAGE_MAX_MB=8
IMAGE_API_KEY=            # fase 2
```

---

## 9. Configuração no Claude

1. Configurações > Conectores > Adicionar conector personalizado > URL `https://mcp.qmix.com.br/mcp` > Conectar. O claude.ai abre a tela de login do seu servidor; entre e aprove.
2. Se estiver no plano Team, o admin adiciona uma vez para a organização; senão, cada conta (a sua e a da Kátia) conecta.
3. Crie o projeto "Publicações em portais" com instruções, por exemplo:

```
Você publica artigos da QMIX Digital em portais parceiros via conector "WP MCP".
Fluxo obrigatório:
1. Antes de publicar, chame listar_sites e confirme com a usuária qual site usar.
2. Escreva o artigo seguindo as regras de conteúdo da QMIX (arquivo anexo).
3. Mostre o artigo completo para revisão e aguarde aprovação explícita.
4. Suba a imagem com subir_imagem (nome de arquivo com a palavra-chave, alt descritivo).
5. Crie o post como draft e devolva o link_edicao.
6. Só use atualizar_post para status publish se a usuária pedir com essas palavras.
Nunca publique em mais de um site sem confirmação individual.
Não use travessões em nenhum texto.
```
4. Anexe ao projeto o documento de regras de conteúdo e de âncoras da QMIX.

Roteiro de uso para a Kátia (cola na descrição do projeto):
"Diga o tema, o cliente, o portal e o link da imagem. Revise o texto que o Claude mostrar. Aprove a ferramenta quando ele pedir. Abra o link de edição, confira, e publique no painel ou peça 'publicar agora'."

---

## 10. Plano de testes no site piloto

Fase A, sem Claude (curl):
- [ ] `users/me` retorna 200 com o usuário dedicado
- [ ] upload de JPG retorna id e a imagem aparece na biblioteca
- [ ] post draft criado com imagem destaque correta
- [ ] post atualizado para publish e visível no site

Fase B, servidor local + Inspector:
- [ ] `listar_sites` mostra o piloto
- [ ] `subir_imagem` com URL de banco de imagens funciona (testar JPG, PNG e WebP)
- [ ] `criar_post` com categorias e tags novas
- [ ] tentativa de `publish` em site sem permissão volta como draft com aviso
- [ ] erro de senha errada devolve mensagem legível

Fase C, deploy + claude.ai:
- [ ] conector conecta e lista as tools
- [ ] no projeto, fluxo completo tema > artigo > imagem > draft > link_edicao
- [ ] Kátia executa o fluxo sozinha uma vez com você observando
- [ ] refresh de token funciona depois de alguns dias (não pedir login toda hora)

Fase D, expansão:
- [ ] cadastrar 3 portais parceiros, rodar `test-site.ts` em cada um
- [ ] documentar quais portais bloqueiam a API (lista de "manual")

---

## 11. Segurança e cuidados

- Usuário dedicado por site, papel Editor no máximo. Nunca admin.
- Senhas de aplicativo podem ser revogadas no perfil do usuário a qualquer momento; anote a data de criação no cofre.
- Se um portal retornar 401 mesmo com senha nova, causas comuns: plugin de segurança desativando Application Passwords (Wordfence, iThemes/Solid Security, Disable REST API), ou o host removendo o header `Authorization` (Apache com FastCGI). Sem acesso admin ao site, esse portal fica na lista manual.
- Rate limit no servidor: no máximo 10 posts por site por hora, para proteger contra loop.
- Log de auditoria: tabela `publicacoes` com data, usuário OAuth, site, post_id, status. Serve para o relatório de links da QMIX.
- Backups do `data/vault.db` cifrado junto com o `MASTER_KEY` guardado separado (gerenciador de senhas).

---

## 12. Fases e ordem de execução

1. Dia 1: curl no site piloto (seção 6), esqueleto do projeto, cofre, cliente WP, tools sem OAuth, teste com Inspector.
2. Dia 2: OAuth mínimo, deploy no Hetzner, Nginx, Cloudflare, conectar no claude.ai, projeto e instruções.
3. Dia 3: teste com a Kátia, ajustes de texto das tools e das instruções.
4. Depois: `gerar_imagem`, auditoria para relatório de links, cadastro em lote dos parceiros, ferramenta `verificar_post` para checar se o link continua no ar (útil para o serviço de link building).

Sugestão de prompt inicial para o Claude Code no VS Code:

"Crie um MCP server em TypeScript com Bun seguindo o arquivo planejamento-mcp-wordpress-qmix.md. Comece pela seção 3 (estrutura), 4 (cofre) e 5 (tools listar_sites, subir_imagem, criar_post), sem OAuth. Use @modelcontextprotocol/sdk com transporte Streamable HTTP. Inclua os scripts add-site.ts e test-site.ts. Nunca use npm."
