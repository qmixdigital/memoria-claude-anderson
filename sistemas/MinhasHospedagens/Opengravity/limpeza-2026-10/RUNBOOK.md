# Limpeza da opengravity — 18/10/2026

Ordem do operador: limpar resíduos, apagar o skipark, migrar o
tendenciasmarketing.news para estático no Cloudflare Pages.

Disco: 86% (14 GB livres) → **76% (24 GB livres)** depois do passo 0. A meta
depois de tudo é ficar em torno de 55%.

## 0. JÁ FEITO (não refazer)

- O logrotate falhava todo dia desde 07/09 por causa de 3 configs duplicadas.
  Os arquivos foram movidos para `/root/logrotate-disabled/`: `nginx.bak-20260907`,
  `consultarimovel` e `apache2-domains`. O `qmix-hardening` foi reescrito sem
  nginx e sem mysql.
- Teste: `logrotate -d /etc/logrotate.conf 2>&1 | grep ^error` não retorna nada,
  e `systemctl start logrotate` termina OK.
- Logs zerados: o `error.log` do nginx (7,7 GB) e os access logs do
  diretorio.desassossegada (1,3 GB) e do contadores.revistadeducao (0,9 GB).

## Como rodar os .sh

```
scp D:/SISTEMAS/MinhasHospedagens/Opengravity/limpeza-2026-10/0*.sh opengravity:/root/limpeza/
ssh opengravity 'bash /root/limpeza/01_backup_retencao.sh'
ssh opengravity 'bash /root/limpeza/02_limpeza_residuos.sh'          # dry run, ler a saída
ssh opengravity 'bash /root/limpeza/02_limpeza_residuos.sh --apply'
```

## 1. Backup local do portal-engine (`01_backup_retencao.sh`)

Deixa 2 cópias locais em vez de 7 diárias mais os domingos (cerca de 16 arquivos
de 1,3 GB). O cofre na srv1166087 continua com 7. Ganho: cerca de 17 GB.
Conferência: `ls /srv/backup-engine` deve mostrar 2 arquivos `srv1000825`, mais os
`srv1166087` e `srv984283`, que vêm de fora e são podados pela origem.

## 2. Resíduos (`02_limpeza_residuos.sh`)

- **geladeirastop:** foi migrado para a srv1166087 em 14/09 e aqui só dá 502.
  O script aborta se o site público não estiver dando 200.
- **Domínios Hestia mortos:** staging.peritodicas, blog.qmix, investqmix e
  blog.clinicasrecuperacaosaopaulo.
- **Bancos:** MySQL `notebookx_wp` e `peritodicas_v2` (o script faz dump em
  `/root/db-backups` antes de apagar e pula se algum app ainda usar), mais os
  bancos de shadow do Prisma.
- **Sobras:** pastas em /root, caches npm, as pastas `-prev` e o processo PM2
  `euvo-agenda-crawler`.

## 3. skipark (`03_skipark_apagar.sh`)

Antes de rodar, guardar o último dump na máquina local:
```
scp opengravity:/var/backups/skipark/skipark-semanal-2026-10-18.sql.gz D:/SISTEMAS/MinhasHospedagens/backups/
```
Depois: `bash 03_skipark_apagar.sh` (dry run) e `--apply`. A conferência no fim
do script não pode listar nada. Não mexer na zona CF nem no registro do domínio.

## 4. tendenciasmarketing.news → Cloudflare Pages

A zona está na **conta23** (token em `D:/SISTEMAS/cloudflare/contas.json`,
`nome == "conta23"`). O app é Next com editor admin, e o admin deixa de existir
no estático, o que foi aceito.

1. **Espelhar:** `python 04_tendencias_mirror.py D:/tmp/tendencias-static`.
   Esperado: cerca de 132 páginas, que é o número de URLs do sitemap. Abrir 3
   páginas locais e conferir CSS e imagens (`npx serve D:/tmp/tendencias-static`).
2. **Publicar:**
   ```
   set CLOUDFLARE_API_TOKEN=<token conta23>
   set CLOUDFLARE_ACCOUNT_ID=<account_id conta23>
   npx wrangler@3.114.0 pages project create tendenciasmarketing --production-branch main
   npx wrangler@3.114.0 pages deploy D:/tmp/tendencias-static --project-name tendenciasmarketing --branch main
   ```
   Se o token não tiver permissão de Pages, criar um token na conta23 com
   "Cloudflare Pages: Edit".
3. **Testar** no `https://tendenciasmarketing.pages.dev`: home, um artigo, uma
   categoria, `/sitemap.xml` e uma URL inexistente, que deve dar 404 com a página
   do site.
4. **Domínio:** na API, `POST /accounts/{id}/pages/projects/tendenciasmarketing/domains`
   com `tendenciasmarketing.news` e com `www.tendenciasmarketing.news`.
   Depois, nos DNS da zona, trocar o registro A do apex e o do www por
   **CNAME → tendenciasmarketing.pages.dev**, com proxy ligado.
5. **Validar:** `curl -sI https://tendenciasmarketing.news/` deve devolver 200
   sem passar pela origem (o header `server: cloudflare` e nenhum `x-powered-by:
   Next.js`). Conferir 5 URLs do sitemap e garantir que o www redireciona com 301.
6. **Só depois do passo 5 OK**, desligar na opengravity:
   ```
   sudo -u postgres pg_dump tendenciasmarketing | gzip > /root/db-backups/tendenciasmarketing-final-20261018.sql.gz
   scp opengravity:/root/db-backups/tendenciasmarketing-final-20261018.sql.gz D:/SISTEMAS/MinhasHospedagens/backups/
   pm2 delete tendencias && pm2 save
   v-delete-web-domain qmix tendenciasmarketing.news yes
   rm -rf /var/www/tendenciasmarketing
   sudo -u postgres dropdb tendenciasmarketing
   nginx -t && systemctl reload nginx
   ```
7. Se existir, tirar o domínio de `opengravity:/opt/opengravity/sites_monitorar.txt`.
   O site continua no ar, então também pode ficar lá.

## Fechamento

- `ssh opengravity 'df -h /; pm2 ls'` deve mostrar o disco abaixo de 60% e todos os apps online.
- Atualizar `D:/SISTEMAS/MinhasHospedagens/Opengravity/README.md` com o que saiu.

## Pendências fora desta limpeza (não executar sem ordem)

- **consultarimovel:** cerca de 570 mil requisições por dia, quase tudo robô com
  UA de navegador raspando `/imovel-rural` e `/relatorio`. Proposta: rate limit
  ou Managed Challenge no Cloudflare só nesses caminhos, liberando os verified
  bots. O banco tem 6,7 GB.
- **error.log:** cheio de timeouts do proxy contadores.revistadeducao e
  diretorio.desassossegada, que vão para 31.97.173.40:3180/3181 (srv1166087).
