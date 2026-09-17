---
name: reference_portal_engine_antifootprint_verificacao
description: O portal-engine varia classe, rótulo e categoryBase por domínio (anti-footprint); conferir por string fixa dá falso negativo
metadata:
  type: reference
---

O portal-engine **muda a marcação por domínio de propósito**, para os portais da rede não
deixarem pegada comum. Quem confere publicação procurando string fixa recebe falso
negativo e vai "consertar" o que está certo.

O que varia:

| Item | Como sai |
|---|---|
| classe do bloco de links internos | `pe-leia-meio` no fonte vira `g1yunq8y`, `x1kft6h1`... (hash por host) |
| rótulo do bloco | **"Leia também"** no opengravity, **"Vale ler"** no srv1166087 |
| `categoryBase` | `Categoria` (girodasnoticias, nerddahora, jornaldebarcelos), `categoria` (noticiasgoias, portalnoticiasbh, wtw19), ausente nos do srv1166087 |

**Como conferir sem cair nisso:**
- bloco de internos: procurar `<aside>` que tenha `<h2>` e uma `<ul>` com links internos,
  nunca pela classe nem pelo texto do título;
- URL de categoria: ler o `categoryBase` do `sites.json` do host, nunca chutar `/cat/`.

Vale também para o `auditar.py` da skill `guest-post-rede`: ele recorta o corpo **a partir
do H1**, e em portal cujo template põe a `<figure>` da imagem destacada **acima** do
`<article>` (caso do `entrenoticia`) os três avisos de imagem (alt, dimensão, WebP) saem
juntos e são falsos. Teste que separa: rodar o portão num artigo antigo do mesmo portal,
sem relação com a campanha. Se der os mesmos avisos, é template.

Ver [[reference_indexnow_rede]], [[reference_portal_engine_publish_articles]].
