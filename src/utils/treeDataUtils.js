// src/utils/treeDataUtils.js
// Utility functions for tree data formatting and validation

export const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  return Math.round(num).toLocaleString();
};

export const formatKRW = (amount) => {
  if (!amount || amount === 0) return '0원';
  return `${formatNumber(amount)}원`;
};

export const hasValidData = (value) => {
  return value != null && value !== 0 && value !== '' && !isNaN(value) && value > 0;
};

export const getTreeType = (type) => {
  switch(type) {
    case 'protected': return '보호수';
    case 'roadside': return '가로수';
    case 'park': return '공원수목';
    default: return type;
  }
};

export const hasBenefitsData = (treeData) => {
  return treeData && (
    treeData.total_annual_value_krw ||
    treeData.stormwater_liters_year ||
    treeData.energy_kwh_year ||
    treeData.air_pollution_kg_year ||
    treeData.carbon_storage_kg_year
  );
};

export const getBenefitsArray = (treeData) => {
  if (!treeData) return [];

  return [
    {
      key: 'stormwater',
      label: '빗물 흡수',
      value: treeData.stormwater_liters_year,
      valueLabel: `${formatNumber(treeData.stormwater_liters_year)}L`,
      krw: treeData.stormwater_value_krw_year
    },
    {
      key: 'energy',
      label: '에너지 절약',
      value: treeData.energy_kwh_year,
      valueLabel: `${formatNumber(treeData.energy_kwh_year)}kWh`,
      krw: treeData.energy_value_krw_year
    },
    {
      key: 'air',
      label: '대기 정화',
      value: treeData.air_pollution_kg_year,
      valueLabel: `${formatNumber(treeData.air_pollution_kg_year * 1000)}g`,
      krw: treeData.air_pollution_value_krw_year
    },
    {
      key: 'carbon',
      label: '탄소 흡수',
      value: treeData.carbon_storage_kg_year,
      valueLabel: `${formatNumber(treeData.carbon_storage_kg_year)}kg`,
      krw: treeData.carbon_value_krw_year
    }
  ].filter(benefit => hasValidData(benefit.value));
};
