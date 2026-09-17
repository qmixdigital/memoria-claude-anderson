# Medir UI com Playwright: as armadilhas que fazem o teste mentir

**Leia antes de usar Playwright para PROVAR alguma coisa sobre a interface.**
Para tirar print, o padrão basta. Para afirmar "o menu não abre", "o conteúdo
sumiu", "há 1064 páginas órfãs", o instrumento precisa ser provado antes do site.

A regra-mãe está em uma frase: **falha isolada só vira defeito depois de
reproduzida por um segundo caminho.** Um instrumento que erra devolve exatamente
a mesma cara de um site quebrado.

---

## 0. Todo auditor imprime o alvo antes do resultado

Primeira linha de saída de qualquer script de auditoria: **a URL e o commit que
ele está medindo**. Sem default silencioso.

```js
const BASE = process.env.BASE;
if (!BASE) { console.error("ERRO: defina BASE. Sem alvo nao ha medicao."); process.exit(1); }
console.log(`alvo: ${BASE}  |  commit: ${process.env.COMMIT ?? "(nao informado)"}`);
```

O que já aconteceu por não fazer isso:

- Medi um build velho porque `pkill -f "next start"` não matou o servidor, e o
  processo antigo continuou respondendo na porta.
- Um auditor de contraste tinha URL de produção embutida, e eu quase reportei
  número de produção como se fosse local.
- Um auditor de links rodou contra `localhost:3000` estando em produção e
  devolveu "1 página alcançada, tudo quebrado".

**Antes de qualquer conclusão, liste o que só existe atrás de variável de
ambiente** (consent, analytics, chat, feature flag) e rode com elas ligadas ou
contra produção. Um banner de LGPD que só monta com `NEXT_PUBLIC_GA_ID` não
existe no local, e "0px de sobreposição" ali é falso negativo: em produção ele
cobria 158px.

---

## 1. Três estados, nunca dois

Todo script distingue **passou**, **falhou** e **não encontrei o alvo**. Um
"0 encontrado" onde o alvo não existe é falso negativo, não sucesso.

```js
const alvo = await p.$(".banner-consentimento");
if (!alvo) { console.log("ALVO AUSENTE: .banner-consentimento nao existe nesta pagina"); process.exit(2); }
```

Sem isso, o auditor de contraste devolvia 0 falhas em todas as páginas. Reescrito
para acusar alvo ausente, deu 43.

## 2. Nenhum auditor entra no checklist sem ter sido visto REPROVANDO

Reintroduza o defeito, veja vermelho, só então confie no verde. Quatro
ferramentas já deram verde estando erradas:

- Auditor de headings que aprovava H1 contra um mapa de palavras-chave que o
  próprio agente escreveu.
- Auditor de contraste que devolvia 0 falhas em tudo.
- Verificador de área logada que dizia "307, protegido" nas dez respostas que
  estavam vazando e-mail, porque conferia **status** e não **corpo**.
- Checagem de banner de cookies que passava porque o elemento não existia no
  ambiente local.

---

## 3. `page.click()` rola a página

O Playwright rola para garantir acionabilidade. Isso **falseia qualquer medição
de rolagem**: já escrevi conserto para um bug de restauração de scroll que não
existia. Medindo rolagem, dispare o clique no DOM:

```js
await p.$eval("#abrir", (el) => el.click());   // nao rola
```

## 4. Sem `reducedMotion` o print sai vazio

Scroll-reveal deixa a seção em `opacity:0` até o observador disparar. Quase
diagnostiquei "conteúdo sumiu no modo escuro" por isso.

```js
const ctx = await b.newContext({ reducedMotion: "reduce" });
```

E garanta que o estado de repouso mostra conteúdo: o bloco
`prefers-reduced-motion` precisa zerar **delay** também, não só duração.

## 5. `networkidle` nunca chega com GA4 na página

Analytics mantém conexão aberta. Use `domcontentloaded` mais uma espera pelo
elemento que importa, nunca `networkidle` como prova de que a página assentou.

## 6. `count()` conta nó oculto

`locator.count()` não olha visibilidade. Foi assim que um menu que abria
normalmente passou por "não abre". Meça o que decide:

```js
await expect(p.locator("#menu")).toBeVisible();
// ou, sem expect:
const visivel = await p.locator("#menu").isVisible();
```

## 7. Acordeão fechado ainda mede altura

