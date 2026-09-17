---
name: reference-clinicas-vps-disco-isr
description: clinicas-vps enche o disco com cache ISR das fichas dos diretorios; app-prev e o alivio rapido, prune por tamanho e a correcao
metadata:
  type: reference
---

Em 26/08/2026 a `clinicas-vps` (srv984283) bateu **100% de disco**, o PM2 morreu
com `ENOSPC: no space left on device` e **os 7 sites cairam com 502** ao mesmo
tempo. O e-mail da Hostinger avisa do limite, mas quando chega o site ja caiu.

**Alivio imediato:** apagar `/home/user/web/*/app-prev`. E a copia de rollback
do deploy anterior, ninguem serve dela (todo app roda de `app/`). Liberou 44 GB
e o disco voltou de 100% para 58%. Depois: `pm2 resurrect` como root, com
`PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin` (pm2 nao esta no PATH padrao
do SSH e `pm2 list` responde "command not found" sem isso).

**A causa real** e o cache ISR das fichas. Nestes diretorios
`generateStaticParams` devolve `[]` e `dynamicParams` e `true`, entao nada nasce
no build: cada ficha e gerada sob demanda e fica no disco como trio
`.html + .rsc + .meta`, uns 110 KB por ficha. O vidracarias tinha **170.955
fichas, 17 GB, 390 mil arquivos numa pasta so**. E crawl do Google, nao lixo.

**Armadilha do prune antigo:** ele apagava entradas com `mtime +14 dias`, e
apagava **zero**. Com `revalidate = 7 dias` e Googlebot reciclando as paginas,
nenhum arquivo chega aos 14 dias. Podar cache ISR por idade nao funciona neste
cenario. O `prune-isr-cache.sh` novo poda **por tamanho**: teto por rota, remove
as fichas mais antigas ate voltar ao alvo, sempre o trio junto, e aperta os
tetos pela metade se o disco passar de 70%. Passou de semanal para diario.
Backup do antigo em `/root/prune-isr-cache.sh.bak-20260826`.

**Duas armadilhas na hora de escrever o prune:**
1. `du -k` por arquivo trava. Com 110 mil fichas sao 300 mil forks e o script
   nao termina. Usar uma passada de `find -printf '%T@	%s	%p'` e deixar o
   awk somar.
2. As rotas tem estruturas diferentes. vidracaria e marmoraria guardam tudo
   plano no topo (390 mil arquivos numa pasta so); ortopedista aninha em
   `uf/cidade/slug.html`. Um `find -maxdepth 1` acha zero na segunda. Busca
   recursiva com `grep -v '\['` para nunca tocar no diretorio de codigo `[uf]`.

Rotas que crescem: vidracaria, marmoraria, ortopedista, eletropostos,
eletroposto, perfil, operadora. As quatro ultimas nem estavam cobertas antes.

Resultado em 26/08: disco 100% -> 41%, os 7 sites em 200, e uma ficha podada
volta a responder 200 no primeiro acesso (regerada pelo ISR), sem 404.

Relacionado: [[reference-clinicas-vps-desentupidora]],
[[reference-pm2-max-memory]], [[reference-srv1166087-pm2-watchdog]].
