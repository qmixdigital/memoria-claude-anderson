---
name: Deploy NUNCA pode derrubar o site
description: OBRIGATÓRIO fazer build sem deletar .next atual. NUNCA usar rm -rf .next antes do build. O site fica fora durante o build inteiro.
type: feedback
---

REGRA ABSOLUTA: NUNCA fazer deploy que tire o site do ar.

**O ERRO que estava acontecendo:** Deletar `.next` ANTES do build (`rm -rf .next && npm run build`). Durante os 15-20 segundos do build, o servidor não tinha arquivos para servir = 502.

**Processo CORRETO de deploy:**
```bash
# 1. Build (NÃO deletar .next antes — o build sobrescreve automaticamente)
npm run build

# 2. Copiar assets para standalone
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -r public/* .next/standalone/public/
cp -r .next/static/* .next/standalone/.next/static/
cp config.json .next/standalone/config.json

# 3. Reload graceful
pm2 reload qmix-next
```

**PROIBIDO:**
- `rm -rf .next` antes do build
- `pm2 restart` (mata processo imediatamente)
- `pm2 delete + start` (downtime total)
- Qualquer ação que mate o processo ou delete arquivos antes do novo estar pronto

**Why:** Clientes comprando no site reclamam e param de comprar. Cada segundo fora do ar é prejuízo financeiro direto.
