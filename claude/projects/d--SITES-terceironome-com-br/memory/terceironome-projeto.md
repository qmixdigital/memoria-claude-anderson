---
name: terceironome-projeto
description: "Estado do site terceironome.com.br (loja de visualizações Reels): repo, VPS, DNS pendente, decisões do usuário"
metadata:
  node_type: memory
  type: project
  originSessionId: 13225851-a65d-45e5-bcd6-8d0d91103e0b
  modified: 2026-10-14T12:16:54.408Z
---

Site novo em `d:\SITES\terceironome.com.br`, motor copiado do Enjai (Next 14 + Prisma + OpenPix + painel SMM), enxugado para o nicho único "comprar visualizações Reels" (views, curtidas, salvamentos). Marca: "Terceiro Nome" (palpite derivado do domínio).

- GitHub: `qmixdigital/terceironome` (privado), token em `C:\Users\User\Documents\APIs\github.txt`. Push com token na URL foi bloqueado; `git push` simples funciona pelo credential manager.
- VPS escolhida: `clinicas-vps` (31.97.162.199), app em `/var/www/terceironome`, PM2 `terceironome` porta 3130 (efêmera `-b` 3131), PM2_HOME=/root/.pm2 e PATH com /root/.bun/bin; NUNCA `pm2 update`. DB Postgres `terceironome` (role `terceironome`). Nginx em `/etc/nginx/conf.d/terceironome.conf`, cert autoassinado em `/etc/ssl/terceironome` (provisório, modo Cloudflare Full).
- Cloudflare: zona `terceironome.com.br` (id c179350f...) está `pending`: faltam trocar os NS no Registro.br para dimitris.ns.cloudflare.com e lila.ns.cloudflare.com. Token em `APIs\cloudflare-pages.txt` lê DNS mas não SSL. Depois falta criar registro A para 31.97.162.199.

**Decisões do usuário (14/10/2026):** sem depoimentos por ora; GA4 e Clarity limpos (ID novo do GA4 ainda não informado); artigos NÃO copiados do Enjai, serão escritos depois; textos só sobre Reels.

**Why:** domínio expirado comprado em leilão, quer site novo de um único nicho.
**How to apply:** não reintroduzir depoimentos, GA4/Clarity do Enjai nem conteúdo de outras redes; artigos só quando o usuário pedir.

## Atualização 14/10/2026 (noite)
- Marca definitiva: **Terceiro Reels** (domínio terceironome.com.br, canônico www). Design "sala de projeção" (papel creme, tinta, vermelho REC, Big Shoulders). Categoria no banco precisa ter slug `instagram` (checkout valida link do Instagram por ele).
- **Deploy**: sempre `scp` do fonte para /var/www/terceironome e `bash deploy.sh` (build em /var/www/terceironome-build, B sobe, A é parada, troca .next, A volta). NUNCA buildar na pasta no ar: dava "Application error" para todos. Validado com probe: 338 páginas, 0 falhas. ecosystem.config.cjs não vai no tar (B usa cwd do build).
- GA4: propriedade `properties/558902038`, fluxo G-5LGQFDXVKF, configurada pela Admin API com a SA enjai-ga4-reader (tem permissão de edição): retenção 14 meses, medição aprimorada, eventos-chave e dimensões. GSC: `sc-domain:terceironome.com.br`, sitemap enviado. Bing: site verificado por BingSiteAuth.xml. IndexNow chave <<REMOVIDO>>
- Não copiei a chave da SA para o servidor (os relatórios do /admin/analytics precisariam de GOOGLE_APPLICATION_CREDENTIALS).

## Atualização 16/10/2026
- **Preços seguem o painel SMM** (painelseguidores.agency), igual ao Enjai: cron diário 04:10 `/usr/local/bin/terceironome-sync-smm.sh` chama `/api/cron/sync-smm`; o `lib/sync-smm.ts` daqui só atualiza preço/limites dos 4 produtos (não cria produtos nem mexe em nome/texto). Todo texto com preço lê de `lib/precos.ts` (nunca escrever preço fixo em página). Erro já cometido: seed com preços do banco local velho do Enjai (0,69) em vez da produção (2,99/29,90/5,99).
- Credenciais OpenPix e painel SMM copiadas do Enjai; webhook OpenPix "Terceiro Reels" registrado (HMAC em OPENPIX_WEBHOOK_SECRET); reconciliação PIX a cada 2 min via `terceironome-reconciliar.sh` (URL pública, a porta 3130 direta dá 400). Compra real de teste com PIX ainda não feita.
- `/comprar-visualizacoes-reels` foi removida (308 para a home): a keyword "comprar visualizações Reels" é da home; CTAs de compra apontam para `/produtos/instagram-visualiza-es-no-reels-5`.
- Regra do usuário: **sem pontuação em H1/H2/H3** (nem "?"); o FAQ tira a interrogação só no H3 visível.
- Indexação: 16/10 enviadas 8 URLs não indexadas ao Rapid URL Indexer em modo **Apex** por ordem expressa (projeto 1257364). `/baixar-reels-hd` tinha canônica do Google apontando para 747live.bet (herança do domínio expirado).

