---
name: redesign-direto-sem-design-fable
description: "Em pedido de redesign com /frontend-design, fazer direto no código, sem acionar o fluxo design-fable (subagentes, mockup, aprovação por print)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0e10bacf-0a83-40f1-947b-be6a31442b34
  modified: 2026-10-03T11:36:33.125Z
---

Em 03/10/2026, no comprar-backlinks.store, o usuário pediu um redesign com `/frontend-design`. Eu carreguei também a skill `design-fable` por conta própria; ele interrompeu e escreveu: "Faça um design direto, sem ter que acionar o design fable, que gasta muito tokens e demora demais. Faça você mesmo direto, que eu confio no seu trabalho."

**Why:** o fluxo do design-fable (gerar em subagente, mockup, revisor, aprovação por screenshot) custa tokens e tempo que ele não quer pagar quando pediu só `/frontend-design`.

**How to apply:** quando ele pedir redesign citando `/frontend-design`, implementar direto no projeto, conferir por screenshot eu mesmo e publicar. Só usar o `design-fable` se ele chamar essa skill pelo nome. (Interpretação minha: vale para pedidos de redesign em geral, não só deste site.)

Relacionado: [[gosto-visual-claro-e-tecnico]]
