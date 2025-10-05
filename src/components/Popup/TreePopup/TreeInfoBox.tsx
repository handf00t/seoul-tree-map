// src/components/Popup/TreePopup/TreeInfoBox.tsx
import React from 'react';
import { hasValidData } from '../../../utils/treeDataUtils';
import { TreeData } from '../../../types';

interface TreeInfoBoxProps {
  treeData: TreeData;
}

const TreeInfoBox: React.FC<TreeInfoBoxProps> = ({ treeData }) => {
  const hasAnyInfo = hasValidData(treeData.height_m) ||
                     hasValidData(treeData.dbh_cm) ||
                     treeData.source_id;

  if (!hasAnyInfo) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      padding: '16px',
      background: 'var(--primary-surface)',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '14px',
      border: '1px solid var(--primary-border)'
    }}>
      {hasValidData(treeData.height_m) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>높이</span>
          <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
            {Math.round(treeData.height_m!)}m
          </span>
        </div>
      )}
      {hasValidData(treeData.dbh_cm) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>직경</span>
          <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
            {Math.round(treeData.dbh_cm!)}cm
          </span>
        </div>
      )}
      {treeData.source_id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>나무번호</span>
          <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
            {treeData.source_id}
          </span>
        </div>
      )}
    </div>
  );
};

export default TreeInfoBox;
