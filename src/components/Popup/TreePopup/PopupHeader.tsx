// src/components/Popup/TreePopup/PopupHeader.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../../UI/IconButton';
import { TreeData, TreeType } from '../../../types';
import { getTreeLeafImage } from '../../../constants/treeImages';
import { getTreeSpeciesName } from '../../../utils/treeSpeciesTranslation';

interface PopupHeaderProps {
  treeData: TreeData;
  isMobile: boolean;
  isMinimized: boolean;
  onClose: () => void;
}

const PopupHeader: React.FC<PopupHeaderProps> = ({ treeData, isMobile, isMinimized, onClose }) => {
  const { t, i18n } = useTranslation();
  const leafImagePath = getTreeLeafImage(treeData.species_kr);

  const getTreeType = (type: TreeType): string => {
    switch(type) {
      case 'protected': return t('filter.protected');
      case 'roadside': return t('filter.roadside');
      case 'park': return t('filter.park');
      default: return type;
    }
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div style={{
        marginBottom: isMinimized ? '8px' : '16px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          {/* 왼쪽: 텍스트 정보 */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              marginBottom: '8px'
            }}>
              {getTreeSpeciesName(treeData.species_kr, i18n.language) || t('tree.unknownSpecies')}
            </h2>

            <div style={{
              fontSize: isMinimized ? '12px' : '14px',
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
                fontSize: '13px',
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

          {/* 오른쪽: 이미지와 닫기 버튼 */}
          {!isMinimized && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              {leafImagePath && (
                <img
                  src={leafImagePath}
                  alt={`${getTreeSpeciesName(treeData.species_kr, i18n.language)} ${t('common.close').toLowerCase()}`}
                  loading="lazy"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <IconButton
                icon="close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                variant="close"
                size="medium"
                ariaLabel={t('common.close')}
              />
            </div>
          )}

          {/* 최소화 상태일 때는 닫기 버튼만 */}
          {isMinimized && (
            <IconButton
              icon="close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              variant="close"
              size="medium"
              ariaLabel={t('common.close')}
            />
          )}
        </div>
      </div>
    );
  }

  // PC 레이아웃 - 이미지를 오른쪽에 크게 배치
  return (
    <div style={{
      marginBottom: '16px',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        {/* 왼쪽: 텍스트 정보 */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            marginBottom: '8px'
          }}>
            {getTreeSpeciesName(treeData.species_kr, i18n.language) || t('tree.unknownSpecies')}
          </h2>

          <div style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            {getTreeType(treeData.tree_type)}
          </div>

          <div style={{
            fontSize: '15px',
            color: 'var(--text-tertiary)',
            lineHeight: '1.5'
          }}>
            {treeData.borough}
            {treeData.district && ` ${treeData.district}`}
            {treeData.address && (
              <div style={{ marginTop: '4px' }}>
                {treeData.address}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 이미지와 닫기 버튼 */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          {leafImagePath && (
            <img
              src={leafImagePath}
              alt={`${getTreeSpeciesName(treeData.species_kr, i18n.language)} ${t('common.close').toLowerCase()}`}
              loading="lazy"
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'contain',
                flexShrink: 0
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <IconButton
            icon="close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            variant="close"
            size="medium"
            ariaLabel={t('common.close')}
          />
        </div>
      </div>
    </div>
  );
};

export default PopupHeader;
