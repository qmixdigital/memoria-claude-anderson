---
name: consultarimovel-estado-e-pendencias
description: "Onde o consultarimovel.ia.br esta em 19/09/2026 e o que ficou pendente de decisao do Anderson (SIGEF vazio, Cloudflare, thin content, remedir GSC em 30 dias)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4c2c3c43-1e33-4694-8b4b-8d6b832a0030
  modified: 2026-09-19T22:47:42.404Z
---

consultarimovel.ia.br: diretorio de imoveis rurais (Next 16, Prisma,
Postgres) na opengravity em `/var/www/consultarimovel`, repo
`github.com/qmixdigital/consultarimovel.ia.br` (privado; raiz do repo e a
pasta pai, o app fica em `app/`; local em `D:\SITES\consultarimovel.ia.br`).
Relatorios das sessoes em `docs/`. Lancado por volta de 06/09/2026.

Pendencias que sao decisao do Anderson, nao minhas:

- **Base do SIGEF esta vazia** (`parcelas_sigef` com zero linhas, `totalSigef`
  zero nos 27 estados) mas titles e descriptions do site prometem SIGEF, e
  `/consulta/sigef/` esta em posicao 10 para "consultar parcelas certificadas".
  Ou carrega a base ou tira a promessa.
- **29,2% das fichas fora do indice** pela regra de thin content; em Alagoas
  sao 61,9%, o que sugere carga incompleta de APP/reserva legal naquele
  estado, nao imovel pior.
- **Dominio fora da Cloudflare** (DNS direto na origem): sem borda, sem bot
  management. Ele nao quer barrar bot de IA nenhum.
- **Remedir o Search Console em ~19/10/2026**: em 19/09 o site tinha dez dias
  e 606 impressoes; a malha de guias, a ferramenta de identificar codigo e as
  faixas de anuncio entraram nesse dia. Com um mes de dados a posicao passa a
  valer. Script: `python C:/Users/User/.claude/skills/google-console-analise/scripts/revisita.py consultarimovel.ia.br`.
- O vigia (`scripts/vigia-plataforma.sh`, cron de 30 min) avisa no Telegram
  dele se rota cair, cache passar de 1,5 GB ou a `-b` ficar ligada.
