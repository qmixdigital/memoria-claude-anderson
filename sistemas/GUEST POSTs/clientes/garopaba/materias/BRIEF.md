# Briefing do lote garopaba.ia.br (14/10/2026, sites do Jean via MCP)

Leia `plano.json` para o item que lhe foi designado (campo `n`). Cada item tem: portal,
destino_url (URL real do cliente a linkar), destino_tema, pauta, kw_post (palavra-chave do
SEU artigo, diferente do tema do destino) e ancora (texto exato do link, com a keyword do
destino).

## Sobre o cliente

garopaba.ia.br é um guia de cidade/diretório turístico (próprio da QMIX) sobre Garopaba,
cidade litorânea de Santa Catarina conhecida por praias (Praia do Rosa, Siriú, Ferrugem),
surfe, observação de baleias-francas no inverno, dunas e lagoas costeiras. Traz hospedagem,
clima, história, como chegar, atrações e diretório de empresas locais. Não é pousada nem
agência de turismo específica, é diretório/guia.

## Âncora e golden rule

A âncora do item vai no primeiro parágrafo ou o mais perto possível disso, na primeira
menção ao tema do destino. A keyword do SEU artigo (`kw_post`) é diferente do tema do
destino: vocês escrevem sobre um aspecto prático de viagem (hospedagem, dunas, baleias,
clima, roteiro) e o link para o guia entra como "para planejar, vale consultar [âncora]"
ou formato equivalente natural.

## Rigor factual

Não inventar dado de temporada de baleias, distância, preço ou horário sem fonte. Se usar
dado, usar fonte geral verificável (ex.: temporada de baleias-francas no litoral sul do
Brasil é de julho a novembro, fato amplamente documentado por projetos de conservação como
o Instituto Australis). Sem nome de pousada, hotel ou agência específica como recomendação.
Sem promessa de "garantia de avistamento" ou afirmações absolutas sobre natureza.

## Praça regional (ver `praca_portal` de cada item)

- **Itens 01 (alagoas200/Alagoas), 02 (teixeiraemfoco/Teixeira de Freitas-BA), 06
  (afnewss/Americana-SP), 08 (portalgc/Guanambi-BA), 09 (jornalbahia/Bahia)**: o portal
  TEM praça própria confirmada. Inclua uma menção local genuína dessa praça real no corpo
  do artigo (o destino é sobre Garopaba/SC, a menção local é sobre a realidade do leitor
  do portal, não sobre o destino — por exemplo, um leitor da Bahia planejando uma viagem
  para o litoral de SC, ou comparando com as praias que já conhece).
- **Itens 03, 04, 05, 07, 10**: sem praça fixa confirmada. **Não inventar nem inferir**
  cidade/estado do portal. Trate o artigo como nacional/genérico.

## Links internos (prioridade: artigos RECENTES do próprio portal, máximo de links)

Depois de escrever o corpo, pesquise no próprio portal (busca no site, RSS ou arquivo)
por 2 artigos **recentes** e genuinamente relacionados ao tema do seu artigo (viagem,
turismo, praia, natureza, roteiro, ou o assunto adjacente do próprio portal). Insira como
parágrafo final (antes do último parágrafo real), no formato:
`<p><strong>{Rótulo}:</strong> <a href="URL1">âncora1</a> e <a href="URL2">âncora2</a>.</p>`
Rótulo variando (não repetir o anterior do mesmo portal): Leia também, Leia mais, Veja
também, Relacionadas, Mais sobre o tema, Continue lendo.

**Instrução do operador para este lote: maximizar links internos.** Pule só se depois de
pesquisar genuinamente não houver NENHUM artigo relacionado no portal. Tente também
termos adjacentes de viagem/turismo/praia/natureza antes de desistir.

**Cuidado com contaminação:** alguns destes portais têm páginas antigas na editoria de
Filmes e Séries com link para concorrentes de IPTV (teste-iptv.net, nexoplay.mov e
similares), e alagoas200 tem uma página de entretenimento com link para teste-iptv.net.
Isso NÃO afeta a editoria de Turismo/Viagens, mas nunca escolha uma dessas páginas
contaminadas como link interno, mesmo que apareça na busca por acidente.

## Validação

Rodar `validador_materia.py` com `--links N --titulo --kw --resumo` (N = quantidade total
de links: 1 do cliente + os internos). Corrigir qualquer bloqueio (XX) antes de entregar.
Atenção a âncoras de link interno longas demais (o validador reprova âncora que parece a
frase inteira do título de destino) — encurte se acusar.

## Imagem

Banco de fotos grátis (Pexels/Pixabay/Wikimedia), termo de busca em inglês, tema de praia/
natureza/viagem genérico (beach, sand dune, whale watching, lagoon, camping) SEM mostrar
placa com nome de empresa real nem rosto reconhecível de pessoa famosa. Olhar a imagem
antes de entregar: nada de texto em outro idioma visível, nada de logo de empresa real,
nada de anatomia estranha.
