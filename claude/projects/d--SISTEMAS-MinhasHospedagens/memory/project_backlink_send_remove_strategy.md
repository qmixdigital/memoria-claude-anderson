---
name: backlink-send-remove-strategy
description: "Estratégia PBN do operador — envia backlink de domínio cliente sem massa, remove no dia seguinte pra evitar penalidade Google. NÃO é bug/reinjeção."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

O operador usa uma estratégia deliberada de backlinks para domínios de clientes na rede QMIX: **injeta o backlink (âncora "sem massa") via plataforma do Antônio, deixa o Google indexar por ~1 dia, e no dia seguinte remove o link** — mantendo o conteúdo. Objetivo: passar sinal momentâneo sem criar footprint permanente de PBN (evitar penalidade do Google por rede de links).

**Por isso:**
- O reaparecimento de um domínio já removido (ex: drbrunoair.com.br reapareceu em 8 sites horas após a remoção em 2026-06-14) **NÃO é bug nem reinjeção acidental** — é o ciclo intencional (envio do dia seguinte).
- **NÃO** recomendar "corrigir a fonte" / cortar o link no template do Antônio para esses domínios — a remoção recorrente é parte do fluxo desejado.
- O caso enjai.com.br (removido 06-06 e cheio de novo em 06-14) provavelmente segue a mesma lógica.

**Como aplicar:** remover SOMENTE quando o operador pedir explicitamente um domínio, usando o fluxo de [[sistema-de-remo-o-de-links-externos-da-rede-qmix]] (audit → remove → re-audit) sem questionar reaparecimento.

**NÃO fazer (confirmado 2026-06-24):**
- **NÃO rodar sweep periódico/automático** desses domínios. O operador está **injetando backlinks novos constantemente** e controla o timing.
- **NÃO remover proativamente nem "por garantia"** — remover sem ser pedido destrói uma injeção fresca. Em 2026-06-24 ele acabou de reenviar backlinks pra TODOS os domínios recém-limpos (enjai, portugaldigital, drbrunoair) logo após a remoção — isso é intencional.
- Só agir sob comando explícito ("remover X agora"). O reaparecimento entre comandos é esperado.

**Varredura cobre tudo:** o sweep itera todos os `*/public_html` de cada host + 3 WP comando-quebrado + todos os portais portal-engine, então não precisa de lista do operador — nenhum site fica de fora.
