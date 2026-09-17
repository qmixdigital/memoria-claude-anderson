---
name: conteudo-subdominio-materias
description: "Como entregar matéria manual pelo painel do Anderson (conteudo.qmix.com.br), criado em 14/09/2026 dentro do qmix-next"
metadata: 
  node_type: memory
  type: project
  originSessionId: 10960742-afae-47cf-b6e1-ffc9769124ce
  modified: 2026-09-14T15:12:57.167Z
---

Desde 14/09/2026 a entrega padrão de matéria para portal de terceiros é um link em
`https://conteudo.qmix.com.br/<token>`, não DOCX nem MCP. O subdomínio é servido pelo
próprio qmix-next (route group `src/app/(conteudo)`, tabela `materias`, middleware por
host), sem ligação com pedidos/clientes do marketplace.

**Como gravar:** JSON com `titulo, linha_fina, html, portal, cliente, links[{ancora,url}],
imagem, imagem_alt` → `scp` para `/tmp` na VPS → `ssh hostinger-vps-srv1166087 'export
PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && cd /var/www/qmix-next && node
scripts/criar-materia.mjs /tmp/x.json'` (Bash com `dangerouslyDisableSandbox: true`).
A última linha é o link; o Telegram do admin recebe o mesmo link. O script recusa (sem
gravar) título > 70, travessão, `<h1>`, `<script>` e âncora que não esteja no HTML como
`<a href="URL">âncora exata</a>`.

**Admin:** `qmix.com.br/admin/materias` (revogar, novo link, colar URL publicada).
Imagens em `/var/www/qmix-next/uploads/materias/<token>.webp` (fora do build; não precisa
de deploy por matéria). Migração já aplicada; DNS A `conteudo` proxied criado com ok do
Anderson. Spec e plano em `docs/superpowers/{specs,plans}/2026-09-14-materias-conteudo-subdominio*.md`
do qmix-next. Detalhe da skill em [[materias-jornalisticas-linkbuilding]] (Passo 9a).

**Why:** o Sistema Antônio (PHP, acesso.qmix.com.br) fazia isso com
`public-view-article-redactor.php?token=` e vai ser desligado; o marketplace tem gerador
próprio e não deve misturar.

**Pasta por cliente (regra do Anderson, 14/09/2026):** `D:\SISTEMAS\GUEST POSTs\clientes\<slug>\`
com `memoria.md` (fonte principal de âncoras, regras, temas, entregas) e `materias\` (json,
html, webp de cada matéria). Cliente novo = criar a pasta na hora a partir de
`clientes\MODELO-memoria.md`. 12 pastas semeadas do `clientes-recorrentes.md` e da memória
do claude.ai.

**Regras de tela do Anderson (14/09/2026):** a página pública mostra só o artigo (sem lista
de links nem instruções: jornalista copia sem ler); "Imagem: Pexels" embaixo da foto, sem
link; botão "Baixar imagem" entrega WebP 1216x640 com nome = `palavra_chave`; ao lado, link
destacado (âmbar) "Ver original no Pexels" para conferir a licença. Campos obrigatórios no
JSON: `palavra_chave`, e com imagem `imagem_fonte` + `imagem_fonte_url` (da ficha do
`banco_img.py`).

**Design aprovado (14/09/2026, via /design-fable, revisor vetou a direção clara):** barra
fixa em tinta `--q-ink` com "Copiar texto formatado" (verde, copia text/html + text/plain
via ClipboardItem: H2 e links colam no WordPress) e "Ver original no Pexels" em âmbar cheio;
no celular só esses dois ficam fixos. Faixa "Para publicação em <portal>" separada, abaixo
dos botões. Artigo em papel branco, Bricolage + Instrument (`--font-bricolage`,
`--font-instrument` do root layout). CSS em `src/app/(conteudo)/conteudo.css`, prefixo `ct-`,
reset de `button` em `:where()` (sem isso `.ct button{font:inherit}` vencia `.ct-btn`).
Sem logo e sem a palavra QMIX. Sem rodapé (Anderson tirou a frase "mantenha os links").
A foto é servida em `/<token>/<slug-da-palavra-chave>.webp` com `Content-Disposition` de mesmo
nome: botão direito e "salvar como" já baixam com a keyword (pedido de 14/09/2026). Mockup e prints no scratchpad `design/mockup-b2.html`.
Cuidado na VPS: outra sessão pode estar rodando `./deploy.sh` ao mesmo tempo; conferir
`ps aux | grep deploy.sh` antes, senão os `rm -rf .next-build` se atropelam (ENOENT no
`_buildManifest.js.tmp`).

**Links internos (regra do Anderson, 14/09/2026):** perguntar sempre se há links internos
do portal; conferir que o domínio bate com o portal (ele pode mandar de outro domínio por
engano); âncora = corte do título real; bloco antes do último parágrafo com rótulo
convencional de portal ("Leia também", "Leia mais", "Veja também", "Relacionadas"), nunca o mesmo em sequência; "Você vai gostar de ler também" foi reprovado.
Correção sem trocar o link: `scripts/atualizar-materia.mjs <token> json`.

**Planilha do Jean (14/09/2026):** planilha Google `<<REMOVIDO>>`,
aba de pedidos "Pedidos Fevereiro" (nome fixo, segue em uso), preços na aba "DOMÍNIOS"
(colunas NORMAL e APOSTAS). Escrita pela conta de serviço `seoqmix`
(`C:\Users\User\Documents\APIs\seoqmix-024e9465e9d9.json`; Sheets API ativada e planilha
compartilhada como editor). Script `scripts/planilha_jean.py enviar <dominio> "<título>" <link>`
na skill materias-jornalisticas-linkbuilding. Só enviar quando o Anderson mandar.
jornaldebeltrao.com.br não está na aba de preços (perguntar o valor).

**Bot do Telegram para pautas (14/09/2026):** Anderson descartou WhatsApp (a Z-API do
Antônio está morta, "Instance not found") e usa o @qmixmarktplace_bot. Webhook
(`/api/webhooks/telegram`) agora aceita `message`: quem manda `/start` entra em
`telegram_destinatarios` como pendente e recebe boas-vindas; ativar com
`scripts/enviar-pauta.mjs ativar <chat_id> <chave>` só quando ele mandar; enviar com
`scripts/enviar-pauta.mjs <token> <chave>` (grava `enviado_para`/`enviado_em` na matéria).
Chave `teste` = chat do Anderson (<<REMOVIDO>>). Jean ainda não cadastrado. Próximo passo
possível: capturar a resposta com o link publicado e preencher `url_publicacao`.

**Pedido do marketplace → aprovação pelo cliente (14/09/2026):** `scripts/entregar-para-cliente.mjs
<token> <entregaId> [--email cliente]` chama `/api/admin/materias/entregar-cliente` (Bearer
CRON_SECRET) → `lib/entregar-conteudo-cliente.ts`: rascunho em `conteudos_gerados` (modelo
`equipe-qmix`, imagem apontando para conteudo.qmix.com.br), ticket `revisao-conteudo` no
pedido, e-mail `emailConteudoParaAprovacao` (vai ao ADMIN até o Anderson liberar `--email
cliente`), aviso no Telegram admin. A tela `/enviar-dados/<pedido>` já carrega o rascunho e
a aprovação usa o fluxo existente. Piloto: pedido 103 (Pablo, Zenura), entrega 153, conteúdo
#8, ticket TKT-20260914-IS6Y.

**How to apply:** briefing "portal + âncoras + URLs" sem menção a MCP = modo painel.
Pauta aprovada antes de escrever; foto de banco (`banco_img.py`), nunca IA sem ordem.
