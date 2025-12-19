// 지도 관련 상수

// 서울 중심 좌표
export const SEOUL_CENTER = {
  lng: 126.9780,
  lat: 37.5665
} as const;

// 서울 경계 박스
export const SEOUL_BBOX = [126.734, 37.428, 127.269, 37.701] as const;

// 줌 레벨
export const MAP_ZOOM = {
  DEFAULT: 11,
  SEARCH_RESULT: 15,
  TREE_DETAIL: 16,
  MIN: 9,
  MAX: 18
} as const;

// 애니메이션 설정
export const MAP_ANIMATION = {
  SEARCH: { duration: 2000 },
  TREE_SELECT: { duration: 1500 },
  FLY_TO: { duration: 1500 }
} as const;

// 지도 스타일
export const MAP_STYLES = {
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9'
} as const;

// 나무 레이어
export const TREE_LAYERS = {
  PROTECTED: 'protected-trees',
  ROADSIDE: 'roadside-trees',
  PARK: 'park-trees'
} as const;

export const TREE_LAYER_IDS = Object.values(TREE_LAYERS);

// 나무 타입별 색상
export const TREE_COLORS = {
  protected: '#22C55E',  // 보호수 - 초록
  roadside: '#3B82F6',   // 가로수 - 파랑
  park: '#F59E0B'        // 공원수 - 주황
} as const;

// 나무 크기별 원 크기
export const TREE_CIRCLE_RADIUS = {
  small: 4,
  medium: 6,
  large: 8,
  default: 5
} as const;
