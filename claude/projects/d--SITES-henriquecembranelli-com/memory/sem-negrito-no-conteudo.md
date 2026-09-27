---
name: sem-negrito-no-conteudo
description: Anderson não quer <strong>/negrito em texto de site (não vê ganho de SEO e não gosta); ênfase estrutural só via classe CSS
metadata:
  type: feedback
---

Em 20/09/2026, na auditoria de SEO do site do Dr. Henrique, o Anderson pediu para eliminar todos os negritos do conteúdo: "nunca vi vantagem nenhuma de SEO e eu particularmente não gosto".

**Why:** o Google não penaliza `<strong>`, mas o ganho é marginal a ponto de irrelevante, e ele considera visualmente ruim.
**How to apply:** não usar `<strong>`/`<b>` em parágrafos, listas, FAQ nem cards de nenhum site novo. Onde um destaque for estrutural (título de card, valor de credencial), usar `<span class="...">` com CSS, nunca a tag de ênfase. Vale junto com [[mobile-alinhado-esquerda]].
