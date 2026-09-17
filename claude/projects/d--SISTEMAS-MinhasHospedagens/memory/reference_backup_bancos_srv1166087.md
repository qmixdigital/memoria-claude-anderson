---
name: reference-backup-bancos-srv1166087
description: Backup diario dos bancos do srv1166087 para a hostinger compartilhada, com as tres armadilhas que quebraram na implantacao
metadata:
  type: reference
---

Desde 31/08/2026 o srv1166087 manda os bancos para outra maquina todo dia as
03:20, por `/usr/local/bin/qmix-backup-bancos.sh` (copia em
`D:\SISTEMAS\MinhasHospedagens\scripts\`).

**Destino:** `u651115354@92.113.35.186:~/backups-qmix` (porta 65002), que fica
FORA de qualquer `public_html` e portanto nao e acessivel pela web. Chave
dedicada `/root/.ssh/id_ed25519_backup`, criada so para isso, nunca reusada.

**Volume:** 11 bancos MySQL + 21 PostgreSQL = 32 arquivos, ~534 MB comprimidos,
~3 minutos. Rotacao de 7 diarios + 4 semanais (domingo).

**Restauracao testada em 31/08:** `pg_medicinageriatrica_db` restaurado em banco
temporario devolveu 23 tabelas e 1.263 artigos, iguais ao original, zero erros.

**Tres armadilhas que quebraram a implantacao, todas silenciosas:**

1. **Tamanho nao serve para validar dump.** Banco sem tabela gera dump legitimo
   de ~600 bytes. O criterio certo e a marca de conclusao que o dump escreve no
   fim.
2. **A marca nao e a ultima linha.** O `pg_dump` recente escreve uma linha de
   unrestrict DEPOIS de "PostgreSQL database dump complete", entao `tail -3` nao
   alcanca. Usar `tail -20`.
3. **scp usa -P maiusculo para porta, ssh usa -p minusculo.** Passar `-p` para o
   scp faz ele tratar o numero da porta como arquivo de origem e o erro que
   aparece e `stat local "65002": No such file or directory`.

**Falha avisa no Telegram** pelo `/etc/qmix-disk-alert.env`, que ja existia (ver
[[reference_alerta_disco_telegram]]).

**O que este backup NAO cobre:** uploads dos apps (setorenergetico 1,8 GB,
qmiximoveis 605 MB, cirurgiacoracao 280 MB, medicinageriatrica 207 MB) e os 7,9
GB de arquivos WP em `/home/boot/web`. Entram numa segunda fase, por rsync
incremental.
