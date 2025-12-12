// service-worker.js - Mapbox 타일 캐싱을 위한 Service Worker

// 버전 정보 (배포 시 수동으로 업데이트)
const APP_VERSION = '1.2.0';
const CACHE_NAME = `seoul-tree-map-v${APP_VERSION}`;
const TILE_CACHE_NAME = `mapbox-tiles-v${APP_VERSION}`;
const MAX_TILE_AGE = 7 * 24 * 60 * 60 * 1000; // 7일

// 디버그 모드 (필요할 때만 true로 변경)
const DEBUG_MODE = false;

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Mapbox 타일 URL 패턴
const MAPBOX_TILE_PATTERNS = [
  /^https:\/\/api\.mapbox\.com\/.*\.tiles\/mapbox\.*/,
  /^https:\/\/.*\.tiles\.mapbox\.com\/.*/,
  /^https:\/\/api\.mapbox\.com\/v4\/.*/,
  /^https:\/\/api\.mapbox\.com\/styles\/v1\/.*/
];

// 타일 URL인지 확인
function isTileRequest(url) {
  return MAPBOX_TILE_PATTERNS.some(pattern => pattern.test(url));
}

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('.map')));
    }).catch(err => {
      console.log('[Service Worker] Cache installation failed:', err);
    })
  );

  self.skipWaiting();
});

// 활성화 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', APP_VERSION);

  event.waitUntil(
    Promise.all([
      // 오래된 캐시 삭제
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 현재 버전이 아닌 모든 캐시 삭제
            if (cacheName !== CACHE_NAME && cacheName !== TILE_CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 클라이언트에 새 버전 알림
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'VERSION_UPDATE',
            version: APP_VERSION
          });
        });
      })
    ]).then(() => {
      console.log('[Service Worker] Activation complete, claiming clients');
    })
  );

  self.clients.claim();
});

// Fetch 이벤트 - 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Mapbox 타일 요청 처리
  if (isTileRequest(url)) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (cache) => {
        // 캐시 확인
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          const dateHeader = cachedResponse.headers.get('date');
          const cachedTime = dateHeader ? new Date(dateHeader).getTime() : 0;
          const now = Date.now();

          // 캐시가 유효한 경우
          if (now - cachedTime < MAX_TILE_AGE) {
            if (DEBUG_MODE) console.log('[Service Worker] Serving tile from cache:', url);
            return cachedResponse;
          } else {
            if (DEBUG_MODE) console.log('[Service Worker] Tile cache expired:', url);
          }
        }

        // 네트워크에서 가져오기
        try {
          const networkResponse = await fetch(request);

          // 성공적인 응답만 캐시
          if (networkResponse && networkResponse.status === 200) {
            if (DEBUG_MODE) console.log('[Service Worker] Caching new tile:', url);
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          if (DEBUG_MODE) console.log('[Service Worker] Tile fetch failed, using stale cache:', url);
          // 네트워크 실패 시 만료된 캐시라도 반환
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })
    );
    return;
  }

  // 기타 정적 리소스 처리 (Cache First 전략)
  if (request.method === 'GET' && !url.includes('/api/') && !url.includes('firestore')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      }).catch(() => {
        // 오프라인 폴백 (선택사항)
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Firebase 및 API 요청은 네트워크만 사용
  event.respondWith(fetch(request));
});

// 메시지 이벤트 - 캐시 관리
self.addEventListener('message', (event) => {
  // 즉시 활성화 (새 버전 배포 시)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting, activating immediately');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_TILE_CACHE') {
    event.waitUntil(
      caches.delete(TILE_CACHE_NAME).then(() => {
        console.log('[Service Worker] Tile cache cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.open(TILE_CACHE_NAME).then(async (cache) => {
        const keys = await cache.keys();
        event.ports[0].postMessage({
          tileCount: keys.length,
          cacheName: TILE_CACHE_NAME
        });
      })
    );
  }
});
