# Bot agenda-telegram: matérias por voz e captura de fotos

Data: 16/09/2026. Aprovado por Anderson em conversa.

## Objetivo

Estender o bot `@agendaqmix_bot` (hoje: áudio/texto → evento na agenda) com duas capacidades:

1. **Matéria por voz**: um briefing falado vira uma matéria produzida pelas skills existentes, com prévia no navegador, rodadas de revisão por áudio e publicação com um toque, em sites parceiros (rede do Jean, 38 sites) ou em portais próprios da QMIX (111 portais).
2. **Captura de foto**: cartão de visita, recibo, nota ou qualquer imagem vira um evento na agenda com os dados extraídos e a foto anexada.

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Quem produz a matéria | **Claude Code headless** (`claude -p`) na opengravity, com as skills copiadas | reusa exatamente o processo atual (pesquisa, redação, validador, imagem); nada é reimplementado |
| Fluxo de aprovação | **prévia no navegador** + botões Publicar / Novas orientações / Descartar | Anderson quer ver imagem, texto e links antes de ir ao ar |
| Destinos | parceiros (REST + senha de aplicativo) **e** rede própria (portal-engine) | pedido explícito; rede própria sem varredura do Search Console, portal vem do briefing |
| Onde guardar fotos | **só agenda** (evento de dia inteiro com dados na descrição e foto anexa) | pedido explícito; sem planilha, sem Google Contatos |
| Quem publica | o **bot**, não o agente | agente só escreve arquivos; credenciais dos portais ficam no bot; botão Publicar é previsível |
| Prévia | página servida pelo próprio bot | evita salto para outro servidor (painel conteudo.qmix.com.br fica no hostinger-vps) |
| Concorrência | 1 produção por vez, fila em disco | volume de uma pessoa; simplicidade |

## Arquitetura

```
Telegram ──webhook──▶ bot (opengravity, PM2 agenda-telegram, porta 3080)
                        │
                        ├─ Claude API (messages.parse)   → briefing / leitura de foto / evento
                        ├─ Whisper (OpenAI)              → transcrição
                        ├─ Google Calendar (SA)          → eventos
                        ├─ fila de jobs (data/jobs/<id>) → produção de matéria
                        │     └─ claude -p (processo filho, 1 por vez) → materia.json + imagem.webp + validador.json
                        ├─ prévia HTTP  GET /previa/<token>
                        └─ publicação: REST WP (parceiros) | portal-engine (rede própria)
```

### Módulos novos em `src/`

| Arquivo | Responsabilidade |
|---|---|
| `briefing.ts` | schema Zod + extração do briefing a partir do texto (Claude) |
| `destinos.ts` | resolve destino: carrega `parceiros.json` (do `jean.csv`) e `portais.json` (do `qmix_endpoints_atual.csv`); busca por nome/slug/domínio aproximado |
| `jobs.ts` | estado dos jobs em `data/jobs/<id>/job.json`; fila; transições |
| `producer.ts` | monta o prompt e roda `claude -p` (produção e revisão); lê os artefatos; timeout |
| `preview.ts` | renderiza a página HTML da prévia a partir de `materia.json` |
| `publish-partner.ts` | upload de mídia + criação de post via REST do WordPress com senha de aplicativo |
| `publish-portal.ts` | envio ao portal-engine com a chave do domínio |
| `photo.ts` | schema Zod + leitura da foto (Claude vision) |
| `intent.ts` | classificador de intenção da mensagem |
| `bot.ts` | passa a rotear por intenção; botões com id do job |
| `index.ts` | novas rotas: `GET /previa/<token>`, `GET /foto/<token>` |

`extract.ts`, `calendar.ts`, `transcribe.ts`, `store.ts` seguem como estão.

## Fluxo 1: matéria

### Roteamento de intenção

Toda mensagem de áudio/texto passa primeiro por um classificador leve (`intent.ts`, chamada curta ao Claude com saída estruturada): `agenda` | `materia` | `orientacoes` | `outro`. Só depois vai para o extrator específico (`extract.ts` ou `briefing.ts`). Sinais de `materia`: menção a publicar, matéria, artigo, portal, site, âncora, link do cliente. Quando há um job aguardando orientações (estado `aguardando_orientacoes`), a próxima mensagem é `orientacoes` sem classificar.

### Briefing (schema)

```ts
{
  destino: string,          // como a pessoa falou ("abadianoticia", "adonline")
  tipo_destino: "parceiro" | "rede" | "desconhecido",
  tema: string,             // assunto da matéria
  angulo: string | null,    // se a pessoa sugeriu enfoque
  links: [{ url: string, ancora: string }],  // links do cliente
  observacoes: string | null,
  confidence_note: string | null
}
```

