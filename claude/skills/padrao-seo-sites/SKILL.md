---
name: padrao-seo-sites
description: Padrao obrigatorio de SEO dos sites do Anderson: linkagem interna com variacao de texto ancora, title, meta tags, OG, canonical, slug, headings, FAQ e featured snippets, topic clusters, schema JSON-LD (inclusive diretorios: CollectionPage, ItemList, SoftwareApplication), sitemap e robots, e a regra de copiar estrutura de outro site sem copiar texto. Use ao criar ou editar qualquer pagina, artigo ou site, ao escrever meta/title/schema, ao fazer linkagem interna, ou quando ele disser 'copiar site X'.
---

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
