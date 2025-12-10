// components/Favorites/FavoritesModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import IconButton from '../UI/IconButton';
import LoadingSpinner from '../UI/LoadingSpinner';
import EmptyState from '../UI/EmptyState';

const FavoritesModal = ({ isVisible, onClose, onTreeSelect, map }) => {
  const { t, i18n } = useTranslation();
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
    if (!result.success) {
      alert(t('favorites.removeFailed') + ': ' + result.error);
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

      // 타일셋에서 실제 나무 데이터 쿼리 (benefits 정보 포함)
      setTimeout(() => {
        const point = map.project([favorite.coordinates.lng, favorite.coordinates.lat]);
        const features = map.queryRenderedFeatures(point, {
          layers: ['protected-trees', 'roadside-trees', 'park-trees']
        });

        if (features.length > 0) {
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

          if (onTreeSelect) {
            onTreeSelect(treeData);
          }
        } else {
          // 타일셋에서 못 찾으면 즐겨찾기 데이터만 사용
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
        }
      }, 1600); // flyTo 완료 후 쿼리

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
      case 'protected': return 'var(--tree-protected)';
      case 'roadside': return 'var(--primary)';
      case 'park': return 'var(--tree-park)';
      default: return 'var(--text-secondary)';
    }
  };

  // 나무 타입 변환
  const getTreeTypeName = (type) => {
    switch(type) {
      case 'protected': return t('filter.protected');
      case 'roadside': return t('filter.roadside');
      case 'park': return t('filter.park');
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
          background: 'var(--overlay-dark)',
          zIndex: 2999
        }}
      />
      
      {/* 즐겨찾기 모달 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--surface)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px var(--shadow-color-xl)',
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
          borderBottom: '1px solid var(--outline-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--text-heading)'
            }}>
              {t('favorites.myFavorites')}
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              {t('favorites.savedCount', { count: userFavorites.length })}
            </p>
          </div>
          <IconButton
            icon="close"
            onClick={onClose}
            variant="close"
            size="large"
            ariaLabel={t('common.close')}
          />
        </div>

        {/* 필터 및 검색 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--outline-light)',
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
              placeholder={t('search.searchByName')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--outline)',
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
                { id: 'all', name: t('favorites.all') },
                { id: 'protected', name: t('filter.protected') },
                { id: 'roadside', name: t('filter.roadside') },
                { id: 'park', name: t('filter.park') }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid var(--outline)',
                    borderRadius: '4px',
                    background: selectedFilter === filter.id ? 'var(--primary)' : 'var(--surface)',
                    color: selectedFilter === filter.id ? 'var(--surface)' : 'var(--text-secondary)',
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
                border: '1px solid var(--outline)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--surface)',
                color: 'var(--text-secondary)'
              }}
            >
              <option value="recent">{t('favorites.sortByRecent')}</option>
              <option value="name">{t('favorites.sortByName')}</option>
              <option value="location">{t('favorites.sortByLocation')}</option>
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
            <LoadingSpinner text={t('favorites.loading')} />
          ) : filteredFavorites.length === 0 ? (
            userFavorites.length === 0 ? (
              <EmptyState
                icon="park"
                title={t('favorites.noFavorites')}
                description={t('favorites.addFirst')}
                variant="plain"
              />
            ) : (
              <EmptyState
                icon="search"
                description={t('favorites.noResults')}
                variant="plain"
              />
            )
          ) : (
            <div style={{ padding: '0 24px 24px 24px' }}>
              {filteredFavorites.map((favorite) => (
                <div
                  key={favorite.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--outline-light)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
                  onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
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
                      color: 'var(--text-heading)',
                      fontSize: '15px',
                      marginBottom: '4px'
                    }}>
                      {favorite.species_kr || t('tree.unknownSpecies')}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '2px'
                    }}>
                      {getTreeTypeName(favorite.tree_type)} • {favorite.borough} {favorite.district}
                    </div>
                    {favorite.addedAt && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)'
                      }}>
                        {new Date(favorite.addedAt.seconds * 1000).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ko-KR')} {t('favorites.saved')}
                      </div>
                    )}
                  </div>

                  {/* 삭제 버튼 */}
                  <IconButton
                    icon="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite);
                    }}
                    variant="danger"
                    size="small"
                    ariaLabel={t('common.delete')}
                  />
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