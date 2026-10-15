# Brief: redigir artigos de link building (consultarimovel.ia.br), lote de 10

Você escreve **só arquivos de texto** nesta pasta. Não publique nada, não envie nada a serviço
externo, não mexa em outros arquivos. Pesquisa na web (WebSearch/WebFetch) é obrigatória e permitida.

consultarimovel.ia.br é um diretório/ferramenta de consulta de imóvel rural da própria QMIX
(não é cliente terceiro), já autorizado para receber backlink. Cobre CAR, SIGEF, CCIR, ITR,
INCRA, SNCR, embargos do IBAMA, CND de imóvel rural. Conteúdo jurídico/fundiário rural: rigor
factual é obrigatório, sem ser YMYL de saúde.

**Atenção:** este cliente já tem 22 inserções anteriores em outros portais do Jean (campanha
de 19/09/2026). Os 10 portais deste lote são todos novos para este cliente. Varie o ângulo
em relação aos já cobertos (georreferenciamento/SIGEF, CCIR, CAR, embargos IBAMA, ITR, NIRF,
INCRA, SNCR, imóvel rural por estado) — os `kw_post` do plano já foram escolhidos para não
repetir esses ângulos.

## Entrada

`plano.json` (nesta pasta) tem 10 itens. Cada item traz: `portal` (site do Jean que vai
hospedar), `destino_url` (página do cliente que o link empurra), `destino_tema` (o assunto
real dessa página, já com o título real dela), `pauta` (tema do artigo que você vai escrever),
`kw_post` (a keyword exata do post, já escolhida, diferente da página de destino), `ancora`
(texto exato do link), `tipo_ancora` (N natural, P parcial).

## Saída por item (n = "07", por exemplo)

1. `n07.html`: corpo do artigo em HTML (sem `<h1>`, sem `<html>`/`<body>`): só `<p>`, `<h2>`,
   `<h3>` (opcional) e, se ajudar, UMA `<table>` simples. **Nada de `<ul>`/`<ol>`/bullets.**
2. `n07.meta.json`: `{"titulo": "...", "kw": "...", "resumo": "...", "slug": "...", "fontes":
   [{"afirmacao": "...", "url": "..."}], "pendente_verificar": ["..."]}`. O campo `kw` deve ser
   exatamente igual a `kw_post` do plano (não invente outra).

## Regras do artigo (obrigatórias, o validador cobra)

- **Idioma:** português do Brasil, acentuação correta. **Zero travessões** (nem — nem –).
  Terceira pessoa. Sem "você sabia", sem pergunta retórica respondida na sequência, sem
  "primeiramente/por fim".
- **Tamanho:** mínimo 1.200 palavras, **mire 1.400 a 1.600**. 5 a 7 `<h2>`. Varie o tamanho dos
  parágrafos (alguns de uma frase curta, outros de 80 a 110 palavras) e a abertura de cada
  parágrafo (nunca três seguidos começando pela mesma palavra).
- **Vocabulário proibido** (o validador reprova): abordagem, alavanc, ecossistema, soluç
  (solução, soluções, resolução), robusto, insights, stakeholders, proporcion (proporcional,
  proporcionalmente), potencializ, "cada vez mais", "é fundamental", "vale ressaltar", "nesse
  contexto", "no cenário atual", "no mundo atual", descubra, "saiba mais", "clique aqui", "de
  forma eficaz", "de forma eficiente", "transformação digital", "desafios e oportunidades".
- **Link do cliente:** exatamente um link no artigo, `<a href="DESTINO_URL">ÂNCORA</a>`, com o
  texto da `ancora` do plano **sem alterar uma letra**, **dentro do primeiro parágrafo** (ou o
  mais próximo disso, na primeira menção do assunto), e **nenhum outro `<a>` no texto** (os
  links internos entram depois, à parte, no passo de publicação, não neste HTML).
- **Regra de ouro da âncora (cobrada sempre pelo operador, não pode falhar):** a âncora **não
  pode ser igual ao título** do artigo e **não pode ser igual à `kw`** do artigo. O artigo
  responde a uma busca informacional DIFERENTE da página de destino (por isso `kw_post` já veio
  diferente de `destino_tema` no plano).
- **Keyword do artigo (`kw` = `kw_post` do plano):** precisa aparecer **exata** (mesma grafia,
  mesma ordem de palavras) no título, nas primeiras 100 palavras, em pelo menos um `<h2>`, **3 a
  8 vezes no corpo** (densidade abaixo de 3%), e na linha fina (`resumo`). Cada palavra forte da
  kw deve aparecer pelo menos 3 vezes no texto.
