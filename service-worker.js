// Service Worker per Travel Business Case PWA
// Versione: 1.0.0

const CACHE_NAME = 'travel-bc-v1';
const RUNTIME_CACHE = 'travel-bc-runtime';

// File da cachare durante l'installazione
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/participants.js',
  '/js/scenarios.js',
  '/js/actuals.js',
  '/js/actuals-ui.js',
  '/js/accounts.js',
  '/js/flights.js',
  '/js/accommodation-car.js',
  '/js/charts.js',
  '/js/export.js',
  '/js/sample-data.js',
  '/manifest.json'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione in corso...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aperta');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Tutti i file sono stati cachati');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Errore durante il caching:', error);
      })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione in corso...');
  
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Eliminazione cache obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Attivato e pronto');
      return self.clients.claim();
    })
  );
});

// Strategia di caching: Network First con fallback a Cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora richieste non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora richieste a domini esterni (CDN)
  if (url.origin !== location.origin) {
    // Per CDN, usa cache-first
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then(response => {
          // Copia la risposta
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Per risorse locali, usa network-first con fallback a cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Verifica che la risposta sia valida
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Copia la risposta
        const responseToCache = response.clone();
        
        // Aggiorna la cache
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova dalla cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Servito dalla cache:', request.url);
            return cachedResponse;
          }
          
          // Se è una richiesta HTML, restituisci la pagina principale
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[Service Worker] Cache pulita');
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
});

// Gestione sincronizzazione in background (per future implementazioni)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Sincronizzazione dati in background...');
  // Implementazione futura per sincronizzazione con Supabase
}

// Notifiche push (per future implementazioni)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Travel Business Case', options)
  );
});

// Click su notifica
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Service Worker] Script caricato');

// Made with Bob
