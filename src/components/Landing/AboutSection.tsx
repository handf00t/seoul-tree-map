// src/components/Landing/AboutSection.tsx
// 프로젝트 소개 섹션
import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '400,000+', label: t('landing.statTrees', '나무') },
    { value: '25', label: t('landing.statDistricts', '자치구') },
    { value: '100+', label: t('landing.statSpecies', '수종') }
  ];

  return (
    <section id="about" style={{
      padding: '80px 24px',
      background: '#E8E6E1',  // 연한 회색/베이지 톤
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* 타이틀 */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--on-surface)',
          marginBottom: '16px'
        }}>
          {t('landing.aboutTitle', '서울 나무 지도 프로젝트')}
        </h2>

        {/* 설명 */}
        <p style={{
          fontSize: '17px',
          lineHeight: 1.7,
          color: 'var(--on-surface-variant)',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          {t('landing.aboutDesc', '서울시 열린데이터를 활용하여 도시의 나무들을 시각화하고, 각 나무가 우리에게 제공하는 환경적 가치를 계산합니다. 가로수, 공원수목, 보호수 데이터를 통합하여 서울의 도시 숲을 탐험해보세요.')}
        </p>

        {/* 통계 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          flexWrap: 'wrap'
        }}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div style={{
                fontSize: '36px',
                fontWeight: 800,
                color: 'var(--primary)',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--on-surface-variant)'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
