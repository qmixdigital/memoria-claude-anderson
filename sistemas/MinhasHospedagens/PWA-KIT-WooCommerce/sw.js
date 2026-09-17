// Seguidores Brasil - Service Worker (PWA)
// Estaticos (imagens/fontes) = cache-first (app abre rapido / offline).
// Paginas, CSS, JS e APIs = network-first (preco/checkout sempre atualizados).
const VERSION = "sb-v3";
const STATIC_CACHE = "sb-static-" + VERSION;
const PRECACHE = ["/offline.html", "/app-icon-192.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("sb-static-") && k !== STATIC_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  // Nunca cachear rotas dinamicas/sensiveis
  const p = url.pathname;
  if (p.startsWith("/wp-admin") || p.startsWith("/wp-json") || p.startsWith("/wp-login") ||
      p.includes("/checkout") || p.includes("/finalizar-compra") || p.includes("/carrinho") ||
      p.includes("/minha-conta") || p.includes("admin-ajax.php") || url.search.includes("wc-ajax")) {
    return; // deixa a rede cuidar (default)
  }

  // Imagens e fontes = cache-first
  if (/\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/i.test(p)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(STATIC_CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return res;
      }).catch(() => caches.match("/offline.html")))
    );
    return;
  }

  // Resto (HTML/CSS/JS/API) = network-first, cai pro cache/offline se sem rede
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((hit) => hit || caches.match("/offline.html")))
  );
});
