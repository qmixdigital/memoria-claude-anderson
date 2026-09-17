---
name: Nunca centralizar texto no mobile
description: Usuário detesta texto centralizado em qualquer breakpoint - regra forte que se aplica a hero, footer, listas, parágrafos, CTAs
type: feedback
---

Nunca centralizar texto (hero, footer, parágrafos, listas, CTAs, stats) em nenhum breakpoint, incluindo mobile. Mesmo elementos que normalmente seriam centralizados em mobile devem ficar à esquerda.

**Why:** O usuário associa fortemente texto centralizado com "sites americanos feitos de qualquer jeito" — passa imagem de desorganização e amadorismo. Já está documentado no CLAUDE.md global, mas é ponto sensível e foi necessário corrigir manualmente após implementação.

**How to apply:** Em qualquer hero/seção/footer, definir `text-align: left` mesmo no mobile. CTAs com `justify-content: flex-start`. A única exceção segundo o CLAUDE.md são títulos de seção (h2) e texto dentro de cards pequenos.
