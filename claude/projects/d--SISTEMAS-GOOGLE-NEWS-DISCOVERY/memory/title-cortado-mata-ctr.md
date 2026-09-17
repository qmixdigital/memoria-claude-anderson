---
name: title-cortado-mata-ctr
description: Title truncado no meio da frase derruba o CTR mesmo em posicao 3; conferir a cauda do corte antes de investigar qualquer outra causa de CTR baixo
metadata:
  type: project
---

Title cortado pelo teto de 60 caracteres terminando em palavra pendurada
derruba o CTR a niveis que nao se explicam pela posicao. Caso medido em
22/08/2026 no desassossegada.com.br:

    "Tabela de preco para desentupimento: quanto - Desassossegada"
    2056 impressoes, posicao 2,9, 8 cliques = 0,4% de CTR

Na posicao 3 o esperado seria 10 a 15%. A pagina estava viva (HTTP 200), sem
404, sem penalidade. O leitor ve a pergunta sem fim na SERP e passa reto.

Varredura no HTML servido das tres instancias achou **183 paginas** com a mesma
falha, em 38 portais. Nao era caso isolado, era o mecanismo de corte.

**Why:** quando o CTR esta muito abaixo do esperado para a posicao, o reflexo e
suspeitar de 404, canonical, indexacao ou concorrencia na SERP. Nenhuma dessas
explica o caso. A causa estava no gerador de title, invisivel em qualquer
relatorio do Search Console, que mostra a query e a posicao mas nunca como o
title aparece.

**How to apply:** ao investigar CTR baixo em portal Portal Engine, ler primeiro
o `<title>` servido da pagina campea e olhar a ultima palavra. Se termina em
interrogativo (quanto, quando, qual, quem, onde), em imperativo de chamada
(veja, saiba, confira, entenda, descubra), em pronome atono ou em verbo que
pede complemento (fica, custa, faz, pode, deve, vale), o corte partiu a frase.
A correcao vive em `_cortaTitle` / `_podaCauda` no `render.js`. Ver tambem
[[pendencia-links-quebrados]] e [[sem-link-externo-no-corpo]].

Licao de metrica: o primeiro detector marcava como ruim qualquer title
terminado em verbo, o que escondeu uma regressao real, porque marcava tanto o
antes quanto o depois. "Como o marketing de influencia funciona" esta inteiro;
"Dolar fecha a R$ 5,11 e semana fica" nao esta. Detector que marca os dois
lados igual nao mede nada.
