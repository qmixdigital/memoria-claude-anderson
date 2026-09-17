---
name: glm-zai-claude-code
description: "Setup do Claude Code apontando para a API GLM da Z.ai — como ligar por projeto, comando claude-glm e mapeamento de modelos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 32b2b274-c61a-4a6c-a7e7-cc8729eb070f
  modified: 2026-08-09T00:31:08.031Z
---

Guilherme usa a API GLM da Z.ai no Claude Code para economizar cota Anthropic. Configurado em 2026-08-04.

Regra de uso na QMIX: GLM para rascunho, código novo, migrações, refactor e tarefas repetitivas. Claude (assinatura Anthropic) para review final, auditoria de segurança, arquitetura e qualquer coisa com screenshot/UI. Nada de dado sensível de cliente no GLM (servidor na China).

**Como está montado:**
- Chave na variável de usuário do Windows `ZAI_API_KEY` (nunca em arquivo de settings — Settings Sync do VS Code sincronizaria).
- `claude-glm` definido em `C:\Users\User\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`.
- Perfil de terminal "Claude GLM" em `%APPDATA%\Code\User\settings.json`.
- Para ligar GLM num projeto específico (faz o próprio botão do Claude no VS Code usar GLM naquela pasta): `.claude/settings.local.json` com `env.ANTHROPIC_BASE_URL` = `https://api.z.ai/api/anthropic` e `env.ANTHROPIC_AUTH_TOKEN` = chave literal. Precisa entrar no `.gitignore` — o `env` do settings.json não expande variável.

**Fatos verificados por curl no endpoint:**
- Auth é `Authorization: Bearer <chave>`, header `anthropic-version: 2023-06-01`.
- Endpoint correto é `/api/anthropic`. O `/api/coding/paas/v4` é formato OpenAI e quebra o Claude Code.
- Mapeamento padrão: se o Claude Code pede um nome de modelo Claude, a Z.ai entrega `glm-4.7` (tier opus/sonnet) ou `glm-4.5-air` (tier haiku). Para usar o **GLM-5.2 é obrigatório fixar** `ANTHROPIC_MODEL=glm-5.2` — já está no `claude-glm`, junto com `ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air`.
- Modelos válidos verificados: `glm-5.2`, `glm-5`, `glm-4.7`, `glm-4.6`, `glm-4.5-air`. Nome inválido retorna erro `1214 modelCode does not exist` — é assim que se testa se um modelo existe na conta.
- O modelo mente sobre a própria identidade (o glm-5.2 se disse "Gemini 1.5 Flash"). Nunca use a auto-descrição como prova; use o campo `modelUsage` do `claude -p --output-format json`.
- A UI mostra nome de modelo Claude mesmo respondendo GLM — é esperado, não é bug.
