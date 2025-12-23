// src/components/Landing/LandingPage.tsx
// PC 전용 랜딩 페이지 - 스크롤 섹션 구조
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../Map/MapContainer';
import SearchFilterPanel from '../Search/SearchFilterPanel';
import TreePopup from '../Popup/TreePopup';
import TreeFilter from '../Filter/TreeFilter';
import LoginModal from '../Auth/LoginModal';
import FavoritesModal from '../Favorites/FavoritesModal';
import MapSection from './MapSection';
import FeaturesSection from './FeaturesSection';
import BlogPreviewSection from './BlogPreviewSection';
import { TreeData } from '../../types';

interface LandingPageProps {
  onMapLoad: (map: mapboxgl.Map) => void;
  mapInstance: mapboxgl.Map | null;
  selectedTree: TreeData | null;
  showPopup: boolean;
  onTreeClick: (tree: TreeData) => void;
  onClosePopup: () => void;
  activeFilters: { species: string[]; sizes: string[] };
  onFilterApply: (filters: { species: string[]; sizes: string[] }) => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onMapLoad,
  mapInstance,
  selectedTree,
  showPopup,
  onTreeClick,
  onClosePopup,
  activeFilters,
  onFilterApply,
  showLogin,
  setShowLogin,
  showFavorites,
  setShowFavorites
}) => {
  const navigate = useNavigate();
  const [isMapActive, setIsMapActive] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [, setIsPopupMinimized] = useState(false);  // TreePopup에서 사용
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // 지도 영역 밖 클릭 시 비활성화 (팝업이 열려있으면 무시)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 팝업이 열려있으면 비활성화하지 않음
      if (showPopup) return;

      // 모달/팝업 영역 클릭은 무시 (z-index가 높은 요소들)
      const target = event.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('.modal') || target.closest('[style*="z-index: 2"]')) {
        return;
      }

      if (mapSectionRef.current && !mapSectionRef.current.contains(target)) {
        setIsMapActive(false);
      }
    };

    if (isMapActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMapActive, showPopup]);

  const handleMapSectionClick = useCallback(() => {
    if (!isMapActive) {
      setIsMapActive(true);
    }
  }, [isMapActive]);

  const getActiveFilterCount = (): number => {
    return activeFilters.species.length + activeFilters.sizes.length;
  };

  return (
    <div className="landing-page" style={{
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Section 1: Map */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <MapSection
          ref={mapSectionRef}
          isMapActive={isMapActive}
          onActivate={handleMapSectionClick}
          popup={
            <TreePopup
              key={selectedTree?.source_id}
              treeData={selectedTree}
              isVisible={showPopup}
              onClose={onClosePopup}
              map={mapInstance}
              onMinimizedChange={setIsPopupMinimized}
              isMapInteracting={isMapInteracting}
              onLoginRequest={() => setShowLogin(true)}
              isLandingPage={true}
            />
          }
        >
          <MapContainer
            onMapLoad={onMapLoad}
            onTreeClick={onTreeClick}
            selectedTree={selectedTree}
            onMapInteractionChange={setIsMapInteracting}
            onMapClick={() => {
              if (showPopup && !isMapInteracting) {
                setIsPopupMinimized(true);
              }
            }}
          />
        </MapSection>

        {/* 지도 활성 상태에서만 필터 패널 표시 - MapSection 밖에 배치 */}
        {isMapActive && (
          <SearchFilterPanel
            map={mapInstance}
            activeFilterCount={getActiveFilterCount()}
            onFilterApply={onFilterApply}
          />
        )}
      </div>

      {/* Section 2: Features */}
      <FeaturesSection />

      {/* Section 3: Blog Preview */}
      <BlogPreviewSection onViewAll={() => navigate('/blog')} />

      {/* Modals */}
      <TreeFilter
        map={mapInstance}
        isVisible={showFilter}
        onClose={() => setShowFilter(false)}
        onFilterApply={onFilterApply}
      />

      <LoginModal
        isVisible={showLogin}
        onClose={() => setShowLogin(false)}
      />

      <FavoritesModal
        isVisible={showFavorites}
        onClose={() => setShowFavorites(false)}
        onTreeSelect={(treeData: TreeData) => {
          onTreeClick(treeData);
        }}
        map={mapInstance}
      />

    </div>
  );
};

export default LandingPage;
