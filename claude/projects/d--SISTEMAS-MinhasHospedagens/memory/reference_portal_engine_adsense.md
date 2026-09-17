---
name: reference_portal_engine_adsense
description: "portal-engine ganhou suporte a AdSense e ads.txt por site (campo \"adsense\" no sites.json); há um terceiro engine em clinicas-vps"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-18T00:08:44.690Z
---

Desde 17/08/2026 o portal-engine emite AdSense por site: basta `"adsense":
"ca-pub-XXXX"` no objeto do site em `sites.json`. O `render.js` normaliza as duas
formas do id (`buildHead` gera meta `google-adsense-account` + loader com
`client=ca-pub-`, e junto do robots.txt grava `ads.txt` com `pub-` sem prefixo).
Backup do patch: `render.js.bak-adsense-20260817`. Depois de mexer: rodar
`rebuildIndexes` do site (reescreve TODAS as páginas, não só os índices),
`systemctl restart portal-engine` e purgar a zona no Cloudflare.

**Why:** o motor não tinha nada de anúncio, e a pegadinha do `ca-pub-` vs `pub-`
([[reference_next_engine_adsense_adstxt]]) faria o loader carregar sem servir
anúncio nenhum.

**How to apply:** primeiro site ligado foi barranews.com.br. ATENÇÃO: existe um
TERCEIRO portal-engine, em **clinicas-vps** (`/opt/portal-engine`, 34 sites em
`/srv/portais`), além dos de opengravity e srv1166087 — barranews está lá, não
nos outros dois ([[reference_portal_engine_opengravity_wtw19]]). Instalar só nos
domínios autorizados ([[feedback_adsense_somente_lista_autorizada]]). Falta no
motor: Consent Mode v2 antes das tags do Google (só existe o banner LGPD).
