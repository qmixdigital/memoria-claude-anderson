---
name: feedback_pauta_adjacente_gsc_rede
description: Consulta "livre" do GSC da rede quase sempre já tem artigo servindo; consultar com dimensão page, escolher o portal com autoridade e escrever pauta ADJACENTE, não a mesma
metadata:
  type: feedback
---

Descoberto na campanha goiania.pro de 11/09/2026: todas as "oportunidades livres"
que a varredura por query devolveu (farda x uniforme no advivo, ar condicionado
estalando no incast, lembrancinha no azulmagazine, cortinas de sala no
jornaldobairroalto) já eram artigos publicados do próprio portal, só mal
posicionados. Escrever a mesma pauta canibaliza.

**Why:** a varredura antiga (`varre_tema.py`) usa só a dimensão `query`; sem
`page` não dá para ver que a consulta já tem dono. O operador pediu, nessa mesma
campanha, os portais "com melhor possibilidade de ranquear" e que as pautas
também trouxessem tráfego para a rede.

**How to apply:** rodar a consulta com `["query","page"]` (`qp_goi.py` no
scratchpad wc), tratar o portal que já aparece no tema como o hospedeiro certo
(tem autoridade) e escrever a pauta **adjacente** com PAA/banco de keywords. Os
2 links internos e os 3 links de entrada saem dos artigos irmãos. Conferir
colisão de slug/tema nos 3 hosts antes de fechar (`acervo_rede.txt`).

Duas armadilhas de execução do mesmo dia: (1) keyword de 4 palavras já gasta os
2 trigramas repetidos que o `val2.py` tolera, então nenhum outro trigrama pode
passar de 2 ocorrências; (2) no srv1166087 o `rebuild_site.js` falhou com EACCES
porque `public/` do diariodegoiania tinha arquivos de root (07/09), resolvido
com `chown -R portais:portais`. Ver [[feedback_pauta_por_oportunidade_gsc]].
