---
name: reference_receptor_antonio_kses_origem
description: Publicar por REST no receptor Antônio perde schema (wp_kses_post remove itemprop e script) e alguns sites recusam por origem; guest post com FAQ exige wp-cli --user=ADMIN
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T08:52:14.708Z
---

Ao publicar artigo com marcação de schema (FAQ com `itemprop`/`itemscope`, ou `<script type="application/ld+json">`) via endpoint do receptor Antônio (`wp-json/SLUG-api/v1/artigos`), o conteúdo passa por `wp_kses_post()` e **toda a marcação de schema é removida em silêncio**: a resposta é 201, o post fica publicado e bonito, mas sem nenhum `itemprop` no HTML final. O texto sobrevive, o dado estruturado não.

Além disso, nem todo site aceita POST de qualquer lugar. O sabedoriaglobal.com.br responde `403 {"code":"forbidden_origin"}` (allowlist de origem no receptor) mesmo com o `X-API-KEY` correto.

**Como fazer guest post com schema:** publicar/atualizar por wp-cli com `--user=ID_DE_ADMIN` (sem isso o kses também roda, e `--user=1` costuma falhar porque o ID 1 não existe nesses sites; descobrir com `wp user list --role=administrator --field=ID`). O caminho que funciona é: `wp post create ARQUIVO.html --post_title=... --post_name=SLUG --post_category=ID --porcelain`, depois `wp media import IMG --post_id=PID --featured_image`.

**Duas armadilhas do wp-cli nesses sites:**
- mu-plugins imprimem lixo no stdout (ex.: `Success: Limpar URL /sumario/` no sabedoriaglobal), o que contamina `$(... --porcelain)` e faz o ID virar string multilinha. Sempre passar por `tail -1` ou conferir o ID antes de usar.
- heredoc dentro de `ssh 'comando'` não transfere arquivo; usar base64 por stdin (ver [[reference_blog_cirurgiadojoelho_location_cf]]).

Relacionado: [[reference_antonio_endpoint_recovery]], [[reference_antonio_subtitle_meta_description]].
