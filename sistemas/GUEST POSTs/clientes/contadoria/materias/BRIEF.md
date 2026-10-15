# Briefing do lote contadoria.ia.br (14/10/2026, sites do Jean via MCP)

Leia `plano.json` para o item que lhe foi designado (campo `n`). Cada item tem: portal,
destino_url (URL real do cliente a linkar), destino_tema, pauta, kw_post (palavra-chave do
SEU artigo, diferente do tema do destino) e ancora (texto exato do link, com a keyword do
destino).

## Sobre o cliente

contadoria.ia.br é um diretório nacional (próprio da QMIX) de escritórios de contabilidade,
organizado por UF/cidade/bairro/porte da empresa. Não é escritório específico, é diretório.
Sem CRC/CFC a citar como credencial do "cliente" (ele é o diretório, não um contador
específico); cite o Conselho Federal de Contabilidade (CFC) só como fonte factual geral
quando fizer sentido no corpo do artigo, nunca como selo do diretório.

## Âncora e golden rule

A âncora do item vai no primeiro parágrafo ou o mais perto possível disso, na primeira
menção ao tema do destino. A keyword do SEU artigo (`kw_post`) é diferente do tema do
destino: vocês escrevem sobre um problema contábil específico (IR de autônomo, Simples
Nacional, nota fiscal, etc) e o link para o diretório entra como "para quem busca
X (ancora), existem diretórios como..." ou formato equivalente natural.

## Praça regional (ver `praca_portal` de cada item)

- **Itens 01, 02, 03, 06, 08**: o portal TEM praça própria confirmada (ver campo
  `praca_portal`). Inclua uma menção local genuína dessa praça real no corpo do artigo,
  mesmo que o destino_url aponte para outro estado (isso é normal: o link aponta para
  onde há oportunidade de busca no cliente, não precisa ser o mesmo lugar do portal).
  **Nunca confundir a praça do portal com o estado da página de destino** — são fatos
  independentes. No item 08 (afnewss/Americana-SP) as duas coincidem, pura coincidência
  de oportunidade, não precisa comentar isso no texto.
- **Itens 04, 05, 07, 09, 10**: sem praça fixa confirmada. **Não inventar nem inferir**
  cidade/estado do portal. Trate o artigo como nacional/genérico.

## Ângulos de encaixe por portal

- **Item 05 (canaljustica, portal jurídico generalista)**: a pauta sobre responsabilidade
  do contador por erro na escrituração é um encaixe jurídico natural, sem forçar nada.
- **Item 09 (professortrabalhista, portal de direito trabalhista)**: a pauta sobre o
  contador trabalhista na folha de pagamento é um encaixe natural de tema (contabilidade
  trabalhista: eSocial, FGTS, encargos, rescisão), não precisa forçar jargão alheio.

## Regras editoriais do tema contábil

- Rigor factual: siglas por extenso na primeira ocorrência (CRC, CFC, MEI, DAS, eSocial,
  CNPJ). Não inventar valor de multa, alíquota ou prazo; se precisar de número, usar dado
  geral verificável (ex.: teto do MEI em R$ 81.000,00/ano, isso é fato público estável) ou
  "consulte o seu contador para o valor atualizado" quando o número variar por lei anual.
- Não é YMYL de saúde, mas é tema financeiro: evitar promessa de economia de imposto ou
  afirmação de "sempre compensa" sem ressalva.
- Sem nome de escritório de contabilidade específico nem marca concorrente do diretório.

## Links internos (prioridade: artigos RECENTES do próprio portal, máximo de links)

Depois de escrever o corpo, pesquise no próprio portal (busca no site, RSS ou arquivo)
por 2 artigos **recentes** e genuinamente relacionados ao tema do seu artigo (não precisa
ser sobre contabilidade, pode ser sobre o assunto adjacente: MEI, finanças pessoais,
empreendedorismo local, direito tributário/trabalhista conforme o portal). Insira como
parágrafo final (antes do último parágrafo real), no formato:
`<p><strong>{Rótulo}:</strong> <a href="URL1">âncora1</a> e <a href="URL2">âncora2</a>.</p>`
Rótulo variando (não repetir o anterior do mesmo portal): Leia também, Leia mais, Veja
também, Relacionadas, Mais sobre o tema, Continue lendo.

**Instrução do operador para este lote: maximizar links internos.** Pule só se depois de
pesquisar genuinamente não houver NENHUM artigo relacionado no portal — não force link
fora do tema, mas esgote a busca antes de desistir (tente também termos adjacentes:
"dinheiro", "imposto", "MEI", "empreendedor", "finanças", "empresa" no site do portal).

## Validação

Rodar `validador_materia.py` com `--links N --titulo --kw --resumo` (N = quantidade total
de links: 1 do cliente + os internos). Corrigir qualquer bloqueio (XX) antes de entregar.
Atenção a âncoras de link interno longas demais (o validador reprova âncora que parece a
frase inteira do título de destino) — encurte se acusar.

## Imagem

Banco de fotos grátis (Pexels/Pixabay/Wikimedia), termo de busca em inglês, tema
contabilidade/finanças/escritório. Olhar a imagem antes de entregar: nada de texto em
outro idioma visível, nada de logo de empresa real, nada de anatomia estranha.
