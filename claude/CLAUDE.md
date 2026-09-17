# Regras Globais - Todos os Projetos

## Quem sou eu

Sou desenvolvedor web focado em sites profissionais (medicos, clinicas, empresas). Trabalho com HTML estatico e Next.js + Payload CMS. Todos os sites seguem o mesmo padrao de estrutura, SEO e design. Os projetos ficam em `d:\SITES\` e `d:\GitHub\`.

## Idioma e Acentuacao

- Todo conteudo voltado ao usuario DEVE estar em **portugues brasileiro** (pt-BR)
- Usar acentuacao correta SEMPRE: nao escrever "Goiania" quando o correto e "Goiania" com acento → **Goiânia**
- `lang="pt-BR"` em todo HTML
- Nomes proprios com acentos corretos (medico, clinica, especialidade)
- Meta descriptions, titles, alt texts — tudo em portugues com acentos
- **JAMAIS usar travessao (—) em conteudo de site**: artigos, titulos, metas, FAQ. Substituir por virgula, dois-pontos ou reescrever. Travessao denuncia texto de IA.
- **JAMAIS inserir texto dentro de imagens geradas por IA** (sai ilegivel). Palavras-chave vao no nome do arquivo e no alt text, nunca na imagem.

## Linkagem Cruzada (Cross-linking)

O objetivo da linkagem interna e **passar autoridade entre paginas via texto ancora**. Quanto mais forte a malha de links internos, melhor o posicionamento no Google.

### Regras fundamentais:
- Todo link interno DEVE ser feito com **texto ancora descritivo** contendo a keyword da pagina de destino
- NUNCA usar texto generico como ancora ("clique aqui", "saiba mais", "inicio", "home", "veja mais")
- Footer DEVE conter links para todas as paginas principais + politica de privacidade
- Paginas de servico devem ter secao "Veja tambem" ou "Servicos relacionados" com links internos
- Breadcrumbs em JSON-LD em todas as paginas internas

### Quantidade de links por pagina:
- **Minimo**: 1 link interno para outra pagina (toda pagina DEVE linkar para pelo menos 1 outra)
- **Maximo recomendado**: 10 links internos por pagina (no conteudo, sem contar header/footer)
- **Toda pagina DEVE receber** pelo menos 1 link de outra pagina (nenhuma pagina pode ficar orfã)

### Regra de unicidade (IMPORTANTE):
- Cada link para um destino aparece **UMA UNICA VEZ** por pagina
- Se a pagina A ja linka para a home, NAO inserir segundo link para a home na mesma pagina
- O Google desconsidera links repetidos para o mesmo destino — so o primeiro conta
- Distribuir os links ao longo do conteudo de forma natural, nao acumular todos no final

### Texto Ancora com Keyword (REGRA CRITICA DE SEO)

O texto ancora de links internos DEVE usar a **palavra-chave principal da pagina de destino**, mas com **variacoes naturais** para evitar over-optimization (spam aos olhos do Google).

**Como funciona:**
1. Identificar a keyword principal da pagina de destino
2. Criar variacoes naturais dessa keyword
3. NUNCA repetir o mesmo texto ancora mais de 2 vezes no site inteiro
4. Distribuir as variacoes entre as paginas que linkam para o destino

**Exemplo — site IPTV (home com keyword "teste IPTV"):**
- Pagina A linka para home: `<a href="/">teste IPTV grátis</a>`
- Pagina B linka para home: `<a href="/">teste IPTV gratuito</a>`
- Pagina C linka para home: `<a href="/">teste de IPTV rápido</a>`
- Pagina D linka para home: `<a href="/">teste IPTV de qualidade</a>`
- Pagina E linka para home: `<a href="/">testar IPTV</a>`

**Exemplo — site medico (home com keyword "ortopedista em Goiânia"):**
- Pagina A linka para home: `<a href="/">ortopedista em Goiânia</a>`
- Pagina B linka para home: `<a href="/">ortopedista especialista em Goiânia</a>`
- Pagina C linka para home: `<a href="/">médico ortopedista Goiânia</a>`
- Pagina D linka para home: `<a href="/">consulta com ortopedista em Goiânia</a>`
- Pagina E linka para home: `<a href="/">especialista em ortopedia Goiânia</a>`

**Regra geral para gerar variacoes:**
- Adicionar adjetivos: grátis, gratuito, rápido, fácil, confiável, especialista, melhor
- Reformular: trocar ordem, usar sinonimos, adicionar localidade
- Manter a keyword raiz reconhecivel (ex: "IPTV" ou "ortopedista" sempre presente)
- Soar natural — se nao ficaria bem num texto falado, nao usar como ancora

**A mesma regra se aplica a TODAS as paginas, nao so a home.** Cada pagina tem sua keyword principal e os links que apontam para ela devem variar o texto ancora.

## SEO - Padrao Obrigatorio

### Title Tag (CRITICO):
- Keyword principal no **inicio** do title
- Maximo **60 caracteres** (o que passar e cortado no Google)
- Formato: `Keyword Principal - Complemento | Marca`
- Exemplos:
  - `Rinoplastia em Goiânia - Dra. Ana Paula | Cirurgia de Nariz`
  - `Teste IPTV Grátis - 6 Horas com 5000+ Canais | SkiPark`
- Cada pagina DEVE ter title **unico** (nunca repetir entre paginas)

### Meta Tags (toda pagina):
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="..."> <!-- 150-160 caracteres, com keyword e CTA -->
<meta name="keywords" content="...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://DOMINIO/PAGINA">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="...">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

### Canonical e Duplicatas:
- Toda pagina DEVE ter `<link rel="canonical">` apontando para a URL limpa (sem parametros)
- URLs com parametros (?ref=, ?utm=, ?page=) devem apontar canonical para a URL base
- Se o site responde com e sem www, canonical DEVE apontar para a versao principal
- Paginas de paginacao (/page/2, /page/3) → canonical para a pagina 1 OU usar rel="next/prev"

### URL Slug:
- Keyword principal presente no slug
- Curto e descritivo (3-5 palavras no maximo)
- Sem stop words desnecessarias (de, do, da, para, com — remover quando possivel)
- Somente minusculas, hifens como separador
- Exemplos:
  - BOM: `/rinoplastia-goiania`, `/teste-iptv-gratis`, `/ortopedista-joelho-goiania`
  - RUIM: `/pagina-sobre-cirurgia-de-rinoplastia-estetica-na-cidade-de-goiania`

### Hierarquia de Headings:
- **H1**: unico por pagina, com keyword principal, diferente do title tag
- **H2**: secoes principais da pagina, com keywords secundarias/relacionadas
- **H3**: subsecoes dentro de H2
- NUNCA pular nivel (ex: H1 → H3 sem H2)
- NUNCA usar heading so por estilo visual — usar CSS para isso
- Keyword principal DEVE aparecer no H1 e em pelo menos 1 H2
- Exemplo:
  ```html
  <h1>Rinoplastia em Goiânia com Dra. Ana Paula</h1>
    <h2>O que é Rinoplastia Estética?</h2>
    <h2>Tipos de Cirurgia de Nariz</h2>
      <h3>Rinoplastia Funcional</h3>
      <h3>Rinoplastia Secundária</h3>
    <h2>Como é a Recuperação da Rinoplastia?</h2>
    <h2>Perguntas Frequentes sobre Rinoplastia em Goiânia</h2>
  ```

### Featured Snippets (posicao zero no Google):

Estruturar conteudo para conquistar featured snippets sempre que possivel:

**FAQ — usar em todas as paginas de servico e produto:**
```html
<section>
  <h2>Perguntas Frequentes sobre [Keyword]</h2>
  <div itemscope itemtype="https://schema.org/FAQPage">
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <h3 itemprop="name">Quanto custa uma rinoplastia em Goiânia?</h3>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text">O valor da rinoplastia em Goiânia varia entre R$ X e R$ Y...</p>
      </div>
    </div>
  </div>
