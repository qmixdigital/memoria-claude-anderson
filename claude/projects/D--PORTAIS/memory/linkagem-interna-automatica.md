---
name: linkagem-interna-automatica
description: Como funciona a auto-linkagem interna do portal-engine e as três correções que precisei fazer nela
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T23:14:44.747Z
---

O conteúdo do Antônio chega **sem nenhum link interno**. No agencianacional eram
**0 de 86 artigos** antes de ligar isso.

**O motor já tem o mecanismo**, opt-in por site: `autoLinkContent()` roda dentro
do `publishArticle`, então todo conteúdo novo já nasce linkado. Só não vem ligado.
O cron `scripts/auto-link-retro-all.js` cobre o acervo antigo (04:15 diário, no
crontab do usuário `portais`, log em `/srv/portais/auto-link.log`).

**Configuração** no `sites.json`, campo `autoLink`:

```json
{"enabled": true, "maxLinks": 3, "maxSameAnchor": 2,
 "map": [{"terms": ["termo","variação 1","variação 2"], "url": "/destino/"}],
 "fallback": {"pool": [{"url": "/Categoria/x/", "anchors": ["âncora 1","âncora 2"]}]}}
```

**Três correções que fiz no motor** (só na clinicas-vps), todas nascidas da regra
do Anderson de no máximo 2 usos da mesma âncora no site:

1. **A âncora era sempre o primeiro termo do mapa.** Uma palavra dominava o site
   inteiro. Agora a ordem dos termos rotaciona por hash de `slug + destino`.
2. **Não havia teto por âncora.** Implementei orçamento global em
   `/srv/portais/<slug>/anchors.json`, lido e gravado a cada publicação. Antes,
   "saúde" aparecia 12 vezes.
3. **O caminho do fallback não gravava o contador e sorteava por hash.** Cada
   artigo recomeçava do zero e escolhia sempre a mesma âncora. Agora grava e
   escolhe a **menos usada**.

Resultado: de 30 para 65 âncoras distintas, e de 11 para 2 estourando o limite.

**Quarta correção: página institucional não pode entrar no pool do fallback.**
Os três portais tinham `/equipe/` e `/politica-editorial/` no `fallback.pool`,
com 3 âncoras cada. O resultado foi **175 links de corpo de texto** apontando
para essas duas páginas (51 e 37 só no barranews), e a mesma âncora repetida
12 vezes. Essas páginas pertencem ao rodapé, onde o link é estrutural e o Google
entende como tal; no meio do texto viram padrão de automação e queimam o limite
de âncora sem trazer nada. **Só página de conteúdo entra no pool.**

**Armadilha:** o `publishArticle` considera o artigo inalterado e **pula** quando
o payload é idêntico ao gravado, então o retro não linka os artigos que são
destino do próprio mapa. Para esses, aplicar `autoLinkContent` direto no JSON e
rodar `rebuildIndexes`.

**Como montar o mapa:** olhar os clusters reais do acervo, não só as categorias.
No piloto saíram marketing digital, casas de temporada no Araguaia, cinema e
transplante. Quanto mais termos casarem no texto, menos artigos caem no fallback,
e é o fallback que estoura o limite de âncora.

Relacionado: [[patches-motor-clinicas-vps]], [[conversao-total]]
