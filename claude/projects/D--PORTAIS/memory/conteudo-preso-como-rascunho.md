---
name: conteudo-preso-como-rascunho
description: O motor guarda como rascunho todo conteúdo que chega sem imagem, devolve 201 e nunca publica
metadata:
  type: project
---

`render.js`: `status: (!image && site.exigeImagem !== false) ? 'draft' : ...`

Conteúdo da plataforma do Antônio que chega **sem imagem** é gravado como
rascunho. O JSON existe, a resposta é **HTTP 201**, e o artigo **nunca vai ao
ar**. Nada acusa: nem log de erro, nem auditoria, nem o painel da plataforma.

Foram **72 artigos parados desde 16/08/2026 em 31 portais** da clinicas-vps,
descobertos só porque um teste de entrega de diagnóstico deu 404 na URL.

**Why:** o comportamento é proposital e correto (artigo sem imagem fica feio),
mas não existia nada que avisasse do acúmulo.

**How to apply:** o destravamento é gerar imagem e passar para `publish` —
`destrava_rascunhos.py` agrupa por tema, mas gera **uma imagem por artigo**,
porque vários portais recebem o mesmo assunto e reaproveitar o arquivo poria a
mesma foto em até 21 portais.

⚠️ O `saude_diaria.py`, instalado em `/opt/portal-engine/` nas três máquinas com
cron às 6h17, passou a vigiar isso.

⚠️ Ao testar a entrega, **mandar imagem no payload** ou saber que o 404 é
esperado: sem isso o teste acusa defeito onde não há.

Ver [[reiniciar-motor-depois-de-editar]] e [[registro-de-donos-de-slug]].
