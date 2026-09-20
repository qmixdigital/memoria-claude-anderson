---
name: ssh-cofre-e-fail2ban
description: "Desde 19/09/2026 a chave SSH mora no KeePassXC (C:\\Users\\User\\Cofre\\cofre.kdbx) e vai ao agente do Windows; timeout intermitente na porta 22 das VPS Hostinger é bloqueio de IP por excesso de conexões, não credencial"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-19T23:25:18.842Z
---

**Chaves SSH no cofre (19/09/2026):** a chave privada saiu de `~/.ssh` e está no KeePassXC
(`C:\Users\User\Cofre\cofre.kdbx`). Com o cofre destravado, o KeePassXC entrega as chaves ao OpenSSH Agent
do Windows e os aliases do `~/.ssh/config` (hostinger-vps-srv1166087, opengravity…) entram normalmente.
No Bash, `ssh/scp/sftp/ssh-add` são wrappers em `~/bin` que chamam o OpenSSH do Windows; nunca chamar
`/usr/bin/ssh` direto (o ssh do Git não vê o agente).

**Antes de qualquer sequência de conexões:** `ssh-add -l`. Só 1 chave (user@GIGABYTE) = cofre trancado, pedir
ao Anderson para destravar o KeePassXC (bandeja). Aberto = 17 chaves. Com o cofre trancado cada ssh falha
com "Permission denied (publickey)" e o fail2ban conta como invasão.

**MCP "cofre"** serve só para tokens de API (Pixabay, Pexels, Cloudflare, GitHub, Runware…), nunca SSH:
`cofre_listar` e `cofre_run(comando, segredos=[...])`, cada uso pede aprovação. Registrado em escopo de
usuário; só aparece em sessão aberta depois do registro (reiniciar o Claude Code / VS Code).

**Timeout intermitente na porta 22 (Hostinger: srv1166087 e opengravity):** funciona por minutos e depois
dá `Connection timed out` por 5 a 10 min. É fail2ban / firewall da Hostinger cortando o IP depois de dezenas
de scp/ssh seguidos (aconteceu 19/09 com ~40 conexões numa tarde). O site continua no ar. Solução: mandar os
arquivos num **tar único por deploy** (ou o deploy.sh da rede) em vez de vários scp, e o Anderson colocar o IP
dele em `ignoreip` do `/etc/fail2ban/jail.local` e no firewall do hPanel (o modo automático do Claude
bloqueia mexer no fail2ban, é ele quem faz). O classificador também bloqueia listar/ler o cofre.

**Why:** perdi ~1h em 19/09 achando que era credencial ou rede; era só volume de conexões.

**How to apply:** agrupar cópias (`tar czf - arquivos | ssh host 'tar xzf - -C /var/www/app'`), uma sessão
ssh por deploy, e checar `ssh-add -l` antes de insistir.
