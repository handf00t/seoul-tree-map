// src/components/UI/LanguageToggle.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (variant === 'mobile') {
    // Mobile menu style
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px'
      }}>
        <button
          onClick={() => changeLanguage('ko')}
          style={{
            flex: 1,
            padding: '12px',
            background: currentLang === 'ko' ? 'var(--primary)' : 'var(--surface)',
            color: currentLang === 'ko' ? 'white' : 'var(--text-secondary)',
            border: currentLang === 'ko' ? 'none' : '1px solid var(--outline)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          한국어
        </button>
        <button
          onClick={() => changeLanguage('en')}
          style={{
            flex: 1,
            padding: '12px',
            background: currentLang === 'en' ? 'var(--primary)' : 'var(--surface)',
            color: currentLang === 'en' ? 'white' : 'var(--text-secondary)',
            border: currentLang === 'en' ? 'none' : '1px solid var(--outline)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          English
        </button>
      </div>
    );
  }

  // Desktop header style (light header - simple text)
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <button
        onClick={() => changeLanguage('ko')}
        style={{
          padding: '8px 8px',
          background: 'transparent',
          color: currentLang === 'ko' ? 'var(--on-surface)' : 'var(--text-tertiary)',
          border: 'none',
          fontSize: '14px',
          fontWeight: currentLang === 'ko' ? '600' : '400',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        KO
      </button>
      <span style={{ color: 'var(--outline)', fontSize: '12px' }}>|</span>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '8px 8px',
          background: 'transparent',
          color: currentLang === 'en' ? 'var(--on-surface)' : 'var(--text-tertiary)',
          border: 'none',
          fontSize: '14px',
          fontWeight: currentLang === 'en' ? '600' : '400',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
