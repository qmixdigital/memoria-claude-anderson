---
name: project_rblc_backlinks_lote9
description: rblc.com.br lote 9 (13/09/2026) FECHADO — 20 guest posts IPTV p/ 10 páginas top-24h do GSC, 2 por página, portais não vetados de menor tráfego; Apex projeto 1180458
metadata:
  type: project
---

Lote 9 do rblc.com.br, publicado em 13/09/2026. Pedido: 20 backlinks para as 10
páginas com mais tráfego nas últimas 24h (GSC, dimensão HOUR), 2 posts por página,
tema IPTV, hospedados em portais de notícias NÃO vetados e com MENOS tráfego
(0-1 cliques em 28 dias), para puxar tráfego para esses portais.

Destinos (2 posts cada): /, /teste-iptv-4k, /teste-iptv-automatico,
/teste-iptv-futebol, /teste-iptv-iphone, /teste-iptv-nexo-play, /teste-iptv-pc,
/teste-iptv-samsung, /teste-iptv-smart-tv, /teste-iptv-smarters.

Hospedeiros: 15 na clinicas-vps (URL flat /slug/) + 5 no srv1166087
(URL /iptv/slug/): boxnoticias, jornalconceito, gpnoticias, tempusnoticias,
mgnoticias, noticiasagoras, nodiario, noticiasdodia, rsnoticias, maragoginoticias,
jornalistanofato, noticiasubuntu, agencianacional, noticiasdiarios, jornalacapital
(cv); jornalsaosimao, jrnoticias, gazetaalerta, jornaldiario, jornalexpresso (srv).

Estado: 20/20 no ar, 3 links de entrada por post, verif.py 20/20 OK, densidade
1,1-2,6%, planilha rblc.com.br.xlsx 2033→2053 linhas (Lote 9 + Notas). IndexNow
disparou na publicação. URLs em D:/SISTEMAS/INDEXADORES/urls/rblc-lote9.txt.
Apex enviado em 13/09/2026: projeto **1180458** (60 créditos, saldo 4948→4888). Lote FECHADO.

Pipeline em D:/tmp/rblc9 (gsc24.py, portais_trafego.py, plano_build.py, art/,
stock_img.py, pub.sh, verif.py, seo_full.py, planilha.py).

**Why:** registrar o que já foi feito para não repetir pauta/portal e para fechar o
lote quando o operador autorizar o Apex.
**How to apply:** lote encerrado; para lote 10 repetir o pipeline em D:/tmp/rblc9 e NÃO reutilizar as pautas/portais acima. Comando Apex usado:
`cd D:/SISTEMAS/INDEXADORES/scripts && python submit_index.py ../urls/rblc-lote9.txt "rblc lote 9" --apex`,
anotar o projeto em [[reference_rapid_url_indexer_api]] e na aba Notas do xlsx.
Ver também [[feedback_registro_backlinks_por_dominio]].
