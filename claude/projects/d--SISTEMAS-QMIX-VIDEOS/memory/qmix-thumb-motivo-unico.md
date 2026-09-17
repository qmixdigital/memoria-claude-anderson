---
name: qmix-thumb-motivo-unico
description: Cada video QMIX precisa de um motivo de thumbnail proprio; so o chassi se repete
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-03T15:52:35.669Z
---

Na thumbnail dos videos da QMIX, o que se repete de peca para peca e apenas o **chassi**:
fundo escuro, coluna de texto a esquerda, logo no topo direito, barra neon no rodape. O
**motivo** (o desenho da direita) tem de ser proprio de cada video.

**Why:** o Anderson reclamou duas vezes de capa repetida. Na segunda (03/08/2026) o motivo
`ranking` estava em quatro videos seguidos, e na grade do canal viravam pecas identicas com
o texto trocado. Ele quer thumbnails padronizadas para o perfil da empresa ser reconhecivel,
mas padronizado significa mesmo chassi, nao mesma arte.

**How to apply:** video novo, motivo novo no catalogo `MOTIVOS` de
`remotion/src/lib/thumb.tsx`. O motivo deve sair da ideia daquele video especifico. O
`tools/entrega.py` agora recusa a entrega quando o motivo ja esta em uso por outro slug,
lendo os `thumb.json` de `demandas qmix/`. Um fundo gerado na Runware (~US$ 0,0013) por cima
ajuda a diferenciar, mas nao substitui o motivo proprio.

Relacionado: [[qmix-marca-completa]]
