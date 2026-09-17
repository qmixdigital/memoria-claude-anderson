# Design de diretório: a UI densa que nenhuma skill de design cobre

**Leia isto antes de desenhar listagem, ficha, tabela ou paginação de diretório.**

O `taste-skill` declara no próprio escopo: *"Landing pages, portfolios, and
redesigns. **Not dashboards, not data tables**, not multi-step product UI."* O
`frontend-design` fala de identidade e atmosfera. Nenhum dos dois cobre a tela
que o diretório mais tem: uma tabela com milhares de linhas, um número grande, e
uma paginação de 126 páginas.

O resultado prático é que o hero sai bonito e a listagem sai reprovada. Foi o que
aconteceu num diretório rural: o dono reprovou **onze pontos** na primeira
rodada, e a maioria era desta natureza. Abaixo está o que ele reprovou, o que
substituiu, e por quê. Use como ponto de partida, não como template a repintar.

---

## 1. Número grande é o inimigo do mobile

Reprovado: *"listagem de imóveis mal otimizada no mobile, talvez por causa dos
números grandes"*.

Uma tabela de diretório é meia dúzia de colunas onde uma delas é um valor que
domina a linha (área, preço, distância, quantidade). No celular, a conversão
ingênua "tabela vira cartão" empilha tudo e o valor briga com o nome.

**O padrão aprovado não é cartão, é linha de dois níveis**: um grid de duas
colunas onde o identificador e os metadados ocupam a coluna esquerda em dois
andares, e o número fica sozinho à direita, alinhado, grande, com a unidade
menor colada nele.

```css
@media (max-width:720px){
  table,tbody{display:block}
  thead{display:none}
  tbody tr{display:grid;grid-template-columns:minmax(0,1fr) auto;
           grid-template-areas:"code area" "meta area";
           column-gap:12px;row-gap:6px;padding:14px 16px;
           border-bottom:1px solid var(--line);align-items:start}
  tbody td{display:block;padding:0;border:0}
  td.c-code{grid-area:code;font-size:14px;line-height:1.35}
  td.c-area{grid-area:area;text-align:right;font-size:17px;font-weight:600;
            letter-spacing:-.01em;line-height:1.2;white-space:nowrap}
  td.c-area::after{content:" ha";font-size:12px;font-weight:500;color:var(--muted)}
  td.c-meta{grid-area:meta;display:flex;flex-wrap:wrap;gap:6px 12px;
            font-size:13px;color:var(--muted)}
  td.c-hide{display:none}          /* colunas que não sobrevivem ao celular */
}
```

Três detalhes que fazem a diferença:

- **A unidade entra por `::after`**, não no dado. O valor fica limpo para
  alinhar, e a unidade some quando não fizer sentido.
- **`white-space:nowrap` no número.** "15.603,3" quebrando em duas linhas
  destrói a coluna inteira.
- **`c-hide` é decisão de conteúdo, não de espaço.** Escolha quais colunas o
  celular não precisa; não deixe o navegador escolher por você.

> Cuidado: essa regra vale para `max-width:720px`, e **a folha A4 impressa tem
> 688px de largura útil**. Um relatório em PDF cai dentro do breakpoint de
> celular e perde os rótulos da tabela. Ver `seo-e-render.md`, seção de impressão.

## 2. Números precisam de tabular-nums de verdade

Reprovado: a monoespaçada, que *"entrega que o site é de IA, e também é feia"*.

A tentação é usar mono para alinhar coluna de número. Não use. **Uma sans com
`font-variant-numeric: tabular-nums` alinha igual** e não tem a cara de terminal
que o dono reprova em qualquer projeto da rede.

```css
td.r{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;font-weight:500}
```

Confira que a fonte escolhida **tem** o recurso `tnum`: sem ele a declaração não
faz nada e as colunas continuam dançando. Uma família só para o site inteiro.

## 3. Paginação: janela com reticências mais salto direto

Reprovado: *"a paginação não está boa"*.

Um município grande tem 126 páginas. Listar todas é inútil; listar só "Anterior
/ Próxima" obriga a pessoa a clicar 60 vezes para chegar ao fim. Os dois casos
são reais e precisam dos dois controles:

- **Janela em volta da atual** (raio 2), sempre com a primeira e a última, e
  reticências no meio. `1 … 7 8 [9] 10 11 … 126`.
- **Campo de salto direto**: caixa numérica mais botão "Ir".
- Links reais (`<a href>`), navegáveis sem JavaScript, senão o Googlebot não
  desce na paginação e as fichas profundas não são descobertas.
- Alvo de toque mínimo (`min-height: var(--tap)`) em cada número, e
  `tabular-nums` para os botões não mudarem de largura entre 9 e 10.

## 4. Página com muitos resultados precisa de busca DENTRO dela

Reprovado: *"falta barra de busca nas páginas com muitos resultados"*.

