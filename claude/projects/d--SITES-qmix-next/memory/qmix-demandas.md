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

**Botão "Iniciar" (01/10/2026):** quem recebeu a demanda clica em "Iniciar" (dashboard ou /admin/demandas, onde agora também aparece "Marcar como feita" para quem recebeu). Grava `iniciada_em`/`iniciada_por` (migração `drizzle/20261001_demandas_iniciada.sql`) e manda "▶️ Demanda iniciada por X" ao Telegram do admin; clicar de novo não reenvia. Depois vira o selo azul "em andamento", que criador e administrador também veem. O aviso de conclusão passou a trazer a hora de início. Componentes em `BotaoConcluirDemanda.tsx` (`BotaoIniciarDemanda`, `SeloIniciada`).

**Página de detalhe (01/10/2026):** `/admin/demandas/<id>`, aberta pelo título (lista de abertas, concluídas com botão "Ver", e dashboard). Mostra descrição com links clicáveis, para quem, quem criou, janela, início e conclusão. Vê: administrador (todas), quem criou e quem recebeu. Ajusta título, detalhes e destinatário e reabre concluída: administrador ou quem criou (`editarDemanda`, `reabrirDemanda`). Datas seguem só com quem criou. Após salvar/reabrir a página recarrega inteira (`window.location.reload`): o `router.refresh` não atualizava o título depois de um "Reabrir".

**Redesenho e correção do dashboard (01/10/2026):** `MinhasDemandas` agora aparece no dashboard de TODOS os cargos; antes os ramos de `redator` (dashboardLevel 'empty') e `captador` em `(dashboard)/page.tsx` retornavam antes do bloco e a Lúcia não via demanda recebida. Visual novo: `demandas/ui.tsx` (TextoComLinks deixa toda URL clicável e encurtada, Avatar, IconeEstado, estadoDemanda), `CartaoDemanda.tsx` (mesmo card na lista e no dashboard), lista agrupada por estado (Em andamento, Para fazer com atrasadas primeiro, Agendadas, Concluídas), filtro por pessoa via `?de=<userId>`, formulário recolhido atrás de "Nova demanda", ícones lucide no lugar de glifos. Grids com `grid-cols-[minmax(0,1fr)]` e `min-w-0` no card: sem isso o link longo estourava a tela no celular. Ao editar TSX por script Python, cuidado com `\n` em regex (use Edit ou chr(92)): quebrou o build uma vez (deploy.sh barrou).

**Comentários e estado "parada" (01/10/2026, primeiro passo do "CRM" que o Anderson quer montar):** tabela `demanda_comentarios` (demanda_id com cascade, autor, texto, tipo comentario|pausa|retomada) e colunas `demandas.pausada_em/pausada_por` (migração `drizzle/20261001_demanda_comentarios.sql`). `comentarDemanda(id, autor, texto, 'comentar'|'parar'|'retomar')`: comenta quem criou, quem recebeu e o administrador, quantas vezes quiser; parar exige texto (o motivo). Telegram ao admin quando o autor não é o administrador. Estado `parada` vence os demais em `estadoDemanda`; concluir limpa a pausa. UI: seção "Paradas" no topo da lista, bloco âmbar com o motivo no card, contador de comentários, `#comentarios` na página da demanda (`[id]/Comentar.tsx`), eventos no Histórico. Ideia de futuro dita por ele: tudo interligado (demandas, pedidos, clientes).
