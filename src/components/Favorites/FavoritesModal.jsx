// components/Favorites/FavoritesModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FavoritesModal = ({ isVisible, onClose, onTreeSelect, map }) => {
  const { userFavorites, removeFromFavorites, loadUserFavorites, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, protected, roadside, park
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, name, location

  // 즐겨찾기 새로고침
  const refreshFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    await loadUserFavorites(user.uid);
    setIsLoading(false);
  };

  // 컴포넌트 마운트 시 즐겨찾기 로드
  useEffect(() => {
    if (isVisible && user) {
      refreshFavorites();
    }
  }, [isVisible, user]);

  // 즐겨찾기 제거 핸들러
  const handleRemoveFavorite = async (favorite) => {
    const result = await removeFromFavorites(favorite.id);
    if (result.success) {
      console.log('즐겨찾기 제거 완료:', favorite.species_kr);
    } else {
      alert('즐겨찾기 제거에 실패했습니다: ' + result.error);
    }
  };

  // 나무 선택 및 지도 이동
  const handleTreeSelect = (favorite) => {
    if (map && favorite.coordinates) {
      // 지도 이동
      map.flyTo({
        center: [favorite.coordinates.lng, favorite.coordinates.lat],
        zoom: 16,
        duration: 1500
      });

      // 나무 선택 콜백 호출
      if (onTreeSelect) {
        const treeData = {
          ...favorite,
          clickCoordinates: {
            lat: favorite.coordinates.lat,
            lng: favorite.coordinates.lng
          }
        };
        onTreeSelect(treeData);
      }
      
      onClose();
    }
  };

  // 필터링 및 정렬된 즐겨찾기 목록
  const getFilteredAndSortedFavorites = () => {
    let filtered = userFavorites;

    // 타입 필터 적용
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(fav => fav.tree_type === selectedFilter);
    }

    // 검색어 필터 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fav => 
        fav.species_kr?.toLowerCase().includes(query) ||
        fav.borough?.toLowerCase().includes(query) ||
        fav.district?.toLowerCase().includes(query)
      );
    }

    // 정렬 적용
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.species_kr || '').localeCompare(b.species_kr || '');
        case 'location':
          return (a.borough || '').localeCompare(b.borough || '');
        case 'recent':
        default:
          return (b.addedAt?.seconds || 0) - (a.addedAt?.seconds || 0);
      }
    });

    return filtered;
  };

  const filteredFavorites = getFilteredAndSortedFavorites();

  // 나무 타입별 색상
  const getTypeColor = (type) => {
    switch(type) {
      case 'protected': return '#FF6B6B';
      case 'roadside': return '#4ECDC4';
      case 'park': return '#45B7D1';
      default: return '#666';
    }
  };

  // 나무 타입 한글 변환
  const getTreeTypeName = (type) => {
    switch(type) {
      case 'protected': return '보호수';
      case 'roadside': return '가로수';
      case 'park': return '공원수목';
      default: return type;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 백그라운드 오버레이 */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2999
        }}
      />
      
      {/* 즐겨찾기 모달 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 3000,
        width: 'min(90vw, 600px)',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              내 즐겨찾기
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#666'
            }}>
              저장한 나무 {userFavorites.length}개
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8f9fa',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
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

        {/* 필터 및 검색 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* 검색창 */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="나무 이름이나 위치로 검색..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* 필터 및 정렬 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* 타입 필터 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', name: '전체' },
                { id: 'protected', name: '보호수' },
                { id: 'roadside', name: '가로수' },
                { id: 'park', name: '공원수목' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    background: selectedFilter === filter.id ? '#4ECDC4' : 'white',
                    color: selectedFilter === filter.id ? 'white' : '#666',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'white',
                color: '#666'
              }}
            >
              <option value="recent">최근 저장순</option>
              <option value="name">이름순</option>
              <option value="location">위치순</option>
            </select>
          </div>
        </div>

        {/* 즐겨찾기 목록 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(85vh - 200px)'
        }}>
          {isLoading ? (
            <div style={{
              padding: '40px',
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
              즐겨찾기를 불러오는 중...
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              {userFavorites.length === 0 ? (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌳</div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                    아직 저장한 나무가 없어요
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    마음에 드는 나무를 찾아서 하트 버튼을 눌러보세요!
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    검색 조건에 맞는 나무를 찾을 수 없습니다
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '0 24px 24px 24px' }}>
              {filteredFavorites.map((favorite, index) => (
                <div
                  key={favorite.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                  onClick={() => handleTreeSelect(favorite)}
                >
                  {/* 나무 타입 색상 표시 */}
                  <div
                    style={{
                      width: '8px',
                      height: '40px',
                      borderRadius: '4px',
                      background: getTypeColor(favorite.tree_type)
                    }}
                  />

                  {/* 나무 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#2c3e50',
                      fontSize: '15px',
                      marginBottom: '4px'
                    }}>
                      {favorite.species_kr || '미상'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '2px'
                    }}>
                      {getTreeTypeName(favorite.tree_type)} • {favorite.borough} {favorite.district}
                    </div>
                    {favorite.addedAt && (
                      <div style={{
                        fontSize: '11px',
                        color: '#999'
                      }}>
                        {new Date(favorite.addedAt.seconds * 1000).toLocaleDateString('ko-KR')} 저장
                      </div>
                    )}
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite);
                    }}
                    style={{
                      background: '#f8f9fa',
                      border: 'none',
                      borderRadius: '4px',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#999',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e74c3c';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#999';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default FavoritesModal;