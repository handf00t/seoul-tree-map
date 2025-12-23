// src/components/Popup/TreePopup/BenefitItem.tsx
import React from 'react';
import { formatKRW, hasValidData } from '../../../utils/treeDataUtils';

export interface BenefitItemProps {
  label: string;
  valueLabel: string;
  krwValue?: number;
  language?: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ label, valueLabel, krwValue, language = 'ko' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      background: 'var(--surface)',
      borderRadius: '6px',
      border: '1px solid var(--primary-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '17px',
          fontWeight: '600',
          color: 'var(--primary-dark)'
        }}>
          {valueLabel}
        </div>
        {hasValidData(krwValue) && (
          <div style={{ fontSize: '14px', color: 'var(--primary-dark)' }}>
            {formatKRW(krwValue!, language)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenefitItem;
