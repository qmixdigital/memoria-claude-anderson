# Memory Index

## Project
- [project_smm_duplicacao_504.md](project_smm_duplicacao_504.md) — Auditoria: pedido duplicou por HTTP 504 do painel + retry cego; correção PENDENTE de decisão (não mexer ainda)
- [project_migracao_enjai_srv1166087.md](project_migracao_enjai_srv1166087.md) — ⚠️ 2026-06-16 enjai+portuga MIGRARAM p/ srv1166087 (alias hostinger-vps-srv1166087); portas enjai agora 3024/3025; /var/www/enjai NÃO é git; opengravity só tem skipark

- [project_vip_tiers.md](project_vip_tiers.md) — Programa VIP padronizado nos 3 sites (2026-06-17): Bronze 3/3%, Silver 5/5%, Gold 10/10%; ConfigVip lido ao vivo (sem deploy); pendente: e-mail avisando cliente que é VIP

- [project_login_gate_ferramentas.md](project_login_gate_ferramentas.md) — 2026-08-04 login Google trava as 27 ferramentas grátis nos 4 sites (bloqueia bots + captura lead); admin /admin/usuarios-ferramentas filtra "nunca comprou" + CSV; relatório diário Telegram 06:00 BRT

- [project_resend_dominios.md](project_resend_dominios.md) — Resend = 1 conta p/ 4 sites (Pro 50k/mês); portuga+skipark tinham e-mail QUEBRADO (domínio não verificado) → corrigido via Cloudflare API 2026-08-04; truenet ainda pendente

- [project_fluxos_email.md](project_fluxos_email.md) — 3 fluxos automáticos de e-mail (pós-entrega, lead ferramenta, win-back 2+ pedidos) via Resend, cron diário 11:30 BRT nos 3 sites; tabela EmailFluxo; implantado 2026-09-11 (autorização total); enjai perdeu 99% do orgânico no Spam Update ago/2026
- [project_campanha_app_lancamento.md](project_campanha_app_lancamento.md) — Campanha e-mail "app chegou" (10%+7d, Resend) — portuga OK 637 envios 2026-08-21; replicar truenet/skipark/enjai; script /tmp/camp/campanha_app.py
- [project_campanha_reativacao.md](project_campanha_reativacao.md) — EM CONSTRUÇÃO: campanha cupom 30% (link único, compra única) p/ ~4.309 clientes que compraram 1x; funil→2ª campanha p/ 2 compras; VIP fica em 3 pedidos (opção A); disparo via API transacional + descadastro próprio

## Feedback
- [feedback_language.md](feedback_language.md) — Responder sempre em português (PT-BR)
- [feedback_deploy.md](feedback_deploy.md) — Deploy enjai: portas 3002+3011 (zero-downtime), NUNCA cluster mode, sempre verificar portas antes de mexer
- [feedback_deploy_use_script.md](feedback_deploy_use_script.md) — SEMPRE usar /root/deploy-enjai.sh (NUNCA git pull + npm build + pm2 reload manual) — site sai do ar com erro client-side
- [feedback_deploy_git_pull_first.md](feedback_deploy_git_pull_first.md) — ANTES de rodar deploy script, git pull em /var/www/enjai (ou skipark) — script sincroniza LIVE→BUILD e não puxa do GitHub
- [feedback_deploy_prisma_generate.md](feedback_deploy_prisma_generate.md) — Schema Prisma no srv1166087: CLI crasha (Node18+Prisma7); gerar client LOCAL + copiar .prisma/client (WASM, platform-indep) + aplicar coluna via psql direto
- [feedback_seo_loja_vs_plataforma.md](feedback_seo_loja_vs_plataforma.md) — Em ecommerce SMM: sempre "loja" (nunca "plataforma"/"app"/"sistema") — Google prioriza lojas em buscas transacionais "comprar X"
- [feedback_seo_keyword_principal_home.md](feedback_seo_keyword_principal_home.md) — Cada home/landing deve ter UMA keyword principal dominando title/H1/description — não misturar múltiplas no mesmo peso (ex: home SkiPark = "comprar seguidores")
- [feedback_redesign_enjai.md](feedback_redesign_enjai.md) — Sites SMM são dark-first (branco translúcido some no claro); usar tokens de tema; direção enjai = claro/minimalista/confiante
- [feedback_no_emojis.md](feedback_no_emojis.md) — NUNCA usar emoji em nada voltado ao público (UI, páginas, e-mails); considera amador. Usar tipografia/cor/SVG. Limpar peças já feitas com emoji.
- [feedback_design_alinhamento.md](feedback_design_alinhamento.md) — Hero/CTA/seções sempre alinhados à esquerda (desktop + mobile). Centralização gera sensação de desorganização

## Reference
- [reference_truenet_infra.md](reference_truenet_infra.md) — TrueNet = clone do enjai no srv1166087 (portas 3042/3043, banco truenet-postgres:5437, Cloudflare zone+token, deploy-truenet.sh)
- [reference_landing_page_3_sites.md](reference_landing_page_3_sites.md) — Workflow p/ criar landing de keyword nos 3 sites (design nb-* compartilhado, slugs iguais, mín 100, sitemap+link manual, deploy base64→script)
- [reference_deploy_skipark.md](reference_deploy_skipark.md) — Deploy SkiPark: editar/commitar DIRETO na VPS (portas 3013/3014), push GitHub é read-only, repos locais têm remote errado
- [reference_servidor_opengravity.md](reference_servidor_opengravity.md) — Mapa de portas de TODOS os sites na VPS opengravity (consultar SEMPRE antes de mexer em processos)
- [reference_api_social.md](reference_api_social.md) — API Instagram <<REMOVIDO>> (endpoints, chaves, onde é usada)
- [reference_validacao_reels_video.md](reference_validacao_reels_video.md) — Causa raiz tickets Reels: link /p/ (foto/carrossel) em produto de vídeo falha 52% no painel; validação via post_info (media_type)
- [reference_tickets_regras.md](reference_tickets_regras.md) — Tickets exigem pedido válido + anti-duplicata por pedido (anexa ao aberto); anônimo valida só pelo número; deploy usa `next build` direto (npm run build quebra no Node 18)

- [reference_dominios_sites.md](reference_dominios_sites.md) — Domínios reais: portuga = portugaldigital.com.br (não portuga.com.br); enjai/truenet/skipark = *.com.br

## Reference (novo)
- [reference_bug_upsell_subscription.md](reference_bug_upsell_subscription.md) — Bug corrigido 2026-08-15: upsell adicionava produto de assinatura (posts futuros) sem dados obrigatórios → cobrava e falhava no painel; fix #1 (upsell coleta) + #2 (guard checkout) em portuga/enjai/truenet; skipark já desativava
- [project_app_pwa.md](project_app_pwa.md) — App PWA instalável (barra topo + cupom 10% ao instalar/abrir + SW/offline + push + avisos Telegram) — completo no truenet 2026-08-21, replicar nos outros 3
