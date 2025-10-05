// src/constants/treeData.js
// 나무 관련 공통 상수 및 유틸리티

/**
 * 서울시 주요 수종 목록
 * 이름과 색상 정보를 포함
 */
export const availableSpecies = [
  { name: '은행나무', color: '#FFD700' },
  { name: '느티나무', color: '#228B22' },
  { name: '플라타너스', color: '#8FBC8F' },
  { name: '벚나무', color: '#FFB6C1' },
  { name: '단풍나무', color: '#FF4500' },
  { name: '소나무', color: '#006400' },
  { name: '회화나무', color: '#8B4513' },
  { name: '참나무', color: '#8B4513' },
  { name: '메타세쿼이아', color: '#228B22' },
  { name: '기타', color: '#4ECDC4' }
];

/**
 * DBH(직경) 크기별 분류
 */
export const sizeCategories = [
  { id: 'small', label: '소형 (15cm 미만)', range: [0, 15], color: '#90EE90' },
  { id: 'medium-small', label: '중소형 (15-30cm)', range: [15, 30], color: '#32CD32' },
  { id: 'medium', label: '중형 (30-50cm)', range: [30, 50], color: '#228B22' },
  { id: 'medium-large', label: '중대형 (50-80cm)', range: [50, 80], color: '#006400' },
  { id: 'large', label: '대형 (80cm 이상)', range: [80, 999], color: '#013220' }
];

/**
 * 수종별 색상 매핑
 */
export const speciesColors = {
  '은행나무': '#FFD700',
  '느티나무': '#228B22',
  '플라타너스': '#8FBC8F',
  '벚나무': '#FFB6C1',
  '단풍나무': '#FF4500',
  '소나무': '#006400',
  '회화나무': '#8B4513',
  '참나무': '#8B4513',
  '메타세쿼이아': '#228B22'
};

/**
 * 나무 타입별 색상 (fallback)
 */
export const treeTypeColors = {
  'protected': 'var(--tree-protected)',
  'roadside': 'var(--primary)',
  'park': 'var(--tree-park)'
};

/**
 * 나무의 색상을 반환 (수종 우선, 타입 fallback)
 * @param {Object} tree - 나무 데이터 (species_kr, tree_type 포함)
 * @returns {string} 색상 값
 */
export const getTreeColor = (tree) => {
  // 1순위: 수종별 색상
  if (tree?.species_kr && speciesColors[tree.species_kr]) {
    return speciesColors[tree.species_kr];
  }

  // 2순위: 타입별 색상
  if (tree?.tree_type && treeTypeColors[tree.tree_type]) {
    return treeTypeColors[tree.tree_type];
  }

  // 3순위: 기본 색상
  return '#84cc16';
};

/**
 * 나무 타입 한글명 반환
 * @param {string} type - 나무 타입 (protected, roadside, park)
 * @returns {string} 한글명
 */
export const getTreeTypeName = (type) => {
  const typeNames = {
    'protected': '보호수',
    'roadside': '가로수',
    'park': '공원수목'
  };
  return typeNames[type] || type;
};

/**
 * 크기 카테고리에 해당하는지 확인
 * @param {number} dbh - 나무 직경 (cm)
 * @param {string} categoryId - 크기 카테고리 ID
 * @returns {boolean}
 */
export const isInSizeCategory = (dbh, categoryId) => {
  const category = sizeCategories.find(c => c.id === categoryId);
  if (!category) return false;

  const [min, max] = category.range;
  return dbh >= min && dbh < max;
};

/**
 * DBH 값으로 크기 카테고리 찾기
 * @param {number} dbh - 나무 직경 (cm)
 * @returns {Object|null} 크기 카테고리
 */
export const getSizeCategory = (dbh) => {
  return sizeCategories.find(category => {
    const [min, max] = category.range;
    return dbh >= min && dbh < max;
  });
};
