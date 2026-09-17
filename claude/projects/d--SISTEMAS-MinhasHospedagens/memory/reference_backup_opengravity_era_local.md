---
name: reference-backup-opengravity-era-local
description: Os backups do opengravity gravavam so no disco local ate 01/09/2026; agora saem para a vps1, com os alvos e horarios
metadata:
  type: reference
---

Ate 01/09/2026 o opengravity tinha **cinco scripts de backup e nenhum backup**:
geladeirastop, setorenergetico, skipark, arcondicionadotop e notebookx todos
gravavam em `/root/backups` e `/var/backups`, **no mesmo disco dos dados**. Eram
3,4 GB de copias que morreriam junto com a maquina. Alem disso, 2,4 GB de
uploads de usuario nao tinham copia alguma.

Descoberto por acaso, ao procurar lixo de disco: a existencia do cron de backup
nao diz nada: o que importa e para ONDE ele escreve. Conferir sempre se ha
`scp`/`rsync`/`rclone` no script.

**Agora:** `/usr/local/bin/opengravity-backup-bancos.sh` (04:40) e
`opengravity-backup-uploads.sh` (05:10), mesmos scripts do srv1166087 (ver
[[reference_backup_bancos_srv1166087]]), destino
`u651115354@92.113.35.186:~/backups-opengravity`, chave dedicada
`/root/.ssh/id_ed25519_backup` (criada nesta data, distinta da do srv1166087).

Volume: 28 bancos / 133 MB (21 MySQL + 7 Postgres) e 6 tars de uploads / 2,2 GB.
Restauracao testada: o banco `skipark` voltou com 31 tabelas e 621 pedidos,
iguais ao original.

Os backups locais antigos continuam rodando; nao foram mexidos. Eles servem para
restauracao rapida, e os novos para o caso de perder a maquina.

**A clinicas-vps tinha o mesmo buraco, e um pior ainda.** Nao tinha backup
externo nenhum, e o `/home/qmix/backup-db.sh` gerava **um arquivo de 20 bytes
todo dia**: ele copia o banco `clinicas_db`, que nao existe mais. Um gzip vazio
com cara de backup, produzido diariamente sem que nada reclamasse. Por isso o
criterio de validacao e a marca de conclusao do dump, jamais o tamanho ou a
existencia do arquivo. Corrigido em 01/09 com
`/usr/local/bin/clinicasvps-backup-bancos.sh` (04:20) e `-uploads.sh` (04:50),
destino `backups-clinicasvps`: 14 bancos / 48 MB e 6 tars / 95 MB. Restauracao
testada com o banco `academus`: 13 tabelas e 209.822 linhas na maior, iguais.

Armadilha ao adaptar os scripts: os caminhos e a profundidade do nome do site
mudam por maquina (`/var/www/*` no srv1166087 e opengravity,
`/home/user/web/*/app` na clinicas-vps, com o nome no 5o campo em vez do 4o).
Conferir o bloco ALVOS depois de instalar: a substituicao por texto falhou em
silencio e o script saiu procurando os caminhos da outra maquina.

**O destino agora guarda as tres VPS:** `backups-qmix` (srv1166087),
`backups-opengravity` e `backups-clinicasvps`. Vale acompanhar o limite de
inodes do plano compartilhado antes de acrescentar uma quarta.
