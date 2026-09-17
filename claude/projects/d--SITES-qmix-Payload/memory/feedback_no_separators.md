---
name: no-horizontal-separators
description: Never use horizontal rule / separator nodes in Lexical article content
type: feedback
---

Never insert horizontalrule nodes between sections in articles.

**Why:** The user strongly dislikes the visual separator bars between paragraphs/sections. "Eu não gosto de jeito nenhum."

**How to apply:** When building Lexical JSON for articles, do not include any `{ type: 'horizontalrule' }` nodes. Sections should flow naturally with headings only.
