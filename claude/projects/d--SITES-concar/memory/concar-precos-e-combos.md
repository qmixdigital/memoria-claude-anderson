---
name: concar-precos-e-combos
description: Política de preço (50% piso) e cobertura dos combos do Concar — o que cada combo entrega de fato
metadata: 
  node_type: memory
  type: project
  originSessionId: 24ee2264-5b12-4716-bf06-61ee77213ed9
---

**Política de preço (Concar):** margem de **50% é PISO, não alvo**. Regra em `src/lib/pricing.ts`: `preço = max(preço_atual, 2×(custo_API+taxa), R$9,90)`, arredondado pra R$X,90. **Nunca** derrubar produto já lucrativo pra "bater" 50% — só sobe os abaixo do piso. (Decidido 2026-06-11 após eu quase ter aplicado 50% como alvo, o que cortaria a receita de 14 produtos com margem 66-99%.)

**Cobertura real dos combos (card = API = preço, corrigido 2026-06-11):**
- **Express** = chassi + FIPE + débitos. **Premium** = `relatorio-veicular-completo` (base-estadual-v3) + chassi + FIPE → entrega dados + FIPE + todos os débitos + todas as restrições + Renajud + alerta de roubo/furto. **Total** = vip-car + débitos.
- **Leilão, sinistro e recall são AVULSOS, não entram em combo** — incluí-los furaria o piso de 50% (leilão sozinho custa R$21,12). NÃO re-adicionar `leilao-v2`/`agregados-indicio-sinistro`/`recall-v2` aos `apiEndpoints` dos combos sem antes subir o preço. O combo Premium antes ANUNCIAVA esses 3 sem chamá-los (vendia sem entregar) — corrigido.
- O Monitor de Placa (MON-PLACA) chama só `relatorio-veicular-completo` (não leilão+gravame+roubo, que dava prejuízo de −204%).

**Monitor de custo do fornecedor:** `/admin/custos-fornecedor` captura o custo real cobrado pela APIBrasil (`valor_consulta`) a cada consulta e sugere reajuste (piso 50%) com aplicação em 1 clique. Lib: `src/lib/supplier-cost-monitor.ts`, model `SupplierEndpointCost`.

Ver [[concar-seo-geo-padrao]] e [[concar-infra-parceiro]].
