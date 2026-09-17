---
name: project_relatorios_telegram_clientes
description: "Sistema de relatórios mensais (GA4+Search Console+leads CTA) pro Telegram QMIX — planejado, ADIADO pelo operador em 2026-07-02"
metadata: 
  node_type: memory
  type: project
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

Operador quer automatizar o relatório mensal que hoje faz **manual todo dia 1** (analisando GA4 + Search Console) pra enviar aos clientes. Decisão 2026-07-02: **ADIAR, fazer no futuro.** Não construir sem novo pedido explícito.

**Infra que já existe (pronta pra reusar) — servidor do bot QMIX em `opengravity:/opt/opengravity`:**
- Bot Telegram: `TELEGRAM_BOT_TOKEN` no `.env`; destino = chat/user id **<<REMOVIDO>>** (`TELEGRAM_ALLOWED_USER_IDS`). Projeto Node/TS (tem `googleapis` ^171).
- Service account Google: **`firebase-adminsdk-fbsvc@opengravity-c32fd.iam.gserviceaccount.com`** (projeto `opengravity-c32fd`, arquivo `service-account.json`). Hoje NÃO usa GA4/Search Console.

**Gargalo (só o operador faz, na conta Google dele):** habilitar "Google Analytics Data API" + "Search Console API" no projeto `opengravity-c32fd` e adicionar o e-mail do SA como **Leitor** em cada propriedade GA4 e como usuário em cada propriedade do Search Console.

**Plano recomendado (quando retomar):** relatório por site — Search Console em destaque (cliques/impressões/CTR/posição média/top páginas/queries + % vs mês anterior) + GA4 (usuários/sessões/origem/conversões) + **leads do CTA** (dos blogs cirúrgicos, via `GET /wp-json/mccta/v1/report?key=r7Kp9mQ2xL`). Módulo Node no servidor do bot, cron dia 1, envia ao Telegram. Piloto em 1 site que ele já reporta manual (validar contra o manual) + ombro/joelho (mostrar os leads). Ver [[reference_blog_cirurgiadojoelho_location_cf]] pro tracking de CTA já pronto.
