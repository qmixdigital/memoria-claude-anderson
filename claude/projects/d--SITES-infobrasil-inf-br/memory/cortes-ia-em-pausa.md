---
name: cortes-ia-em-pausa
description: Cortes IA (infobrasil.inf.br) esta PAUSADA desde 18/09/2026 por decisao do Anderson; site so com home no ar
metadata:
  type: project
---

Em 18/09/2026 o Anderson pausou a ferramenta de cortes: "nunca funcionou,
gastei muito dinheiro". Pediu para desativar acessos e APIs, manter so o site
no ar para o dominio ganhar idade, e tentar de novo no futuro com IAs novas.

Estado deixado no servidor srv1166087:
- worker parado (`pm2 stop cortes-worker`), web no ar
- toda chave de terceiro esvaziada no `.env`; original em
  `/var/www/cortes-ia-shared/.env.backup-pausa-20260918`
- nginx devolve 503 com pagina de pausa para login, cadastro, dashboard,
  admin, api e auth; backup em `infobrasil.conf.bak-prepausa-20260918`
- roteiro completo em `/var/www/cortes-ia-shared/COMO-REATIVAR.md`

**Why:** ele estava desgastado depois de varias rodadas de defeito no
enquadramento, quatro delas achadas por ele antes de mim.

**How to apply:** nao reativar nada nem gastar credito de API neste projeto
sem ordem explicita dele. Se ele voltar ao projeto, comecar pelo
COMO-REATIVAR.md e pelos tres pendentes listados la (split trecho a trecho ja
pronto em cortes-ia-rf4; bordas de frase; moldura de emissora). Ver
[[cascata-download-regras]].
