---
name: conversao-estatico-clinicas-vps
description: 10 diretórios Next viraram estáticos no Cloudflare Pages (18-19/10/2026) e saíram da clinicas-vps/srv1166087; pipeline converter.py e armadilhas
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-19T16:42:02.728Z
---

Em 18-19/10/2026 viraram estáticos no Pages e foram REMOVIDOS do servidor (app, banco, nginx, Hestia, cron, webhook Asaas): geladeirastop (srv1166087), contadoria, planomedicosaude, garopaba, institutoortopedico, marmorariasperto, academus, saudevitalidade, vidracariaperto.ia.br e desentupidora.pro (clinicas-vps). Objetivo do operador: desativar a clinicas-vps em breve, nada fica em servidor. Fonte de cada site: D:/SITES/<dominio>/site + LEIA-ME-SISTEMA-MUDOU.md; backups em D:/SISTEMAS/MinhasHospedagens/backups/<nome>-{final,codigo,env-e-nginx}-20261019.*.

**Why:** diretórios só de leitura (Asaas/painel sem uso real); sites com sistema (recibos, sitegratis, calistenia, terceironome, farmacias, pixelgap, checkoutpixel) NÃO podem virar estáticos.

**How to apply:** pipeline em D:/SISTEMAS/MinhasHospedagens/Opengravity/estatico-diretorios/converter.py (`python converter.py <site> lista mirror baixar deploy dns limpar`; `SO_CHECAR=1` repete só a checagem/desvínculo local). Lista = páginas com impressão no GSC (gsc_keep.py) + sitemaps pequenos, cortada por mínimo de impressões para caber nos 20 mil arquivos do Pages. Armadilhas: (1) mirror sempre com `--podavel "^/"` e, depois, desvincular links para páginas da lista que o app devolveu 404 (senão menu quebrado em todas as páginas, caso desentupidora); (2) `\b` em regex editada via Python vira backspace invisível, conferir com `count('\x08')`; (3) custom domain do Pages pode ficar "pending" → PATCH no domínio força a validação; (4) harden_site.py só achava zonas das contas em contas.json, agora cai no token master; (5) após virar o DNS, purgar a zona (CF servia HTML antigo); (6) exit code 23 no fim do limpar é do pipe, não é erro.

Indexação (19/10): sitemaps enviados no GSC (scope `webmasters`, não o readonly do gsc_api.py) e no Bing (BingSiteAuth.xml no estático; o CNAME de verificação não validou); IndexNow com chave por site em D:/SISTEMAS/MinhasHospedagens/indexnow-keys-estaticos-20261019.json (`/<chave>.txt` em cada site; o 1º ping dá 403 SiteVerificationNotCompleted enquanto o verificador busca a chave, repetir após 1 min).

Relacionado: [[contadoria-estatico-pages]], [[geladeirastop-estatico-pages]], [[academus-para-notadecorte]]
