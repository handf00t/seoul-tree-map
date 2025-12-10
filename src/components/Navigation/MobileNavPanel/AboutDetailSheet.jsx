// MobileNavPanel/AboutDetailSheet.jsx
import { useTranslation } from 'react-i18next';
import IconButton from '../../UI/IconButton';

const AboutDetailSheet = ({ section, onClose }) => {
  const { t } = useTranslation();
  if (!section) return null;

  const getDetailContent = (sectionId) => {
    switch (sectionId) {
      case 'intro':
        return {
          title: '서울 나무 지도',
          sections: [
            {
              sectionTitle: null,
              items: [
                '우리 동네 나무 탐색',
                '수종과 크기를 필터링',
                '연간 생태적 편익 확인',
                '즐겨찾기 저장 및 공유'
              ]
            },
            {
              sectionTitle: '지도 표시 방식',
              description: '나무는 원으로 표시됩니다. 원의 크기는 흉고직경을 반영합니다. 수종별로 색상이 나뉩니다. 나무 원도가 높을 자연대로 반투명합니다. 나무 반도가 높을 지역에서 더 선명하게 표시됩니다.'
            }
          ]
        };
      case 'species':
        return {
          title: '수종과 크기분류',
          sections: [
            {
              sectionTitle: '크기 분류 기준',
              items: [
                '소형: 15cm 미만',
                '중소형: 15~30cm',
                '중형: 30cm~50cm',
                '중대형: 50cm~80cm',
                '대형: 80cm 이상'
              ],
              description: '나무 크기는 흉고직경(DBH, 지면에서 1.3m 높이의 줄기 지름)으로 측정합니다. 원의 크기가 클수록 나무가 큽니다.'
            },
            {
              sectionTitle: '나무 유형별 색상',
              items: [
                '보호수: 빨간색 (#FF6B6B)',
                '가로수: 수종별 색상',
                '공원수목: 하늘색 (#45B7D1)'
              ]
            },
            {
              sectionTitle: '가로수 수종별 색상',
              items: [
                '은행나무: 금색 (#FFD700)',
                '느티나무: 진녹색 (#228B22)',
                '플라타너스: 연녹색 (#8FBC8F)',
                '벚나무: 연분홍 (#FFB6C1)',
                '단풍나무: 주황색 (#FF4500)',
                '소나무: 진녹색 (#006400)',
                '버드나무: 라임그린 (#32CD32)',
                '참나무: 갈색 (#8B4513)',
                '기타 수종: 녹색 (#22C55E)'
              ]
            }
          ]
        };
      case 'favorites':
        return {
          title: '즐겨찾기',
          sections: [
            {
              sectionTitle: '사용 방법',
              items: [
                'Dummy item 1',
                'Dummy item 2',
                'Dummy item 3',
                'Dummy item 4'
              ]
            },
            {
              sectionTitle: null,
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            }
          ]
        };
      case 'data-source':
        return {
          title: '데이터 출처',
          sections: [
            {
              sectionTitle: '상세 정보',
              items: [
                '서울시 가로수 위치 정보 https://data.seoul.go.kr/dataList/OA-1325/S/1/datasetView.do',
                '서울시 보호수 및 노거수 위치 정보 https://data.seoul.go.kr/dataList/OA-1323/S/1/datasetView.do',
                '서울시 공원 및 사유지수목 위치정보 https://data.seoul.go.kr/dataList/OA-1324/S/1/datasetView.do',
              ]
            },
          ]
        };
      case 'eco-benefits':
        return {
          title: '생태 편익',
          sections: [
            {
              sectionTitle: '수관면적 측정',
              description: '실측 수관너비가 있으면 우선 사용. 없으면 흉고직경(DBH)과 수종별 회귀식으로 추정'
            },
            {

              sectionTitle: '편익별 계산',
              items: [
                '빗물 흡수 : 수관면적 1㎡당 연간 157리터 흡수. 상수도 요금 기준 가치 환산 (0.85원/L)',
                '에너지 절약: 건물 근접도에 따라 차등 적용. 고밀도 지역(중구 75%) > 저밀도 지역(서초구 21%). 전기 요금 기준 환산 (175원/kWh)',
                '대기 정화: 수관면적 1㎡당 연간 129g 오염물질 제거. 수종별 보정 (소나무 1.3배, 느티나무 1.0배 등). PM2.5, PM10, NO₂ 등 5대 오염물질 포함',
                '탄소 흡수 : 수종별 상대생장식으로 바이오매스 계산. 연간 성장률 2% 적용. 배출권 거래가 기준 환산 (45원/kg)'
              ]
            }
          ]
        };
      case 'feedback':
        return {
          title: '피드백',
          sections: [
            {
              sectionTitle: '문의 및 제안',
              description: '서울 나무 지도에 대한 의견, 버그 제보, 기능 제안 등 모든 피드백을 환영합니다.'
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
                href="mailto:handfoot119@gmail.com?subject=서울 나무 지도 피드백&body=안녕하세요,%0D%0A%0D%0A피드백 내용을 작성해주세요."
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
