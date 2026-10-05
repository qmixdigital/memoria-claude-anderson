---
name: padrao-estrutura-sites
description: Padrao de construcao dos sites do Anderson (HTML estatico e Next.js + Payload): estrutura de pastas, design e CSS, layout split do hero, alinhamento de texto, grids, tabelas responsivas em card no mobile, WhatsApp CTA, Core Web Vitals, stack Next.js, aviso de cookies LGPD, 404, politica de privacidade e termos, .htaccess, animacoes on-scroll, acessibilidade e manifest.json. Use ao criar, montar, redesenhar ou finalizar qualquer site ou pagina, ao escrever CSS/layout, ou ao montar tabela.
---

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

## LGPD / Cookie Consent

Todo site DEVE ter aviso de cookies (LGPD), **informativo**: ele nao controla
a medicao. O GA4 mede sempre (secao Google Analytics); a base legal e o
legitimo interesse, declarado na politica de privacidade.

- Banner fixo no bottom da pagina, aparece na primeira visita
- Um botao so: "Entendi". Sem "Apenas necessarios", sem categorias para
  marcar: nao existe o que desligar
- Texto: "Usamos cookies para o funcionamento do site e para estatisticas de
  acesso" + link para a politica de privacidade
- Guardar que a pessoa ja viu em cookie `cookie_consent=ok` com validade de
  1 ano (`max-age=31536000; SameSite=Lax`)
- Banner desaparece com animacao suave apos o clique
- NAO exibir novamente se o cookie ja existe
- Politica de privacidade: dizer que o Google Analytics mede paginas, origem
  e cliques de contato, com IP anonimizado, por legitimo interesse (art. 7o,
  IX), e que a pessoa pode bloquear cookies no navegador. Modelo em
  `d:/SITES/henriquecembranelli.com/politica-de-privacidade.html`

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
