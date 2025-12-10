// src/components/Popup/TreePopup/BenefitsSection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

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
              {t('tree.annualBenefits')} {treeData.benefits?.total_annual_value_krw ? formatKRW(treeData.benefits.total_annual_value_krw, i18n.language) : t('tree.unknownSpecies')}
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
                label={t('benefits.stormwater')}
                valueLabel={`${formatNumber(treeData.benefits.stormwater_liters_year!)}L`}
                krwValue={treeData.benefits.stormwater_value_krw_year}
                language={i18n.language}
              />
            )}

            {hasValidData(treeData.benefits.energy_kwh_year) && (
              <BenefitItem
                label={t('benefits.energy')}
                valueLabel={`${formatNumber(treeData.benefits.energy_kwh_year!)}kWh`}
                krwValue={treeData.benefits.energy_value_krw_year}
                language={i18n.language}
              />
            )}

            {hasValidData(treeData.benefits.air_pollution_kg_year) && (
              <BenefitItem
                label={t('benefits.airPollution')}
                valueLabel={`${formatNumber(treeData.benefits.air_pollution_kg_year! * 1000)}g`}
                krwValue={treeData.benefits.air_pollution_value_krw_year}
                language={i18n.language}
              />
            )}

            {hasValidData(treeData.benefits.carbon_storage_kg_year) && (
              <BenefitItem
                label={t('benefits.carbonStorage')}
                valueLabel={`${formatNumber(treeData.benefits.carbon_storage_kg_year!)}kg`}
                krwValue={treeData.benefits.carbon_value_krw_year}
                language={i18n.language}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BenefitsSection;
