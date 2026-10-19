---
name: geladeirastop-estatico-pages
description: "geladeirastop.com virou estático no Cloudflare Pages (18/10/2026); onde está, como refazer e o que deixou de existir"
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T22:31:00.492Z
---

geladeirastop.com é estático desde 18/10/2026: projeto Pages `geladeirastop` na conta Anderson Alves (9ecbf885...), DNS CNAME proxied para geladeirastop.pages.dev, www com 301 para o apex via regra de redirect da zona. 4.572 páginas (artigos, 2.246 páginas de cidade, marcas, categorias, notícias, 2.067 de /empresas/ com impressão no GSC). Fichas sem impressão e o resto das ~52 mil empresas ficam 404.

**Why:** diretório sem tráfego útil; o app Next dependia de build in-place que quebrava (ENOTEMPTY apagou o `.next`).

**How to apply:** a fonte do estático está em D:/SITES/geladeirastop.com/site (nada em servidor; o srv1166087 foi limpo). Para atualizar: editar o HTML e, em D:/SITES/geladeirastop.com, `npx wrangler@4 pages deploy site --project-name geladeirastop --branch main` com o token master em variável de ambiente (testado). O mirror original usou uma instância temporária `next start -p 3299`, porque congelar da produção deu CSS/fontes de build antigo. Lista de URLs: D:/SISTEMAS/MinhasHospedagens/Opengravity/estatico-diretorios/listas/congelar_gel.txt. DNS anterior em D:/SISTEMAS/cloudflare/dns_backup_geladeirastop_20261018.json.

Deixaram de existir: cron diário de notícias, newsletter, painel, login, busca, formulários. O app antigo foi REMOVIDO da srv1166087 em 18/10/2026 (PM2, nginx, crons, banco, pasta). Backups em D:/SISTEMAS/MinhasHospedagens/backups/geladeirastop-final-20261018.dump e geladeirastop-codigo-20261018.tgz. A pasta D:/SITES/geladeirastop.com tem aviso de que o sistema mudou.

Relacionado: [[estatico-diretorios-opengravity]]
