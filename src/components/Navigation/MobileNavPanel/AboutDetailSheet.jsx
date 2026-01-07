// MobileNavPanel/AboutDetailSheet.jsx
import { useTranslation } from 'react-i18next';
import IconButton from '../../UI/IconButton';

const AboutDetailSheet = ({ section, onClose }) => {
  const { t, i18n } = useTranslation();
  if (!section) return null;

  const getDetailContent = (sectionId) => {
    switch (sectionId) {
      case 'intro':
        return {
          title: t('about.detail.intro.title'),
          sections: [
            {
              sectionTitle: null,
              items: t('about.detail.intro.features', { returnObjects: true })
            },
            {
              sectionTitle: t('about.detail.intro.mapDisplayTitle'),
              description: t('about.detail.intro.mapDisplayDesc')
            }
          ]
        };
      case 'species':
        return {
          title: t('about.detail.species.title'),
          sections: [
            {
              sectionTitle: t('about.detail.species.sizeTitle'),
              items: t('about.detail.species.sizeItems', { returnObjects: true }),
              description: t('about.detail.species.sizeDesc')
            },
            {
              sectionTitle: t('about.detail.species.colorTitle'),
              items: t('about.detail.species.colorItems', { returnObjects: true })
            },
            {
              sectionTitle: t('about.detail.species.speciesColorTitle'),
              items: t('about.detail.species.speciesColorItems', { returnObjects: true })
            }
          ]
        };
      case 'data-source':
        return {
          title: t('about.detail.dataSource.title'),
          sections: [
            {
              sectionTitle: t('about.detail.dataSource.detailTitle'),
              items: t('about.detail.dataSource.items', { returnObjects: true })
            },
          ]
        };
      case 'eco-benefits':
        return {
          title: t('about.detail.ecoBenefits.title'),
          sections: [
            {
              sectionTitle: t('about.detail.ecoBenefits.crownTitle'),
              description: t('about.detail.ecoBenefits.crownDesc')
            },
            {
              sectionTitle: t('about.detail.ecoBenefits.calcTitle'),
              items: t('about.detail.ecoBenefits.calcItems', { returnObjects: true })
            }
          ]
        };
      case 'feedback':
        return {
          title: t('about.detail.feedback.title'),
          sections: [
            {
              sectionTitle: t('about.detail.feedback.inquiryTitle'),
              description: t('about.detail.feedback.inquiryDesc')
            },
            {
              sectionTitle: null,
              emailButton: true
            }
          ]
        };
      default:
        return {
          title: section.title,
          sections: []
        };
    }
  };

  const content = getDetailContent(section.id);

  // Email subject and body based on language
  const emailSubject = i18n.language === 'ko'
    ? '서울 나무 지도 피드백'
    : 'Seoul Tree Map Feedback';
  const emailBody = i18n.language === 'ko'
    ? '안녕하세요,%0D%0A%0D%0A피드백 내용을 작성해주세요.'
    : 'Hello,%0D%0A%0D%0APlease write your feedback here.';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--surface-elevated)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid var(--divider)',
        position: 'sticky',
        top: 0,
        background: 'var(--surface-elevated)',
        zIndex: 10
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)'
        }}>
          {content.title}
        </h2>
        <IconButton
          icon="close"
          onClick={onClose}
          variant="close"
          size="medium"
          ariaLabel={t('common.close')}
        />
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {content.sections?.map((sec, index) => (
          <div key={index}>
            {sec.sectionTitle && (
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                {sec.sectionTitle}
              </h3>
            )}

            {sec.items && sec.items.length > 0 && (
              <div style={{
                background: 'var(--surface-variant)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: sec.description ? '12px' : '0'
              }}>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {sec.items.map((item, itemIndex) => {
                    // 색상 코드 추출
                    const colorMatch = item.match(/#[0-9A-Fa-f]{6}/);
                    const hasColor = colorMatch !== null;

                    // URL 추출
                    const urlMatch = item.match(/(https?:\/\/[^\s]+)/);
                    const hasUrl = urlMatch !== null;
                    const text = hasUrl ? item.replace(urlMatch[0], '').trim() : item;
                    const url = hasUrl ? urlMatch[0] : null;

                    return (
                      <li
                        key={itemIndex}
                        style={{
                          fontSize: '15px',
                          lineHeight: '1.6',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {hasColor && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: colorMatch[0],
                              border: '2px solid white',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              flexShrink: 0
                            }}
                          />
                        )}
                        <span style={{ flex: 1 }}>
                          {text}
                          {hasUrl && (
                            <>
                              {' '}
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'var(--primary)',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '14px'
                                }}
                              >
                                {t('about.link')}
                                <span className="material-icons" style={{ fontSize: '16px' }}>
                                  open_in_new
                                </span>
                              </a>
                            </>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {sec.description && (
              <p style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.8',
                color: 'var(--text-secondary)'
              }}>
                {sec.description}
              </p>
            )}

            {sec.emailButton && (
              <a
                href={`mailto:handfoot119@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
                  cursor: 'pointer',
                  width: '100%',
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <span className="material-icons" style={{ fontSize: '24px' }}>email</span>
                <span>{t('about.sendFeedbackEmail')}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutDetailSheet;
