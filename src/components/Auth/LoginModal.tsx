// components/Auth/LoginModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface UserProfileProps {
  onFavoritesClick: () => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert(t('auth.loginFailed') + ': ' + result.error);
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
          zIndex: 2999,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* 로그인 모달 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--surface)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px var(--shadow-color-xl)',
        zIndex: 3000,
        width: 'min(90vw, 400px)',
        maxHeight: '85vh',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '24px 24px 0 24px',
          textAlign: 'center'
        }}>
          <img src="/logo.svg" alt="Logo" style={{ width: '64px', height: '64px', marginBottom: '12px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--text-heading)'
          }}>
            {t('auth.welcomeMessage')}
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {t('auth.loginDescription')}
          </p>
        </div>

        {/* 로그인 버튼 영역 */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'var(--google-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'var(--google-blue-dark)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'var(--google-blue)';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--surface)',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {t('auth.loggingIn')}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.continueWithGoogle')}
              </>
            )}
          </button>

          {/* 로그인 혜택 안내 */}
          <div style={{
            background: 'var(--surface-variant)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-heading)'
            }}>
              {t('auth.loginBenefitsTitle')}
            </h4>
            <ul style={{
              margin: 0,
              padding: '0 0 0 16px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              <li>{t('auth.loginBenefit1')}</li>
              <li>{t('auth.loginBenefit2')}</li>
            </ul>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--surface-variant)',
              color: 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {t('auth.later')}
          </button>
        </div>
      </div>

      {/* 애니메이션 CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

// components/Auth/UserProfile.tsx
export const UserProfile: React.FC<UserProfileProps> = ({ onFavoritesClick, onClose }) => {
  const { t } = useTranslation();
  const { user, signOut, userFavorites } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    onClose();
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      right: '0',
      background: 'var(--surface)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px var(--shadow-color-md)',
      minWidth: '280px',
      zIndex: 2000,
      animation: 'slideDown 0.2s ease-out'
    }}>
      {/* 사용자 정보 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--outline-light)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img
            src={user.photoURL || ''}
            alt={user.displayName || ''}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: '600',
              color: 'var(--text-heading)',
              fontSize: '14px'
            }}>
              {user.displayName}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>


      {/* 메뉴 항목들 */}
      <div style={{ padding: '8px 0' }}>
        <button
          onClick={onFavoritesClick}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--text-heading)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-variant)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <span className="material-icons">star</span> {t('favorites.favoriteTrees')} {t('favorites.treesCount', { count: userFavorites.length })}

        </button>

        <button
          onClick={handleSignOut}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s',
            opacity: isLoading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.background = 'var(--surface-variant)';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.background = 'none';
          }}
        >
          {isLoading ? t('auth.loggingOut') : <><span className="material-icons">logout</span> {t('auth.logout')}</>}
        </button>
      </div>

      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginModal;
