---
name: reference_antonio_subtitle_meta_description
description: Campos opcionais subtitle e meta_description do Antônio — onde já são aceitos na rede (14/08/2026) e o que falta
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-14T09:09:03.316Z
---

O módulo de **editores externos** do Antônio (`lc-article-transfer.php`, lê a
tabela `lc_articles`) envia dois campos **opcionais**: `subtitle` e
`meta_description`. Vêm com **`htmlspecialchars(ENT_QUOTES)`**, igual ao
`content` — sem `html_entity_decode` viram `&quot;` na página.

Destinos do módulo hoje (12 artigos): wtw19 (3), euvo (2), adonline, advivo,
azulmagazine, blogse, desassossegada, revistadeducao.

**Suporte implementado em 14/08/2026:**

- **portal-engine** (`/opt/portal-engine/src/render.js`, nos **dois** installs —
  opengravity e srv1166087): `subtitle` → `dek` (tem precedência sobre o
  `excerpt` e sobre o `<em>` extraído do conteúdo); `meta_description` → campo
  `metaDescription` no JSON, usado por `metaDesc()` (description + og). Entrou
  também na comparação de "unchanged", senão republicação só com descriçã0 nova
  seria ignorada. Backup `render.js.bak-subtitle-20260813`.
- **WordPress — 89 instalações** (37 anderson-gna, 26 vps1, 21 hostverge,
  5 qmix): `qmix-receiver.php` remendado (script
  `scripts/patch-qmix-receiver-subtitle.php`, idempotente, valida sintaxe e
  aborta se quebrar) — `meta_description` → postmeta `rank_math_description`,
  `subtitle` → postmeta `qmix_subtitle`. Novo mu-plugin
  **`qmix-subtitulo.php`** renderiza o subtítulo antes do conteúdo em
  `is_singular('post')` e injeta `alternativeHeadline` no JSON-LD do Rank Math.
  Distribuição por `scripts/deploy-subtitle-network.sh`.
  ⚠️ O relatório desse script sai vazio nas hospedagens Hostinger (a captura
  `R=$(php ... )` dentro do ssh aninhado perde o stdout) — **conferir pelo
  estado real**: `grep -q qmix_subtitle` no receptor + existência do mu-plugin.

**Campos ausentes = comportamento idêntico ao de antes** (99% dos envios).

**O que NÃO foi feito:** os 6 diretórios Next (bitcao, cirurgiadacatarata,
cirurgiadecancer, medicinageriatrica, setorenergetico, desentupidora.pro).
Nenhum tem coluna de subtítulo no schema — aceitar `subtitle` ali exige
**migração de banco + mudança de render por app**. Só `medicinageriatrica` já
aceita `meta_description`; bitcao/setorenergetico/desentupidora usam o nome
`seo_description` e as duas cirurgias não têm campo de descrição. Como o módulo
de editores externos **não envia para nenhum deles**, ficou para quando um
cliente desses sites pedir.

Ver [[reference_antonio_destino_next_contrato]] e [[reference_antonio_endpoint_recovery]].
