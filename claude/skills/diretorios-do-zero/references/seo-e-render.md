# SEO Técnico e Renderização

## Schema JSON-LD por tipo (emitir por `<script type="application/ld+json">`)

Nunca deixar microdata (itemprop/itemscope) no conteúdo editável: o Google marca "campo duplicado". O `sanitizeDbHtml` deve remover microdata. Emitir JSON-LD programático:

- **Ficha:** `@type` do nicho. Ex. saúde: `MedicalClinic` com `PostalAddress`, `telephone`, e **`geo` (GeoCoordinates)** quando houver lat/lng:
```ts
...(hasGeo ? { geo: { "@type":"GeoCoordinates", latitude: lat, longitude: lng } } : {})
```
Tabela de `@type` por nicho: plataformas→SoftwareApplication; empresas→LocalBusiness/Organization; profissionais→Physician/Person; clínicas→MedicalClinic/MedicalBusiness; restaurantes→Restaurant; serviços→Service.
- **Listagem** (estado/cidade/categoria): `CollectionPage` + `ItemList` (itemListElement com position/name/url) + `BreadcrumbList`.
- **Artigo:** `Article` com `headline`, `datePublished`, `dateModified`, `mainEntityOfPage`, `image` (absoluta; default og se não houver capa), `author`, `publisher` + **`FAQPage`** quando houver seção de perguntas.

## FAQPage automático (a partir do HTML do artigo)

Helper `extractFaqJsonLd(html)`: acha o `<h2>` "Perguntas frequentes...", pega os pares `<h3>Pergunta?</h3><p>Resposta</p>` até o próximo h2, decodifica entidades (inclui `&#8211;/&#8212;` → "-"), retorna `FAQPage` (>=1 item). Renderizar `{faqJsonLd && <JsonLd data={faqJsonLd} />}` no template do blog. Assim todo artigo com FAQ ganha rich result sem trabalho manual.

## Sitemap

- Índice `/sitemap-index.xml` → segmentos `/sitemap/[id].xml` (id 0 = estáticas + blog + testes + categorias; 1..N = um por estado/segmento).
- `generateSitemaps()` + `export const dynamic = "force-dynamic"` (o banco pode não responder no build; gerar em runtime evita sitemap vazio). Em Next 16 o `id` chega como Promise: `await Promise.resolve(id)` antes do `parseInt`.
- Só URLs de cidades/fichas **ativas**. Ficha sem contato → prioridade menor (0.5 vs 0.6). Ficha removida sai do sitemap.
- `robots.ts`: `rules: { userAgent:"*", allow:"/", disallow:["/api"] }`, `sitemap: <url>/sitemap-index.xml`.

### Sitemap com milhões de URLs (medido, não estimado)

Tudo abaixo saiu de um diretório com 8,5 milhões de fichas, onde o índice
respondia em **38 segundos** e cada segmento em **36**. Isso não é lentidão
cosmética: o sitemap é como as páginas são descobertas, e um arquivo que não
responde não é lido. O erro também **não aparece em teste feito na hora calma**,
porque só estoura quando a máquina está ocupada.

1. **Nunca conte no request.** O índice fazia um `count(uf, indexavel)` por
   estado, 27 varreduras sobre milhões de linhas, toda vez. Materialize o total
   numa coluna preenchida pela ingestão, junto com os outros agregados. 38s → 0,2s.

2. **Não leia a tabela grande; leia só o índice.** O segmento trazia o slug da
   cidade pela relação e a data da linha, o que obriga o Postgres a buscar
   50 mil linhas salteadas numa tabela que guarda geometria (6,5 GB): cada linha
   é uma página vinda do disco. Buscando **só a chave**, a consulta se resolve
   dentro de um índice parcial e não toca na tabela: **36s → 0,8s**.
   ```sql
   CREATE INDEX CONCURRENTLY imoveis_car_sitemap
       ON imoveis_car (uf, codigo) WHERE indexavel;
   ```
   O que faltar, derive: o código do IBGE já estava dentro do código do CAR, então
   o slug saiu de um mapa das 5.570 cidades (uma consulta pequena), e o `lastmod`
   passou a ser a data de carga do estado, que é a mesma para todos os registros
   carregados na mesma passada.

