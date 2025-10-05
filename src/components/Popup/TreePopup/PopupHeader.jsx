// src/components/Popup/TreePopup/PopupHeader.jsx
import IconButton from '../../UI/IconButton';

const getTreeType = (type) => {
  switch(type) {
    case 'protected': return '보호수';
    case 'roadside': return '가로수';
    case 'park': return '공원수목';
    default: return type;
  }
};

const PopupHeader = ({ treeData, isMobile, isMinimized, onClose }) => {
  return (
    <div style={{ marginBottom: isMinimized ? '8px' : '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isMinimized ? '4px' : '8px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: isMobile ? '22px' : '28px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          lineHeight: '1.2'
        }}>
          {treeData.species_kr || '미상'}
        </h2>

        <IconButton
          icon="close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          variant="close"
          size="medium"
          ariaLabel="닫기"
        />
      </div>

      <div style={{
        fontSize: isMinimized ? '12px' : (isMobile ? '14px' : '16px'),
        color: 'var(--text-secondary)',
        marginBottom: isMinimized ? '0' : '4px'
      }}>
        {getTreeType(treeData.tree_type)}
        {isMinimized && (
          <span style={{ marginLeft: '8px', color: 'var(--text-tertiary)' }}>
            {treeData.borough} {treeData.district}
          </span>
        )}
      </div>

      {!isMinimized && (
        <div style={{
          fontSize: isMobile ? '13px' : '15px',
          color: 'var(--text-tertiary)',
          lineHeight: '1.4'
        }}>
          {treeData.borough}
          {treeData.district && ` ${treeData.district}`}
          {treeData.address && (
            <div style={{ marginTop: '2px' }}>
              {treeData.address}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PopupHeader;