- **Título:** até 70 caracteres, sem exclamação, sem "descubra/saiba mais", com a kw.
  **`resumo` (linha fina):** uma frase de 10 a 20 palavras, com a kw, que traz informação nova
  (não repete o título nem o primeiro parágrafo).
- **Slug:** minúsculo, hifens, derivado da kw.
- **Estrutura variada:** os 10 artigos não podem parecer o mesmo esqueleto. Varie a ordem e o
  estilo dos `<h2>`, o tipo de abertura (cena, dado verificado, dúvida comum, erro frequente) e
  o fechamento. Sem call-to-action de venda, sem citar preço, sem nome de escritório/despachante
  específico.
- **Itens 01, 02, 03 (praça regional confirmada, igual ao estado do destino):** inclua uma
  menção local genuína e verificada por busca da praça real do portal (Bahia para item 01,
  Alagoas para item 02, Maranhão para item 03), sem inventar dado. Nestes três a praça do
  portal bate com o estado da página de destino.
- **Item 06 (alagoasdiario):** a praça real deste portal é Alagoas/Maceió (não Minas Gerais,
  que é só o estado da página de destino). Inclua uma menção local genuína de Alagoas, mesmo
  o artigo apontando para a página de Minas Gerais — isso é normal, o link aponta para onde
  há oportunidade de busca, não precisa ser o mesmo estado do portal.
- **Item 08 (afnewss):** a praça real deste portal é Americana, São Paulo (não Tocantins, que
  é só o estado da página de destino). Inclua uma menção local genuína de Americana/SP, mesmo
  apontando para a página do Tocantins.
- **Itens 04, 05, 07, 09, 10 (sem praça fixa confirmada):** xthor (item 07) e jornal.seg.br
  (item 10) são portais generalistas sem praça regional própria; sp2040 (item 04),
  canaljustica (item 05) e professortrabalhista (item 09) também não têm praça. **Não invente
  nem infira uma cidade/estado para o portal nestes cinco itens** — sem menção local, ponto.
- **Item 05 (canaljustica, portal jurídico):** o tema (conflito de posse de terra) é pauta
  legítima para um site de notícias jurídicas, escreva como um editor da casa escreveria, sem
  forçar ângulo nem citar o diretório como patrocinador.
- **Item 09 (professortrabalhista, portal de direito trabalhista):** o portal é trabalhista
  na origem mas aceita pauta fora do tema; pauta agrária entra melhor pela porta do "empregador
  rural". Angule o artigo (comprovar propriedade sem escritura) puxando pelo produtor rural que
  também é empregador e precisa regularizar a terra para financiamento/contratação, sem forçar
  jargão trabalhista que não caiba. Vai para a categoria "Geral" do portal na publicação.

## Rigor factual (tema fundiário/ambiental rural, não é YMYL mas exige precisão)

- **Toda afirmação factual** (prazo, norma, sigla, órgão responsável, exigência documental)
  deve ser **verificada por busca** antes de entrar. Fontes aceitáveis: INCRA, Ministério da
  Agricultura, IBAMA, Receita Federal (ITR), cartórios de registro de imóveis (normas da
  Corregedoria/CNJ), SICAR (Sistema Nacional de Cadastro Ambiental Rural). O que não conseguir
  confirmar, **omita** ou escreva de modo genérico, e liste em `pendente_verificar`.
- Não invente prazo, multa, número de lei ou sigla. Se citar, confirme a fonte.
- Não dê orientação jurídica específica de caso (ex.: "seu processo será aceito se..."),
  mantenha em nível informativo geral e recomende avaliação de advogado/despachante quando
  fizer sentido.
- Nomes de siglas (CAR, SIGEF, CCIR, ITR, INCRA, SNCR, CND) devem ser escritos por extenso na
  primeira ocorrência.

## Validação (rode e itere até passar)

Rode a partir desta pasta:
```
python C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py n07.html --links 1 --titulo "TITULO" --kw "KW" --resumo "RESUMO"
```
Precisa fechar **"RESULTADO: APROVADO"** (0 bloqueios `XX` e humanização ≥ 70). Se reprovar por
tamanho, **acrescente conteúdo útil**, não enrolação. Trigramas repetidos "XX" na Camada B não
reprovam sozinhos, mas tente reduzir. Os avisos `!` não bloqueiam.

## Relatório final (resposta)

Uma linha por item: `n | APROVADO/REPROVADO | palavras | humanização | kw | título | pendências
de verificação`. Se algum item não fechar, diga o motivo e o que falta.