</section>
```
- Minimo 3, maximo 8 perguntas por pagina
- Perguntas DEVEM ser as que o publico realmente pesquisa
- Respostas objetivas no primeiro paragrafo (40-60 palavras), detalhe depois
- TAMBEM adicionar FAQPage no JSON-LD da pagina

**Listas e tabelas comparativas — usar em diretorios e rankings:**
- Listas ordenadas (`<ol>`) para rankings e "melhores X"
- Tabelas (`<table>`) para comparacoes entre itens (preco, recursos, nota)
- Sempre ter um `<h2>` descritivo logo antes: "Melhores Plataformas de IPTV em 2026"

### Topic Clusters (para sites com blog/artigos):

Organizar conteudo em clusters tematicos:

**Estrutura:**
```
Pillar Page (pagina pilar, 2000+ palavras):
  "Guia Completo: Teste IPTV"
  ├── Cluster: "Como Fazer Teste IPTV no Samsung"
  ├── Cluster: "Teste IPTV Grátis por 24 Horas"
  ├── Cluster: "Melhor IPTV 2026"
  ├── Cluster: "IPTV é Legal no Brasil?"
  └── Cluster: "Como Instalar IPTV na Smart TV"
```

**Regras:**
- Pagina pilar: conteudo amplo e completo, linka para TODOS os clusters
- Clusters: conteudo especifico e profundo, SEMPRE linka de volta para a pilar
- Clusters linkam entre si quando faz sentido
- Usar variacoes de ancora (regra de linkagem cruzada) em todos os links

### Schema JSON-LD:
- Homepage: MedicalBusiness ou LocalBusiness (com telefone, endereco, horario)
- Paginas de servico: MedicalProcedure ou Service
- Sobre: Person ou Physician (com CRM, RQE, formacao)
- FAQ: FAQPage
- Breadcrumbs: BreadcrumbList em todas as internas

### Schema JSON-LD para Sites de Diretorio

Quando o site for um **diretorio** (lista de plataformas, empresas, profissionais ou negocios), aplicar OBRIGATORIAMENTE:

**1. Pagina de listagem (colecao) → CollectionPage + ItemList:**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Melhores Plataformas de Teste IPTV 2026",
  "description": "Diretório completo com as melhores plataformas de teste IPTV...",
  "url": "https://dominio.com/plataformas",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Nome da Plataforma",
        "url": "https://dominio.com/plataformas/nome-da-plataforma"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Outra Plataforma",
        "url": "https://dominio.com/plataformas/outra-plataforma"
      }
    ]
  }
}
```

**2. Pagina individual de cada item do diretorio → tipo adequado ao nicho:**

| Nicho do diretorio | @type da pagina individual |
|---------------------|---------------------------|
| Plataformas/apps | SoftwareApplication |
| Empresas/negocios | LocalBusiness ou Organization |
| Medicos/profissionais | Physician ou Person (com jobTitle) |
| Clinicas/hospitais | MedicalBusiness ou MedicalClinic |
| Restaurantes | Restaurant |
| Servicos gerais | Service ou ProfessionalService |