Elemento dentro de `grid-template-rows:0fr` continua devolvendo `height` no
`getBoundingClientRect`. Minha primeira medição de folga entre alvos de toque deu
`-135px` por causa disso. Filtre por altura efetiva do container, ou meça só o
que está visível.

## 8. `p.evaluate(fn)` quebra sob tsx/esbuild

`__name is not defined`: o esbuild instrumenta a função antes de serializar.
**Auditor roda como `.mjs` puro**, nunca via `tsx`.

## 9. A largura que quebra não é a do breakpoint, é a de cima

Menu e rodapé passaram em 390 e 1280 e colapsavam em **768 e 920**. Meça a faixa,
não os extremos:

```js
for (const w of [360, 390, 414, 640, 768, 834, 920, 1024, 1280, 1440]) { /* ... */ }
```

---

## 10. Órfã se prova por estrutura, não por rastreio

Rastrear 900 de 2912 páginas acusou **1064 órfãs**; o número real era **zero**.
O que o rastreio mediu foi profundidade, não orfandade.

Em diretório a prova que serve é a **cobertura da paginação**: somar os links de
ficha ao longo de todas as páginas de cada cidade e bater com a contagem do
banco. O rastreio é indício; a aritmética é prova.

E cuidado com o anti-flood do próprio site: um `429` faz um botão existente
parecer ausente. Se a checagem falhar, cheque o status HTTP antes de acusar o
HTML.

---

## 11. Performance: mediana de 5, com dispersão

Três rodadas na mesma página deram **70, 70 e 83**. Nenhuma conclusão de
performance sai de uma rodada.

- Rode 5, reporte **mediana e intervalo**.
- Intervalo maior que 3 pontos: o número não sustenta decisão.

E **o nome da métrica não é o diagnóstico.** Eu escrevi em relatório de entrega
que o gargalo era a troca de fonte, e propus `display: optional` ao custo da
tipografia aprovada. Era o **preload da fonte roubando banda do CSS**, correção
que não custou nada do design. Antes de nomear a causa, olhe início, fim e
prioridade de cada requisição na cascata.

---

## 12. Caixa de proporção fixa corta o desenho

Vale para mapa, gráfico e qualquer SVG gerado no servidor. Uma figura com
`aspect-ratio` fixo e `overflow:hidden` em volta de um SVG com `height:auto`
**corta o que passar**, sem erro e sem aviso.

Medido num diretório rural: 61px do polígono cortados, e **71,2% dos imóveis**
eram mais altos que a proporção da caixa, ou seja, a maioria das fichas mostrava
polígono incompleto. A caixa tem que tomar a proporção do dado, por variável
inline, e o `preserveAspectRatio="xMidYMid meet"` garante que tudo cabe.

Como provar que não corta:

```js
const bb = await p.$eval("svg path", (el) => el.getBoundingClientRect());
const rf = await p.$eval("figure", (el) => el.getBoundingClientRect());
console.log("cortado em px:", Math.max(0, Math.round(bb.bottom - rf.bottom)));
```

Meça o **caminho desenhado**, não o elemento `svg`: o svg pode caber e o desenho
dentro dele estar fora.

---

## 13. Acessibilidade é comportamento, e não sai em print

Nenhum destes aparece em screenshot, e os quatro estavam num menu aprovado
visualmente:

- `aria-modal` no painel com o botão de fechar **fora** dele: o leitor de tela
  apaga justamente o botão de fechar.
- "Fechar" como 11ª parada de Tab.
- Zero `aria-current` num menu de 20 páginas.
- Trava de rolagem por `overflow:hidden`, que não segura o Safari do iPhone.

Todo componente com estado (menu, modal, drawer, acordeão) passa por um script
que exercita **teclado, foco, Esc, `inert` e trava de rolagem**, além do print:

```js
await p.keyboard.press("Tab");
console.log("1a parada:", await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)));
await p.keyboard.press("Escape");
console.log("fechou com Esc:", !(await p.locator("#painel").isVisible()));
console.log("foco voltou:", await p.evaluate(() => document.activeElement?.id));
console.log("rolagem travada:", await p.evaluate(() => getComputedStyle(document.body).overflow));
```

E **alvo de toque vem de `padding` mais `gap`, nunca de `min-height`**: duas
linhas de texto já medem 43,5px, então o `min-height` não faz nada e os alvos
ficam a 0,5px um do outro.
