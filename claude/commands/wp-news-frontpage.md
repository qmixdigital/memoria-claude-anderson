---
description: Gerar/editar/auditar portal WordPress da rede QMIX (theme + front-page + single + archive + chrome) com diversificação anti-fingerprint. Invoca a skill wp-news-frontpage.
---

Use a skill `wp-news-frontpage` (instalada em `.claude/skills/wp-news-frontpage/`) para a tarefa abaixo.

**Antes de qualquer ação, leia o `SKILL.md` da skill por inteiro** em especial o bloco "Hard-won bugs" (16 regras críticas, do em-dash ao related-posts global $post). Não pule esse bloco mesmo se a tarefa parecer simples.

**Workflow obrigatório quando o operador pede um portal novo, edição de portal existente, ou auditoria:**

1. Confirmar contexto (domínio, parent theme, niche, VPS, vizinhos a evitar, exclusão de categorias multi-language).
2. Rodar `scripts/roll.py` para gerar/aplicar a roll de fingerprint divergente vs registro `data/fingerprint-rolls.json` (com `--exclude-lang-categories` se aplicável).
3. Ler as references relevantes (`layouts.md`, `single-templates.md`, `chrome.md`, `visual-identity.md`, `multilang-exclusion.md`, `archive-templates.md`).
4. Gerar o pacote completo em `generated/<portal>/`: style.css, functions.php, header.php, footer.php, front-page.php, single.php, archive.php, search.php, 404.php, page-contato.php, index.php, inc/helpers.php, inc/link-audit.php (`OIE_Link_Audit_Command`), assets/.
5. Aplicar as regras do `SKILL.md` Hard-won bugs (Antonio compatibility, slim core, no em-dash, no strtolower/uppercase em kickers, two-layer thumb filter, audit-links command com classe e nome idêntico entre portais, regra 16 sobre `$post` global em loops manuais).
6. Apêndar o roll a `data/fingerprint-rolls.json` (`scripts/append_roll.py`).
7. Sugerir / executar `scripts/install_portal.py --preserve-permalink`.
8. Antonio sanity-check antes E depois (regra 11): listar mu-plugins do portal e namespaces REST com prefixo `c5cf26|fad0|8014|d0af|qmix|artigo`.
9. Inventory check final 1:1 (regra 13): plugins DB vs FS, themes DB vs FS, pastas residuais.
10. Reportar sibling-diff summary ao operador.

**Tarefas frequentes além de geração:**

- "Adicionar portal X à rede" -> workflow completo acima.
- "Migrar tema atual de portal Y para o padrão da skill" -> rodar `roll.py`, gerar pacote, deploy preservando uploads + categorias + posts; renomear o dir do tema final para nome único (anti-fingerprint).
- "Auditar conformidade do portal Y com a skill" -> rodar `grep -nE 'setup_postdata\s*\(\s*\$' single.php`, checar em-dashes (`grep -c '—'` em todos os PHP/CSS), checar inventory 1:1, checar Antonio sanity, checar auto-update (regra 15).
- "Excluir categoria multi-language do home" -> seguir `references/multilang-exclusion.md` (helper `<prefix>_excluded_lang_cat_ids()` + `pre_get_posts` + `category__not_in` no `<prefix>_query_for_section()`).
- "Form de contato" -> SEMPRE seguir `page-contato.php` + handler `<prefix>_handle_pauta_form` em functions.php roteando para `contato@oiempreendedores.com.br` com tag `[<PORTAL>]`. Nunca usar plugin de contact form custom externo.
- "Comando wp oie audit-links" -> instalar EM TODOS os portais (mu-plugin `wp-content/mu-plugins/oie-link-audit.php` SEM o guard `if(!defined('ABSPATH')) exit;` para funcionar via wp-cli.yml require, classe `OIE_Link_Audit_Command` idêntica entre portais).

**Restrições absolutas:**

- Nunca alterar permalinks (sempre `--preserve-permalink`).
- Nunca tocar mu-plugins do Antonio (qualquer file com sufixo `c5cf26`, `fad0`, `r6a5`, `t225`, `8014`, `d0af`, ou outro token QMIX).
- Nunca usar em-dash em código, comentários, fallbacks, placeholder content. Substituir por dois-pontos, vírgulas, parênteses.
- Conteúdo voltado ao usuário SEMPRE em pt-BR com acentos corretos.
- Quando referenciar a agência: `qmix.com.br` (não qmixdigital.com.br).
- Antes de remover qualquer plugin ou tema, listar os REST namespaces e mu-plugins QMIX antes; após remover, listar de novo. Se algum sumiu, rollback imediato (regra 11).
- Sempre fazer 3x over-fetch + `has_post_thumbnail()` skip dentro do loop em queries do home (regra 2.1 + 8).

Tarefa atual:

$ARGUMENTS