**Exemplo — pagina individual de plataforma IPTV:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SkiPark IPTV",
  "description": "Plataforma de teste IPTV com mais de 5000 canais...",
  "url": "https://dominio.com/plataformas/skipark-iptv",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Android, iOS, Smart TV, Windows",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "350"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL",
    "description": "Teste grátis por 6 horas"
  }
}
```

**Regras para diretorios:**
- SEMPRE criar pagina individual para cada item listado no diretorio
- A pagina de listagem DEVE usar CollectionPage com ItemList linkando para cada pagina individual
- Cada pagina individual DEVE ter schema com o @type adequado ao nicho (ver tabela acima)
- Cada pagina individual DEVE linkar de volta para a pagina de listagem (com variacao de ancora)
- Cada pagina individual DEVE ter SEO completo (meta tags, OG, canonical, breadcrumb proprio)

### Sitemap e robots:
- sitemap.xml com todas as paginas, imagens com titulo/caption
- robots.txt apontando para sitemap
- Prioridades: home (1.0), servicos principais (0.8-0.9), sobre (0.8), contato (0.7), politica (0.3)

## Imagens

- Formato **WebP** obrigatorio
- Nomes descritivos com slug SEO: `rinoplastia-estetica-goiania.webp`
- ALT text descritivo em portugues com acentos
- Hero image: `fetchpriority="high"` + preload
- Demais imagens: `loading="lazy"`
- Usar `<picture>` com srcset para responsividade quando possivel

### Imagens: banco de fotos grátis PRIMEIRO, IA só com ordem expressa

**Ordem do Anderson em 10/09/2026, e vale para todos os projetos:** a imagem de
um artigo, guest post ou pagina vem de **banco de fotos gratis por API**, e
**nao** de geracao por inteligencia artificial. Foto real rende melhor no
Google, nao deixa a marca de "ilustracao sintetica" e nao custa credito.

| fonte | licenca | onde esta a chave |
|---|---|---|
| **Pixabay** | propria, sem credito; a API **proibe hotlink** e exige baixar | `C:/Users/User/Documents/APIs/pixabay.txt` |
| **Pexels** | propria, sem credito | `C:/Users/User/Documents/APIs/pexels.txt` |
| **Wikimedia Commons** | so **CC0 e dominio publico** (CC BY exige credito e sai) | sem chave |

O modulo pronto e `~/.claude/skills/guest-post-rede/scripts/banco_img.py`
(`buscar` e `pegar`): junta as tres fontes, sorteia a ordem por portal, baixa,
recorta em WebP e devolve a ficha. Serve para qualquer projeto, nao so guest post.

**Regras:**

- 🔴 **O termo de busca e em INGLES nas tres fontes.** O resultado e melhor em
  ingles em todas. Portugues fica so no alt, escrito olhando a foto.
- 🔴 **Nada de bloco de credito, legenda de fonte ou `caption` citando a fonte.**
  As tres fontes dispensam credito. Bloco de credito identico em varios portais
  ja entregou a rede inteira numa busca do Google (lote da grafotecnia,
  09/09/2026).
- **Pexels responde `403 error code: 1010`** ao User-Agent do Python: e a
  Cloudflare, nao a chave (chave errada da `401`). Mandar User-Agent de navegador.
- **Pixabay aceita upload gerado por IA** e nao filtra na API; o modulo filtra
  pela tag. **Olhar a foto antes de publicar**, sempre.
- Se as tres fontes nao devolverem nada apto, **trocar o termo, nao a fonte**.
- Geracao por IA (Runware, abaixo) so quando o Anderson pedir naquele caso, ou
  quando ele ja tiver dito que aquele projeto usa imagem gerada.

### Geracao de Imagens com IA (Runware API): SO COM ORDEM EXPRESSA

Quando eu pedir para gerar/criar imagens, usar a API da Runware. A chave e
`<<REMOVIDO>>` e ela da acesso a plataforma inteira, que
revende BFL, Google, OpenAI e ByteDance. Nao existe "comprar outra IA": e so
trocar o `model`.

#### 🔴 O padrao e o modelo BARATO. Nano Banana Pro so com autorizacao

**Ordem do Anderson em 01/09/2026, que revoga a anterior:** o Nano Banana Pro
(`google:4@2`, US$ 0,138 por imagem) **nao se usa por iniciativa propria**. O
padrao e o modelo barato; o premium exige ele autorizar, caso a caso.

| situacao | modelo | custo |
|---|---|---|
| **padrao, sem perguntar** | `runware:100@1` (FLUX schnell) | US$ 0,0006 |
| **so com autorizacao dele** | `google:4@2` (Nano Banana Pro) | US$ 0,138 |

Pedir a autorizacao **antes** de gerar, dizendo quantas imagens e quanto custa.
Nao gerar no premium e avisar depois: a conta ja foi feita.

O que continua valendo do que se aprendeu antes, e que agora vira instrucao de
**prompt**, nao de modelo: o barato erra anatomia, de pessoa e de objeto
tecnico. Num teste de remada australiana ele gerou um homem flutuando de
barriga para baixo embaixo da mesa; no video 08 do Radar Volt entregou
cilindros azuis parecendo botijao de gas no lugar de celulas de bateria. Entao
com o modelo barato:

- **evitar cena que dependa de anatomia dificil** (pessoa executando movimento,
  peca tecnica reconhecivel). Preferir objeto simples, lugar, textura, cena
  ampla, foto de ambiente sem gente;
- quando a cena exigir pessoa em movimento ou peca tecnica exata, **e esse o
  caso de pedir autorizacao** para o premium, explicando por que;
- **olhar a imagem antes de publicar**, sempre, em qualquer modelo.

**Duas armadilhas do modelo premium**, as duas silenciosas:

- Ele **nao aceita `steps`**. Mandar o parametro devolve
  `unsupportedArchitectureSteps` em JSON com HTTP 200, e quem so olha o codigo
  de saida acha que funcionou.
- A resposta em **base64 chega truncada** em imagem grande, e o `json.loads`
  estoura com "Unterminated string", o que parece erro de rede e e so tamanho.
  Acima de ~2,5 megapixels, pedir `outputType: "URL"` e baixar depois.

#### Chamada

```bash
curl -s -X POST "https://api.runware.ai/v1"   -H "Content-Type: application/json"   -H "Authorization: Bearer <<REMOVIDO>>"   -d '[{
    "taskType": "imageInference",
    "taskUUID": "'$(uuidgen || python3 -c "import uuid; print(uuid.uuid4())")'",
    "model": "runware:100@1",
    "positivePrompt": "DESCREVER A IMAGEM AQUI, candid documentary photograph, no text",
    "width": 1264,
    "height": 848,
    "numberResults": 1,
    "outputFormat": "WEBP",
    "includeCost": true
  }]'
