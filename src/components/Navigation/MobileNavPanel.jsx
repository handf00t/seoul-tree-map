// components/Navigation/MobileNavPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitService } from '../../services/firebase';

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
    { id: 'my-trees', name: '', color: '#FF69B4', icon: '💚' },
    { id: 'cherry', name: '벚나무', color: '#FFB6C1' },
    { id: 'pine', name: '소나무', color: '#006400' }
  ] : [
    { id: 'ginkgo', name: '은행나무', color: '#FFD700' },
    { id: 'cherry', name: '벚나무', color: '#FFB6C1' },
    { id: 'pine', name: '소나무', color: '#006400' }
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
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px 20px 0 0',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
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
          background: isDragging ? '#4ECDC4' : '#e0e0e0',
          borderRadius: '2px',
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }} />
      </div>

      {showProfileMenu ? (
        <div style={{
          padding: '20px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          animation: 'slideDown 0.3s ease-out',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div>
                <div style={{
                  fontWeight: '700',
                  color: '#333',
                  fontSize: '18px',
                  marginBottom: '4px'
                }}>
                  {user.displayName}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {user.email}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowProfileMenu(false)}
              style={{
                background: '#f8f9fa',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#666'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                즐겨찾기한 나무
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#4ECDC4'
              }}>
                {userFavorites.length}개
              </span>
            </div>
            
            {userFavorites.length > 0 && (
              <div style={{ fontSize: '12px', color: '#888' }}>
                가장 최근: {userFavorites[0]?.species_kr || '미상'} 
                ({userFavorites[0]?.borough})
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <button
              onClick={() => {
                setShowProfileMenu(false);
                onFavoritesClick();
              }}
              style={{
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💚</span>
                <span>내 즐겨찾기</span>
              </div>
              <span style={{ color: '#666', fontSize: '14px' }}>{'>'}</span>
            </button>
            
            <button
              onClick={() => {
                setShowProfileMenu(false);
                setActiveView('myvisits');
              }}
              style={{
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <span>나의 방문</span>
              </div>
              <span style={{ color: '#666', fontSize: '14px' }}>{'>'}</span>
            </button>
            
            <button
              style={{
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.6,
                transition: 'all 0.2s ease'
              }}
              disabled
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <span>설정</span>
              </div>
              <span style={{ color: '#ccc', fontSize: '12px' }}>준비중</span>
            </button>
            
            <button
              style={{
                padding: '16px 20px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.6,
                transition: 'all 0.2s ease'
              }}
              disabled
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>❓</span>
                <span>도움말</span>
              </div>
              <span style={{ color: '#ccc', fontSize: '12px' }}>준비중</span>
            </button>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              padding: '16px 20px',
              background: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ff4757',
              cursor: 'pointer',
              marginTop: '20px',
              marginBottom: '80px'
            }}
          >
            로그아웃
          </button>
        </div>
      ) : activeView === 'myvisits' ? (
        <div style={{ 
          padding: '0',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '80dvh',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <button
              onClick={() => setActiveView('home')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: '#333'
              }}>
                나의 방문
              </h3>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '13px',
                color: '#666'
              }}>
                내가 기록한 나무 {myVisits.length}개
              </p>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '12px',
            paddingBottom: 'calc(100px + env(safe-area-inset-bottom))'
          }}>
            {loadingMyVisits ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #4ECDC4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }} />
                방문기록을 불러오는 중...
              </div>
            ) : myVisits.length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌳</div>
                <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>
                  아직 방문 기록이 없습니다
                </div>
                <div style={{ fontSize: '14px', color: '#bbb' }}>
                  나무를 방문하고 첫 기록을 남겨보세요!
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {myVisits.map((visit) => (
                  <div
                    key={visit.id}
                    onClick={() => handleMyVisitClick(visit)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #e8e8e8',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#e0e0e0'
                      }}
                    >
                      {visit.photoURL ? (
                        <img
                          src={visit.photoURL}
                          alt="방문 사진"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px'
                          }}
                        >
                          🌳
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        {visit.treeInfo?.species_kr || '미상'}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '6px'
                      }}>
                        {visit.treeInfo?.borough} {visit.treeInfo?.district}
                      </div>

                      <div style={{
                        fontSize: '14px',
                        color: '#333',
                        marginBottom: '6px',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {visit.comment}
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: '#999'
                      }}>
                        {formatDate(visit.createdAt)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteMyVisit(visit.id, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#999',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ff4757';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = '#ff4757';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.color = '#999';
                        e.target.style.borderColor = '#e0e0e0';
                      }}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            padding: '0 20px 20px 20px',
            flex: 1,
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="검색"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    background: '#f8f9fa',
                    outline: 'none'
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                
                {query && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={handleProfileMenuClick}
                style={{
                  width: '44px',
                  height: '44px',
                  background: user ? '#4ECDC4' : '#f8f9fa',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: user ? 'white' : '#666'
                }}
              >
                ☰
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                marginBottom: '20px',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                background: 'white'
              }}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => selectLocation(suggestion)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#333' }}>
                      {suggestion.shortName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {suggestion.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                나무 필터
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {previewFilters.map(filter => {
                  const isActive = filter.id === 'my-trees' ? 
                    isMyTreesActive : 
                    activeFilters?.species?.includes(filter.name) || false;
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleQuickFilter(filter.id)}
                      style={{
                        padding: '8px 16px',
                        background: isActive ? filter.color : '#f8f9fa',
                        color: isActive ? 'white' : '#333',
                        border: isActive ? 'none' : '1px solid #e0e0e0',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {filter.icon && <span>{filter.icon}</span>}
                      {filter.name}
                      {isActive && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '12px',
                          opacity: 0.9
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
                
                <button
                  onClick={onFilterClick}
                  style={{
                    padding: '8px 16px',
                    background: '#f8f9fa',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  더보기 <span style={{ fontSize: '12px' }}>▼</span>
                </button>
              </div>
              
              {(activeFilterCount > 0 || isMyTreesActive) && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#4ECDC4',
                  fontWeight: '600'
                }}>
                  {isMyTreesActive ? '나의 나무 표시 중' : `${activeFilterCount}개 필터 활성화됨`}
                </div>
              )}
            </div>

            {user ? (
              userFavorites.length > 0 ? (
                <div>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    즐겨찾기
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {userFavorites.slice(0, 3).map((favorite) => (
                      <div
                        key={favorite.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8'
                        }}
                      >
                        <div
                          onClick={() => handleTreeSelect(favorite)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flex: 1,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: favorite.tree_type === 'protected' ? '#FF6B6B' :
                                       favorite.tree_type === 'roadside' ? '#4ECDC4' : '#45B7D1',
                            flexShrink: 0
                          }} />
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#333', 
                              fontSize: '15px',
                              marginBottom: '4px'
                            }}>
                              {favorite.species_kr || '미상'}
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#666',
                              lineHeight: '1.3'
                            }}>
                              {favorite.address || `${favorite.borough} ${favorite.district}`}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFavorite(favorite)}
                          style={{
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#999',
                            marginLeft: '12px',
                            flexShrink: 0
                          }}
                          title="즐겨찾기에서 제거"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    
                    {userFavorites.length > 3 && (
                      <button
                        onClick={onFavoritesClick}
                        style={{
                          padding: '12px',
                          background: 'none',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          color: '#4ECDC4',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        더보기 ({userFavorites.length - 3}개 더)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px dashed #e0e0e0'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌳</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    아직 즐겨찾기한 나무가 없어요
                  </div>
                </div>
              )
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>💚</div>
                <div style={{ 
                  color: '#333', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  즐겨찾기 기능
                </div>
                <div style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  마음에 드는 나무를 저장하고<br/>
                  언제든 다시 찾아보세요
                </div>
                <button
                  onClick={() => onFavoritesClick()}
                  style={{
                    background: '#4ECDC4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  로그인하기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavPanel;