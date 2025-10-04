// src/components/Visit/VisitRecordForm.jsx
import React, { useState } from 'react';

const VisitRecordForm = ({ photo, treeData, onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);

  // Blob을 미리보기 URL로 변환
  React.useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoURL(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photo]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    await onSubmit(comment);
    setIsSubmitting(false);
  };

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 3000
        }}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '20px 20px 0 0',
          zIndex: 3001,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            방문기록 작성
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {/* 나무 정보 */}
          <div
            style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
              {treeData.species_kr}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {treeData.borough} {treeData.district}
            </div>
          </div>

          {/* 사진 미리보기 */}
          {photoURL && (
            <div style={{ marginBottom: '20px' }}>
              <img
                src={photoURL}
                alt="촬영한 사진"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* 한마디 입력 */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}
            >
              한마디 ({comment.length}/14)
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 14) {
                  setComment(value);
                }
              }}
              placeholder="이 나무에 대한 한마디를 남겨주세요"
              maxLength={14}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '12px'
          }}
        >
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f8f9fa',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            style={{
              flex: 2,
              padding: '14px',
              background: !comment.trim() || isSubmitting ? '#ccc' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: !comment.trim() || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  className="loading-spinner"
                  style={{ width: '16px', height: '16px' }}
                />
                업로드 중...
              </>
            ) : (
              '업로드'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default VisitRecordForm;