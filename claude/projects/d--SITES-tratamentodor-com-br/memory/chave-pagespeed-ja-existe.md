---
name: chave-pagespeed-ja-existe
description: A chave da API do PageSpeed ja existe na skill pagespeed-audit; chamar a API sem key cai na cota anonima e estoura em poucas chamadas
metadata: 
  node_type: memory
  type: reference
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-23T19:51:44.044Z
---

A chave do PageSpeed Insights está embutida em
`C:\Users\User\.claude\skills\pagespeed-audit\scripts\psi.py` (e documentada no
`SKILL.md` da mesma skill). O script aceita `PSI_API_KEY` como override.

**Por quê:** chamei a API por `curl` sem `&key=` e levei
"Quota exceeded ... Queries per day", o que me fez concluir errado que a cota
diária tinha acabado e quase levou o usuário a criar um projeto novo no Google
Cloud sem necessidade. A cota anônima compartilhada estoura em poucas chamadas;
com a chave, o mesmo teste passou na hora.

**Como aplicar:** ao chamar na mão, sempre incluir `&key=` na URL de
`runPagespeed`. Preferir rodar `scripts/psi.py` da skill, que já cuida disso.
Antes de sugerir criar credencial nova em qualquer serviço do Google, conferir
se já existe uma nas skills ou nos JSON do Desktop. Ver [[cls-de-fonte-medir-no-alvo]].
