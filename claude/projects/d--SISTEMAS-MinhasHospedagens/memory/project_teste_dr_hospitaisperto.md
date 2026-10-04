---
name: project-teste-dr-hospitaisperto
description: Teste do Anderson iniciado em 03/10/2026 - link de rodapé dos sites .ia.br (DR 76) para hospitaisperto.com (DR 0) para ver se o DR sobe
metadata:
  type: project
---

Em 03/10/2026 o Anderson pediu um teste: link sitewide no rodapé dos 10 sites `.ia.br` para https://hospitaisperto.com/ ("como site parceiro"), para medir se o DR do hospitaisperto.com sai de 0.

**Why:** ele quer saber se domínios com DR 76 transferem autoridade por link de rodapé.

**Feito (5, no ar e conferidos em 03/10):** calistenia.ia.br e recibosonline.ia.br (entrada "Hospitais Perto" em `src/lib/parceiros.ts`, lista "Sites do grupo BYTX"), consultarimovel.ia.br, contadoria.ia.br e garopaba.ia.br (linha "Site parceiro: Hospitais Perto" no rodapé). Link dofollow, âncora de marca.

**Pendente (5):** autoescolasperto, clinicasdefisioterapia, corretoras, dedetizadorasdobrasil e postoscombustivel (.ia.br) são Workers com assets na conta Cloudflare BYTX, publicados via wrangler em 27 e 28/09; o código-fonte não está no PC dele nem nas VPS. hospitaisperto.com também é Worker, na conta "Cloud04@bytx.com.br". Falta ele dizer onde fica o projeto.

**How to apply:** para desfazer, remover a linha em cada rodapé e publicar de novo. Deploys: calistenia e recibosonline por build fora da pasta viva + `PULAR_BUILD=1 ./deploy.sh` (script em D:/PORTAIS/BACKLINKS/teste-dr-hospitaisperto/dep_grupo.sh); consultarimovel por `./deploy.sh` no servidor, destacado; contadoria e garopaba por `scripts/deploy.sh` local (contadoria precisa de `DEPLOY_KEY=<<REMOVIDO>>`), e os dois deixam a instância `-b` ligada: parar com `pm2 stop X-b` e `pm2 save` depois. O modo automático bloqueia deploy em produção sem autorização dita na conversa.

**Armadilha:** o `main` do GitHub de calistenia.ia.br foi sobrescrito em 14/09/2026 por um commit "QMIX Digital backup" de histórico divergente; a produção (4e5af0a + alteração de 03/10 feita direto no servidor) não bate com o remoto, e o `git pull --ff-only` do deploy.sh falha. Há commits locais não enviados nos 4 repositórios (calistenia e469411, consultarimovel df04419, contadoria 9443491, garopaba b1a21f0).

## Estado final em 03/10/2026 (substitui o "Pendente" acima)

O teste cresceu durante o dia: os 10 sites `.ia.br` passaram a linkar no rodapé, em todas as páginas, para CINCO destinos: hospitaisperto.com, distribuidorasdealimentos.com.br, enjai.social, vidracariaperto.com.br e goiania.pro. Conferido no ar nos 10 (um link dofollow por destino). Texto: "Sites parceiros: Hospitais Perto, Distribuidoras de Alimentos, Enjai, Vidraçaria Perto e Goiânia.pro"; em calistenia e recibosonline os destinos entraram como itens de `SITES_GRUPO_BYTX` (Vidraçaria Perto já existia lá).

Os 5 Workers (autoescolasperto, clinicasdefisioterapia, corretoras, dedetizadorasdobrasil, postoscombustivel) agora têm o projeto em `D:/SITES/<dominio>` (ramo `next-static`, rodapé em `src/app/layout.tsx`). Publicação: `npm ci`, `npm run site` (só publicar se sair "APROVADO: pode publicar"), `npx wrangler deploy` com `CLOUDFLARE_API_TOKEN` lido de `D:/SISTEMAS/Cloudflare/.token_master` (tem escrita em Workers na conta BYTX; o `cloudflare-pages.txt` de Documentos/APIs NÃO tem). Script: `D:/PORTAIS/BACKLINKS/teste-dr-hospitaisperto/publica_workers.sh`. Cada site leva de 8 a 12 minutos.

autoescolasperto, postoscombustivel e corretoras têm trabalho NÃO publicado na pasta (reescrita do trava-texto, 21, 6 e 10 pendências): o que está no ar é o commit, não a pasta. Para publicar sem levar isso junto, `git stash push -u` antes e `git stash pop` depois (o script faz o pop).

O Anderson mandou os destinos um a um ao longo de uma hora; cada novo destino custou uma rodada de deploys. Antes de publicar rodapé em vários sites, perguntar a lista completa de destinos.
