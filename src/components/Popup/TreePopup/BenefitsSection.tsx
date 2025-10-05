// src/components/Popup/TreePopup/BenefitsSection.tsx
import React from 'react';
import BenefitItem from './BenefitItem';
import { formatNumber, formatKRW, hasValidData } from '../../../utils/treeDataUtils';
import { TreeData } from '../../../types';

interface BenefitsSectionProps {
  treeData: TreeData;
  showBenefits: boolean;
  onToggle: () => void;
  hasBenefitsData: boolean;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ treeData, showBenefits, onToggle, hasBenefitsData }) => {
  return (
    <>
      {hasBenefitsData && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={onToggle}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: showBenefits ? 'var(--primary)' : 'var(--surface-variant)',
              color: showBenefits ? 'var(--surface)' : 'var(--text-primary)',
              border: showBenefits ? 'none' : '1px solid var(--outline)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <span>
              연간 생태적 편익 {treeData.benefits?.total_annual_value_krw ? formatKRW(treeData.benefits.total_annual_value_krw) : '정보 없음'}
            </span>
            <span className="material-icons" style={{
              transform: showBenefits ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              fontSize: '12px'
            }}>
              expand_more
            </span>
          </button>
        </div>
      )}

      {showBenefits && hasBenefitsData && treeData.benefits && (
        <div style={{
          background: 'var(--primary-surface)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid var(--primary-border)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hasValidData(treeData.benefits.stormwater_liters_year) && (
              <BenefitItem
                label="빗물 흡수"
                valueLabel={`${formatNumber(treeData.benefits.stormwater_liters_year!)}L`}
                krwValue={treeData.benefits.stormwater_value_krw_year}
              />
            )}

            {hasValidData(treeData.benefits.energy_kwh_year) && (
              <BenefitItem
                label="에너지 절약"
                valueLabel={`${formatNumber(treeData.benefits.energy_kwh_year!)}kWh`}
                krwValue={treeData.benefits.energy_value_krw_year}
              />
            )}

            {hasValidData(treeData.benefits.air_pollution_kg_year) && (
              <BenefitItem
                label="대기 정화"
                valueLabel={`${formatNumber(treeData.benefits.air_pollution_kg_year! * 1000)}g`}
                krwValue={treeData.benefits.air_pollution_value_krw_year}
              />
            )}

            {hasValidData(treeData.benefits.carbon_storage_kg_year) && (
              <BenefitItem
                label="탄소 흡수"
                valueLabel={`${formatNumber(treeData.benefits.carbon_storage_kg_year!)}kg`}
                krwValue={treeData.benefits.carbon_value_krw_year}
              />
            )}
          </div>

          <div style={{
            padding: '12px',
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            background: 'var(--overlay-light)',
            borderRadius: '6px',
            border: '1px solid var(--primary-border)'
          }}>
            <strong>편익 산정 기준:</strong> 한국 기후조건, 산림청 공익기능 평가 기준,
            환경부 대기오염 피해비용, K-ETS 탄소가격 등을 반영하여 계산된 연간 추정값입니다.
          </div>
        </div>
      )}
    </>
  );
};

export default BenefitsSection;
