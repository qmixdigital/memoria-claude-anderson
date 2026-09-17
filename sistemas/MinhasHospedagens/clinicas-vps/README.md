# Clinicas-VPS (31.97.162.199)

Acesso: `ssh clinicas-vps`. Terceira instancia do Portal Engine, a maior das
tres. Motor em `/opt/portal-engine`, conteudo em `/srv/portais/<slug>`, servico
`portal-engine` rodando como usuario `portais`.

Alem dos portais, a maquina roda **apps Next.js** sob PM2 (lista completa em
[ACESSO.md](ACESSO.md)). Fichas individuais:

- [academus.pro.br](academus.pro.br.md) — diretorio de faculdades e cursos
  tecnicos da saude (Next 15 + Prisma + Postgres, portas 3100/3101)
- [seuguiadesaude.com.br](seuguiadesaude.com.br.md)

## Portais (34)

agencianacionaldenoticias.com, agoranoticias.net, barranews.com.br,
boxnoticias.net, clickinfohub.com, dataroomus.com, editaldeconcurso.net,
gpnoticias.com, jornalacapital.com, jornalconceito.com, jornalimigrantes.com,
jornalistanofato.com, manacultura.com, maragoginoticias.com, mgnoticias.net,
nodiario.com, noticias9.com, noticiasagoras.com, noticiasdasemana.com,
noticiasdiarios.com, noticiasdodia.net, noticiasdojogo.com, noticiasubuntu.com,
ocontraditorio.com, olharmoderno.com, portalr5.com, professortic.com,
r10noticias.com, riachonoticias.net, rsnoticias.net, rumourisnews.com,
semtedio.com, tempusnoticias.com, topsulnoticias.com

**55 arquiteturas** registradas, de A a BC. A letra e unica dentro desta
maquina, e nao entre as tres.

## AdSense

Esta maquina ja tinha a meta e o loader, o que serve para Auto Ads. Em
20/08/2026 ganhou as unidades de anuncio no conteudo, iguais as da opengravity.

Por portal, no `sites.json`:

```json
"adsense": "ca-pub-XXXXXXXXXXXXXXXX",
"adsSlots": { "artigo": "...", "artigo2": "...", "lista": "..." }
```

O motor normaliza o publisher sozinho: `ca-pub-` no `client=` e na meta, cru no
`ads.txt`. Com a forma errada no `client=` o script carrega, responde 200 e nao
serve anuncio nenhum, sem erro visivel.

Regras da colocacao:

- unidade de artigo so entra em paragrafo de **primeiro nivel**; `div` de
  embrulho nao conta como contentor, mas lista, tabela, citacao e resposta de
  FAQ contam
- texto com menos de quatro paragrafos de primeiro nivel nao recebe bloco no
  meio, e ganha a unidade de display no fim
- artigo, pagina, home e listagem recebem; `busca` e `indice-geral` nao
- a 404 chama `pauseAdRequests=1`
- unidade sem anuncio para servir recolhe por
  `ins.adsbygoogle[data-ad-status="unfilled"]`, senao o Google deixa
  `height:280px` e a pagina abre com buraco no meio do texto

**Usa hoje so o barranews.** Ao desligar o AdSense de um portal, apagar o
`ads.txt` a mao: o rebuild so grava arquivo, nunca remove o que deixou de ser
gerado.

## Pendencias conhecidas do barranews

Achadas na auditoria de 20/08 e **nao** relacionadas ao AdSense:

- **199 paginas com a primeira imagem em `loading="lazy"`**, que atrasa
  justamente o LCP. E a arquitetura do portal, que nunca recebeu o ajuste
- 7 paginas com `h3` antes do primeiro `h2`
- 8 paginas institucionais sem `og:image`

`/busca/` aparece como "fora do sitemap" e "noindex vazado", mas nos dois casos
esta certo: e pagina de busca.
