// src/components/Visit/VisitList.jsx
import React from 'react';

const VisitList = ({ visits, showMyVisitsOnly, onFilterChange, currentUserId, onDeleteVisit }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
          나의 방문만 보기
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
            {showMyVisitsOnly ? '아직 방문 기록이 없습니다' : '첫 방문자가 되어주세요!'}
          </div>
          <div style={{ fontSize: '14px', color: '#bbb' }}>
            {showMyVisitsOnly ? '이 나무를 방문하고 기록을 남겨보세요' : '방문기록을 남겨 이 나무의 이야기를 시작해보세요'}
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
                    🌳
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
                  {visit.userPhotoURL && (
                    <img
                      src={visit.userPhotoURL}
                      alt={visit.userName}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}
                  >
                    {visit.userName}
                  </span>
                  {visit.userId === currentUserId && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: '#4ECDC4',
                        color: 'white',
                        borderRadius: '4px'
                      }}
                    >
                      나
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
                <button
                  onClick={() => {
                    if (window.confirm('이 방문기록을 삭제하시겠습니까?')) {
                      onDeleteVisit(visit.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '12px',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#999',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ff4757';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#ff4757';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#999';
                    e.target.style.borderColor = '#e0e0e0';
                  }}
                  title="삭제"
                >
                  <svg height="32" width="32" viewBox="0 -960 960 960"  fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitList;