---
name: url-sempre-clicavel
description: "Toda URL entregue ao Anderson deve vir como link clicavel, nunca como texto cru"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7147f3e8-6d89-49d6-9498-79e887619e94
  modified: 2026-09-08T22:45:44.500Z
---

Sempre informar a URL do que foi publicado, e **sempre como link clicavel**
(markdown `[texto](url)`), nunca como texto cru nem dentro de crase.

**Why:** ele confirmou que quer a URL sempre ("voce esta certo em sempre
fornecer a URL"), mas colada como texto ela obriga a copiar e colar. O
terminal do Claude Code renderiza markdown, entao link clicavel abre
direto.

**How to apply:** ao terminar qualquer publicacao, deploy ou criacao de
pagina, entregar o endereco como `[advdobrasil.com.br/pagina/](https://advdobrasil.com.br/pagina/)`.
Vale para URL de site publicado, repositorio no GitHub, deploy preview da
Cloudflare e painel externo.

Ver tambem [[deploy-direto-e-backup-sob-autorizacao]].
