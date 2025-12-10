// MobileNavPanel/ProfileMenu.jsx
import { useTranslation } from 'react-i18next';
import IconButton from '../../UI/IconButton';
import LanguageToggle from '../../UI/LanguageToggle';
import { getTreeSpeciesName } from '../../../utils/treeSpeciesTranslation';

const ProfileMenu = ({
  user,
  userFavorites,
  setShowProfileMenu,
  onFavoritesClick,
  setActiveView,
  signOut
}) => {
  const { t, i18n } = useTranslation();

  const handleSignOut = async () => {
    if (window.confirm(t('auth.confirmLogout'))) {
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
            {t('common.appName')}
          </h3>
          <IconButton
            icon="close"
            onClick={() => setShowProfileMenu(false)}
            variant="close"
            size="medium"
            ariaLabel={t('common.closeMenu')}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <button
            onClick={() => {
              setShowProfileMenu(false);
              setActiveView('blog');
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
              <span className="material-icons" style={{ fontSize: '20px' }}>article</span>
              <span>{t('navigation.blog')}</span>
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
            onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>info</span>
              <span>{t('navigation.about')}</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
          </button>
        </div>

        {/* 언어 설정 */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--divider)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            paddingLeft: '20px'
          }}>
            {t('common.languageSettings')}
          </div>
          <LanguageToggle variant="mobile" />
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => {
              setShowProfileMenu(false);
              onFavoritesClick();
            }}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--primary)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--primary)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--surface)';
              e.target.style.color = 'var(--primary)';
            }}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>login</span>
            <span>{t('auth.login')}</span>
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
          ariaLabel={t('common.closeMenu')}
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
            {t('favorites.favoriteTrees')}
          </span>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--primary)'
          }}>
            {t('favorites.treesCount', { count: userFavorites.length })}
          </span>
        </div>

        {userFavorites.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {t('favorites.mostRecent')}: {getTreeSpeciesName(userFavorites[0]?.species_kr, i18n.language)}
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
            <span>{t('favorites.myFavorites')}</span>
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
            <span>{t('visits.myVisits')}</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
        </button>

        <button
          onClick={() => {
            setShowProfileMenu(false);
            setActiveView('blog');
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
            <span className="material-icons" style={{ fontSize: '20px' }}>article</span>
            <span>{t('navigation.blog')}</span>
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
            <span>{t('navigation.about')}</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{'>'}</span>
        </button>
      </div>

      {/* 언어 설정 */}
      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid var(--divider)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          paddingLeft: '20px'
        }}>
          {t('common.languageSettings')}
        </div>
        <LanguageToggle variant="mobile" />
      </div>

      <button
        onClick={handleSignOut}
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          border: '1px solid var(--error)',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--error)',
          cursor: 'pointer',
          marginTop: '20px',
          marginBottom: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--error)';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--surface)';
          e.target.style.color = 'var(--error)';
        }}
      >
        <span className="material-icons" style={{ fontSize: '20px' }}>logout</span>
        <span>{t('auth.logout')}</span>
      </button>
    </div>
  );
};

export default ProfileMenu;
