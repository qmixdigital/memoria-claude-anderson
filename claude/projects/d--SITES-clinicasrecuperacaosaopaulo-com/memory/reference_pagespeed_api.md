---
name: reference_pagespeed_api
description: Chave da API do Google PageSpeed Insights + skill pronto para auditar Core Web Vitals de qualquer site
metadata: 
  node_type: memory
  type: reference
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-08-03T11:54:35.456Z
---

Para medir **PageSpeed / Core Web Vitals** de qualquer projeto:

**Skill global** `pagespeed-audit` (em `C:\Users\User\.claude\skills\pagespeed-audit\`) — chamar via `/pagespeed-audit` ou pedir "rodar PageSpeed". Tem a chave embutida, script `scripts/psi.py` (só stdlib), limiares CWV oficiais, laboratório×campo (CrUX) e playbook de correções (LCP/CLS/INP) focado em Next.js.

**Chave da API (Google PageSpeed Insights):** `<<REMOVIDO>>`

**Uso direto:** `python3 C:/Users/User/.claude/skills/pagespeed-audit/scripts/psi.py URL [URL2...] --strategy mobile|desktop|both`

Sempre medir **mobile** (base do ranking) na home + 1 página por template. Site novo não tem dados de campo (CrUX) — guiar pelo laboratório e re-medir em ~28 dias. Limiares: LCP ≤2,5s, CLS ≤0,1, INP ≤200ms.
