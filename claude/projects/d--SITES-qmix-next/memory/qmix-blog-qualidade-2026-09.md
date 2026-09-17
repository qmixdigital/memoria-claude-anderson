---
name: qmix-blog-qualidade-2026-09
description: "Auditoria SEO + humanização do blog concluída em 2026-09-12; regras aplicadas, exceções aceitas e fusões com 301"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-12T22:43:05.972Z
---

Em 2026-09-12 os 92 artigos publicados do blog passaram pelo validador da skill `materias-jornalisticas-linkbuilding` adaptado para blog (listas e posição de link não bloqueiam; `<li>`/`<h3>` contam no corpo; keyword definida à mão por artigo). Estado final aprovado por Anderson: humanização média 81, nenhum abaixo de 70, nenhum abaixo de 1.200 palavras, keyword em título/abertura/H2/meta em todos.

**Exceções aceitas (não "corrigir" de novo):** "clique aqui"/"saiba mais" entre aspas como exemplo de âncora ruim; "proporcional"; "abordagem terapêutica" no artigo de psicólogos; trigramas repetidos (é a keyword) e perguntas em H3 de FAQ.

**Fusões com 301 no `next.config.ts`:** contador-de-backlinks → verificador-de-backlinks; backlinks-toxicos-como-identificar-e-fazer-disavow → backlinks-toxicos; digital-pr-e-link-building → digital-pr; backlinks-de-perfis-gratis → backlinks-gratis (artigos antigos em rascunho). `/blog/backlinks-gratis` é a página-alvo de "ferramenta de backlinks" e "lista de backlinks" (GSC), abre com o verificador de ferramentas.qmix.com.br/verificar-backlinks.

**Why:** Anderson quer o blog sem marca de IA (vocabulário da skill, zero travessão, títulos ≤70) e com keyword exata; artigos de Goiânia (dentistas/médicos) foram reescritos por inteiro porque eram promessa vazia.
**How to apply:** artigo novo ou editado no blog segue as mesmas regras; backups de cada lote em `/var/www/qmix-next/backups/artigos-backup-*-2026-09-12.json`; exportar artigos com `scripts/exportar-artigos.mjs` e aplicar updates com `scripts/aplicar-updates-2.mjs <json> <rotulo>` no VPS (faz backup antes). Ver também [[qmix-deploy-atomico]].
