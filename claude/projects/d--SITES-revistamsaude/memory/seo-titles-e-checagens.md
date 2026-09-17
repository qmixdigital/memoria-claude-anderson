---
name: seo-titles-e-checagens
description: Como o title das matérias é montado (metaTitle <=47 + " | Mais Saúde"), e armadilhas nas checagens de mojibake e travessão no Postgres
metadata:
  type: project
---

**Title das matérias** (`materia/[slug]/page.tsx`, desde 11/09/2026): `title: { absolute: (seo.metaTitle || titulo) + ' | Mais Saúde' }`. O template global ` | Revista Mais Saúde` (21 chars) estourava 60 chars em 462 matérias. Regra: `seo_meta_title` só quando `titulo` > 47 chars, e sempre <= 47. Todas as 628 publicadas têm `resumo` (linha fina, 10-20 palavras), `seo_meta_description` (140-160) e title <= 60.

**Why:** a regra global é title <= 60 chars com keyword no início; o sufixo longo comia o fim de quase todo title.

**How to apply:** ao publicar matéria nova, preencher `seo.metaTitle` (<=47) se o título passar de 47 chars, `resumo` e `seo.metaDescription`. Ao auditar:
- Mojibake: `like '%Ã%'` dá falso positivo (ÇÃO, NÃO em maiúsculas). Usar `~ 'Ã[©£§³¡ª­ºµ´¢]|Â '`. Em 11/09/2026 o resultado real foi 0.
- Travessão: checar `[—–]` (em dash E en dash). O corpo tinha 304 em 134 matérias; o `—` sozinho mostrava só 78 em 40.
- `conteudo::text` (jsonb) serializa com espaço: `"tag": "h2"`, não `"tag":"h2"`.
- Heredoc com acentos via `ssh host 'cat <<EOF'` corrompe no Windows: escrever o `.mjs` local e mandar por `base64 -w0 | ssh ... 'base64 -d > arquivo'`.

Ver [[editar-conteudo-materia]] e [[deploy-workflow]].
