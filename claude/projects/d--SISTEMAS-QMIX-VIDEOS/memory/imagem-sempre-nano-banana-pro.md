---
name: imagem-sempre-nano-banana-pro
description: "Toda imagem gerada por IA usa o Nano Banana Pro do Google (google:4@2), sem escolher modelo por assunto nem por custo"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-08-29T13:00:06.579Z
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
---

**Sempre que precisar gerar imagem, o modelo é o Nano Banana Pro do Google**,
`google:4@2` via Runware, US$ 0,138 por imagem. Ordem dele em 29/08/2026, com
essas palavras: "memorizar para sempre que precisar gerar imagens usar o Nano
Banana Pro do Google".

Isso **substitui** a regra antiga de escolher o modelo por assunto (Nano só
para pessoa, FLUX para objeto e lugar). Não pergunte, não pese custo, não
proponha o mais barato.

**Why:** a regra antiga mandava usar FLUX justamente para "objeto, lugar,
textura", e foi aí que ela falhou. No vídeo 08 do Radar Volt, onze prompts sem
pessoa nenhuma, comparados lado a lado: o FLUX entregou **cilindros azuis
parecendo botijão de gás** no lugar de células de bateria, e um **toroide de
transformador** no lugar de um estator de motor elétrico. Objeto técnico tem
anatomia como pessoa tem, e o modelo barato erra a anatomia do objeto do mesmo
jeito que erra a do corpo. Num canal que se vende por precisão técnica, isso é
o defeito mais caro que existe.

A conta que encerra a discussão: cinquenta vezes mais caro, num lote de dez
imagens, dá um dólar e trinta. Um render refeito custa vinte e cinco minutos.

**How to apply:** `python tools/gen_image.py --prompt "..." --aspect 16:9
--size 2K --out x.webp` já sai no Nano Banana Pro, porque o padrão do script
foi trocado. FLUX só para rascunho descartável que não vai ao ar.

Duas armadilhas do modelo premium, as duas silenciosas e já resolvidas no
`gen_image.py`: ele **não aceita `steps`** (devolve
`unsupportedArchitectureSteps` em JSON com HTTP 200), e a resposta em
**base64 chega truncada** acima de ~2,5 megapixels, o que parece erro de rede e
é só tamanho; ali se pede `outputType: "URL"` e baixa depois. As dimensões são
uma lista fechada: 16:9 é `2752x1536`, e a própria API lista as aceitas dentro
da mensagem de erro. Ver [[defeito-silencioso-conferir-artefato]].

**O prompt importa tanto quanto o modelo.** `candid documentary photograph`
serve para cena com gente e lugar, e estraga objeto e infraestrutura: puxa para
o sujo e o improvisado. No vídeo 08 devolveu canos jogados na terra sob o texto
"carregador Flash, 1,5 megawatt", e ele reprovou com "muito feio, sujo, mal
feito" — sendo que a imagem já era Nano Banana Pro. Para objeto técnico peça
`product photography`, `press kit`, `pristine`, `orderly`, `clean lighting`.

E olhe a imagem **dentro do vídeo**, com escurecedor e texto por cima, não
sozinha no visualizador: foi só assim que ficou óbvio, e quem viu primeiro foi
ele.

Continua valendo: conferir a imagem com os olhos antes de usar, sempre. Duas
das minhas foram descartadas na conferência do vídeo 08 (uma "linha de
montagem" que veio com motores a combustão). Ver [[foto-ampliada-nao-e-ilustracao]].
