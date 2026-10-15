# Briefing do lote examesperto.com (14/10/2026, sites do Jean via MCP)

Leia `plano.json` para o item que lhe foi designado (campo `n`). Cada item tem: portal,
destino_url (URL real do cliente a linkar), destino_tema, pauta, kw_post (palavra-chave do
SEU artigo, diferente do tema do destino) e ancora (texto exato do link, com a keyword do
destino).

## Sobre o cliente

examesperto.com é um diretório nacional (próprio da QMIX) de laboratórios e clínicas de
exames diagnósticos (sangue, imagem, endoscopia, ressonância), organizado por UF/cidade/
tipo de exame, com páginas de conteúdo sobre preparo e cobertura (SUS, convênio). Não é
laboratório específico, é diretório.

## Âncora e golden rule

A âncora do item vai no primeiro parágrafo ou o mais perto possível disso, na primeira
menção ao tema do destino. A keyword do SEU artigo (`kw_post`) é diferente do tema do
destino: vocês escrevem sobre um aspecto prático de preparo/dúvida sobre exame e o link
para o diretório entra como "para encontrar [âncora], existem diretórios como..." ou
formato equivalente natural.

## Rigor factual (tema de saúde, YMYL)

Este é tema de saúde (YMYL): rigor factual obrigatório.
- Nunca diagnosticar, nunca prometer resultado de exame, sempre com a ressalva de que a
  interpretação do exame cabe ao médico solicitante.
- Jejum de exame de sangue: o padrão mais comum pedido pelos laboratórios é 8 a 12 horas,
  mas VARIA por exame e por laboratório — nunca afirme um número único como regra
  universal, sempre diga "o laboratório ou o médico que pediu o exame informa o tempo
  exato".
- Não inventar estatística de espera do SUS ou de resultado de exame sem fonte. Se usar
  dado, usar fonte geral verificável (Ministério da Saúde, CFM, sociedades médicas por
  especialidade).
- Sem nome de laboratório ou clínica específica como recomendação.

## Praça regional (ver `praca_portal` de cada item)

- **Itens 03 (alagoasdiario/Alagoas), 04 (abadianoticia/Abadiânia-GO), 08
  (itapecurunoticias/Itapecuru-Mirim-MA), 09 (noticiasdefloriano/Floriano-PI)**: o
  portal TEM praça própria confirmada. Inclua uma menção local genuína dessa praça real
  no corpo do artigo (o destino é nacional/diretório, a menção local é sobre a realidade
  do leitor do portal, não sobre o destino).
- **Itens 01, 02, 05, 06, 07, 10**: sem praça fixa confirmada. **Não inventar nem
  inferir** cidade/estado do portal. Trate o artigo como nacional/genérico.

## Encaixe editorial por portal

- **Item 05 (astralassessoria, portal de dúvida prática/direitos)**: a pauta sobre
  direito do paciente de entender o resultado do exame tem um ângulo de "proteção do
  consumidor/paciente" que combina com o tom do portal, sem forçar jargão jurídico.

## Links internos (prioridade: artigos RECENTES do próprio portal, máximo de links)

Depois de escrever o corpo, pesquise no próprio portal (busca no site, RSS ou arquivo)
por 2 artigos **recentes** e genuinamente relacionados ao tema do seu artigo (saúde,
bem-estar, sintomas, cuidados). Insira como parágrafo final (antes do último parágrafo
real), no formato:
`<p><strong>{Rótulo}:</strong> <a href="URL1">âncora1</a> e <a href="URL2">âncora2</a>.</p>`
Rótulo variando (não repetir o anterior do mesmo portal): Leia também, Leia mais, Veja
também, Relacionadas, Mais sobre o tema, Continue lendo.

**Instrução do operador para este lote: maximizar links internos.** Pule só se depois de
pesquisar genuinamente não houver NENHUM artigo relacionado no portal.

**Cuidado com contaminação (achado do lote anterior, garopaba.ia.br, 14/10/2026):**
algumas páginas de editorias generalistas destes portais têm link de saída escondido para
serviço de acompanhantes (Oklute, musaclass.com.br) ou para concorrentes de IPTV
(teste-iptv.net, nexoplay.mov). **Antes de usar qualquer artigo como link interno, abra a
página e confira TODOS os links de saída do corpo, não só o tema** — se tiver link para
esse tipo de site, descarte e procure outro candidato. Isso raramente afeta a editoria de
Saúde pura, mas confira mesmo assim.

## Validação

Rodar `validador_materia.py` com `--links N --titulo --kw --resumo` (N = quantidade total
de links: 1 do cliente + os internos). Corrigir qualquer bloqueio (XX) antes de entregar.
Atenção a âncoras de link interno longas demais (o validador reprova âncora que parece a
frase inteira do título de destino) — encurte se acusar.

## Imagem

Banco de fotos grátis (Pexels/Pixabay/Wikimedia), termo de busca em inglês, tema médico
genérico (blood test, medical lab, MRI scan, endoscopy equipment) SEM rosto de médico
específico nem logo de laboratório/hospital real. Olhar a imagem antes de entregar: nada
de texto em outro idioma visível, nada de logo de empresa real, nada de anatomia estranha.
