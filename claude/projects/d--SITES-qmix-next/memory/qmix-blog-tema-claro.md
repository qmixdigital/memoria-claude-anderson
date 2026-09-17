---
name: qmix-blog-tema-claro
description: Site inteiro (frontend, tools, publisher, blog) em tema claro por padrão com toggle escuro via tokens --q-*; admin continua escuro (.tema-escuro)
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-14T00:03:01.345Z
---

Em 13/09/2026 o blog (`/blog` e `/blog/[slug]`) saiu do `(frontend)` e foi para `src/app/(blog)/`,
com layout próprio (cabeçalho/rodapé claros estilo portal de notícias, fontes Bricolage Grotesque
+ Instrument Sans via next/font), tokens `--qb-*` em `src/app/(blog)/blog.css` e tema escuro por
`html[data-theme="dark"]` (botão `ThemeToggle`, chave `localStorage qmix-tema`, script anti-flash no
layout). Padrão é claro sempre, sem seguir prefers-color-scheme (decisão do Anderson).

Em 14/09/2026 o tema claro foi para o site inteiro: codemod (scratchpad `codemod_tema.py`, 226 arquivos)
trocou as cores fixas por tokens `--q-*` definidos em `globals.css` (`:root` claro; `:root[data-theme=dark]`
e `.tema-escuro` escuro). Papel decide o token: `#00ff66` em texto/borda vira `--q-green-ink` (#0a7a3a no
claro), em fundo vira `--q-green` (#00e05c); `rgba(255,255,255,a)` vira `--q-wa-a` (tinta com alfa no claro) e
como fundo de cartão vira `--q-card` (branco). Script anti-flash e `theme-color` estão no RootLayout;
`ThemeToggle` fica no HeaderNav (chave `qmix-tema`). Admin: `src/app/admin/layout.tsx` envolve tudo em
`.tema-escuro` e mantém os hex antigos. A logomarca branca ganha `filter` no claro (classe `.logo-qmix`).
O blog usa o HeaderNav/FooterSection do site (pedido do Anderson: mesma logo, menu e rodapé); os tokens
`--qb-*` apontam para os `--q-*`. Backup do src antes: `/var/www/src-backup-antes-tema-*.tgz` na VPS.

**Why:** Anderson gostou do layout claro da newsletter e quer o site todo assim, com botão para
escuro. O blog foi o piloto aprovado para começar ("faça algo novo e moderno, pode mudar
completamente"), feito de forma autônoma.

**How to apply:**
- Ao migrar o resto do site, os tokens `--qb-*` viram os globais; componentes do blog em
  `(blog)/components` (PostCard, BlogSearch em janela, MenuMobile, NewsletterBox) são reutilizáveis.
- Classes do blog ficam em `@layer components` para que utilitários Tailwind (`flex-row`, `text-[...]`)
  as sobrescrevam; as sobrescritas de `.qb .blog-content` ficam SEM layer para vencer o `.blog-content`
  escuro do globals.css (usado ainda no gerador de conteúdo e em minha-conta).
- Deploy após mover rotas: apagar `.next/types`, `.next-build/types` e `.next/dev/types` na VPS antes do
  `./deploy.sh`, senão o typecheck do build falha com "Cannot find module '(frontend)/blog/...'" (o
  tsconfig inclui esses validators gerados).
- Screenshot local: `npx next dev -p 3333` com `DATABASE_URI` da VPS via túnel `ssh -L 5434:127.0.0.1:5434`
  (o .env local aponta para um Neon com senha inválida); imagens só existem na VPS, o `shot-proxy.mjs`
  do scratchpad busca `/blog-images` e `/media` de qmix.com.br (o `/_next/image` de lá dá 403 no Playwright).
- Home redesenhada em 14/09/2026 (direção "Catálogo à vista", gerada pelo Fable, revisor com veto, aprovada
  pelo Anderson por print): markup em `page.tsx` + `src/app/(frontend)/home.css` escopado em `.hm`; mockups em
  `D:\SITES\qmix-next\mockups-home\`. Regras dele: sem Goiânia/Goiás no conteúdo (atende o mundo todo); rodapé
  real do site; botão claro/escuro no cabeçalho E na lateral (`ThemeSideHint`, aparece após o aviso de cookies,
  dica some quando o visitante escolhe). Fontes Bricolage/Instrument carregadas no RootLayout.
- Logomarca nova (14/09/2026, opção C1 aprovada): "QMIX | GEO · SEO · BACKLINKS", QMIX na Mazzard H Black
  (`D:\SITES\qmix-next\FONTE MARCA QMIX\mazzard-h-black.otf`, única fonte da marca), assinatura em Montserrat Medium.
  Gerada por script (fontTools → SVG em curvas; sharp → PNG). Componente `Logomarca.tsx` (PNG srcset 1x/2x/3x,
  tinta no claro e branca no escuro via .logo-claro/.logo-escuro). Para o Google: `/images/logomarca-qmix-digital.png`
  (1200x336, fundo branco) e `-quadrada.png` (600x600), usados no JSON-LD Organization. OG images usam a branca
  em data URI. Arquivos finais também em `FONTE MARCA QMIX\logomarca-final\`. O antigo `logomarca-qmix-branca.webp`
  foi sobrescrito com a marca nova (mesmo nome, quem referenciar continua certo).
- Componentes do tema claro para reusar: `FaixaCTA` (faixa escura final, substitui as faixas verdes cheias),
  `MocksProduto` (MockPacote/MockMateria em HTML/CSS para heros de páginas comerciais), `Logomarca`,
  `ThemeToggle`/`ThemeSideHint`, `Contador`. Deploy: nunca rodar dois `./deploy.sh` ao mesmo tempo (builds
  concorrentes em .next-build dão ENOENT); `pkill -f deploy.sh` mata a própria sessão ssh.
- 14/09/2026 revisão de segurança/velocidade: Next 16.2.1→16.3.5 (CVE DoS), drizzle-orm 0.45.2 (SQLi em identificadores),
  nanoid/uuid/fflate/resend/svix atualizados; JSON-LD com `.replace(/</g,'\u003c')` em todos os 136 scripts;
  `poweredByHeader:false`; headers de segurança já vêm do nginx. Ficaram sem atualizar (major): sharp 0.34,
  @vercel/og 0.10, @anthropic-ai/sdk. O package.json da VPS tinha `nodemailer` que o local não tinha:
  local agora tem também (sempre diffar package.json antes de subir). PSI: desktop 100, mobile 89-93.
- Pendente: `error.tsx` do blog e páginas de imagem OG seguem escuras (OG é proposital, satori não lê var()).

Ver também [[qmix-newsletter-digest]] e [[qmix-deploy-atomico]].

**Ferramentas (15/09/2026):** `src/app/(tools)/ferramentas/ferramentas.css` tinha paleta escura fixa (título branco, badge verde puro) e ficava ilegível no claro. Agora as variáveis `--qmix-*` apontam para os tokens `--q-*` e existe `--qmix-accent-ink` (verde-tinta) para TEXTO; `--qmix-accent` (verde) fica só para fundo/preenchimento. Cores inline nas 75 páginas de ferramenta também trocadas por tokens. Regra: em ferramenta nova, nunca cor fixa nem `color: var(--qmix-accent)` em texto.