## Blog (16/10/2026)
- 11 artigos publicados em `/blog/*` (fonte: `prisma/artigos-blog.json`, script idempotente `scripts/inserir-artigos.ts`, na VPS roda com `/root/.bun/bin/bun`). Capas em `public/blog/<slug>.webp` (Pixabay via banco_img.py, sem crédito). Regras aplicadas: primeiro link do corpo = home com âncora única por artigo (11 variações de "comprar visualizações Reels"), um link por destino, crosslinks entre artigos, externos só de help/about.instagram.com, transparency.meta.com, Sprout/Later/Buffer, todos conferidos em navegador real (Meta devolve 400 ao curl, verificar com Playwright). FAQ: H2 "Perguntas frequentes" + H3 sem interrogação; o JSON-LD FAQPage recoloca o "?".
- Página de artigo refeita no design do site (`app/(loja)/blog/[slug]/page.tsx`): H1, linha fina (= campo `resumo`), data/leitura/autor, capa, TOC, lateral com os 3 produtos. Autor no schema = Organization (a entidade `/sobre#equipe-terceironome` não existia).
- Ideias ainda não feitas: ferramenta "contador de views de Reels pelo link"; página de autor (Person) para E-E-A-T; `sameAs` na Organization.

## Telegram e crons (16/10/2026)
- Alertas do site vão para o grupo "Skipark Alertas" (chat_id -5228734027, o Anderson vai renomear), pelo bot @skipark_bot (renomeado por API para "Terceiro Reels Alertas"; token copiado de /var/www/skipark/.env.local na opengravity). Webhook do bot aponta para https://www.terceironome.com.br/api/webhook/telegram (secret em TELEGRAM_WEBHOOK_SECRET). O Skipark está desativado; se voltar, dividiria o mesmo bot e grupo.
- Crontab da clinicas-vps para o site: reconciliar-pix (*/2), sync-smm (04:10) e, via `/usr/local/bin/terceironome-cron.sh <rota>`: check-smm-status (*/5), retry-erros (*/10), reenviar-pendencias (*/30), lembrete-abandono (15 * * * *), monitor-saldo-smm (06:00), relatorio-vip (08:00), limpar-logs (04:30). Mesmos horários do Enjai. Logs em /var/log/terceironome-cron-<rota>.log.

## Campanha de e-mail e regras de preço (16/10/2026)
- **Pedido mínimo R$ 1,00 em qualquer compra** (taxa da OpenPix): `lib/pedido-minimo.ts`; a calculadora sobe a quantidade mínima até o valor, o checkout recusa bruto < 1 e o desconto nunca leva o total abaixo de 1.
- **Promoção de primeira compra**: link `/promo/<token HMAC por e-mail>` grava cookie `tr_promo`; no checkout vale só para e-mail sem pedido pago; soma com app (10%) e VIP até `PROMO_TETO`. Percentuais em env na VPS (`PROMO_PERCENT=30`, `PROMO_TETO=40`, `PROMO_DIAS=60`, `PROMO_SECRET`), mudam com `pm2 restart --update-env`. Pedido grava `cupomPromo`.
- **Descadastro**: `/descadastrar?e=&t=` (assinatura em `lib/descadastro.ts`), one-click via POST em `/api/descadastrar`, tabela `DescadastroEmail`.
- **Envio**: `scripts/campanha-enviar.mjs` (bun, na VPS), base em `prisma/campanha-base.json` (exportada do Enjai por `scripts/exportar-base-enjai.sh`, 5.454 e-mails em 16/10, não vai ao git), rampa 100/200/350/500 por dia, ~40/min, registro em `CampanhaEnvio`, resumo no Telegram. Cron diário 13:00 UTC está no crontab **comentado**: só ligar quando o Anderson mandar. Teste enviado para qmixdigital@gmail.com em 16/10.
- Margem: preços = tarifa do painel; se a tarifa for o custo real, 30-40% é prejuízo. Aguardando o custo real por 1.000 para fechar o percentual.

## Diagnóstico de vendas (21/10/2026)
- GA4 (SA enjai-ga4-reader; a SA seoqmix NÃO tem acesso à propriedade): 84% das sessões vêm de chatgpt.com recomendando a ferramenta `/ferramentas/baixar-reels-instagram` (tool_use ~830/semana). Público quer baixar vídeo, não comprar views: view_item 26, begin_checkout 3, purchase 1 (venda real de 17/10, entregue pelo painel). Funil técnico íntegro (checkout gera PIX, CLS 0 após reservar a faixa do app).
- Campanha de e-mail: 1.150 entregues (Resend "delivered"), **zero sessões com utm boasvindas30** no GA4. Troquei remetente para "Terceiro Reels (equipe Enjai)" e assunto "Cliente Enjai: 30% OFF...". O Enjai roda ao mesmo tempo o aviso_dominio (500/dia) para a mesma base.
- Oferta de views na própria ferramenta depois do download (link do Reel já preenchido via `?link=` na calculadora, evento tool_cta_click). Ferramenta aceita links instagram.com/share/... (resolve o redirect).
- Canônicas erradas (Google aponta 747live.bet/747ph.live) em /baixar-reels-hd, /como-funciona, /sobre: herança do domínio expirado; reenviadas ao Rapid URL Indexer (modo barato, projeto 1269423, 21/10). Se persistir em 2 semanas, trocar slugs.
