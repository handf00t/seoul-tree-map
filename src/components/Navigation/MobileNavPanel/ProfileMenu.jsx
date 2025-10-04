// MobileNavPanel/ProfileMenu.jsx
import IconButton from '../../UI/IconButton';

const ProfileMenu = ({
  user,
  userFavorites,
  setShowProfileMenu,
  onFavoritesClick,
  setActiveView,
  signOut
}) => {
  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
      setShowProfileMenu(false);
    }
  };

  // 비로그인 사용자용 메뉴
  if (!user) {
    return (
      <div style={{
        padding: '20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        animation: 'slideDown 0.3s ease-out',
        height: '40vh',
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
          borderBottom: '1px solid var(--divider)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            서울 나무 지도
          </h3>
          <IconButton
            icon="close"
            onClick={() => setShowProfileMenu(false)}
            variant="close"
            size="medium"
            ariaLabel="메뉴 닫기"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <button
            onClick={() => {
              setShowProfileMenu(false);
              setActiveView('about');
            }}
            style={{
              padding: '16px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--outline)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>info</span>
              <span>소개</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
          </button>

          <button
            style={{
              padding: '16px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--outline)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>language</span>
              <span>언어</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>한국어</span>
          </button>

          <button
            onClick={() => {
              setShowProfileMenu(false);
              onFavoritesClick();
            }}
            style={{
              padding: '16px 20px',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>login</span>
            <span>로그인</span>
          </button>
        </div>
      </div>
    );
  }

  // 로그인 사용자용 메뉴
  return (
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
        borderBottom: '1px solid var(--divider)'
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
              color: 'var(--text-primary)',
              fontSize: '18px',
              marginBottom: '4px'
            }}>
              {user.displayName}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              {user.email}
            </div>
          </div>
        </div>

        <IconButton
          icon="close"
          onClick={() => setShowProfileMenu(false)}
          variant="close"
          size="medium"
          ariaLabel="메뉴 닫기"
        />
      </div>

      <div style={{
        background: 'var(--surface-variant)',
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
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            즐겨찾기한 나무
          </span>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--primary)'
          }}>
            {userFavorites.length}개
          </span>
        </div>

        {userFavorites.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            가장 최근: {userFavorites[0]?.species_kr || '미상'}
            ({userFavorites[0]?.borough})
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <button
          onClick={() => {
            setShowProfileMenu(false);
            setActiveView('favorites');
          }}
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
          onMouseLeave={(e) => e.target.style.background = 'white'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>favorite</span>
            <span>내 즐겨찾기</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
        </button>

        <button
          onClick={() => {
            setShowProfileMenu(false);
            setActiveView('myvisits');
          }}
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
          onMouseLeave={(e) => e.target.style.background = 'white'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>location_on</span>
            <span>나의 방문</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
        </button>

        <button
          onClick={() => {
            setShowProfileMenu(false);
            setActiveView('about');
          }}
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
          onMouseLeave={(e) => e.target.style.background = 'white'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>info</span>
            <span>소개</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
        </button>

        <button
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
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
            <span className="material-icons" style={{ fontSize: '20px' }}>settings</span>
            <span>설정</span>
          </div>
          <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>준비중</span>
        </button>

        <button
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--outline)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
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
            <span className="material-icons" style={{ fontSize: '20px' }}>help</span>
            <span>도움말</span>
          </div>
          <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>준비중</span>
        </button>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          padding: '16px 20px',
          background: 'none',
          border: '1px solid var(--outline)',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--error)',
          cursor: 'pointer',
          marginTop: '20px',
          marginBottom: '80px'
        }}
      >
        로그아웃
      </button>
    </div>
  );
};

export default ProfileMenu;
