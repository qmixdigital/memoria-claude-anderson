---
name: feedback_title_h1_padrao_guest_post
description: "Padrão de title e H1 em guest post da rede: title = keyword + complemento real (nunca \"guia\", \"qual usar\"), sufixo medido no portal, ≤60; H1 ≤ ~75 chars, keyword no início, diferente do title"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-11T15:42:10.919Z
---

Em 11/09/2026 o operador apontou "título fora do padrão" no lote do certificadodigital.seg.br.
O que estava errado: `<title>` com complemento vazio ("Certificado digital em nuvem: guia",
"...: qual usar", ou só a keyword) e H1 de 100 a 119 caracteres.

**Why:** o title é o que aparece na busca; complemento sem informação não dá motivo de clique.
H1 gigante vira parágrafo e repete o dek. O portal-engine acrescenta " - Nome do Portal" ao
title, e o sufixo real varia (10 a 24 chars); assumir 18 estoura o limite.

**How to apply:**
- title = keyword no início + complemento com informação concreta ("formatos e PJe",
  "faixas em 2026", "instalação e backup"); total com sufixo ≤ 60. Medir o sufixo do portal
  (curl no title de um artigo existente), não chutar.
- H1 = keyword no início, 60 a 77 caracteres, diferente do title, sem lista de 3 promessas.
- Conferir os dois no ar antes de fechar o lote, junto com meta (ver
  [[feedback_meta_description_com_keyword]]).
