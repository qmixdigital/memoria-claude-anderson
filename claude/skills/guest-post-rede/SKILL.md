---
name: guest-post-rede
description: Use when the operator asks for backlinks, guest posts or link building for a client of the QMIX network, sends a client Search Console URL expecting links, sends a marketplace order for a portal of the network, or asks to audit, expand, fix or remove an already published guest post.
---

# Guest post na rede QMIX

> **Esta skill é da rede PRÓPRIA** (os portais da QMIX, via portal-engine, com destino
> escolhido pelo Search Console). Para publicar em **site de parceiro** pelo conector MCP
> (`criar_post`), com âncora e URL vindos no briefing, use a skill
> `materias-jornalisticas-linkbuilding`, em
> `d:\SISTEMAS\Publicações em sites de parceiros WordPress\.claude\skills\`.

## O portão: auditar ANTES de entregar

**Nenhum lote é entregue sem `scripts/auditar.py` passar com zero erros.**

A auditoria roda **duas vezes**, e as duas são obrigatórias:

1. **Antes de publicar**, sobre os arquivos locais: estrutura, links e ordem.
2. **Depois de publicar**, sobre a página no ar: schema, canonical, meta, densidade.

Só depois disso o lote vai para indexação, para a planilha e para o resumo ao operador.

### Não existe exceção

| Desculpa | Realidade |
|---|---|
| "É só um artigo" | Um artigo errado é um retrabalho igual ao de dez. |
| "O operador está com pressa" | Republicar e reauditar demora mais que auditar antes. |
| "Usei o mesmo template do lote anterior" | O lote anterior também tinha erro; foi assim que ele apareceu. |
| "Já conferi enquanto escrevia" | Conferir de cabeça não pega meta de 148 nem keyword ausente do H2. |
| "Audito depois, junto com o próximo" | Aí o link já foi entregue ao cliente com defeito. |

**Sinais de que você está prestes a violar isso:** publicou e já está montando a planilha; escreveu "pronto para indexar" sem ter rodado o script; o operador pediu para "seguir" e você pulou direto para o próximo cliente.

## Fluxo

1. **Destinos** do Search Console do cliente: impressão alta somada a posição ruim. Confirmar HTTP 200 em cada um antes de linkar.
2. **Portais** pela oportunidade livre de cada um, não por conveniência: varrer os portais da rede no GSC filtrando o tema do cliente e ficar com quem tem impressão sem clique em posição ruim.
3. **Pauta** tirada do termo livre do portal hospedeiro, nunca de lista pronta.
4. **Canibalização**: conferir slug e tema nos três hosts do portal-engine e no acervo do próprio portal. Pauta que colide, troca.
5. **Escrever** conforme `reference/padrao-editorial.md`.
6. **Imagem de destaque** por `scripts/banco_img.py`: foto de banco **sem obrigação de crédito**. Nunca gerar bloco de créditos, nunca `image.caption` citando a fonte. Ver a seção abaixo.
7. **Auditar local** → corrigir → publicar → limpar autoLink → reconstruir → reiniciar o motor → **auditar no ar** → corrigir → indexar → planilha.

## Desvios conscientes da skill seo-optimizer

Ela pede 3 a 5 links internos e links externos de autoridade. Aqui é **exatamente 2 internos** e **nenhum externo além do cliente**, porque link externo extra divide a autoridade que o post existe para transmitir. Não "corrija" isso de volta ao padrão genérico.

## Arquivos

- `scripts/auditar.py` — o portão. 24 checagens, local e no ar.
- `scripts/banco_img.py` — a foto de destaque: Pixabay, Pexels e Commons em CC0/domínio público, todas sem crédito. Chaves em `C:/Users/User/Documents/APIs/`.
- `scripts/commons_img.py` — busca crua no Commons. `legenda()` e `bloco_credito()` estão **desativadas**.
- `reference/padrao-editorial.md` — o contrato do artigo, com as medidas.
- `reference/armadilhas.md` — o que quebra no portal-engine e por quê.

## Estado

Skill escrita em 02/09/2026 a partir de um dia de operação real. **Ainda não passou por cenários de pressão com subagente**, então trate as regras como verificadas na prática e não como testadas formalmente.

## Conteúdo escrito pelo cliente

Quando o operador entrega o artigo pronto (`.docx` do cliente, por exemplo), o
texto **não se reescreve**: publica como está. O que se faz é a marcação, e só:
tirar as linhas de `Title:` e `Description:` que viraram parágrafo no Word e
usá-las como title e meta, desengordar heading que veio em negrito, corrigir
espaço faltando no texto visível e acrescentar o bloco `pe-leia-meio` com os 2
links internos do portal.

**Cuidado com o conserto de espaçamento:** aplicado com regex sobre o HTML
inteiro, ele entra dentro de `href` e destrói o link do cliente, que é a única
coisa que o post existe para entregar. Corrija apenas nos trechos fora de tag, e
confira depois que o primeiro link continua sendo o do cliente e responde 200.

O portão continua rodando, mas aqui ele **relata em vez de bloquear**: o que
aparecer sobre tamanho, H2, FAQ, meta e densidade é decisão de quem escreveu, e
vai no resumo ao operador. O que continua valendo como erro seu é o resto:
canonical, schema, Open Graph, imagem com alt e dimensão, links quebrados,
sitemap, contagem de internos e os extras que o autoLink injetou.

Título e meta do cliente entram como vieram, com uma exceção: título que passa
de 60 com o sufixo do portal é aparado, porque sairia cortado na busca de
qualquer forma. Diga no resumo o que foi aparado e por quê.

### Indexação paga não é automática

A submissão ao Apex gasta crédito comprado, 3 por URL. Em publicação de cliente
ela **não entra no fluxo**: termine o lote, entregue as URLs e **pergunte ao
operador se é para enviar**. Ele responde caso a caso.

O IndexNow nativo do portal-engine é gratuito e dispara sozinho na publicação,
então o artigo já foi anunciado mesmo sem o Apex. Diga isso ao perguntar, para
a decisão dele ser sobre acelerar, e não sobre estar ou não anunciado.

## Imagem de destaque: banco grátis, sem crédito, sem padrão

🔴 **O que aconteceu em 09/09/2026:** o lote da grafotecnia saiu com um bloco
byte-idêntico no fim de 10 artigos em 10 portais:

```html
<h2>Créditos das imagens</h2>
<ul><li>"Título", de Autor, via Wikimedia Commons, sob licença CC BY 2.0, recortada para este artigo.</li></ul>
```

Mesmo H2, mesma frase, mesma posição, mesmo `rel="nofollow noopener"`, os mesmos
dois domínios de saída em todos. `"recortada para este artigo" "via Wikimedia
Commons"` no Google devolvia a rede inteira. E vazou metadado cru em dois:
**"de not researched"** e **"de (autor nao informado)"**.

