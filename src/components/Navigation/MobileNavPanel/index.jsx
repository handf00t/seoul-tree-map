// components/Navigation/MobileNavPanel/index.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { visitService } from '../../../services/firebase';
import { SEOUL_CENTER, SEOUL_BBOX, TIMING, MAP_ZOOM, MAP_ANIMATION, TREE_LAYER_IDS, DRAG_THRESHOLD, PANEL_POSITION } from '../../../constants';
import { applyFiltersToMap, clearFilters } from '../../../utils/filterBuilder';
import ProfileMenu from './ProfileMenu';
import MyVisitsView from './MyVisitsView';
import HomeView from './HomeView';
import FavoritesView from './FavoritesView';
import AboutView from './AboutView';
import AboutDetailSheet from './AboutDetailSheet';
import BlogView from '../../Blog/BlogView';

const MobileNavPanel = ({
  map,
  onFilterClick,
  activeFilterCount,
  activeFilters,
  onFavoritesClick,
  onFilterApply,
  onTreeSelect,
  isHidden = false,
  minimizedPopupHeight = 0,
  onCollapseChange
}) => {
  const { t } = useTranslation();
  const { user, userFavorites, signOut, removeFromFavorites } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMyTreesActive, setIsMyTreesActive] = useState(false);
  const debounceRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 나의 방문 관련 state
  const [activeView, setActiveView] = useState('home');
  const [myVisits, setMyVisits] = useState([]);
  const [loadingMyVisits, setLoadingMyVisits] = useState(false);

  // 소개 상세 sheet 관련 state
  const [selectedAboutSection, setSelectedAboutSection] = useState(null);

  const previewFilters = user ? [
    { id: 'my-trees', name: '', color: 'var(--favorite-pink)', icon: <span className="material-icons" style={{ fontSize: '16px' }}>favorite</span> },
    { id: 'cherry', name: '벚나무', color: 'var(--species-cherry)' },
    { id: 'pine', name: '소나무', color: 'var(--species-pine)' }
  ] : [
    { id: 'ginkgo', name: '은행나무', color: 'var(--species-ginkgo)' },
    { id: 'cherry', name: '벚나무', color: 'var(--species-cherry)' },
    { id: 'pine', name: '소나무', color: 'var(--species-pine)' }
  ];

  // 나의 방문 로드
  const loadMyVisits = useCallback(async () => {
    if (!user) return;

    setLoadingMyVisits(true);
    const result = await visitService.getUserVisits(user.uid);

    if (result.success) {
      setMyVisits(result.visits);
    }
    setLoadingMyVisits(false);
  }, [user]);

  // activeView 변경시 데이터 로드
  useEffect(() => {
    if (activeView === 'myvisits') {
      loadMyVisits();
    }
  }, [activeView, loadMyVisits]);

  // 날짜 포맷
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 방문 클릭
  const handleMyVisitClick = (visit) => {
    const treeData = {
      ...visit.treeInfo,
      source_id: visit.treeId,
      clickCoordinates: {
        lat: visit.treeInfo?.coordinates?.lat || SEOUL_CENTER.lat,
        lng: visit.treeInfo?.coordinates?.lng || SEOUL_CENTER.lng
      }
    };

    if (map && visit.treeInfo?.coordinates) {
      map.flyTo({
        center: [visit.treeInfo.coordinates.lng, visit.treeInfo.coordinates.lat],
        zoom: MAP_ZOOM.TREE_DETAIL,
        duration: MAP_ANIMATION.TREE_SELECT.duration
      });
    }

    if (onTreeSelect) {
      onTreeSelect(treeData);
    }
  };

  // 방문 삭제
  const handleDeleteMyVisit = async (visitId, e) => {
    e.stopPropagation();

    if (!window.confirm(t('visits.confirmDelete'))) return;

    const result = await visitService.deleteVisit(user.uid, visitId);
    if (result.success) {
      loadMyVisits();
    } else {
      alert(t('popup.deleteFailed') + ': ' + result.error);
    }
  };

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        new URLSearchParams({
          access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
          country: 'KR',
          proximity: `${SEOUL_CENTER.lng},${SEOUL_CENTER.lat}`,
          bbox: SEOUL_BBOX.join(','),
          language: 'ko',
          limit: 4
        })
      );

      if (!response.ok) {
        throw new Error('Geocoding API 오류');
      }

      const data = await response.json();
      
      const formattedSuggestions = data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name_ko || feature.place_name,
        shortName: feature.text_ko || feature.text,
        coordinates: feature.center
      }));

      setSuggestions(formattedSuggestions);
      
    } catch (error) {
      console.error('위치 검색 오류:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, TIMING.DEBOUNCE_SEARCH);
  };

  const selectLocation = (location) => {
    if (!map) return;

    map.flyTo({
      center: location.coordinates,
      zoom: MAP_ZOOM.SEARCH_RESULT,
      duration: MAP_ANIMATION.SEARCH.duration
    });

    setQuery(location.shortName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleQuickFilter = (filterId) => {
    if (filterId === 'my-trees') {
      if (!user || !userFavorites || userFavorites.length === 0) {
        alert(t('favorites.noFavorites'));
        return;
      }
      
      const newMyTreesState = !isMyTreesActive;
      setIsMyTreesActive(newMyTreesState);
      
      if (newMyTreesState) {
        applyMyTreesFilter();
      } else {
        clearMyTreesFilter();
      }
      return;
    }
    
    const filterMap = {
      'ginkgo': '은행나무',
      'cherry': '벚나무', 
      'pine': '소나무'
    };
    
    const speciesName = filterMap[filterId];
    if (!speciesName || !onFilterApply) return;

    const currentSpecies = activeFilters?.species || [];
    const newSpecies = currentSpecies.includes(speciesName)
      ? currentSpecies.filter(s => s !== speciesName)
      : [...currentSpecies, speciesName];

    onFilterApply({
      species: newSpecies,
      sizes: activeFilters?.sizes || []
    });

    // 통합 필터 빌더 사용
    applyFiltersToMap(map, { species: newSpecies });
  };

  const applyMyTreesFilter = () => {
    if (!map || !userFavorites || userFavorites.length === 0) return;

    const favoriteIds = userFavorites
      .map(fav => fav.source_id)
      .filter(id => id);

    if (favoriteIds.length === 0) {
      alert(t('favorites.noFavorites'));
      setIsMyTreesActive(false);
      return;
    }

    // 통합 필터 빌더 사용
    applyFiltersToMap(map, { favoriteIds });

    if (userFavorites[0].coordinates) {
      map.flyTo({
        center: [userFavorites[0].coordinates.lng, userFavorites[0].coordinates.lat],
        zoom: 14,
        duration: MAP_ANIMATION.FLY_TO.duration
      });
    }
  };

  const clearMyTreesFilter = () => {
    clearFilters(map);
  };

  const handleProfileMenuClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleFavoriteDelete = async (favoriteId, e) => {
    if (e) e.stopPropagation();
    const result = await removeFromFavorites(favoriteId);
    if (!result.success) {
      alert(t('favorites.removeFailed') + ': ' + result.error);
    }
  };

  const handleTreeSelect = (favorite) => {
    if (map && favorite.coordinates) {
      map.flyTo({
        center: [favorite.coordinates.lng, favorite.coordinates.lat],
        zoom: MAP_ZOOM.TREE_DETAIL,
        duration: MAP_ANIMATION.TREE_SELECT.duration
      });

      setTimeout(() => {
        const point = map.project([favorite.coordinates.lng, favorite.coordinates.lat]);
        const features = map.queryRenderedFeatures(point, {
          layers: TREE_LAYER_IDS
        });

        if (features.length > 0 && onTreeSelect) {
          // 타일셋에서 찾은 데이터 사용 (benefits 포함)
          const properties = features[0].properties;
          const treeData = {
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
              lat: favorite.coordinates.lat,
              lng: favorite.coordinates.lng
            }
          };

          // benefits 데이터가 있으면 중첩 객체로 구성
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

          onTreeSelect(treeData);
        } else if (onTreeSelect) {
          // 타일셋에서 못 찾으면 즐겨찾기 데이터만 사용
          const treeData = {
            ...favorite,
            clickCoordinates: {
              lat: favorite.coordinates.lat,
              lng: favorite.coordinates.lng
            }
          };
          onTreeSelect(treeData);
        }
      }, TIMING.MAP_QUERY_DELAY);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;

    if (deltaY > DRAG_THRESHOLD.PANEL) {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      } else if (showSuggestions) {
        setShowSuggestions(false);
      } else if (!isCollapsed) {
        setIsCollapsed(true);
        if (onCollapseChange) onCollapseChange(true);
      }
    }
    else if (deltaY < -DRAG_THRESHOLD.PANEL) {
      if (isCollapsed) {
        setIsCollapsed(false);
        if (onCollapseChange) onCollapseChange(false);
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const handleHandleClick = () => {
    if (isDragging) return;

    if (isCollapsed) {
      setIsCollapsed(false);
      if (onCollapseChange) onCollapseChange(false);
    } else {
      setIsCollapsed(true);
      setShowSuggestions(false);
      if (onCollapseChange) onCollapseChange(true);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!map) return null;

  const getBottomPosition = () => {
    if (isHidden || minimizedPopupHeight > 0) {
      return PANEL_POSITION.HIDDEN;
    } else {
      return PANEL_POSITION.VISIBLE;
    }
  };

  const getMaxHeight = () => {
    if (isCollapsed) {
      return '80px';
    }
    if (activeView === 'myvisits' || activeView === 'favorites' || activeView === 'about' || activeView === 'blog') {
       return 'calc(85vh - env(safe-area-inset-bottom))';
    }
    return showProfileMenu ? '70vh' : showSuggestions ? '40vh' : '280px';
  };

  return (
    <>
      {/* 블로그 뷰는 MobileNavPanel 밖에서 렌더링 */}
      {activeView === 'blog' && (
        <BlogView onClose={() => setActiveView('home')} />
      )}

      <div style={{
        position: 'fixed',
        bottom: getBottomPosition(),
        left: 0,
        right: 0,
        background: 'var(--surface-elevated)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 20px var(--shadow-color-md)',
        zIndex: 1000,
        maxHeight: getMaxHeight(),
        //overflowY: 'auto',
        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.3s ease',
        display: activeView === 'blog' ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px 0',
            cursor: 'grab',
            touchAction: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleHandleClick}
        >
          <div style={{
            width: '36px',
            height: '4px',
            background: isDragging ? 'var(--primary)' : 'var(--outline)',
            borderRadius: '2px',
            transition: isDragging ? 'none' : 'all 0.2s ease'
          }} />
        </div>

        {showProfileMenu ? (
          <ProfileMenu
            user={user}
            userFavorites={userFavorites}
            setShowProfileMenu={setShowProfileMenu}
            onFavoritesClick={onFavoritesClick}
            setActiveView={setActiveView}
            signOut={signOut}
          />
        ) : activeView === 'myvisits' ? (
          <MyVisitsView
            myVisits={myVisits}
            loadingMyVisits={loadingMyVisits}
            setActiveView={setActiveView}
            handleMyVisitClick={handleMyVisitClick}
            handleDeleteMyVisit={handleDeleteMyVisit}
            formatDate={formatDate}
          />
        ) : activeView === 'favorites' ? (
          <FavoritesView
            setActiveView={setActiveView}
            handleTreeSelect={handleTreeSelect}
            handleFavoriteDelete={handleFavoriteDelete}
          />
        ) : activeView === 'about' ? (
          <>
            <AboutView
              setActiveView={setActiveView}
              onDetailClick={(section) => setSelectedAboutSection(section)}
            />
            {selectedAboutSection && (
              <AboutDetailSheet
                section={selectedAboutSection}
                onClose={() => setSelectedAboutSection(null)}
              />
            )}
          </>
        ) : (
        <HomeView
          query={query}
          handleInputChange={handleInputChange}
          clearSearch={clearSearch}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          selectLocation={selectLocation}
          handleProfileMenuClick={handleProfileMenuClick}
          user={user}
          previewFilters={previewFilters}
          isMyTreesActive={isMyTreesActive}
          activeFilters={activeFilters}
          handleQuickFilter={handleQuickFilter}
          activeFilterCount={activeFilterCount}
          onFilterClick={onFilterClick}
          userFavorites={userFavorites}
          handleTreeSelect={handleTreeSelect}
          handleFavoriteDelete={handleFavoriteDelete}
          onFavoritesClick={onFavoritesClick}
          setActiveView={setActiveView}
        />
      )}
      </div>
    </>
  );
};

export default MobileNavPanel;