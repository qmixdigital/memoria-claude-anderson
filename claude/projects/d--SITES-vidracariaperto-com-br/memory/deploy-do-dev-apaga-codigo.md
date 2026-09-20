---
name: deploy-do-dev-apaga-codigo
description: Em 24/08/2026 um deploy do desenvolvedor a partir de copia local apagou todo o trabalho no vidracarias E no marmorarias; sempre conferir os dois sites depois de qualquer deploy dele
metadata: 
  node_type: memory
  type: project
  originSessionId: 99225f21-7fb2-4edb-8360-cb8792667b39
  modified: 2026-09-18T16:06:58.239Z
---

Em 24/08/2026 o desenvolvedor dos diretorios (vidracariaperto, marmorariasperto,
personalverificado, VPS clinicas-vps) fez deploy de uma copia local antiga e apagou
todo o codigo que eu tinha subido em 22/08 nos DOIS sites. No vidracarias eu notei e
recuperei no mesmo dia (app-prev). No marmorarias so descobri em 18/09/2026, 25 dias
depois, e tive que reescrever tudo (entrega de lead por e-mail, confirmacao por e-mail
do CNPJ, descadastro, webhook Resend, informar erro, menu celular, porta de entrada).

**Why:** a copia local dele nao e clone do repo do servidor; cada deploy dele sobrescreve
o que esta no servidor. Os dois sites sao irmaos e ele mexe nos dois no mesmo dia.

**How to apply:** quando um site da rede aparecer sem alguma funcionalidade minha,
conferir imediatamente os sites irmaos no mesmo servidor (`ls src/lib/` procurando
distribuicao.ts / confirmacao.ts). Os apps agora tem Git com auto-commit no deploy.sh
(`git log` mostra o que havia). Codigo-fonte reescrito em 18/09 esta documentado em
D:\SITES\marmorariasperto.com.br\FUNCIONALIDADES.md. Ver [[vps-clinicas-npm-pendura]].
