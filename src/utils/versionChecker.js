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
 * 사용자에게 업데이트 알림을 표시합니다
 */
function showUpdateNotification(onUpdate) {
  const shouldUpdate = window.confirm(
    '새로운 버전이 배포되었습니다.\n' +
    '최신 기능을 사용하려면 페이지를 새로고침해주세요.\n\n' +
    '지금 새로고침하시겠습니까?'
  );

  if (shouldUpdate) {
    if (onUpdate) onUpdate();
    forceReload();
  }
}

/**
 * 버전을 체크하고 필요시 업데이트합니다
 * @param {Object} options - 옵션
 * @param {boolean} options.silent - true면 자동 새로고침, false면 사용자에게 확인
 * @param {Function} options.onUpdate - 업데이트 전 실행할 콜백
 */
export async function checkVersion(options = {}) {
  const { silent = false, onUpdate } = options;

  const serverVersion = await fetchServerVersion();
  if (!serverVersion) return;

  const localVersion = getLocalVersion();
  const versionChanged = hasVersionChanged(localVersion, serverVersion);

  // 버전이 변경되었거나 강제 업데이트 플래그가 설정된 경우
  if (versionChanged || serverVersion.forceUpdate) {
    console.log('New version detected:', serverVersion.version);

    // 버전 정보 저장
    setLocalVersion(serverVersion);

    if (serverVersion.forceUpdate || silent) {
      // 강제 업데이트이거나 자동 모드면 바로 새로고침
      if (onUpdate) onUpdate();
      forceReload();
    } else if (versionChanged) {
      // 버전만 변경되었으면 사용자에게 확인
      showUpdateNotification(onUpdate);
    }
  } else {
    // 버전 변경 없음 - 로컬 버전만 업데이트
    setLocalVersion(serverVersion);
  }
}

/**
 * 주기적으로 버전을 체크합니다
 */
export function startVersionCheck(options = {}) {
  // 초기 체크
  checkVersion(options);

  // 주기적 체크 시작
  const intervalId = setInterval(() => {
    checkVersion(options);
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
