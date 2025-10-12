// MobileNavPanel/AboutView.jsx
import IconButton from '../../UI/IconButton';

const AboutView = ({ setActiveView, onDetailClick }) => {
  // 2025-01-12: 피드백 섹션 hasDetail true로 설정됨
  const sections = [
    {
      id: 'intro',
      title: '서울 나무 지도',
      content: '서울시 25개 자치구의 나무를 한 곳에서 확인할 수 있습니다. 위치, 수종, 크기, 그리고 각 나무가 제공하는 생태적 편익을 보여줍니다.',
      icon: 'map',
      hasDetail: false
    },
    {
      id: 'species',
      title: '수종과 크기분류',
      content: '지도에서 각 수종은 고유한 색으로 표시됩니다. 같은 과에 속하는 나무는 비슷한 색상 계열을 사용합니다. 나무 크기는 흉고직경에 따라 다섯단계로 구분합니다.',
      icon: 'category',
      hasDetail: true
    },
    {
      id: 'favorites',
      title: '즐겨찾기와 방문록',
      content: '즐겨찾기를 통해 관심있는 나무를 저장하고, 방문록을 작성하여 직접 찍은 사진과 한미디를 기록할 수 있습니다.',
      icon: 'favorite',
      hasDetail: false
    },
    {
      id: 'data-source',
      title: '데이터 출처',
      content: '서울 열린데이터 광장의 공식 자료를 사용합니다.',
      icon: 'source',
      hasDetail: true
    },
    {
      id: 'eco-benefits',
      title: '생태 편익',
      content: '도시 나무가 제공하는 환경 서비스를 한국형 i-Tree Eco 방법론으로 계산하고 경제적 가치로 환산했습니다. 빗물 관리, 에너지 절약, 공기 정화, 탄소 흡수 효과 를 포함합니다. 계산 방식은 수종, 크기, 위치를 반영하며, 서울시 환경 특성에 맞게 조정된 계수를 사용합니다. ',
      icon: 'eco',
      hasDetail: true
    },
    {
      id: 'feedback',
      title: '피드백',
      content: '개선사항, 기능 제안, 오류 제보를 보내주세요.',
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
          ariaLabel="뒤로 가기"
        />
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          flex: 1
        }}>
          소개
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
                더보기
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
