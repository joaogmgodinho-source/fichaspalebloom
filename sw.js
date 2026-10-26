// Service Worker - Ficha de RPG
// Se mudar qualquer arquivo do site, troque a versão abaixo para forçar a atualização do cache.
const CACHE_NAME = 'ficha-rpg-v1';

// Arquivos do próprio site
const LOCAL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Bibliotecas externas (CDN) que o site precisa para funcionar offline
const CDN_FILES = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/lucide@latest'
];

// Tenta guardar um arquivo externo; se o CORS falhar, tenta no modo no-cors
async function cacheCdn(cache, url) {
  try {
    const res = await fetch(url);
    if (res.ok) return cache.put(url, res);
  } catch (e) { /* tenta o próximo modo */ }
  try {
    const res = await fetch(new Request(url, { mode: 'no-cors' }));
    return cache.put(url, res);
  } catch (e) {
    console.warn('Não foi possível guardar em cache:', url);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        LOCAL_FILES.map((f) => cache.add(f).catch(() => console.warn('Arquivo não encontrado:', f)))
      );
      await Promise.all(CDN_FILES.map((u) => cacheCdn(cache, u)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: usa o cache na hora e atualiza em segundo plano quando houver internet
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));

      return cached || network;
    })
  );
});
