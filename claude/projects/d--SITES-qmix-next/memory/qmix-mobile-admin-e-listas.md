---
name: qmix-mobile-admin-e-listas
description: "Como o painel admin e as listas de backlinks funcionam no celular (gaveta, rotulador de tabelas, cards em grid, barra de compra) e como medir"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-18T11:17:28.285Z
---

Feito em 18/09/2026 depois de o Anderson reclamar que não conseguia usar o admin nem comprar pelo celular.

**Admin (abaixo de 1024px):**
- `AdminSidebar.tsx` vira gaveta: barra fixa no topo (h-14) com hambúrguer + logo + sino; aside `-translate-x-full` fechado, `role=dialog` aberto, foco no botão Fechar, Esc fecha, `inert` no `<main>` enquanto aberta e no aside quando fechada, trava de rolagem por `position:fixed` no body (segura Safari iOS). Layout: `main` sem `ml-64` (`lg:ml-64`) e `pt-[68px]`.
- `AdminTabelasMobile.tsx` (montado no layout do dashboard) lê `thead th` de toda `table` dentro de `main`, grava `data-rotulo` em cada `td` (MutationObserver para listas que carregam depois) e adiciona `.adm-tab`. `admin-mobile.css` transforma cada `tr` em card em grid (2 colunas <640, 3 colunas 640–1023; primeira e última célula ocupam a linha). Tabela que não deve virar card: `data-mobile="livre"`.

**Cliente:**
- `lista-de-backlinks/lista-cards.css` (compartilhado pela lista completa e pela aba de apostas): <640px cada linha vira card em grid 2 colunas; `.cel-preco` e `.cel-acao` dividem a última linha. `useLimiteMobile` mostra 40 por vez com "Mostrar mais" só no celular (446 cards de uma vez davam 233 mil px).
- Ficha do portal: `BarraCompraMobile.tsx` fixa no rodapé (preço + Adicionar / Ver carrinho), `lg:hidden`, deixa 84px à direita para o WhatsApp.
- Carrinho: bloco "Portais recomendados" vem depois do Resumo no DOM (no celular Finalizar aparece antes das sugestões).

**Como medir:** `D:\tmp\mob-shots.mjs` (Playwright global em `C:/Users/User/AppData/Roaming/npm/node_modules/playwright`, importar por `file:///`) com `TOK` (token admin) e `CK` (cookie do cliente impersonado); imprime `scrollW` e elementos que estouram por página; rodar em 360/390/768/920/1024. Cloudflare bloqueia UA padrão do Playwright: usar UA de iPhone/iPad.

**Why:** o admin tinha `ml-64` fixo e tabelas de 9 colunas; no celular o conteúdo começava em 256px e estourava até 1500px. Reescrever cada tabela como card não cabia; o rotulador genérico resolve todas de uma vez.

**How to apply:** ao criar tabela nova no admin, basta ter `thead th` com texto; ao criar lista nova no site, reaproveitar `lista-cards.css` com `data-rotulo` nas células e classes `cel-preco`/`cel-acao`.

**Ferramentas (85 páginas), 18/09/2026:** auditor `D:/tmp/tools-mobile-audit.mjs` (W=390/360; mede estouro, alvos <40px, input <16px, tabelas mais largas que a tela, h1). Correções em `(tools)/ferramentas/ferramentas.css` (media 640): input/textarea/select 16px `!important` (zoom do iOS), `min-height:44px` em button/[role=button]/a.qmix-btn, breadcrumb com padding, checkbox 22px; tabelas viram cards via `_shared/TabelasMobile.tsx` (montado em `(tools)/layout.tsx`, rotula `td` por `data-rotulo`; `data-mobile="livre"` para excluir). BannerEnjaiSticky encurtado no celular. Resultado: 0 estouros, 0 tabelas largas, 0 inputs <16px em 360 e 390.
