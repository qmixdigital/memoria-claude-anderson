---
name: linkagem-interna-por-ultimo
description: "No cirurgiacoracao, a malha de links internos é a ÚLTIMA etapa, só depois de melhorar e ampliar o conteúdo"
metadata: 
  node_type: memory
  type: project
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T11:15:11.645Z
---

Ordem de trabalho definida pelo Anderson em **19/08/2026** para o cirurgiacoracao.com.br:

1. **Poda** — feita: 648 artigos apagados, sobraram 142.
2. **Melhorar os conteúdos existentes** — pendente.
3. **Inserir conteúdos novos** — pendente.
4. **Linkagem interna** — só aqui, por último.

**Why:** construir a malha antes de o conjunto de artigos estar fechado significa refazer tudo a cada artigo novo ou apagado, e apontar link para página que ainda vai mudar de escopo.

**How to apply:** não sugerir nem implementar linkagem interna antes das etapas 2 e 3 estarem concluídas. Quando chegar a hora:

- Todos os links internos do corpo dos artigos **já foram removidos** (261 links em 70 artigos, em 19/08/2026). A malha começa do zero.
- O `autoLinkContent()` do receptor do Antônio (`src/app/api/wp-json/sistema-qmix/v1/artigos/route.ts`) foi **desligado** para não reinjetar link em artigo novo. A lógica continua inteira em `src/lib/auto-link.ts`; religar é descomentar o import e a chamada.
- Vale reaproveitar as regras de âncora do CLAUDE.md global: âncora com a keyword do destino, variações naturais, um link por destino por página.

Ver [[cirurgiacoracao-onde-fica]] e [[cirurgiacoracao-criterio-poda]].
