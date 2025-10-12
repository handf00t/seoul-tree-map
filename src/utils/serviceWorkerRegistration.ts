// src/utils/serviceWorkerRegistration.ts
// Service Worker 등록 및 관리 유틸리티

interface CacheInfo {
  tileCount: number;
  cacheName: string;
}

export function register(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);

          // 버전 업데이트 메시지 수신 - 자동 리로드
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'VERSION_UPDATE') {
              console.log('🆕 New version available:', event.data.version);
              console.log('🔄 Auto-reloading to apply updates...');

              // 자동으로 페이지 새로고침
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          });

          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Service Worker update found');

            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📦 New Service Worker installed');

                // 새 워커가 설치되면 즉시 활성화
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });

          // 주기적으로 업데이트 확인 (1시간마다)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('⚠️ Service Worker not supported');
  }
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker unregistered');
      })
      .catch((error) => {
        console.error('Service Worker unregister failed:', error);
      });
  }
}

// 타일 캐시 삭제
export async function clearTileCache(): Promise<boolean> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event: MessageEvent) => {
        if (event.data.success) {
          console.log('✅ Tile cache cleared');
          resolve(true);
        } else {
          reject(new Error('Failed to clear cache'));
        }
      };

      navigator.serviceWorker.controller!.postMessage(
        { type: 'CLEAR_TILE_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  return Promise.reject(new Error('Service Worker not available'));
}

// 캐시 크기 확인
export async function getCacheSize(): Promise<CacheInfo> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event: MessageEvent) => {
        console.log('📊 Cache info:', event.data);
        resolve(event.data);
      };

      navigator.serviceWorker.controller!.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );

      // 5초 타임아웃
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
  }
  return Promise.reject(new Error('Service Worker not available'));
}
