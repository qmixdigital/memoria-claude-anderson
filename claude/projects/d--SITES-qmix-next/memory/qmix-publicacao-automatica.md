---
name: qmix-publicacao-automatica
description: "Fluxo de publicação automática (Telegram → portal → Apex) aprovado em 2026-09-10; 73 portais conectados, 6 desativados; o que é manual e o que é automático"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-10T20:36:55.890Z
---

Aprovado por Anderson em 2026-09-10. Vale só para conteúdo aprovado pelo cliente
a partir dessa data; o que veio antes segue o fluxo manual.

**Como funciona:** cliente aprova texto (com imagem de capa escolhida entre 3 opções
Pexels/Pixabay) → se o produto tem linha ativa em `portais_conectados`, o Telegram do
admin recebe botão `🚀 Publicar em {domínio}` (callback `pub_ok:<conteudoId>`) →
clique publica com imagem, grava `url_publicacao`, fecha o pedido, e-mail ao cliente
e envia ao Rapid URL Indexer em modo Apex. Sem conexão: mensagem sem botão, admin
publica na mão e cola a URL; o Apex e o e-mail disparam do mesmo jeito.

**Dois tipos de conexão** (`portais_conectados.tipo`): `qmix-api` (endpoint
`/wp-json/xxxx-api/v1/artigos` + X-API-KEY, plugin receptor da nossa rede e
portal-engine) e `wp-rest` (REST nativa + senha de aplicativo, rede de parceiros do
Jean). Segredos cifrados com `WP_VAULT_KEY` do `.env`. Scripts na VPS:
`scripts/importar-conexoes.mjs` e `scripts/testar-conexoes.mjs`.

**Estado em 2026-09-10:** 73 ativas (36 Jean + 37 nossos). Desativadas por endpoint
quebrado: Cirurgia da Catarata, Notebook X, Plano Médico Saúde, Saúde Vitalidade,
Setor Energético (viraram apps Next, mapa do Antônio desatualizado) e Barra News
(WordPress sem `/wp-json`).

**Why:** o cliente do pedido 101 reclamou que não via o conteúdo e o admin tinha
que copiar e publicar na mão; Anderson quer aprovar com um clique e nunca publicar
sem passar por ele.

**How to apply:** não publicar nada sem o clique no Telegram. Ao ligar portal novo,
preencher "Publicação automática" na tela do produto e clicar em "Testar conexão".
Teste de credencial wp-rest usa `/posts?context=edit`, nunca `/users/me` (Cloudflare
dos parceiros desafia essa rota). Credenciais dos parceiros: `D:\SISTEMAS\Publicações
em sites de parceiros WordPress\jean.csv`; chaves da nossa rede:
`D:\SISTEMAS\MinhasHospedagens\qmix_endpoints_atual.csv`. O classificador bloqueia
mover credenciais em lote; o caminho foi Anderson apontar o CSV.
Relacionado: [[qmix-produto-nome-e-dominio]], [[qmix-telegram-notificacoes]].