**A regra que vale desde então:** a imagem de destaque vem de fonte que **não
exige crédito**, e por isso **não existe bloco de crédito, legenda de fonte nem
`image.caption` citando a fonte**. A fonte fica só no JSON de trabalho.

```
python scripts/banco_img.py buscar "search term in english" --n 8 --portal SLUG
python scripts/banco_img.py pegar --termo "search term in english" --slug SLUG-DO-ARTIGO --saida lp --portal SLUG [--id pexels:123] --largura 1000 --altura 526
```

🔴 **O termo de busca é em INGLÊS nas três fontes.** Ordem do Anderson de
10/09/2026: o resultado é melhor em inglês em todas. Português fica só no alt,
que quem redige escreve olhando a foto.

🔴 **Foto de banco primeiro, IA não.** Imagem gerada por IA só entra se o
Anderson mandar naquele caso. Se as três fontes não devolverem nada apto, trocar
o termo, não a fonte.

| fonte | quando | por quê não pede crédito |
|---|---|---|
| Pixabay | conceito genérico (contrato, notebook, calculadora) | licença própria; a API **proíbe hotlink** e manda baixar, que é o que fazemos |
| Pexels | gente e ambiente, a melhor foto das três | licença própria |
| Commons | **assunto brasileiro** (cidade, órgão, autoridade) | só entra **CC0 e domínio público**; CC BY é recusado dentro do script |

O `--portal` sorteia por qual fonte a busca começa, sempre igual para o mesmo
portal, para a rede não sair 100% de uma fonte só.

Três armadilhas:

- **Pexels devolve `403 error code: 1010`** com o User-Agent padrão do Python. É
  bloqueio da Cloudflare por assinatura de navegador, não chave errada (chave
  errada dá `401`). O script já manda User-Agent de navegador.
- **Pixabay aceita upload gerado por IA** e não tem parâmetro para excluir. O
  script filtra pela tag (`ai generated`, `midjourney`, `3d`, `render`...). Olhar
  a foto antes de publicar continua obrigatório.
- **`image.caption` também é vetor.** Seis artigos do lote carregavam `"Imagem:
  Wikimedia Commons (Créditos e link no final do artigo)"` nesse campo; uma das
  arquiteturas renderizava como legenda. Não preencher `caption` com fonte.

Se um dia for inevitável usar foto CC BY, o crédito é obrigatório por lei, e aí
ele **não pode ser template**: posição, redação, marcação e link variam por
portal. Antes disso, trocar a foto.

## Post publicado não fica órfão

Um guest post que só tem links de saída nasce sem autoridade interna: nada
aponta para ele além da home, da categoria e do sitemap, que são listagens.
**Todo post publicado recebe, no mínimo, 2 links de entrada** vindos de artigos
já existentes do mesmo portal, e 4 quando o acervo permitir.

Regras da inserção:

- **Mesmo portal, sempre.** Link cruzado entre portais da rede deixa pegada que
  o Google identifica. Nunca fazer.
