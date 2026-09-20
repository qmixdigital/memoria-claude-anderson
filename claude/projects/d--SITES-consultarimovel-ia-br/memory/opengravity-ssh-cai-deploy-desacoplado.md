---
name: opengravity-ssh-cai-deploy-desacoplado
description: "SSH para a opengravity cai com frequencia; comando longo (deploy, build) precisa rodar com setsid nohup, e o loop de espera nao pode usar pgrep -f com o proprio termo"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4c2c3c43-1e33-4694-8b4b-8d6b832a0030
  modified: 2026-09-19T22:47:27.229Z
---

Na opengravity, sessoes SSH caem com "Connection reset by peer" varias vezes
por dia (visto em 09/09 e 19/09/2026). Em 19/09 uma queda matou um `next
build` no meio e deixou o deploy do consultarimovel com a trava e o diretorio
de build orfaos (o `trap EXIT` nao roda em SIGHUP).

**Why:** o deploy leva 10 a 12 minutos e a conexao nao aguenta; um processo
filho da sessao morre com ela.

**How to apply:** lancar deploy e build assim, e nunca em foreground:
`setsid nohup bash -c "./deploy.sh > /tmp/depN.out 2>&1; echo EXIT=\$? >> /tmp/depN.out" >/dev/null 2>&1 < /dev/null & disown`.
Esperar pela linha `EXIT=` no log, nao por `pgrep -f deploy.sh`: o proprio
loop de espera carrega "deploy.sh" na linha de comando e se auto-detecta,
esperando para sempre. Se um deploy morrer no meio, o `deploy.sh` do projeto
ja recria a entrada `-b` do PM2 e poda o cache antes do reload; basta limpar
`/var/www/consultarimovel-shared/deploy.lock` e `consultarimovel-build` e
relancar. O daemon do PM2 foi reiniciado em 19/09 e apagou as entradas `-b` de
tres apps; `certdigital-web-b` continua sem ecosystem e vai falhar no proximo
deploy daquele app.