```

⚠️ O `model` acima e o **barato**, que e o padrao. Para trocar por
`google:4@2` e preciso autorizacao do Anderson, e ai o `steps` sai da chamada.

**Dimensoes: cada familia aceita uma lista propria, e nao qualquer multiplo de 64.**

- FLUX (`runware:*`, `bfl:*`): multiplos de 64. `1216x640` sai pronto.
- Nano Banana Pro e Seedream: lista fechada. Para 19:10 use **`1264x848`** e
  **recorte depois** para o tamanho final. Mandar 1216x640 devolve
  `unsupportedDimensions`. **Para 16:9 use `2752x1536`** (ou `1376x768` em 1K),
  que e o que passa; 2048x1152 nao esta na lista.
  A propria API lista os aceitos dentro da mensagem de erro, entao na duvida
  mande qualquer coisa uma vez e leia a resposta, em vez de chutar.
- Modelo premium **nao aceita `steps`**: mandar o parametro devolve
  `unsupportedArchitectureSteps`. So os FLUX abertos aceitam.

O recorte de 1264x848 para 1216x640 sai com Pillow, cortando na proporcao e
puxando o enquadramento para cima, que e onde a pessoa costuma estar:

```python
from PIL import Image
im = Image.open(bruto).convert("RGB")
l, a = im.size
nova = round(l * 640 / 1216)
topo = max(0, int((a - nova) * 0.40))
im.crop((0, topo, l, topo + nova)).resize((1216, 640), Image.LANCZOS)   .save(saida, "WEBP", quality=82, method=6)
```

**Regras para geracao de imagens:**
- Sempre gerar em **WebP** (`outputFormat: "WEBP"`)
- Dimensoes finais padrao: **1216x640** (OG/hero), **832x576** (conteudo),
  **448x448** (thumbnails)
- Prompt sempre em **ingles**
- **Descrever a posicao do corpo membro a membro** quando houver alguem
  executando um movimento: onde estao os pes, para onde apontam as palmas,
  onde esta o queixo, se o corpo esta em linha. "inverted row" sozinho nao
  basta; "heels on the floor, body in one straight line, both hands gripping
  the edge" resolve. Escrever **BOTH hands** em maiuscula quando as duas maos
  precisam aparecer, senao aparece so uma.
- "candid documentary photograph" rende melhor que "professional, high
  quality", que puxa para o visual de banco de imagens
- Adicionar "no text" para evitar texto ilegivel
- **Conferir a imagem antes de publicar.** Abrir o arquivo e olhar. Erro de
  anatomia e de execucao passa fácil na pressa, e capa errada num site de
  treino e pior que capa feia.
- Habilidade dificil (front lever, muscle up, planche, bandeira humana) ainda
  erra em qualquer modelo. Nesses casos, foto real de banco de imagens ganha.
- Subir no WP: `wp media import ARQUIVO --post_id=ID --featured_image --title=... --alt=...`
- Salvar com nome SEO-friendly: `slug-descritivo.webp`

## Estrutura de Paginas (Sites HTML Estaticos)

```
/
├── index.html
├── sobre.html
├── contato.html
├── [servico-1].html
├── [servico-2].html
├── politica-privacidade.html
├── style.css (ou /css/)
├── /js/
├── /imagens/ (WebP)
├── /fonts/ (WOFF2 local)
├── sitemap.xml
├── robots.txt
├── .htaccess
└── manifest.json
```

## Design e CSS

- **Fontes**: Poppins, Inter ou Montserrat (WOFF2 local ou Google Fonts com preconnect)
- **CSS Variables** para cores do cliente (--primary, --secondary, --bg-light, --text-dark)
- Container max-width: 1200px
- Header fixo no topo (z-index: 1000+)
- Mobile-first: breakpoints em 480px, 768px, 1024px
- `font-display: swap` em toda @font-face
- Animacoes suaves: `transition: all 0.3s ease`

### Layout e Alinhamento (REGRAS OBRIGATORIAS)

**NUNCA fazer sites estilo americano** — conteudo jogado, tudo centralizado, sem organizacao. Os sites devem ser profissionais, organizados e com hierarquia visual clara.

**Hero Section — SEMPRE split (dividida):**
- Desktop: texto na esquerda + imagem/visual na direita (grid 2 colunas ou flex row)
- NUNCA hero full-width com texto centralizado sobre imagem de fundo
- Mobile: empilha verticalmente (texto em cima, imagem embaixo)
- Exemplo desktop:
  ```html
  <section class="hero">
    <div class="hero-container"> <!-- max-width: 1200px, margin: 0 auto -->
      <div class="hero-text">  <!-- flex: 1, text-align: left -->
        <h1>Titulo com Keyword</h1>
        <p>Subtitulo descritivo</p>
        <a href="#" class="cta">Botao CTA</a>
      </div>
      <div class="hero-image"> <!-- flex: 1 -->
        <img src="..." alt="...">
      </div>
    </div>
  </section>
  ```

**Alinhamento de texto:**

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Hero (h1, paragrafo, CTA) | **Esquerda** | **Centralizado** |
| Titulos de secao (h2) | **Centralizado** | **Centralizado** |
| Texto dentro de cards | **Centralizado** | **Centralizado** |
| Paragrafos de conteudo longo | **Esquerda** | **Esquerda** |
| Listas e bullets | **Esquerda** | **Esquerda** |
| FAQ perguntas e respostas | **Esquerda** | **Esquerda** |
| Footer | **Esquerda** (colunas) | **Centralizado** |

**O que NUNCA fazer:**
- Centralizar paragrafos longos (mais de 2 linhas) — SEMPRE esquerda
- Centralizar listas ou bullets
- Hero full-width com texto sobre imagem escura (estilo americano)
- Tudo centralizado no mobile — body text e listas SEMPRE esquerda

**Grids de cards/servicos:**
- Desktop: 3 ou 4 colunas
- Tablet (768px): 2 colunas
- Mobile (480px): 1 coluna
- Cards com border-radius (8-16px), sombra suave, padding generoso

**Secoes alternadas:**
- Alternar fundo branco e fundo claro (--bg-light) entre secoes
- Manter padding vertical generoso (60-80px desktop, 40-50px mobile)
- Secoes com conteudo split (texto + imagem) devem alternar lado: esquerda/direita, direita/esquerda

### Tabelas Responsivas (REGRA OBRIGATORIA)

Vale para HTML estatico, Next.js e WordPress com tema proprio. **Nunca deixar tabela
com rolagem horizontal no mobile.** O usuario nao descobre que da para arrastar, mesmo
com degrade na borda e aviso na legenda. Se precisa avisar, o padrao ja falhou.

**Padrao correto: abaixo de 640px, cada linha vira um card**, com o rotulo da coluna
acima do valor. Nada sai da tela e nao existe gesto a descobrir.

```html
<!-- cada <td> carrega o nome da coluna -->
<td data-rotulo="Sessoes">3 mensais</td>
```

```css
@media(max-width:640px){
  .tabwrap{overflow:visible;border:0;background:transparent}
  .tab{min-width:0}
  .tab caption{display:none}
  /* thead sai da tela mas continua no DOM, acessivel */
  .tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .tab,.tab tbody,.tab tr,.tab th,.tab td{display:block;width:auto}
  .tab tbody tr{background:#fff;border:1px solid rgba(0,0,0,.09);border-radius:14px;
                padding:2px 20px 18px;margin-bottom:14px}
  /* PASSO QUE MAIS ESQUECEM: zerar borda e fundo herdados do tema */
  .tab tbody th,.tab tbody td{border:0;background:transparent}
  .tab tbody th{border-bottom:1px solid rgba(0,0,0,.10);padding:15px 0 13px;font-size:16px}
  .tab tbody td{padding:15px 0 0;display:block;text-align:left;line-height:1.55}
  .tab tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
                        font-size:12px;letter-spacing:.05em;text-transform:uppercase}
}
```

**Acessibilidade, obrigatoria:** `display:block` **apaga a semantica de tabela** para
leitor de tela. Devolver com papeis explicitos, senao a tabela vira uma lista solta:

```html
<table role="table">
  <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">...
  <tbody role="rowgroup"><tr role="row"><th scope="row" role="rowheader">...
  <td role="cell" data-rotulo="...">...
