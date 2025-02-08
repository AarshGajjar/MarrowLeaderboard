// Make sure we're in a service worker environment
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.resolve(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.resolve(self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  const defaultData = {
    title: 'QBank Update',
    body: 'New activity recorded',
    icon: '/assets/marrow.png'
  };

  const data = event.data?.json() ?? defaultData;

  const options = {
    ...data,
    icon: data.icon || '/assets/marrow.png',
    badge: '/assets/marrow.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow('/');
      })
  );
});
