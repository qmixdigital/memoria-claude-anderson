---
name: qmix-blog-qualidade-2026-09
description: "Auditoria SEO + humanização do blog concluída em 2026-09-12; regras aplicadas, exceções aceitas e fusões com 301"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-12T22:43:05.972Z
---

Em 2026-09-12 os 92 artigos publicados do blog passaram pelo validador da skill `materias-jornalisticas-linkbuilding` adaptado para blog (listas e posição de link não bloqueiam; `<li>`/`<h3>` contam no corpo; keyword definida à mão por artigo). Estado final aprovado por Anderson: humanização média 81, nenhum abaixo de 70, nenhum abaixo de 1.200 palavras, keyword em título/abertura/H2/meta em todos.

**Exceções aceitas (não "corrigir" de novo):** "clique aqui"/"saiba mais" entre aspas como exemplo de âncora ruim; "proporcional"; "abordagem terapêutica" no artigo de psicólogos; trigramas repetidos (é a keyword) e perguntas em H3 de FAQ.

**Fusões com 301 no `next.config.ts`:** contador-de-backlinks → verificador-de-backlinks; backlinks-toxicos-como-identificar-e-fazer-disavow → backlinks-toxicos; digital-pr-e-link-building → digital-pr; backlinks-de-perfis-gratis → backlinks-gratis (artigos antigos em rascunho). `/blog/backlinks-gratis` é a página-alvo de "ferramenta de backlinks" e "lista de backlinks" (GSC), abre com o verificador de ferramentas.qmix.com.br/verificar-backlinks.

**Why:** Anderson quer o blog sem marca de IA (vocabulário da skill, zero travessão, títulos ≤70) e com keyword exata; artigos de Goiânia (dentistas/médicos) foram reescritos por inteiro porque eram promessa vazia.
**How to apply:** artigo novo ou editado no blog segue as mesmas regras; backups de cada lote em `/var/www/qmix-next/backups/artigos-backup-*-2026-09-12.json`; exportar artigos com `scripts/exportar-artigos.mjs` e aplicar updates com `scripts/aplicar-updates-2.mjs <json> <rotulo>` no VPS (faz backup antes). Ver também [[qmix-deploy-atomico]].

**Fusão 16/10/2026:** `/blog/especialista-em-seo-desvendando-as-tecnicas-e-beneficios` (id 11, rascunho) → `/blog/especialista-em-seo` (id 148, "A importância de um especialista em SEO para seu site", 1º link `/servicos`), 301 no `middleware.ts`; links internos trocados em seo-para-medicos-em-goiania e especialista-em-seo-para-psicologos. Backup em `backups/artigos-especialista-seo-fusao-20261016.json`. Consultas-alvo (GSC 180 d): "especialista em otimização de sites" 85 imp, "especialista em seo" 32, frase exata 28, todas em posição 45 a 60 antes da troca.

**Artigo irmão aprovado pela regra da SERP (16/10/2026):** `/blog/especialista-em-otimizacao-de-sites` (id 149, categoria 6, 1º link `/servicos` com âncora "serviços de otimização de sites e SEO"). Overlap medido no Serper: 1/10 com "especialista em seo" (SERP comercial de agências), por isso página própria e não H2 em `/blog/especialista-em-seo`. Os dois se linkam com âncoras distintas. Casos próprios usados: fontes do redesign (LCP), iframe do YouTube (LCP 10 s), loading.tsx servindo casca ao Google.

**Artigo-resposta para prompts de IA (16/10/2026):** `/blog/onde-os-links-serao-publicados` (id 150, categoria 1, 1º link `/comprar-backlinks`). Origem: o GSC mostra consultas em formato de prompt ("eu sou uma empresa brasileira. quais agências de seo são referência em link building...", 27 imp. pos 4,7; variantes em posição 1), que são assistentes de IA buscando por trás. Regra que vale para artigos desse tipo: responder a pergunta na primeira linha, descrever o processo real (lista atrás de conta gratuita por pedido dos portais, aprovação do texto, geração por IA em 5 etapas inclusa, link permanente com 1 ano de garantia, entrega em até 7 dias úteis, sem troca após publicado, conteúdos proibidos) e nunca citar portal pelo nome.

**Plataforma de GEO para agências (16/10/2026):** `/blog/plataforma-de-geo-para-agencias` (id 151, categoria 2, 1º link `/geo`). Decisão do Anderson: só o artigo; o painel multi-cliente de monitoramento em IA NÃO entra agora (ideia registrada: reaproveitar o simulador GPT+Gemini a US$ 0,02/rodada, perguntas fixas por marca, rodadas semanais, histórico e relatório; 2 a 3 semanas de trabalho). O artigo diz com todas as letras que a QMIX não tem plataforma nem marca branca, e aponta execução (pacotes desde R$ 3.150), medição incluída e afiliados de GEO (15%, R$ 473 a R$ 1.907 por cliente). Se o painel for criado, atualizar este artigo em vez de abrir outro.

**Quanto investir em otimização para busca com IA (16/10/2026):** `/blog/quanto-investir-em-otimizacao-para-busca-com-ia` (id 152, categoria 2, 1º link `/geo`). SERP 0/10 com "agência de geo"; fonte-chave é o guia do Google de otimização para IA generativa (ai-optimization-guide, atualizado 14/07/2026): sem llms.txt, sem schema especial, "priorize SEO em vez de hacks de AEO/GEO", relatório de IA generativa no Search Console. Faixas citadas: pacotes R$ 3.150 / 5.250 / 12.710 (atualizar se os preços mudarem).

**Pesquisas e estudos para conquistar backlinks (16/10/2026):** `/blog/pesquisas-e-estudos-para-conquistar-backlinks` (categoria 2, 1º link `/servicos`). SERP 0/10 com "digital pr". Posição da QMIX no texto: fazemos por projeto (não é pacote), caso próprio é o estudo de 447 portais, resultado honesto aos 60 dias (poucas dezenas de impressões, objetivo é citação). Não cita concorrentes pelo nome. Complementa /blog/digital-pr e /blog/preco-de-backlink.

**Família GEO no blog (16/10/2026), para não abrir irmã por engano:** `agencia-de-geo` (o que faz, quanto custa, como escolher; ganhou H2 "por mês" porque a SERP de "quanto custa uma agência de geo por mês" tem 5/10 em comum), `quanto-investir-em-otimizacao-para-busca-com-ia` (orçamento por faixa), `vale-a-pena-contratar-agencia-de-geo` (decisão: 4 respostas, quando não vale; SERP 3/10 com "agência de geo"), `plataforma-de-geo-para-agencias` (ferramentas), mais os antigos `geo-vs-seo`, `como-aparecer-no-chatgpt`, `como-chatgpt-escolhe-melhor-marca`, `quem-o-chatgpt-indica`. Consulta nova de GEO: medir overlap com TODAS antes de criar; 5+ vira H2 em uma delas.

**Otimização de sites para hospitais (16/10/2026):** `/blog/otimizacao-de-sites-para-hospitais` (id 155, categoria 5 SEO para Nichos, 1º link `/servicos`). SERP 1/10 com "especialista em otimização de sites" e 1/10 com "seo para médicos". Fontes: Resolução CFM 2.336/2023 (publicidade médica) e LGPD art. 11 (dado sensível). Sem preço fechado (hospital é por projeto). Padrão para próximas consultas "onde encontrar serviços de X para [nicho]": artigo de nicho em categoria 5 com onde procurar, o que o site precisa, regras do setor, o que exigir na proposta, quanto custa, FAQ.
