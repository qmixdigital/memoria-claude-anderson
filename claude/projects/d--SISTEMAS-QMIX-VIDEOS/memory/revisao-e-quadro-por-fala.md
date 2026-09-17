---
name: revisao-e-quadro-por-fala
description: "Vídeo não se revisa por amostra; um quadro por fala, com a fala escrita embaixo, antes de dizer que está pronto"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T11:22:55.934Z
---

**Antes de declarar um vídeo pronto, gerar a folha de contato e ler TODOS os
quadros, um por fala.** `python tools/folha_contato.py <projeto>`.

No vídeo 05 eu conferi quatro quadros de 22.992 e chamei aquilo de QA. O
Anderson assistiu e achou, de primeira, casa europeia na abertura, texto do
Henry Ford reaparecendo onde não devia, motor sem relação com o tópico e texto
estourando fora da tela. Disse: "Tem que revisar o vídeo todo."

Quando eu finalmente li os 103 quadros, apareceram **dez** defeitos visíveis e
**dois** que ninguém veria nunca, porque eram de coisa que não aparecia.

**Why:** o defeito quase sempre é de **casamento**, não de peça: a imagem certa
no momento errado, ou o texto certo sobre a imagem errada. Isso não aparece num
quadro solto, só aparece na sequência com a fala do lado. Amostragem acha peça
feia; ela não acha casamento errado.

**How to apply:**

1. Antes do render completo, tirar os quadros só das falas que mudaram, com
   `node scripts/frames.mjs <Comp> <f1,f2,...> --scale=0.28`. Sai em segundos
   e evita queimar 25 minutos de render num plano errado.
2. Depois do render definitivo, gerar a folha inteira e ler de cima a baixo.
3. Ler perguntando três coisas em cada quadro: a imagem é do assunto da fala?
   o texto no ar é o desta fala ou sobrou da anterior? dá para ver a foto
   debaixo do scrim?
4. Só então montar a entrega.

Ler 103 quadros custa menos que uma rodada de correção depois de ele assistir.

Relacionado: [[defeito-silencioso-conferir-artefato]],
[[grupo-precisa-de-saida-escrita]], [[imagem-casa-com-a-fala]].
