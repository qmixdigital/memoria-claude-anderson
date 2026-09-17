---
name: vertical-conteudo-acima-da-legenda
description: No formato vertical o conteúdo termina em y≈1240 e começa em y≈330; a legenda grande e o título de duas linhas comem o resto
metadata:
  type: project
---

**Medido no qmix-24 (15/09/2026), primeiro vídeo produzido nos dois formatos
a partir da mesma cena.** No vertical (1080x1920) a legenda do `formato.tsx` é
um letreiro de 56px centrado em y=1340, e o título da cena (46px) quebra em
duas linhas com facilidade. Consequência: **toda peça precisa caber entre
y=330 e y=1240.** Fora disso ela fica embaixo da legenda ou debaixo do título.

No primeiro QA a foto do médico, o número 88%, o rótulo dos portais e a linha
dos pacotes estavam todos debaixo da legenda, e "fontes citam" estava cortado
pela janela de chat que começava em 250.

**A composição dos dois formatos sai de UM arquivo de cena** com uma tabela de
geometria por formato (`H_LAYOUT` / `V_LAYOUT`) e dois arquivos mínimos com o
`compositionConfig`. Locução, tempos e peças são os mesmos; só a posição muda.
Nada de letterbox.

**Armadilha de pintura do CSS, vista no fecho:** um filho `position: absolute`
pinta **por cima** dos irmãos estáticos, mesmo declarado antes. O véu escuro
da cartela final apagou o próprio texto. Véu e conteúdo têm de ser irmãos,
os dois absolutos, véu primeiro.

**Why:** a mesma cena servindo as duas telas é o que torna a versão vertical
barata; mas o vertical tem dois limites que o horizontal não tem, e eles só
aparecem olhando o quadro.

**How to apply:** ao desenhar `V_LAYOUT`, some as alturas e confira que a
última peça termina antes de 1240. QA sempre nos dois formatos, nunca só no
horizontal. Ver [[revisao-e-quadro-por-fala]].
