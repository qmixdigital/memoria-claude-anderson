---
name: project_skipark_aviso_mudanca_enjai
description: "2026-10-03: Anderson decidiu levar SkiPark, Portuga e TrueNet para o Enjai (enjai.social) 'em breve' e no futuro eliminar os três; aviso por e-mail enviado aos usuários dos três (421 + 587 + 87); migração em si ainda NÃO feita"
metadata:
  type: project
---

**Decisão do Anderson (2026-10-03):** o SkiPark vai mudar de endereço para o Enjai (`enjai.social`) "em breve". Isso contraria a minha recomendação do mesmo dia (manter o SkiPark separado: 25% da receita dos 4 sites, R$ 1.942 em 30 dias, mas 58% vindos de 3 clientes); a decisão é dele e vale. Portuga também está cotado para migrar.

**Feito:** e-mail de aviso para todos os usuários do SkiPark, 2026-10-03 20:33 a 20:43 UTC: **421 enviados, 0 falhas** (270 clientes, compra mais recente primeiro, + 151 leads de ferramenta). Script `/var/www/skipark/aviso_mudanca_enjai.mjs` (opengravity, `/usr/bin/node`), controle em `"EmailFluxo"` com `fluxo='aviso_mudanca_enjai', etapa=1`, log `/var/log/aviso-mudanca-enjai.log`. Remetente `SkiPark <noreply@skipark.com.br>`, descadastro do próprio SkiPark, links com `utm_campaign=skipark-mudanca`. Sem cron: foi disparo único.

**O que o e-mail prometeu (não contradizer na migração):** em breve o SkiPark atende em enjai.social; o Enjai é a loja principal, da mesma equipe; por enquanto nada muda, pedidos e suporte seguem; quando mudar, skipark.com.br leva sozinho ao novo; **o app do Enjai (enjai.social/aplicativo) já dá 10% em todo pedido**. Não foi prometido que histórico de pedidos, nível VIP ou preços migram.

**Escolha minha, avisada a ele:** o app indicado no e-mail é o do ENJAI, não o do SkiPark, para o cliente não precisar reinstalar depois da mudança (mesmo problema descrito em [[project_aviso_dominio_email]]).

**Pendente quando ele mandar migrar:** bancos são separados (pedidos em aberto, VIP, afiliados, cupons do SkiPark não existem no Enjai); manter `/pedido`, `/meus-pedidos` e `/api` do SkiPark no ar no domínio antigo; 301 página a página (slugs iguais); Mudança de endereço no Search Console; esperar 2 a 3 semanas da migração do enjai ([[project_migracao_dominio_enjai_social]]).

**Ampliado no mesmo dia para Portuga e TrueNet** (o Anderson: "no futuro podemos eliminá-los todos e aproveitamos e fazemos publicidade"; aprovou o teste do SkiPark). Mesmo e-mail, marca no feminino ("a PORTUGA", "a TrueNet", como os sites se tratam):
- **Portuga:** 587 enviados, 0 falhas (577 clientes + 10 leads), 20:49 a 20:59 UTC. Script `/var/www/portuga/aviso_mudanca_enjai.mjs`, log `/var/log/aviso-mudanca-enjai-portuga.log`, remetente `PORTUGA <noreply@portugaldigital.com.br>`, `utm_campaign=portuga-mudanca`.
- **TrueNet:** 87 enviados, 0 falhas (4 clientes + 83 leads). Script `/var/www/truenet/aviso_mudanca_enjai.mjs`, log `/var/log/aviso-mudanca-enjai-truenet.log`, `utm_campaign=truenet-mudanca`. **O TrueNet não tinha a rota `/descadastrar`** (404): copiei `app/descadastrar/route.ts` do enjai, fiz deploy e validei com token real antes de enviar. A tabela `EmailFluxo` foi criada lá pelo script.
- Total dos três sites: 1.095 avisos. Tráfego que vier disso aparece no GA4 do enjai pelas campanhas `skipark-mudanca`, `portuga-mudanca`, `truenet-mudanca`.
