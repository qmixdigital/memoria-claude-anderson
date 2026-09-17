---
name: cliquex-provedores-clientes
description: Os 25 provedores do ranking (clientes reais) e onde entra o link de cada um nos sites da rede
metadata:
  type: reference
---

**Os sites da rede NAO inventam nome de plataforma.** O ranking tem que ser o mesmo do rblc.com.br, que e a referencia: **25 provedores auditados**, na ordem abaixo. Nomes inventados ja foram corrigidos uma vez (2026-09-02) e nao devem voltar.

**Com link de cliente (rank 1 a 9 e o 25):**

| # | nome | nota | link | pagina do silo |
|---|---|---|---|---|
| 1 | Movie IPTV | 4.6 | https://teste-iptv.mov/ | /teste-iptv-movie |
| 2 | Top IPTV | 4.5 | https://teste-iptv.top/ | /teste-iptv-top |
| 3 | Play Brasil IPTV | 4.8 | https://playbrasil.top/ | /teste-iptv-play-brasil |
| 4 | Nexo Play IPTV | 5.0 | https://nexoplay.top/ | /teste-iptv-nexo-play |
| 5 | Zap Plus IPTV | 4.7 | https://zapplus.top/ | /teste-iptv-zap-plus |
| 6 | Play Plus IPTV | 4.7 | https://www.metodoeventosrio.com/ | /teste-iptv-play-plus |
| 7 | Nexus IPTV | 4.5 | https://teste-iptv.nexus/ | /teste-iptv-nexus |
| 8 | NET IPTV | 4.4 | https://www.plataformateatro.com/ | /teste-iptv-net |
| 9 | Play Max IPTV | 4.8 | https://teste-iptv.nexus/ | /teste-iptv-play-max |
| 25 | Play Pro IPTV | 4.9 | https://teste-iptv.mov/ | /teste-iptv-play-pro |

**Sem link (rank 10 a 24, so nome, nota e atributos):** 10 Vistation 4.4, 11 AHE Brasil 4.3, 12 NT5 4.3, 13 Academus 4.2, 14 Prattein 4.2, 15 Home Refill 4.1, 16 Mostra Rio Grande 4.1, 17 Abble 4.0, 18 Cine Libero 4.0, 19 Batiste 3.9, 20 Uniprime 3.9, 21 HTE 3.8, 22 Tattoaria 3.8, 23 Generation 3.7, 24 Stream Now 3.6. Repare que a ordem **nao** segue a nota (Play Pro tem 4.9 e fica em 25): manter a ordem do rblc como esta.

**Onde entra cada link** (padrao copiado do rblc, conferido pagina a pagina):
- **Home:** botao "Testar gratis" em cada card dos 10 com link. Os 15 sem link ficam sem botao. O CTA do hero continua indo pro **cliquex.click** (rotador).
- **Pagina do app** (`/teste-iptv-movie`, `/teste-iptv-top`, ...) e **combos app+cidade** (`/teste-iptv-nexus-rio-de-janeiro`, campo `prov` do `rblc_pages.json`): CTA principal vai pro site do cliente, com um secundario "Ver outras plataformas" pro cliquex.click.
- **Paginas de aparelho e de cidade:** so cliquex.click, sem link de cliente.
- Links de cliente sempre `target="_blank" rel="noopener noreferrer"` (dofollow, como no rblc), nunca nofollow.

Dados extraidos do mirror do rblc em `scratchpad/rblc_mirror/index.html` e salvos em `scratchpad/rblc_plataformas.json`; o script que aplica tudo num site novo e `scratchpad/nb_clientes.py`. Ver [[cliquex-silo-rblc-replicas]], [[cliquex-japao-fanese]], [[cliquex-rblc-hosting]].

**figa2023.com.br corrigido em 2026-09-10** (25 reais, links, 60 paginas internas com CTA do cliente, descritores proprios em vez dos do rblc). **PENDENTE:** unisuamnews.com.br e cineterreiro.com.br ainda estao com nomes inventados no ranking da home (os 110 do silo ja usam os nomes reais). Eles continuam monetizando pelo cliquex.click, mas o ranking precisa ser trocado pelos 25 reais quando o Anderson liberar.

**PAGINA QUE FALTA NO MANIFEST (achada em 2026-09-10):** o rblc tem **111** paginas `/teste-iptv-*`, nao 110. O `rblc_pages.json` original deixou de fora **`/teste-iptv-play-pro-brasilia`** (o Play Pro tinha 4 combos em vez de 5). Criada no figa2023 com conteudo proprio; **falta criar nos outros 7 sites** (testeiptv.wales, unisuamnews, cineterreiro, brooklin, cieh, trabalhonojapao, fanese). Conferir paridade sempre por diff de sitemap: `rblc.com.br/sitemap-pages.xml` (ignorar os `/?q=`) x sitemap do site.

**O scratchpad da sessao foi limpo pelo Windows (temp)** entre 2026-09-03 e 09-10: os `nb_*.py`, mirrors e manifests sumiram. O que continua valendo e o metodo: mirror do site pelo `<projeto>.pages.dev` (sitemap + assets referenciados + favicon-192/512 + og), extrair os 25 do rblc ao vivo (regex em `platform-card` com `data-name`, `__rank`, `__score`, `__feature`), trocar o ranking por HTML estatico, CTA duplo nas paginas de app/combo, redeploy com wrangler (master token, conta do site), purge, IndexNow. Descritores dos cards devem ser **proprios por site** (japao/fanese ainda usam os 3 atributos do rblc; figa ja tem texto proprio).
