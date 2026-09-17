---
name: mu-plugin-filtra-o-export
description: --skip-plugins não pula mu-plugin; um pre_get_posts deixou 149 posts fora do inventário sem erro nenhum
metadata:
  type: project
---

`wp --skip-plugins --skip-themes` **não desativa mu-plugin**. No folhar o
`qmix-ocultar-cat-en.php` filtra a categoria em inglês em `pre_get_posts`, e o
export por `WP_Query` devolveu **4.506 de 4.658**: os 152 que faltavam eram os
149 da categoria `life` mais os 2 de status `nao` e 1 rascunho.

Eles existem no banco, têm URL e podem carregar backlink. Ficar de fora do
inventário significaria apagá-los sem nunca terem sido classificados.

**Why:** o defeito é 100% silencioso. Nada na tela indica que a query voltou
incompleta, e a poda depois roda sobre a lista errada.

**How to apply:** conferir sempre a contagem do export contra
`SELECT COUNT(*) FROM wp_posts WHERE post_type IN ('post','page')`, e recuperar
os ausentes por SQL direto com `get_post()` no mesmo formato do acervo — é o
`exporta_falta_*.php`. Vale para toda origem, e não só onde há mu-plugin
conhecido: `ls wp-content/mu-plugins/` antes, e `grep -l pre_get_posts` nela.

Ver [[any-nao-traz-a-lixeira]] e [[status-inventado-so-sai-por-sql]].
