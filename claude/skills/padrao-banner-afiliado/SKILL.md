---
name: padrao-banner-afiliado
description: Banner de afiliado de consulta de CPF/CNPJ (Consulte Facil, Mega Consultas, links com ?promo=) nos sites da rede: onde entra (faixa no topo, painel no fim, in-feed, in-article, ancora no celular), densidade em lib/afiliados.ts, textos por contexto, rel sponsored, design 'carimbo' na paleta do site, implementacao de referencia no consultarimovel.ia.br. Use quando ele pedir banner de afiliado, banner de consulta de CPF ou mandar link com ?promo=.
---

## Banners de Afiliado (consulta de CPF e similares)

Regra fixada pelo Anderson em 19/09/2026, depois de aprovar a implementacao no
consultarimovel.ia.br. Vale para **qualquer site** da rede. Quando ele pedir
"insira o banner de consulta de CPF", "banner de afiliado" ou mandar um link
com `?promo=` de plataforma de consulta (Consulte Facil, Mega Consultas,
consultar.cpf ou similar), e ISTO que ele quer, sem precisar explicar de novo.

### O que e o produto

Plataforma de consulta por CPF/CNPJ: dividas, protestos, acoes judiciais,
falencia, score. O Anderson e afiliado e ganha por cadastro. Dois links com o
**mesmo UUID de promo** sao a mesma plataforma sob marcas diferentes: usar UM
so, o que diz o que vende (lista as consultas na pagina). Anunciar os dois e
repetir o mesmo produto duas vezes.

### Onde entra (a regra dele: "o lugar que da clique e no inicio")

- **Faixa compacta no TOPO**: uma linha, logo depois da primeira frase de
  abertura da pagina, ANTES da listagem ou do artigo. E o slot de maior clique.
  (O texto longo de SEO, ao contrario, vai para o FIM: sao duas decisoes
  diferentes e as duas sao dele.)
- **Painel completo no FIM** da pagina, depois do texto e da FAQ.
- **In-feed**: uma faixa a cada N linhas de tabela ou N itens de lista longa,
  como linha ou item de largura inteira. Nunca na primeira linha.
- **In-article**: uma faixa antes do H2 que abre a secao 3, 5, 7... Nunca antes
  da primeira secao, que responde a pergunta do titulo.
- **Ancora fixa no celular**: barra de uma linha acima da navegacao inferior,
  com botao de fechar; o fechamento vale a sessao (sessionStorage via
  `useSyncExternalStore`, sem setState em efeito). So abaixo de 720px.
- **Nunca** acima do produto pago do proprio site (na ficha, a faixa entra
  DEPOIS dos botoes de PDF/KML), e **nunca** em checkout, conta, login,
  relatorio pago, admin nem na pagina de planos: anuncio de terceiro no meio
  de uma venda da casa e dinheiro trocando de bolso na direcao errada.

E "como o AdSense automatico": proporcional ao conteudo, nunca empilhado, dobra
de cima com uma unidade so, e com **teto por lista** (6), senao pagina com 800
itens vira dezena de anuncios e o algoritmo de layout do Google le como
"dominada".

### Densidade em UM lugar

Constantes num arquivo so (`lib/afiliados.ts`): `linhasPorUnidade` (20),
`itensPorUnidade` (50), `secoesPorUnidade` (2), `maxPorLista` (6),
`ancoraCelular` (true), mais `ativo`, `url`, textos por contexto. Se o Search
Console cair nas semanas seguintes, o ajuste e subir os numeros, nao cacar
unidade por unidade no codigo.

### Texto

- Por **contexto** de pagina (municipio, estado, ficha, embargos, consulta,
  cpf, geral): anuncio que fala do que a pessoa esta vendo converte melhor e
  nao vira faixa identica que se aprende a pular.
- O angulo e sempre **a outra parte do negocio**: "conferiu o imovel? confira
  quem vende: dividas, protestos, processos por CPF". Nunca prometer o que o
  site diz que nao existe (ex.: "descubra os imoveis de alguem pelo CPF" num
  site que declara que a base publica nao expoe CPF).
- Rotulo visivel **"Publicidade"** e aviso em letra miuda de que e servico de
  terceiro, pago, sem relacao com os orgaos citados na pagina.

### Tecnica (obrigatorio)

- `rel="sponsored nofollow noopener"` e `target="_blank"` em todo link de
  afiliado. Sem `sponsored`, para o Google e esquema de links, e a punicao cai
  em quem hospeda.
- **HTML e CSS, sem imagem e sem script** (a excecao e o botao de fechar da
  ancora). Peca de servidor de terceiro traz requisicao externa e CLS. Medido:
  a pagina subiu de 97 para 99 no PageSpeed com o banner, CLS zero.
- Sem pixel de rastreamento: o `?promo=` na URL ja identifica a indicacao, e
  pixel exigiria consentimento de cookie sem mudar a comissao.
- Nada de `font-stretch` ou fonte diferente da do site na peca: muda a medida
  do texto na troca de fonte e gera CLS.

### Design: o "carimbo", na paleta DE CADA SITE

O conceito aprovado e um **carimbo pressionado sobre a pagina**: painel na cor
de tinta escura do site (inversao = contraste maximo sem cor estrangeira),
regua de cor de acento na borda esquerda como fita de selo, rotulo em caixa
alta com entreletra, textura sutil feita com um token que o site ja tenha
(no consultarimovel foi a graticula com `--ink-grid`), botao na cor de acento,
levantar leve no hover e nada de animacao de entrada.

**Em outro site, usar a paleta daquele site**: tinta, papel e acento vem dos
tokens do `:root` dele. Nunca introduzir cor nova so para o anuncio: e o
caminho curto para o site parecer alugado. O anuncio precisa se destacar
(pela inversao) e ao mesmo tempo pertencer (pelas cores). Borda tracejada ou
regua e o rotulo dizem que aquilo e anuncio; anuncio que imita o conteudo em
volta e o que o Google chama de publicidade enganosa.

### Implementacao de referencia

`consultarimovel.ia.br`, repo `qmixdigital/consultarimovel.ia.br`, em `app/`:
`src/lib/afiliados.ts` (config, densidade, textos por contexto),
`src/components/BannerAfiliado.tsx` (faixa e painel),
`src/components/AnuncioAncora.tsx` (ancora do celular),
`src/app/globals.css` (blocos `.ads*` e `.ancora*`). Copiar a estrutura e
trocar tokens e textos; nao reinventar.
