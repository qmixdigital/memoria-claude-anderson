---
name: clinicas-vps-ssh-emergencia
description: clinicas-vps ficou sem SSH (ssh.service parado e não habilitado no boot); recuperado via Modo de emergência da Hostinger + paramiko; como fazer de novo
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T19:50:56.466Z
---

De 17/10 a 18/10/2026 a clinicas-vps (srv984283, 31.97.162.199) ficou sem SSH. O `ssh.service` foi parado às 06:51 UTC de 17/10, logo depois de um hardening, e não estava habilitado no boot. O firewall do Hestia e o da Hostinger não eram a causa.

**Como recuperar sem a senha root:** o operador ativa, no hPanel, VPS → Configurações → **Modo de emergência** e passa a senha temporária. A conta é acessada por um admin delegado, e esse acesso NÃO tem API nem "Web console" útil (o console pede a senha root, que ninguém tem). Nesse modo, o disco real é o `/dev/sdb1`, montado em `/mnt/sdb1`. O `sda` é o sistema de resgate, com o MESMO hostname, então não detectar o disco pelo hostname. Entrar por senha com paramiko (`D:/tmp/resgate/run.py`, senha via variável de ambiente, `PYTHONIOENCODING=utf-8` por causa do console do Windows). Para checar se um serviço está habilitado no boot de dentro do resgate, usar `[ -L link ]`, não `-e` (o link absoluto aponta para o sistema de resgate). Para o `sshd -t` em chroot, criar antes `$R/run/sshd`.

**How to apply:** se o SSH de uma VPS der timeout para todos os IPs e os sites seguirem no ar, suspeitar primeiro de serviço parado ou não habilitado. Em SSH não interativo nessa máquina, exportar `PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH HOME=/root PM2_HOME=/root/.pm2`, e o `pm2 jlist` não sai limpo: ler `/root/.pm2/dump.pm2`. Ver também [[dominios-br-inactive-20261005]].

SiteGrátis em sitegratis.qmix.com.br (18/10): sitemap enviado ao Google (via sc-domain:qmix.com.br), ao Bing (verificado por BingSiteAuth.xml) e IndexNow disparado. Arquivo novo em `public/` de app Next só é servido depois de recarregar o app. A regra de cache de HTML da zona qmix.com.br não tinha filtro de host e cacheava a home de TODOS os subdomínios; agora vale só para `qmix.com.br` e `www` (backup em `D:/SISTEMAS/cloudflare/cache_rules_qmix_backup_20261018.json`).

**Deploy do SiteGrátis:** o `deploy.sh` compila na própria pasta; build quebrado apaga o `.next` com o app no ar (aconteceu em 18/10, recuperado em 2 min). Gate obrigatório: `npx tsc --noEmit -p . && ... deploy.sh`. Marca: logo `SiteGrátis | QMIX`, texto sempre "Site Grátis" separado (pedido do operador).
