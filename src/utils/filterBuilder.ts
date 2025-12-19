// utils/filterBuilder.ts - 지도 필터 로직 통합
import { TREE_LAYER_IDS } from '../constants';

type MapboxFilter = any[];

interface FilterOptions {
  species?: string[];
  sizes?: string[];
  favoriteIds?: string[];
}

interface SizeCategory {
  id: string;
  range: [number, number];
}

// 레이어 ID에서 트리 타입 추출
export const getLayerType = (layerId: string): string => {
  switch (layerId) {
    case 'protected-trees':
      return 'protected';
    case 'roadside-trees':
      return 'roadside';
    case 'park-trees':
      return 'park';
    default:
      return 'roadside';
  }
};

// 기본 레이어 타입 필터 생성
const buildLayerTypeFilter = (layerId: string): MapboxFilter => {
  return ['==', ['get', 'tree_type'], getLayerType(layerId)];
};

// 수종 필터 생성
const buildSpeciesFilter = (species: string[], totalSpeciesCount?: number): MapboxFilter | null => {
  if (!species || species.length === 0) return null;
  if (totalSpeciesCount && species.length >= totalSpeciesCount) return null;

  // '기타' 처리
  if (species.includes('기타')) {
    const mainSpecies = species.filter(s => s !== '기타');
    if (mainSpecies.length > 0) {
      return ['in', ['get', 'species_kr'], ['literal', mainSpecies]];
    }
    return null;
  }

  return ['in', ['get', 'species_kr'], ['literal', species]];
};

// 크기 필터 생성
const buildSizeFilter = (sizes: string[], sizeCategories: SizeCategory[]): MapboxFilter | null => {
  if (!sizes || sizes.length === 0) return null;
  if (sizes.length >= sizeCategories.length) return null;

  const sizeOrConditions: MapboxFilter[] = [];

  sizes.forEach(sizeId => {
    const sizeCategory = sizeCategories.find(s => s.id === sizeId);
    if (sizeCategory) {
      const [min, max] = sizeCategory.range;

      if (max === 999) {
        sizeOrConditions.push(['>=', ['get', 'dbh_cm'], min]);
      } else {
        sizeOrConditions.push([
          'all',
          ['>=', ['get', 'dbh_cm'], min],
          ['<', ['get', 'dbh_cm'], max]
        ]);
      }
    }
  });

  if (sizeOrConditions.length === 0) return null;
  if (sizeOrConditions.length === 1) return sizeOrConditions[0];
  return ['any', ...sizeOrConditions];
};

// 즐겨찾기 필터 생성
const buildFavoriteFilter = (favoriteIds: string[]): MapboxFilter | null => {
  if (!favoriteIds || favoriteIds.length === 0) return null;
  return ['in', ['get', 'source_id'], ['literal', favoriteIds]];
};

// 레이어별 필터 빌드
export const buildLayerFilter = (
  layerId: string,
  options: FilterOptions,
  sizeCategories?: SizeCategory[],
  totalSpeciesCount?: number
): MapboxFilter => {
  const conditions: MapboxFilter[] = [];

  // 레이어 타입 필터 (항상 포함)
  conditions.push(buildLayerTypeFilter(layerId));

  // 수종 필터
  if (options.species) {
    const speciesFilter = buildSpeciesFilter(options.species, totalSpeciesCount);
    if (speciesFilter) conditions.push(speciesFilter);
  }

  // 크기 필터
  if (options.sizes && sizeCategories) {
    const sizeFilter = buildSizeFilter(options.sizes, sizeCategories);
    if (sizeFilter) conditions.push(sizeFilter);
  }

  // 즐겨찾기 필터
  if (options.favoriteIds) {
    const favoriteFilter = buildFavoriteFilter(options.favoriteIds);
    if (favoriteFilter) conditions.push(favoriteFilter);
  }

  // 조건 결합
  if (conditions.length === 1) {
    return conditions[0];
  }
  return ['all', ...conditions];
};

// 모든 레이어에 필터 적용
export const applyFiltersToMap = (
  map: any,
  options: FilterOptions,
  sizeCategories?: SizeCategory[],
  totalSpeciesCount?: number
): void => {
  if (!map) return;

  TREE_LAYER_IDS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      const filter = buildLayerFilter(layerId, options, sizeCategories, totalSpeciesCount);
      map.setFilter(layerId, filter);
    }
  });
};

// 필터 초기화 (레이어 타입 필터만 유지)
export const clearFilters = (map: any): void => {
  if (!map) return;

  TREE_LAYER_IDS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, buildLayerTypeFilter(layerId));
    }
  });
};
