---
name: titulo-duplicado-nao-apagar
description: Artigo duplicado com backlink de cliente diferente em cada cópia não se apaga; muda o título
metadata:
  type: project
---

Em 20/08/2026 achei **79 pares de artigos com título idêntico dentro do mesmo
portal**, quase todos na opengravity. Título repetido no mesmo domínio faz as duas
páginas disputarem a mesma busca.

A saída óbvia, apagar uma, **não serve**: em vários pares cada cópia carrega o
backlink de um **cliente diferente**. No par dos atores de Tim Burton, uma linka
para `criexp.com.br` e a outra para `teste-iptv.top`.

**Why:** o backlink é o produto. Apagar a página tira o link que alguém comprou,
e o ganho de SEO não paga isso.

**How to apply:**
- **Muda o título, nunca o slug.** Slug é permalink e URL indexada.
- Fica intacto o que tem mais clique no Search Console; empatado, o de slug sem
  sufixo `-2`, que é o original.
- O título novo sai dos `<h2>` do próprio texto, aproveitados inteiros. Cortar
  palavra do H2 produz frase quebrada ("Funciona a tecnologia encapsulada").
- **Quando os dois textos dizem mesmo a mesma coisa, deixar como está.** Inventar
  ênfase no título promete o que o texto não entrega. Sobraram 23 assim.
- Script: `desempata_titulos.py`, no scratchpad da sessão.

Junto disso, dois achados de medição que se repetem:

- **Contar `<title>` sem desescapar HTML infla tudo.** `&amp;` vira cinco
  caracteres e a varredura acusou 3.392 títulos "acima de 60" quando o número real
  em portal vivo era zero.
- **Pasta `*.desativado-*` em `/srv/portais` polui qualquer varredura** e não é
  servida nem reconstruída. Conferir se o portal está vivo em outra máquina antes
  de apagar: ver [[tres-instancias-do-motor]].
