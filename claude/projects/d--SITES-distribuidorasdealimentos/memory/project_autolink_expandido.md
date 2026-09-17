---
name: autolink-expandido-jul-2026
description: Sistema de auto-linkagem interna (src/lib/auto-link.ts) foi expandido em 07/07/2026 para cobrir 130+ novas páginas com cotas por tipo
metadata: 
  node_type: memory
  type: project
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
---

O sistema de auto-linkagem que roda quando o QMIX publica um artigo (via POST `/wp-json/sistema-qmix/v1/artigos`) foi significativamente expandido em 07/07/2026.

**Antes:** cobria apenas 4 tipos de link (cidades TOP 500, estados, categorias, glossário — todos do DB).

**Agora cobre 12 tipos:**
1. Products em atacado (`/onde-comprar-atacado/{slug}`, 20 items) — prioridade máxima (comercial)
2. Inflação e preços (`/precos-alimentos-brasil`, `/cesta-basica-brasil`, `/precos-alimentos-brasil/altas-e-baixas`, `/calendario-safras-alimentos`, `/onde-comprar-atacado`)
3. Ferramentas (`/ferramentas/*`, 5 tools: CMV, ROI mercearia, gasto familiar, quiz negócio, consulta CNAE)
4. Marcas → categoria (`/marcas-alimentos/{categoria}`, ~100 marcas mapeadas para 15 categorias)
5. Guias empreendedor (`/guias/como-abrir-*`, 8 guides incluindo comparativo canais)
6. Safras (`/calendario-safras-alimentos/{slug}`, ~30 alimentos que NÃO são products — evita conflito)
7. CEASAs (`/ceasa-brasil/{slug}`, 32 unidades)
8. Cesta básica por capital (`/cesta-basica-brasil/{slug}`, gatilho "cesta básica em X")
9. Cidades TOP 500, estados, categorias, glossário (do DB, como antes)

**Cotas por tipo:** para evitar 1 tipo consumir todos os slots, cada tipo pode contribuir com no máximo `Math.max(2, Math.floor(maxLinks/3))` links. Ex: artigo médio (5 links) → max 2 por tipo, forçando 3+ tipos diferentes. Artigo grande (10 links) → max 3 por tipo.

**Limite dinâmico por tamanho:** 3/5/8/10 links (era 3/5/7).

**Why:** as 130+ páginas novas criadas na sessão de 07/07/2026 estavam invisíveis ao sistema de auto-link, então artigos jornalísticos publicados via QMIX perdiam oportunidade de linkar termos como "arroz", "cesta básica", "CEAGESP", "calculadora de CMV" para os assets criados.

**How to apply:** o sistema já roda automaticamente. Se acrescentar novas páginas em massa no site (ex: novo tipo de conteúdo), avaliar se precisa criar novo `LinkType` em `src/lib/auto-link.ts` e adicionar a função `staticXTargets()` correspondente. Segue padrão: retorna array de `LinkTarget` com keywords, displayName, href, type, priority.

**Teste rápido:** rodar `npx tsx` com script que chama `autoLinkContent(articleHtml)` — precisa `DATABASE_URL` no env pra puxar cache dinâmico.
