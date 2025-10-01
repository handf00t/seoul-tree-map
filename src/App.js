// src/App.js - 스플래시 화면 추가
import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MapContainer from './components/Map/MapContainer';
import SearchFilterPanel from './components/Search/SearchFilterPanel';
import MobileNavPanel from './components/Navigation/MobileNavPanel';
import TreePopup from './components/Popup/TreePopup';
import TreeFilter from './components/Filter/TreeFilter';
import LoginModal from './components/Auth/LoginModal';
import { UserProfile } from './components/Auth/LoginModal';
import FavoritesModal from './components/Favorites/FavoritesModal';
import SplashScreen from './components/SplashScreen/SplashScreen';
import CurrentLocationButton from './components/Map/CurrentLocationButton';
import './App.css';

function AppContent() {
  const { user, loading, userFavorites } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ species: [], sizes: [] });
  const [isPopupMinimized, setIsPopupMinimized] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  // 스플래시 화면 상태 추가
  const [showSplash, setShowSplash] = useState(
    !localStorage.getItem('hasVisitedBefore')
  );

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // URL 파라미터에서 공유된 나무 정보 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (lat && lng && mapInstance) {
      const sharedTreeData = {
        species_kr: urlParams.get('species') || '미상',
        tree_type: urlParams.get('type') || 'unknown',
        source_id: urlParams.get('id') || '',
        borough: urlParams.get('borough') || '',
        district: urlParams.get('district') || '',
        clickCoordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
      };

      setSelectedTree(sharedTreeData);
      setShowPopup(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [mapInstance]);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const handleTreeClick = useCallback((treeData) => {
    setSelectedTree(treeData);
    setShowPopup(true);
    setShowSearch(false);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setTimeout(() => {
      setSelectedTree(null);
      setIsPopupMinimized(false);
    }, 300);
  }, []);

  const handleFilterApply = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({ species: [], sizes: [] });
    
    if (mapInstance) {
      const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
      layers.forEach(layerId => {
        if (mapInstance.getLayer(layerId)) {
          const originalFilter = layerId === 'protected-trees' ? ['==', 'tree_type', 'protected'] :
                               layerId === 'roadside-trees' ? ['==', 'tree_type', 'roadside'] :
                               ['==', 'tree_type', 'park'];
          mapInstance.setFilter(layerId, originalFilter);
        }
      });
    }
  }, [mapInstance]);

  const handleLoginClick = () => {
    if (user) {
      setShowProfile(!showProfile);
    } else {
      setShowLogin(true);
    }
  };

  const getActiveFilterCount = () => {
    return activeFilters.species.length + activeFilters.sizes.length;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && !event.target.closest('.profile-container')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  // 스플래시 화면이 표시 중이면 스플래시만 렌더링
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="App">
      {/* 헤더 - PC만 표시 */}
      {!isMobile && (
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        color: 'var(--on-surface)',
        padding: '16px 24px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        position: 'relative',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* 로고 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <div style={{
              background: 'var(--gradient-secondary)',
              borderRadius: isMobile ? '8px' : '12px',
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '18px' : '24px',
              color: 'white',
              boxShadow: '0 3px 8px rgba(78, 205, 196, 0.3)'
            }}>
              🌳
            </div>
            
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: 'var(--on-surface)'
              }}>
                서울시 나무지도
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                opacity: 0.7,
                color: 'var(--on-surface-variant)'
              }}>
                Seoul Urban Forest Explorer
              </p>
            </div>
          </div>

          {/* 헤더 우측 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 로그인/프로필 버튼 (PC만) */}
            <div style={{ position: 'relative' }} className="profile-container">
                <button
                  onClick={handleLoginClick}
                  className="interactive-element"
                  style={{
                    background: user ? 'var(--gradient-secondary)' : 'var(--surface-variant)',
                    color: user ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    height: '40px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all var(--duration-normal) ease',
                    boxShadow: user ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  {loading ? (
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                  ) : user ? (
                    <>
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                      {user.displayName?.split(' ')[0] || '사용자'}
                    </>
                  ) : (
                    '로그인'
                  )}
                </button>

                {/* PC용 사용자 프로필 드롭다운 */}
                {showProfile && user && (
                  <UserProfile 
                    onFavoritesClick={() => {
                      setShowProfile(false);
                      setShowFavorites(true);
                    }}
                    onClose={() => setShowProfile(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* 메인 지도 영역 */}
      <main style={{ 
        height: isMobile ? '100vh' : 'calc(100vh - 96px)', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <MapContainer 
          onMapLoad={handleMapLoad} 
          onTreeClick={handleTreeClick}
          selectedTree={selectedTree}
          onMapInteractionChange={setIsMapInteracting}
          onMapClick={() => {
            if (showPopup && !isMapInteracting) {
              setIsPopupMinimized(true);
            }
          }}
        />

        {/* 현재 위치 버튼 */}
        <CurrentLocationButton 
          map={mapInstance}
          isMobile={isMobile}
          minimizedPopupHeight={isPopupMinimized ? 10 : 240}
        />
        
        {/* PC용 검색 패널 (완전 분리) */}
        {!isMobile && (
          <SearchFilterPanel 
            map={mapInstance} 
            activeFilterCount={getActiveFilterCount()}
            onFilterApply={handleFilterApply}
          />
        )}

        {/* 모바일용 네비게이션 패널 (완전 분리) */}
        {isMobile && (
          <MobileNavPanel 
            map={mapInstance}
            onFilterClick={() => setShowFilter(true)}
            activeFilterCount={getActiveFilterCount()}
            activeFilters={activeFilters}
            onFilterApply={handleFilterApply}
            onFavoritesClick={() => {
              if (user) {
                setShowFavorites(true);
              } else {
                setShowLogin(true);
              }
            }}
            onTreeSelect={handleTreeClick}
            isHidden={showPopup && !isPopupMinimized}
            minimizedPopupHeight={isPopupMinimized ? 180 : 0}
          />
        )}

        {/* PC용 필터 범례 */}
        {!isMobile && getActiveFilterCount() > 0 && (
          <div className="surface-card" style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            maxWidth: '280px',
            animation: 'slideUp var(--duration-normal) ease'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--on-surface)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎯 적용된 필터
              <button
                onClick={clearFilters}
                className="badge badge-primary"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '10px',
                  padding: '4px 8px'
                }}
              >
                초기화
              </button>
            </div>
            
            {activeFilters.species.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>수종: </span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface)' }}>
                  {activeFilters.species.join(', ')}
                </span>
              </div>
            )}
            
            {activeFilters.sizes.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>크기: </span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface)' }}>
                  {activeFilters.sizes.length}개 범위 선택됨
                </span>
              </div>
            )}
          </div>
        )}

        {/* 공통 모달들 */}
        <TreePopup 
          treeData={selectedTree}
          isVisible={showPopup}
          onClose={handleClosePopup}
          map={mapInstance}
          onMinimizedChange={setIsPopupMinimized}
          isMapInteracting={isMapInteracting}
          onLoginRequest={() => setShowLogin(true)}
        />

        <TreeFilter
          map={mapInstance}
          isVisible={showFilter}
          onClose={() => setShowFilter(false)}
          onFilterApply={handleFilterApply}
        />

        <LoginModal
          isVisible={showLogin}
          onClose={() => setShowLogin(false)}
        />

        <FavoritesModal
          isVisible={showFavorites}
          onClose={() => setShowFavorites(false)}
          onTreeSelect={(treeData) => {
            setSelectedTree(treeData);
            setShowPopup(true);
          }}
          map={mapInstance}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;