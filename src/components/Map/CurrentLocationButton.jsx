// src/components/Map/CurrentLocationButton.jsx
import React, { useState } from 'react';

const CurrentLocationButton = ({ map, isMobile, minimizedPopupHeight }) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (!map || isLocating) return;

    if (!navigator.geolocation) {
      alert('위치 서비스를 사용할 수 없습니다.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        map.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 2000
        });

        setIsLocating(false);
      },
      (error) => {
        console.error('위치 조회 실패:', error);
        let errorMessage = '현재 위치를 가져올 수 없습니다.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 조회 시간이 초과되었습니다.';
            break;
        }
        
        alert(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getBottomPosition = () => {
    if (isMobile) {
      return `${80 + minimizedPopupHeight}px`;
    }
    return '20px';
  };

  return (
    <button
      onClick={handleCurrentLocation}
      disabled={isLocating}
      style={{
        position: 'fixed',
        bottom: getBottomPosition(),
        right: isMobile ? '20px' : '20px',
        width: '48px',
        height: '48px',
        background: isLocating ? '#ccc' : 'white',
        border: 'none',
        borderRadius: '50%',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        cursor: isLocating ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        opacity: isLocating ? 0.6 : 1
      }}
      onMouseEnter={(e) => {
        if (!isLocating) {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLocating) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
      title="현재 위치"
    >
      {isLocating ? (
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #666',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#4ECDC4">
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" />
        </svg>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
};

export default CurrentLocationButton;