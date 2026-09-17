---
name: pm2-opengravity-pattern
description: "Padrão obrigatório de PM2 entry para Next.js em opengravity - next start direto, nunca npm start (mascara crash)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

# PM2 pattern para Next.js no opengravity

**Regra:** todo Next.js no opengravity deve usar `next start -p PORT` direto, NUNCA `npm start`.

**Por quê:**
Quando o entry usa `npm start`, a hierarquia é `pm2 → npm (wrapper) → sh -c → next-server`. Se o `next-server` crashar (ex.: EADDRINUSE porque a porta no `.env` está faltando e cai pro default 3000 já ocupada), o pai `npm` continua vivo com 14MB de RAM. PM2 reporta "online" e logs ficam vazios — falha invisível.

Incidente confirmado em 2026-06-02: `cirurgiadojoelhogoiania.com` mostrava "Coming Soon" há semanas porque o `npm start` mascarava o crash do Next no EADDRINUSE 3000 (ocupada pelo PM2 `coe`).

**Padrão correto:**
```bash
# .env do app DEVE ter PORT explícito:
echo "PORT=3009" >> /var/www/dominio/.env

cd /var/www/dominio
PORT=3009 pm2 start node_modules/next/dist/bin/next --name dominio -- start -p 3009
# Se precisar NODE_OPTIONS, exportar antes do pm2 start:
NODE_OPTIONS=--no-deprecation PORT=3009 pm2 start node_modules/next/dist/bin/next --name dominio -- start -p 3009
pm2 save
```

**Após criar entry, configurar nginx via Hestia:**
```bash
# 1. Criar template (se ainda não existe):
TPL=/usr/local/hestia/data/templates/web/nginx
sed 's/127\.0\.0\.1:3000/127.0.0.1:PORTA/g' $TPL/nextjs-3000.tpl > $TPL/nextjs-PORTA.tpl
sed 's/127\.0\.0\.1:3000/127.0.0.1:PORTA/g' $TPL/nextjs-3000.stpl > $TPL/nextjs-PORTA.stpl
cp $TPL/nextjs-3000.sh $TPL/nextjs-PORTA.sh

# 2. Aplicar ao domínio:
v-change-web-domain-proxy-tpl USER DOMAIN nextjs-PORTA
v-rebuild-web-domain USER DOMAIN
systemctl reload nginx
```

**Detectar PM2 órfão (npm wrapper sem next escutando):**
- `pm2 list` mostra app online com ~14MB de RAM
- `ss -tlnp` não tem o PID do app escutando porta nenhuma
- `pm2 logs <app> --lines 30` vazio
- Filhos via `pgrep -P <pid>` mostram só `sh -c "next start"` em vez de `next-server`

**Apps padronizados em 2026-06-02** (opengravity): `joelho`, `tendencias`, `dr-henrique-bufaical`, `setorenergetico`, `notebookx`. Todas as outras entries do PM2 do opengravity também devem seguir esse padrão — auditar antes de assumir.
