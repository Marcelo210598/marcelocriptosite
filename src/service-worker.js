import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precachear os assets do build
precacheAndRoute(self.__WB_MANIFEST)

// Cache de imagens por 30 dias
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
)

// Cache de APIs de terceiros (CoinGecko, News) por 5 minutos
registerRoute(
  ({ url }) => 
    url.origin.includes('coingecko.com') || 
    url.origin.includes('newsapi.org'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
)

// Cache de fontes e ícones por 1 ano
registerRoute(
  ({ request }) => 
    request.destination === 'font' || 
    request.destination === 'manifest',
  new CacheFirst({
    cacheName: 'assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
      }),
    ],
  })
)

// Cache de páginas HTML - Network First para sempre ter conteúdo atualizado
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
)

// Cache de JavaScript e CSS por 1 dia
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
)

// Evento de instalação
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado')
  self.skipWaiting()
})

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado')
  event.waitUntil(self.clients.claim())
})

// Evento de push (notificações)
self.addEventListener('push', (event) => {
  console.log('Evento push recebido:', event)
  
  const options = {
    body: 'Nova atualização disponível!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'crypto-update',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver agora',
        icon: '/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Fechar',
        icon: '/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Marcelo Cripto', options)
  )
})

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})

// Evento de mensagem (comunicação com a aplicação)
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fallback offline - mostrar página customizada quando offline
self.addEventListener('fetch', (event) => {
  // Se for uma navegação e estiver offline, mostrar página offline
  if (event.request.mode === 'navigate' && !navigator.onLine) {
    event.respondWith(
      caches.match('/offline.html').then((response) => {
        return response || new Response('Você está offline', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        })
      })
    )
  }
})