const CACHE = 'despensa-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});

// Notificações push (edição Pro) — só dispara se o browser receber um push do servidor
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Despensa', body: 'Tens uma notificação nova.' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Despensa', {
      body: data.body,
      icon: '/icon-192.png'
    })
  );
});
