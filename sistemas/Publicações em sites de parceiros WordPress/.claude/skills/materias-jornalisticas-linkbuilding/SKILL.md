---
name: materias-jornalisticas-linkbuilding
description: >
  Produz matérias jornalísticas de link building para portais de notícias e as entrega pelo painel
  do Anderson (link em conteudo.qmix.com.br) ou, quando pedido, publica em portal parceiro via MCP.
  Use sempre que o pedido envolver: escrever matéria/artigo/guest post para portal, conteúdo com link
  de cliente, qualquer combinação de "portal + âncora + URL do cliente", ou quando Anderson mandar um
  briefing. Cobre pesquisa, ângulo editorial, redação anti-detecção de IA, validação automática
  (bloqueios + score de humanização), verificação factual, imagem de banco gratuito e entrega.
---

# Matéria para portal de notícias: produzir e entregar

Fluxo completo, do briefing à entrega. O artigo é escrito em **HTML** (não DOCX), validado
por script e entregue de um de dois jeitos:

| modo | quando | como |
|---|---|---|
| **painel** (padrão desde 14/09/2026) | Anderson manda portal + âncoras + URLs e vai encaminhar ele mesmo ao portal | `scripts/criar-materia.mjs` do qmix-next grava a matéria e devolve `https://conteudo.qmix.com.br/<token>`; o Telegram avisa |
| **mcp** | Anderson pede expressamente para publicar num portal parceiro do Jean | conector MCP (`criar_post`), como no Passo 9b |

Se o briefing não disser, é **painel**.

## Esta skill NÃO é a `guest-post-rede`

São duas operações diferentes. Confundir uma com a outra quebra as duas.

| | **esta skill** | **guest-post-rede** |
|---|---|---|
| Onde publica | sites de **parceiros** (Jean), cadastrados no cofre | os **111 portais próprios** da rede QMIX |
| Como publica | conector MCP (`criar_post`) | portal-engine, API própria dos portais |
| Escolha do destino | o Anderson diz o portal no briefing | varredura do Search Console por oportunidade |
| Validação | `validador_materia.py` (bloqueios + humanização) | `auditar.py` (24 checagens, local e no ar) |
| Links | só os do cliente, com âncora do briefing | exatamente 2 internos, nenhum externo além do cliente |

Se o pedido citar Search Console, portal-engine, indexação em lote ou os portais próprios,
use a `guest-post-rede`. Se citar portal de parceiro, MCP, ou vier como
"portal + âncora + URL do cliente", é esta aqui.

## Arquivos de referência (leia quando o passo pedir)

