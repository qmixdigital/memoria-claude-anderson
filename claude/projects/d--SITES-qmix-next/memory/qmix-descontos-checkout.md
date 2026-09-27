---
name: qmix-descontos-checkout
description: "Regras e brechas de desconto do checkout da QMIX (crédito de avaliação 1 por cliente, auditoria de 24/09/2026 e a decisão de empilhamento que ficou pendente)"
metadata:
  node_type: memory
  type: project
  originSessionId: 055b3928-9368-4d16-8a05-4e948ba465ef
  modified: 2026-09-24T19:40:13.002Z
---

O crédito de R$ 20 por avaliação é **um por cliente, para sempre** (decisão do Anderson em
24/09/2026, depois do pedido 118: wtw19.com.br de R$ 100 saiu por R$ 38 porque a cliente
Topo de Bolo avaliou dois portais em 14 minutos, ganhou dois cupons e usou os dois).

Na mesma auditoria foram fechadas as brechas de preço do checkout: preço de pacote vindo do
carrinho sem conferência, quantidade sem validação (negativa abatia o total), cupom de
primeira compra reutilizável porque a checagem só olhava status `confirmado`, cupom de
indicação sem dono e `/api/cupons/validar` sem limite de tentativas.

**Why:** ele pediu para acompanhar de perto e vai comparar os pedidos novos com essas regras.

**How to apply:** o empilhamento fica **como está, por decisão dele em 24/09/2026**: o
crédito soma com o preço promocional e com os 5% do PIX, mínimo de R$ 60, até 33% de
desconto. A razão é que pedido barato desses cai em portal da rede própria, de custo zero.
Medido na mesma data: na faixa que o crédito alcança (venda até R$ 120) são 190 portais de
custo zero e 24 de parceiro, estes a R$ 100 com custo R$ 50, que ainda sobram R$ 26 depois
do crédito e do PIX. Não reabrir o assunto sem ele pedir; se um dia reabrir, as opções são
não somar com o PIX, subir o mínimo para ~R$ 150 ou barrar item promocional. Ver também
[[qmix-faturamento-mensalistas]].
