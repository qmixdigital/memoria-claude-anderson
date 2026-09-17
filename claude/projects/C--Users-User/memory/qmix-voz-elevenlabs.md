---
name: qmix-voz-elevenlabs
description: "Voz PT-BR oficial da QMIX no ElevenLabs (locutor, voice ID, modelo e parâmetros)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 75534bf0-7c0e-4e2d-9ec9-1b391ecce73e
  modified: 2026-08-06T11:40:32.515Z
---

A voz de locutor da QMIX é **Alexandre Nickel**, voice ID `JGrKwJhTJ9YJzxOEcNnU` — PT-BR com sotaque brasileiro, aprovada pelo Anderson.

- Provedor: ElevenLabs, modelo `eleven_multilingual_v2` (nunca modelo mono-idioma em inglês)
- Parâmetros usados na casa: `stability 0.5`, `similarity_boost 0.75`, `style 0.3`
- Saída: `mp3_44100_128`
- Chave: `ELEVENLABS_API_KEY` em `d:\SISTEMAS\QMIX-VIDEOS\.env`
- Ferramenta de referência: `d:\SISTEMAS\QMIX-VIDEOS\tools\gen_voice.py` (é orientada a `beats.json`, formato de shorts)
- Doc: `LOCALIZACAO-PTBR.md` seção 5

**Nunca** usar `TX3LPaxmHKxFdv7VOQHJ` ("Liam", locutor em inglês) — é a voz padrão do repo original e não serve para conteúdo QMIX.

A mesma pasta tem `RUNWARE_API_KEY` (imagens) e `GEMINI_API_KEY`. Credenciais da Cloudflare ficam em [[cloudflare-toolkit-local]].
