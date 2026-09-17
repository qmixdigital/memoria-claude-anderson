---
name: Portas e sites na VPS opengravity
description: Mapa de portas dos processos Next.js/Node no servidor opengravity para evitar conflitos
type: reference
originSessionId: 068f5f9b-9c1e-4381-9736-c4a7e1db844b
---
## VPS opengravity — Portas em uso

**IP**: 77.37.69.175
**Acesso**: `ssh opengravity`
**Gerenciador**: PM2 + Nginx (via Hestia CP)
**User**: root

### Mapa de portas (atualizado 2026-04-11)

| Porta | Processo PM2 | Diretório | Domínio |
|-------|--------------|-----------|---------|
| 3000 | coe | `/home/qmix/web/coegoiania.com.br/nextjs/.next/standalone` | coegoiania.com.br |
| 3001 | tendencias | `/var/www/tendenciasmarketing` | tendenciasmarketing.news |
| **3002** | **enjai** (A) | **`/var/www/enjai`** | **enjai.com.br** |
| 3003 | joelho | `/var/www/cirurgiadojoelhogoiania` | cirurgiadojoelhogoiania.com |
| 3004 | revistamsaude | `/var/www/revistamsaude` | revistamsaude.com.br |
| 3005 | qmix-next | `/var/www/qmix-next/.next/standalone` | qmix.com.br |
| 3007 | dr-henrique-bufaical | `/var/www/dr-henrique-bufaical` | drhenriquebufaical.com.br |
| 3010 | opengravity | `/opt/opengravity` | opengravity (interno) |
| **3011** | **enjai-b** (B) | **`/var/www/enjai`** | **enjai.com.br (load balance)** |

### Portas livres (escolher para novos sites)

3006, 3008, 3009, 3012-3099

### Regras CRÍTICAS antes de mexer em qualquer processo

1. **SEMPRE verificar `ss -tlnp | grep :PORTA`** antes de iniciar qualquer processo
2. **NUNCA usar `pkill -f 'next-server'`** — mata todos os sites da VPS ao mesmo tempo
3. **NUNCA usar `fuser -k PORTA/tcp`** sem antes ver qual processo está na porta
4. `pm2 delete NOME` + `pm2 save` é o jeito seguro de remover um processo
5. Se precisar de uma porta, escolher uma da lista "livres" acima

### Comandos seguros para descobrir qual site é qual porta

```bash
# Ver quem está em cada porta do range 30xx
ss -tlnp | grep -E ':30[0-9]{2}'

# Descobrir a qual site um PID pertence
tr '\0' '\n' < /proc/PID/environ | grep '^name='
readlink /proc/PID/cwd

# Ver config nginx do enjai
cat /home/qmix/conf/web/enjai.com.br/nginx.ssl.conf
```

### Arquitetura do enjai (zero-downtime)

- 2 instâncias em `fork` mode: `enjai` (3002) + `enjai-b` (3011)
- Nginx com upstream `enjai_backend` + failover (`proxy_next_upstream`)
- Config PM2: `/var/www/enjai/ecosystem.config.cjs`
- Config Nginx: `/home/qmix/conf/web/enjai.com.br/nginx.ssl.conf`
  - (symlinked de `/etc/nginx/conf.d/domains/enjai.com.br.ssl.conf`)
- Deploy: `bash /var/www/enjai/scripts/deploy.sh` (reinicia A, espera, reinicia B)
- Cron do enjai: backup, retry-erros, reconciliar-pix, check-smm-status, sync-smm

### Incidentes históricos com portas

- **2026-04-10**: Tentativa de subir enjai-b na porta 3003 (já ocupada pelo joelho) causou vários restarts em cascata. Solução: usar 3011.
- **2026-04-09/10**: Múltiplas tentativas de deploy do enjai com porta errada (3000, 3006) causaram ~30 min de downtime total. Solução: porta correta é **3002**.
