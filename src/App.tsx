// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { clearMapFilters } from './utils/mapFilters';
import MapContainer from './components/Map/MapContainer';
import SearchFilterPanel from './components/Search/SearchFilterPanel';
import MobileNavPanel from './components/Navigation/MobileNavPanel';
import TreePopup from './components/Popup/TreePopup';
import TreeFilter from './components/Filter/TreeFilter';
import LoginModal from './components/Auth/LoginModal';
import { UserProfile } from './components/Auth/LoginModal';
import FavoritesModal from './components/Favorites/FavoritesModal';
import CurrentLocationButton from './components/Map/CurrentLocationButton';
import AboutView from './components/Navigation/MobileNavPanel/AboutView';
import AboutDetailSheet from './components/Navigation/MobileNavPanel/AboutDetailSheet';
import BlogView from './components/Blog/BlogView';
import LanguageToggle from './components/UI/LanguageToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { TreeData } from './types';
import './App.css';

// Mapbox GL Map 타입
type MapboxMap = mapboxgl.Map;

interface FilterState {
  species: string[];
  sizes: string[];
}

type AboutSection = 'overview' | 'features' | 'data' | 'tech' | null;

function AppContent() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [selectedAboutSection, setSelectedAboutSection] = useState<AboutSection>(null);
  const [showBlog, setShowBlog] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({ species: [], sizes: [] });
  const [isPopupMinimized, setIsPopupMinimized] = useState<boolean>(false);
  const [isMapInteracting, setIsMapInteracting] = useState<boolean>(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);


  // URL 파라미터에서 공유된 나무 정보 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const treeId = urlParams.get('id');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');

    if (treeId && lat && lng && mapInstance) {
      // 지도가 로드될 때까지 대기
      if (!mapInstance.isStyleLoaded()) {
        mapInstance.once('idle', () => {
          queryTreeFromMap(treeId, parseFloat(lng), parseFloat(lat));
        });
      } else {
        queryTreeFromMap(treeId, parseFloat(lng), parseFloat(lat));
      }

      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [mapInstance]);

  // 지도에서 나무 데이터 조회
  const queryTreeFromMap = (sourceId: string, lng: number, lat: number) => {
    if (!mapInstance) return;

    // 해당 위치로 지도 이동
    mapInstance.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1500
    });

    // 지도 이동 완료 후 데이터 조회
    const onMoveEnd = () => {
      // 타일이 로드될 때까지 추가 대기
      mapInstance.once('idle', () => {
        // querySourceFeatures를 사용하여 소스에서 직접 조회 (렌더링 상태 무관)
        const sourceFeatures = mapInstance.querySourceFeatures('seoul-trees', {
          sourceLayer: 'trees_with_benefits'
        });

        console.log('Querying tree from source:', {
          sourceId,
          totalFeatures: sourceFeatures.length
        });

        // source_id가 일치하는 나무 찾기
        const matchedFeature = sourceFeatures.find(
          (f: any) => {
            const featureId = f.properties.source_id;
            return String(featureId) === String(sourceId);
          }
        );

        if (matchedFeature && matchedFeature.properties) {
          const properties = matchedFeature.properties;
          const treeData: TreeData = {
            source_id: properties.source_id,
            species_kr: properties.species_kr,
            tree_type: properties.tree_type,
            dbh_cm: properties.dbh_cm,
            height_m: properties.height_m,
            borough: properties.borough,
            district: properties.district,
            address: properties.address,
            latitude: properties.latitude,
            longitude: properties.longitude,
            clickCoordinates: {
              lat: lat,
              lng: lng
            }
          };

          // benefits 데이터가 있으면 추가
          if (properties.total_annual_value_krw !== undefined ||
              properties.stormwater_liters_year !== undefined ||
              properties.energy_kwh_year !== undefined ||
              properties.air_pollution_kg_year !== undefined ||
              properties.carbon_storage_kg_year !== undefined) {
            treeData.benefits = {
              total_annual_value_krw: properties.total_annual_value_krw,
              stormwater_liters_year: properties.stormwater_liters_year,
              stormwater_value_krw_year: properties.stormwater_value_krw_year,
              energy_kwh_year: properties.energy_kwh_year,
              energy_value_krw_year: properties.energy_value_krw_year,
              air_pollution_kg_year: properties.air_pollution_kg_year,
              air_pollution_value_krw_year: properties.air_pollution_value_krw_year,
              carbon_storage_kg_year: properties.carbon_storage_kg_year,
              carbon_value_krw_year: properties.carbon_value_krw_year
            };
          }

          console.log('Tree found and popup opening:', treeData.species_kr);
          setSelectedTree(treeData);
          setShowPopup(true);
        } else {
          console.warn('Tree not found:', sourceId);
        }
      });
    };

    mapInstance.once('moveend', onMoveEnd);
  };

  const handleMapLoad = useCallback((map: MapboxMap) => {
    setMapInstance(map);
  }, []);

  const handleTreeClick = useCallback((treeData: TreeData) => {
    setSelectedTree(treeData);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setTimeout(() => {
      setSelectedTree(null);
      setIsPopupMinimized(false);
    }, 300);
  }, []);

  const handleFilterApply = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({ species: [], sizes: [] });
    clearMapFilters(mapInstance);
  }, [mapInstance]);

  const handleLoginClick = () => {
    if (user) {
      setShowProfile(!showProfile);
    } else {
      setShowLogin(true);
    }
  };

  const getActiveFilterCount = (): number => {
    return activeFilters.species.length + activeFilters.sizes.length;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfile && !(event.target as Element).closest('.profile-container')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

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
              borderRadius: isMobile ? '8px' : '12px',
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src="/logo.svg"
                alt="서울시 나무 지도 로고"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            <div>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'var(--on-surface)'
              }}>
                {t('common.appName')}
              </h1>
              <p style={{
                margin: 0,
                fontSize: '12px',
                opacity: 0.7,
                color: 'var(--on-surface-variant)'
              }}>
                Seoul Urban Tree Explorer
              </p>
            </div>
          </div>

          {/* 헤더 우측 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 언어 토글 버튼 (PC만) */}
            <LanguageToggle />

            {/* 블로그 버튼 (PC만) */}
            <button
              onClick={() => navigate('/blog')}
              style={{
                background: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)',
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
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-variant)')}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>article</span>
              <span>{t('navigation.blog')}</span>
            </button>

            {/* 소개 버튼 (PC만) */}
            <button
              onClick={() => setShowAbout(true)}
              style={{
                background: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)',
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
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-variant)')}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>info</span>
              <span>{t('navigation.about')}</span>
            </button>

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
                        src={user.photoURL || ''}
                        alt={user.displayName || ''}
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
                    t('auth.login')
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

        {/* 현재 위치 버튼 (모바일만) */}
        {isMobile && (
          <CurrentLocationButton
            map={mapInstance}
            isMobile={isMobile}
            minimizedPopupHeight={isPopupMinimized ? 10 : 240}
            isHidden={showPopup && !isPopupMinimized}
            isPanelCollapsed={isPanelCollapsed}
          />
        )}

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
            onCollapseChange={setIsPanelCollapsed}
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
              <span className="material-icons" style={{ fontSize: '16px' }}>filter_alt</span> {t('filter.activeFiltersLabel')}
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
                {t('common.reset')}
              </button>
            </div>

            {activeFilters.species.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{t('filter.species')}: </span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface)' }}>
                  {activeFilters.species.join(', ')}
                </span>
              </div>
            )}

            {activeFilters.sizes.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{t('filter.size')}: </span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface)' }}>
                  {t('filter.rangesSelected', { count: activeFilters.sizes.length })}
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
          onTreeSelect={(treeData: TreeData) => {
            setSelectedTree(treeData);
            setShowPopup(true);
          }}
          map={mapInstance}
        />

        {/* 블로그 라우팅 */}
        <Routes>
          <Route path="/blog" element={<BlogView onClose={() => navigate('/')} />} />
          <Route path="/blog/:postId" element={<BlogView onClose={() => navigate('/')} />} />
        </Routes>

        {/* 블로그 모달 (PC & Mobile) - 구식 방식 지원 */}
        {showBlog && !location.pathname.startsWith('/blog') && <BlogView onClose={() => setShowBlog(false)} />}

        {/* 소개 모달 (PC) */}
        {showAbout && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => {
              setShowAbout(false);
              setSelectedAboutSection(null);
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: 'relative' }}>
                <AboutView
                  setActiveView={(view: string) => {
                    if (view === 'home') {
                      setShowAbout(false);
                      setSelectedAboutSection(null);
                    }
                  }}
                  onDetailClick={(section: AboutSection) => setSelectedAboutSection(section)}
                />
                {selectedAboutSection && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'white',
                      borderRadius: '24px',
                      overflow: 'auto',
                      zIndex: 10
                    }}
                  >
                    <AboutDetailSheet
                      section={selectedAboutSection}
                      onClose={() => setSelectedAboutSection(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
