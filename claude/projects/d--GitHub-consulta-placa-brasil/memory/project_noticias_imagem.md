---
name: project_noticias_imagem
description: Feature de imagem automática via Pexels API nas notícias — o que foi feito e como funciona
type: project
---

## Imagem automática nas notícias via Pexels

**Status:** Implementado em 2026-03-16

**Why:** Sem imagens, não vale criar Google News Sitemap (CTR muito baixo no Discover). Com imagens automáticas via Pexels, habilitou-se também o `/news-sitemap.xml`.

**How to apply:** Se precisar ajustar busca de imagem, editar `src/lib/noticias/imagem.ts`. Chave de API em variável de ambiente `PEXELS_API_KEY`.

### O que foi adicionado:
1. Colunas `imagem_url` (text) e `imagem_alt` (varchar 255) na tabela `noticias`
2. `src/lib/noticias/imagem.ts` — busca imagem no Pexels por categoria + palavras do título
3. `auto-noticias.ts` — chama `buscarImagemPexels()` antes de salvar no banco
4. `NoticiaCard.tsx` — exibe imagem no card (com fallback sem imagem)
5. `[slug]/page.tsx` — exibe imagem hero no artigo + imagem no OpenGraph/JSON-LD
6. `src/app/news-sitemap.xml/route.ts` — Google News Sitemap com `<image:image>` tags

### Lógica de busca de imagem:
- Mapeia categoria para query em inglês (ex: "recalls" → "car recall safety")
- Extrai nomes próprios em maiúsculas do título (marcas/modelos de carro)
- Combina os dois para busca no Pexels: `Toyota Corolla car recall safety`
- Retorna `photos[0].src.large` + `photos[0].alt`
