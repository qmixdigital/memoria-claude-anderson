---
name: heredoc-escapes-quebram
description: "Neste harness, Python via heredoc do Bash corrompe strings com \\n literal e apóstrofos; editar geradores com Edit/Write"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9f625e33-a68c-489f-959d-2a2042c2a2d5
  modified: 2026-09-10T15:18:38.161Z
---

Python passado por heredoc (`python - <<'PY'`) chega com `\\n` virando quebra de linha real, então `s.replace("...\\n...")` nunca casa e o script falha com AssertionError 0 (ou pior, grava pela metade, como o `indent=2` que reformatou o posts.json inteiro).

**Why:** Aconteceu de novo em 10/09/2026 ao editar `build-blog.py` e `build-cardapios.py`, que têm templates HTML com `\n` dentro de strings. Cada tentativa custou uma rodada de diagnóstico.

**How to apply:** Para qualquer edição em `tools/build-*.py` (ou qualquer arquivo com `\n`, `\t`, apóstrofo ou `$` na string alvo), usar a ferramenta Edit ou Write direto. Heredoc só para scripts curtos sem escapes. Mensagens de commit sempre por `-F arquivo`. O `posts.json` é uma linha só, compacto: gravar com `json.dump(..., ensure_ascii=False)` sem indent.
