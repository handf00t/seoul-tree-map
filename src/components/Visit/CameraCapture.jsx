// src/components/Visit/CameraCapture.jsx
import React, { useRef, useEffect, useState } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsReady(true);
      }
    } catch (err) {
      console.error('카메라 접근 실패:', err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Blob으로 변환 (리사이징 및 압축)
    canvas.toBlob(
      (blob) => {
        stopCamera();
        onCapture(blob);
      },
      'image/jpeg',
      0.8 // 품질 80%
    );
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--overlay-darker)',
          zIndex: 3000
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '600px',
          zIndex: 3001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        {error ? (
          <div
            style={{
              background: 'var(--surface)',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}
          >
            <span className="material-icons" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>photo_camera</span>
            <div style={{ color: '#666', marginBottom: '20px' }}>{error}</div>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'var(--surface)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxHeight: '70vh',
                borderRadius: '12px',
                background: '#000'
              }}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '0 20px'
              }}
            >
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'var(--overlay-lighter)',
                  color: '#333',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                onClick={capturePhoto}
                disabled={!isReady}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: isReady ? 'var(--primary)' : 'var(--text-disabled)',
                  color: 'var(--surface)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isReady ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span className="material-icons">photo_camera</span> 촬영
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CameraCapture;