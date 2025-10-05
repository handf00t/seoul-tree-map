// src/utils/mapFilters.ts
// Centralized map filter logic to avoid duplication

import { Map } from 'mapbox-gl';

const TREE_LAYERS = ['protected-trees', 'roadside-trees', 'park-trees'];

const getLayerType = (layerId: string): string => {
  if (layerId === 'protected-trees') return 'protected';
  if (layerId === 'roadside-trees') return 'roadside';
  return 'park';
};

const getOriginalFilter = (layerId: string): any[] => {
  return ['==', 'tree_type', getLayerType(layerId)];
};

interface MapFilters {
  species?: string[];
  sizes?: string[];
  userFilter?: any;
}

/**
 * Clear all filters and reset to original state
 */
export const clearMapFilters = (map: Map | null): void => {
  if (!map) return;

  TREE_LAYERS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, getOriginalFilter(layerId));
    }
  });
};

/**
 * Apply filters to map layers
 */
export const applyMapFilters = (map: Map | null, filters: MapFilters): void => {
  if (!map) return;

  const { species = [], sizes = [], userFilter = null } = filters;

  TREE_LAYERS.forEach(layerId => {
    if (!map.getLayer(layerId)) return;

    const layerType = getLayerType(layerId);
    const baseFilter = ['==', 'tree_type', layerType];
    const filterConditions: any[] = [baseFilter];

    // Add species filter
    if (species.length > 0) {
      filterConditions.push(['in', 'species_kr', ...species]);
    }

    // Add size filter
    if (sizes.length > 0) {
      const sizeConditions = sizes.map(size => {
        switch(size) {
          case 'small':
            return ['<', 'diameter_cm', 15];
          case 'medium-small':
            return ['all', ['>=', 'diameter_cm', 15], ['<', 'diameter_cm', 30]];
          case 'medium':
            return ['all', ['>=', 'diameter_cm', 30], ['<', 'diameter_cm', 50]];
          case 'medium-large':
            return ['all', ['>=', 'diameter_cm', 50], ['<', 'diameter_cm', 80]];
          case 'large':
            return ['>=', 'diameter_cm', 80];
          default:
            return null;
        }
      }).filter(Boolean);

      if (sizeConditions.length > 0) {
        filterConditions.push(['any', ...sizeConditions]);
      }
    }

    // Add user-specific filter (favorites)
    if (userFilter) {
      filterConditions.push(userFilter);
    }

    const finalFilter = filterConditions.length > 1
      ? ['all', ...filterConditions]
      : baseFilter;

    map.setFilter(layerId, finalFilter);
  });
};

/**
 * Apply user favorites filter (My Trees)
 */
export const applyFavoritesFilter = (map: Map | null, favoriteIds: string[]): void => {
  if (!map || !favoriteIds || favoriteIds.length === 0) {
    clearMapFilters(map);
    return;
  }

  TREE_LAYERS.forEach(layerId => {
    if (!map.getLayer(layerId)) return;

    const layerType = getLayerType(layerId);
    const filter = [
      'all',
      ['==', 'tree_type', layerType],
      ['in', 'source_id', ...favoriteIds]
    ];

    map.setFilter(layerId, filter);
  });
};

/**
 * Get layer IDs
 */
export const getTreeLayers = (): string[] => TREE_LAYERS;
