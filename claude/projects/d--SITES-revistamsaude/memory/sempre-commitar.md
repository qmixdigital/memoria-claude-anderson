---
name: sempre-commitar
description: Autorização permanente para commitar e dar push sem perguntar — nunca pedir confirmação de commit
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7df468e7-687e-4601-a16f-031faa972e2e
  modified: 2026-08-11T19:52:32.121Z
---

**Nunca perguntar se deve commitar.** O Anderson deu autorização permanente (ago/2026): toda alteração de código deve terminar em `git commit` + `git push`, sem confirmação.

**Why:** alteração feita e não commitada não serve para nada — o deploy da VPS é por `tar+base64` e não passa pelo GitHub, então código sem commit deixa o repositório atrasado em relação à produção silenciosamente. Perguntar "quer que eu commite?" só gasta o tempo dele para chegar sempre na mesma resposta.

**How to apply:** ao terminar qualquer edição de arquivo do projeto, commitar direto na `master` (é o fluxo dele — não criar branch nem PR, ver [[deploy-workflow]]) e dar push. Mensagem no padrão `tipo(escopo): descrição` em português sem acento, como nos commits existentes. Vale para este projeto e é a preferência geral dele em todos os sites.
