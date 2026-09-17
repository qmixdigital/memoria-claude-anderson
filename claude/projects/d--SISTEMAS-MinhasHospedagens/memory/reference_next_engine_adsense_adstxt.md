---
name: reference_next_engine_adsense_adstxt
description: "AdSense/Auto Ads + ads.txt nos apps Next da engine de diretório (setorenergetico/desentupidora/geladeirastop/arcondicionadotop): config via site_settings; pegadinha ca-pub- vs pub-"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-27T18:16:42.955Z
---

# AdSense + ads.txt na engine Next de diretório (26/07/2026)

Os apps Next dessa família (setorenergetico, desentupidora.pro, geladeirastop.com, arcondicionadotop.com — mesmo template) têm tracking/ads dirigido por **DB, tabela `site_settings`** (colunas `chave`/`valor`/`tipo`; PK=chave). NÃO é hardcoded.

- **Loader Auto Ads:** componente `src/components/TrackingScripts.tsx` (`HeadTracking`) injeta no `<head>` o script `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense_id}` **se a setting `adsense_id` existir**. Formato exigido: **`ca-pub-XXXX`** (com `ca-`). Também suporta `google_site_verification`, `gtm_id`, `ga4_id`, `meta_pixel_id`, `head_scripts`/`body_scripts`/`footer_scripts`.
- **ads.txt:** rota `src/app/ads.txt/route.ts` (`force-dynamic`, reflete na hora, sem rebuild). Lógica: se `ads_txt` preenchido → serve **raw**; senão, se `adsense_id` → gera `google.com, ${adsense_id}, DIRECT, f08c47fec0942fa0`; senão 404.

## ⚠️ PEGADINHA (sistêmica): ca-pub- vs pub-
O loader precisa de `ca-pub-XXXX`, mas o **ads.txt do Google exige `pub-XXXX` (SEM `ca-`)**. Se só setar `adsense_id=ca-pub-XXXX`, a rota gera um ads.txt INVÁLIDO (`google.com, ca-pub-XXXX, ...`) e o Google rejeita a verificação. **FIX correto = usar os DOIS campos:**
- `adsense_id` = `ca-pub-3880875536722698` (loader)
- `ads_txt` = `google.com, pub-3880875536722698, DIRECT, f08c47fec0942fa0` (raw, servido no /ads.txt)

pub ID real da rede QMIX = **3880875536722698** (ver [[reference_qmix_adsense_portal_pub_id]]). Uma rota estática `public/ads.txt` NÃO adianta — a rota `app/ads.txt/route.ts` sombreia o arquivo estático.

## Como aplicar (SQL direto no Postgres do app)
```
cd /var/www/<site>; export $(grep -E '^DATABASE_URL=' .env.local | head -1)
psql "$DATABASE_URL"  # heredoc 'SQL' aspas-simples pra evitar expansão do $$ pelo shell
INSERT INTO site_settings(chave,valor,tipo,updated_at) VALUES('adsense_id','ca-pub-3880875536722698','string',now()) ON CONFLICT(chave) DO UPDATE SET valor=EXCLUDED.valor, updated_at=now();
INSERT ... ('ads_txt','google.com, pub-3880875536722698, DIRECT, f08c47fec0942fa0',...) ON CONFLICT ...;
```
ads.txt reflete na hora (force-dynamic). O **loader precisa de rebuild+reload** (`pnpm build` + `pm2 reload <app>`) porque o `<head>`/layout é prerenderizado/ISR. Depois: ativar Auto Ads no painel AdSense quando aprovar.

geladeirastop.com: opengravity, `/var/www/geladeirastop.com`, PM2 `geladeiras-top` porta 3020 (ver [[reference_geladeirastop... ]] / D:\SITES\geladeirastop.com\ACESSO.md). Feito 26/07: ads.txt + loader Auto Ads prontos, aguardando aprovação.
