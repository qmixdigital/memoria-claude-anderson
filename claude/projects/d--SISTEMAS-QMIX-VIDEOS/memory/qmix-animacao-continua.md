---
name: qmix-animacao-continua
description: O Anderson exige animação contínua nos blocos explicativos; cartão parado por mais de 3s é defeito
metadata:
  type: feedback
---

Nos vídeos da série, **bloco explicativo não pode ter cartão estático parado em tela
enquanto a narração corre**. Cada conceito ganha cena animada, com elementos entrando no
segundo exato em que a palavra é dita, e pelo menos um elemento que nunca para: contador
girando, busca sendo digitada com cursor piscando, barra enchendo, seta se desenhando,
figura andando, engrenagem, poeira caindo, agulha de radar. Transição entre cenas também
animada, nunca corte para tela parada.

**Why:** ele escreveu isso como diretriz permanente no briefing do qmix-19, reforçando um
pedido anterior. A sensação que ele quer é de demonstração ao vivo, não de slide.

**How to apply:** no QA frame a frame, procurar ativamente trechos de mais de 3 segundos
com tela estática durante explicação, e tratar cada um como defeito. No qmix-19 esse
critério achou quatro, todos reais. O teto continua sendo o `brand.md`: no máximo dois
elementos em movimento em destaque ao mesmo tempo, easing calmo, sem bounce. Ver
[[qmix-serie-backlinks]].
