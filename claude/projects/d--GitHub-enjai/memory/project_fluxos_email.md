---
name: project_fluxos_email
description: "3 fluxos automáticos de e-mail (pós-entrega, lead de ferramenta, win-back) via Resend, cron diário nos 3 sites SMM — implantado 2026-09-11 sob autorização total do Anderson"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-09-11T08:11:01.454Z
---

**Contexto (2026-09-11):** o enjai perdeu ~99% do tráfego orgânico no Google August 2026 Spam Update (18-21/08; sem ação manual; páginas seguem indexadas mas rebaixadas). Anderson deu **autorização total** pra eu implantar o que julgasse pra aumentar vendas. Estratégia: e-mail como canal próprio, com **automação por comportamento** (não blast: a reativação 30% em blast teve 1 resgate em ~4.000).

**Sistema:** `/var/www/<site>/fluxos_enviar.mjs` + `fluxos_template.mjs` em **enjai, portuga, skipark** (truenet ignorado, ~6 e-mails). Mesma infra da reativação: Node + `pg` (DATABASE_URL do .env.local), Resend HTTP com `User-Agent: curl/8.4.0` (senão Cloudflare 403), descadastro HMAC `/descadastrar?e=&t=` + `List-Unsubscribe` one-click. Rodar **de dentro do dir do site** (resolve node_modules/pg). Node: srv = `/root/.nvm/versions/node/v20.20.2/bin/node`; skipark = `/usr/bin/node`.

**Modos:** `dry` (conta elegíveis por passo) · `test:<email>` (manda os 7 templates, não registra) · `run [CAP]` (padrão 300 no total por rodada, throttle 1,2s). **Cap por fluxo** (`CAP_FLUXO` = CAP/2 = 150 p/ win-back e 150 p/ leads) e **ordem pós-entrega → win-back → leads**, senão a fila de leads (1.394) engolia o cap e deixava o win-back (clientes 2+, mais valiosos) esperando dias. Ajuste feito na 1ª rodada de 2026-09-11 (a 1ª rodada do enjai ainda saiu na ordem antiga: 25 pós-entrega + 275 leads).

**Tabela de controle:** `"EmailFluxo"(email, fluxo, etapa, enviadoEm, resendId, UNIQUE(email,fluxo,etapa))` — criada pelo próprio script (CREATE IF NOT EXISTS). Garante 1 envio por (pessoa, fluxo, etapa).

**Os 3 fluxos (SQL no script):**
- `pos_entrega` (1 e-mail): Pedido CONCLUIDO com `concluidoEm` entre 1 e 3 dias atrás → afiliado 15% + app 10%.
- `lead_ferramenta` (3): UsuarioFerramenta cujo 1º uso foi há 1-30 dias e **nunca comprou** → etapa1; etapa2 = 3 dias após etapa1; etapa3 = 4 dias após etapa2 (sequência pelo `enviadoEm`, sai se comprar). Copy: serviços a partir de R$ 0,01 + app 10% → como funciona → afiliado (renda extra).
- `winback` (3): clientes com **>=2 pedidos pagos** e último pedido há 60-120 dias → etapa1; etapa2 +7d; etapa3 +8d; sai do fluxo se comprar depois da etapa anterior. **2+ pedidos de propósito**: a campanha de reativação (30%, cron dias úteis 13:00 UTC) já cobre quem comprou 1x — sem sobreposição.
- Supressão em todos: `DescadastroEmail`, `anonimo@`, e-mail inválido.

**Templates:** pt-BR acentuado, **sem emoji, sem travessão** (ver [[feedback_no_emojis]]), layout email-safe com cor da marca (enjai #3B68FF, portuga #0F9488, skipark #00A3B5). Ofertas usadas: afiliado 15% recorrente (`/afiliados/cadastro`), app 10% permanente que soma com VIP (`/aplicativo`).

**Crons (diário, 11:30 BRT):** srv `32 14 * * *` enjai e `42 14 * * *` portuga; opengravity `32 14 * * *` skipark. Log: `/var/log/fluxos-email.log` em cada servidor. **Desativar:** `crontab -e`, remover linhas `fluxos_enviar.mjs`.

**1ª rodada 2026-09-11 (dry antes):** elegíveis enjai pós-entrega 25 / leads 1.394 / win-back 642; portuga 6/9/59; skipark 2/77/17. Teste dos 7 templates aceito pelo Resend (7 IDs) antes do envio real. **Resultado: enjai 300 (25 pós-entrega + 275 leads), portuga 74 (6 + 59 win-back + 9 leads), skipark 96 (2 + 77 + 17) = 470 enviados, 0 falhas**, todos registrados em EmailFluxo. Portuga já rodou na ordem nova (win-back antes dos leads). A fila do enjai (1.394 leads + 642 win-back) escoa nas próximas rodadas do cron a 150+150/dia.

Ver [[project_campanha_reativacao]], [[project_app_pwa]], [[project_campanha_app_lancamento]].
