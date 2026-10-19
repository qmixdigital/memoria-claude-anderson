---
name: ebookcult-diretorio-estatico-gateway
description: "ebookcult.com.br é Pages + middleware → gateway og-ingresso.qmix.com.br; diretório de livrarias virou estático (18/10/2026), app desligado"
metadata:
  node_type: memory
  type: project
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T17:23:30.592Z
---

O ebookcult.com.br NÃO é servido pelo vhost `portal-ebookcult.conf` da opengravity: o DNS é CNAME para `ebookcult.pages.dev` (conta CF "Ebook Cult"), e um middleware do Pages encaminha as pastas do diretório para `og-ingresso.qmix.com.br` (`/etc/nginx/conf.d/ingresso-og.conf`) com o cabeçalho `X-Portal-Host`. O mesmo gateway atende desassossegada e revistadeducao, que seguem dinâmicos (app na srv1166087).

Em 18/10/2026 o diretório de livrarias (25.301 páginas) virou arquivo estático em `/srv/static/ebookcult-dir`, servido pelo gateway só quando `X-Portal-Host == ebookcult.com.br`. O app Next, o banco `ebookcult_dir` e a pasta foram removidos (dump + código em `D:/SISTEMAS/MinhasHospedagens/backups/`). Reavaliar em jan/2027 com `gsc_keep.py ebookcult.com.br` se o diretório fica.

**Why:** o diretório tinha 6 semanas e zero impressões; manter app, Postgres e 230 MB de RAM não se justificava.
**How to apply:** ao mexer no diretório do ebookcult, editar o gateway, não o `portal-ebookcult.conf`. O `ebookcult-dir-upstream.conf` fica porque o `map` do gateway ainda o cita. O `nginx.conf` global tem `error_page 410 /error/410.html`, que vira 404 no gateway; lá existe `error_page 410 @gone`. O Cloudflare barra com erro 1015 quem dispara centenas de requisições seguidas ao domínio: testar em ritmo de 2/s. Scripts em `D:/SISTEMAS/MinhasHospedagens/Opengravity/estatico-diretorios/`.
