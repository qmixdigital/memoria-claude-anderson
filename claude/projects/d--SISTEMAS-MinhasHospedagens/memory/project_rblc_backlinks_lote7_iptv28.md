---
name: project_rblc_backlinks_lote7_iptv28
description: rblc.com.br lote 7 (11/09/2026): 27 guest posts IPTV em 3 blocos nos portais portal-engine das 3 VPS, categoria IPTV oculta, workflow reutilizavel em d:/tmp/rblc{,2,3}
metadata:
  type: project
---

**Lote 7 do rblc.com.br (11/09/2026)**: 28 temas IPTV aprovados pelo Anderson, um por portal (sites 32 a 59 da lista dele); 27 publicados porque **medicodasmaos saiu** ("Médico de saúde não escrever", site de saúde). Todos para a home https://rblc.com.br/, âncoras variadas "teste IPTV ...". Registro na planilha D:/PORTAIS/BACKLINKS/rblc.com.br.xlsx, linhas 1971–1997, aba Notas "Lote 7".

- Bloco 1 (10): clickinfohub, editaldeconcurso, gazetaalerta, gpnoticias, jornalacapital, jornaldiario, jornaldinamico, jornalexpresso, jrnoticias, manacultura → Apex projeto 1176198.
- Bloco 2 (9): maragoginoticias, mgnoticias, mundodasnoticias, nodiario, noticiasagoras, noticiasdiarios, oiempreendedores, olharmoderno, opopularjornal → Apex projeto 1176380 (junto com o bloco 3).
- Bloco 3 (8): portalr5, revistarumo, riachonoticias, rsnoticias, saberdefato, semtedio, tempusnoticias, todossomosgeek → Apex projeto 1176380.

**Why:** o cliente já tinha 1.969 backlinks só para a home; a categoria IPTV fica **oculta da home e do menu** (hideCategories no sites.json) em todos os portais para não poluir o portal, mas o artigo segue no sitemap. Portei hideCategories para o engine do srv1166087 em 11/09 (backup render.js.bak-hidecats-20260911-181416). olharmoderno roda na clinicas-vps com baseUrl www.

**How to apply:** o pipeline de 3 hosts (opengravity, clinicas-vps, hostinger-vps-srv1166087) está em d:/tmp/rblc3/: prep_categorias.py (cria IPTV oculta), pub_rblc.js (publica com autoLink off + rebuild), entrada2.py (MAPA explícito de 2–3 hospedeiros do nicho por post; a versão automática entrada.py escolhia artigo fora do nicho), rebuild.js, verif.py, seo_check.py. Keyword longa estoura densidade 3% do auditar (≥7 palavras não cabe em 1.400 palavras): encurtar a keyword, não o texto. Ver [[reference_rapid_url_indexer_api]] e [[feedback_imagens_guest_post_sem_credito]].
