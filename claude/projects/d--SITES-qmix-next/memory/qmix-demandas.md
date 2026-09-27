---
name: qmix-demandas
description: Demandas do admin: qualquer usuário cria, janela início/fim, datas só de quem criou
metadata:
  type: project
---

/admin/demandas (qmix.com.br), como ficou em 22/09/2026 por pedido do Anderson:

- **Qualquer usuário logado cria demanda**, para si ou para outro. A página saiu do bloqueio de administrador e entrou em `ROLE_SIDEBAR_ACCESS` de todos os cargos. Administrador vê e apaga todas; os demais veem o que criaram e o que receberam (`listarDemandasDe`).
- **Janela de datas**: coluna `inicio` (date) somada ao `prazo` já existente, que virou o "fim". Migração em `drizzle/20260922_demandas_inicio.sql`, já aplicada na VPS.
- **A demanda só aparece no dashboard de quem recebeu a partir do início** (`listarDemandasAbertasDe` filtra `inicio is null or inicio <= hoje`, fuso de São Paulo). Passado o fim, ela **não some**: fica marcada como vencida até ser concluída.
- **Só quem criou muda as datas** (`alterarDatasDemanda` confere `criadoPorId`), nem o administrador mexe na dos outros. Apagar: administrador ou quem criou.
- Componente `JanelaDemanda` (em `FormDemanda.tsx`) mostra o selo e, para o criador, abre os dois campos de data. Selo azul = agendada, laranja = termina hoje, vermelho = vencida.

Ver também [[qmix-deploy-atomico]].
