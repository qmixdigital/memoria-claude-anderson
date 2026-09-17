---
name: project_rblc_backlinks_lote8_paginas_internas
description: rblc.com.br lote 8 (12/09/2026): 36 guest posts nos sites 60-104 da lista, 7 para a home e 29 para as 20 paginas internas com mais cliques no GSC; pipeline em d:/tmp/rblc8; Apex pendente
metadata:
  type: project
---

**Lote 8 do rblc.com.br (12/09/2026)**: 36 guest posts nos portais 60 a 104 da lista do Anderson (9 sites de saúde excluídos). Primeiro lote com distribuição de destino: **7 para a home (~20%) e 29 para as 20 páginas internas com mais cliques** no Search Console do rblc (90 dias, sc-domain:rblc.com.br via SA enjai-493011), 9 páginas com 2 links. Planilha D:/PORTAIS/BACKLINKS/rblc.com.br.xlsx linhas 1998–2033, aba Notas "Lote 8 - bloco 1/2/3/4" e "Lote 8 - resumo". Apex enviado em 12/09/2026, projeto 1177933 (36 URLs, saldo 359 -> 323); lote encerrado.

- Hosts: 24 no opengravity, 9 na clinicas-vps (slug do engine de agencianacionaldenoticias.com é `agencianacional`), 3 no srv1166087 (gazetaretina, jornalsaosimao, romanceseleituras).
- Categoria IPTV criada/oculta também em divirto, folhadonoroeste, folhar, pontonaturalbrasil, jornaldobairroalto, publisherbrasil (opengravity), nos 9 da clinicas-vps e nos 3 do srv.

**Why:** pauta tirada do GSC de cada portal, mas quase toda query de oportunidade já tinha artigo do próprio portal ranqueando (exquisito, wtw19, incast, sabedoriaglobal, etc.); por isso o tema foi ligado à página de destino do rblc (ex.: euvo → /teste-iptv-4k) com ângulo que o portal não cobria. Template da clinicas-vps renderiza share buttons antes do conteúdo e 3 relacionados dentro do `<article>`: auditar ar acusa "primeiro link nao e do cliente" e "internos=4/5" como falso positivo.

**How to apply:** pipeline em d:/tmp/rblc8 (plano.json com dest/anc/internos/hosts_entrada por portal, gate.py, montar_lote.py N, pub_rblc8.js, entrada.py, verif.py, seo_check.py, stock_img.py com usados.json). Lição de escrita: val2 exige ≥1200 palavras em p+headings e auditar ≤1400 no total, então tabela+ol têm de ficar ≤150 palavras; trigramas repetidos ≥3x contam como ERRO acima de 5 distintos, e substituir a mesma expressão pelo mesmo sinônimo três vezes cria trigrama novo. Ver [[project_rblc_backlinks_lote7_iptv28]], [[reference_rapid_url_indexer_api]].