- **Mesmo nicho.** O hospedeiro tem que ser do assunto, não apenas conter a
  palavra. Filtrar por tema no slug antes de procurar a frase, senão o link cai
  num texto de pilates porque ele dizia "estabilidade".
- **Âncora com a keyword do destino**, variando a redação a cada hospedeiro.
- **Nunca antes do link do cliente** do artigo hospedeiro: encontre a posição do
  primeiro link externo dele e insira depois disso.
- **Uma frase curta e diferente a cada inserção**, rodando um pequeno conjunto
  de aberturas, para 20 artigos não terminarem com a mesma linha.
- **Guarda obrigatória:** comparar a lista de links do hospedeiro antes e depois.
  Tem que ser idêntica, mais o novo. Qualquer outra diferença aborta a gravação.

Depois de inserir: reconstruir os índices, reiniciar o motor e **contar as
entradas de cada destino no disco**, que é a única confirmação de que a malha
ficou de pé.

**Armadilha que custou uma rodada inteira:** o script de inserção tinha o laço
no nível do módulo, sem `if __name__ == "__main__":`. Um segundo script que só
queria reaproveitar a função `inserir` disparou, no `import`, a rodada completa
outra vez, dobrando os links. Todo script que expõe função para outro fica sem
código solto no topo.

## Um portao so, e por que ele mudou

Ate 07/09/2026 o `auditar.py` media **densidade percentual** da keyword. Essa metrica
aprova artigo cuja keyword aparece no title, no H1 e no dek e **some do corpo**, que foi
o que aconteceu com um lote inteiro naquele dia. Desde entao ele tem a **Camada C**,
correspondencia exata, herdada do `validador_materia.py` da skill de materias
jornalisticas:

| Onde | Regra |
|---|---|
| title | keyword exata, obrigatoria |
| 100 primeiras palavras | keyword exata, obrigatoria |
| pelo menos um H2 | keyword exata, obrigatoria |
| corpo | 3 a 8 ocorrencias exatas (menos nao disputa, mais vira spam) |
| meta / linha fina | keyword exata, obrigatoria |
| cada palavra forte da keyword | 3x no minimo no texto |

**Consequencia pratica na escolha da pauta:** keyword de 7 ou 8 palavras nao fecha. Para
caber as 3 ocorrencias no corpo sem estourar os 3% de densidade, a keyword precisa ter
**3 a 5 palavras**. Escolha a pauta ja pensando nisso.

**Vicio que a Camada C pega e o olho nao:** escrever com sinonimo demais. Um artigo sobre
"cachorro comendo grama" que so fala em "caes", "animal", "mato" e "vegetais" fica bonito
de ler e nao disputa o termo. Use as palavras da keyword, nao so equivalentes.

## Este portao e a skill de materias jornalisticas se contradizem

Nao e defeito de nenhum dos dois: eles servem a redes diferentes. Duas exigencias sao
**opostas**, e aqui vale a desta skill, porque o destino e o portal-engine:

| Item | Aqui (rede propria) | `validador_materia.py` (parceiros) |
|---|---|---|
| lista ordenada `<ol>` | **exigida**, 1 por artigo | proibida (conta como bullet) |
| bloco `pe-leia-meio` no fim | **exigido**, entrega os 2 links internos | proibido (link no ultimo paragrafo) |

Se rodar o `validador_materia.py` num artigo desta rede, esses dois bloqueios vao aparecer
e **devem ser ignorados**. Todo o resto dele (humanizacao, trigramas, frases longas,
vocabulario proibido) continua valendo e vale a pena rodar.

O wrapper que separa os bloqueios conhecidos dos erros reais, em vez de silenciar tudo,
ficou em `scripts/val2.py`.

## O fluxo completo, em uma linha de comando cada

Esta skill sozinha cobre tudo. Nao e preciso acionar a de materias jornalisticas
junto: as regras dela que se aplicam a rede propria ja estao aqui (Camada C no
`auditar.py`) ou no wrapper `scripts/val2.py`.

```
escrever  ->  python scripts/val2.py ARQ.html "TITULO" "KEYWORD" "LINHA FINA"
          ->  python scripts/auditar.py local lote.json
          ->  publicar + rebuild + restart + purge CF
          ->  python scripts/auditar.py ar lote.json
          ->  links de entrada  ->  planilha  ->  perguntar sobre Apex
```

**Os dois primeiros passos sao obrigatorios e nao se substituem:**

- `val2.py` cobra a **escrita**: humanizacao minima de 70, trigramas repetidos,
  frases acima de 45 palavras, diversidade lexical, vocabulario proibido.
- `auditar.py` cobra a **publicacao**: estrutura, schema, links, meta, densidade
  e a Camada C de correspondencia exata.

O `lote.json` deve trazer **`h1` e `dek`** alem dos campos antigos. Sem eles a
densidade e medida so no corpo, diverge do que sera medido no ar e o script avisa
que a conta e parcial. Foi assim que um lote inteiro passou no portao local e
estourou depois de publicado.
