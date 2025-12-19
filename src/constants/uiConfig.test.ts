// src/constants/uiConfig.test.ts
import {
  DRAG_THRESHOLD,
  POPUP_HEIGHT,
  PANEL_POSITION,
  TIMING,
  BREAKPOINT
} from './uiConfig';

describe('uiConfig constants', () => {
  describe('DRAG_THRESHOLD', () => {
    it('should have thresholds for popup and panel', () => {
      expect(DRAG_THRESHOLD.POPUP).toBeDefined();
      expect(DRAG_THRESHOLD.PANEL).toBeDefined();
    });

    it('should have positive threshold values', () => {
      expect(DRAG_THRESHOLD.POPUP).toBeGreaterThan(0);
      expect(DRAG_THRESHOLD.PANEL).toBeGreaterThan(0);
    });

    it('should have reasonable threshold values (10-100px)', () => {
      expect(DRAG_THRESHOLD.POPUP).toBeGreaterThanOrEqual(10);
      expect(DRAG_THRESHOLD.POPUP).toBeLessThanOrEqual(100);
      expect(DRAG_THRESHOLD.PANEL).toBeGreaterThanOrEqual(10);
      expect(DRAG_THRESHOLD.PANEL).toBeLessThanOrEqual(100);
    });
  });

  describe('POPUP_HEIGHT', () => {
    it('should have minimized and expanded heights', () => {
      expect(POPUP_HEIGHT.MINIMIZED).toBeDefined();
      expect(POPUP_HEIGHT.EXPANDED).toBeDefined();
    });

    it('should have minimized height as a number', () => {
      expect(typeof POPUP_HEIGHT.MINIMIZED).toBe('number');
      expect(POPUP_HEIGHT.MINIMIZED).toBeGreaterThan(0);
    });

    it('should have expanded height as a CSS calc string', () => {
      expect(typeof POPUP_HEIGHT.EXPANDED).toBe('string');
      expect(POPUP_HEIGHT.EXPANDED).toMatch(/calc\(/);
    });

    it('should have minimized marker offset', () => {
      expect(POPUP_HEIGHT.MINIMIZED_MARKER).toBeDefined();
      expect(typeof POPUP_HEIGHT.MINIMIZED_MARKER).toBe('number');
    });
  });

  describe('PANEL_POSITION', () => {
    it('should have hidden and visible positions', () => {
      expect(PANEL_POSITION.HIDDEN).toBeDefined();
      expect(PANEL_POSITION.VISIBLE).toBeDefined();
    });

    it('should have hidden position as negative value', () => {
      expect(PANEL_POSITION.HIDDEN).toMatch(/^-\d+px$/);
    });

    it('should have visible position as zero', () => {
      expect(PANEL_POSITION.VISIBLE).toBe('0');
    });
  });

  describe('TIMING', () => {
    it('should have all timing constants', () => {
      expect(TIMING.DEBOUNCE_SEARCH).toBeDefined();
      expect(TIMING.MAP_QUERY_DELAY).toBeDefined();
      expect(TIMING.TOAST_DURATION).toBeDefined();
    });

    it('should have positive timing values', () => {
      expect(TIMING.DEBOUNCE_SEARCH).toBeGreaterThan(0);
      expect(TIMING.MAP_QUERY_DELAY).toBeGreaterThan(0);
      expect(TIMING.TOAST_DURATION).toBeGreaterThan(0);
    });

    it('should have debounce shorter than query delay', () => {
      expect(TIMING.DEBOUNCE_SEARCH).toBeLessThan(TIMING.MAP_QUERY_DELAY);
    });

    it('should have reasonable debounce time (100-500ms)', () => {
      expect(TIMING.DEBOUNCE_SEARCH).toBeGreaterThanOrEqual(100);
      expect(TIMING.DEBOUNCE_SEARCH).toBeLessThanOrEqual(500);
    });

    it('should have toast duration of at least 1 second', () => {
      expect(TIMING.TOAST_DURATION).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('BREAKPOINT', () => {
    it('should have mobile and tablet breakpoints', () => {
      expect(BREAKPOINT.MOBILE).toBeDefined();
      expect(BREAKPOINT.TABLET).toBeDefined();
    });

    it('should have mobile breakpoint smaller than tablet', () => {
      expect(BREAKPOINT.MOBILE).toBeLessThan(BREAKPOINT.TABLET);
    });

    it('should have common breakpoint values', () => {
      // Mobile is typically 768px or less
      expect(BREAKPOINT.MOBILE).toBeLessThanOrEqual(768);
      expect(BREAKPOINT.MOBILE).toBeGreaterThan(0);

      // Tablet is typically around 1024px
      expect(BREAKPOINT.TABLET).toBeLessThanOrEqual(1280);
      expect(BREAKPOINT.TABLET).toBeGreaterThan(BREAKPOINT.MOBILE);
    });
  });
});
