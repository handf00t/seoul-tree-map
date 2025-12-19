// UI 관련 상수

// 드래그 임계값
export const DRAG_THRESHOLD = {
  POPUP: 50,
  PANEL: 50
} as const;

// 팝업 높이
export const POPUP_HEIGHT = {
  MINIMIZED: 180,
  MINIMIZED_MARKER: 10,
  EXPANDED: 'calc(85vh)'
} as const;

// 패널 위치
export const PANEL_POSITION = {
  HIDDEN: '-400px',
  VISIBLE: '0'
} as const;

// 타이밍 (ms)
export const TIMING = {
  DEBOUNCE_SEARCH: 300,
  MAP_QUERY_DELAY: 1600,
  TOAST_DURATION: 2000
} as const;

// 브레이크포인트
export const BREAKPOINT = {
  MOBILE: 768,
  TABLET: 1024
} as const;
