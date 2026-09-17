---
name: kws-keyword-opportunity-finder
description: Ferramenta KWs em d:\SISTEMAS\KWs para achar oportunidades de artigos a partir de exports de SEO
metadata: 
  node_type: memory
  type: project
  originSessionId: 79a0d387-01ee-48f3-bb5b-bd6c2654735f
---

Projeto **KWs** em `d:\SISTEMAS\KWs` — script Python `find_opportunities.py` que analisa exports de SEO (Semrush, Google Search Console, Ahrefs ou qualquer arquivo com URL + palavra-chave) e encontra oportunidades de artigos.

**Fluxo:** jogar arquivos em `input/` → rodar `python find_opportunities.py` → saída `.xlsx` salva no **Desktop** com nome `{domínio} oportunidades de artigos.xlsx` (domínio extraído das URLs).

**Saída (7 colunas):** A = palavra-chave/semente · B = título SEO (50–65 chars, pt-BR com acentos) · C = Ação (`Fazer artigo novo` / `Melhorar o conteúdo`; descarta #1–3) · D = Link (URL atual clicável nos de melhorar; em branco nos novos) · E = Palavras-chave do artigo (todas as variações do cluster, a cobrir como H2/H3/FAQ na mesma página) · F = Concorrentes (URLs da SERP pesquisados na web) · G = Orientação de escrita (briefing completo por artigo alinhado ao manual). Planilha com banding zebra, painel congelado, autofiltro, altura de linha por conteúdo.

**Concorrentes (coluna F):** vêm de `competidores.json` (raiz, `{keyword:[urls]}`) — opcional. O script exporta `artigos_novos.json` (keyword+título) para a etapa de pesquisa; pesquisar a SERP (excluindo o próprio domínio) e salvar em `competidores.json`, depois rodar de novo. `make_brief()` gera a coluna G; retém todas as keywords do cluster em E.

**Clustering = LEADER clustering** (cada keyword compara só ao representante do grupo, de maior volume; sem união transitiva). Trocado do union-find single-link porque keywords-ponte (ex. "sonhar com gato e rato") encadeavam temas distintos num blob gigante (deu 4010 kws num cluster). `CLUSTER_THRESH=0.6`. Ainda NÃO funde variações de mesma intenção com tokens diferentes (ex. RG: "como ver o numero do rg" vs "onde fica o identificador do rg") — intencional; o manual prevê "mapa de clusters" humano. Sinalizar esses grupos ao usuário.

**Filtro de sugestões broad-match (anti-ruído):** arquivos tipo Ubersuggest/broad-match têm muito ruído off-theme que compartilha 1 palavra. Por isso: (a) relevância por BIGRAMA — a sugestão precisa compartilhar um par de palavras consecutivas recorrente no site (`MIN_BIGRAM_FREQ=2`), ex. "sonhar com"; (b) exige ≥2 tokens de conteúdo (mata fragmentos como "sonhar com"); (c) `SUGGEST_BLOCKLIST` — termos que compartilham vocabulário mas têm intenção totalmente diferente (sonho de valsa=bombom, praia do sonho=lugar, sonho de uma noite=Shakespeare, loteria dos sonhos); (d) teto `MAX_SUGGESTIONS=150` top-por-score, com log do que ficou de fora.

**Anti-canibalização no clustering (`content_tokens`):** normaliza qualquer conjugação do verbo/substantivo `sonh*` → "sonhar" e remove FILLER (significa/significado/oque/qual). Sem isso, "sonho com sapos" ≠ "sonhar com sapo" e "o que significa sonhar com X" viravam artigos separados que canibalizam. Auditoria SEO da planilha (pedida pelo usuário) confirmou: 0 título >65, 0 char proibido, ação↔link consistente, 0 self-domain nos concorrentes; canibalização caiu de ~11 grupos para 0 reais (restam só pares de intenção distinta: "sonhar que está grávida" vs "sonhar com mulher grávida"; "água suja" vs "muita água").

**Regra anti-canibalização (crítica):** nunca sugerir artigo novo para tema já posicionado (pos ≤ POSITIONED_MAX=10, página 1) — viraria canibalização; nesse caso classifica como "melhorar". Só vira "novo" quando ninguém está posicionado para a intenção. Espelha o manual da rede `instrucoes-projeto-conteudo-seo-portais-proprios` (seção 2: variações viram seção/FAQ da canônica, não páginas novas).

**Sugestões sem URL (Ubersuggest/Keyword Magic):** colocar em `input/sugestoes/`. Viram candidatos a artigo novo, mas só entram se (1) dentro de volume/KD, (2) do tema que o site já cobre, (3) sem página posicionada do site para a intenção, (4) sem duplicar oportunidade/sugestão. Parser numérico pt-BR (110.000=110000, 6,1milhões). Há molde de título especial p/ "jogo do bicho + animal" → "{Animal} no Jogo do Bicho: Tabela, Grupo e Dezenas".

**viajenodetalhe.com.br é site de CONTEÚDO GERAL** (utilidade, curiosidades, datas, frases, dúvidas). Por isso a planilha deve entregar tanto os "melhorar" quanto os "novos que não canibalizam", **abrangendo todos os temas relacionados — inclusive tangenciais** (ex.: jogo do bicho como aposta E como novela/série/filme/meme). Não estreitar para um único sub-nicho; o único corte real é a canibalização (não criar novo onde já há página posicionada).

**Dedup (Semrush duplica keywords):** o export traz a mesma keyword+URL repetida (desktop/mobile/timestamps) — dedup mantém a de melhor posição. Dedup FINAL por keyword e por URL: (a) mesma busca em 2 linhas via URLs diferentes (canibalização on-site) → colapsa, recomendar 301; (b) `melhorar` é deduplicado por URL → 1 linha por artigo existente, variações vão pra coluna E.

**Reclassificação novo→melhorar (anti-canibalização forte):** `find_existing_page` cruza a keyword contra TODAS as URLs do site: se um slug cobre a keyword por token-overlap≥SLUG_MATCH, containment despaçado, token-do-slug-como-substring (ex.: "you tube"→youtube), OU **match fuzzy de token** (difflib≥0.88, pega typos: snaptijk~snaptik), o site JÁ TEM a página → vira "melhorar".

**Consolidação de typos/quase-duplicatas:** passe difflib (ratio≥0.85 na string despaçada) junta variantes/erros de grafia num só artigo (ex.: 9 grafias de "snaptik" = 1 linha, demais vão pra coluna E). `OPPORTUNITY_BLOCKLIST` remove conteúdo brand-unsafe/adulto de TODAS as oportunidades.

**Fold novo→melhorar por intenção (sinônimo/ordem invertida):** depois do find_existing_page, um passe dobra um "novo" numa oportunidade "melhorar" existente quando compartilham ≥2 tokens distintos (len≥4) e jaccard≥0.5 (ex.: "roupa formatura homem"→página "...masculino"; "hytalo santos e kamilynha"→"kamylinha e hytalo santos"). Roda ANTES da dedup-por-URL pra colapsar a duplicata. Resíduos que escapam (typo sem página equivalente "athivos"=arquivos, "iamina"=nome; gossip efêmero) = flag editorial manual.

**Inclusão forçada (`input/forcar/*.csv`):** keywords curadas entram como artigo novo SEM filtro de tema/volume (`read_forced`) — usado p/ injetar lotes off-theme (ex.: 28 "jogo do bicho fáceis" no advivo). Formato: Keyword[,Volume,Keyword Difficulty]. **Lembrar de limpar `input/forcar/` ao trocar de site.**

**Google Search Console (ZIP):** usar `gsc_convert.py <pasta_extraida> <dominio>`. O GSC separa Consultas (keywords) e Páginas (URLs) — o conversor casa cada consulta à sua página via slug e gera `input/<dominio>-gsc.csv` no formato Semrush-like (Keyword, Position, Search Volume=Impressões, URL); depois roda o tool normal. Melhorar=consulta que já ranqueia numa página do site (pos 4-70); Novo=consulta sem página. **ATENÇÃO ao formato numérico do GSC: é INGLÊS ('.'=decimal, ex. posição "3.14", CTR "1.46%"), diferente do Semrush pt-BR ('.'=milhar). O conversor já trata; não passar posição do GSC pelo to_int pt-BR (viraria 314).** Site médico ranqueia bem → poucos "novos", muitos "melhorar posição" (pos 4-10 subindo p/ top 3). content_tokens agora mantém códigos alfanuméricos curtos (l4/l5/s1/c5 da coluna, 4k) — antes descartava por terem 2 chars.

**Config no topo do script:** MIN_VOLUME=200, MAX_KD=35, POS_MIN/MAX=4/**70** (subido de 40: portais da rede ranqueiam fundo, pos 41-70 = backlog real de melhoria), POSITIONED_MAX=10, SLUG_MATCH=0.50, TITLE_MAX=65, INCLUDE_CONTEXT=False. Títulos por template determinístico (sem IA) com detecção de intenção. NÃO é repo git.
