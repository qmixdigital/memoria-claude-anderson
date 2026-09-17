---
name: auditar-ignora-creditos-commons
description: auditar.py (guest-post-rede) ignora o bloco "Créditos das imagens" do Wikimedia Commons na contagem de palavras e links desde 10/09/2026
metadata:
  type: reference
---

`C:\Users\User\.claude\skills\guest-post-rede\scripts\auditar.py` foi corrigido em 10/09/2026 (backup auditar.py.bak-creditos-20260910): o bloco de créditos das imagens do Commons (CRED_RX, _sem_creditos, _e_credito) não conta mais como palavras nem como links internos/externos. Antes, o link nofollow do Commons estourava "exatamente 2 links internos".

Calibração aprendida no lote figa2023: validador_materia.py conta só texto dentro de <p> (mínimo 1200) e auditar.py conta o total (máximo 1400); manter <p> em 1200-1250 e tabela/ol/headings enxutos para passar nos dois. Ver [[imagens-wikimedia-commons]].
