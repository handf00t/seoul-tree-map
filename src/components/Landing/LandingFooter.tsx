// src/components/Landing/LandingFooter.tsx
// 랜딩 페이지 푸터
import React from 'react';
import { useTranslation } from 'react-i18next';

const LandingFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      padding: '32px 24px',
      background: '#2D5A3D',
      borderTop: 'none'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* 카피라이트 */}
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          © {currentYear} Seoul Tree Map. {t('landing.footerRights', 'All rights reserved.')}
        </div>

        {/* 링크들 */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <a
            href="https://github.com/handf00t/seoul-tree-map"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            GitHub
          </a>
          <a
            href="mailto:handfoot119@gmail.com"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            {t('landing.contact', 'Contact')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
