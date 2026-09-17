---
name: project_app_pwa
description: "App PWA instalável (barra topo + cupom 10% ao abrir + SW/offline + push + avisos Telegram) — NOS 4 SITES desde 2026-08-21, cada um na sua paleta/bot/VAPID + fuso São Paulo"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-09-02T09:41:49.492Z
---

**REPLICADO NOS 4 SITES 2026-08-21** (truenet piloto → enjai/portuga/skipark). Cada site: sua paleta (enjai azul #5B7FFF, portuga teal #14B8A6, truenet teal, skipark cyan/aurora #00F0FF theme dark #0B0F1A), seu bot Telegram (.env), suas chaves VAPID, fuso America/Sao_Paulo (setar TZ via `export TZ=...; pm2 restart <app> --update-env` — reload sozinho lê env UTC do daemon). skipark usa design "aurora" sem `--brand` → precisou bloco compat no globals.css mapeando --brand/--surface/etc + patch de header próprio (className `sticky top-0 z-50 glass border-b border-white/5`).

**App/PWA dos sites SMM (piloto completo no truenet 2026-08-21; replicar em enjai/portuga/skipark).** Cliente "baixa" o site como app (Add to Home Screen). Evita lojas (política proíbe app de vender seguidores) — PWA foge disso.

**Componentes (todos em `/var/www/truenet`):**
- `app/manifest.ts` (já existia) + ícones `public/icon-192/512/maskable.png` (já existiam) → instalável.
- `public/sw.js` (v2): cacheia SÓ estáticos (`/_next/static`, imagens, fontes) → app abre rápido; páginas/API = network-first (preço/checkout sempre fresco); fallback `public/offline.html`; handlers de push.
- `components/shared/InstallBar.tsx`: **barra topo full-width** "💲(cifrão dourado) Baixe o app e ganhe 10% OFF" + botão Instalar + ✕. Só mobile, some se instalado/dispensado (7d). No layout está dentro de `<div sticky top-0 z-50>` que envolve InstallBar + Header (grudam juntos); o Header perdeu o próprio `sticky top-0`; safe-area (notch) foi pro wrapper.
- `components/shared/AppWelcome.tsx`: ao abrir o app **instalado** (display-mode standalone), concede o cupom 1x (flag `tn_app_coupon_v1`) via `POST /api/app/cupom` + toast "Ganhou 10%... válido 7 dias". **Critério = abrir o app instalado** (Opção B), não o toque — resolve pegadinha do iOS (storage do PWA ≠ Safari).
- `components/shared/PushOptin.tsx`: só no app instalado, após 12s pede "Ativar avisos" → `pushManager.subscribe` (VAPID) → `POST /api/app/push/subscribe`.

**Cupom (reusa CupomReativacao):** `/api/app/cupom` cria cupom token `app-...`, `email=""`, 10%. **DESDE 2026-09-02 o desconto do app é PERMANENTE e SOMA com VIP** (antes era one-time 7 dias): `expiraEm=null`, nunca marcado `usado`; a rota "cura" cupons antigos (usado/expiraEm→null); cookie `promo_reativacao` 1 ano; AppWelcome revalida a cada abertura do app. Checkout: cupom `app-` bypassa usado/expiração e **empilha** com VIP (`percentDesc = min(vipPercent + 10, 90)`), enquanto cupom de reativação (não-app) continua "prevalece o maior". `processar-pagamento` NÃO queima `app-` (`UPDATE ... AND "token" NOT LIKE 'app-%'`). Arquivos: checkout/route.ts, lib/processar-pagamento.ts, app/api/app/cupom/route.ts, components/shared/AppWelcome.tsx. Truenet NÃO tinha o sistema de cupom (0 vendas) → foi trazido junto (schema+checkout+payment, âncoras batem). Coluna `expiraEm` foi adicionada em CupomReativacao (cuidado: CacheInstagram já tinha `expiraEm`, patch ingênuo erra o model).

**Push:** lib `web-push` + `@types/web-push` instalados; chaves VAPID no `.env.local` (VAPID_PUBLIC/PRIVATE/SUBJECT + NEXT_PUBLIC_VAPID_PUBLIC). Tabela `PushSubscription`. `lib/push.ts` (enviarPush + broadcast, remove inscrição morta 404/410). `POST /api/app/push/enviar?secret=CRON_SECRET` {title,body,url,email?} = broadcast p/ mandar promo. SW mostra a notificação.

**Avisos Telegram (bot próprio do site, `enviarAlerta`):** adicionadas categorias `app-instalado` (📲) e `app-venda` (🛒) em `lib/telegram-notifier.ts`. Aviso de instalação dispara em `/api/app/cupom` ao criar cupom novo; aviso de venda dispara em `processarPagamentoConfirmado` quando o pedido usou cupom `app-%`.

**Relatório diário** (`/root/relatorio-ferramentas.sh`) ganhou seção 📱 App (instalações via cupom + quantas viraram compra) — só mostra site com >0.

**Alerta de entrega pelo app (2026-08-21):** e-mail de entrega JÁ existia (`enviarEmailEntregaIniciada` + `enviarEmailEntregaConcluida`, disparados pelo cron `check-smm-status` + `verificar-smm`/`sincronizar-smm`). Adicionado: (1) `components/shared/EntregaAlertaCTA.tsx` na página `/pedido/[id]` (após `<PedidoPix/>`) — fora do app convida instalar (reusa `openInstallHelp`), dentro do app liga a inscrição de push ao e-mail do pedido e/ou oferece "Ativar aviso"; só aparece com pedido pago. (2) push de entrega via `broadcast(payload, pedido.emailCliente)` — o `lib/push.ts` JÁ tinha broadcast com filtro por e-mail — inserido nos 4 pontos de entrega (check-smm iniciada+concluída, verificar-smm, sincronizar-smm), best-effort `.catch`. (3) bloco "📲 Baixe o app" nos e-mails de **pagamento confirmado** + **entrega iniciada** (não no concluída — ali já foi entregue). Anchor robusto = `${gerarTabelaItens(pedido)}` escopado por função (enjai/truenet usam `${vipBlocoEmailHtml(msgVip,SITE_URL)}`, portuga/skipark usam `montarMensagemVip` inline). Vínculo push→email: `subscribe` route já aceita/guarda `email`; a CTA reenvia a inscrição com o e-mail do pedido.

⚠️ Divergência que quebrou o build só do portuga: a página `pedido/[id]/page.tsx` do **portuga** importa o PedidoPix via `nextDynamic(() => import("./PedidoPix")...)`, enquanto enjai/truenet/skipark usam `import { PedidoPix } from "./PedidoPix"`. Patch que ancora no import estático NÃO adiciona o import no portuga → componente inserido fica "not defined" → `Failed to compile` (build não gera `.next/BUILD_ID`, deploy aborta antes do reload e dispara telegram_err "Deploy portuga FALHOU"). Sempre validar o build/import por site. Deploy srv1166087 builda em `/var/www/<site>-build` e faz swap atômico do `.next`; conferir chunk no dir `-build`, não no LIVE.

**Divulgação no site (2026-09-02, nos 4):** página **/aplicativo** ("Por que baixar o nosso app": 10% que soma com VIP + link /vip, praticidade, aviso de entrega, segurança contra golpes) — server component, tokens de tema, ícones SVG, SEM emoji (ver [[feedback_no_emojis]]). **AppVipBanner** (faixa na home após o hero, some em standalone) → botão abre tutorial. **StickyBottomBar** (barra fixa de rodapé, conteúdo vem do banco via /api/banner): lado esquerdo agora "Baixe o app e ganhe descontos" → /aplicativo; contraste no tema claro corrigido no COR_MAP (texto branco no azul; lado "black" com fundo #0B1020 fixo). portuga/skipark tinham `Banner` vazio → banner criado (INSERT); truenet tinha links apontando pra enjai.com.br → corrigido pra /aplicativo e /afiliados. `components/loja/InstalarAppButton.tsx` (client) reusa openInstallHelp. **/vip voltou a ser SÓ programa de fidelidade** (eu tinha misturado o desconto do app nela e confundiu; separado). PENDENTE: limpar emojis de InstallBar (cifrão), AppWelcome (🎉), InstallHelp (📲⬇️➕).

Ver [[project_campanha_reativacao]] (mesmo mecanismo de cupom) e [[reference_bug_upsell_subscription]].
