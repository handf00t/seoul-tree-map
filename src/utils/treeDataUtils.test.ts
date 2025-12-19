// src/utils/treeDataUtils.test.ts
import {
  formatNumber,
  formatKRW,
  hasValidData,
  getTreeType,
  hasBenefitsData,
  getBenefitsArray
} from './treeDataUtils';

describe('treeDataUtils', () => {
  describe('formatNumber', () => {
    it('should format positive numbers with locale string', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should round floating point numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,235');
      expect(formatNumber(1234.4)).toBe('1,234');
    });

    it('should return "0" for zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should return "0" for null or undefined', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(5)).toBe('5');
      expect(formatNumber(99)).toBe('99');
    });
  });

  describe('formatKRW', () => {
    it('should format amount with Korean currency by default', () => {
      expect(formatKRW(10000)).toBe('10,000원');
      expect(formatKRW(1234567)).toBe('1,234,567원');
    });

    it('should use KRW suffix for English', () => {
      expect(formatKRW(10000, 'en')).toBe('10,000 KRW');
    });

    it('should return "0원" for zero amount', () => {
      expect(formatKRW(0)).toBe('0원');
      expect(formatKRW(0, 'en')).toBe('0 KRW');
    });

    it('should return "0원" for null or undefined', () => {
      expect(formatKRW(null)).toBe('0원');
      expect(formatKRW(undefined, 'ko')).toBe('0원');
    });
  });

  describe('hasValidData', () => {
    it('should return true for positive numbers', () => {
      expect(hasValidData(1)).toBe(true);
      expect(hasValidData(100)).toBe(true);
      expect(hasValidData(0.5)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(hasValidData(0)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(hasValidData(null)).toBe(false);
      expect(hasValidData(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasValidData('')).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(hasValidData(NaN)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(hasValidData(-1)).toBe(false);
      expect(hasValidData(-100)).toBe(false);
    });
  });

  describe('getTreeType', () => {
    it('should return Korean name for protected type', () => {
      expect(getTreeType('protected')).toBe('보호수');
    });

    it('should return Korean name for roadside type', () => {
      expect(getTreeType('roadside')).toBe('가로수');
    });

    it('should return Korean name for park type', () => {
      expect(getTreeType('park')).toBe('공원수목');
    });

    it('should return original value for unknown type', () => {
      expect(getTreeType('unknown')).toBe('unknown');
      expect(getTreeType('custom')).toBe('custom');
    });
  });

  describe('hasBenefitsData', () => {
    it('should return truthy if total_annual_value_krw exists', () => {
      expect(hasBenefitsData({ total_annual_value_krw: 10000 })).toBeTruthy();
    });

    it('should return truthy if stormwater_liters_year exists', () => {
      expect(hasBenefitsData({ stormwater_liters_year: 100 })).toBeTruthy();
    });

    it('should return truthy if energy_kwh_year exists', () => {
      expect(hasBenefitsData({ energy_kwh_year: 50 })).toBeTruthy();
    });

    it('should return truthy if air_pollution_kg_year exists', () => {
      expect(hasBenefitsData({ air_pollution_kg_year: 5 })).toBeTruthy();
    });

    it('should return truthy if carbon_storage_kg_year exists', () => {
      expect(hasBenefitsData({ carbon_storage_kg_year: 10 })).toBeTruthy();
    });

    it('should return falsy for null or undefined', () => {
      expect(hasBenefitsData(null)).toBeFalsy();
      expect(hasBenefitsData(undefined)).toBeFalsy();
    });

    it('should return falsy for empty object', () => {
      expect(hasBenefitsData({})).toBeFalsy();
    });

    it('should return falsy if all values are zero', () => {
      expect(hasBenefitsData({
        total_annual_value_krw: 0,
        stormwater_liters_year: 0
      })).toBeFalsy();
    });
  });

  describe('getBenefitsArray', () => {
    it('should return empty array for null data', () => {
      expect(getBenefitsArray(null)).toEqual([]);
    });

    it('should return benefits with valid data', () => {
      const treeData = {
        stormwater_liters_year: 1000,
        stormwater_value_krw_year: 5000,
        energy_kwh_year: 50,
        energy_value_krw_year: 10000
      };

      const benefits = getBenefitsArray(treeData);

      expect(benefits).toHaveLength(2);
      expect(benefits[0].key).toBe('stormwater');
      expect(benefits[0].valueLabel).toBe('1,000L');
      expect(benefits[1].key).toBe('energy');
      expect(benefits[1].valueLabel).toBe('50kWh');
    });

    it('should filter out invalid benefit values', () => {
      const treeData = {
        stormwater_liters_year: 1000,
        energy_kwh_year: 0, // invalid
        air_pollution_kg_year: null // invalid
      };

      const benefits = getBenefitsArray(treeData);

      expect(benefits).toHaveLength(1);
      expect(benefits[0].key).toBe('stormwater');
    });

    it('should convert air pollution from kg to g in label', () => {
      const treeData = {
        air_pollution_kg_year: 0.5,
        air_pollution_value_krw_year: 2000
      };

      const benefits = getBenefitsArray(treeData);

      expect(benefits[0].key).toBe('air');
      expect(benefits[0].valueLabel).toBe('500g');
    });

    it('should include all benefit types when all have valid data', () => {
      const treeData = {
        stormwater_liters_year: 1000,
        stormwater_value_krw_year: 5000,
        energy_kwh_year: 50,
        energy_value_krw_year: 10000,
        air_pollution_kg_year: 0.5,
        air_pollution_value_krw_year: 2000,
        carbon_storage_kg_year: 10,
        carbon_value_krw_year: 3000
      };

      const benefits = getBenefitsArray(treeData);

      expect(benefits).toHaveLength(4);
      expect(benefits.map(b => b.key)).toEqual(['stormwater', 'energy', 'air', 'carbon']);
    });
  });
});
