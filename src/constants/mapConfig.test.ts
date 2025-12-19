// src/constants/mapConfig.test.ts
import {
  SEOUL_CENTER,
  SEOUL_BBOX,
  MAP_ZOOM,
  MAP_ANIMATION,
  MAP_STYLES,
  TREE_LAYERS,
  TREE_LAYER_IDS,
  TREE_COLORS,
  TREE_CIRCLE_RADIUS
} from './mapConfig';

describe('mapConfig constants', () => {
  describe('SEOUL_CENTER', () => {
    it('should have valid longitude and latitude for Seoul', () => {
      expect(SEOUL_CENTER.lng).toBeCloseTo(126.978, 2);
      expect(SEOUL_CENTER.lat).toBeCloseTo(37.5665, 2);
    });

    it('should be within valid coordinate ranges', () => {
      expect(SEOUL_CENTER.lng).toBeGreaterThanOrEqual(-180);
      expect(SEOUL_CENTER.lng).toBeLessThanOrEqual(180);
      expect(SEOUL_CENTER.lat).toBeGreaterThanOrEqual(-90);
      expect(SEOUL_CENTER.lat).toBeLessThanOrEqual(90);
    });
  });

  describe('SEOUL_BBOX', () => {
    it('should have 4 values for bounding box', () => {
      expect(SEOUL_BBOX).toHaveLength(4);
    });

    it('should have valid bbox format [minLng, minLat, maxLng, maxLat]', () => {
      const [minLng, minLat, maxLng, maxLat] = SEOUL_BBOX;
      expect(minLng).toBeLessThan(maxLng);
      expect(minLat).toBeLessThan(maxLat);
    });

    it('should contain Seoul center point', () => {
      const [minLng, minLat, maxLng, maxLat] = SEOUL_BBOX;
      expect(SEOUL_CENTER.lng).toBeGreaterThan(minLng);
      expect(SEOUL_CENTER.lng).toBeLessThan(maxLng);
      expect(SEOUL_CENTER.lat).toBeGreaterThan(minLat);
      expect(SEOUL_CENTER.lat).toBeLessThan(maxLat);
    });
  });

  describe('MAP_ZOOM', () => {
    it('should have all required zoom levels', () => {
      expect(MAP_ZOOM.DEFAULT).toBeDefined();
      expect(MAP_ZOOM.SEARCH_RESULT).toBeDefined();
      expect(MAP_ZOOM.TREE_DETAIL).toBeDefined();
      expect(MAP_ZOOM.MIN).toBeDefined();
      expect(MAP_ZOOM.MAX).toBeDefined();
    });

    it('should have valid zoom level ranges', () => {
      expect(MAP_ZOOM.MIN).toBeLessThan(MAP_ZOOM.MAX);
      expect(MAP_ZOOM.DEFAULT).toBeGreaterThanOrEqual(MAP_ZOOM.MIN);
      expect(MAP_ZOOM.DEFAULT).toBeLessThanOrEqual(MAP_ZOOM.MAX);
    });

    it('should have search result zoom higher than default', () => {
      expect(MAP_ZOOM.SEARCH_RESULT).toBeGreaterThan(MAP_ZOOM.DEFAULT);
    });

    it('should have tree detail zoom be the highest', () => {
      expect(MAP_ZOOM.TREE_DETAIL).toBeGreaterThanOrEqual(MAP_ZOOM.SEARCH_RESULT);
    });
  });

  describe('MAP_ANIMATION', () => {
    it('should have all animation types', () => {
      expect(MAP_ANIMATION.SEARCH).toBeDefined();
      expect(MAP_ANIMATION.TREE_SELECT).toBeDefined();
      expect(MAP_ANIMATION.FLY_TO).toBeDefined();
    });

    it('should have positive duration values', () => {
      expect(MAP_ANIMATION.SEARCH.duration).toBeGreaterThan(0);
      expect(MAP_ANIMATION.TREE_SELECT.duration).toBeGreaterThan(0);
      expect(MAP_ANIMATION.FLY_TO.duration).toBeGreaterThan(0);
    });
  });

  describe('MAP_STYLES', () => {
    it('should have valid Mapbox style URLs', () => {
      expect(MAP_STYLES.LIGHT).toMatch(/^mapbox:\/\/styles\//);
      expect(MAP_STYLES.DARK).toMatch(/^mapbox:\/\/styles\//);
      expect(MAP_STYLES.SATELLITE).toMatch(/^mapbox:\/\/styles\//);
    });
  });

  describe('TREE_LAYERS', () => {
    it('should have all tree layer types', () => {
      expect(TREE_LAYERS.PROTECTED).toBe('protected-trees');
      expect(TREE_LAYERS.ROADSIDE).toBe('roadside-trees');
      expect(TREE_LAYERS.PARK).toBe('park-trees');
    });
  });

  describe('TREE_LAYER_IDS', () => {
    it('should be an array of layer IDs', () => {
      expect(Array.isArray(TREE_LAYER_IDS)).toBe(true);
      expect(TREE_LAYER_IDS).toHaveLength(3);
    });

    it('should contain all layer values', () => {
      expect(TREE_LAYER_IDS).toContain('protected-trees');
      expect(TREE_LAYER_IDS).toContain('roadside-trees');
      expect(TREE_LAYER_IDS).toContain('park-trees');
    });

    it('should match Object.values of TREE_LAYERS', () => {
      expect(TREE_LAYER_IDS).toEqual(Object.values(TREE_LAYERS));
    });
  });

  describe('TREE_COLORS', () => {
    it('should have colors for all tree types', () => {
      expect(TREE_COLORS.protected).toBeDefined();
      expect(TREE_COLORS.roadside).toBeDefined();
      expect(TREE_COLORS.park).toBeDefined();
    });

    it('should have valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(TREE_COLORS.protected).toMatch(hexColorRegex);
      expect(TREE_COLORS.roadside).toMatch(hexColorRegex);
      expect(TREE_COLORS.park).toMatch(hexColorRegex);
    });
  });

  describe('TREE_CIRCLE_RADIUS', () => {
    it('should have all size categories', () => {
      expect(TREE_CIRCLE_RADIUS.small).toBeDefined();
      expect(TREE_CIRCLE_RADIUS.medium).toBeDefined();
      expect(TREE_CIRCLE_RADIUS.large).toBeDefined();
      expect(TREE_CIRCLE_RADIUS.default).toBeDefined();
    });

    it('should have increasing size values', () => {
      expect(TREE_CIRCLE_RADIUS.small).toBeLessThan(TREE_CIRCLE_RADIUS.medium);
      expect(TREE_CIRCLE_RADIUS.medium).toBeLessThan(TREE_CIRCLE_RADIUS.large);
    });
  });
});
