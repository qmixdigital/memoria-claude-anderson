---
name: sites-cliente-fora-da-publicacao
description: "Site de cliente nunca entra como destino de publicação na rede QMIX; recebe link, não recebe artigo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T18:51:12.588Z
---

Site de cliente não é destino de publicação. Ele recebe backlink, não recebe
artigo do Antônio nem do módulo Editor Externo. Só portais da rede entram como
destino.

**Why:** o Anderson corrigiu isso em 17/08/2026 ao ver sites de cliente na lista
de domínios disponíveis para os editores. Já haviam sido cadastrados por engano
em `wp_authors`, o que os fazia aparecer nas telas de liberação.

**How to apply:** antes de cadastrar um domínio como destino, checar se ele tem
campanha em `news_sources` e histórico de publicação. Perfil de cliente é o
domínio com zero campanha, zero notícia, zero artigo SEO e ausente do
`wp_sites`. Na dúvida, perguntar ao Anderson em vez de cadastrar.
Removidos em 17/08/2026: belemduartealmeida, carretaspresidente, comprarsites,
comprarvisualizacoes, energiaeficiente, itacaiugo, pael, qmiximoveis,
tratamentodor, qmix.digital. O peritodicas.com virou diretório e também saiu,
com campanha e `wp_sites` desativados. Ver [[operacoes-painel-antonio]].
