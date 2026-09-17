---
name: cliente-video-institucional
description: Terceira faixa do repo, vídeos institucionais de cliente, com kit e voz próprios; a primeira foi a Sunray Energia Solar
metadata:
  type: project
---

**Aberta em 02/09/2026** com a Sunray Energia Solar (energiaeficiente.com.br),
peça doada e usada como vitrine para outros clientes da QMIX Digital.

Faixa nova em `clientes/<nome>/`, separada dos shorts da QMIX e do Radar Volt.
Cada cliente ganha kit visual próprio em `remotion/src/lib/<cliente>.tsx`: a
paleta e a tipografia saem do **site em produção do cliente**, conferidas contra
os pixels do logo. No caso da Sunray, azul `#1072ba` e ouro `#ddba29`, Archivo e
Inter.

**A voz é do projeto, nunca a do canal.** A do Radar Volt (Nassif News Anchor)
fica fora por identidade. Para a Sunray ele ouviu quatro femininas da biblioteca
compartilhada e quatro masculinas da conta, e escolheu **Alexandre Nickel**
(`JGrKwJhTJ9YJzxOEcNnU`). A conta não tem nenhuma voz feminina PT-BR própria: as
femininas brasileiras vêm da biblioteca do ElevenLabs e precisam ser adicionadas
antes. Ver [[voz-do-projeto-nao-e-a-do-env]].

**Institucional de cliente LEVA CTA**, ao contrário da regra da fábrica QMIX:
telefone e site na cartela final.

**Ele corta detalhe.** O argumento mais forte do site da Sunray (82% de economia
real contra os 95% que o mercado anuncia) estava no roteiro e ele mandou tirar:
*"não quero isso no vídeo, quero um vídeo institucional sem muitos detalhes"*.
Sobraram três números que não abrem discussão: ano de fundação, garantia do
fabricante e registro no CREA.

**Why:** institucional apresenta a empresa; comparação de número é outro tipo de
peça e ele não quer a marca do cliente dentro de uma disputa.

**How to apply:** roteiro de 6 blocos e ~105 palavras fecha em 54 s. O material
de imagem vem do Envato dele, e a peneira é [[imagem-casa-com-a-fala]]. O resto
do pipeline é o mesmo do Radar Volt (gen_voice, retimar, render, montar_audio),
com [[defeito-silencioso-conferir-artefato]] valendo em cada passo.
