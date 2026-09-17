---
name: deploy-next-pm2-par-compartilha-next
description: "Nos apps Next da opengravity, o par PM2 (app + app-b) lê o mesmo .next, então build interrompido derruba os dois; nunca canalizar o build para head/grep"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b2b0e888-aa8b-40fe-a6be-c24b08380fc3
  modified: 2026-08-18T11:59:09.887Z
---

Nos apps Next.js da VPS opengravity, as duas instâncias PM2 do padrão de zero
downtime (`app` e `app-b`) leem o **mesmo** diretório `.next`. O upstream do Nginx
protege contra crash ou reload de uma instância, mas **não** contra um build
quebrado: `npm run build` apaga o `.next` durante a compilação, então um build
interrompido derruba as duas de uma vez.

Em 18/08/2026 isso tirou o geladeirastop.com do ar por ~5 minutos: rodei
`npm run build 2>&1 | grep -E "..." | head -3 && pm2 reload ...`. O `head` fechou o
pipe assim que achou as 3 linhas, matou o `next build` no meio, e o `&&` seguiu
para o reload com `.next` sem `BUILD_ID`.

**Why:** o failover entre instâncias dá uma falsa sensação de segurança no deploy;
o ponto único de falha é o diretório de build compartilhado, não o processo.

**How to apply:** nunca canalizar `npm run build` para `head` ou qualquer coisa que
feche o pipe cedo (deixar o output completo e filtrar depois, ou redirecionar para
arquivo). Em deploy, compilar para diretório separado via
`distDir: process.env.NEXT_DIST_DIR || ".next"` no next.config e só trocar o `.next`
depois de conferir o `BUILD_ID`, como faz `/root/scripts/geladeirastop-deploy.sh`.
Vale replicar esse script nos outros pares da VPS (peritodicas, revistamsaude,
skipark, arcondicionado-top).
