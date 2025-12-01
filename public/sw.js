const CACHE_NAME = 'funzhizhi-v1';
const OFFLINE_URL = '/offline';

// 需要预缓存的资源
const PRECACHE_ASSETS = [
  '/',
  '/blog',
  '/courses',
  '/offline',
  '/manifest.json',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过 API 请求和 Chrome 扩展请求
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果有缓存，返回缓存
      if (cachedResponse) {
        // 同时在后台更新缓存
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
            })
            .catch(() => {})
        );
        return cachedResponse;
      }

      // 没有缓存，尝试网络请求
      return fetch(event.request)
        .then((response) => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 缓存响应
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 网络请求失败，返回离线页面
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('Background sync triggered');
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
