---
name: importar-materia-markdown
description: Caminho preferido para publicar matéria: arquivo Markdown + imagem via scripts/subir-md.py (rota /api/importar-md). Substitui o script SQL manual.
metadata:
  type: project
---

Desde 11/09/2026 a forma de publicar matéria na Revista Mais Saúde é **Markdown + imagem na pasta `conteudo/`** e `python scripts/subir-md.py conteudo/` (na raiz do projeto local). Formato e prompt para IA: `docs/guia-materia-markdown.md`.

**Como funciona:** rota `POST /api/importar-md` dentro do Next.js (header `x-import-secret` = `PAYLOAD_SECRET`, igual no `.env` local e na VPS). Usa a API local do Payload de dentro do app (que funciona; o que não roda é script solto na VPS, ver [[publicar-materia-via-sql]]) e `convertMarkdownToLexical` com a config do editor. Cria a mídia com as variantes, vincula categoria/profissional por slug, dispara os hooks de revalidação. `GET ?listar=1` devolve slugs válidos (`--listar`).

**Why:** o fluxo antigo (SQL + sharp à mão) custava uma sessão por matéria e não validava nada.

**How to apply:**
- Modos: `publicar` (padrão), `--rascunho` (não aparece no site: `materia/[slug]` filtra `status=publicado`), `--atualizar` (mesmo slug; mantém a imagem salvo `--reenviar-imagem`).
- Validação local e no servidor: title ≤ 47 ou `meta_title` ≤ 47, resumo 10-20 palavras e ≤ 160 chars, meta_description 140-160, sem travessão/meia-risca, sem H1, ≥ 1 H2, ≥ 300 palavras, imagem WebP/JPG/PNG.
- Testado em 11/09/2026 com matéria de rascunho (h2/h3/listas/links/quote/negrito convertidos; variantes 480x320 e 960x640 geradas; hero 1920x1080 pulada porque a origem era menor). Teste apagado depois.
- O CLI manda UA de navegador; curl puro ainda passa na zona, mas não contar com isso.
