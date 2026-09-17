---
name: Deploy ENJAI/SkiPark exige git pull no LIVE antes do script
description: Antes de rodar /root/deploy-enjai.sh ou /root/deploy-skipark.sh, fazer git pull em /var/www/enjai e /var/www/skipark — o script sincroniza LIVE→BUILD e não puxa do GitHub
type: feedback
originSessionId: 068f5f9b-9c1e-4381-9736-c4a7e1db844b
---
Antes de chamar `/root/deploy-enjai.sh` (ou `/root/deploy-skipark.sh`), rodar `git pull` em `/var/www/enjai` (ou `/var/www/skipark`) na VPS opengravity.

**Why:** O deploy script faz `rsync LIVE → BUILD` (com `--exclude=.git`) e roda `next build` no BUILD. Ele NÃO faz `git pull`. Se o LIVE estiver no commit antigo, o deploy recompila o código antigo e a alteração nunca chega em produção — o usuário vai limpar cache do Cloudflare várias vezes em vão. Aconteceu em 2026-04-27 com o commit dos botões verdes #00A63E.

**How to apply:** Para deploy de mudanças commitadas no GitHub, sempre rodar nesta ordem:
```bash
ssh opengravity 'cd /var/www/enjai && git pull'
ssh opengravity 'bash /root/deploy-enjai.sh'
```
Mesmo padrão para SkiPark (`/var/www/skipark` + `/root/deploy-skipark.sh`).
