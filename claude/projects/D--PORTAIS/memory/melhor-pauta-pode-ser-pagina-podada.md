---
name: melhor-pauta-pode-ser-pagina-podada
description: "No portal já convertido, a keyword com melhor posição costuma ser de página que a poda apagou; e o cruzamento por slug não detecta canibalização"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5300fb27-e526-4274-9cf5-d400b4619c89
  modified: 2026-08-29T20:03:40.520Z
---

Ao procurar pauta no Search Console de um portal já convertido, cruze as consultas
com **o que responde 410**, não só com o acervo vivo. No adonline, em 29/08/2026,
as três melhores oportunidades eram páginas podadas em agosto, e duas ainda
ranqueavam em **posição 5 e 6,5** servindo 410. Republicar no mesmo slug aproveita
o histórico e custa menos que ranquear URL nova.

Isso só funciona porque o 410 da poda passou a ser condicional: ver
[[410-da-poda-sombreia-artigo-novo]]. Antes, a página republicada nascia morta.

**Duas leituras que enganam:**

1. **Impressão em posição ruim subestima a demanda; em posição boa, a representa.**
   Uma consulta com 112 impressões na posição 55 tem volume real muito maior, porque
   quase ninguém chega à página 6. Outra com 109 na posição 4 já está perto do teto.
   Ordenar candidatos por impressão bruta inverte a prioridade.
2. **A janela de 180 dias pode esconder um colapso.** O adonline não caiu na
   conversão: caiu em **maio de 2026**, de 1.259 cliques em março para 85 em maio.
   Os grandes números de 180 dias eram todos anteriores. Sempre abrir a série por mês
   antes de concluir qualquer coisa sobre causa.

**Canibalização: cruzar por slug não basta.** O teste tem que procurar a intenção no
**corpo e no título** dos artigos. Dois falsos negativos apareceram numa varredura só:
"cores que combinam com roxo" já era atendido por `/o-que-combina-com-roxo/` (o token
"combinam" não bate com "combina") e "qual médico para emagrecer" por
`/nutricionista-ou-endocrinologista-para-perder-peso/`. E o teste decisivo é olhar no
`query x page` do Console **qual página já ranqueia** para o termo.

Ver [[padrao-seo-do-lote]], [[impressao-nao-e-oportunidade]] e
[[lote-a-partir-do-search-console]].

⚠️ A chave da conta de serviço do Search Console mudou de lugar: hoje está em
`C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json`, não mais no Desktop.