Ficam na raiz do projeto `d:\SISTEMAS\Publicações em sites de parceiros WordPress\`:

| Arquivo | Quando ler |
|---|---|
| `angulos-por-segmento.md` | passo 3, escolher o ângulo |
| `clientes-recorrentes.md` | passo 1 e 3, credenciais, âncoras e temas já usados |
| `portais-mapeados.md` | passo 2, perfil editorial do portal |
| `validacao-e-factual.md` | passo 5 e 6, regras de validação e verificação |
| `skill.md` | regras editoriais originais (fonte desta skill) |

## Scripts desta skill

| Script | Uso |
|---|---|
| `scripts/validador_materia.py` | valida o HTML: bloqueios + score de humanização |
| `scripts/gerar_imagem.py` | gera a imagem pela Runware (modelo barato) e devolve a URL |
| `scripts/planilha_jean.py` | preço do portal e envio da linha para a planilha de pedidos do Jean (só com ordem do Anderson) |

---

## Passo 0. Conferir o briefing

Campos obrigatórios. Se faltar algum, **pergunte antes de escrever**:

| Campo | Exemplo |
|---|---|
| Portal de destino | `portoenoticias` (slug) ou o domínio |
| URL do cliente | https://cirurgiadecolunagoiania.com.br/ |
| Âncora exata | especialista de coluna em Goiânia |
| Segmento | Ortopedia / cirurgia de coluna |

Se houver mais de um link, liste todos com suas âncoras e **respeite a ordem pedida**.

**Links internos (regra do Anderson, 14/09/2026): se o briefing não trouxer, pergunte
sempre** "tem links internos do portal para esta matéria?" antes de escrever. Quando vierem:

- **Conferir o domínio de cada um**: precisa ser o mesmo domínio do portal de destino. Link
  de outro domínio é erro de digitação dele; avise e não use até ele confirmar.
- Abrir cada URL e ler o título real (h1). A âncora é um **corte do título**, na forma que
  fica natural na frase (minúscula no início, sem o nome do portal, pode cortar o fim).
- Inserir **um parágrafo antes do último**, no formato
  `<p><strong>Rótulo:</strong> <a href="URL1">âncora 1</a> e <a href="URL2">âncora 2</a>.</p>`
  (com um link só, sem o "e"; com três, vírgula e "e").
- **Rótulo varia a cada matéria, nunca o mesmo padrão em sequência**, mas sempre no jeito
  convencional de portal (o Anderson reprovou "Você vai gostar de ler também", 14/09/2026).
  Sortear entre: "Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o
  tema", "Continue lendo". A âncora é o corte do título que contém a palavra-chave do
  artigo de destino (não o começo do título por inércia). Anotar na `memoria.md` do cliente
  qual rótulo foi usado e não repetir o último em matéria seguinte para o mesmo portal.
- No validador, `--links` = links do cliente **mais** os internos (ele conta todos).

No modo MCP, confirme o portal com `listar_sites` do conector e resolva para o slug correto.

## Passo 1. Consultar o histórico

**Modo painel:** cada cliente tem pasta em `D:\SISTEMAS\GUEST POSTs\clientes\<slug>\` com
`memoria.md` (fonte principal) e `materias/` (cópias do que já foi entregue). Leia a
`memoria.md`. Se o cliente não tiver pasta, **crie agora** copiando
`clientes\MODELO-memoria.md` para `clientes\<slug>\memoria.md` (slug curto e reconhecível,
ex.: `dr-fulano-tal`, `nome-da-empresa`) e a subpasta `materias\`; preencha site, segmento
e credenciais com o briefing e a pesquisa do Passo 2.

**Modo MCP:** leia `clientes-recorrentes.md`.

Nos dois casos, colete:
- credenciais reais do cliente (CRM, RQE, formação, volume) para citar
- **âncoras já usadas** (varie, nunca repita o mesmo texto âncora mais de 2 vezes no total)
- **temas e ângulos já cobertos** para este cliente (não repita)
- regras editoriais específicas do cliente (ex.: Casa da Toalha sempre em 1º lugar; COE com
  concorrentes nas últimas posições; QMIX nunca nomeada como anúncio)

## Passo 2. Pesquisar

Sempre pesquise antes de escrever. Matéria sem dado verificável é rejeitada.

1. **Portal**: leia `portais-mapeados.md`. Se o portal não estiver lá, pesquise
   `[domínio] região cidade público` para descobrir praça, linha editorial e leitor.
2. **Tema**: `[tema] dados Brasil estatísticas` e `[tema] prevalência OMS IBGE`.
   Fontes prioritárias: OMS, IBGE/PNS/PNAD, SciELO, DATASUS, Ministérios, SBOT, CFM, SEBRAE,
   associações setoriais.
3. **Cliente**: credenciais reais quando for médico ou especialista.
4. **Destino**: busque a URL do cliente para alinhar o conteúdo ao que a página oferece.

Nunca invente número, fonte ou citação. Sem dado específico, use dado geral verificável.

## Passo 3. Escolher o ângulo

Leia `angulos-por-segmento.md` e escolha um ângulo **inédito para este cliente**.
Cada portal recebe título, ângulo, abertura e exemplos locais diferentes.

Alterne o tipo de abertura entre matérias: dado, cena, contradição, caso real, pergunta.

Toda matéria em portal regional precisa de pelo menos **um dado local ou referência
geográfica genuína** da praça daquele portal.

## Passo 3.5. Aprovar a pauta ANTES de escrever (obrigatório)

Regra do Anderson, dada em 04/09/2026 depois de um artigo inteiro escrito e reprovado:
**não escreva uma linha antes de ele aprovar o tema.** Escrever primeiro e mostrar depois
desperdiça o trabalho e ainda gasta imagem paga.

Mande uma mensagem curta com **duas ou três opções de pauta**, cada uma em três linhas:

- **Tema e título provável**
- **Por que ele encaixa neste portal** (lacuna do CSV, acervo existente, autoridade do site)
- **Onde a âncora entra** e qual seção a receberia

Nada de parágrafo pronto, nada de estrutura completa, nada de imagem. Espere a escolha dele
e só então siga para o passo 4.

Se ele responder com a pauta pronta no briefing (como em "faça esse termo"), a escolha já foi
feita e este passo não se aplica.

## Passo 4. Escrever

### Estrutura

- Título: **máximo 70 caracteres**, conte antes de fechar. Sem exclamação. Sem "descubra",
  "saiba mais", "clique aqui". Nunca repetir a palavra "Google" em título.
- Linha fina: uma frase, 10 a 20 palavras, com informação nova (não repete o título nem o
  primeiro parágrafo).
- Abertura: 2 a 3 parágrafos, cena concreta ou dado de impacto.
- 5 a 7 seções `<h2>`, uma delas acomodando cada link.
- Fechamento prático, sem call-to-action.
- Tamanho: mínimo **1.200 palavras**, ideal 1.500 a 2.000, máximo 2.500.

### Links

- A âncora recebe o hyperlink, **nunca a frase inteira**: `<a href="URL">âncora</a>`
- **O link do cliente vai na primeira menção da marca ou do termo, o mais cedo possível,
  inclusive no primeiro parágrafo** (regra do Anderson, 14/09/2026; substitui a antiga
  proibição do 1º parágrafo). Quando a âncora é a marca, é a primeira vez que o nome aparece.
  Link cedo passa mais autoridade e sobrevive ao corte do editor. Não no último parágrafo
  (a linha "Fonte:" é exceção, ver abaixo).
- Mínimo **3 parágrafos de distância** entre dois links
- Inline no corpo, nunca em bloco "Leia também"
- **Linha de fonte no fim, quando o Anderson mandar** (regra de 14/09/2026, campanha Pixbet):
  último parágrafo `<p><strong>Fonte:</strong> <a href="URL">Marca</a></p>`. É crédito, não
  link de corpo; o validador aceita link ali só nesse formato. Entra em `links` do JSON como
  mais uma âncora (`--links` conta com ela).
- Nunca como sujeito de frase publicitária. Errado: "A QMIX é uma agência que oferece [âncora]".
  Certo: "trabalhar com uma [âncora] especializada faz diferença".
- Cliente citado pelo nome só como fonte, em citação direta, **sem link**, longe da âncora.

### SEO on-page (obrigatorio, e o validador cobra)

Escrever bem nao basta: sem correspondencia exata da palavra-chave, o artigo nao disputa
o termo. Regra fechada em 05/09/2026 depois de medir dez artigos publicados e encontrar
**zero ocorrencia exata da keyword no corpo em nove deles**.

A palavra-chave principal precisa aparecer, na forma exata:

| Onde | Regra |
|---|---|
| Titulo | uma vez, o mais no comeco possivel |
| Primeiras 100 palavras | uma vez, na abertura |
| Pelo menos um H2 | uma vez, no subtitulo que trata do nucleo do tema |
| Corpo | 3 a 6 vezes no total, teto de 8 (acima disso vira spam) |
| Linha fina / resumo | uma vez, porque ela vira a meta description |
| Slug | sempre, sem stop words |
| Alt da imagem destacada | sempre |

Alem da forma exata, usar variacoes naturais ao longo do texto (plural, sinonimo, ordem
trocada). Cada palavra forte da keyword precisa aparecer no minimo 3 vezes no artigo.

Se a keyword for artificial em portugues ("site para assistir futebol ao vivo gratis"),
encaixar em frase que funcione lendo em voz alta, e nao repetir o bloco inteiro coladinho
duas vezes seguidas.

### Tom

Terceira pessoa. Parágrafos de 3 a 5 linhas, uma ideia cada. **Zero travessões**
(nem `—` nem `–`) em qualquer ponto. Sem bullets no corpo. Sem "Primeiramente... Por fim".
Sem pergunta retórica respondida na sequência. Sem "Você sabia que".

Fontes citadas no corpo, integradas: "segundo a Pesquisa Nacional de Saúde de 2019".
Nunca nomeie veículo de imprensa concorrente; use "levantamentos da imprensa local".

### Vocabulário proibido

Nunca use: abordagem, alavanc, ecossistema, soluç, robusto, insights, stakeholders,
"cada vez mais", "é fundamental", "vale ressaltar", "nesse contexto", "no cenário atual",
"no mundo atual", descubra, "saiba mais", "clique aqui", "de forma eficaz",
"de forma eficiente", "transformação digital", proporcion, potencializ, "desafios e
oportunidades".

O filtro de `soluç` também pega **resolução**. Troque por "qualidade de imagem",
"pixels extras" ou equivalente conforme o caso.

### O que deixa o texto humano

Exemplo concreto com cidade e situação real. Contradição assumida ("o problema está em
outro lugar"). Dado seguido de interpretação própria. Frase curta depois de explicação
longa. Variação real no tamanho de parágrafos e frases.

## Passo 5. Validar (obrigatório)

Salve o artigo como HTML e rode:

```bash
python .claude/skills/materias-jornalisticas-linkbuilding/scripts/validador_materia.py artigo.html   --links N --titulo "TITULO" --kw "palavra-chave principal" --resumo "linha fina"
```

`--kw` liga a **Camada C**, que e a checagem de SEO on-page e **bloqueia** a entrega.
Sem `--kw` o script avisa que o SEO nao foi verificado. Nunca entregar sem rodar com ele.

`N` é a quantidade de links do briefing.

- **Qualquer bloqueio (`XX`) impede a entrega.** Corrija no HTML e revalide.
- **Score de humanização abaixo de 70 exige reescrita real**, não troca de palavra. As
  métricas estruturais (variedade de frases, abertura de parágrafos, diversidade lexical,
  estrutura consecutiva) são as que mais pesam.

Repita até zerar bloqueios e o score ficar em 70 ou mais.

## Passo 6. Verificar os fatos

Antes de publicar, confira por busca cada nome, data, número, cargo, preço, credencial e
estatística. Sem evidência, marque como não verificado e **não corrija por conta própria**.

Correções pontuais, trecho por trecho. Não reescreva o artigo nem mexa no estilo. Nunca
insira nota de verificação dentro do artigo. Se o trecho aparece mais de uma vez, ache a
ocorrência certa pelo contexto.

Status no resumo final: `pass`, `corrected`, `partially_corrected` ou `needs_review`.
Problema detectado sem correção aplicável é **needs_review**, nunca `pass`.

## Passo 7. Imagem

**Banco de fotos gratuito primeiro** (regra global de 10/09/2026): Pixabay, Pexels e
Wikimedia Commons pelo módulo pronto, termo de busca **em inglês**:

```bash
python ~/.claude/skills/guest-post-rede/scripts/banco_img.py buscar "search term in english" --n 8
python ~/.claude/skills/guest-post-rede/scripts/banco_img.py pegar --termo "search term in english" --slug <slug> --saida "D:/SISTEMAS/GUEST POSTs/saida" [--id pexels:123]
```

Sai `saida/<slug>.webp` em 1216x640. Sem crédito, sem legenda de fonte. **Abra e olhe a
foto antes de entregar.** Se nada servir, troque o termo, não a fonte.

Geração por IA (`scripts/gerar_imagem.py`, Runware modelo barato `runware:100@1`) só quando
o Anderson pedir naquele caso. O premium (`google:4@2`) exige autorização dele, com
quantidade e custo informados antes.

## Passo 8. Conferencia final (nao precisa mais de aprovacao)

Regra do Anderson, 05/09/2026: **nao espere aprovacao para publicar.** Confira voce mesmo
e publique. Ele revisa depois e diz se tem ajuste.

Antes de publicar, rodar a propria checagem:

1. `validador_materia.py` com `--links`, `--titulo`, `--kw` e `--resumo`. As tres camadas
   precisam passar: 0 bloqueios, humanizacao 70 ou mais, e a Camada C de SEO inteira em ok.
2. Conferir os fatos citados, um a um, e nao publicar numero sem fonte.
3. Abrir a imagem e olhar. Anatomia errada, texto embolado ou objeto trocado, refaz.
4. Conferir a ordem dos links: o do cliente e o primeiro, nada antes dele.
5. Conferir que o portal nao tem artigo que canibalize a mesma intencao.

Se algo nao fechar, corrija antes de publicar em vez de pedir opiniao.

A entrega vem **depois** da publicacao, curta: link do post, link de edicao, onde cada link
ficou, resultado das tres camadas e o que foi para a Apex.

## Passo 9a. Entregar pelo painel (padrão)

1. Salvar na pasta do cliente, `D:\SISTEMAS\GUEST POSTs\clientes\<cliente>\materias\`, os
   três arquivos `<slug>.json`, `<slug>.html` (o corpo validado) e `<slug>.webp` (a foto).
   O JSON:

```json
{
  "titulo": "até 70 caracteres, sem travessão",
  "linha_fina": "uma frase de 10 a 20 palavras, que não repete o título nem o primeiro parágrafo",
  "html": "<p>corpo sem h1; âncoras como <a href=\"URL\">âncora exata</a></p>",
  "portal": "dominio-do-portal.com.br",
  "cliente": "nome do cliente",
  "links": [{ "ancora": "âncora exata", "url": "https://..." }],
  "palavra_chave": "keyword principal do artigo (vira o nome do arquivo da imagem ao baixar)",
  "imagem": "/tmp/<slug>.webp",
  "imagem_alt": "descrição da foto em português",
  "imagem_fonte": "Pexels | Pixabay | Wikimedia Commons",
  "imagem_fonte_url": "página da foto no banco (campo pagina_url da ficha do banco_img.py)"
}
```

   O `html` é o mesmo que passou no validador. `links` na ordem do briefing; o script recusa
   se alguma âncora não estiver no HTML exatamente como `<a href="URL">âncora</a>`, se o
   título passar de 70, se houver travessão, `<h1>` ou `<script>`, se faltar
   `palavra_chave`, ou se houver imagem sem `imagem_fonte` e `imagem_fonte_url`.

   Na página pública aparece **só o artigo** (título, linha fina, foto com "Imagem: Pexels"
   embaixo, corpo). Nada de lista de links nem instrução: jornalista copia sem ler. Os
   botões trazem "Baixar imagem" (já recortada 1216x640, WebP, nome = palavra-chave) e,
   ao lado, "Ver original no Pexels" em destaque, para conferir a licença.

2. Mandar JSON e foto para a VPS e rodar o script (Bash com `dangerouslyDisableSandbox: true`):

```bash
scp "D:/SISTEMAS/GUEST POSTs/clientes/<cliente>/materias/<slug>.json" "D:/SISTEMAS/GUEST POSTs/clientes/<cliente>/materias/<slug>.webp" hostinger-vps-srv1166087:/tmp/
ssh hostinger-vps-srv1166087 'export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && cd /var/www/qmix-next && node scripts/criar-materia.mjs /tmp/<slug>.json'
```

   A última linha do stdout é o link. O script já avisa no Telegram do admin. Se sair com
   erro, ele lista o motivo e não grava nada: corrija o JSON e rode de novo.

3. Devolver ao Anderson, em 3 linhas: link, portal, âncoras e onde cada uma ficou.

4. **Planilha do Jean, só quando o Anderson mandar** ("manda para a planilha do Jean"). Ele
   pode pedir na hora da entrega ou depois da aprovação do cliente; nunca enviar sem ele dizer.

```bash
python scripts/planilha_jean.py enviar <dominio-do-portal> "<título>" <link conteudo.qmix.com.br> [--apostas]
```

   O script lê o preço do portal na aba DOMÍNIOS (coluna NORMAL; `--apostas` para site de
   aposta) e acrescenta a linha na aba de pedidos em uso (`Pedidos Fevereiro`, o nome não
   mudou com o mês) no formato dela: valor | PAUTA | TEXTO (link) | SITE. Se o domínio não
   estiver na aba de preços, ele grava o valor em branco e avisa: perguntar o valor ao Anderson.
   Conferir com `python scripts/planilha_jean.py ultimas 3`. Anotar na `memoria.md` do cliente
   que foi para a planilha.

5. **Pauta pelo bot do Telegram, só quando o Anderson mandar** ("manda pro Jean", "manda
   para o cliente X"). O bot é o @qmixmarktplace_bot (o mesmo do painel). Quem recebe precisa
   antes mandar `/start` ao bot: o webhook cadastra como `pendente` e o Anderson pede para
   ativar, dando uma chave (`jean`, `consultaai`...). Na VPS, em `/var/www/qmix-next`:

```bash
node scripts/enviar-pauta.mjs listar                       # quem já mandou /start e o status
node scripts/enviar-pauta.mjs ativar <chat_id|id> <chave>   # só com ordem do Anderson
node scripts/enviar-pauta.mjs <token-da-materia> <chave>    # envia título + link, grava enviado_para/enviado_em
```

   A mensagem já orienta: copiar o texto formatado, baixar a imagem, conferir a origem da
   foto e responder com o link publicado. Anotar na `memoria.md` do cliente para quem foi.

6. **Pedido do marketplace (qmix.com.br/admin/pedidos/N): entregar ao cliente para aprovar.**
   Depois de gravar a matéria no painel (passo 2) e o Anderson ver no Telegram, rodar na VPS:

```bash
node scripts/entregar-para-cliente.mjs <token-da-materia> <entregaId> [--email cliente]
```

   Isso grava o texto como **rascunho da entrega** (o cliente lê, edita, pede ajuste ou
   aprova em `/enviar-dados/<pedidoId>`, e a aprovação segue o fluxo normal: e-mail, botão
   no Telegram, publicação), abre um **ticket** no pedido (categoria revisão de conteúdo)
   e manda o e-mail "conteúdo pronto para aprovação". **Sem `--email cliente`, o e-mail vai
   para o administrador** (fase de teste de layout, regra do Anderson em 14/09/2026); só
   mandar ao cliente quando ele liberar. O script recusa se algum link contratado da entrega
   não estiver no HTML ou se a entrega já tiver conteúdo aprovado. Os dados da entrega
   (âncoras, URLs, portal) vêm de `entregas`; conferir com
   `psql -c "select * from entregas where pedido_id=N"` antes de escrever.

Correção depois de gravada (texto, título, linha fina, links), **mantendo o mesmo link**:
`node scripts/atualizar-materia.mjs <token> /tmp/<slug>.json` com o mesmo JSON
(a imagem não muda por aí; para trocar a foto, revogar e criar de novo).

O admin vê tudo em `qmix.com.br/admin/materias` (revogar link, gerar novo, colar a URL
publicada). Quem abre o link só lê, copia HTML/texto e baixa a imagem; robôs recebem 403.

## Regras dos sites do Jean (ordem do Anderson, 17/09/2026)

Valem para **todos os 38 sites** do conector "Publicar em sites de parceiros". Não valem
para os portais próprios da QMIX, que seguem a regra oposta de imagem (sem crédito, por
footprint).

1. **Crédito da imagem sempre no campo caption (legenda) da imagem destacada**, no padrão
   exato `Imagem de {Autor} via {Banco}`. Autor é o nome de quem subiu a foto no banco
   (campo autor da ficha do `banco_img.py`); Banco é `Pexels`, `Pixabay` ou
   `Wikimedia Commons`. Passar em `subir_imagem` o campo `legenda`. Tema que não imprime
   a legenda da destacada (ex.: canaljustica) recebe a mesma frase também no início do
   `conteudo_html` como
   `<figure class="wp-block-image"><figcaption class="wp-element-caption">Imagem de X via Pexels</figcaption></figure>`;
   nunca como `<p>`, porque a capitular do tema engole a primeira letra. Conferir no ar.
2. **Sem tags.** Os sites do Jean não usam tag. Não passar `tags` em `criar_post`; se um
   post saiu com tag, `atualizar_post` com `tags: []` limpa (o servidor foi ajustado em
   17/09/2026 para aceitar lista vazia).
3. **Site nichado e pauta forçada vão para a categoria "Geral".** Em portal de nicho
   (jurídico como canaljustica.jor.br e ciberlex.adv.br, trabalhista, etc.), quando o tema
   do cliente só cabe no nicho com esforço, publicar em "Geral" para não ocupar a home.
   Quem julga se é forçado é quem escreve: se a matéria precisou de um "ângulo" para
   parecer do nicho (ar-condicionado num site jurídico virou "PMOC" e "CDC"), é forçada
   e vai para Geral. Só fica na editoria do nicho o que um editor da casa publicaria sem
   o cliente.

## Passo 9b. Publicar pelo MCP (só quando pedido)

Pelo conector MCP (prefixo do conector conectado, ex.: `Sites Jean`):

1. `listar_categorias` no portal, escolha a categoria coerente com o tema
2. `subir_imagem` com URL pública da foto, `nome_arquivo` em slug da keyword e `alt` descritivo
3. `criar_post` com título, `conteudo_html`, categoria, tags e `imagem_destaque_id`

O conector publica ao vivo e dispara sozinho o aviso no Telegram (`🤖 MCP publicou`).

Devolva ao Anderson apenas: **link do post + link de edição + onde cada link ficou**.
Sem texto longo.

## Passo 10. Atualizar os registros

Depois de entregar, atualize os arquivos do projeto (aqui, diferente do claude.ai, você
consegue escrever neles):

- **Modo painel:** `clientes\<slug>\memoria.md` do cliente: linha nova na tabela "Matérias
  entregues" (data, portal, âncora, URL, link da entrega), âncora na tabela de âncoras e
  tema na lista de temas cobertos. Quando o Anderson mandar a URL publicada, preencher a
  coluna correspondente.
- **Modo MCP:** `clientes-recorrentes.md` (nova âncora, portal, tema) e `portais-mapeados.md`
  (perfil do portal novo ou matéria acrescentada à lista).

Isso é o que evita repetir âncora e ângulo na próxima campanha.

---

## Resumo de entrega

Modo painel:

```
Matéria: <título>
Portal: <domínio>  |  Cliente: <nome>
Link: https://conteudo.qmix.com.br/<token>
Links inseridos:
  1. "<âncora>" -> <URL destino>  (seção "<H2>")
Validação: 0 bloqueios | humanização XX/100 | palavras: XXXX
Registros: clientes/<slug>/memoria.md atualizado, cópias em materias/
```

Modo MCP: o mesmo, trocando `Link` por `Link do post` + `Edição` (wp-admin) e acrescentando
`Factual: pass | corrected | partially_corrected | needs_review` e `portais-mapeados.md`.
