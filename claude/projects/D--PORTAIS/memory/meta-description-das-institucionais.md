---
name: meta-description-das-institucionais
description: 654 páginas institucionais nasciam com meta description abaixo de 100; o molde do motor é curto demais
metadata:
  type: project
---

Quem somos, contato, equipe, termos, política, páginas de autor, mapa do site e
listagem de editoria nascem de **moldes curtos do próprio motor** ("Conheça o
X.", 20 caracteres). Eram **654 páginas nas três máquinas** abaixo de 100.

⚠️ **Não adianta alongar o molde**: molde igual em 81 portais é assinatura de
rede. O que completa a frase é o **`metaDescription` do próprio site**, cortado
em fronteira de frase — `_descNaRegua(site, d)` no `render.js`.

⚠️ E o `metaDescription` de **46 portais** também estava fora da régua, alguns com
13 caracteres (só o nome do site). Sem consertar a raiz, o complemento não
alcança. O texto novo se monta do que o portal já tem: descrição existente + as
editorias com mais artigo (lidas do disco) + um fecho sorteado pelo hash do slug.

**How to apply:** a régua é aplicada em quatro caminhos, e cada um passa por um
lugar diferente do `render.js`: as páginas fixas, as `extraPages`, a `homeMeta` e
a `listMeta`. Numa das máquinas o `staticPages` está partido em duas funções e o
patch das fixas não alcança as extras.

Ver [[regua-de-meta-description-escapada]] e [[texto-repetido-na-rede]].
