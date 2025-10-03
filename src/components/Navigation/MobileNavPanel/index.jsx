// components/Navigation/MobileNavPanel/index.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { visitService } from '../../../services/firebase';
import ProfileMenu from './ProfileMenu';
import MyVisitsView from './MyVisitsView';
import HomeView from './HomeView';

const MobileNavPanel = ({ 
  map, 
  onFilterClick, 
  activeFilterCount,
  activeFilters,
  onFavoritesClick,
  onFilterApply,
  onTreeSelect,
  isHidden = false,
  minimizedPopupHeight = 0
}) => {
  const { user, userFavorites, signOut, removeFromFavorites } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMyTreesActive, setIsMyTreesActive] = useState(false);
  const debounceRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragThreshold = 50;

  // 나의 방문 관련 state
  const [activeView, setActiveView] = useState('home');
  const [myVisits, setMyVisits] = useState([]);
  const [loadingMyVisits, setLoadingMyVisits] = useState(false);

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
  const loadMyVisits = async () => {
    if (!user) return;
    
    setLoadingMyVisits(true);
    const result = await visitService.getUserVisits(user.uid);
    
    if (result.success) {
      setMyVisits(result.visits);
    }
    setLoadingMyVisits(false);
  };

  // activeView 변경시 데이터 로드
  useEffect(() => {
    if (activeView === 'myvisits' && user) {
      loadMyVisits();
    }
  }, [activeView, user]);

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
        lat: visit.treeInfo?.coordinates?.lat || 37.5665,
        lng: visit.treeInfo?.coordinates?.lng || 126.9780
      }
    };

    if (map && visit.treeInfo?.coordinates) {
      map.flyTo({
        center: [visit.treeInfo.coordinates.lng, visit.treeInfo.coordinates.lat],
        zoom: 16,
        duration: 1500
      });
    }

    if (onTreeSelect) {
      onTreeSelect(treeData);
    }
  };

  // 방문 삭제
  const handleDeleteMyVisit = async (visitId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('이 방문기록을 삭제하시겠습니까?')) return;
    
    const result = await visitService.deleteVisit(user.uid, visitId);
    if (result.success) {
      loadMyVisits();
    } else {
      alert('삭제 실패: ' + result.error);
    }
  };

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        new URLSearchParams({
          access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
          country: 'KR',
          proximity: '126.9780,37.5665',
          bbox: '126.734,37.428,127.269,37.701',
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
    } finally {
      setIsLoading(false);
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
    }, 300);
  };

  const selectLocation = (location) => {
    if (!map) return;

    map.flyTo({
      center: location.coordinates,
      zoom: 15,
      duration: 2000
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
        alert('즐겨찾기한 나무가 없습니다.');
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

    const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
  
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        let filterConditions = [];
        
        const layerType = layerId === 'protected-trees' ? 'protected' :
                         layerId === 'roadside-trees' ? 'roadside' : 'park';
        filterConditions.push(['==', ['get', 'tree_type'], layerType]);

        if (newSpecies.length > 0) {
          filterConditions.push(['in', ['get', 'species_kr'], ['literal', newSpecies]]);
        }

        const finalFilter = filterConditions.length === 1 ? 
          filterConditions[0] : ['all', ...filterConditions];
        
        map.setFilter(layerId, finalFilter);
      }
    });
  };

  const applyMyTreesFilter = () => {
    if (!map || !userFavorites || userFavorites.length === 0) return;
    
    const favoriteIds = userFavorites
      .map(fav => fav.source_id)
      .filter(id => id);

    if (favoriteIds.length === 0) {
      alert('표시할 수 있는 나무가 없습니다.');
      setIsMyTreesActive(false);
      return;
    }

    const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
    
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        const layerType = layerId === 'protected-trees' ? 'protected' :
                         layerId === 'roadside-trees' ? 'roadside' : 'park';
        
        const filter = [
          'all',
          ['==', ['get', 'tree_type'], layerType],
          ['in', ['get', 'source_id'], ['literal', favoriteIds]]
        ];
        
        map.setFilter(layerId, filter);
      }
    });

    if (userFavorites[0].coordinates) {
      map.flyTo({
        center: [userFavorites[0].coordinates.lng, userFavorites[0].coordinates.lat],
        zoom: 14,
        duration: 2000
      });
    }
  };

  const clearMyTreesFilter = () => {
    if (!map) return;
    
    const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
    
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        const layerType = layerId === 'protected-trees' ? 'protected' :
                         layerId === 'roadside-trees' ? 'roadside' : 'park';
        
        map.setFilter(layerId, ['==', ['get', 'tree_type'], layerType]);
      }
    });
  };

  const handleProfileMenuClick = () => {
    if (user) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      onFavoritesClick();
    }
  };

  const handleRemoveFavorite = async (favorite) => {
    const result = await removeFromFavorites(favorite.id);
    if (!result.success) {
      alert('즐겨찾기 제거에 실패했습니다: ' + result.error);
    }
  };

  const handleFavoriteDelete = async (favoriteId, e) => {
    if (e) e.stopPropagation();
    const result = await removeFromFavorites(favoriteId);
    if (!result.success) {
      alert('즐겨찾기 제거에 실패했습니다: ' + result.error);
    }
  };

  const handleTreeSelect = (favorite) => {
    if (map && favorite.coordinates) {
      map.flyTo({
        center: [favorite.coordinates.lng, favorite.coordinates.lat],
        zoom: 16,
        duration: 1500
      });

      setTimeout(() => {
        const features = map.queryRenderedFeatures({
          layers: ['protected-trees', 'roadside-trees', 'park-trees']
        });

        const targetTree = features.find(feature => {
          const coords = feature.geometry.coordinates;
          return Math.abs(coords[0] - favorite.coordinates.lng) < 0.0001 &&
                 Math.abs(coords[1] - favorite.coordinates.lat) < 0.0001;
        });

        if (targetTree && onTreeSelect) {
          const treeData = {
            ...targetTree.properties,
            clickCoordinates: {
              lat: favorite.coordinates.lat,
              lng: favorite.coordinates.lng
            }
          };
          onTreeSelect(treeData);
        } else if (onTreeSelect) {
          const treeData = {
            ...favorite,
            clickCoordinates: {
              lat: favorite.coordinates.lat,
              lng: favorite.coordinates.lng
            }
          };
          onTreeSelect(treeData);
        }
      }, 1600);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
    setActiveView('home');
    setIsMyTreesActive(false);
    clearMyTreesFilter();
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
    
    if (deltaY > dragThreshold) {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      } else if (showSuggestions) {
        setShowSuggestions(false);
      } else if (!isCollapsed) {
        setIsCollapsed(true);
      }
    }
    else if (deltaY < -dragThreshold) {
      if (isCollapsed) {
        setIsCollapsed(false);
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
    } else {
      setIsCollapsed(true);
      setShowSuggestions(false);
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
      return '-400px';
    } else {
      return '0';
    }
  };

  const getMaxHeight = () => {
    if (isCollapsed) {
      return '80px';
    }
    if (activeView === 'myvisits') {
       return 'calc(85vh - env(safe-area-inset-bottom))'; 
    }
    return showProfileMenu ? '70vh' : showSuggestions ? '40vh' : '280px';
  };

  return (
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
      display: 'flex',
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
        />
      )}
    </div>
  );
};

export default MobileNavPanel;