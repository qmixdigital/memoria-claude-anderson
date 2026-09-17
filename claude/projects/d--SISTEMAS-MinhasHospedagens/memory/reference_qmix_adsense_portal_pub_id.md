---
name: reference-qmix-adsense-portal-pub-id
description: "Portais QMIX com AdSense \"inativo\" — placeholder ca-pub-PORTAL_PUB_ID não substituído OU sem loader; fix universal com ID real 3880875536722698"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

Vários portais da rede QMIX recebem aviso do AdSense **"Seu site precisa passar por outra revisão / está inativo"**. Causa raiz: o **código do AdSense não está ativo** no site. Pub ID real da rede: **`ca-pub-3880875536722698`** (ads.txt: `google.com, pub-3880875536722698, DIRECT, f08c47fec0942fa0`).

**3 cenários encontrados (2026-06-24):**
1. Tema wp-news-frontpage com `ca-pub-PORTAL_PUB_ID` (placeholder) **não substituído** no deploy, mas com loader no functions.php (ex.: revistarumo). Fix: `sed PORTAL_PUB_ID→3880875536722698` nos .php do tema.
2. Idem, mas **sem o loader** no tema (ex.: folhadonoroeste, tema folha-magazine-fn). Fix: trocar placeholder + adicionar loader.
3. Tema comprado **sem AdSense nenhum** (ex.: diariopernambucano, tema riverview-co). Fix: só adicionar o loader.

**Fix universal (funciona nos 3):**
1. `for f in $(grep -rl PORTAL_PUB_ID $D/wp-content/themes/); do cp "$f" "$f.bak-adsense-20260623"; sed -i 's/PORTAL_PUB_ID/3880875536722698/g' "$f"; done`
2. mu-plugin `wp-content/mu-plugins/adsense-loader.php`: `add_action('wp_head', fn()=> echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3880875536722698" crossorigin="anonymous"></script>', 5)`
3. `wp litespeed-purge all` + purgar Cloudflare. Verificar ao vivo: `curl | grep ca-pub-3880875536722698`.

**ads.txt** geralmente **já está correto** nesses sites (verificação por ads.txt passa). Slots manuais são placeholders (`RR_SLOT_*`) → **ativar Auto Ads** no painel AdSense pra anúncios realmente aparecerem.

**Hosts:** revistarumo + diariopernambucano = `hostinger-anderson-gna` (u400588174); folhadonoroeste = `hostinger-qmix` (u463007860). É **sistêmico** — vale varrer todos os portais (`grep -rl PORTAL_PUB_ID` em cada host + checar loader). Ver [[reference_portal_engine_html]] e [[reference_hostverge_qmix_oversubscription]].
