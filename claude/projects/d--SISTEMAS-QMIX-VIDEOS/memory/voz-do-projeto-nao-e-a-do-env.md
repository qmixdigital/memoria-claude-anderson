---
name: voz-do-projeto-nao-e-a-do-env
description: O .env guarda a voz da QMIX Digital; o Radar Volt tem outra, e usar a errada regrava o vídeo inteiro em silêncio
metadata:
  node_type: memory
  type: project
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-23T11:37:36.760Z
---

O `.env` do repositório guarda **uma** voz da ElevenLabs, e ela é a da QMIX
Digital. O Radar Volt grava com outra. A voz que de fato gravou cada projeto
está no campo `voiceStatus` do `beats.json` daquele vídeo.

O cache de clipes é por `sha1(voz | modelo | texto)`. Usar a voz errada erra
**todos** os hashes de uma vez: nenhum clipe é achado, a API é chamada para as
67 linhas, e o vídeo volta com **outro locutor** e mais longo. Sem erro, sem
aviso, código de saída zero.

**Why:** aconteceu em 23/08/2026, reabrindo o vídeo 03 só para trocar duas
pronúncias. O `retimar.py` já lia o `voiceStatus`; o `gen_voice.py` não. Duas
ferramentas descobrindo a mesma coisa de jeitos diferentes, o mesmo defeito que
criou o `tools/pronuncia.py`.

**How to apply:** já está corrigido no `gen_voice.py`, que agora lê o
`voiceStatus` antes do `.env` e avisa na tela quando os dois discordam. O teste
de dois segundos, se desconfiar que regravou tudo:

    ls --time-style=+%H:%M -la voice/*-orig.mp3 | awk '{print $6}' | sort | uniq -c

67 clipes com a hora de agora = a API foi chamada para todos = a voz mudou.
Detalhes em `radar-volt/SOM.md`. Relacionado:
[[pronuncia-decidida-de-ouvido]], [[radar-volt-canal]].
