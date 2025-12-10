// src/components/Visit/VisitList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../UI/IconButton';

const VisitList = ({ visits, showMyVisitsOnly, onFilterChange, currentUserId, onDeleteVisit }) => {
  const { t, i18n } = useTranslation();

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const locale = i18n.language === 'en' ? 'en-US' : 'ko-KR';
    return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 익명화된 닉네임 생성
  const getAnonymousName = (userId) => {
    const animals = i18n.language === 'en'
      ? ['Raccoon', 'Squirrel', 'Cat', 'Dog', 'Rabbit', 'Fox', 'Hamster', 'Panda', 'Koala', 'Penguin']
      : ['너구리', '다람쥐', '고양이', '강아지', '토끼', '여우', '햄스터', '판다', '코알라', '펭귄'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const animal = animals[hash % animals.length];
    return t('visits.anonymousAnimal', { animal });
  };

  return (
    <div style={{ padding: '12px 0px' }}>
      {/* 필터 (로그인 사용자만) */}
      {currentUserId && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}
        >
          <input
            type="checkbox"
            checked={showMyVisitsOnly}
            onChange={(e) => onFilterChange(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          {t('visits.myVisitsOnly')}
        </label>
      )}

      {/* 방문 기록이 없을 때 */}
      {visits.length === 0 ? (
        <div
          style={{
            padding: '60px 10px',
            textAlign: 'center',
            color: '#999'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}><svg height="48" width="48"viewBox="0 -960 960 960"  fill="currentColor"><path d="M200-80v-80h240v-160h-80q-83 0-141.5-58.5T160-520q0-60 33-110.5t89-73.5q9-75 65.5-125.5T480-880q76 0 132.5 50.5T678-704q56 23 89 73.5T800-520q0 83-58.5 141.5T600-320h-80v160h240v80H200Zm160-320h240q50 0 85-35t35-85q0-36-20.5-66T646-630l-42-18-6-46q-6-45-39.5-75.5T480-800q-45 0-78.5 30.5T362-694l-6 46-42 18q-33 14-53.5 44T240-520q0 50 35 85t85 35Zm120-200Z"/></svg></div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            {showMyVisitsOnly ? t('visits.noMyVisits') : t('visits.beFirstVisitor')}
          </div>
          <div style={{ fontSize: '14px', color: '#bbb' }}>
            {showMyVisitsOnly ? t('visits.visitAndRecord') : t('visits.startTreeStory')}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {visits.map((visit) => (
            <div
              key={visit.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                position: 'relative'
              }}
            >
              {/* 사진 */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#e0e0e0'
                }}
              >
                {visit.photoURL ? (
                  <img
                    src={visit.photoURL}
                    alt="방문 사진"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '32px' }}>park</span>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* 사용자 정보 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}
                  >
                    {getAnonymousName(visit.userId)}
                  </span>
                  {visit.userId === currentUserId && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}
                    >
                      {i18n.language === 'en' ? 'You' : '본인'}
                    </span>
                  )}
                </div>

                {/* 날짜 */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '8px'
                  }}
                >
                  {formatDate(visit.createdAt)}
                </div>

                {/* 코멘트 */}
                <div
                  style={{
                    fontSize: '15px',
                    color: '#333',
                    lineHeight: '1.4',
                    wordBreak: 'break-word'
                  }}
                >
                  {visit.comment}
                </div>
              </div>

              {/* 삭제 버튼 (본인 작성글만) */}
              {visit.userId === currentUserId && onDeleteVisit && (
                <IconButton
                  icon="delete"
                  onClick={() => {
                    if (window.confirm(t('visits.confirmDelete'))) {
                      onDeleteVisit(visit.id);
                    }
                  }}
                  variant="danger"
                  size="medium"
                  ariaLabel={t('common.delete')}
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '12px'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitList;