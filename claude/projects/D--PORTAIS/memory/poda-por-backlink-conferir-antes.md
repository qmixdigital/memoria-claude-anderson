---
name: poda-por-backlink-conferir-antes
description: "A poda por backlink apaga demais quando cruza com as ordens de apagar filme, IPTV e autor; e o WordPress de origem serve de prova"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T23:14:57.582Z
---

Na conversão do barranews o Anderson desconfiou que eu tinha invertido a regra e
apagado justamente o que tinha link externo. **Não tinha**, e dá para provar em
minutos: comparar uma amostra dos slugs mantidos e dos apagados contra o
`post_content` do WordPress de origem, que continua no ar depois da migração.
Deu 60/60 dos mantidos com link externo, contra 10/60 dos apagados.

**Why:** a poda no barranews apagou 1.811 de 1.946 artigos. Um corte desse
tamanho parece erro mesmo quando está certo, então a conferência não é opcional,
é o que transforma discussão em fato. E o WordPress de origem é a testemunha:
enquanto ele existir, todo artigo apagado pode ser recuperado com conteúdo,
imagem e categoria.

**How to apply:** ao terminar qualquer poda, rodar a checagem dos dois lados e
guardar o número. E lembrar que **as ordens se sobrepõem**: apagar filme, apagar
IPTV e apagar um autor derrubam artigos que tinham backlink legítimo. Foram 40 no
barranews, e 3 deles eram engano de verdade, apagados sem se encaixar em nenhuma
ordem. Antes de apagar por tema, separar os que têm link externo para site real
(Instagram, Facebook, YouTube e Wikipédia não contam) e decidir um a um.

Relacionado: [[conversao-total]], [[poda-iptv-no-destino]],
[[documentar-migracoes-nas-hospedagens]]