`destinos.ts` resolve `destino` para um registro concreto (parceiro: slug, domínio, usuário, senha de aplicativo; rede: domínio, endpoint, api_key). Se não resolver com segurança, o cartão pergunta ("Você quis dizer abadianoticia.com.br ou achixclip.com.br?") com botões.

Cartão de confirmação do briefing: destino resolvido (nome e domínio), tema, ângulo, links com âncoras, observações, transcrição em itálico. Botões **✅ Produzir · ❌ Cancelar**. Correção por nova mensagem, como na agenda.

### Job

`data/jobs/<id>/job.json`:

```ts
{
  id, chatId, createdAt,
  estado: "fila" | "produzindo" | "previa" | "aguardando_orientacoes" | "revisando" | "publicando" | "publicado" | "descartado" | "erro",
  briefing, destino,
  rodadas: [{ n, orientacoes: string | null, iniciadoEm, terminadoEm, ok, erro? }],
  previaToken,             // 32 hex, gerado ao criar o job
  publicado?: { url, postId, em }
}
```

Artefatos por rodada em `data/jobs/<id>/r<n>/`: `materia.json`, `imagem.webp`, `validador.json`, `claude.log`. A prévia e a publicação sempre usam a última rodada `ok`.

### Produção (`producer.ts`)

- Comando: `claude -p <prompt> --output-format json --max-turns 60 --permission-mode bypassPermissions --add-dir <pasta do job>` com `cwd` numa pasta de trabalho fixa (`/var/www/agenda-telegram/claude-work`) que contém `.claude/skills/` com cópias de `materias-jornalisticas-linkbuilding` e `guest-post-rede` (scripts inclusos) e um `CLAUDE.md` com as regras globais de conteúdo (pt-BR, sem travessão, imagem de banco antes de IA, etc.), extraído do `CLAUDE.md` do Anderson.
- Prompt de produção: "Produza a matéria do briefing em `briefing.json` seguindo a skill X. **Não publique.** Grave `materia.json` `{titulo, linha_fina, html, categoria, tags[], alt_imagem, fontes[]}` e `imagem.webp` na pasta indicada. Rode o validador e grave `validador.json`."
  - parceiro → skill `materias-jornalisticas-linkbuilding`, validador `validador_materia.py`.
  - rede → regras de redação da `guest-post-rede` (2 links internos do próprio portal, sem externos além do cliente), validador `auditar.py` no modo local, **sem** etapa de Search Console.
- Prompt de revisão: idem, mais "matéria anterior em `r<n-1>/materia.json`; aplique **somente** estas orientações: ... ; mantenha o resto".
- Timeout 20 min por rodada; log em `claude.log`. Falha → estado `erro`, mensagem ao Anderson com as últimas linhas do log e botão **🔁 Tentar de novo**.
- Fila: um `claude -p` por vez; jobs em `fila` avisam a posição.
- Variáveis do processo filho: `ANTHROPIC_API_KEY`, chaves de banco de imagem (Pixabay/Pexels) e Runware, copiadas do `.env` do bot.

### Mensagem de prévia

```
📰 <título>
<linha fina>
Destino: <nome> (<domínio>) · Rodada <n> · Validador: <ok | N avisos>
🔗 Prévia: https://api-indexation.qmix.com.br/agenda-bot/previa/<token>
[📤 Publicar] [🎙 Novas orientações] [❌ Descartar]
```

Os `callback_data` carregam o id do job (`pub:<id>`, `rev:<id>`, `del:<id>`), então vários jobs podem estar em prévia ao mesmo tempo.

### Prévia (`GET /previa/<token>`)

Página HTML estática (sem JS), responsiva, com: faixa no topo com destino e estado; imagem de destaque com alt; título; linha fina; corpo renderizado; **links do cliente destacados** (fundo amarelo) com a âncora e a URL visíveis; rodapé com categoria, tags, avisos do validador e fontes. Token de 32 hex, `X-Robots-Tag: noindex`, sem listagem. `GET /previa/<token>/imagem.webp` serve a imagem.

### Novas orientações

Botão → job vai para `aguardando_orientacoes`, bot responde "Manda o áudio ou texto com o que mudar". Próxima mensagem do chat vira `orientacoes` (transcrita se áudio), abre rodada `n+1` em `revisando`, nova prévia ao terminar. `/cancelar` durante a espera volta o job para `previa`.

### Publicar

