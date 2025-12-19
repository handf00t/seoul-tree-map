// src/utils/versionChecker.js
// 앱 버전을 체크하고 필요시 강제 새로고침

const VERSION_STORAGE_KEY = 'app_version';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5분마다 체크

/**
 * 서버의 현재 버전 정보를 가져옵니다
 */
async function fetchServerVersion() {
  try {
    // 캐시 방지를 위해 타임스탬프 추가
    const timestamp = new Date().getTime();
    const response = await fetch(`${process.env.PUBLIC_URL}/version.json?v=${timestamp}`);
    if (!response.ok) {
      throw new Error('Failed to fetch version');
    }
    return await response.json();
  } catch (error) {
    console.warn('Version check failed:', error);
    return null;
  }
}

/**
 * 로컬에 저장된 버전을 가져옵니다
 */
function getLocalVersion() {
  try {
    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

/**
 * 로컬에 버전을 저장합니다
 */
function setLocalVersion(versionInfo) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versionInfo));
  } catch (error) {
    console.warn('Failed to save version:', error);
  }
}

/**
 * 버전이 변경되었는지 확인합니다
 */
function hasVersionChanged(localVersion, serverVersion) {
  if (!localVersion) return true;
  return localVersion.version !== serverVersion.version;
}

/**
 * 앱을 강제 새로고침합니다
 */
function forceReload() {
  // 캐시를 완전히 비우고 새로고침
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  window.location.reload(true);
}

/**
 * 버전을 체크하고 필요시 업데이트합니다
 */
export async function checkVersion() {
  const serverVersion = await fetchServerVersion();
  if (!serverVersion) return;

  const localVersion = getLocalVersion();
  const versionChanged = hasVersionChanged(localVersion, serverVersion);

  // 버전 정보 저장 (알림 없이 조용히 업데이트)
  if (versionChanged) {
    console.log('New version detected:', serverVersion.version);
  }
  setLocalVersion(serverVersion);
}

/**
 * 주기적으로 버전을 체크합니다
 */
export function startVersionCheck() {
  // 초기 체크
  checkVersion();

  // 주기적 체크 시작
  const intervalId = setInterval(() => {
    checkVersion();
  }, VERSION_CHECK_INTERVAL);

  // 정리 함수 반환
  return () => clearInterval(intervalId);
}

/**
 * 수동으로 캐시를 클리어하고 새로고침합니다
 */
export function clearCacheAndReload() {
  localStorage.removeItem(VERSION_STORAGE_KEY);
  forceReload();
}
