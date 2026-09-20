---
name: consultarimovel-anuncios-topo-e-densidade
description: "Anderson quer anuncio de afiliado no INICIO da pagina (onde da clique) e em varios lugares, \"como AdSense\"; densidade vive em lib/afiliados.ts"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4c2c3c43-1e33-4694-8b4b-8d6b832a0030
  modified: 2026-09-19T22:47:14.348Z
---

Duas ordens do Anderson em 19/09/2026 sobre o banner de afiliado (Consulte
Facil, consulta de CPF/CNPJ) no consultarimovel.ia.br:

1. "O banner, o lugar que da clique e no inicio, e nao no fim." A faixa
   compacta vai logo depois da primeira frase de abertura, antes da listagem.
   O texto longo de SEO, ao contrario, ele quer no FIM ("para as pessoas nao
   terem que ler um texto grande ate chegar no que precisam"). Banner no
   topo, texto no rodape: sao decisoes diferentes e as duas sao dele.
2. "Deveria ser mais invasivo, como se fosse um AdSense." Resolvido copiando a
   logica do AdSense automatico: in-feed a cada N linhas/itens, in-article a
   cada N secoes, ancora fixa fechavel no celular. Ele aprovou: "esta tudo
   certo".

**Why:** monetizacao por afiliado e prioridade dele; ele aceita o risco do
algoritmo de layout desde que a dose seja controlavel.

**How to apply:** densidade so por `DENSIDADE` em `app/src/lib/afiliados.ts`
(linhasPorUnidade 20, itensPorUnidade 50, secoesPorUnidade 2, maxPorLista 6,
ancoraCelular). Nunca anuncio de terceiro acima do produto proprio (na ficha a
faixa fica DEPOIS dos botoes de PDF/KML) nem em checkout, conta, relatorio,
admin e /planos/. Se o Search Console cair nas semanas seguintes, subir os
numeros, nao remover unidades. Ele nao passou os links de "consultar.cpf e
outros" que mencionou; o afiliado em uso e o Consulte Facil. Ver
[[anderson-prefere-resumo-e-autonomia]].
