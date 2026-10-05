---
name: padrao-ga4-adsense
description: GA4 e AdSense nos sites do Anderson: GA4 lazy-load que mede sempre (sem depender de banner), gtag global, rastreio.js de contato, generate_lead, retencao 14 meses; AdSense com as duas formas do publisher ID (ads.txt sem ca-, client= com ca-), checklist, Consent Mode e ordem do head no React 19, sem anuncio em 404/admin. Use ao instalar ou auditar Google Analytics, GA4, AdSense, ads.txt ou rastreamento de cliques.
---

## Google Analytics (GA4)

- SEMPRE implementar GA4 com **lazy-load** (nunca carregar no page load)
- Carregar somente apos primeira interacao do usuario (scroll, click, touch, keydown)
- Isso evita impacto nos Core Web Vitals
- **O GA4 mede SEMPRE, com cookie e sessao completa. Nao depende de aceite
  de banner.** Ordem do Anderson em 22/09/2026: "eu quero saber quem esta
  navegando no site; aqui e Brasil". A regra antiga ("GA4 so carrega SE o
  usuario aceitar") esta REVOGADA, e Consent Mode com `denied` por padrao
  tambem NAO se usa: os dois deixavam de fora quem ignorava o banner, que e a
  maioria no celular, e o relatorio mensal mostrava uma fracao do real. Base
  legal: legitimo interesse (art. 7o, IX, da LGPD), declarado na politica de
  privacidade. O banner de cookies continua existindo, mas so informa.
- **`window.gtag` e `window.dataLayer` SEMPRE globais e definidos ANTES de o
  script do Google chegar.** Um `function gtag()` local ao loader nao e visto
  pelo `rastreio.js` de contato e o clique no WhatsApp se perde.
- Instalar tambem o `rastreio.js` de contato
  (`d:/SISTEMAS/Relatórios de Clientes/rastreio-cliques/rastreio.js`) antes de
  `</body>`, marcar `generate_lead` como evento-chave na propriedade e subir a
  retencao de dados de 2 para 14 meses (o padrao de 2 meses apaga o historico
  do relatorio).

**Sites HTML estaticos** (implementacao de referencia:
`d:/SITES/henriquecembranelli.com/js/main.js`):
```html
<script>
(function(){
  var GA_ID = 'G-XXXXXXXXXX';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  var loaded = false;
  function loadGA(){
    if(loaded || GA_ID === 'G-XXXXXXXXXX') return;
    loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.async = true;
    document.head.appendChild(s);
  }
  ['scroll','click','touchstart','keydown'].forEach(function(e){
    window.addEventListener(e, loadGA, {once:true, passive:true});
  });
})();
</script>
<script src="/js/rastreio.js" defer></script>
```

**Next.js:** mesmo desenho num componente cliente, com o gtag.js por loader
`createElement` apos a primeira interacao (ver a secao de Consent Mode no
AdSense: o React 19 ica `<script src>` para o topo do `<head>`).

- Perguntar o ID do GA4 (G-XXXXXXXXXX) ao iniciar o projeto, ou deixar placeholder para preencher depois

## Google AdSense

### O ID do publisher tem DUAS formas (erro que ja custou dias de anuncio parado)

O mesmo publisher ID aparece em dois formatos e eles **nao sao intercambiaveis**:

| Onde | Forma correta | Exemplo |
|------|---------------|---------|
| `ads.txt` | **sem** prefixo | `google.com, pub-3880875536722698, DIRECT, f08c47fec0942fa0` |
| `client=` do script | **com** prefixo `ca-` | `...adsbygoogle.js?client=ca-pub-3880875536722698` |
| meta `google-adsense-account` | **com** prefixo `ca-` | `content="ca-pub-3880875536722698"` |

**Por que isso engana:** com `client=pub-...` (sem o `ca-`) o navegador baixa o
`adsbygoogle.js` normalmente, retorna HTTP 200, o script aparece no HTML e nada
no console de rede acusa erro. Mas o AdSense nao identifica o publisher e **nao
serve anuncio nenhum**. A falha e 100% silenciosa.

**Regra:** ao guardar o ID em banco ou env, normalizar na hora de renderizar.
Nunca concatenar o valor cru no `client=`:

```ts
// aceita o ID salvo em qualquer uma das duas formas
const normalizar = (id: string) => (id.trim().startsWith("ca-") ? id.trim() : `ca-${id.trim()}`)

// script e meta usam a forma COM prefixo
`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${normalizar(id)}`
<meta name="google-adsense-account" content={normalizar(id)} />

// ads.txt usa a forma SEM prefixo
`google.com, ${id.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`
```

**Checklist obrigatorio ao ligar AdSense em qualquer site:**

1. `curl SITE/ads.txt` retorna a linha com `pub-` **sem** prefixo
2. `curl SITE/ | grep -o 'client=[a-z-]*pub-[0-9]*'` retorna **`client=ca-pub-...`**
3. Meta `google-adsense-account` presente com `ca-pub-...`
4. Consent Mode roda **antes** das tags do Google (ver secao de Consent Mode abaixo)
5. `robots.txt` nao bloqueia `Mediapartners-Google` nem `AdsBot-Google`
6. Politica de privacidade divulga cookie de terceiros e link de opt-out

Conferir que "o script carregou" **nao e suficiente**: ele carrega igual com o
ID errado.

### Consent Mode v2 e ordem no `<head>` (React 19 / Next.js)

O React 19 **ica elementos `<script src>` para o topo do `<head>`**, passando na
frente de qualquer `<script>` inline. Isso quebra o Consent Mode, que exige os
`gtag('consent','default',...)` antes das tags do Google.

Solucao: carregar GA4 e AdSense por loader inline com `createElement`, que
respeita a ordem do markup e mantem o carregamento assincrono:

```ts
`(function(){var s=document.createElement('script');s.async=true;s.src='URL';s.crossOrigin='anonymous';(document.head||document.documentElement).appendChild(s);})();`
```

Efeito colateral a compensar: sem a tag no HTML servido, a verificacao de site
do Google nao acha o snippet. Por isso a meta `google-adsense-account` do item 3
acima passa a ser obrigatoria.

### Anuncio em pagina de erro

Nao exibir anuncio em 404, tela de erro, `/admin` e painel logado. Usar a API
oficial `(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1`.

Atencao no Next.js App Router: `not-found.tsx` e `error.tsx` sao entregues pelo
**payload RSC**, e `<script>` criado pelo React no cliente **nunca executa**.
Nessas telas o flag precisa ser setado por componente cliente, nao por markup.
Em pagina com HTML de servidor (admin, painel) o `<script>` inline funciona.
