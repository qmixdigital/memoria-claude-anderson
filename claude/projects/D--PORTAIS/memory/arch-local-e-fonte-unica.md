---
name: arch-local-e-fonte-unica
description: O arquivo local da arquitetura é a fonte única; patch aplicado só no servidor é revertido no próximo deploy
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T20:55:56.655Z
---

**Toda correção numa arquitetura tem que ir para o arquivo local**
(`D:\PORTAIS\<PORTAL>\infra\arch-X.js`), nunca só para o `archs.js` do servidor.

O que aconteceu em 15/08/2026: apliquei três correções direto no
`/opt/portal-engine/src/archs.js` da clinicas-vps (mosaico de 6 itens,
deduplicação das editorias na home e corte de resumo por palavra). Depois publiquei
o redesenho do single post a partir do `arch-V.js` local, que **substitui a seção
inteira da arch V**, e as três correções sumiram sem aviso.

O Anderson viu antes de mim: os mesmos três artigos apareciam no mosaico e de novo
no bloco da editoria.

**Why:** o deploy da arquitetura troca o bloco `/* ==== ARCH X ==== */` inteiro.
Qualquer coisa aplicada só no servidor dentro desse bloco é perdida.

**How to apply:** patch em `render.js` pode ser aplicado no servidor, porque o
deploy da arch não toca nele. Patch dentro de uma arch, **sempre no arquivo local
primeiro**, e depois `scp`. Antes de publicar uma arch, conferir se o servidor tem
alguma alteração que o local não tem.

Ver [[campos-novos-do-motor]] e [[layout-nada-centralizado]].

Confirmado outra vez em 20/08/2026 no euvo: o redeploy da arquitetura V apagou
os dois acabamentos que só tinham sido aplicados no `archs.js` do servidor
(`h2` nos cartões da lista e primeira imagem `eager`). A auditoria pegou de
volta, mas o certo é reaplicar na fonte local antes de qualquer redeploy.

A fonte da opengravity é `D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\`,
que até 20/08 só tinha a U. A V foi salva lá.
