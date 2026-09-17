---
name: crons-caem-todos-juntos-tmp
description: "Quando TODOS os crons do Antonio falham juntos com exit 1 e saida vazia, a causa e a permissao do /tmp"
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-29T21:26:51.087Z
---

Sintoma: no `srv1166087` (host `hostinger-vps-srv1166087`) todos os crons passam a
falhar no mesmo minuto, com **exit 1 e nenhuma saida** no log de
`/var/log/antonio/*.log`. Aconteceu em 29/08/2026, das 21:07 as 21:24.

**Causa:** o `/usr/local/bin/qmix-cron-runner` chama `mktemp` antes de rodar o PHP.
Se `/tmp` perder o bit de escrita para todos, o `mktemp` falha, o redirecionamento
`>"$OUT"` quebra e o bash sai com 1 **sem nunca executar o PHP**. Por isso a saida
vem vazia: nao e erro de banco nem de codigo.

Naquele dia o `/tmp` estava `755` e dono `197609:197121`, que e UID de Windows.
Outra sessao estava subindo arquivos da maquina Windows para `/tmp` (apareceram
`p41.json`, `r3_i41.webp`, `r3_a41.html` com carimbo exatamente das 21:07) e levou
junto o dono e a permissao do diretorio.

**Diagnostico em um comando:**

```bash
stat -c "%a %U:%G" /tmp     # tem que ser 1777 root:root
sudo -u boot mktemp         # tem que criar o arquivo
```

**Correcao:**

```bash
chown root:root /tmp && chmod 1777 /tmp
```

Nao mexer no dono do conteudo, so do diretorio. Os crons voltam sozinhos no
minuto seguinte.

**Blindagem aplicada em 29/08/2026** (depois da segunda ocorrencia, as 22:11):
o `qmix-cron-runner` nao depende mais do `/tmp`. Ele tenta `/tmp`, cai para
`/var/tmp` e, no pior caso, manda a saida para `/dev/null`, mas **sempre executa
o PHP**. O carimbo do throttle do Telegram e o `_resend-last.json` tambem sairam
do `/tmp` para o `/var/log/antonio`: era o throttle preso no `/tmp` que fazia
chegar 60 alertas de uma vez em vez de um por script a cada 30 minutos.
Backup do original em `/usr/local/bin/qmix-cron-runner.bak-tmpfallback-20260829`.

**A origem continua ativa.** A assinatura e `rsync -a <pasta>/ host:/tmp/`, que
copia dono e permissao da pasta de origem para o proprio `/tmp`. Quem estiver
subindo arquivo para o servidor deve usar uma subpasta (`/tmp/qmix-r4/`) ou
trocar `-a` por `-rt --no-perms --no-owner --no-group --omit-dir-times`.

**Why:** o primeiro alerta que chega e um `MySQL server has gone away`, o que
manda a investigacao para o banco. O banco estava intacto (uptime de 3 dias,
21 conexoes de 200). O erro de MySQL foi de um ciclo anterior e nao tem relacao
com a enxurrada de exit 1.

**How to apply:** diante de falha simultanea de todos os crons, olhar primeiro se
a saida no log esta **vazia**. Saida vazia acusa o wrapper, nao o script.
Ver [[diagnostico-site-nao-publica]] e [[operacoes-painel-antonio]].
