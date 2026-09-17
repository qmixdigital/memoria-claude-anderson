---
name: gsc-anchor-tool-method
description: Ferramenta e MÉTODO PADRÃO para extrair textos âncora de backlink de relatórios do Google Search Console
metadata: 
  node_type: memory
  type: project
  originSessionId: 72cd5c16-de38-4309-a694-e974962e4ee0
---

Projeto em `d:\SISTEMAS\GOOGLE SEARCH CONSOLE`: ferramenta `gsc_anchors.py` que lê o ZIP de Performance do GSC e gera planilha CSV (Texto âncora, URL) para backlinks. Config por cliente em `projetos.json`; base IBGE em `municipios.json`.

**O método padrão está documentado em `README.md` (seção "MÉTODO PADRÃO") e deve ser SEMPRE seguido** — não decorar clientes específicos, seguir o método.

**Why:** os âncoras são para backlinks; o Google penaliza over-optimization / footprint de anchor exato. Objetivo sempre: âncoras naturais e VARIADAS.

**How to apply:**
- Base = consultas reais do Console; `naturalizar_ancora: true` (pergunta → frase declarativa); `min_palavras_ancora: 2` (sem fragmentos).
- Anti-footprint: `phrase_rules` com 5–7 variações por regra (o tool rotaciona os templates entre URLs); vários `anchor_templates` para cidades. Nunca deixar um padrão de 2 palavras dominar a lista.
- `multiplas_ancoras: true` (banco rico, round-robin entre URLs); gramática/acentos corretos (preposição por estado no mapa `ESTADOS`; siglas em caixa).
- Só conteúdo vivo: `manter_wp_posts` (REST do WP) / host / sitemap / `excluir_slugs`.
- Nunca repetir âncora já usada pelo cliente: `--excluir-ancoras <csv>` (exclui por texto exato E por conjunto de palavras). `--max N` quando pedirem um número. `--min-cliques N` para cortar por tráfego.
- Modos: `search_query` (artigos/blog), `query_list` (site de 1 página/domínio), `template` (diretórios de cidade).

Cada cliente processado vira uma entrada em `projetos.json` + um `.cache_titulos_*.json`.
