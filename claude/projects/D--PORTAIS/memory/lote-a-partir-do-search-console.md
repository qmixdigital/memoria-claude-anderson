---
name: lote-a-partir-do-search-console
description: "Quando um portal tem impressão no Console, checar se a página que ranqueia é um texto raso: expandir vale mais que criar do zero"
metadata:
  type: feedback
---

Antes de partir para a pasta de palavras-chave, olhe **qual página** do portal
tem impressão no Search Console e **quantas palavras ela tem**. Vários portais da
rede têm textos migrados de 60 a 100 palavras, sem heading e às vezes com link
interno quebrado, e são justamente eles que aparecem em posição 80 a 100.

**Por quê:** essa página já tem histórico e já foi julgada relevante pelo Google
para aquela intenção. Expandi-la para 1.000+ palavras e transformá-la em pilar de
um cluster novo aproveita esse histórico, e custa menos que ranquear uma URL nova
do zero. Criar um pilar novo ao lado dela ainda faria as duas competirem entre si.

**Como aplicar:** puxe `dimensions: ["page"]` no Console, ordene por impressão,
abra o JSON da página em `/srv/portais/<portal>/data/<slug>.json` e conte as
palavras. Se for texto raso, reescreva mantendo **o mesmo slug** e as duas frases
de abertura originais, acrescente os links para os 10 clusters novos e corrija o
`dek`, que nesses casos costuma ter menos de 100 caracteres e reprova na auditoria.

Aconteceu em 18/08/2026 no **todossomosgeek**: `adaptacoes-de-anime-para-live-action-que-valeram-a-pena`
tinha 61 palavras, nenhum heading, um link em URL plana num portal com prefixo de
categoria (404) e 23 impressões em seis variações de "live action de anime". Virou
pilar de 1.076 palavras. Ver [[registro-de-lotes-por-portal]] e [[padrao-de-crosslinking-do-lote]].

**Cuidado ao conferir originalidade depois:** se você coletar o baseline dos
servidores **após** publicar, seus próprios artigos entram nele e a sobreposição
sai em 100%. Colete antes, ou filtre os slugs do lote fora do baseline.
