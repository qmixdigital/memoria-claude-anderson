# Kit PWA + Desconto no App (WordPress + WooCommerce)

Transforma um site WooCommerce em **app instalável (PWA)** e dá **desconto automático
(ex.: 10%) em toda compra feita pelo aplicativo**. Independente de tema e de Elementor.

Feito e testado em **seguidoresbrasil.com.br** (Hostinger Renato / CloudPanel + Smmloja).
Referência de origem: **enjai.com.br** (que é Next.js). Aqui está a versão para WordPress.

---

## O que o kit faz

1. **Instalável** (adicionar à tela inicial / instalar app) via manifest + service worker.
2. **Barra fixa no topo** incentivando a instalar: "💸 Baixe o app e ganhe 10% OFF →"
   - Mobile e desktop; a barra inteira é clicável.
   - Android: dispara o prompt nativo (`beforeinstallprompt`).
   - iOS/desktop: abre um modal com o passo a passo (Safari e navegadores sem prompt).
   - Persistente (some só quando instala).
3. **Desconto 10% só dentro do app**: quando o site roda em modo standalone (app), um
   cookie `sb_app=1` é gravado; um hook do WooCommerce aplica o cupom automaticamente e
   o remove quando a compra NÃO vem do app.
4. **Avisa no checkout**: barra verde "🎉 Você tem 10% de desconto, aplicado sozinho no
   checkout" (em todas as páginas quando está no app) + rótulo amigável do cupom no total.

---

## Arquivos do kit

| Arquivo | Vai para | O que é |
|---|---|---|
| `manifest.webmanifest` | **raiz do site** (`/manifest.webmanifest`) | manifesto PWA (nome, ícones, cor, standalone) |
| `sw.js` | **raiz do site** (`/sw.js`) | service worker (cache-first imagens, network-first páginas/checkout, offline) |
| `offline.html` | **raiz do site** (`/offline.html`) | página offline |
| `app-icon-192.png` / `app-icon-512.png` / `app-icon-maskable-512.png` | **raiz do site** | ícones do app |
| `segbrasil-pwa.php` | `wp-content/mu-plugins/` | o mu-plugin: tags PWA no head, barra/modal no footer, hook do cupom |
| `appicon.html` | (só para gerar os ícones) | HTML do ícone, renderizado com navegador headless |

> Os estáticos ficam na **raiz** porque o service worker precisa de escopo `/` e o
> manifest/ícones são servidos como arquivos estáticos direto pelo nginx.

---

## Passo a passo para instalar em um site novo

1. **Criar o cupom** (uma vez), via wp-cli:
   ```bash
   wp eval '$c=new WC_Coupon(); $c->set_code("APP10"); $c->set_discount_type("percent");
     $c->set_amount(10); $c->set_individual_use(false); echo $c->save();' --allow-root
   ```
   (troque `APP10` / `10` se quiser outro código/porcentagem — e ajuste no mu-plugin.)

2. **Gerar os ícones** (o servidor geralmente não tem ImageMagick). Renderize `appicon.html`
   com o Edge/Chrome headless (na sua máquina) em 512 e 192, e copie o 512 como maskable:
   ```powershell
   & msedge --headless=new --disable-gpu --window-size=512,512 --default-background-color=00000000 `
     --screenshot=app-icon-512.png "file:///C:/caminho/appicon.html"
   & msedge --headless=new --disable-gpu --window-size=192,192 --default-background-color=00000000 `
     --screenshot=app-icon-192.png "file:///C:/caminho/appicon.html"
   copy app-icon-512.png app-icon-maskable-512.png
   ```

3. **Subir os estáticos** para a raiz do site: `manifest.webmanifest`, `sw.js`,
   `offline.html`, `app-icon-192.png`, `app-icon-512.png`, `app-icon-maskable-512.png`.

4. **Subir o mu-plugin** `segbrasil-pwa.php` em `wp-content/mu-plugins/` (renomeie à vontade).

5. **Ajustar no mu-plugin e no manifest** (por site):
   - Código do cupom (`APP10`) e a % (rótulo do cupom).
   - Cores do gradiente / `theme_color` (`#1a5cff`).
   - Nome/short_name/descrição no manifest.
   - Texto da barra ("Baixe o app e ganhe 10% OFF").
   - Número de WhatsApp/etc. se usar.

6. **Purgar cache** (WP + nginx + Cloudflare) e testar no celular e no PC.

---

## Como funciona o desconto (o núcleo)

- `sw.js` na raiz + `<link rel="manifest">` + `display:standalone` = instalável.
- JS detecta app: `matchMedia("(display-mode: standalone)").matches || navigator.standalone`.
  - No app → grava cookie `sb_app=1`. Fora do app → apaga o cookie.
- Hook do WooCommerce (mu-plugin):
  ```php
  add_action('woocommerce_before_calculate_totals', function($cart){
    if (!empty($_COOKIE['sb_app']) && $_COOKIE['sb_app']==='1'
        && !$cart->is_empty() && !$cart->has_discount('APP10')) {
      $cart->apply_coupon('APP10');           // aplica no app
    }
  }, 20);
  add_action('woocommerce_before_calculate_totals', function($cart){
    if (empty($_COOKIE['sb_app']) && $cart->has_discount('APP10')) {
      $cart->remove_coupon('APP10');          // remove fora do app
    }
  }, 21);
  ```
- O checkout (mesmo os customizados como o Smmloja) lê `WC()->cart` e mostra o cupom.

