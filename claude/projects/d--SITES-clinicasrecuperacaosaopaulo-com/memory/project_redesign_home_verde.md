---
name: redesign-home-verde
description: Redesign da home/header/footer do clinicas (17/09/2026): paleta verde #1F4D3A + mostarda #B7791F, Bricolage Grotesque + Albert Sans locais, CSS em src/app/home.css com classes h- e tokens --h-; paleta trocada em todo o site por sed; paginas internas ainda no layout antigo (so recoloridas)
metadata:
  type: project
---

Anderson escolheu o mockup B ("verde de recuperacao") entre duas direcoes do Fable em 17/09/2026; aplicado no mesmo dia (commits 9cd0afd e seguinte). Tag `redesign-pre-20260917` marca o estado anterior.

**Sistema:** tokens `--h-green #1F4D3A`, `--h-green-deep #143627`, `--h-green-ink #0F241A` (footer), `--h-bg #FAFAF7`, `--h-tint #EEF3EF`, `--h-accent #B7791F` (mostarda, unico acento), `--h-line-strong #86958C` (borda de campo, 3:1). Raio unico 6px, sem sombra. Display Bricolage Grotesque, corpo Albert Sans, ambas em `public/fonts/` (woff2 latin + latin-ext). CSS da home em `src/app/home.css` (importado pelo globals), classes `h-*`, wrapper `.h-root` com regras de base em `:where()` para nao vencer `.h-btn`.

**Ordem da home:** hero (busca em coluna unica sobre foto + scrim) → vitrine 2+4 (so nao-CAPS da capital) → avaliacoes em reguas → cidades com leader pontilhado → tratamentos (split + linhas) → guia SEO (prosa + figura) → como funciona (linha do tempo) → artigos (destaque + lista) → FAQ `<details>` → CTA dono. TestimonialsSection saiu da home (segue em /depoimentos).

**Why:** "a home tem muito cara de site de IA ultrapassada". Regras que o dono ja reprovou em outros projetos: Fraunces/serif editorial, hero split de SaaS, cards iguais em serie, barrinha sob titulo, PASSO 01, badge acima do H1, bege+terracota.

**How to apply:** paginas internas (cidade, ficha, blog, clinicas) foram apenas RECOLORIDAS por substituicao de hex (#0052CC→#1F4D3A, #00B8D9→#2E6B52, #FF6B6B→#B7791F, #F7F8FC→#F3F6F4, #1A2B3C→#1B2A22, #4A5568→#55655C) e ainda tem cards arredondados/sombra do layout antigo. Segunda fase pendente: portar a gramatica h- para elas. Ver [[fotos-banco-capas]], [[build-node20-path-ssh]].
