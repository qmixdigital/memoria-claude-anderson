---
name: reference_orphan_wp_cleanup
description: "Limpeza de WP órfão após migração p/ portal-engine — capturar DB_NAME ANTES de apagar arquivos, senão não dá pra dropar o banco via CLI (Hostinger isola DB por site). Bancos órfãos pendentes no hPanel."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

Quando um site da rede migra para o **portal-engine** (vira estático), o WordPress antigo fica **órfão** na hospedagem (não serve tráfego, mas ocupa disco + roda crons/mu-plugins). Casos já tratados: **medicodasmaos** (era hostverge) e **entrenoticia.com** (era vps1, 507MB) — arquivos removidos.

**ORDEM CORRETA de remoção (CRÍTICO):**
1. **ANTES de apagar os arquivos**, capturar o nome do banco: `wp --path=<dir> config get DB_NAME` (e DB_USER se precisar).
2. Dropar o banco usando as credenciais do PRÓPRIO site: `wp --path=<dir> db query "DROP DATABASE \`<DB_NAME>\`;"` (ou `wp db reset`/mysql com o user do site).
3. **Só então** `rm -rf` o diretório do site.

**Por quê:** no Hostinger compartilhado (vps1 `u651115354`, anderson, etc.) **cada site tem um usuário MySQL isolado que só enxerga o próprio banco** — `SHOW DATABASES` de um site irmão só mostra o DB dele. Então, se apagar o `wp-config.php` primeiro, perde-se o nome/credencial e **não há como dropar o banco via CLI** (sem privilégio cross-database, sem MCP da Hostinger nessas contas). Só sobra o hPanel.

**Identificar órfão no hPanel** (quando o wp-config já foi apagado): listar os DB_NAME EM USO pelos sites atuais (`for d in */public_html; do wp --path=$d config get DB_NAME; done`) e, no hPanel → MySQL Databases, o banco `u<acct>_*` que NÃO estiver na lista é órfão. Confirmar abrindo `wp_options.siteurl` no phpMyAdmin.

**PENDENTE (dropar no hPanel manualmente):**
- **entrenoticia.com** — DB órfão na vps1 (u651115354), nome perdido (wp-config apagado 2026-06-16). Achar o `u651115354_*` fora da lista de 43 em uso.
- **medicodasmaos** — DB órfão (era hostverge / agora portal-engine).

**ARMADILHA em operação de massa (20/08/2026):** o WP órfão **continua respondendo a wp-cli e a `wp post update`** mesmo sem servir o domínio — a edição "dá OK" e não aparece no site. Aconteceu com **euvo.com.br, blogse.com.br, adonline.com.br e qmixdigital.com.br**, que já são portal-engine (euvo/blogse/adonline/qmixdigital no opengravity) mas ainda constavam como WordPress nos meus arquivos de rota. Teste rápido de qual stack serve o domínio, antes de editar:

```bash
curl -s -o /dev/null -w '%{http_code}
' https://SITE/wp-json/wp/v2/posts?per_page=1   # 404/410 = não é mais WP
curl -sL https://SITE/ARTIGO/ | grep -c wp-content                                      # 0 = servido pelo engine
grep -o '"domain": *"SITE"' /opt/portal-engine/sites.json                                # em qual host está
```

Sintoma clássico: `cf-cache-status: DYNAMIC` (ou seja, não é cache) + conteúdo no banco + página sem a alteração.

Ver [[reference_portal_engine_migration_recipe]] e [[reference_setorenergetico_next]].
