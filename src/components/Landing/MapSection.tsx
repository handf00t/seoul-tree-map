// src/components/Landing/MapSection.tsx
// 지도를 포함한 메인 섹션 - 클릭하여 활성화 패턴
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface MapSectionProps {
  isMapActive: boolean;
  onActivate: () => void;
  children: React.ReactNode;
  popup?: React.ReactNode;  // TreePopup을 별도로 받음
}

const MapSection = forwardRef<HTMLDivElement, MapSectionProps>(({
  isMapActive,
  onActivate,
  children,
  popup
}, ref) => {
  const { t } = useTranslation();

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        height: 'calc(100vh - 180px)',  // 헤더 + Features 타이틀 공간 확보
        minHeight: '400px',
        maxHeight: '70vh',
        width: '100%',
        overflow: 'visible'  // TreePopup이 잘리지 않도록
      }}
    >
      {/* 지도 컨테이너 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: isMapActive ? 'auto' : 'none'
      }}>
        {children}
      </div>

      {/* 비활성 오버레이 - 클릭하여 활성화 */}
      {!isMapActive && (
        <div
          onClick={onActivate}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            zIndex: 5
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '16px 32px',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'transform 0.2s ease',
          }}>
            <span className="material-icons" style={{
              fontSize: '28px',
              color: 'var(--primary)'
            }}>
              touch_app
            </span>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: '2px'
              }}>
                {t('landing.clickToExplore', '클릭하여 나무 탐색')}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--on-surface-variant)'
              }}>
                {t('landing.mapHint', '서울의 40만 나무를 만나보세요')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 활성 상태 표시 - 테두리 */}
      {isMapActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '3px solid var(--primary)',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: 0.7
        }} />
      )}

      {/* TreePopup - 지도 컨테이너 밖에 렌더링 */}
      {popup}
    </section>
  );
});

MapSection.displayName = 'MapSection';

export default MapSection;
