---
name: reference_nginx_ratelimit
description: "Camadas de rate limit do distribuidorasdealimentos (Cloudflare 1015, nginx 429, fail2ban) e o que já foi afrouxado para não bloquear visitante real"
metadata: 
  node_type: memory
  type: reference
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
  modified: 2026-09-19T10:27:51.819Z
---

Três camadas bloqueiam visitante do site, nesta ordem:

1. **Cloudflare rate limit** (regra `6a65d52b88f249898594e1097d9ce815` no ruleset `4878f67c969c4d31aca0ab841b43b4e7`, zona `fc69977f878137ae764e1048570223e8`): erro **1015**. Conta por `ip.src + colo`, só `http.request.uri.path` é permitido no plano free (query e headers dão "not entitled"). Em 19/09/2026 subiu de 200 para **600 req/10s**, ban 10s. Estáticos, `/uploads/`, `/sitemaps/`, `/api/clicks` não contam. Token válido em `D:/SISTEMAS/Cloudflare/contas.json` (conta `75a81880f2e1e1a7300ef71d7a4bc4e1`).
2. **nginx `limit_req` zona `nextjs_rl`** (`/etc/nginx/conf.d/00-nextjs-ratelimit.conf`, 20 r/s, compartilhada por ~18 apps Next.js): erro **429**. Em 19/09/2026 o mapa `$rl_uri` passou a isentar `?_rsc=` (prefetch do App Router: cada `<Link>` visível dispara um), `/api/clicks` e `/sitemaps/`; `burst` do distribuidoras.conf foi de 10 para 30.
3. **fail2ban jail `nginx-limit-req`**: 40 respostas 429 em 300 s = ban de 900 s (e `recidive` por cima). Com a isenção do prefetch, o 429 quase não acontece para navegador.

**Why:** Anderson foi bloqueado (1015) duas vezes navegando normalmente (12/09 e 19/09/2026). O que estourava não era página, era o prefetch: uma listagem de cidade tem 100+ links e cada um vira um request `?_rsc=`. IP de operadora móvel (CGNAT) soma vários usuários no mesmo contador.

**How to apply:** antes de apertar qualquer camada, lembrar que o prefetch multiplica requests por 5 a 10. Se voltar a bloquear, checar as três camadas (CF ray ID = camada 1; 429 = camada 2; 403/timeout de 15 min = camada 3, `fail2ban-client status nginx-limit-req`). Nunca contar bots do Google (mapa `$rl_ua`).
