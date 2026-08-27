/* Service Worker for Elephantology Wiki («Слонология») PWA */

const CACHE_STATIC = 'slonology-static-v2';
const CACHE_ARTICLES = 'slonology-articles-v2';
const CACHE_DATA = 'slonology-data-v2';

const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/icon.svg',
  '/assets/images/favicon.png',
  '/assets/seo_matrix.json',
  '/assets/flashcards.json',
  '/assets/map_data.json',
  '/api/articles'
];

// Install: Pre-cache App Shell & Critical Data
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(async (cache) => {
      console.log('[SW] Pre-caching core app shell & assets...');
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (err) {
        console.warn('[SW] Some initial assets failed to pre-cache:', err);
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![CACHE_STATIC, CACHE_ARTICLES, CACHE_DATA].includes(key)) {
            console.log('[SW] Deleting old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event handler with smart routing strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST /api/chat handled separately)
  if (request.method !== 'GET') {
    if (url.pathname === '/api/chat') {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({
              reply: "🔌 **Оффлайн-режим активен**\n\nAI-Слонолог требует подключения к сети интернет. Однако вся энциклопедия, иллюстрации и сохранённые статьи полностью доступны для чтения без интернета!"
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
      );
    }
    return;
  }

  // 1. Navigation requests (SPA pages): Network first, fallback to cached '/'
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put('/', clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/') || await caches.match('/index.html');
          if (cached) return cached;
          return new Response('Elephantology Wiki Offline', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 2. Articles metadata API: Stale-While-Revalidate
  if (url.pathname === '/api/articles') {
    event.respondWith(
      caches.open(CACHE_DATA).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          if (cachedResponse) return cachedResponse;
          throw err;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Single Article Content API (/api/article?path=...): Network First with Cache Fallback & Auto-Save
  if (url.pathname === '/api/article') {
    event.respondWith(
      caches.open(CACHE_ARTICLES).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            `# 🔌 Статья не сохранена в оффлайне\n\nДанная статья ещё не была загружена в кэш. Подключитесь к интернету или воспользуйтесь функцией «Скачать всю энциклопедию» на главной странице.`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
            }
          );
        }
      })
    );
    return;
  }

  // 4. Static Assets & Third-Party CDN (Fonts, Leaflet, Scripts, Styles, Images): Cache First with Background Update
  const isStatic = 
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/docs/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdnjs.cloudflare.com');

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch fresh version in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_STATIC).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Fetch failed for static asset:', url.pathname);
          throw err;
        });
      })
    );
    return;
  }

  // Default network fetch
  event.respondWith(fetch(request));
});

// Communication with Client (Sync & Pre-caching)
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Bulk download and cache all articles for offline usage
  if (event.data.type === 'CACHE_ALL_ARTICLES') {
    const articles = event.data.articles || [];
    const cache = await caches.open(CACHE_ARTICLES);
    let completed = 0;
    const total = articles.length;

    for (const article of articles) {
      try {
        const articleUrl = `/api/article?path=${encodeURIComponent(article.path)}`;
        const res = await fetch(articleUrl);
        if (res.ok) {
          await cache.put(new Request(articleUrl), res);
        }
      } catch (e) {
        console.warn('[SW] Failed to cache article:', article.path, e);
      }
      completed++;
      
      // Notify client with progress
      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_PROGRESS',
          completed,
          total,
          percent: Math.round((completed / total) * 100),
          currentPath: article.path,
          currentTitle: article.title
        });
      }
    }

    if (event.source) {
      event.source.postMessage({
        type: 'CACHE_COMPLETE',
        completed,
        total
      });
    }
  }

  if (event.data.type === 'CHECK_OFFLINE_STATUS') {
    const articleCache = await caches.open(CACHE_ARTICLES);
    const keys = await articleCache.keys();
    if (event.source) {
      event.source.postMessage({
        type: 'OFFLINE_STATUS',
        cachedArticlesCount: keys.length
      });
    }
  }
});
