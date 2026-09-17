---
name: iptv-legitimo-no-wtw19
description: IPTV é proposital no wtw19 e deve ser mantido; em todos os outros portais é enxerto de afiliado e sai
metadata:
  type: project
---

🔴 **REVOGADO EM 07/09/2026.** O Anderson apontou a editoria de IPTV na home do
wtw19 e mandou tratar como nos outros. O IPTV do wtw19 agora também sai da home
e do menu, por `hideCategories: ["iptv"]` mais 3 slugs avulsos. Ver
[[ocultar-categoria-e-hidecategories]].

O que **continua valendo**: no wtw19 o conteúdo de IPTV é próprio, escrito para
o portal, e por isso **não se apaga** — some da home e do menu, mas os 30
artigos e a editoria seguem no ar em 200, ao contrário dos outros portais, onde
IPTV é enxerto de afiliado e sai de vez.

Regra geral, que era o texto original desta memória: em **todos os outros
portais da rede**, IPTV sai.

Como ele aparece nos outros: não é matéria sobre IPTV, é **uma frase de afiliado
grafada no meio de matéria legítima** de cinema, série ou notícia, sempre com
link. Por exemplo, no meio de um texto sobre um filme:

> "Se quiser checar a estabilidade do seu sinal, faça um teste de IPTV
> automático. Isso ajuda a evitar travamentos no meio do filme."

Por isso o tratamento tem duas saídas, e as duas valem: **extirpa a frase** e o
artigo fica, quando o artigo tem valor próprio; **apaga o artigo**, com 410,
quando ele é sobre IPTV do título ao slug.

Dois lugares que a varredura por artigo não pega e que mantêm a palavra viva:

- a **editoria** chamada "Teste IPTV" ou "iptv", que fica no menu de todas as
  páginas mesmo depois de os artigos saírem. O menu é montado a partir da
  categoria dos artigos, não do `categoryMap`.
- a **descrição do portal** no `sites.json`, que entra na meta description de
  todas as páginas.

Ver [[iptv-tres-vetores]] e [[poda-iptv-no-destino]].
