---
name: project-pedido-cartorio-srv-br-apex-manual
description: "Pedido interno 146 (custo zero) com 30 backlinks para cartorio.srv.br via parceiros Rodrigo/Gustavo/Lucas; Apex automático ainda gasta crédito, correção em outro chat"
metadata:
  node_type: memory
  type: project
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-10-13T11:34:22.655Z
---

Pedido interno **QMIX-20261013-0F889F00 (id 146)** em qmix.com.br/admin/pedidos/146, criado 13/10/2026: total zero, cliente id 3 (QMIX Digital), 30 entregas (1 por parceiro das listas rodrigo.txt, gustavo.txt, lucas.txt em D:\SISTEMAS\Publicações em sites de parceiros WordPress). Kátia escreve o texto à mão e lança a URL publicada em cada entrega; o monitor confere no ar/link/indexado. Planilha espelho: D:\PORTAIS\BACKLINKS\cartorio.srv.br.xlsx (30 linhas "planejado"). Distribuição: 6 home, 9 UF, 10 cidades, 5 cartórios individuais.

**Why:** cartorio.srv.br é diretório da QMIX (GSC 90d: 1.747 imp, 12 cliques, site novo desde 02/09/2026); o pedido existe só para a Kátia saber âncora/URL/domínio e para a plataforma conferir indexação.

**How to apply:** `enviarParaIndexacao` em src/lib/indexador.ts manda toda entrega com url_publicacao ao Apex sozinho (3 créditos por URL). A trava para pedido de total zero NÃO foi aplicada (deploy em produção foi negado pelo classificador); o usuário vai corrigir em outro chat. Antes de a Kátia lançar URLs, confirmar que a trava está no ar; Apex deste pedido só com ordem do Anderson (apex.py manual, depois gravar indexacao_projeto_id). Parceiros vêm só de listas de domínios, sem checar se aceitam o tema.
