// MobileNavPanel/FavoritesView.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import IconButton from '../../UI/IconButton';
import LoadingSpinner from '../../UI/LoadingSpinner';
import EmptyState from '../../UI/EmptyState';

const FavoritesView = ({
  setActiveView,
  handleTreeSelect,
  handleFavoriteDelete
}) => {
  const { userFavorites, loadUserFavorites, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 즐겨찾기 새로고침
  const refreshFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    await loadUserFavorites(user.uid);
    setIsLoading(false);
  };

  // 컴포넌트 마운트 시 즐겨찾기 로드
  useEffect(() => {
    if (user) {
      refreshFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // 나무 타입 한글 변환
  const getTreeTypeName = (type) => {
    switch(type) {
      case 'protected': return '보호수';
      case 'roadside': return '가로수';
      case 'park': return '공원수목';
      default: return type;
    }
  };

  return (
    <div style={{
      padding: '0',
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '80dvh',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--divider)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => setActiveView('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          <span className="material-icons" style={{ fontSize: '24px' }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            내 즐겨찾기
          </h3>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            저장한 나무 {userFavorites.length}개
          </p>
        </div>
      </div>


      {/* 즐겨찾기 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))'
      }}>
        {isLoading ? (
          <LoadingSpinner text="즐겨찾기를 불러오는 중..." />
        ) : userFavorites.length === 0 ? (
          <EmptyState
            icon="park"
            title="아직 저장한 나무가 없어요"
            description="마음에 드는 나무를 찾아서 하트 버튼을 눌러보세요!"
            variant="plain"
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {userFavorites.map((favorite) => (
              <div
                key={favorite.id}
                onClick={() => handleTreeSelect(favorite)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--surface-variant)',
                  borderRadius: '12px',
                  border: '1px solid var(--outline-variant)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {/* 나무 색상 동그라미 */}
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getTreeColor(favorite),
                    flexShrink: 0
                  }} />

                  {/* 나무 정보 */}
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
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-disabled)',
                      marginTop: '2px'
                    }}>
                      ID: {favorite.tree_id || favorite.id}
                    </div>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <IconButton
                  icon="delete"
                  onClick={(e) => handleFavoriteDelete(favorite.id, e)}
                  variant="danger"
                  size="small"
                  ariaLabel="삭제"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
