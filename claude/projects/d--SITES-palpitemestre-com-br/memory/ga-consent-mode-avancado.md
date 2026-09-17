---
name: ga-consent-mode-avancado
description: "GA4 dos sites de palpites usa Consent Mode AVANÇADO (coleta de todo visitante), não o lazy-após-consentimento padrão"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5b96686e-b85c-460a-b9b6-3fdfaec3533d
  modified: 2026-08-06T17:59:21.370Z
---

Nos sites de palpites (palpitemestre.com.br → GA `G-28V7698DFK`; ptdf.com.br → GA `G-T51L9LBZ6H`), o `Analytics.tsx` usa **Consent Mode v2 avançado**: o `gtag.js` carrega SEMPRE (via `setTimeout` ~1s ou primeira interação, o que vier antes), independente do banner de cookies. Antes do "Aceitar todos", o consent-default do layout está `denied` → GA manda *cookieless pings* (anônimos, sem cookie) que o Google modela; após aceite, o CookieConsent chama `gtag('consent','update','granted')` e vira coleta completa.

**Why:** o dono precisa provar ao programa de afiliado (BYTX) que envia visitantes; a coleta lazy-só-após-consentimento do padrão global (CLAUDE.md) perdia 40-70% dos dados. Ele foi explícito: "não importa como, eu preciso receber os dados". Isso sobrepõe a regra padrão de GA lazy-após-interação.

**How to apply:** NÃO reverter o `Analytics.tsx` desses sites para o modo consent-gated. O loader deve continuar carregando o gtag sem exigir consentimento. Detalhe técnico: usar o `window.gtag` global do layout (empurra `arguments`); um `gtag` local que empurra array quebra o `config`. Ver [[palpitemestre-deploy]] para build+reload zero-downtime.
