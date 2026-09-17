---
name: site-healthcheck
description: "Sistema de healthcheck dos sites da rede - bot Telegram em opengravity:/opt/opengravity, lista em sites_monitorar.txt, detecta down/placeholder/timeout"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

# Sistema de healthcheck da rede

Bot Node/Telegram rodando como PM2 `opengravity` em `/opt/opengravity/` (server VPS opengravity).

**Componentes:**
- `sites_monitorar.txt` — lista de domínios (167 sites em 2026-06-02)
- `src/monitor/sites.ts` — checker (GET + análise de título)
- Notifica via Telegram para o ID `<<REMOVIDO>>` quando site cai/volta
- Intervalo: 5 minutos
- Threshold: 2 falhas consecutivas (10min) para down/placeholder; 4 falhas (20min) para erros transientes (429/502/503/timeout)

**O monitor detecta:**
- Status HTTP fora de 2xx/3xx
- Páginas placeholder por título (regex): "Coming Soon", "Welcome to nginx", "Apache2 Ubuntu Default", "Index of /", "Under Construction", etc.
- Corpo extremamente pequeno (<200b) com status 200
- HTTP 403 é IGNORADO (Cloudflare WAF bloqueia headerless checks — sites estão de pé)

**Para adicionar um site ao monitor:**
```bash
echo "novo-dominio.com.br" | ssh opengravity 'cat >> /opt/opengravity/sites_monitorar.txt && sort -u -o /opt/opengravity/sites_monitorar.txt /opt/opengravity/sites_monitorar.txt'
```
Não precisa restart — o monitor relê o arquivo a cada ciclo.

**Para alterar lógica:** editar `src/monitor/sites.ts`, rodar `npm run build` e `pm2 reload opengravity --update-env`.

**Comando Telegram:** `/sites` chama `checkAllSitesNow()` para verificação on-demand. Implementação em [[reference_telegram_bot]].
