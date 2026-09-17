---
name: project_migracao_blogs_clientes
description: "PENDENTE: migrar 5 blogs WordPress de clientes do opengravity p/ srv1166087 — método WP→WP COMPLETO (mover WP inteiro), NUNCA converter p/ portal-engine."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

**Tarefa adiada em 2026-06-22 (fazer depois).** Mover 5 blogs WordPress de clientes do **opengravity** → **srv1166087**, mantendo WordPress completo (arquivos+DB+tema+plugins+wp-admin).

**Runbook completo + inventário + zonas/contas Cloudflare:** `D:\SISTEMAS\MinhasHospedagens\MIGRACAO-BLOGS-CLIENTES.md`.

**Blogs (origem: opengravity, HestiaCP user `qmix`, `/home/qmix/web/<dom>/public_html`):** blog.ombrogoiania.com.br (218 posts), blog.drthiagotredicci.com.br (185), blog.drtiagobernardes.com.br (127), blog.camilafarias.com.br (72), blog.nutricionista.digital (29). **peritodicas.com NÃO entra — não é blog** (o dono confirmou).

⚠️ **MÉTODO CORRETO = WP→WP completo** (domínio não muda → só mover arquivos+DB, ajustar wp-config, cutover DNS). **NÃO converter p/ portal-engine** — em 2026-06-22 comecei errado convertendo p/ portal-engine (criava cópias do conteúdo em sites novos); o dono corrigiu ("não quero criar outros blogs e copiar conteúdo, quero o WordPress inteiro"). **Desfiz 100%** essa tentativa (removi 5 entradas do sites.json + 5 vhosts nginx + 5 dirs /srv/portais + temp; backup `sites.json.bak-cleanup-blogs-20260622`). Os 5 WordPress originais NUNCA estiveram no srv1166087 — sempre no opengravity, intactos.

**Destino pronto:** srv1166087 tem HestiaCP+MariaDB+PHP8.3+Apache, 291G livres, IP cutover 31.97.173.40. **Pendência:** decidir conta HestiaCP destino (`qmix2` existente ou nova). Cada blog é uma **conta Cloudflare separada** (tokens/zonas no runbook + `D:\SISTEMAS\Cloudflare`). Ver [[reference_setorenergetico_next]] e [[reference_acesso_qmix_etc_hosts]] (armadilha /etc/hosts) ao executar.
