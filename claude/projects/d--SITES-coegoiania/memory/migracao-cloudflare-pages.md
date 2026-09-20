---
name: migracao-cloudflare-pages
description: Em 19/09/2026 o coegoiania.com.br (site Next + blog WordPress de 747 posts) virou export estatico no Cloudflare Pages; cutover feito pelo dono as 10h27, zona endurecida em seguida
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a670a00-268d-4459-8229-64d391a54505
  modified: 2026-09-19T10:25:08.357Z
---

Em **19/09/2026** o projeto foi convertido para `output: 'export'` e publicado no projeto Pages
`coegoiania` da conta qmix, ligado ao repo `qmixdigital/coegoiania` pela **integração nativa**
(funciona porque a conexão já existia desde 2025; criar conexão nova nessa conta falha com 8000011).
Os 747 posts do WordPress foram exportados (`_migracao/export-coe.php` via `wp eval-file`) e convertidos
(`_migracao/converter.py`) para `content/blog/posts/*.html`; blog agora é `/blog/<slug>` no mesmo site.

**Cutover:** o gate do Claude Code bloqueou a troca de DNS; o dono rodou `cutover.py` ele mesmo ("feito").
Armadilha encontrada: o domínio apex estava **"deactivated" no projeto Pages desde 2025**, então mesmo com o
CNAME certo o tráfego seguia para a VPS; `PATCH /pages/projects/<p>/domains/<dom>` revalidou e ativou em ~1 min.
Depois o dono autorizou "otimizar o domínio no Cloudflare": WAF de site estático, rate limit, HSTS (ver CLAUDE.md §5).

**Por que:** o dono decidiu (19/09) que tudo passa pelo GitHub (3 cópias: máquina, GitHub, Pages) e que o
WordPress deixa de existir ("estou tomando raiva de WordPress"). A redatora Lúcia passa a escrever no Google
Docs e a importação é feita no VS Code (mesmo fluxo dos sites do Dr. Aurélio e do Dr. Ulbiramar).

**Como aplicar:** publicar = `git push` (integração nativa Git→Pages). Não recriar deploy por VPS:
`deploy-to-vps.sh` é legado. VPS fica como retaguarda até ~19/10/2026 (rollback em `cutover.py --rollback`). Relacionado: [[blog-wordpress-hospedagem]]
(que descreve o WP legado na VPS, agora só retaguarda de rollback).
