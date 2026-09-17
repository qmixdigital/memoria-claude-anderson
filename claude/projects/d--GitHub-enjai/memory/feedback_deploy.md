---
name: Deploy ENJAI - regras críticas
description: Regras para deploy do enjai.com.br na VPS opengravity - portas, PM2, Nginx, cuidados
type: feedback
originSessionId: 068f5f9b-9c1e-4381-9736-c4a7e1db844b
---
> ⚠️ DESATUALIZADO desde 2026-06-16: enjai (e portuga) **MIGRARAM** para o servidor `srv1166087` (alias SSH `hostinger-vps-srv1166087`). NOVAS portas enjai: **3024/3025** (não 3002/3011). `/var/www/enjai` lá **NÃO é repo git** e **não há** `/root/deploy-enjai.sh`. Ver [project_migracao_enjai_srv1166087](project_migracao_enjai_srv1166087). O conteúdo abaixo refere-se ao servidor ANTIGO (opengravity/srv1000825), que hoje só tem skipark.

NUNCA mudar porta, modo PM2 ou configuração de processo sem antes verificar [reference_servidor_opengravity.md](reference_servidor_opengravity.md).

**Why:** Várias tentativas de mexer na configuração do enjai (cluster mode, portas erradas, pkill genérico) causaram horas de downtime em um único dia. O Next.js `next start` não suporta cluster mode do PM2. Outras portas na VPS pertencem a outros sites e não podem ser usadas.

**How to apply:**

### Arquitetura atual (zero-downtime)
- 2 instâncias em fork mode: `enjai` (porta **3002**) + `enjai-b` (porta **3011**)
- Nginx faz load balancing entre as 2 portas com failover automático
- Config PM2: `/var/www/enjai/ecosystem.config.cjs`
- Config Nginx: `/home/qmix/conf/web/enjai.com.br/nginx.ssl.conf`

### Deploy correto (zero-downtime)
```bash
ssh opengravity "bash /var/www/enjai/scripts/deploy.sh"
```
O script faz: git pull → npm install → prisma generate → npm run build → restart enjai → wait → restart enjai-b. Durante o deploy, Nginx redireciona pra instância ativa.

### Proibições absolutas
- NUNCA usar cluster mode com Next.js (não funciona)
- NUNCA usar `pkill -f 'next-server'` — mata todos os sites da VPS
- NUNCA usar `fuser -k PORTA/tcp` sem verificar qual processo está na porta
- NUNCA mudar porta sem consultar reference_servidor_opengravity.md
- NUNCA fazer deploy sem verificar que `ls .next/BUILD_ID` existe após build (se ESLint falhar, o build não gera `.next` e o site cai)

### Cuidados
- Antes de QUALQUER mudança: `pm2 list`, `ss -tlnp | grep PORTA`, `pm2 show NOME`
- Quando um deploy derrubar o site: verificar output completo do `npm run build` (erros de ESLint/TypeScript bloqueiam o build)
- PM2 auto-restart reinicia processos quando crash — não entrar em pânico se vir restart count
- Backup do Nginx antes de qualquer mudança: `cp arquivo arquivo.bak-$(date +%s)`
