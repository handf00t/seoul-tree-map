// MobileNavPanel/HomeView.jsx
import EmptyState from '../../UI/EmptyState';
import IconButton from '../../UI/IconButton';

const HomeView = ({
  query,
  handleInputChange,
  clearSearch,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  selectLocation,
  handleProfileMenuClick,
  user,
  previewFilters,
  isMyTreesActive,
  activeFilters,
  handleQuickFilter,
  activeFilterCount,
  onFilterClick,
  userFavorites,
  handleTreeSelect,
  handleFavoriteDelete,
  onFavoritesClick,
  setActiveView
}) => {
  // 나무 색상 (수종별 우선, 타입별 fallback)
  const getTreeColor = (favorite) => {
    const speciesColors = {
      '은행나무': '#FFD700',
      '느티나무': '#228B22',
      '플라타너스': '#8FBC8F',
      '벚나무': '#FFB6C1',
      '단풍나무': '#FF4500',
      '소나무': '#006400',
      '회화나무': '#8B4513',
      '참나무': '#8B4513',
      '메타세쿼이아': '#228B22'
    };

    // 1순위: 수종별 색상
    if (favorite.species_kr && speciesColors[favorite.species_kr]) {
      return speciesColors[favorite.species_kr];
    }

    // 2순위: 타입별 색상
    switch(favorite.tree_type) {
      case 'protected': return 'var(--tree-protected)';
      case 'roadside': return 'var(--primary)';
      case 'park': return 'var(--tree-park)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
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
                border: '1px solid var(--outline)',
                background: 'var(--surface-variant)',
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
                  color: 'var(--text-secondary)',
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
              background: user ? 'var(--primary)' : 'var(--surface-variant)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: user ? 'white' : 'var(--text-secondary)'
            }}
          >
            <span className="material-icons" style={{ fontSize: '24px' }}>menu</span>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            marginBottom: '20px',
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            background: 'var(--surface)'
          }}>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => selectLocation(suggestion)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--divider)'
                }}
              >
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {suggestion.shortName}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
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
            color: 'var(--text-primary)'
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
                    background: isActive ? filter.color : 'var(--surface-variant)',
                    color: isActive ? 'white' : 'var(--text-primary)',
                    border: isActive ? 'none' : '1px solid var(--outline)',
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
                    <span className="material-icons" style={{ fontSize: '12px' }}>check</span>
                  )}
                </button>
              );
            })}

            <button
              onClick={onFilterClick}
              style={{
                padding: '8px 16px',
                background: 'var(--surface-variant)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--outline)',
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
              color: 'var(--primary)',
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
                color: 'var(--text-primary)'
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
                      background: 'var(--surface-variant)',
                      borderRadius: '12px',
                      border: '1px solid var(--outline-variant)'
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
                        background: getTreeColor(favorite),
                        flexShrink: 0
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '15px',
                          marginBottom: '4px'
                        }}>
                          {favorite.species_kr || '미상'}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.3'
                        }}>
                          {favorite.address || `${favorite.borough} ${favorite.district}`}
                        </div>
                      </div>
                    </div>

                    <IconButton
                      icon="delete"
                      onClick={(e) => handleFavoriteDelete(favorite.id, e)}
                      variant="danger"
                      size="small"
                      ariaLabel="삭제"
                    />
                  </div>
                ))}

                {userFavorites.length > 3 && (
                  <button
                    onClick={() => setActiveView('favorites')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
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
            <EmptyState
              icon="park"
              description="아직 즐겨찾기한 나무가 없어요"
              variant="dashed"
            />
          )
        ) : (
          <EmptyState
            icon="favorite"
            title="즐겨찾기 기능"
            description={<>마음에 드는 나무를 저장하고<br/>언제든 다시 찾아보세요</>}
            variant="default"
            action={
              <button
                onClick={() => onFavoritesClick()}
                style={{
                  background: 'var(--primary)',
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
            }
          />
        )}
      </div>
    </>
  );
};

export default HomeView;
