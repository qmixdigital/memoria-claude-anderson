---
name: reference_rankmath_registration_disables_frontend
description: "Rank Math desliga TODO o SEO do frontend (title/meta/og) se o \"registration\" ficar inválido; fix = option rank_math_registration_skip=1"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

Se o Rank Math parar de emitir **title/meta description/og/comentário no frontend** (páginas caem no title do tema, some a metadescrição, aparece `<meta name="generator" content="WordPress...">` que o RM normalmente remove) — mas o plugin está ativo, configurado (`rank_math_is_configured=1`), classes existem e NÃO há erro no debug.log — a causa é o **gate de registration**:

`RankMath::init_frontend()` faz `if ($this->container['registration']->invalid) return;` — ou seja, **não carrega o módulo Frontend** e nada de SEO sai. `Helper::is_invalid_registration()` retorna `!is_site_connected()` a menos que a option `rank_math_registration_skip` seja true (ou a constante `RANK_MATH_REGISTRATION_SKIP`).

**Fix (1 linha):** `wp option add rank_math_registration_skip 1` (ou update). Flush + purge cache e o frontend volta na hora.

**Como cai nessa armadilha:** DELETE em massa em `wp_options` (ex: o `%_ti_%` que já detonou o `smartmag_theme_options` na mariana) apaga `rank_math_registration_skip`; ou reinstalar/reconfigurar o plugin sem conectar ao RankMath.com. Reinstalar o plugin (`--force`) e restaurar as options `rank-math-options-*` do backup NÃO resolve — só a option de skip resolve.

Diagnóstico rápido: sonda em `wp_head` com `has_action('rank_math/head')` = 'no' confirma que o Frontend não instanciou. Aconteceu em marianacabraldermato.com.br 2026-07 (Rank Math 1.0.273). Ver [[reference_mariana_elementor_free]].
