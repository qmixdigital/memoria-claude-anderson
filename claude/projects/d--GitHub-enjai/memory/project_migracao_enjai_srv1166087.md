---
name: project_migracao_enjai_srv1166087
description: "2026-06-16 enjai e portuga migraram do opengravity para srv1166087 — novo alias, novas portas, /var/www/enjai NÃO é mais git"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
---

Em **2026-06-16** o site **enjai** e o **portuga** foram migrados do servidor antigo (opengravity / srv1000825 / IP 77.37.69.175) para uma **nova hospedagem**.

**Servidor novo:** `srv1166087.hstgr.cloud` → alias SSH **`hostinger-vps-srv1166087`**.

**Domínios (no ar, HTTP 200, confirmado 2026-06-16):** enjai → `https://enjai.com.br/` · portuga → `https://www.portugaldigital.com.br/`.

**Banco de dados:** LOCAL na própria hospedagem — `DATABASE_URL=<<REMOVIDO>> NÃO é Neon nem nada externo. Auditorias/queries do enjai devem rodar a partir do próprio `srv1166087` (via `node` com prisma em `/var/www/enjai`). Vale para portuga também (tudo local na hospedagem).

**Estado confirmado no servidor novo (read-only, 2026-06-16):**
- enjai: pm2 id 42/43, portas **3024 (enjai) / 3025 (enjai-b)**, cwd `/var/www/enjai`
- portuga: pm2 id 40/41
- `/var/www/enjai` **NÃO é repositório git** (sem `.git`, sem remote) — migração copiou só os arquivos
- **NÃO existe** `/root/deploy-enjai.sh` nem outros `deploy-*.sh` em `/root`
- H1 SEGUIDORES (deploy de 2026-06-16) chegou correto e está no ar em https://www.enjai.com.br/

**O que isso quebra (memórias antigas agora inválidas p/ enjai):**
- [[feedback_deploy]] — portas 3002/3011 eram do servidor antigo; agora 3024/3025
- [[feedback_deploy_use_script]] / [[feedback_deploy_git_pull_first]] — fluxo `git pull` + `/root/deploy-enjai.sh` NÃO existe no servidor novo; processo de deploy precisa ser redefinido com o usuário
- [[reference_servidor_opengravity]] — opengravity (srv1000825) hoje só tem **skipark** (pm2 id 9/10); enjai saiu de lá

**ATENÇÃO antes de qualquer deploy do enjai:** confirmar com o usuário COMO deployar no servidor novo (não há git nem script). NÃO assumir o fluxo antigo. O alias `opengravity` NÃO leva mais ao enjai.

**Deploy no servidor novo (criado 2026-06-16):** existe `/root/deploy-enjai.sh` (recriado nesta sessão) com fluxo zero-downtime: backup `.next` → rsync LIVE→`/var/www/enjai-build` (staging) → prisma generate → `npm run build` no staging → swap atômico do `.next` → `pm2 reload enjai` (3024) → `pm2 reload enjai-b` (3025) → smoke test `/api/health` nas 2 portas → alerta Telegram se falhar. Como `/var/www/enjai` NÃO é git, **subir alteração = copiar o arquivo para `/var/www/enjai` (base64 via SSH) e rodar `bash /root/deploy-enjai.sh`**. Testado OK (268s, zero-downtime).

**⚠️ LIMITAÇÃO Prisma/Node:** o servidor roda **Node 18.19.1**, mas o projeto usa **Prisma 7.5.0 que exige Node 20+**. Por isso `prisma generate` FALHA (`ERR_REQUIRE_ESM`) — o script tolera e segue (o client já gerado, via symlink de node_modules, funciona no build). MAS: se mudar `schema.prisma`, o generate NÃO roda e o build usaria client velho (falha silenciosa — ver [[feedback_deploy_prisma_generate]]). Antes de deployar mudança de schema aqui: subir Node p/ 20+ OU gerar o client em outra máquina e copiar `node_modules/.prisma` + `@prisma/client`. **scp para esse host falha (Connection closed) — usar `base64 | ssh ... base64 -d`.**

**SkiPark:** continua no servidor ANTIGO (opengravity / srv1000825 / 77.37.69.175). NÃO migrou. Só enjai + portuga foram para o srv1166087.

**Portuga no srv1166087:** loja SMM (portugaldigital.com.br), pm2 portuga/portuga-b nas portas **3022/3023**, DB docker `portuga-postgres` (127.0.0.1:5435, banco `portuga`). Criado `/root/deploy-portuga.sh` (mesmo fluxo do deploy-enjai.sh). Deploy testado OK (244s, zero-downtime). enjai DB = docker `enjai-postgres` (5436); ambos os DBs do srv1166087 são containers Docker — consultar via `docker exec -i <ct>-postgres psql -U <user> -d <db>`.