```

**Tres armadilhas que ja custaram retrabalho:**

1. **Bordas e fundo do tema.** Tema (SmartMag, Astra, GeneratePress) desenha borda de
   1px nos **quatro lados** de `th` e `td`, e fundo cinza no `th`. Zerar so a de baixo
   deixa risco vertical cortando o card. Zerar `border` e `background` por completo,
   depois reconstruir so o separador desejado. **No desktop tambem**, para ficar so a
   linha horizontal.
2. **Editar CSS por substituicao de texto.** O mesmo seletor existe dentro e fora da
   media query. Cortar o conteudo na media query primeiro e operar so na metade certa,
   senao o desktop herda `padding:15px 0` e o texto cola na borda.
3. **Valor longo alinhado a direita** fica esfarrapado. Rotulo em cima, valor embaixo,
   sempre a esquerda.

**Legenda da tabela:** `<caption>` descreve o conteudo ("Comparativo dos tratamentos
por numero de sessoes"). Nunca usar a legenda como instrucao de gesto.

**Acima de 640px nada muda:** conferir que segue `display:table`, cabecalho visivel e
`::before` desligado.

## WhatsApp CTA

- Usar API oficial: `https://api.whatsapp.com/send/?phone=55XXXXXXXXXXX&text=...`
- Botao flutuante no canto inferior direito
- Texto pre-preenchido contextual por pagina
- Telefone no formato internacional sem espacos

## Performance e Core Web Vitals

**Metas obrigatorias (Google PageSpeed):**
- **LCP** (Largest Contentful Paint): < 2.5 segundos
- **CLS** (Cumulative Layout Shift): < 0.1
- **FID/INP** (Interatividade): < 200ms

**Como garantir:**
- CSS e JS minificados em producao
- Fonts preloaded: `<link rel="preload" as="font" type="font/woff2" crossorigin>`
- Hero image preloaded com fetchpriority="high"
- Analytics (GA4) carregado lazy apos interacao do usuario (scroll/click/touch)
- Sem render-blocking resources
- SEMPRE definir `width` e `height` em `<img>` para evitar layout shift (CLS)
- JS nao-critico com `defer` ou `async`
- CSS critico inline no `<head>`, CSS secundario carregado async
- Fontes externas com `<link rel="preconnect">` antes do CSS

## Stack Next.js + Payload (quando aplicavel)

- Next.js 15+ com App Router
- Payload CMS 3+
- TypeScript
- Tailwind CSS v4
- PostgreSQL (Neon)
- Vercel Blob para media
- PM2 para processo em VPS
- Nginx como proxy reverso com SSL Let's Encrypt

## Hospedagem e Deploy

**REGRA: Ao iniciar qualquer projeto novo, PERGUNTAR:**
> "Esse site será hospedado no Cloudflare Pages ou em VPS? Se VPS, qual?"

### Opcao 1: Cloudflare Pages (sites estaticos e Next.js)

- Criar repositorio Git (GitHub) — Cloudflare faz deploy automatico a cada push
- **Pasta de deploy (build output):**
  - HTML estatico: `/` (raiz do projeto, ou pasta especifica se houver)
  - Next.js: usar `@cloudflare/next-on-pages` como adapter
- **Configuracao obrigatoria no projeto:**
  - Arquivo `_headers` na raiz do build para cache e seguranca:
    ```
    /*
      X-Content-Type-Options: nosniff
      X-Frame-Options: DENY
      Referrer-Policy: strict-origin-when-cross-origin
    ```
  - Arquivo `_redirects` se precisar de redirecionamentos (formato Cloudflare)
  - `404.html` customizado (Cloudflare serve automaticamente)
- **Dominio**: configurar DNS no Cloudflare (proxied, orange cloud)
- **SSL**: automatico pelo Cloudflare (Full Strict)
- **Cache**: Cloudflare CDN global — imagens e assets cacheados automaticamente
- **Limites**: sem server-side runtime (exceto Workers/Functions), ideal para sites estaticos

### Opcao 2: VPS (Next.js + Payload, apps com backend)

- **VPS principal**: opengravity (acesso via `ssh opengravity`)
- **Diretorio deploy**: `/var/www/[nome-do-site]`
- **SSL**: Let's Encrypt com auto-renovacao (certbot)
- **Se for outra VPS**: perguntar IP, usuario SSH e porta para configurar

### Deploy Next.js na VPS — REGRA OBRIGATORIA DE ZERO DOWNTIME

**NUNCA tirar o site do ar durante deploy.** Isso ja causou perda de vendas e queda de posicoes no Google.

**A segunda instancia e EFEMERA, nao permanente.** Ela sobe no inicio do deploy,
segura o trafego enquanto a principal recarrega, e e desligada no fim. Fora do
deploy roda um processo so por site.

Por que mudou: manter a instancia B ligada 24h cobrava RAM o ano inteiro para
servir a um evento de poucos minutos. Medido em 31/08/2026: 1,84 GB no
opengravity (6 pares) e 2,28 GB na clinicas-vps (13 pares), as duas maquinas
com menos de 300 MB livres. Depois da mudanca, a memoria disponivel foi de
1,9 para 3,5 GB e de 1,9 para 4,0 GB.

Ganho de seguranca junto: o B sobe do zero e passa por health check ANTES de a
principal ser tocada, entao build quebrado aparece antes de mexer no que esta
no ar.

**Arquitetura obrigatoria para todo projeto Next.js na VPS:**

