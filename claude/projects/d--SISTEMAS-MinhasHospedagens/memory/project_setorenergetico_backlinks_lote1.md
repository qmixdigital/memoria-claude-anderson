---
name: project_setorenergetico_backlinks_lote1
description: "setorenergetico.com.br lote 1 de backlinks (20 paginas de cidade), publicado 13/09/2026, Apex 1181193"
metadata: 
  node_type: memory
  type: project
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-13T22:01:17.399Z
---

Lote 1 de backlinks do setorenergetico.com.br (diretorio Next.js, cliente): 20 guest posts,
1 por pagina de cidade `/empresas/cidades/{uf}/{cidade}/`, publicados em 13/09/2026 na rede
propria (portal-engine, opengravity + clinicas-vps + srv1166087). Cidades: SP, RJ, BH,
Curitiba, Brasilia, Goiania, Salvador, Porto Alegre, Fortaleza, Manaus, Campinas, Recife,
Campo Grande, Florianopolis, Cuiaba, Belem, Joao Pessoa, Natal, Uberlandia, Guarulhos.

Fonte da verdade: `D:/PORTAIS/BACKLINKS/setorenergetico.com.br.xlsx` (21 linhas, aba Notas).
Pipeline em `D:/tmp/set/` (art/*.py, plano.json, lote_ar.json, fichas.json, usados.json).
Lista para indexacao: `D:/SISTEMAS/INDEXADORES/urls/setorenergetico-lote1.txt`.

**Status: FECHADO.** Publicado, auditado (0 erros reais) e enviado ao Apex em 13/09/2026,
projeto **1181193** (20 URLs, 60 creditos, saldo 4579->4519).

**Why:** o cliente tem 4.981 paginas de cidade; o GSC (SA backlinkguard) mostrava impressao
alta e posicao ruim nas capitais. Proximo lote deve pegar as cidades seguintes por
impressao/empresas (cidades_all.json em D:/tmp/set) e NAO repetir os 20 portais deste lote.

**How to apply:** ao continuar, ler a planilha antes de escolher portal/cidade; portais ja
usados para este cliente estao na coluna Portal. Keyword de 7 palavras (energia eolica no
Rio Grande do Norte) estoura 3% no seo_full.py por causa do breadcrumb do template, mas o
auditar.py oficial deu 2,43%: nao "corrigir" isso de novo. Ver [[reference_rapid_url_indexer_api]]
e [[feedback_registro_backlinks_por_dominio]].
