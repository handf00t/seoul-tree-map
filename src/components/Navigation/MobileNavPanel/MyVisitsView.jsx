// MobileNavPanel/MyVisitsView.jsx
import IconButton from '../../UI/IconButton';
import LoadingSpinner from '../../UI/LoadingSpinner';
import EmptyState from '../../UI/EmptyState';

const MyVisitsView = ({
  myVisits,
  loadingMyVisits,
  setActiveView,
  handleMyVisitClick,
  handleDeleteMyVisit,
  formatDate
}) => {
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
            나의 방문
          </h3>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: 'var(--text-secondary)'
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
          <LoadingSpinner text="방문기록을 불러오는 중..." />
        ) : myVisits.length === 0 ? (
          <EmptyState
            icon="park"
            title="아직 방문 기록이 없습니다"
            description="나무를 방문하고 첫 기록을 남겨보세요!"
            variant="plain"
          />
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
                  background: 'var(--surface-variant)',
                  borderRadius: '12px',
                  border: '1px solid var(--outline-variant)',
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
                    background: 'var(--outline)'
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
                        color: 'var(--primary)'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '40px' }}>park</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {visit.treeInfo?.species_kr || '미상'}
                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px'
                  }}>
                    {visit.treeInfo?.borough} {visit.treeInfo?.district}
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
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
                    color: 'var(--text-tertiary)'
                  }}>
                    {formatDate(visit.createdAt)}
                  </div>
                </div>

                <IconButton
                  icon="delete"
                  onClick={(e) => handleDeleteMyVisit(visit.id, e)}
                  variant="danger"
                  size="medium"
                  ariaLabel="삭제"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisitsView;
