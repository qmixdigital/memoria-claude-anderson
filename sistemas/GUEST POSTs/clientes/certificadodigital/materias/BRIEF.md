# Brief: redigir artigos de link building (certificadodigital.seg.br), lote de 10

Você escreve **só arquivos de texto** nesta pasta. Não publique nada, não envie nada a serviço
externo, não mexa em outros arquivos. Pesquisa na web (WebSearch/WebFetch) é obrigatória e permitida.

certificadodigital.seg.br é um diretório/comparador de certificado digital (e-CPF, e-CNPJ,
A1, A3) com páginas por cidade, por certificadora e por público (advogado, contador, etc).

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
  o fechamento. Sem call-to-action de venda, sem citar preço específico de concorrente, sem
  nome de certificadora concorrente específica além do que o próprio tema exigir (ex.: item 06
  fala de AC OAB, que é o próprio assunto da página, não concorrência).
- **Itens 05, 06 e 07 (portais jurídicos/trabalhista):** o tema (certificado digital para
  advogado/contador) é pauta legítima para esses portais, não precisa forçar ângulo nem
  disfarçar. Escreva como um editor da casa escreveria, sem citar a marca do diretório como
  patrocinador.

## Rigor factual (não é YMYL, mas é tema técnico/legal, não invente)

- **Toda afirmação factual** (norma, prazo de validade, exigência legal, nome de órgão) deve
  ser **verificada por busca** antes de entrar. Fontes aceitáveis: ITI (Instituto Nacional de
  Tecnologia da Informação, autoridade de certificação raiz brasileira), Receita Federal,
  gov.br, OAB (para itens 05/06), CFC (para item 07), eSocial oficial. O que não conseguir
  confirmar, **omita** ou escreva de modo genérico, e liste em `pendente_verificar`.
- Não invente prazo de validade, preço ou nome de norma. Se citar prazo (ex.: "1 ano para A1,
  3 anos para A3"), confirme antes por busca; são valores que mudam e variam por certificadora.
- Não dê orientação jurídica específica de caso (ex.: "seu processo será invalidado se..."),
  mantenha em nível informativo geral.

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
