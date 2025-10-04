// src/components/Popup/TreePopup/BenefitItem.jsx
import { formatKRW, hasValidData } from '../../../utils/treeDataUtils';

const BenefitItem = ({ label, valueLabel, krwValue }) => {
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
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--primary-dark)'
        }}>
          {valueLabel}
        </div>
        {hasValidData(krwValue) && (
          <div style={{ fontSize: '12px', color: 'var(--primary-dark)' }}>
            {formatKRW(krwValue)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenefitItem;
