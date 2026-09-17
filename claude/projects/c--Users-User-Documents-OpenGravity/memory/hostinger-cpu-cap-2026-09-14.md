---
name: hostinger-cpu-cap-2026-09-14
description: "Hostinger limitou a opengravity a 20% de CPU (steal 90%) em 14/09/2026 apos 7h em 100%; sintomas, causa (rastreadores de IA em Next.js), o que foi blindado e o que NAO fazer (reboot)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-09-14T12:27:05.485Z
---

**Sintoma:** de dentro da VPS, `vmstat`/`top` mostram steal ~90%, load 40-85,
Postgres "canceling authentication due to timeout", smoke tests HTTP 000/103,
monitor do bot acusando dezenas de sites "aborted" (e o monitor roda DE DENTRO
da VPS, entao e falso). Hostinger chama de "limite de CPU": corta a VM para 20%.

**Causa:** 2 vCPU para 14 apps Next + Postgres + MySQL + Hestia + 2,9 GB em
swap. Em 13/09 20:00 o uso foi a 100% e ficou 7h; o maior contribuinte unico
era o ClaudeBot (216.73.216.0/24) a 20 mil paginas dinamicas/h no
consultarimovel. Nao era malware (checado) nem um processo unico.

**Regras da Hostinger (agente deles, 14/09):** limite sai sozinho "em ate 3h"
com uso normal (nao saiu em 9h); reset manual = 1 por semana; suporte pode
remover "por cortesia". **Reboot NAO tira o limite** e ainda custou uma 2a
perda da lista do PM2 (dump parcial no shutdown do hPanel).

**Blindado em 14/09/2026:**
- Cloudflare "Block AI bots" (`ai_bots_protection=block`) em 11 zonas da conta
  master (revistamsaude, geladeirastop, arcondicionadotop, consultarimovel,
  notebookx, peritodicas, ebookcult, certificadodigital, euvo, tendencias,
  desassossegada). Script: scratchpad cf_ai_bots.py (tokens em
  D:/SISTEMAS/Cloudflare/contas.json). skipark (conta3, token sem permissao) e
  consultarimovel tambem tem `if ($http_user_agent ~* "ClaudeBot|GPTBot|...") { return 429; }`
  no vhost nginx.
- Vigia de CPU no bot (src/monitor/cpu.ts, /cpu): alerta uso >= 85% por 6 min
  ou steal >= 40%.
- /opt/pm2-dump-guard.py em ExecStartPre do pm2-root: na subida escolhe o dump
  mais completo entre dump.pm2 e dump.pm2.bak (ver [[pm2-needrestart-dump-race]]).

**How to apply:** se o /cpu mostrar steal alto de novo, primeiro abrir chat da
Hostinger pedindo remocao (nao reiniciar). Raiz so resolve com mais vCPU ou
tirando apps da maquina.
