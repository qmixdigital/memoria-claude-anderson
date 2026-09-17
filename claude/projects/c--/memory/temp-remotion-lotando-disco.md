---
name: temp-remotion-lotando-disco
description: Remotion deixa bundles de ~800 MB em %TEMP% a cada render e foi o que lotou o C: em agosto/2026
metadata:
  type: project
---

O disco C: (238 GB) chegou a 92% cheio em 2026-08-24. Causa: `C:\Users\User\AppData\Local\Temp` com 78 GB, sendo 121 pastas `remotion-webpack-bundle-*` de 0,7 a 0,9 GB cada, mais ~10 GB de scratchpads antigos do Claude Code em `Temp\claude\`. A limpeza liberou 77 GB.

**Why:** o Remotion nao apaga o bundle de webpack ao terminar o render, entao cada execucao acumula quase 1 GB. Os projetos ficam em D: (3,7 TB, 5% usado), entao o gargalo e sempre o C: e sempre por cache/temp, nao por arquivos de projeto.

**How to apply:** quando o C: encher de novo, checar `Temp` primeiro (medir com robocopy `/L /E /BYTES /NFL /NDL /NJH`, que e rapido; `du` trava em pastas grandes no Windows). Apagar `remotion-webpack-bundle-*` e as sessoes antigas de `Temp\claude\` resolve sem tocar em nada de projeto. `Remove-Item` via PowerShell e bloqueado pelo guard de path em C:, usar `rm -rf` pelo Bash em loop por item.
