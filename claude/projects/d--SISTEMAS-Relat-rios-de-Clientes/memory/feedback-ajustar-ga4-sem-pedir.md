---
name: feedback-ajustar-ga4-sem-pedir
description: "Autorização para corrigir configuração do GA4 dos clientes de relatório por conta própria, sem pedir aprovação"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 08d7866e-dcb1-4885-a05f-e9067c14346a
  modified: 2026-10-01T14:40:23.839Z
---

Achou configuração errada no Google Analytics de qualquer cliente da pasta de
relatórios, corrija na hora pela Admin API, sem perguntar. Vale para evento-chave
faltando ou sobrando, método de contagem, medição aprimorada, retenção de dados e
afins. Avisar depois, no resumo.

**Why:** ordem do Anderson em 01/10/2026, depois de eu ter corrigido os eventos-chave
da Dra. Mariana Cabral. Ele valoriza velocidade e considera esses ajustes reversíveis.

**How to apply:** usar a credencial que já lê a propriedade, com escopo
`analytics.edit`, pelo `ga4_admin.py` ou direto pela API. Armadilhas já conhecidas:
eventos que disparam no mesmo clique (`generate_lead`, `clique_whatsapp`, `click`
automático) só podem ter UM marcado como evento-chave, senão o GA4 conta a mesma
pessoa duas vezes; `purchase` é evento-chave fixo e não aceita remoção; retenção
padrão de 2 meses apaga o histórico que o relatório compara, subir para 14 meses.
Continua fora da autorização o que afeta terceiros ou é irreversível (apagar
propriedade, remover usuário). Ver [[feedback-abrir-html-no-navegador]].
