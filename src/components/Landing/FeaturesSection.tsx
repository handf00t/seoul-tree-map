// src/components/Landing/FeaturesSection.tsx
// Apple 스타일 기능 소개 섹션
import React from 'react';
import { useTranslation } from 'react-i18next';

interface FeatureCardProps {
  icon: React.ReactNode;
  text: string;
  highlight: string;
  highlightColor: string;
  suffix?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, text, highlight, highlightColor, suffix }) => (
  <div style={{
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '28px 24px',
    flex: '1 1 280px',
    maxWidth: '340px',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 8px rgba(45, 90, 61, 0.06)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
  }}
  >
    {/* 아이콘 */}
    <div style={{ marginBottom: '20px' }}>
      {icon}
    </div>

    {/* 텍스트 */}
    <div style={{
      fontSize: '19px',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#1d1d1f',
      paddingRight: '40px'
    }}>
      {text} <span style={{ color: highlightColor }}>{highlight}</span>{suffix && ` ${suffix}`}
    </div>

    {/* + 버튼 */}
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#2D5A3D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#3D7A4D';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#2D5A3D';
    }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  </div>
);

// 커스텀 아이콘 SVG 컴포넌트들
const TreeIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22v-7"/>
    <path d="M9 22h6"/>
    <path d="M12 15l-4-4h2.5L8 8h2l-2-3h8l-2 3h2l-2.5 3H16l-4 4z"/>
  </svg>
);

const LeafValueIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 12.5c0-5 4.5-9 9.5-9 0 5-4.5 9-9.5 9z"/>
    <path d="M6.5 12.5c0 4.5 4 8 8.5 8"/>
    <path d="M10 9l2 2 4-4"/>
  </svg>
);

const HeartBookmarkIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
    <path d="M12 8l1.5 1.5L12 11l-1.5-1.5L12 8z"/>
  </svg>
);

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <TreeIcon />,
      text: t('landing.feature1Text', '서울 전역'),
      highlight: t('landing.feature1Highlight', '40만+ 나무'),
      highlightColor: '#22C55E',
      suffix: t('landing.feature1Suffix', '데이터 탐색')
    },
    {
      icon: <LeafValueIcon />,
      text: t('landing.feature2Text', '나무별'),
      highlight: t('landing.feature2Highlight', '연간 환경 가치'),
      highlightColor: '#F97316',
      suffix: t('landing.feature2Suffix', '확인')
    },
    {
      icon: <HeartBookmarkIcon />,
      text: t('landing.feature3Text', '마음에 드는 나무'),
      highlight: t('landing.feature3Highlight', '즐겨찾기'),
      highlightColor: '#3B82F6',
      suffix: t('landing.feature3Suffix', '및 방문 기록')
    }
  ];

  return (
    <section style={{
      padding: '60px 24px',
      background: '#F0FDF9',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {/* 섹션 타이틀 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1d1d1f',
            marginBottom: '0'
          }}>
            {t('landing.featuresTitle', '서울 나무 지도의 특별한 기능')}
          </h2>
        </div>

        {/* 기능 카드들 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start'
        }}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
