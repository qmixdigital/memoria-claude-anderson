---
name: landing-cliente-qmix-fluxo-deploy
description: "Deploy da landing cliente.qmix.com.br exige purge manual do Cloudflare, e na ordem certa"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5e2b784b-8b29-4400-bb3e-44dae40592f1
  modified: 2026-08-07T14:35:21.530Z
---

`cliente.qmix.com.br` é a página de recepção enviada no primeiro atendimento por
WhatsApp. Não tem intenção de ranquear: o que importa é performance, preview do
link e clareza, não SEO textual.

Toda entrega precisa de **purge manual** do cache de borda, na ordem:
commit e push, esperar o deploy do Pages, **confirmar a origem estável** com
várias requisições usando cache-buster, **só então purgar**, e validar na URL
limpa (sem query string).

**Why:** existe uma Cache Rule na zona `qmix.com.br` chamada "Edge cache HTML for
public marketing pages" com `edge_ttl 3600` em `override_origin`, que casa
`path eq "/"` sem filtrar host e portanto pega esta landing. O `max-age=60` do
Pages é ignorado. Purgar antes da origem propagar é pior que não purgar: a
requisição de verificação repovoa o cache com o HTML velho por mais uma hora.
Isso aconteceu de verdade em 07/08/2026.

**How to apply:** purge via API com o token de `d:/SISTEMAS/Cloudflare/.token_master`,
zona `f5f7d6c9deebedfb89f5f3b6b0884a23`, purgando os arquivos `/` e `/index.html`.
Validar sempre na URL sem `?v=`, porque query string diferente é objeto diferente
no cache e não prova nada. A correção definitiva (excluir o host da Cache Rule)
depende de permissão que o classificador do Claude Code bloqueou; o Anderson foi
informado e pode aplicar pelo painel.
