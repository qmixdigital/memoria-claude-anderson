# Brief: redigir artigos de link building (nutricionista.digital), lote de 30

Você escreve **só arquivos de texto** nesta pasta. Não publique nada, não envie nada a serviço externo, não mexa em outros arquivos. Pesquisa na web (WebSearch/WebFetch) é obrigatória e permitida.

## Entrada
`plano.json` (nesta pasta) tem 30 itens. Você recebeu alguns números `n`. Cada item traz:
`portal` (site que vai hospedar), `local` (praça do portal, pode ser null), `destino_url` (página do cliente que o link empurra), `destino_tema` (o assunto dessa página), `pauta` (tema do artigo que você vai escrever), `ancora` (texto exato do link), `tipo_ancora` (E exata, P parcial, N natural).

## Saída por item (n = "07", por exemplo)
1. `n07.html`: corpo do artigo em HTML (sem `<h1>`, sem `<html>`/`<body>`): só `<p>`, `<h2>`, `<h3>` (opcional) e, se ajudar, UMA `<table>` simples. **Nada de `<ul>`/`<ol>`/bullets.**
2. `n07.meta.json`: `{"titulo": "...", "kw": "...", "resumo": "...", "slug": "...", "fontes": [{"afirmacao": "...", "url": "..."}], "pendente_verificar": ["..."]}`

## Regras do artigo (obrigatórias, o validador cobra)
- **Idioma:** português do Brasil, acentuação correta. **Zero travessões** (nem — nem –). Terceira pessoa. Sem "você sabia", sem pergunta retórica respondida na sequência, sem "primeiramente/por fim".
- **Tamanho:** mínimo 1.200 palavras. **Escreva já mirando 1.400 a 1.600**: os rascunhos costumam sair com ~900 e depois precisam de remendo. 5 a 7 `<h2>`. Varie o tamanho dos parágrafos (alguns de uma frase curta, outros de 80 a 110 palavras) e a abertura de cada parágrafo (não comece três seguidos com a mesma palavra).
- **Vocabulário proibido** (o validador reprova): abordagem, alavanc, ecossistema, soluç (solução, soluções, resolução), robusto, insights, stakeholders, proporcion (proporcional, proporcionalmente), potencializ, "cada vez mais", "é fundamental", "vale ressaltar", "nesse contexto", "no cenário atual", "no mundo atual", descubra, "saiba mais", "clique aqui", "de forma eficaz", "de forma eficiente", "transformação digital", "desafios e oportunidades".
- **Link do cliente:** exatamente um link no artigo, `<a href="DESTINO_URL">ÂNCORA</a>`, com o texto da `ancora` do plano **sem alterar uma letra**, **dentro do primeiro parágrafo**, e nenhum outro `<a>` no texto. A âncora nunca é a frase inteira, é um trecho dentro de uma frase natural. Não use a marca nem o nome de profissional como âncora.
- **Regra de ouro da âncora (já foi cobrada duas vezes pelo operador):** a âncora **não pode ser igual ao título** do artigo e **não pode ser igual à `kw`** do artigo. O artigo mira uma busca informacional DIFERENTE da página de destino (a `pauta` já foi escolhida assim). Não repita no corpo o título nem a frase da âncora como se fosse a keyword do post.
- **Keyword do artigo (`kw`):** 3 a 5 palavras, tirada da `pauta` (a busca que o artigo responde), diferente da âncora e do `destino_tema`. Ela precisa aparecer **exata** (a grafia da `kw` no meta.json, mesma ordem das palavras): no título, nas primeiras 100 palavras, em pelo menos um `<h2>`, **3 a 8 vezes no corpo** (densidade abaixo de 3%), e na linha fina (`resumo`). Cada palavra forte da kw deve aparecer pelo menos 3 vezes no texto.
- **Título:** até 70 caracteres, sem exclamação, sem "descubra/saiba mais", com a kw. **`resumo` (linha fina):** uma frase de 10 a 20 palavras, com a kw, que traz informação nova (não repete o título nem o primeiro parágrafo).
- **Slug:** minúsculo, hifens, derivado da kw (sem stopwords soltas desnecessárias), diferente do slug da página de destino.
- **Referência local:** se `local` não for null, cite essa praça UMA vez, de forma neutra e verdadeira (ex.: "Em Apucarana, no Paraná, ..."), **sem inventar dado local**. Se for null, não cite cidade.
- **Estrutura variada:** os artigos do lote não podem parecer o mesmo esqueleto. Mude a ordem e o estilo dos `<h2>`, o tipo de abertura (cena, dado verificado, dúvida comum, erro frequente) e o fechamento. Sem call-to-action de venda, sem "agende sua consulta", sem citar preço de consulta do cliente.
- **Nada de concorrentes ou nomes de profissionais.** Não cite clínicas, marcas de suplemento nem de medicamento além do que a pauta exige (Mounjaro/tirzepatida só na pauta que o pede).

## Saúde (YMYL): rigor
- Escreva informação geral de educação em saúde. **Não prometa resultado, cura ou perda de peso em prazo**, não dê dose, não faça diagnóstico, não incentive suspender remédio. Inclua, de forma natural, que o caso individual depende de avaliação com nutricionista e médico.
- **Toda afirmação factual** (norma, número, nome de órgão, data, mecanismo) deve ser **verificada por busca** antes de entrar. Fontes preferidas: Ministério da Saúde (Guia Alimentar para a População Brasileira), CFN (Conselho Federal de Nutricionistas), CFM, OMS, Anvisa, sociedades médicas (SBEM, SBD, SBC, SBH), revisões publicadas. Registre cada afirmação checável em `fontes` com a URL. O que não conseguir confirmar, **omita** ou escreva de modo genérico, e liste em `pendente_verificar`.
- Sobre o que o nutricionista pode ou não fazer (exames, atestado, prescrição de suplementos, medicamentos, telenutrição), **só afirme o que o texto da norma do CFN ou da lei sustenta**. Telenutrição: norma CFN 760, de 22/10/2023 (escreva "norma do CFN" ou "norma CFN 760"; **evite a palavra "resolução"**, que dispara o filtro). Se não achar o dispositivo exato, descreva sem número.
- Não invente estudos, percentuais ou citações. Se citar um número, ele precisa estar numa fonte que você abriu.

## Validação (rode e itere até passar)
Rode a partir desta pasta:
```
python C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py n07.html --links 1 --titulo "TITULO" --kw "KW" --resumo "RESUMO"
```
Precisa fechar **"RESULTADO: APROVADO"** (0 bloqueios `XX` e humanização ≥ 70). Se reprovar por tamanho, **acrescente conteúdo útil**, não enrolação. Trigramas repetidos "XX" na Camada B não reprovam sozinhos, mas tente reduzir. Os avisos `!` não bloqueiam.

## Relatório final (resposta)
Uma linha por item: `n | APROVADO/REPROVADO | palavras | humanização | kw | título | pendências de verificação`. Se algum item não fechar, diga o motivo e o que falta.
