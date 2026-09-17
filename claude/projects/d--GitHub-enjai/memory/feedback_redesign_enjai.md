---
name: feedback_redesign_enjai
description: "Sites SMM são dark-first (bordas/fundos brancos translúcidos somem no tema claro); redesign enjai = \"claro, minimalista, confiante\". Sem emoji."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-09-02T10:12:02.552Z
---

**Causa raiz do "tema claro feio" nos sites SMM (enjai e clones):** foram construídos **dark-first**. Estrutura (bordas, divisórias, fundos) usa **branco translúcido** (`border-white/[0.08]`, `bg-white/[0.04]`, `rgba(255,255,255,0.05)`) — desenha no escuro, mas **some no claro** (branco sobre branco), deixando tudo sem estrutura. Também: cores de categoria "luminosas" (rosa/ciano/verde-limão) viram pastel de baixo contraste no claro; preços em verde-neon somem no branco.

**Correção (sempre):** trocar branco translúcido por **tokens de tema** (`var(--hairline)` bordas, `var(--surface)/--surface-3` fundos, `var(--text)/--text-2/--muted` texto) — funciona nos 2 temas. Tokens do enjai em globals.css: dark é o `:root` padrão (--text #FAFAFA, --surface #12182A), claro no bloco `[data-theme]` (--text #0A0A0A, --surface #fff).

**Direção estética escolhida pelo Anderson p/ o enjai (2026-09-02): "clara, minimalista e confiante"** — base clara, UM azul de marca como acento, muito respiro, tipografia forte, categorias NEUTRAS com um ponto na cor real da plataforma (não texto colorido), preço em tinta forte (não neon). Zero emoji (ver [[feedback_no_emojis]]).

Pass 1 feito no enjai: `lib/category-colors.ts` (neutro + dot), `components/loja/ProdutoCard.tsx` (neutro, `semEmoji()` sem flag `u` pq target é ES5, preço em var(--text)), patch na home (marca `// REDESIGN_V1`: white-alpha→tokens, selos de confiança emoji→SVG check, "SEGUIDORES" branco no box azul, pills neutras). PENDENTE: refino de espaçamento/tipografia e replicar nos 3 clones. Ver [[project_app_pwa]].
