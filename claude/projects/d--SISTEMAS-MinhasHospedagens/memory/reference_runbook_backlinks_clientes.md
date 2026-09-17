---
name: reference_runbook_backlinks_clientes
description: "Runbook do trabalho recorrente \"fazer backlinks para clientes\" (guest posts na rede QMIX) e onde ficam os scripts prontos"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T22:43:57.704Z
---

O processo de publicar guest posts da rede apontando para um cliente está
documentado em `D:\PORTAIS\BACKLINKS\COMO-FAZER-BACKLINKS-PARA-CLIENTES.md`, com
os scripts reutilizáveis em `D:\PORTAIS\BACKLINKS\scripts\` (publicar_lote.py,
gerar_imgs.py, montar_urls.py, conferir_lote.py, seo_audit30.py,
aplicar_link_interno.py + link_interno.php, corrigir_titles.py).

Ordem: pauta aprovada pelo operador → rota por domínio (rest / engine / wpcli) →
artigos + imagens Runware → publicar em lotes de 5 → resolver permalink real →
inserir link interno → auditar SEO → purgar cache → gravar bloco datado no
`.txt` do cliente → indexar só com autorização.

**Why:** é trabalho recorrente e cada rodada repetia as mesmas armadilhas
(permalink que o receptor não devolve, title estourado pelo nome do site que o
tema acrescenta, cache que esconde a correção).

**How to apply:** ler o runbook antes de começar uma campanha nova; ele lista as
três rotas de publicação e os falsos positivos da auditoria. Registro por cliente
segue [[feedback_registro_backlinks_por_dominio]]; indexação segue
[[reference_rapid_url_indexer_api]]; keywords em
[[reference_pesquisa_palavras_chave_portais]].
