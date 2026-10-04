---
name: project_estrategia_trafego_enjai_social
description: "Estratégia de tráfego do enjai.social aprovada pelo Anderson em 2026-10-03: (1) reativar afiliados, já iniciado; (2) consolidar 93 landings em ~37 na semana de 20/10/2026, plano pronto; achados que sustentam"
metadata:
  type: project
---

**Aprovado pelo Anderson em 2026-10-03 ("pode começar"):** começar pelos afiliados agora e deixar a consolidação das landings para a semana de **20/10/2026**. Sem anúncio pago (Google e Meta proíbem o nicho; ticket médio R$ 9,58 não paga clique).

**Achados que sustentam (Search Console, 28 dias, propriedade enjai.com.br):**
- Antes do update de spam (15/07 a 11/08): 31.670 cliques, sendo **69% nas ferramentas grátis** (21.819), 20% nas landings, 8% na home. Depois: 1.430 cliques no total, ferramentas 513. Queda igual em tudo = punição no nível do site.
- 59% dos clientes dos últimos 30 dias são recorrentes; app = 47 pedidos/30d (8%); dos 2.639 leads de ferramenta só 67 viraram clientes.
- Das 93 landings de conteúdo, 57 tinham <10 cliques/28d mesmo antes do update. As 48 páginas "serviço" somavam só 350 cliques; as 23 de isca (grátis/bot/gerador) 3.439; as 20 de preço 2.402 (1.670 numa só: `/comprar-seguidores-por-1-real`).

**1. Afiliados (em andamento).** Estado encontrado: 331 cadastrados, todos 15%, só 46 já tiveram clique e 12 já venderam; **total de comissões da história: R$ 22,88; zero saques**, porque o mínimo no código era R$ 50 (a página pública já dizia R$ 20). Feito em 2026-10-03:
- Saque mínimo baixado para **R$ 20** em `app/api/afiliado/saques/route.ts` (ordem do Anderson: "baixe o saque para 20 reais ou troque por serviços"; backup `.bak-min50`), deploy feito.
- E-mail "Seu link de afiliado mudou: agora é enjai.social" com link pessoal `https://enjai.social/?ref=<codigoRef>`, termos reais (15%, cookie 30 dias, saque PIX a partir de R$ 20), ângulo de revenda (gestor de redes manda o link ao cliente) e 3 textos prontos. Script `/var/www/enjai/afiliados_email.mjs` (`dry|html|test:<email>|run <N>`), controle `EmailFluxo` fluxo `afiliado_link_novo`. **100 enviados em 2026-10-03** (quem já vendeu e quem já teve clique primeiro); os 231 restantes saem por cron `50 14 * * *` a 100/dia e a fila zera sozinha. Log `/var/log/afiliados-email.log`.
- **Não feito: troca de saldo por serviços.** Ele deixou a meu critério. É boa ideia (torna usável saldo pequeno e custa menos que PIX), mas exige crédito no checkout, que mexe no fluxo de pagamento; fica para construir e testar à parte.
- Sem dado de margem no banco (`smmCharge` espelha o preço de venda, o painel é dele), então não mexi no percentual de comissão.

**2. Consolidação das landings (agendada, NÃO executada).** Plano com mapa página a página em `d:/GitHub/enjai/docs/plano-consolidacao-landings.md`: manter 29, reescrever 8 iscas como guia honesto no blog, 301 em 56; de 93 ficam 37. O mapa é rascunho por heurística (rede x serviço): revisar antes de aplicar (ex.: `comprar-live-views-twitch` e `comprar-espectadores-twitch` ficaram os dois como "manter"). Fazer junto a fase 2 do [[project_reposicionamento_sem_comprar]] só nas páginas que ficam, e tirar os depoimentos fabricados do produto de compartilhamentos. Só no enjai: os outros 3 sites vão ser desligados ([[project_skipark_aviso_mudanca_enjai]]). **Eu não disparo sozinho: o Anderson precisa me chamar na semana do dia 20.**

**3. Depois:** links da rede de portais QMIX para ferramentas e guias do enjai.social (ritmo baixo, âncoras variadas) e vídeo curto mostrando as ferramentas.

Ver [[project_migracao_dominio_enjai_social]] e [[project_aviso_dominio_email]].
