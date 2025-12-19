// src/utils/filterBuilder.test.ts
import {
  getLayerType,
  buildLayerFilter,
  applyFiltersToMap,
  clearFilters
} from './filterBuilder';

describe('filterBuilder utility', () => {
  describe('getLayerType', () => {
    it('should return correct type for protected-trees layer', () => {
      expect(getLayerType('protected-trees')).toBe('protected');
    });

    it('should return correct type for roadside-trees layer', () => {
      expect(getLayerType('roadside-trees')).toBe('roadside');
    });

    it('should return correct type for park-trees layer', () => {
      expect(getLayerType('park-trees')).toBe('park');
    });

    it('should return roadside as default for unknown layers', () => {
      expect(getLayerType('unknown-layer')).toBe('roadside');
    });
  });

  describe('buildLayerFilter', () => {
    it('should build basic layer type filter when no options provided', () => {
      const filter = buildLayerFilter('protected-trees', {});
      expect(filter).toEqual(['==', ['get', 'tree_type'], 'protected']);
    });

    it('should build filter with species', () => {
      const filter = buildLayerFilter('roadside-trees', {
        species: ['은행나무', '벚나무']
      }, undefined, 10);

      expect(filter).toEqual([
        'all',
        ['==', ['get', 'tree_type'], 'roadside'],
        ['in', ['get', 'species_kr'], ['literal', ['은행나무', '벚나무']]]
      ]);
    });

    it('should not add species filter when all species are selected', () => {
      const filter = buildLayerFilter('roadside-trees', {
        species: ['은행나무', '벚나무', '느티나무']
      }, undefined, 3); // totalSpeciesCount equals species.length

      expect(filter).toEqual(['==', ['get', 'tree_type'], 'roadside']);
    });

    it('should build filter with favoriteIds', () => {
      const filter = buildLayerFilter('park-trees', {
        favoriteIds: ['tree-1', 'tree-2']
      });

      expect(filter).toEqual([
        'all',
        ['==', ['get', 'tree_type'], 'park'],
        ['in', ['get', 'source_id'], ['literal', ['tree-1', 'tree-2']]]
      ]);
    });

    it('should build filter with size categories', () => {
      const sizeCategories = [
        { id: 'small', range: [0, 15] as [number, number] },
        { id: 'large', range: [80, 999] as [number, number] }
      ];

      const filter = buildLayerFilter('roadside-trees', {
        sizes: ['small']
      }, sizeCategories);

      expect(filter).toEqual([
        'all',
        ['==', ['get', 'tree_type'], 'roadside'],
        ['all', ['>=', ['get', 'dbh_cm'], 0], ['<', ['get', 'dbh_cm'], 15]]
      ]);
    });

    it('should handle large size (no upper bound)', () => {
      // Need multiple size categories so that selecting one doesn't trigger "all selected" logic
      const sizeCategories = [
        { id: 'small', range: [0, 15] as [number, number] },
        { id: 'large', range: [80, 999] as [number, number] }
      ];

      const filter = buildLayerFilter('roadside-trees', {
        sizes: ['large']
      }, sizeCategories);

      expect(filter).toEqual([
        'all',
        ['==', ['get', 'tree_type'], 'roadside'],
        ['>=', ['get', 'dbh_cm'], 80]
      ]);
    });

    it('should combine multiple size filters with "any"', () => {
      const sizeCategories = [
        { id: 'small', range: [0, 15] as [number, number] },
        { id: 'large', range: [80, 999] as [number, number] }
      ];

      const filter = buildLayerFilter('roadside-trees', {
        sizes: ['small', 'large']
      }, sizeCategories, undefined);

      // Should not add size filter since all sizes are selected
      expect(filter).toEqual(['==', ['get', 'tree_type'], 'roadside']);
    });

    it('should combine species and favoriteIds filters', () => {
      const filter = buildLayerFilter('protected-trees', {
        species: ['은행나무'],
        favoriteIds: ['tree-1']
      }, undefined, 10);

      expect(filter).toEqual([
        'all',
        ['==', ['get', 'tree_type'], 'protected'],
        ['in', ['get', 'species_kr'], ['literal', ['은행나무']]],
        ['in', ['get', 'source_id'], ['literal', ['tree-1']]]
      ]);
    });
  });

  describe('applyFiltersToMap', () => {
    it('should call setFilter on all tree layers', () => {
      const mockMap = {
        getLayer: jest.fn().mockReturnValue(true),
        setFilter: jest.fn()
      };

      applyFiltersToMap(mockMap, { species: ['은행나무'] }, undefined, 10);

      expect(mockMap.getLayer).toHaveBeenCalledTimes(3);
      expect(mockMap.setFilter).toHaveBeenCalledTimes(3);
      expect(mockMap.setFilter).toHaveBeenCalledWith('protected-trees', expect.any(Array));
      expect(mockMap.setFilter).toHaveBeenCalledWith('roadside-trees', expect.any(Array));
      expect(mockMap.setFilter).toHaveBeenCalledWith('park-trees', expect.any(Array));
    });

    it('should not call setFilter if layer does not exist', () => {
      const mockMap = {
        getLayer: jest.fn().mockReturnValue(false),
        setFilter: jest.fn()
      };

      applyFiltersToMap(mockMap, { species: ['은행나무'] });

      expect(mockMap.setFilter).not.toHaveBeenCalled();
    });

    it('should handle null map gracefully', () => {
      expect(() => applyFiltersToMap(null, {})).not.toThrow();
    });
  });

  describe('clearFilters', () => {
    it('should reset all layers to default type filter', () => {
      const mockMap = {
        getLayer: jest.fn().mockReturnValue(true),
        setFilter: jest.fn()
      };

      clearFilters(mockMap);

      expect(mockMap.setFilter).toHaveBeenCalledWith(
        'protected-trees',
        ['==', ['get', 'tree_type'], 'protected']
      );
      expect(mockMap.setFilter).toHaveBeenCalledWith(
        'roadside-trees',
        ['==', ['get', 'tree_type'], 'roadside']
      );
      expect(mockMap.setFilter).toHaveBeenCalledWith(
        'park-trees',
        ['==', ['get', 'tree_type'], 'park']
      );
    });

    it('should handle null map gracefully', () => {
      expect(() => clearFilters(null)).not.toThrow();
    });
  });
});
