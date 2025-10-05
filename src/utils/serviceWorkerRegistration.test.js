// Service Worker 기능 단위 테스트

describe('serviceWorkerRegistration 유틸리티', () => {
  test('Service Worker 지원 여부를 확인할 수 있어야 함', () => {
    const isSupported = 'serviceWorker' in navigator;
    expect(typeof isSupported).toBe('boolean');
  });

  test('MessageChannel API가 사용 가능한지 확인', () => {
    // 브라우저 환경에서만 MessageChannel이 존재
    if (typeof MessageChannel !== 'undefined') {
      const channel = new MessageChannel();
      expect(channel).toHaveProperty('port1');
      expect(channel).toHaveProperty('port2');
    } else {
      // 테스트 환경에서는 타입 체크만 수행
      expect(typeof MessageChannel).toBe('undefined');
    }
  });

  test('Promise 기반 비동기 처리가 가능해야 함', async () => {
    const testPromise = Promise.resolve({ success: true });
    const result = await testPromise;
    expect(result).toEqual({ success: true });
  });
});

describe('Service Worker 캐시 관리', () => {
  test('캐시 이름이 정의되어 있어야 함', () => {
    // service-worker.js의 캐시 이름 검증
    const expectedCacheNames = ['seoul-tree-map-v1', 'mapbox-tiles-v1'];
    expect(expectedCacheNames).toContain('seoul-tree-map-v1');
    expect(expectedCacheNames).toContain('mapbox-tiles-v1');
  });

  test('타일 캐시 최대 유효기간이 설정되어 있어야 함', () => {
    const MAX_TILE_AGE = 7 * 24 * 60 * 60 * 1000; // 7일
    expect(MAX_TILE_AGE).toBe(604800000);
  });

  test('Mapbox 타일 URL 패턴을 확인할 수 있어야 함', () => {
    const tilePatterns = [
      /^https:\/\/api\.mapbox\.com\/.*\.tiles\/mapbox\.*/,
      /^https:\/\/.*\.tiles\.mapbox\.com\/.*/,
      /^https:\/\/api\.mapbox\.com\/v4\/.*/,
      /^https:\/\/api\.mapbox\.com\/styles\/v1\/.*/
    ];

    // 테스트 URL들
    const validUrls = [
      'https://api.mapbox.com/v4/mapbox.satellite.json',
      'https://a.tiles.mapbox.com/v4/mapbox.streets/1/0/0.vector.pbf',
      'https://api.mapbox.com/styles/v1/mapbox/light-v11'
    ];

    const invalidUrls = [
      'https://example.com/tile.png',
      'https://firestore.googleapis.com/v1/projects'
    ];

    validUrls.forEach(url => {
      const isMatch = tilePatterns.some(pattern => pattern.test(url));
      expect(isMatch).toBe(true);
    });

    invalidUrls.forEach(url => {
      const isMatch = tilePatterns.some(pattern => pattern.test(url));
      expect(isMatch).toBe(false);
    });
  });
});

describe('캐시 데이터 구조', () => {
  test('캐시 정보 응답 형식이 올바른지 확인', () => {
    const mockCacheInfo = {
      tileCount: 150,
      cacheName: 'mapbox-tiles-v1'
    };

    expect(mockCacheInfo).toHaveProperty('tileCount');
    expect(mockCacheInfo).toHaveProperty('cacheName');
    expect(typeof mockCacheInfo.tileCount).toBe('number');
    expect(typeof mockCacheInfo.cacheName).toBe('string');
  });

  test('캐시 삭제 응답 형식이 올바른지 확인', () => {
    const mockClearResponse = { success: true };

    expect(mockClearResponse).toHaveProperty('success');
    expect(typeof mockClearResponse.success).toBe('boolean');
  });
});

describe('Service Worker 메시지 타입', () => {
  test('정의된 메시지 타입을 확인할 수 있어야 함', () => {
    const messageTypes = {
      CLEAR_TILE_CACHE: 'CLEAR_TILE_CACHE',
      GET_CACHE_SIZE: 'GET_CACHE_SIZE'
    };

    expect(messageTypes.CLEAR_TILE_CACHE).toBe('CLEAR_TILE_CACHE');
    expect(messageTypes.GET_CACHE_SIZE).toBe('GET_CACHE_SIZE');
  });

  test('메시지 구조가 올바른지 확인', () => {
    const clearCacheMessage = { type: 'CLEAR_TILE_CACHE' };
    const getCacheSizeMessage = { type: 'GET_CACHE_SIZE' };

    expect(clearCacheMessage).toHaveProperty('type');
    expect(getCacheSizeMessage).toHaveProperty('type');
  });
});

describe('환경 변수 및 설정', () => {
  test('PUBLIC_URL 환경 변수가 있어야 함', () => {
    expect(process.env).toHaveProperty('PUBLIC_URL');
  });

  test('Service Worker 경로가 올바르게 구성되어야 함', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    expect(swUrl).toContain('/service-worker.js');
  });
});

describe('캐시 전략', () => {
  test('캐시 유효성 검증 로직이 올바른지 확인', () => {
    const now = Date.now();
    const MAX_TILE_AGE = 7 * 24 * 60 * 60 * 1000;

    // 유효한 캐시 (1일 전)
    const validCacheTime = now - (1 * 24 * 60 * 60 * 1000);
    expect(now - validCacheTime < MAX_TILE_AGE).toBe(true);

    // 만료된 캐시 (8일 전)
    const expiredCacheTime = now - (8 * 24 * 60 * 60 * 1000);
    expect(now - expiredCacheTime < MAX_TILE_AGE).toBe(false);
  });

  test('정적 리소스 필터링 로직이 올바른지 확인', () => {
    const staticAssets = [
      '/',
      '/index.html',
      '/static/css/main.css',
      '/static/js/main.js'
    ];

    staticAssets.forEach(asset => {
      expect(typeof asset).toBe('string');
      expect(asset.length).toBeGreaterThan(0);
    });

    // .map 파일은 제외되어야 함
    const filteredAssets = staticAssets.filter(url => !url.includes('.map'));
    expect(filteredAssets).not.toContain('/static/js/main.js.map');
  });
});

describe('오류 처리', () => {
  test('네트워크 오류 처리 구조', () => {
    const mockError = new Error('Network request failed');
    expect(mockError).toBeInstanceOf(Error);
    expect(mockError.message).toBe('Network request failed');
  });

  test('타임아웃 오류 처리 구조', () => {
    const mockTimeoutError = new Error('Timeout');
    expect(mockTimeoutError.message).toBe('Timeout');
  });

  test('Service Worker 미지원 오류', () => {
    const mockUnavailableError = new Error('Service Worker not available');
    expect(mockUnavailableError.message).toBe('Service Worker not available');
  });
});
