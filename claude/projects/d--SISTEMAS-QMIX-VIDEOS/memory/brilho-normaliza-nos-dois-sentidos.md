---
name: brilho-normaliza-nos-dois-sentidos
description: "O scrim só funciona numa faixa de luminância; foto escura sobe e foto clara desce, antes de entrar no vídeo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T14:24:02.464Z
---

**A foto entra no vídeo normalizada por gama nos DOIS sentidos, antes do
scrim.** Escura sobe até luma 100, clara desce até 125, com teto de 1,6 e piso
de 0,75.

Descoberto em duas metades, e essa é a lição:

- **Vídeo 05**: a Cúpula da Alba tinha luma 60 e sob o scrim virava breu. Eu
  tratei só isso, levantando foto escura, e achei que o problema estava
  resolvido.
- **Vídeo 06**: as fotos do ônibus amarelo estão em luma 162 e o navio-tanque
  em 175. Sob o mesmo scrim elas continuavam claras, o título branco brigava
  com a lataria e o texto pintado no ônibus atravessava as letras.

**Why:** os valores de scrim de cada bloco foram calibrados contra uma faixa de
luminância. Fora dessa faixa, para qualquer lado, o scrim erra. A correção
errada é mexer no scrim bloco a bloco até parar de doer; a certa é igualar a
ENTRADA e deixar o scrim uniforme.

**How to apply:** o `montar_planos.py` já faz e imprime o que normalizou. Dois
cuidados que custaram tentativa:

- o teto do lado claro é mais frouxo (125, e não 100) de propósito: gama forte
  demais em foto clara lava a cor, e a lataria amarela é metade da identidade
  do vídeo do ônibus
- a marca `.src` precisa guardar origem **E** tratamento. Só a origem faz a
  mudança de gama ser pulada em silêncio, que foi como duas curadorias
  inteiras não chegaram à tela no vídeo 05

Limitação conhecida: luma média não pega foto com céu claro e assunto escuro.
Se aparecer, medir percentil em vez de média.

Relacionado: [[defeito-silencioso-conferir-artefato]], [[imagem-casa-com-a-fala]].
