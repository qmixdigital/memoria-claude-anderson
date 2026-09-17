---
name: qmix-geracao-conteudo-ia
description: "Pipeline de geração de artigo por IA do qmix-next (5 etapas, com Factual Guard e notas de humanização/E-E-A-T); modelos, gotchas e limites"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-03T22:59:54.187Z
---

Desde 2026-09-03 a **geração de artigo pelo próprio cliente** está ativa no qmix-next e roda em **5 etapas**, todas visíveis para o cliente por barra de progresso.

**Onde aparece:** `/enviar-dados/<pedidoId>` (`ContentGenerator.tsx`), só quando a entrega está em `dados-enviados`, com `anchor_text1` + `url1` e **sem** `url_artigo_cliente`.

**Pipeline (≈2min30 no total):**
1. `/api/ai/pesquisar` (~30s) — Sonnet 5 + `web_search_20250305`, dados reais com fonte e ano.
2. `/api/ai/suggest-titles` (~32s) — até 10 temas ancorados na pesquisa, limite rígido de 70 caracteres.
3. `/api/ai/generate-content` (~75s) — **Opus 5**, max_tokens 12000, 1.200 a 1.600 palavras.
4. `/api/ai/revisar` (~58s) — **Factual Guard** (`src/lib/factual-guard.ts`) + análise determinística + polimento condicional.
5. Cliente lê, edita à mão, **pede ajustes** em campo livre (reescreve com o mesmo título) ou aprova.

**Factual Guard** (portado do EVTE Writer, `factual_guard_codigo_atual.py`): Sonnet 5 com busca na web devolve JSON de correções pontuais. Só aplica patch quando o trecho aparece **exatamente uma vez** e **não encosta em nenhum `<a>`** (a âncora é o produto vendido). Falha técnica nunca destrói o artigo. `needs_fix` sem correção aplicável vira `needs_review`, não `pass`. Teste real: 6 buscas, pegou "US$ 83" e "74%" atribuídos vagamente a "levantamentos internacionais" e trocou pela fonte nomeada (pesquisa Authority Hacker, 755 link builders).

**Análise determinística** (`src/lib/quality-analysis.ts`, custo zero, portada de `humanization_analysis.py` + `eeat_analysis.py`): humanização 0-100 por 10 métricas (desvio de tamanho de frase/CV, TTR em janela de 100 palavras, repetição de abertura de parágrafo, estrutura consecutiva, clichês de IA) e E-E-A-T 0-100 por 6 dimensões com **Trust pesando 25%**. Pisos: humanização ≥75, E-E-A-T ≥65. Abaixo disso roda **uma** reescrita dirigida (`polirArtigo`) e só troca se a soma das notas subir. Teste real: 90 e 82.

**Modelos:** pesquisa/títulos/factual = `claude-sonnet-5`; artigo e polimento = `claude-opus-5` (max_tokens 12000 porque Opus gasta tokens em bloco `thinking` antes do texto). O ID `claude-sonnet-4-6-20250514` não existe.

**GOTCHA — `temperature` é descontinuado no Sonnet 5.** Mandar o parâmetro devolve HTTP 400 `invalid_request_error`, e como o guard engole a exceção o sintoma é só `status: failed` em 1 segundo, sem erro visível na UI.

**GOTCHA Nginx:** `location /api/ai/` com `proxy_read_timeout 180s` + `proxy_next_upstream off` nos **dois** server blocks de `/etc/nginx/conf.d/qmix.conf` (80 e 443; o Cloudflare fala com a origem no 443).

**Rate limit** (`src/lib/ai-rate-limit.ts`): conta só `endpoint = 'generate-content'` (constante `ENDPOINT_COBRADO`). O limite é de ARTIGOS (5/hora, 20/dia), não de chamadas: contar cada etapa faria um artigo só estourar o teto.

**Testar por curl:** dá para chamar pelo domínio com User-Agent de navegador e cookie `qmix-token` assinado com o `JWT_SECRET` do `.env` (`SignJWT({id:<clienteId>})` do `jose`). Ver [[qmix-deploy-atomico]].

**Editor do artigo do cliente (16/09/2026):** `enviar-dados/[pedidoId]/EditorArtigo.tsx` (TipTap 3: H2/H3, listas, link com caixa, desfazer, "Arrumar parágrafos", conferência ao vivo das âncoras contratadas). Limpeza do que se cola em `src/lib/html-colado.ts` (lê classes de negrito do Google Docs, desembrulha google.com/url, parágrafo em negrito curto vira H2; primeiro H2 de um colar em editor vazio vira o título). O campo "cole o link do seu artigo" foi removido: o cliente cola o texto no Passo 2. `approve-content` compara URLs sem protocolo/www/barra. Regra do Anderson: cliente leigo cola (Ctrl+V); nunca pedir arquivo/link.

**Assistente em 3 passos (16/09/2026, aprovado pelo Anderson em teste completo):** `/enviar-dados/[pedidoId]` mostra UM passo por vez (`Stepper` em `EnviarDadosClient.tsx`; `ContentGenerator` avisa a fase por `onFase`). Passo 1 = só âncora + URL (até 2) + vídeo, botão "Continuar para o passo 2" (o "Salvar todos" foi removido a pedido). Passo 2 = escolha: **Gerar** (Opus 5 + prompt QMIX) / **Colar meu artigo** (step `colando`: título + `EditorArtigo`, foto obrigatória) / **Deixar com a equipe** (painel explica que a equipe insere âncora+link e pergunta se pode mandar o texto por WhatsApp; action `deixarComEquipe` em `enviar-dados/actions.ts` → `entregas.redacao_equipe_em`, `conferencia_whatsapp`, status `em-producao`, rascunhos descartados, Telegram "✍️ Conteúdo por nossa conta"). Passo 3 = preview com link do cliente em **fundo amarelo** (`.artigo-cliente a`), revisão, foto, "Enviar para Publicação"; botões "Escolher outro título" e "Mudei de ideia: colar meu próprio texto". `ColarArtigo.tsx` foi apagado.

**Limite de custo:** `LIMITE_GERACOES_ENTREGA = 2` gerações de IA por entrega (`contarGeracoes` em `ai-guard.ts`, descartadas contam; `modelo` 'cliente' e 'equipe-qmix' não), cobrado no servidor em `generate-content` (403) e refletido na UI. Orientações do cliente ("quero que fale de…", até 600 chars, `limparOrientacoes`) entram em pesquisa, títulos e artigo e ficam em `entregas.sugestao_tema`.

**Gotchas do assistente:** closure velho em `handleConferir` já gravou `<p></p>` por cima de um artigo colado (agora recebe o HTML explícito); rascunho apagado no banco com a aba antiga aberta mostrava artigo fantasma (GET sem rascunho zera o estado; `SeletorImagem` 404 → `onConteudoSumiu`; `ContentGenerator` tem `key` por status da entrega). Rótulo do pedido em Meus Pedidos sai das entregas, não do `pedidos.status` (que para em `dados-enviados`).

**Teste:** pedido 115 / entrega 189 / cliente 3 (qmixdigital@gmail.com). Zerar: `delete from conteudos_gerados where entrega_id=189; update entregas set status='pendente-dados', anchor_text1=null, url1=null, anchor_text2=null, url2=null, sugestao_tema=null, redacao_equipe_em=null, conferencia_whatsapp=null where id=189; update pedidos set status='confirmado' where id=115`. Apagar de vez quando o Anderson liberar: `delete from conteudos_gerados where entrega_id=189; delete from entregas where id=189; delete from pedidos where id=115`.
