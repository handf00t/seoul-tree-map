// src/components/Popup/TreePopup/TabMenu.tsx
import React from 'react';

type TabType = 'info' | 'visits';

interface TabMenuProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '2px solid var(--divider)',
      marginBottom: '16px'
    }}>
      <button
        onClick={() => onTabChange('info')}
        style={{
          flex: 1,
          padding: '12px',
          background: 'none',
          border: 'none',
          borderBottom: activeTab === 'info' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-tertiary)',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '-2px',
          transition: 'all 0.2s ease'
        }}
      >
        정보
      </button>
      <button
        onClick={() => onTabChange('visits')}
        style={{
          flex: 1,
          padding: '12px',
          background: 'none',
          border: 'none',
          borderBottom: activeTab === 'visits' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'visits' ? 'var(--primary)' : 'var(--text-tertiary)',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '-2px',
          transition: 'all 0.2s ease'
        }}
      >
        방문록
      </button>
    </div>
  );
};

export default TabMenu;
export type { TabType };
