# Arquiteturas do portal-engine nesta VPS

Esta maquina tem o **proprio** `archs.js`, com 27 arquiteturas. Ele **nao e** o
mesmo arquivo de `D:\SISTEMAS\portal-engine\srcrchs.js`, que tem 54 e pertence
a outra instancia. Conferir a contagem antes de qualquer deploy: sobrescrever um
pelo outro apaga arquiteturas.

## Copias locais

| Arquivo | O que e |
|---------|---------|
| `archs/W.js` | codigo completo da arquitetura W depois do redesenho de 19/08/2026 |
| `archs/splice_W.py` | troca as funcoes da W no servidor, com backup datado |

O `splice_W.py` localiza cada funcao pelo nome e substitui uma a uma. **Nao corta
ate o `const ARCHS`**, que foi o erro que ja levou a arquitetura vizinha junto. Ele
tambem e idempotente: rodar duas vezes nao duplica `wCard` e `wSech`.

Como aplicar:

```bash
base64 -w0 archs/W.js > /tmp/W.b64
scp /tmp/W.b64 hostinger-vps-srv1166087:/tmp/W_novo.b64
scp archs/splice_W.py hostinger-vps-srv1166087:/tmp/splice_W.py
ssh hostinger-vps-srv1166087 "base64 -d /tmp/W_novo.b64 > /tmp/W_novo.js && python3 /tmp/splice_W.py"
ssh hostinger-vps-srv1166087 "chown portais:portais /opt/portal-engine/src/archs.js"
```

Depois, reconstruir o portal como usuario `portais` e purgar a Cloudflare.

## Arquitetura W, redesenho de 19/08/2026

Usada so pelo **sejanoticia.com**. O que mudou:

1. **O container era `min(var(--maxw),780px)` em tudo.** Em tela de 1400px a home
   ficava numa coluna de 730px com o resto vazio. Agora o `wwrap` usa a largura
   cheia e so o corpo do artigo tem medida estreita.
2. **Home ganhou hierarquia:** capa dividida com texto a esquerda e imagem a
   direita, faixa "Em destaque" com tres cartoes e o resto em duas colunas.
3. **Miniatura passou de 86px quadrada para 128px em 4/3**, e os cartoes usam a
   proporcao do token.
4. **Artigo ganhou trilho lateral** com "Leia tambem", fixo na rolagem, que ocupa
   a largura que sobrava e adianta link interno.
5. **Rodape em tres colunas** com filete de acento no topo.
6. **Tabela do corpo** com fundo de superficie, cabecalho em maiuscula e acento,
   dentro de um `div` com rolagem lateral para nao estourar no celular.
7. **Chapeu de editoria some** quando a lista inteira e da mesma editoria.

## Arquitetura U, reconstrucao de 19/08/2026

Usada so pelo **jrnoticias.com**. O Anderson pediu reconstrucao total. O que estava
errado:

1. **A capa nao tinha imagem.** So um titulo gigante de cinco linhas ocupando a
   primeira tela inteira.
2. **A foto aparecia so a cada quatro itens** (`i % 4 === 1`), entao a lista
   alternava linha de texto estreita com linha de foto enorme, deixando metade da
   largura vazia e buracos verticais de centenas de pixels.
3. **Chapeu de editoria repetido** em todo item, num portal de uma editoria so.

O que virou:

- **Masthead centralizado** com a marca, a data por extenso e a navegacao abaixo, em
  filete. E a unica coisa que pode ser centralizada, pela regra da casa.
- **Capa dividida**, texto a esquerda e imagem a direita, empilhando no celular.
- **Faixa "Em pauta"** com tres cartoes em 4/3.
- **Lista numerada em duas colunas**, com o numero em serifa grande e transparente:
  todo item entra igual, sem depender de ter foto.
- **Artigo com trilho a esquerda**, fixo na rolagem, trazendo editoria, assinatura,
  data e tempo de leitura, mais capitular na abertura e filete acima de cada h2.
- **Rodape escuro** em tres colunas, usando o `footerBg` do tema.

A diferenca em relacao a arquitetura W e proposital: la o trilho e a **direita** e o
fundo e escuro; aqui o trilho e a **esquerda**, o papel e claro e a tipografia do
corpo e serifada. Duas arquiteturas nao podem parecer a mesma coisa com outra cor.

## Armadilhas ja pagas

- **O `span` com `aspect-ratio` precisa de `display:block`.** Sem isso ele nao
  entra na altura do cartao e o titulo da secao seguinte sobrepoe os cartoes.
- **Chrome headless tem largura minima de janela de 500px.** Pedir 412 devolve um
  estouro de layout que nao existe. Capturar o celular com 500.
- **O print sai com franja colorida** no texto por causa do antialias de subpixel.
  Usar `--disable-lcd-text --force-color-profile=srgb`. Nao e defeito de CSS.
- **Capturar pela origem** com `--host-resolver-rules`, senao o print vem do cache
  da Cloudflare e some o que acabou de mudar.

## Correcoes de motor em 20/08/2026 (vieram da conversao do adonline)

**Quinze arquiteturas nao abriam o `<body>`.** O `buildHead` fecha em `</head>` e
quem abre o corpo e a funcao de cabecalho de cada arquitetura. O navegador
conserta sozinho, entao nada quebrava na tela, mas o documento era invalido e
`</body>` fechava algo que nunca abriu. Afetava 15 dos 28 portais.

> Armadilha: **N e R chamam `nRail` e `rNav` direto** de `*Home`, `*Article` e
> `*List`, e nunca passam pelo `*Header`. Corrigir o `*Header` so pegava a pagina
> institucional, e a home continuava sem `<body>`. O `<body>` teve que entrar na
> funcao que todos os caminhos chamam.

**59 links de editoria montados a mao**, `/${slug}/` em vez de `H.curl(slug)`:
**nao trocar.** Este motor **nao tem `H.curl`**. A troca quebrou a renderizacao
das 28 arquiteturas com `TypeError: H.curl is not a function` e foi revertida.

> Erro de metodo que vale registrar: para provar que a troca era inerte, comparei
> o md5 das 28 homes antes e depois e deu igual. **Deu igual porque o rebuild
> falhava** e o arquivo antigo continuava no lugar. Comparar saida que nao foi
> regerada nao prova nada. Depois de mexer no motor, conferir o **exit code** do
> rebuild portal por portal, e so entao comparar a saida.

Como nenhum portal desta maquina usa `categoryBase`, `/${slug}/` e a forma certa
aqui. O cuidado do `H.curl` vale para a opengravity e para a clinicas-vps, cujos
motores sao mais novos e onde existem portais com `categoryBase`.

**A pagina de busca nao entra aqui**: esta maquina roda um `render.js` anterior,
de 1.053 linhas, que ainda nao tem `searchPageHtml`.
