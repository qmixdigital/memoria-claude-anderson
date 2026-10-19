---
name: consultarimovel-estado-e-pendencias
description: "Onde o consultarimovel.ia.br esta em 18/10/2026 e o que ficou pendente de decisao do Anderson (SIGEF vazio, Cloudflare, thin content, remedir GSC); indice GIST agora e permanente"
metadata:
  node_type: memory
  type: project
  originSessionId: 4c2c3c43-1e33-4694-8b4b-8d6b832a0030
  modified: 2026-10-18T11:17:00.463Z
---

consultarimovel.ia.br: diretorio de imoveis rurais (Next 16, Prisma,
Postgres) na opengravity em `/var/www/consultarimovel`, repo
`github.com/qmixdigital/consultarimovel.ia.br` (privado; raiz do repo e a
pasta pai, o app fica em `app/`; local em `D:\SITES\consultarimovel.ia.br`).
O servidor NAO e clone git: codigo sobe por `tar | ssh tar -x` (ou scp) para
`/var/www/consultarimovel`, e tsc/eslint rodam la (`bun x tsc --noEmit`),
porque a copia local nao tem node_modules. Relatorios das sessoes em `docs/`.
Lancado por volta de 06/09/2026.

Relatorio em PDF (produto de R$ 29) desde 18/10/2026 traz: glossario de
situacao/condicao do CAR, veredito da reserva legal contra a Lei 12.651
(`src/lib/cadastro.ts`), APP sempre presente, e secao de sobreposicao com
outros CARs (`sobreposicoesDoImovel` em `src/lib/geo.ts`). Essa secao
depende do indice `imoveis_car_geom_gist` (341 MB), que antes so existia
durante a ingestao e agora e PERMANENTE; `scripts/ingest/50-relacoes.ts`
nao o derruba porque so remove o que ele mesmo criou. Se o indice sumir, a
secao avisa "nao concluida" em vez de derrubar a emissao (statement_timeout
20 s). Reemissao de PDF vendido: `bun scripts/reemite-relatorio.ts
[--sem-email] ID` (codigo do documento muda se for outro dia).

Pendencias que sao decisao do Anderson, nao minhas:

- **Base do SIGEF esta vazia** (`parcelas_sigef` com zero linhas, `totalSigef`
  zero nos 27 estados) mas titles e descriptions do site prometem SIGEF, e
  `/consulta/sigef/` esta em posicao 10 para "consultar parcelas certificadas".
  O relatorio ja diz honestamente que a verificacao nao foi feita. Ou carrega
  a base ou tira a promessa.
- **29,2% das fichas fora do indice** pela regra de thin content; em Alagoas
  sao 61,9%, o que sugere carga incompleta de APP/reserva legal naquele
  estado, nao imovel pior. `areaVegNativaHa` esta vazia na base inteira e
  `areaAppHa` so em 19%.
- **Dominio fora da Cloudflare** (DNS direto na origem): sem borda, sem bot
  management. Ele nao quer barrar bot de IA nenhum.
- **Remedir o Search Console em ~19/10/2026**: em 19/09 o site tinha dez dias
  e 606 impressoes; a malha de guias, a ferramenta de identificar codigo e as
  faixas de anuncio entraram nesse dia. Script: `python C:/Users/User/.claude/skills/google-console-analise/scripts/revisita.py consultarimovel.ia.br`.
- Disco da opengravity em 87% (14 GB livres em 18/10/2026).
- O vigia (`scripts/vigia-plataforma.sh`, cron de 30 min) avisa no Telegram
  dele se rota cair, cache passar de 1,5 GB ou a `-b` ficar ligada.
