---
name: feedback-aprovacao-migration
description: "Sempre listar as ferramentas/páginas candidatas a migração e aguardar aprovação explícita antes de criar/migrar. Nunca presumir aprovação da frase genérica \"N próximas\"."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f0fe6811-0d34-4f0f-86c9-aff621746640
---

Quando o usuário pedir "migre as próximas N ferramentas" (ou similar): NUNCA proceder direto com a migração. Primeiro:

1. Listar as N candidatas (com slug, impressões GSC, justificativa não-SEO)
2. Mostrar URLs novas onde ficariam e mencionar o que será feito (OG image, 301, etc.)
3. Aguardar aprovação EXPLÍCITA do usuário

**Why:** Em 2026-05-22 o usuário disse "sim - 10 proximas" referindo-se a migração de ferramentas qmix→qmixdigital. Interpretei como autorização e disparei 10 agents em paralelo que criaram as páginas no WordPress antes que ele pudesse revisar. Ele me corrigiu dizendo "me mostre antes as ferramentas" e "não migre sim aprovacao". As páginas ficaram no WP mas sem 301 ativo (sem impacto público até aplicar redirect).

**How to apply:**
- Aplicável a TODA migração em lote de páginas/ferramentas/conteúdo da rede QMIX (qmix.com.br, qmixdigital.com.br, e outros sites pelos quais ele é responsável)
- Mesmo quando o usuário disse "pode fazer todas" anteriormente, novos batches precisam de aprovação nova
- A frase "sim - 10 proximas" NÃO é aprovação; é um "go ahead, mostre o plano"
- Lista de candidatas DEVE incluir: slug, impressões GSC últimos 90d, classificação não-SEO confirmada, e justificativa breve
- Esperar aprovação literal antes de Runware/SCP/wp create
- Vale também para [[project_qmix_ferramentas_migration_pattern]]: aplicar o padrão SÓ depois de aprovação por lote
