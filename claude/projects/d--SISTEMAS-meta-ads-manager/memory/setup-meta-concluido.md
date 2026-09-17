---
name: setup-meta-concluido
description: Conexao Meta do projeto meta-ads-manager ja esta 100% configurada e funcionando
metadata: 
  node_type: memory
  type: project
  originSessionId: 787468fa-afb5-451e-ab74-2fb5a30d40f2
---

A conexao com a Meta esta COMPLETA e o sistema cria campanhas de verdade. NAO refazer o setup.

- Negocio (Business Portfolio): "Giselle Wagner", id 1358931957995479, **Verificado** via QMIX DIGITAL LTDA (CNPJ 37.181.964/0001-93).
- App: "Gestor Casa Itacaiu", id 1728178025033626, **publicado/ao vivo** (precisou estar Live para criar criativos).
- Usuario do sistema: "GestorItacaiu" (id 61590341080054) com token long-lived no `.env` (META_ACCESS_TOKEN).
- Cliente cadastrado: `casa-itacaiu` em src/config/clientes.ts (adAccount act_999118979251387, page 106055645693895, IG @gisellewagnerofc 17841456611015569). Pagamento via PIX (pre-pago).
- Politica de Privacidade e Exclusao de Dados do app hospedadas em itacaiugo.com.br (/politica-de-privacidade-2/ e /exclusao-de-dados/).
- Banco de dados NAO e usado: DATABASE_URL fica vazio no `.env` e a persistencia e pulada.

Aprendizados da Marketing API v23 (ja corrigidos no codigo): campanha exige `is_adset_budget_sharing_enabled`; ad set exige `targeting_automation.advantage_audience`; CTA de hospedagem e `BOOK_NOW` (nao BOOK_TRAVEL_NOW). Ver [[user-e-leigo-em-ads]].

Para nova campanha: `bun run nova-campanha` (assistente) ou editar uma ficha em campanhas/ e rodar `bun run criar campanhas/<arquivo>.ts`.
