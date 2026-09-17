---
name: reference_portal_engine_opengravity_wtw19
description: "Existem DOIS portal-engine (opengravity + srv1166087). wtw19.com.br é portal-engine no opengravity, não WP."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

⚠️ **Existem DOIS deployments de portal-engine** (não só o do srv1166087). Ao procurar um site "sumido", checar OS DOIS:

1. **srv1166087** (`ssh hostinger-vps-srv1166087`): `/opt/portal-engine` + `/srv/portais/<slug>/`. Portais: diariodatv, diariodegoiania, diariodobrejo, edenoticias, entrenoticia, folhaum, gdsnoticias, jornaldiario, medicodasmaos, projetob, romanceseleituras, todossomosgeek.
2. **opengravity** (`ssh opengravity`): `/opt/portal-engine` + `/srv/portais/<slug>/` + vhost `/etc/nginx/conf.d/portal-<slug>.conf`. Portais: girodasnoticias, jornaldebarcelos, nerddahora, noticias9, noticiasdasemana, noticiasgoias, osertaoenoticia, portalnoticiasbh, **wtw19**.

**wtw19.com.br** = **portal-engine no OPENGRAVITY** em `/srv/portais/wtw19/` (NÃO é mais WordPress — `/wp-json/` dá 404; migrou do WP no hostverge). Arquivos são do user **`portais`**. Artigos em `/srv/portais/wtw19/data/*.json` (campos content/dek/excerpt HTML).

**Como deletar/editar artigo de portal-engine:** editar/remover o JSON em `data/` + `rebuildIndexes(cfg, site)` do `/opt/portal-engine/src/render.js`, rodando como **`runuser -u portais -- node ...`** (nunca root). `cfg`=`/opt/portal-engine/sites.json` (tem sitesRoot + sites[]), `site`=`cfg.sites.find(s=>s.slug===SLUG)`. Cloudflare serve DYNAMIC (sem purge). Ver [[reference_portal_engine_html]] e [[reference_portal_engine_publish_articles]].

**Regra pra não perder tempo:** um domínio "não achado" nos hosts WP (anderson/qmix/vps1/hostverge) provavelmente MIGROU pra portal-engine — checar `/srv/portais/` nos DOIS (opengravity E srv1166087) e o mapa antonio_COMPLETO.csv está DESATUALIZADO pra migrações recentes.
