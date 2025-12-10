// MobileNavPanel/AboutView.jsx
import { useTranslation } from 'react-i18next';
import IconButton from '../../UI/IconButton';

const AboutView = ({ setActiveView, onDetailClick }) => {
  const { t } = useTranslation();

  // 2025-01-12: 피드백 섹션 hasDetail true로 설정됨
  const sections = [
    {
      id: 'intro',
      title: t('about.intro.title'),
      content: t('about.intro.content'),
      icon: 'map',
      hasDetail: false
    },
    {
      id: 'species',
      title: t('about.species.title'),
      content: t('about.species.content'),
      icon: 'category',
      hasDetail: true
    },
    {
      id: 'favorites',
      title: t('about.favorites.title'),
      content: t('about.favorites.content'),
      icon: 'favorite',
      hasDetail: false
    },
    {
      id: 'data-source',
      title: t('about.dataSource.title'),
      content: t('about.dataSource.content'),
      icon: 'source',
      hasDetail: true
    },
    {
      id: 'eco-benefits',
      title: t('about.ecoBenefits.title'),
      content: t('about.ecoBenefits.content'),
      icon: 'eco',
      hasDetail: true
    },
    {
      id: 'feedback',
      title: t('about.feedback.title'),
      content: t('about.feedback.content'),
      icon: 'feedback',
      hasDetail: true
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 20px 16px 20px',
        borderBottom: '1px solid var(--divider)',
        position: 'sticky',
        top: 0,
        background: 'var(--surface-elevated)',
        zIndex: 10
      }}>
        <IconButton
          icon="arrow_back"
          onClick={() => setActiveView('home')}
          variant="ghost"
          size="medium"
          ariaLabel={t('common.back')}
        />
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          flex: 1
        }}>
          {t('about.title')}
        </h2>
      </div>

      <div style={{
        padding: '20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--outline)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span
                className="material-icons"
                style={{
                  fontSize: '24px',
                  color: 'var(--primary)'
                }}
              >
                {section.icon}
              </span>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {section.title}
              </h3>
            </div>

            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}>
              {section.content}
            </p>

            {section.hasDetail && (
              <button
                onClick={() => onDetailClick(section)}
                style={{
                  alignSelf: 'flex-end',
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--surface-variant)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                {t('about.seeMore')}
                <span className="material-icons" style={{ fontSize: '18px' }}>
                  chevron_right
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutView;