3. **`new URL()` num laço de 50 mil é caro.** O parser normaliza, valida esquema e
   decodifica porcentagem a cada chamada, e isso custava mais que a consulta
   inteira. Os `loc` são caminhos montados por você: concatene com a base.

4. **Não use as 50 mil URLs que o protocolo permite.** Com 50 mil, montar um
   arquivo custava de 3 a 21 segundos conforme a carga, e o nginx corta em 60:
   bastou a máquina ficar ocupada com uma ingestão para o Googlebot receber
   **504** justamente no arquivo mais importante. **10 mil por arquivo** deixa
   cada um em poucos segundos mesmo sob carga. O custo é ter mais arquivos, e
   isso não é custo: o limite de arquivos por índice também é 50 mil.

5. **Nunca pagine o sitemap com `OFFSET`.** Foi o ultimo defeito a cair, e o mais
   silencioso: com 10 mil URLs por arquivo, um estado grande tem 113 arquivos, e
   o de numero 50 precisa pular meio milhao de registros. Mesmo resolvendo
   dentro do indice, isso levava **16 segundos** — justamente nos arquivos das
   fichas mais profundas, que sao as que mais precisam ser descobertas.

   Guarde a **fronteira** de cada arquivo numa tabela preenchida pela ingestao,
   e leia a partir dela:

   ```sql
   -- na ingestao, junto com os outros agregados materializados
   INSERT INTO sitemap_faixas (uf, parte, "codigoInicial")
   SELECT uf, (pos / 10000)::int + 1, codigo FROM (
     SELECT uf, codigo, (row_number() OVER (PARTITION BY uf ORDER BY codigo) - 1) AS pos
       FROM fichas WHERE indexavel
   ) t WHERE pos % 10000 = 0;
   ```
   ```sql
   -- no request: leitura direta, mesmo custo no arquivo 1 e no 113
   SELECT codigo FROM fichas
    WHERE uf = 'MG' AND indexavel AND codigo >= :codigoInicial
    ORDER BY codigo LIMIT 10000;
   ```

   Resultado medido: 16s no arquivo profundo viraram **0,5s**, igual ao primeiro.
   Duas regras que vem junto: o numero de URLs por arquivo tem que sair do
   **mesmo modulo** que o site usa (se divergirem, o sitemap pula ou repete
   fichas em silencio), e **parte inexistente devolve 404**, senao ela cai na
   reserva com OFFSET, varre o estado inteiro e devolve zero URL em treze
   segundos.

6. **Confira com `Accept-Encoding: gzip`.** 10 mil URLs dão ~12 MB de XML e ~1 MB
   comprimido. Se o gzip não estiver ligado para `application/xml`, o problema é
   de nginx, não de código.

## Cidade vazia → 404 (evita página fina indexável)

Quando a curadoria esvazia uma cidade (`clinics_count=0`), marcá-la `active=false` e o `getCity` retorna null para inativa:
```ts
export const getCity = cache(async (slug: string) => {
  const [row] = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  if (!row || row.active === false) return null; // 404 em vez de 200 fino
  return row;
});
```
As listagens (`getCitiesByUf`, vizinhas) filtram `active=true` para não linkar cidade morta.

## Ordenar fichas com contato primeiro

```ts
.orderBy(
  desc(clinics.featured), desc(clinics.plan),
  desc(sql`(coalesce(${clinics.phone},'')<>'' OR coalesce(${clinics.whatsapp},'')<>'' OR coalesce(${clinics.website},'')<>'')`),
  asc(clinics.name)
)
```

## Botão copiar frase (artigos de listas de frases/mensagens) — GOTCHA

