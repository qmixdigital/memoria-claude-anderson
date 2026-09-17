---
name: pm2-max-memory-restart
description: Todos os PM2 entries Next.js do opengravity têm --max-memory-restart=700M para evitar OOM-kill global (8GB RAM total)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

# `--max-memory-restart=700M` no opengravity

Servidor opengravity (Hostinger 8GB) roda ~18 instâncias Next.js simultâneas. Sem limite por processo, qualquer um pode estourar e disparar **OOM killer global** do kernel — que escolhe arbitrariamente qual processo matar.

Incidente confirmado: 02/jun/2026 01:30 UTC, kernel OOM matou Next-server (1.4 GB RSS no momento). PM2 reiniciou → durante os ~5–15s de reinício, nginx retornou 502 nos requests → smoke test do enjai capturou 9 URLs como down e disparou alerta Telegram.

**Fix aplicado:** todos os 19 apps PM2 ganharam `--max-memory-restart=700M`. Quando um app atinge 700MB, **o próprio PM2** reinicia ele com graceful shutdown — não chega na pressão global do sistema, não dispara OOM-kill, não derruba outros processos.

**Resultado pós-fix:**
- Memory available: 1.8 GB → **4.1 GB**
- Memory used: 5.9 GB → **3.7 GB**  
- (Restarts liberaram ~2 GB de leak acumulado de Next-server v14/v15)

**Como aplicar em entry nova:**
```bash
pm2 restart APPNAME --max-memory-restart 700M --update-env
pm2 save
```

Ou na criação:
```bash
pm2 start node_modules/next/dist/bin/next --name APPNAME --max-memory-restart 700M -- start -p PORT
```

**Como auditar:**
```bash
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.max_memory_restart // "—")"'
```
Cada Next.js deve mostrar `734003200` (700 MB em bytes).

**Como detectar OOM histórico:**
```bash
journalctl --since "7 days ago" -k | grep -iE "killed process|out of memory"
```

Threshold escolhido (700M):
- Next.js padrão estaciona em 200–400 MB
- Picos chegam a 500–600 MB (build, sitemap, requests pesados)
- 700M dá margem mas força reinício antes do servidor inteiro sofrer
- 18 apps × 700M = 12.6 GB nominal, mas na prática soma fica em ~4–6 GB (raramente todos picam ao mesmo tempo)

Limite de 8GB total + 6GB swap dá folga suficiente. Se o servidor crescer mais, considerar upgrade pra 16GB.