Com 6.281 registros num município, paginar não é forma de achar nada. A listagem
precisa de um filtro próprio: busca por identificador, filtro por situação e
ordenação. Formulário GET, resolvido no servidor, sem JavaScript, para continuar
funcionando e continuar indexável.

## 5. O dado bruto precisa de tradução, não de mais dado

Reprovado: *"a área do imóvel poderia ser melhor representada"*.

"15.603,3 ha" não informa ninguém: é grande ou pequeno? comprido ou compacto? O
conserto não é aumentar a fonte, é responder as perguntas que o número levanta:

- a mesma medida noutra unidade que a pessoa tem intuição (km²);
- onde ela cai numa faixa legal ou de mercado (a lei, o porte, a categoria);
- a forma, quando houver geometria (extensões, perímetro, alongamento);
- uma equivalência concreta ("cerca de 48 campos de futebol").

E a regra que vem junto: **o que a fonte não publica não aparece**. Se a camada
de dados ainda não entrou, o bloco fica fora, em vez de mostrar uma barra vazia
que sugere zero.

## 6. Ficha com muitos blocos: duas colunas assimétricas, não uma grade igual

Reprovado: *"o layout de embargo está horrível no desktop (no mobile está ok)"*.

O erro clássico é resolver o desktop repetindo a grade do mobile em três colunas
iguais. Bloco de ficha tem hierarquia: um conteúdo principal e um conjunto de
metadados. Duas colunas **assimétricas** (conteúdo largo à esquerda, metadados
estreitos à direita) leem melhor do que qualquer grade simétrica.

## 7. Hero de diretório não é hero de landing

Reprovado: *"o hero dividido não faz sentido e é feio"* e *"o hero no mobile
está ruim"*.

O split hero (texto de um lado, imagem/mockup do outro) é o default de landing
de SaaS e não serve aqui: o diretório não vende uma promessa, ele entrega uma
consulta. **Coluna única com a busca no centro** é o que corresponde à intenção
de quem chega. Teste o hero no celular separadamente: ele é a tela onde o split
mais quebra.

## 8. Logo de diretório: monocromático com um ponto de acento

Reprovado: *"o logo está ruim"*.

Marca que precisa funcionar em cabeçalho escuro, em fundo claro e em 24px não
pode depender de cor. Desenhe em `currentColor` com **um único** ponto de acento,
e confira legível em 24px antes de aprovar.

---

## O que verificar antes de mostrar

- Print da **listagem cheia** e da **ficha**, desktop e mobile. Hero bonito com
  listagem reprovada é o resultado padrão de só printar a home.
- Um `<form>` com botão dentro de uma linha de ações **quebra a linha**: o
  formulário forma caixa. `display:contents` no form devolve o botão ao fluxo.
- Caixa com `aspect-ratio` reserva espaço e zera CLS na tela, mas vira faixa
  branca em qualquer contexto onde o conteúdo é menor (impressão, export).
- Alvo de toque ≥ 44px em número de paginação, chip de filtro e link de tabela.

## Classe viva no TSX e morta no CSS: a varredura que não basta

Já aconteceu duas vezes no mesmo projeto, com meses de site no ar entre uma e
outra. É o defeito mais barato de achar e o mais caro de deixar passar, porque
não quebra build, não quebra teste e não aparece em erro nenhum: a página só
cai no estilo cru do navegador e ninguém repara.

1. `.pares` foi **apagada numa revisão de design** enquanto três páginas ainda
   usavam. As listas de par rótulo/valor voltaram ao `dl` sem estilo.
2. `.grid` **nunca teve regra**. O arquivo tinha só `.foot .grid`, do rodapé.
   Nas cinco páginas que usavam `<div className="grid">` fora do rodapé, `div`
   é bloco: doze cartões empilharam um por linha, cada um com o texto ocupando
   40% da largura, e a seção virou uma torre de 1.900px.

**A varredura de classe órfã tem que casar ESCOPO, não só nome.** A que eu
tinha rodado depois do `.pares` procurava classe sem NENHUMA regra no CSS, e
por isso passou reto pela `.grid`: ela tinha regra, só que atrás de um pai que
aquele TSX não tem. A verificação certa compara `className` do TSX com os
seletores que **de fato casam naquele contexto**:

```bash
# 1. toda classe usada no TSX
grep -rho 'className="[^"]*"' src --include=*.tsx |
  sed 's/className="//;s/"//' | tr ' ' '\n' | sort -u > /tmp/usadas

# 2. para cada uma, ver TODOS os seletores que a mencionam.
#    Se todos vierem com um pai (`.foo .classe`, `.foo>.classe`), e o TSX usa a
#    classe fora desse pai, a regra NAO se aplica: e orfa de escopo.
while read c; do
  [ -z "$c" ] && continue
  hits=$(grep -o "[^{},]*\.$c\b[^{}]*{" src/app/globals.css)
  [ -z "$hits" ] && { echo "SEM REGRA: .$c"; continue; }
  echo "$hits" | grep -qE "(^|,)\s*\.$c\b" || echo "SO COM PAI: .$c -> $hits"
done < /tmp/usadas
```

