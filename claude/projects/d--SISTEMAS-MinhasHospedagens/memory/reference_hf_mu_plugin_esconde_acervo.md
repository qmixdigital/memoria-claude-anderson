---
name: reference_hf_mu_plugin_esconde_acervo
description: "mu-plugin hf-<hash>.php esconde 74% do acervo dos ARQUIVOS (não só da home): exige _thumbnail_id + exclui cats 31/32 chumbadas como 'EN-US/pt-PT'. No euvo 31=Wellness, 32=País."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**mu-plugin `hf-<hash>.php`** (no euvo: `wp-content/mu-plugins/hf-ee6e19.php`, de 13/04/2026). Cabeçalho: *"Home filters: hide foreign categories + require featured image"*. Roda em `pre_get_posts` na **query principal**, com guarda apenas `!$query->is_singular()`.

**O nome mente: não é só home.** `!is_singular()` pega **home + feed + TODOS os arquivos** (categoria, tag, autor, data, busca).

**Faz duas coisas:**
1. `category__not_in` com IDs **chumbados `[31, 32]`**, comentados como "EN-US e pt-PT". Copiado de um portal multilíngue. **No euvo 31 = Wellness (146 posts) e 32 = País (2)** — nada a ver com idioma. Tem guarda: navegando *dentro* da cat excluída ele dá `return` (e aí pula também a regra 2).
2. `meta_query _thumbnail_id compare=EXISTS` → **exige imagem destacada em todo arquivo**.

**Impacto medido no euvo (15/07/2026):** só 1.209 de 4.719 posts publicados têm capa (26%). Logo, **3.510 posts não são alcançáveis por navegação nenhuma**:

| Categoria | Total | Navegável | Inalcançável |
|---|---|---|---|
| Notícias Agora | 1.603 | 83 | **1.520** |
| Shows | 990 | 58 | **932** |
| Insights | 837 | 114 | **723** |
| Eventos | 346 | 38 | **308** |

Sintoma visível: `/categoria/noticias-agora/page/10/` dá **404** apesar de `max_num_pages=161` num WP_Query avulso (o filtro só pega a *main query*, então query ad-hoc não reproduz o bug).

**Causa raiz da assimetria:** o acervo de 2025 (3.485 posts do Antônio) entrou **93% sem imagem destacada**; o de 2026 tem 79% com capa.

⚠️ **NÃO é bug do tema.** Ao redesenhar portal, o `archive.php` pode estar correto (sem meta_query) e ainda assim paginar curto — o corte vem deste mu-plugin. Checar `mu-plugins/hf-*.php` antes de debugar paginação de arquivo.

**Decisão em aberto (não aplicada):** escopar a regra 2 para `is_home()/is_front_page()` liberaria 3.510 posts para navegação/crawl. Não fiz sozinho porque é decisão de *estratégia de conteúdo* (quer post sem capa navegável?), não bug técnico — e o mu-plugin provavelmente existe em outros portais da rede com os mesmos IDs chumbados.

Relacionado: [[reference_antonio_endpoint_recovery]], [[reference_euvo_redesign_neve]], [[reference_content_pruning]].
