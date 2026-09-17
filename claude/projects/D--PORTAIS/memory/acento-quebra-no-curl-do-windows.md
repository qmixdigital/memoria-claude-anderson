---
name: acento-quebra-no-curl-do-windows
description: JSON com acento passado no -d do curl por subprocess no Windows chega mangado ao servidor
metadata:
  type: feedback
---

Passar JSON com acento no `-d` do `curl` por subprocess no Windows entrega os
bytes na **página de código do console**, e não em UTF-8. No teste de entrega da
plataforma a categoria `"Saúde"` chegou quebrada e o motor gerou a URL
`/sa-de/`, o que parecia defeito do `slugify` do próprio motor.

**Why:** o sintoma aponta para o lado errado. Cheguei a abrir o `render.js`
procurando a falha de normalização, e o `slugify` estava correto, conferido
rodando a própria função no servidor.

**How to apply:** gravar o corpo em arquivo com
`io.open(p,'w',encoding='utf-8')` e enviar com `--data-binary @arquivo`, mais
`Content-Type: application/json; charset=utf-8`. Antes de acusar o motor de
mangar acento, rodar a função dele no servidor com a string de teste.
