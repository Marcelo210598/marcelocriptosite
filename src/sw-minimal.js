// Service Worker mínimo para evitar erros
const CACHE_NAME = 'app-cache-v3';

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil((async () => {
    await self.skipWaiting();
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(['/offline.html']);
    } catch {}
  })());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Ignorar completamente arquivos .tsx
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.url.includes('.tsx')) {
    event.respondWith(fetch(req));
    return;
  }
  if (req.method !== 'GET') {
    event.respondWith(fetch(req));
    return;
  }
  const accept = req.headers.get('accept') || '';
  const url = new URL(req.url);
  const isAsset = /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|gif|woff2?)$/i.test(url.pathname);
  const isHTML = accept.includes('text/html') || req.mode === 'navigate';

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const network = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, network.clone());
        return network;
      } catch {
        const cached = await caches.match(req);
        return cached || (await caches.match('/offline.html')) || fetch(req);
      }
    })());
    return;
  }

  if (isAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const network = await fetch(req);
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, network.clone());
      } catch {}
      return network;
    })());
    return;
  }

  event.respondWith(fetch(req));
});

// Evento de push para notificações
self.addEventListener('push', (event) => {
  console.log('Push event recebido');
  
  const options = {
    body: 'Nova atualização disponível!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'crypto-update'
  };

  event.waitUntil(
    self.registration.showNotification('Marcelo Cripto', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada');
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