1. **NAO usar `output: 'standalone'`** — usar `next start` direto
2. **Duas entradas PM2** no ecosystem, portas diferentes (ex: 3005 e 3006) — mas
   so a principal fica rodando fora do deploy
3. **Nginx upstream** com as duas portas e **`max_fails=0`**
4. **deploy.sh** que sobe o B, recarrega o A e derruba o B no fim

**`max_fails=0` e obrigatorio, e o motivo nao e obvio:**

Com `max_fails=2 fail_timeout=10s`, reiniciar a porta A fazia o nginx marca-la
morta por 10s. O deploy conferia que ela voltou testando a porta direto, mas o
nginx ainda cumpria a penalidade, e ja reiniciava a B. Sem nenhum backend
elegivel, o nginx respondia "no live upstreams" e 502. Medido em 31/07/2026:
26 falhas em 377 requisicoes durante um deploy.

Com so DOIS backends, ejetar um cria o problema que a ejecao deveria evitar.
Sem ejecao, o nginx tenta uma porta e, no "connection refused" do loopback, cai
na outra na hora. Por isso a porta B pode ficar fechada entre deploys sem
penalidade perceptivel: o `proxy_next_upstream` padrao (`error timeout`) ja
cobre isso, e ate POST e repassado, porque o nginx so se recusa a repetir
metodo nao idempotente que JA foi enviado — e conexao recusada significa que
nao foi.

**Estrutura PM2 (ecosystem.config.cjs) — as duas entradas continuam existindo:**
```javascript
const base = {
  script: "./node_modules/next/dist/bin/next",
  cwd: "/var/www/projeto",
  instances: 1,
  exec_mode: "fork",
  kill_timeout: 10000,
  autorestart: true,
  max_memory_restart: "700M",
  env: { NODE_ENV: "production" },
}

module.exports = {
  apps: [
    { ...base, name: "projeto",   args: "start -p PORTA_A" },
    // Efemera: quem sobe e derruba e o deploy.sh. Nao deixar ligada.
    { ...base, name: "projeto-b", args: "start -p PORTA_B" },
  ],
}
```

**Nginx (upstream sem ejecao):**
```nginx
upstream projeto_backend {
    # max_fails=0 desliga a ejecao de backend, de proposito (ver acima).
    server 127.0.0.1:PORTA_A max_fails=0;
    server 127.0.0.1:PORTA_B max_fails=0;
    keepalive 32;
    # OBRIGATORIO junto com keepalive: menor que os 5s do keepAliveTimeout do
    # Node, para o nginx fechar a conexao ociosa antes dele (ver abaixo).
    keepalive_timeout 3s;
}

location / {
    proxy_pass http://projeto_backend;
    proxy_connect_timeout 5s;
}
```

**`keepalive_timeout 3s` e obrigatorio, e o motivo se liga ao `-b` efemero:**

Sem ele, o nginx reaproveita uma conexao ociosa que o Node ja fechou (o Node
fecha em 5s) e leva `Connection reset by peer`. Ai tenta o outro servidor do
upstream, que e a porta `-b`, desligada fora de deploy: `no live upstreams`,
502 para o visitante. Fora do deploy cada requisicao tem UMA chance, entao todo
reset vira 502. Medido em 13/09/2026 na opengravity: 64 502 num dia, em 8
sites, todos com essa assinatura. Aparecia nos smoke tests como "rota X:
HTTP 502" em rotas aleatorias. Com o nginx fechando em 3s, antes do Node, o
reset nao acontece. Aplicado nos 12 upstreams da opengravity e nos 13 da
clinicas-vps em 13/09/2026.

**Fluxo de deploy: rodar o `./deploy.sh` do diretorio do app.** Ele builda, sobe
o B, espera a porta responder, recarrega o A, confirma o site pelo dominio e so
entao derruba o B (por `trap EXIT`, entao o B tambem cai se o script morrer no
meio). Se o site nao voltar 200, ele deixa o B de pe e sai com erro, para nao
ficar sem ninguem atendendo.

O health check do deploy vai pelo dominio com cache-buster `?nc=`, nao pela
origem: o middleware desses apps recusa (403) requisicao que nao venha do
Cloudflare, entao `--resolve` na origem daria falso negativo; e sem o `?nc=` um
HIT da borda devolveria 200 mesmo com o backend quebrado.

**NUNCA fazer:**
- Deixar a instancia `-b` ligada fora do deploy
- `pm2 restart` (nao tem graceful shutdown) ou `pm2 restart all` / `pm2 kill`
- `pm2 update` num servidor com muitos apps: reinicia o daemon e derruba todos
- `output: 'standalone'` no next.config (causa indisponibilidade durante build)
- Criar a entrada `-b` no ecosystem sem testar que ela sobe: um ecosystem errado
  so aparece no meio de um deploy, com a principal ja parada

**SEMPRE fazer:**
- `pm2 reload` (zero downtime, graceful) na instancia principal
- `pm2 save` apos qualquer mudanca na configuracao
- Conferir que o ecosystem realmente sobe o `-b` antes de confiar nele

## Google Analytics (GA4)

- SEMPRE implementar GA4 com **lazy-load** (nunca carregar no page load)
- Carregar somente apos primeira interacao do usuario (scroll, click, touch, keydown)
- Isso evita impacto nos Core Web Vitals

**Sites HTML estaticos:**
```html
<script>
(function(){
  var loaded = false;
  function loadGA(){
    if(loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    s.async = true;
    document.head.appendChild(s);
    s.onload = function(){
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    };
  }
  ['scroll','click','touchstart','keydown'].forEach(function(e){
    window.addEventListener(e, loadGA, {once:true, passive:true});
  });
})();
</script>
```

**Next.js:**
```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
```

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

## LGPD / Cookie Consent

Todo site DEVE ter banner de consentimento de cookies (LGPD):

- Banner fixo no bottom da pagina, aparece na primeira visita
- Opcoes: "Aceitar todos" e "Apenas necessarios"
- Categorias visuais: Necessarios (sempre ativos), Analiticos (GA4), Terceiros (WhatsApp, Maps, YouTube)
- Salvar preferencia em cookie `cookie_consent` com validade de 1 ano (`max-age=31536000; SameSite=Lax`)
- Link para a pagina de politica de privacidade dentro do banner
- GA4 e scripts de terceiros so carregam SE o usuario aceitar
- Banner desaparece com animacao suave apos escolha
- NAO exibir novamente se o cookie ja existe

