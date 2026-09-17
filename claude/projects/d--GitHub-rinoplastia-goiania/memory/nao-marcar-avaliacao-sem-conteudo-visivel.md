---
name: nao-marcar-avaliacao-sem-conteudo-visivel
description: Anderson nao quer aggregateRating nem Review em nenhum site sem depoimento real coletado e exibido na pagina
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a1e770fd-c076-4e4e-a360-b1c613a7adfc
  modified: 2026-09-09T09:42:03.476Z
---

Em 09/09/2026, ao aplicar os dados do Google Business Profile no
rinoplastiagoiania.com.br, o perfil trazia nota 5,0 com 45 avaliacoes. Nao
marquei `aggregateRating`, e o Anderson confirmou a decisao: "Nao temos
avaliacoes legitimas coletadas de pacientes. Entao e melhor nao fazer nada.
O Google nao gosta de avaliacoes criadas."

**Why:** o Google exige que dado estruturado represente conteudo **visivel na
propria pagina**. Marcar nota sem exibir os depoimentos e o caso classico de
acao manual por structured data spam, e em site medico (YMYL) o estrago e
desproporcional. Somado a isso, desde 2019 o Google ja ignora
`aggregateRating` auto-declarado em LocalBusiness e Organization, entao nem
gera estrela na SERP: o risco existe e o retorno e zero.

**How to apply:** nunca inserir `aggregateRating`, `Review`, `ratingValue` ou
bloco de depoimentos que nao venha de avaliacao real, coletada, com
autorizacao de uso e **exibida no HTML da pagina**. Isso vale para toda a rede,
nao so para este site. Se o cliente quiser estrela na busca, o caminho e
alimentar o proprio Google Business Profile, cujas avaliacoes o Google ja usa
sozinho, sem precisar de marcacao no site.

Quando houver depoimento legitimo para publicar, a marcacao correta e `Review`
individual por depoimento mais o `aggregateRating` derivado deles, sempre com
o texto visivel ao lado. Ver [[rinoplastia-goiania-hospedagem]].
