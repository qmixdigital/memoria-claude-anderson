---
name: project_aviso_dominio_email
description: "Campanha de e-mail avisando a troca de endereço do enjai (enjai.social) e pedindo reinstalar o app para manter os 10%; 1ª leva (app) enviada 2026-10-03, resto em rampa diária por cron"
metadata:
  type: project
---

**Pedido do Anderson em 2026-10-03:** avisar os usuários do Enjai que o endereço mudou para enjai.social e que, para continuar com o desconto, é preciso instalar o app pelo endereço novo. Primeiro quem baixou o app; depois os demais, no ritmo que eu julgasse melhor.

**Por que o app precisa ser reinstalado (fato técnico, não só copy):** o PWA antigo abre `enjai.com.br`, que redireciona para outra origem; fora do escopo do PWA o site não roda em modo standalone, então o `AppWelcome` não concede o cupom, e o cookie `promo_reativacao` ficou no domínio antigo. Ver [[project_app_pwa]].

**Script:** `/var/www/enjai/aviso_dominio.mjs` (Node + pg + Resend, mesmo molde de [[project_fluxos_email]]). Modos: `dry`, `html` (grava os 3 modelos em /tmp), `test:<email>`, `run app`, `run auto`, `run <N>`. Controle em `"EmailFluxo"` com `fluxo='aviso_dominio', etapa=1` (1 e-mail por pessoa). Supressão: `DescadastroEmail`, `anonimo@`, e-mail inválido. Remetente `Enjai <noreply@enjai.social>`, links com `utm_campaign=novo-endereco`, descadastro one-click.

**Segmentos e ordem:** `app` (quem pagou com cupom `app-%` ou tem `PushSubscription` com e-mail) -> `clientes` (compra mais recente primeiro) -> `leads` de ferramenta que nunca compraram. 3 modelos: app (reinstalar para manter 10%), cliente (endereço novo + convite ao app), lead (ferramentas no endereço novo + app).

**Limite real do segmento app:** dos 74 cupons `app-` só **20 pessoas são identificáveis por e-mail** (o cupom do app é criado com `email=""`). Os outros instaladores recebem o aviso pelo modelo "cliente", que tem o parágrafo "se você já tinha o app, instale de novo".

**Envios:** 2026-10-03 20:30 UTC, 1ª leva app = 20 enviados, 0 falhas, todos `delivered`. Fila restante: 5.405 clientes + 2.561 leads.

**Cron (srv1166087):** `10 15 * * *` (12:10 BRT, todo dia) `run auto`, log `/var/log/aviso-dominio.log`. Rampa por total já enviado, porque o domínio de envio nasceu no mesmo dia: <200 -> 100/dia; <800 -> 200; <2500 -> 350; depois 500. Termina em cerca de 3 semanas e para sozinho quando a fila zera (a linha do cron pode ser removida depois). Backup do crontab: `/root/crontab.bak-20261003-aviso`.
