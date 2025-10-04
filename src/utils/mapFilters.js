// src/utils/mapFilters.js
// Centralized map filter logic to avoid duplication

const TREE_LAYERS = ['protected-trees', 'roadside-trees', 'park-trees'];

const getLayerType = (layerId) => {
  if (layerId === 'protected-trees') return 'protected';
  if (layerId === 'roadside-trees') return 'roadside';
  return 'park';
};

const getOriginalFilter = (layerId) => {
  return ['==', 'tree_type', getLayerType(layerId)];
};

/**
 * Clear all filters and reset to original state
 * @param {mapboxgl.Map} map - Mapbox map instance
 */
export const clearMapFilters = (map) => {
  if (!map) return;

  TREE_LAYERS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, getOriginalFilter(layerId));
    }
  });
};

/**
 * Apply filters to map layers
 * @param {mapboxgl.Map} map - Mapbox map instance
 * @param {Object} filters - Filter configuration { species: [], sizes: [], userFilter?: object }
 */
export const applyMapFilters = (map, filters) => {
  if (!map) return;

  const { species = [], sizes = [], userFilter = null } = filters;

  TREE_LAYERS.forEach(layerId => {
    if (!map.getLayer(layerId)) return;

    const layerType = getLayerType(layerId);
    const baseFilter = ['==', 'tree_type', layerType];
    const filterConditions = [baseFilter];

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
 * @param {mapboxgl.Map} map - Mapbox map instance
 * @param {Array} favoriteIds - Array of favorite tree IDs
 */
export const applyFavoritesFilter = (map, favoriteIds) => {
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
 * @returns {Array} Array of tree layer IDs
 */
export const getTreeLayers = () => TREE_LAYERS;