`SEM REGRA` e `SO COM PAI` são os dois casos, e o segundo é o que escapa.
Rodar isto **depois de toda revisão de design** e antes de entregar. Medir a
altura da seção no navegador também acusa: uma grade de doze itens com 1.900px
de altura em desktop é grade que não virou grade.

**E ao remover uma classe do TSX, remover a regra junto.** A numeração `2.1 …
2.12` saiu dos cartões de consulta e a regra `.cell .i` foi apagada na mesma
edição, deixá-la viva seria plantar o próximo `.pares` ao contrário.

### A varredura no sentido inverso (a que faltava)

A varredura acima pergunta *"esta classe do TSX tem regra que casa?"*. Ela não
pergunta o contrário, e foi o contrário que me pegou: **ao remover uma classe do
markup, quais regras ficam órfãs?**

No consultarimovel eu tirei `map` do componente de mapa (ela impunha uma caixa de
proporção fixa que cortava o polígono em 71% dos imóveis). Junto foi embora o
`.map .tag`, que era quem posicionava o rótulo: ele virou texto solto no canto,
sem caixa e sem caixa alta. Regra viva, markup sem o pai. Quarta órfã do projeto,
e a primeira que eu mesmo criei.

```bash
# Toda classe citada em SELETOR de regra que nenhum className usa.
grep -o '^[^{}@][^{}]*{' src/app/globals.css |
  grep -o '\.[A-Za-z][A-Za-z0-9_-]*' | sort -u | sed 's/^\.//' |
while read c; do
  grep -rq "\b$c\b" src --include=*.tsx || echo "REGRA SEM MARKUP: .$c"
done
```

Dá falso positivo em `className` montado por template ou condicional, então o
`grep -rq` acima confere a ocorrência em qualquer forma, e não só em
`className="..."`.

**Regra morta não causa bug** (o defeito é sempre o inverso, markup sem regra),
mas ela conta história: no mesmo projeto a varredura revelou `.legend` com seis
regras para camadas de reserva legal e APP no mapa. O componente só desenha o
perímetro. Ou a funcionalidade caiu, ou nunca subiu, e ninguém saberia.

**Rode as duas direções depois de qualquer edição que ADICIONE ou REMOVA classe
do markup**, não só depois de revisão de design.

## Caixa de proporção fixa corta o desenho (mapa, gráfico, qualquer SVG)

Uma figura com `aspect-ratio` fixo e `overflow:hidden` em volta de um SVG com
`height:auto` **corta o que passar**, sem erro, sem aviso e sem nada na tela
indicando que falta pedaço.

Aconteceu no diretório rural: o componente carregava duas classes, e a de baixo
impunha `aspect-ratio:600/440` com `overflow:hidden` enquanto a de cima dava
`height:auto` ao svg. Medido: **61px do polígono cortados**, e **71,2% dos
imóveis** eram mais altos que a proporção da caixa. A maioria das fichas de um
site que promete o polígono oficial mostrava polígono incompleto.

**A caixa toma a proporção do DADO**, por variável inline, com um limite para o
formato extremo não gerar uma torre:

```tsx
const proporcaoDoDado = altura / largura;
const proporcaoDaCaixa = Math.min(1.1, Math.max(0.6, proporcaoDoDado));
<figure className="mapa" style={{ ["--proporcao" as string]: `1 / ${proporcaoDaCaixa.toFixed(3)}` }}>
```

```css
.mapa svg{width:100%;height:auto;aspect-ratio:var(--proporcao, 600 / 440)}
```

Fora do limite o desenho **encolhe e sobra margem**, que é honesto. O que não
acontece mais é cortar.

**Três detalhes que o conserto ensinou:**

- A proporção vai no **svg**, não na figura. Na figura, o svg a 100% da altura
  soma com o `figcaption` e empurra a legenda para fora do `overflow:hidden`: o
  mapa para de cortar o desenho e passa a cortar a legenda.
- **Meça o caminho desenhado, não o elemento `svg`.** O svg pode caber e o
  desenho dentro dele estar fora:
  `Math.max(0, path.getBoundingClientRect().bottom - figure.getBoundingClientRect().bottom)`.
- **Teto de altura calibrado para a caixa antiga vira desperdício.** Quando o
  desenho era cortado para preencher, `max-height:320px` fazia sentido. Com o
  desenho inteiro, ele passou a encolher o polígono no meio de 686px de margem
  vazia na folha A4 do PDF, que é produto pago. Revise os tetos junto.