## Pagina 404 Customizada

Todo site DEVE ter uma pagina 404 personalizada:

- Design consistente com o resto do site (header, footer, cores)
- Titulo grande "404" com destaque visual (gradient text ou cor primaria)
- Mensagem amigavel: "Página não encontrada"
- Botoes de navegacao: link para Home e para paginas principais
- Meta tag `<meta name="robots" content="noindex, follow">` (nao indexar 404, mas seguir links)
- **HTML estatico**: configurar no `.htaccess` → `ErrorDocument 404 /404.html`
- **Cloudflare Pages**: criar `404.html` na raiz (servido automaticamente)
- **Next.js**: criar `src/app/not-found.tsx`

## Politica de Privacidade e Termos

Todo site DEVE ter no minimo:

- `politica-de-privacidade.html` (ou `/politica-de-privacidade` em Next.js)
- `termos-de-uso.html` (ou `/termos-de-uso`)
- Se tiver cookie consent: tambem `politica-de-cookies.html`
- Links para essas paginas SEMPRE no footer
- Meta robots: `index, follow` (Google valoriza transparencia)
- Conteudo adaptado ao nicho (mencionar LGPD, dados coletados, cookies utilizados)
- Sitemap: incluir com priority 0.3

## .htaccess (Sites HTML Estaticos)

Todo site HTML estatico DEVE ter `.htaccess` com:

```apache
# Pagina 404 customizada
ErrorDocument 404 /404.html

# Remover extensao .html das URLs (URLs limpas)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Redirecionar .html para URL limpa (301)
RewriteCond %{THE_REQUEST} /([^.]+)\.html [NC]
RewriteRule ^ /%1 [R=301,L]

# Forcar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache de assets estaticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compressao GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
```

- Adicionar redirects 301 especificos quando houver migracoes de URL

## Animacoes On-Scroll

Secoes do site DEVEM ter animacao de entrada ao entrar no viewport:

- Usar **IntersectionObserver** (nao scroll events)
- Animacao padrao: fade-in + slide-up (`opacity: 0 → 1`, `translateY(20px → 0)`)
- Duracao: 0.5s com `ease`
- **Respeitar `prefers-reduced-motion`**: desativar animacoes se o usuario preferir
- Aplicar em: cards, secoes de conteudo, contadores, FAQ items
- NAO aplicar em: header, footer, hero (hero deve ser visivel imediatamente)

```javascript
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}
```

## Acessibilidade (a11y)

Regras minimas de acessibilidade em todo projeto:

- `aria-label` em todos os botoes e links que nao tem texto visivel (icones, hamburger menu)
- `aria-expanded="true/false"` em menus collapsiveis e accordions
- `aria-controls` em botoes que controlam paineis
- `alt` descritivo em todas as imagens (ja coberto na secao de Imagens)
- Botoes e links com area minima de toque: **48x48px** no mobile
- Contraste de cores: ratio minimo **4.5:1** para texto normal, **3:1** para texto grande
- Focus visible em todos os elementos interativos (nao remover outline sem substituto)
- Formularios: `<label>` associado a cada `<input>` via `for/id`

## manifest.json (PWA Basico)

Todo site DEVE ter `manifest.json` na raiz:

