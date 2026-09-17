---
name: Deploy ENJAI SEMPRE via script oficial da VPS
description: Deploys no ENJAI/SkiPark devem usar /root/deploy-enjai.sh (não git pull + build manual) para evitar janela de chunks inconsistentes que causa client-side error
type: feedback
originSessionId: 068f5f9b-9c1e-4381-9736-c4a7e1db844b
---
Nunca deployar ENJAI (ou SkiPark) com `git pull + npm run build + pm2 reload` manual direto em `/var/www/enjai`. Isso já causou site fora do ar em 2026-04-21 com erro "Application error: a client-side exception" visível para clientes fazendo compra.

**Por que quebra:** `npm run build` direto em `/var/www/enjai/.next` sobrescreve chunks enquanto o processo antigo ainda serve HTML. Clientes que carregaram HTML antigo tentam buscar chunks com hash novo → 404 → exception. `sleep 3` entre os dois `pm2 reload` é insuficiente (Next.js leva 10-15s para bootar).

**Como deployar corretamente (SEMPRE):**
```bash
ssh opengravity "bash /root/deploy-enjai.sh"
```

O script faz tudo certo automaticamente:
1. Backup com rotação (10 últimos em `/root/backups/enjai-*`)
2. Sincroniza `/var/www/enjai` → `/var/www/enjai-build` (staging)
3. `npm run build` em staging (LIVE continua servindo normal)
4. Troca atômica: `mv .next .next.old && cp -a build/.next live/.next`
5. `pm2 reload enjai --update-env` + `sleep 5`
6. `pm2 reload enjai-b --update-env` + `sleep 3`
7. Smoke test `/api/health` nas duas portas (3002 e 3011) — falha = rollback
8. Telegram notify

**Para SkiPark:** existe script análogo em `/root/deploy-skipark.sh` (mesmas regras).

**Como aplicar:** após cada `git push origin main`, em vez de `ssh opengravity "cd /var/www/enjai && git pull && npm run build && pm2 reload ..."`, usar `ssh opengravity "bash /root/deploy-enjai.sh"` (o script faz `git pull` internamente via rsync do staging — se não fizer, adicionar `cd /var/www/enjai && git pull && bash /root/deploy-enjai.sh`).

**Why:** zero-downtime real em produção com clientes fazendo compra — qualquer janela de instabilidade vira reembolso ou cliente perdido.
