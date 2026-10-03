const CACHE_NAME = 'qmix-indexation-v47';
const EXTRA_ASSETS = ['/gsc.js', '/gsc.json'];
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/domains.json',
  '/manifest.json',
  '/imagens/icon-192.png',
  '/imagens/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Arquivos de dado: precisam vir sempre do servidor. O ?v= do index é fixo,
// entao nao serve de cache-buster, e sem no-store o navegador serve copia
// velha por baixo do proprio service worker.
const VOLATEIS = /^\/(status\.js|status\.json|gsc\.js|gsc\.json|domains\.json|engine-status\.json)$/;

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Ignora requests cross-origin (deixa o navegador lidar diretamente)
  if (url.origin !== self.location.origin) return;

  // Ignora métodos diferentes de GET
  if (e.request.method !== 'GET') return;

  // Dado volátil: rede obrigatoriamente fresca, cache só como salvação offline
  if (VOLATEIS.test(url.pathname)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Network first com fallback para cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
