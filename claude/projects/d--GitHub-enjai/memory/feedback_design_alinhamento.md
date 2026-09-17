---
name: Design — alinhamento de texto (não centralizar)
description: Hero e seções principais devem ter texto alinhado à esquerda em desktop E mobile. Centralização gera sensação de desorganização
type: feedback
originSessionId: 068f5f9b-9c1e-4381-9736-c4a7e1db844b
---
Em layouts de hero, CTA banners e seções principais, **alinhar todo o conteúdo à esquerda** (desktop e mobile). Não misturar texto centralizado com alinhado à esquerda — isso gera sensação de desorganização visual.

**Why:** O usuário relatou que textos centralizados misturados com elementos alinhados à esquerda passam "sensação de site extremamente desorganizado". Ele prefere consistência absoluta — tudo à esquerda — mesmo no mobile.

**How to apply:**
- **Hero**: `h1`, parágrafo, badge e CTAs todos encostados à esquerda (sem `text-center`, sem `mx-auto`, sem `justify-center`)
- **CTA banners secundários**: conteúdo à esquerda + CTA à direita (split) em vez de tudo centralizado
- **Seções (Como Funciona, Afiliados, FAQ)**: H2 + parágrafo à esquerda
- **Cards pequenos** (step cards, feature cards): mesmo nestes casos, preferir esquerda — centralizar só quando o card tem ícone grande no topo
- **NUNCA**: `text-center lg:text-left` (mobile centralizado, desktop esquerda) — mantém esquerda em ambos

**Exceção:** landing pages que já estavam no padrão anterior (ENJAI seguia o CLAUDE.md global com hero esquerda / h2 centralizado). Pro SkiPark: tudo à esquerda uniformemente.
