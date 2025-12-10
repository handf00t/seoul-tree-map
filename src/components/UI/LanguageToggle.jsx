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

  // Desktop header style
  return (
    <div style={{
      display: 'flex',
      gap: '0',
      background: 'var(--surface-variant)',
      borderRadius: '8px',
      padding: '4px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <button
        onClick={() => changeLanguage('ko')}
        style={{
          padding: '6px 12px',
          background: currentLang === 'ko' ? 'var(--surface)' : 'transparent',
          color: currentLang === 'ko' ? 'var(--text-primary)' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: currentLang === 'ko' ? 'var(--shadow-sm)' : 'none'
        }}
      >
        KO
      </button>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '6px 12px',
          background: currentLang === 'en' ? 'var(--surface)' : 'transparent',
          color: currentLang === 'en' ? 'var(--text-primary)' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: currentLang === 'en' ? 'var(--shadow-sm)' : 'none'
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