```json
{
  "name": "Nome do Site",
  "short_name": "Nome Curto",
  "description": "Descricao breve do site",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#COR_PRIMARIA",
  "icons": [
    { "src": "/imagens/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/imagens/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- Linkar no `<head>`: `<link rel="manifest" href="/manifest.json">`
- `theme_color` DEVE ser a cor primaria do site (--primary)
- Incluir icones em 192x192 e 512x512
- `display: "standalone"` para experiencia de app

## Copiar Estrutura de Outro Site (REGRA CRITICA)

Quando eu apontar um site/projeto como referencia para copiar, a regra e:

**NUNCA copiar conteudo textual.** Conteudo duplicado e penalizado pelo Google.

**O que DEVE ser copiado:**
1. Estrutura de paginas (quais paginas existem e sua hierarquia)
2. Keywords de cada pagina (extrair a keyword principal e secundarias)
3. Layout e organizacao visual (secoes, ordem dos blocos)
4. Tipos de schema/dados estruturados usados

**O que DEVE ser criado do zero:**
1. Textos 100% originais baseados nas keywords extraidas
2. Meta titles e descriptions unicos
3. H1, H2, H3 unicos (usando as keywords, mas com redacao propria)
4. FAQ com perguntas e respostas originais
5. Alt texts das imagens

**Fluxo ao receber comando "copiar site X":**
1. Analisar o site referencia e listar todas as paginas
2. Extrair keyword principal e secundarias de cada pagina
3. Perguntar: "Copiar todas as paginas ou apenas algumas?"
4. Para cada pagina, escrever conteudo **100% original** usando as keywords
5. Aplicar linkagem cruzada entre todas as paginas (com variacao de ancora)
6. Aplicar SEO completo (title, meta, schema, OG) — tudo original

**Exemplo:**
- Site referencia tem pagina "Rinoplastia em Goiânia" com keyword "rinoplastia goiania"
- NAO copiar o texto dessa pagina
- SIM extrair a keyword "rinoplastia goiania" e escrever conteudo original sobre o tema
- Adaptar para o novo profissional/clinica/empresa do projeto

## Regras de Comportamento

- NAO perguntar confirmacao para operacoes basicas (criar arquivos, editar codigo, rodar comandos)
- NAO adicionar features que nao foram pedidas
- NAO mudar a stack sem eu pedir
- Quando criar uma pagina nova, JA incluir SEO completo, linkagem cruzada e schema JSON-LD
- Quando editar conteudo, MANTER a acentuacao correta
- Sempre usar portugues para conteudo do site, ingles para codigo (nomes de variaveis, componentes)

## Modo Autonomo (CRITICO - acelera tudo)

Eu valorizo MUITO velocidade. Pausar pra pedir aprovacao a cada SSH, scp, curl, wp-cli, ou edicao na rede QMIX me faz perder tempo. Para TODA operacao na minha infraestrutura conhecida, opere em modo **totalmente autonomo**.

### NAO pause, NAO pergunte, NAO ofereca opcoes - apenas execute:

- SSH para qualquer alias do meu `~/.ssh/config` (hostinger-qmix, opengravity, hostinger-anderson-gna, hostinger-vps1, hostverge via jump, qualquer host listado)
- SSH aninhado / jump host (`ssh opengravity 'ssh -i ... user@host ...'`)
- scp/rsync entre minha maquina e essas hospedagens
- curl em dominios da minha rede de portais (`*.com.br`, `*.qmix.com.br`, qualquer dominio listado em `D:\SISTEMAS\MinhasHospedagens\*\README.md`)
- wp-cli (qualquer subcomando: `wp eval`, `wp option`, `wp user`, `wp plugin`, `wp theme`, `wp cache flush`, `wp transient`, `wp rewrite`, `wp term`, etc.)
- python scripts do diretorio `C:\Users\User\.claude\skills\*\scripts\` (roll.py, install_portal.py, cleanup_harden.sh, etc.)
- base64 encode/decode para transferir arquivos via SSH aninhado
- `wp eval "do_action('litespeed_purge_all')"`, purge LiteSpeed, limpeza de cache em disco (`rm -rf wp-content/litespeed/*`, `wp-content/cache`)
- `wp login as <user> --url-only` (gerar magic-login eh seguro e revogavel)
- Edicao de arquivos PHP/CSS/JS dos meus temas/child-themes (backup `.bak-DATA` apenas em mudancas grandes)
- Reload de PM2, restart de Nginx, certbot renew na opengravity
- DELETE/INSERT/UPDATE em `wp_options`, `wp_postmeta` para configs (sem mexer em `wp_posts` em massa)
- Plugins activate/deactivate/install/delete (skill regra 16 ja sabe whitelist/blacklist)

### Continuam pedindo confirmacao:

- DELETE em `wp_posts` em massa (mais de 10 posts)
- DROP/TRUNCATE de tabelas
- Mudanca de senha de admin (geracao de magic-login NAO conta - eh autonomo)
- Mudanca de DNS, ownership do dominio, painel da hospedagem
- Compras, faturamento, billing, upgrade de plano
- `git push --force` em main/master
- Operacoes fora da rede QMIX que afetam terceiros

### Erros que NAO sao motivo pra pausar (ignorar e seguir):

- Warning `connection is not using a post-quantum key exchange algorithm` (apenas warning SSH, sempre)
- 502/503 transitorio do Cloudflare durante purge agressivo (faz outro passo e refaz curl, NAO me chama)
- `Could not list REST routes` no install_portal.py (apenas wp-cli versao antiga, deploy nao foi afetado)
- `No plugin auto-updates enabled` em portais ja configurados (idempotente)
- Output do PowerShell em background que nao saiu ainda (matar com TaskStop e refazer via Bash + ssh alias)

### Comportamento esperado ao terminar um deploy/redesign:

- Purgar caches automaticamente (WP + LiteSpeed + disco) sem pedir
- Gerar `wp login as <user> --url-only` automaticamente e entregar o link no resumo final
- Reportar em **3 a 4 linhas** o que foi feito. NAO escrever ensaio de meia pagina.
- Se decidir testar a home via curl, fazer e seguir. Se der HTTP 200 e o filtro/conteudo esperado estiver OK, NAO me perguntar se "tudo bem" - apenas finaliza.

### Se nao tiver certeza:

Executa, observa o resultado, e me diz depois. Reverter um SSH errado custa menos que perder 5 minutos pedindo aprovacao. Eu corrijo se nao gostar - meu feedback eh imediato.

### NAO use AskUserQuestion para coisas inferiveis:

NAO pergunte se nao consegue chegar na resposta sozinho. Em particular:

- **Parent theme/aestethic direction**: se o site ja tem logo, eu ja te dei pista visual. Se ja tem niche definido pelo conteudo, voce ja sabe o tom. Escolhe e executa - se eu nao gostar, refazemos.
- **AdSense slots**: descobre via `wp plugin list | grep -i adsense` ou `curl /home | grep googletagservices`. Se nao tiver evidencia, assume "nao tem por enquanto" e mete sem slots.
- **Categorias multilingue**: voce ja lista `wp term list category` e identifica slugs em ingles (life, news, blog) ou pt-PT (actualidade, noticias-pt). Decide e implementa sem perguntar.
- **Permalink**: NUNCA pergunta. Regra absoluta da rede: `--preserve-permalink`.
- **Confirmacao pos-deploy**: se HTTP 200 + filtro/conteudo OK + sintaxe PHP OK, ja terminou. Nao confirma comigo.
- **Quantos posts mostrar**, qual ordem de cards, quais classes CSS, qual font fallback: voce decide.

Use AskUserQuestion **somente** quando:
1. A escolha eh genuinamente subjetiva e voce nao tem como inferir (ex: "qual nome do dominio novo a comprar?")
2. A consequencia eh irreversivel e cara (deletar 1000 posts, mudar dominio principal, force-push em main com 50 commits)
3. Eu te der duas direcoes contraditorias na mesma frase

Caso contrario, decida com base em CLAUDE.md, README das hospedagens, ou inferencia razoavel do contexto.

## Linha Fina (termo meu, vale para todos os projetos)

Quando eu falar **"linha fina"**, quero o texto curto que fica **logo abaixo do
titulo (H1) e acima da linha de data / tempo de leitura / autor**. E o que o
jornalismo chama de subtitulo, olho ou abre.

**O que e:** uma explicacao breve do conteudo que vem a seguir, umas poucas
palavras, uma frase. Funciona como isca: dá ao leitor um gostinho do que ele vai
encontrar para que ele continue lendo em vez de voltar para o Google.

**Regras:**
- Uma frase, entre 10 e 20 palavras. Nunca duas frases.
- NAO repetir o title nem a meta description, e NAO copiar o primeiro paragrafo.
  Se a linha fina disser a mesma coisa que o paragrafo de entrada, ela nao serve.
- Deve entregar informacao nova ou a promessa concreta do artigo, nao elogio
  vago ("saiba tudo sobre", "confira as dicas").
- Portugues do Brasil com acentuacao correta e **sem travessao**, como todo o
  resto do conteudo.
- Visualmente: menor que o H1, maior ou igual ao corpo, cor mais fraca que a
  tinta cheia, respeitando o minimo de contraste da WCAG.