**Uma vez só por usuário** (variante): em vez de "sempre", crie o cupom com "limite de
uso: 1 por usuário" (`$coupon->set_usage_limit_per_user(1)`) e exija login. O WooCommerce
garante o "uma vez" nativamente.

---

## GOTCHAS (as pedras que já custaram tempo — leia antes)

1. **nginx `proxy_hide_header Set-Cookie` mata o carrinho/login.** Se o site tem cache de
   página no nginx com `proxy_hide_header Set-Cookie` no `location /`, ele apaga TODO
   Set-Cookie (inclusive sessão do WooCommerce) → o cookie/sessão do carrinho não persiste
   e o desconto não segura. Correção: **remover** o `proxy_hide_header Set-Cookie`, tirar
   `Set-Cookie` do `proxy_ignore_headers`, e usar `proxy_no_cache $skip $upstream_http_set_cookie`
   (não cacheia resposta que seta cookie). Ver incidente 2026-08-26 no ACESSO da Hostinger Renato.

2. **A HOME pode não mostrar a barra fixa.** Landings pesadas (React/Smmloja) envolvem o
   conteúdo num wrapper com stacking context que esconde `position:fixed`. **Fix:** no JS,
   `document.body.appendChild(abar)` (mover a barra pro final do body) + `z-index` altíssimo
   (`2147483000`) + `isolation:isolate`. Sem isso, o JS roda mas a barra não pinta na home.

3. **CSS global do tema quebra o layout da barra.** Tailwind/tema podem impedir `flex:1`/grid
   de encolher e `white-space` de quebrar dentro da barra. Solução robusta: `display:block`,
   `text-align:center`, texto CURTO, `white-space:normal !important`, e **barra inteira
   clicável** (evite botão separado — chegou a não renderizar).

4. **Conteúdo populado por `innerHTML` em JS pode não aparecer.** Prefira o HTML **estático**
   das barras e só alterne visibilidade por classe (`display` via classe), não por
   `element.innerHTML=...`.

5. **`manifest.webmanifest` sai como `application/octet-stream`.** Não bloqueia a instalação
   (o navegador lê via `rel="manifest"` como JSON). Se quiser o certo, adicione
   `application/manifest+json  webmanifest;` no `mime.types` do nginx (pode não pegar se um
   nginx interno servir o arquivo — não é crítico).

6. **`php -l` dá segfault em servidores com ionCube.** Não é erro do arquivo. Valide o
   mu-plugin abrindo o site (HTTP 200) em vez de confiar no lint.

7. **Service worker precisa de versão.** Ao mudar algo, suba a `VERSION` do `sw.js`
   (`sb-v1`→`sb-v2`) senão quem já visitou fica com a versão antiga. E oriente Ctrl+Shift+R.

8. **Mobile vs desktop.** Instalar PWA é ação mais de mobile, mas mostre a barra também no
   desktop (o cliente costuma testar no PC). No desktop, o clique usa o prompt do Chrome/Edge;
   para navegadores sem prompt, o modal mostra passos de desktop.

9. **Cloudflare.** O purge do nginx NÃO limpa a borda da Cloudflare. Se o HTML estiver
   cacheado na CF, purgue também. (No caso da Renato, o HTML vem com `no-store`, então a CF
   não cacheia — mas confira `cf-cache-status`.)

10. **Testar sempre com screenshot real** (Edge/Chrome headless `--screenshot`). Simular
    iPhone: `--user-agent=Mozilla/5.0-iPhone-Safari` (sem espaços, senão o arg quebra) —
    o JS só checa `/iphone|ipad|ipod/`. O headless às vezes falha timing; rode de novo.

---

## Personalização rápida

- **% do desconto:** muda no cupom (`set_amount`) + no texto/rótulo do mu-plugin.
- **Cores:** gradiente `#1a5cff → #6a3cff` (barra/ícone/tema). Verde do "ativo": `#12b886`.
- **Texto da barra:** curto. "Baixe o app e ganhe 10% OFF →" cabe em telas de 360px.
- **Cookie:** `sb_app` (pode renomear; mantenha igual no JS e no PHP).

---

## Bônus: notificações no Telegram (`segbrasil-telegram.php`)

Envia os eventos do site para um bot do Telegram (vendas, pagamento, cadastro, app
instalado, status de pedido). Estilo enjai.

**Instalar num site novo:**
1. Crie um bot no **@BotFather** → pegue o **token**.
2. Ponha o token no `define('SB_TG_TOKEN', ...)` do mu-plugin e suba em `wp-content/mu-plugins/`.
3. Mande `/start` pro bot (ou adicione a um **grupo** e mande msg no grupo).
4. Pegue o `chat_id`: `curl "https://api.telegram.org/bot<TOKEN>/getUpdates"` → campo `chat.id`
   (negativo se for grupo). Salve: `wp option update sb_tg_chat_id <id>`.
5. Teste: `wp eval "sb_tg_send('teste');" --allow-root`.

**Detalhes:** envio `blocking=>false` (não atrasa o site); dedup por meta `_sb_tg_paid`;
app-install vem do JS do PWA (`appinstalled` → `admin-ajax.php?action=sb_app_installed`);
ligar/desligar eventos via `wp option update sb_tg_events '{"signup":"off"}' --format=json`
(chaves: sale, completed, cancelled, refunded, signup, install). Hooks usados:
`woocommerce_order_status_processing`/`woocommerce_payment_complete` (venda),
`..._completed/_cancelled/_refunded`, `user_register`.

Data: 2026-08-31 (PWA) / 2026-09-01 (Telegram).
