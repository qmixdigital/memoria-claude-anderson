---
name: reference-senha-ssh-hostinger-texto-puro
description: Rotacao da senha SSH das hospedagens compartilhadas Hostinger e onde as copias em texto puro estavam escondidas
metadata:
  type: reference
---

A senha SSH era **a mesma nas hospedagens compartilhadas** e estava em texto
puro no opengravity. Rotacao iniciada em 01/09/2026, uma conta por vez.

**Cinco copias existiam, nao uma.** A anotacao antiga falava de "um script 755 e
dois READMEs"; a varredura achou:

- `/root/.hostinger_pass` (arquivo dedicado, nenhum script o lia) - removido
- `/root/arcondicionadotop.com-README.bak` - redigido
- `/root/geladeirastop.com-README.bak` - redigido
- `/root/security-monitor.sh.pre-key.bak` - redigido
- `/opt/security-monitor/bin/security-monitor.sh.bak.1776282000` - redigido

Licao: procurar pelo **valor** da senha (`grep -rlF`), nunca so pelos arquivos
que a memoria lembra. E procurar de novo depois da primeira limpeza: as duas
ultimas copias so apareceram na segunda passada.

**Trocar a senha nao quebra nada**, e isso foi verificado antes de mexer: chave
SSH sozinha abre todas as contas (testado com `-o PasswordAuthentication=no`), o
vigia de integridade usa `id_ed25519_qmix_integrity`, e o backup dos bancos usa
`id_ed25519_backup`. Nenhuma automacao usava senha; o `security-monitor` ja
tinha migrado para chave.

Onde trocar: hPanel -> a hospedagem -> Avancado -> Acesso SSH -> Senha ->
Alterar. **Nao clicar em "Desabilitar"** no Status SSH: isso corta o acesso por
chave tambem.

**Escala real, corrigida em 01/09/2026:** nao sao mais 85 sites. As quatro
compartilhadas somam **19 dominios e 12 WordPress** (qmix u463007860: 3;
anderson-gna u400588174: 3; vps1 u651115354: 12; mariana u761201864: 1). A rede
migrou para as VPS; as compartilhadas ficaram com o resto. A vps1 e a maior, e
tambem e o destino dos backups (ver [[reference_backup_bancos_srv1166087]]).

Ver tambem [[reference_vigia_integridade_qmix]].
