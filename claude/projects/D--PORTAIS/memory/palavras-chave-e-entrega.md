---
name: palavras-chave-e-entrega
description: "A pasta de palavras-chave, como escolher o cluster e o formato de entrega das URLs ao Anderson"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T16:47:51.520Z
---

**`D:\PORTAIS\palavras-chave`** guarda exportações de palavra-chave (CSV com
Keyword, Volume, Keyword Difficulty, CPC, SERP Features). É **passo obrigatório
da CONVERSÃO TOTAL**: toda conversão termina com geração de conteúdo para buscar
tráfego orgânico, e é dessa pasta que saem os alvos.

**Como escolher o cluster (o que aprendi no piloto):**

1. **Filtro base:** KD ≤ 12, volume ≥ 300, 4+ palavras. No piloto sobraram 1.890
   de 20.162 termos.
2. **Descartar YMYL.** Saúde, dinheiro e direito dominam o topo por volume, mas
   são as áreas onde o Google exige E-E-A-T alto e rebaixa site novo com conteúdo
   automatizado. Filtrar por regex de sintoma, doença, remédio, cirurgia.
3. **Exigir intenções DISTINTAS.** O maior erro possível é pegar 10 variações da
   mesma pergunta. "como medir anel", "como medir dedo da aliança", "como saber
   tamanho anel" são a mesma busca: 10 artigos ali é canibalização, não cluster.
4. **Preferir tema que case com a identidade declarada do portal.** No piloto foi
   cartório e documentos, que bate com a promessa de utilidade pública.

**Search Console não serve de base em site novo.** No piloto tinha 40 consultas,
quase todas com 1 impressão. Ele serve para medir depois, não para escolher antes.

**Entrega ao Anderson:** ele pede as **URLs completas e clicáveis**, uma por
linha, para abrir no navegador e enviar à indexação. Sempre listar assim ao final,
e **reenviar o sitemap** pela API do Search Console depois de publicar.

**Armadilha:** publicar pelo endpoint público leva **403 da Cloudflare**. Publicar
pela origem, `http://127.0.0.1:8791` com header `Host` do domínio.

Relacionado: [[conversao-total]], [[linkagem-interna-automatica]]