- **Parceiro** (`publish-partner.ts`): `POST /wp-json/wp/v2/media` (imagem, `alt_text`, sem legenda de crédito), depois `POST /wp-json/wp/v2/posts` com `status: publish`, `title`, `content`, `excerpt` (linha fina), `categories` (resolve nome → id, cria se não existir), `tags`, `featured_media`. Autenticação Basic com usuário e senha de aplicativo do `parceiros.json`.
- **Rede própria** (`publish-portal.ts`): `POST <endpoint_url>` com a `api_key` do domínio e o payload no formato do portal-engine. **O formato exato será levantado no plugin instalado em um portal (ex.: adonline.com.br) durante a implementação**; a primeira publicação real na rede só acontece após um teste em modo rascunho.
- Sucesso → estado `publicado`, mensagem com link ao vivo, linha em `data/publicados.jsonl` (id, destino, url, título, chat, data). Falha → estado volta a `previa`, mensagem com o erro e os botões de novo.

## Fluxo 2: foto

- Gatilho: `message:photo` (ou `document` com imagem). Legenda e/ou áudio enviado logo antes/depois (janela de 60 s) contam como contexto.
- Claude (vision, `messages.parse`) devolve:

```ts
{
  tipo: "cartao" | "recibo" | "nota" | "documento" | "outro",
  titulo_evento: string,       // "Contato: Fulano, Empresa" | "Recibo: R$ 45,00 Posto X"
  campos: [{ nome: string, valor: string }],  // nome, empresa, cargo, telefone, e-mail, site | valor, data, estabelecimento, forma de pagamento, itens
  resumo: string,
  lembrete: { start: string, all_day: boolean } | null,  // só se o contexto pediu prazo
  confidence_note: string | null
}
```

- Cartão de confirmação com tipo, título e campos. Botões **✅ Salvar na agenda · ❌ Cancelar**; correção por nova mensagem.
- Evento: dia inteiro na data de hoje (ou `lembrete.start` se houver), descrição com os campos em linhas `Nome: valor`, o resumo e "Foto: <url>". Foto anexada via `attachments[{fileUrl, title, mimeType}]` (com `supportsAttachments=true`) apontando para `GET /foto/<token>` servido pelo bot (a foto fica em `data/fotos/<token>.jpg`); se a API recusar URL fora do Drive, a foto fica só como link na descrição. Sem lembrete popup em capturas sem prazo; com prazo, popup 30 min antes.

## Segurança

- Só o `ALLOWED_CHAT_ID` conversa com o bot (já existe).
- `parceiros.json` e `portais.json` ficam em `/var/www/agenda-telegram/segredos/`, fora do git, permissão 600; gerados a partir do `jean.csv` e do `qmix_endpoints_atual.csv` por um script `scripts/gerar-destinos.mjs` rodado na máquina local e copiados por scp.
- Prévia e foto só por token de 32 hex; `noindex`; sem listagem; foto e prévia expiram com o job (descartado/publicado + 30 dias).
- Processo `claude -p` roda com `--permission-mode bypassPermissions` **dentro** da pasta de trabalho, sem acesso ao `.env` do bot (recebe só as variáveis listadas).

## Erros e limites

- Whisper/Claude fora → mensagem curta e o estado não muda.
- `claude -p` falha ou estoura 20 min → `erro`, log, botão Tentar de novo.
- Publicação falha → volta a `previa`, erro exibido, pode tentar de novo ou revisar.
- Destino ambíguo → pergunta com botões; destino inexistente → lista os mais parecidos.
- Reload do PM2 no meio de uma produção: o processo filho morre; ao subir, jobs em `produzindo`/`revisando` voltam para `fila` e recomeçam a rodada.

## Testes

- Unitários (Node `--test`): resolução de destinos com nomes aproximados; renderização da prévia (links destacados, escape de HTML); montagem do payload de parceiro; transições de estado do job.
- Extração real (Claude): 5 briefings falados típicos e 3 fotos (cartão, recibo, nota), como foi feito na agenda.
- Ponta a ponta antes de liberar: 1 matéria num site do Jean e 1 num portal da rede publicadas como **rascunho** (`status: draft`), conferidas no wp-admin, depois removidas.

## Fora de escopo

Search Console; Google Contatos; planilha; agendamento de publicação futura; múltiplos usuários; painel conteudo.qmix.com.br; edição manual do HTML pela prévia.

## Entrega

Etapas independentes, cada uma entregável e testada sozinha, nesta ordem: (1) foto → agenda; (2) briefing + destinos + cartão; (3) produtor com Claude Code no servidor + prévia; (4) novas orientações; (5) publicar parceiro; (6) publicar rede própria.
