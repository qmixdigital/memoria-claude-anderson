# Briefing do lote medicoespecialistas.com (14/10/2026, sites do Jean via MCP)

Leia `plano.json` para o item que lhe foi designado (campo `n`). Cada item tem: portal,
destino_url (URL real do cliente a linkar), destino_tema, pauta, kw_post (palavra-chave do
SEU artigo, diferente do tema do destino) e ancora (texto exato do link, com a keyword do
destino).

## Sobre o cliente

medicoespecialistas.com é um diretório nacional (próprio da QMIX) de médicos e clínicas,
organizado por especialidade, por UF/cidade e com páginas de conteúdo/verificação sobre
como identificar um especialista (CRM, RQE, encaminhamento SUS). Não é médico nem clínica
específica, é diretório. Sem CRM/RQE a citar como credencial do "cliente" (ele é o
diretório, não um profissional específico).

## Âncora e golden rule

A âncora do item vai no primeiro parágrafo ou o mais perto possível disso, na primeira
menção ao tema do destino. A keyword do SEU artigo (`kw_post`) é diferente do tema do
destino: vocês escrevem sobre um sintoma, dúvida ou situação prática (dor de cabeça
frequente, mancha na pele, levar a criança ao pediatra etc) e o link para o diretório
entra como "para quem busca X (âncora), existem diretórios como..." ou formato
equivalente natural, do tipo "vale a pena consultar [âncora]" ou "é possível encontrar
[âncora] perto de você".

## Rigor factual (tema de saúde, YMYL)

Este é tema de saúde (YMYL): rigor factual obrigatório.
- Siglas por extenso na primeira ocorrência (CRM, RQE, SUS, CRM, UBS).
- Nunca diagnosticar, nunca prometer cura, nunca substituir orientação médica. O artigo
  descreve sinais/situações que justificam buscar avaliação profissional, sempre com a
  ressalva de que o diagnóstico cabe ao médico.
- Não inventar estatística de prevalência sem fonte. Se usar dado, usar fonte geral
  verificável (CFM, Ministério da Saúde, OMS, SBC, SBD e outras sociedades médicas por
  especialidade, conforme o tema do artigo).
- Sem nome de médico, clínica ou hospital específico como recomendação.

## Praça regional (ver `praca_portal` de cada item)

- **Itens 03 (alagoasdiario/Alagoas), 04 (abadianoticia/Abadiânia-GO), 08
  (itapecurunoticias/Itapecuru-Mirim-MA), 09 (noticiasdefloriano/Floriano-PI)**: o
  portal TEM praça própria confirmada (ver campo `praca_portal`). Inclua uma menção
  local genuína dessa praça real no corpo do artigo. O destino é nacional (diretório),
  então a menção local é sobre a realidade do leitor do portal, não sobre o destino.
- **Itens 01, 02, 05, 06, 07, 10**: sem praça fixa confirmada. **Não inventar nem
  inferir** cidade/estado do portal. Trate o artigo como nacional/genérico.

## Encaixe editorial por portal

- **Item 03 (alagoasdiario)**: o portal já tem conteúdo de saúde sobre dor articular
  (/saude/dor-externa-no-joelho/, /saude/caibras-e-desconfortos-noturnos/). A pauta de
  ortopedia encaixa naturalmente; cite esse acervo como candidato a link interno.
- **Item 05 (astralassessoria)**: portal de dúvida prática/direitos. A pauta sobre
  verificar CRM/RQE tem um ângulo de "direito do paciente" / "proteção do consumidor"
  que combina bem com o tom do portal, sem precisar forçar jargão jurídico.
- **Item 09 (noticiasdefloriano)**: a página de destino já está bem posicionada (posição
  6 no Google), então o objetivo aqui é reforçar autoridade e trazer tráfego qualificado,
  não "resgatar" uma página mal posicionada. Escreva normalmente, sem mencionar isso no
  texto.

## Links internos (prioridade: artigos RECENTES do próprio portal, máximo de links)

Depois de escrever o corpo, pesquise no próprio portal (busca no site, RSS ou arquivo)
por 2 artigos **recentes** e genuinamente relacionados ao tema do seu artigo (saúde,
bem-estar, sintomas, cuidados, ou o assunto adjacente do próprio portal). Insira como
parágrafo final (antes do último parágrafo real), no formato:
`<p><strong>{Rótulo}:</strong> <a href="URL1">âncora1</a> e <a href="URL2">âncora2</a>.</p>`
Rótulo variando (não repetir o anterior do mesmo portal): Leia também, Leia mais, Veja
também, Relacionadas, Mais sobre o tema, Continue lendo.

**Instrução do operador para este lote: maximizar links internos.** Pule só se depois de
pesquisar genuinamente não houver NENHUM artigo relacionado no portal. Tente também
termos adjacentes de saúde/bem-estar/sintomas antes de desistir.

**Cuidado com contaminação:** alguns destes portais têm páginas antigas na editoria de
Filmes e Séries com link para concorrentes de IPTV (teste-iptv.net, nexoplay.mov e
similares). Isso NÃO afeta a editoria de Saúde, mas nunca escolha uma dessas páginas
contaminadas como link interno, mesmo que apareça na busca por acidente.

## Validação

Rodar `validador_materia.py` com `--links N --titulo --kw --resumo` (N = quantidade total
de links: 1 do cliente + os internos). Corrigir qualquer bloqueio (XX) antes de entregar.
Atenção a âncoras de link interno longas demais (o validador reprova âncora que parece a
frase inteira do título de destino) — encurte se acusar.

## Imagem

Banco de fotos grátis (Pexels/Pixabay/Wikimedia), termo de busca em inglês, tema médico
genérico (consulta, estetoscópio, consultório, exame) SEM mostrar rosto de médico
específico nem logo de hospital real. Olhar a imagem antes de entregar: nada de texto em
outro idioma visível, nada de logo de empresa/hospital real, nada de anatomia estranha.