Artigos de "frases/mensagens" têm botão de copiar por item. **O `sanitizeDbHtml` remove `<button>`** (não está na allowlist, proteção XSS) → sobra só o texto "Copiar", inerte. Solução: um componente cliente `CopyableContent` que, após render, encontra a estrutura do conteúdo e **gera o botão funcional** + handler `navigator.clipboard`:

- Suportar as estruturas usadas: `<ol>` de citações, `<blockquote>`, e `<div class="frase-box"><p>frase</p><div class="frase-button-wrapper">Copiar</div></div>`. Para a frase-box: achar `.frase-box`, ler o `<p>`, e preencher `.frase-button-wrapper` com um `<button class="copy-btn" data-text="...">` (o handler já escuta `.copy-btn`).
- O conteúdo passa por `sanitizeDbHtml` **antes** do CopyableContent, então o componente sempre trabalha com o HTML já saneado (por isso ele gera o botão, não confia no `<button>` do conteúdo).
- `div`/`span`/`class` precisam estar na allowlist do sanitize para a `.frase-box` sobreviver.
- Manter a lista de slugs "copiáveis" (`COPYABLE_SLUGS`) que usam esse render. Após alterar o componente, avisar o usuário para dar Ctrl+F5 (bundle JS novo).

## Tabelas responsivas (blog)

Tabela nunca com rolagem horizontal no mobile: abaixo de 640px vira card (`data-rotulo` por célula) OU, para conteúdo de blog genérico, envolver em container com `overflow-x:auto`. Ver regra completa no CLAUDE.md ("Tabelas Responsivas").

## Impressão e PDF: a folha A4 cai dentro do breakpoint de celular

A armadilha que mais custou tempo num relatório pago. **A largura útil de um A4
com margens de 14mm é 182mm, ou seja 688px** — abaixo do `@media (max-width:720px)`
que quase todo site tem. Consequência: a regra que transforma tabela em cartão e
esconde o `thead` no celular dispara no PDF. No mobile isso é acerto; num
relatório de cinco colunas, apaga os rótulos e o comprador recebe valores soltos
sem saber o que é cada um.

Num bloco `@media print`, devolva a tabela ao que ela é:

```css
@media print{
  .folha table{display:table} .folha thead{display:table-header-group}
  .folha tbody{display:table-row-group} .folha tr{display:table-row}
  .folha td,.folha th{display:table-cell}
}
```

Outras três do mesmo episódio:

- **`break-inside:avoid` na seção inteira** empurra cada seção para uma folha
  nova e o documento sai com quatro páginas pela metade. O que não pode partir é
  o mapa/figura e a linha da tabela, não o bloco todo.
- **Caixa com `aspect-ratio`** (usada na tela para reservar espaço e zerar CLS)
  vira faixa branca no papel, porque o conteúdo impresso é menor que a proporção.
  `aspect-ratio:auto` no contexto de impressão.
- **Resíduo de glifo na margem**: título que foi para a folha seguinte pode
  deixar os acentos pintados na folha anterior (dois riscos cinza sem
  explicação). `overflow:clip` no título prende a pintura na caixa dele.

Verifique renderizando de verdade: `pdftoppm -png -r 80 arquivo.pdf saida` e
**olhe as páginas**. `pdftotext -bbox` acha resíduo que o olho não pega.

## AdSense / Consent Mode v2 (deixar pronto, sem inserir código)

- Publisher ID em duas formas: `ads.txt` **sem** `ca-`; script/meta **com** `ca-`. Normalizar ao renderizar.
- Consent Mode v2 `default: denied` inline no `<head>` **antes** das tags Google; o banner de cookies dá `gtag('consent','update',...)` no clique. Script do AdSense é `<script>` real no `<head>` (não next/script afterInteractive, que só põe preload).
- Não bloquear `Mediapartners-Google`/`AdsBot-Google` no robots. Anúncio desligado em 404/erro/admin.
- Anderson insere ads.txt e o código depois. Não criar nem cobrar.
