---
name: cama-pedir-sem-final
description: "Ao gerar música de fundo, exigir no prompt que ela não tenha final; isso quadruplica o platô útil e quase elimina emendas"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T14:23:05.571Z
---

**Todo prompt de cama de música precisa dizer, explicitamente, que a peça não
pode ter final.** A frase que funcionou, em 24/08/2026:

> Absolutely no ending: do not fade out, do not resolve, do not slow down at
> the end. The last bar must sound exactly like the middle, as if the piece
> could keep going forever, so it can be looped seamlessly under a long
> narration.

**Medido, nas cinco camas novas do Radar Volt contra as antigas:**

| clipe | platô útil |
|---|---|
| volt-drive (com a frase) | **97%** do arquivo |
| volt-circuit (com a frase) | 97% |
| volt-tensao (com a frase) | 75% |
| cinematic-min (sem a frase) | 49% |
| tech-pulse (sem a frase) | 84% |

Para cinco minutos de cama, o `volt-drive` precisa de **1 emenda**; o
`cinematic-min` precisa de **11**.

**Why:** o modelo de música entrega uma PEÇA por padrão, com introdução e
final, porque é assim que música existe. Cama de vídeo não é peça, é textura:
ela precisa poder ser cortada em qualquer ponto. Sem a instrução, seis a oito
segundos de cada clipe são despedida inutilizável, e o `cama.py` tem de
descartar isso e emendar mais vezes.

**How to apply:** gerar em **120 segundos**, não 63. Depois de gerar, medir com
`corpo_util` do `tools/cama.py` antes de aceitar: platô abaixo de 70% significa
que a instrução não pegou e vale regerar. E declarar o custo antes: cinco camas
de 120s são 600 segundos de música na ElevenLabs.

Relacionado: [[cama-nao-se-repete-com-stream-loop]],
[[defeito-silencioso-conferir-artefato]].
