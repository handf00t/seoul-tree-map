// components/SplashScreen/SplashScreen.tsx
import React, { useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

interface Leaf {
  id: number;
  left: string;
  delay: number;
  duration: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const leaves: Leaf[] = [
    { id: 1, left: '15%', delay: 0, duration: 2 },
    { id: 2, left: '35%', delay: 0.2, duration: 2.3 },
    { id: 3, left: '55%', delay: 0.4, duration: 1.8 },
    { id: 4, left: '75%', delay: 0.1, duration: 2.1 },
    { id: 5, left: '25%', delay: 0.6, duration: 2.2 },
    { id: 6, left: '85%', delay: 0.3, duration: 1.9 }
  ];

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('hasVisitedBefore', 'true');
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0.8;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes treeAppear {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            60% {
              transform: scale(1.1);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes titleFadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes tapHint {
            0%, 100% {
              opacity: 0.6;
              transform: translateY(0);
            }
            50% {
              opacity: 1;
              transform: translateY(-5px);
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          .splash-exit {
            animation: fadeOut 0.3s ease-out forwards;
          }

          @media (max-width: 768px) {
            .splash-tree-icon {
              font-size: 100px !important;
            }

            .splash-title h1 {
              font-size: 28px !important;
            }

            .splash-title p {
              font-size: 12px !important;
            }

            .splash-leaf {
              font-size: 32px !important;
            }
          }

          @supports (padding: max(0px)) {
            .splash-hint {
              bottom: max(40px, env(safe-area-inset-bottom)) !important;
            }
          }
        `}
      </style>

      <div
        className={isExiting ? 'splash-exit' : ''}
        onClick={handleClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #A8E6CF 0%, #4ECDC4 50%, #44A08D 100%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        {leaves.map(leaf => (
          <div
            key={leaf.id}
            className="splash-leaf"
            style={{
              position: 'absolute',
              top: '-50px',
              left: leaf.left,
              fontSize: '40px',
              animation: `fall ${leaf.duration}s ease-in ${leaf.delay}s forwards`,
              opacity: 0.8
            }}
          >
            <span className="material-icons" style={{ fontSize: '40px' }}>eco</span>
          </div>
        ))}

        <div
          className="splash-tree-icon"
          style={{
            fontSize: '120px',
            animation: 'treeAppear 0.6s ease-out 1s forwards',
            opacity: 0,
            transform: 'scale(0)'
          }}
        >
          <span className="material-icons" style={{ fontSize: '120px' }}>park</span>
        </div>

        <div
          className="splash-title"
          style={{
            marginTop: '24px',
            textAlign: 'center',
            animation: 'titleFadeIn 0.5s ease-out 1.8s forwards',
            opacity: 0
          }}
        >
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            서울시 나무지도
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '2px'
          }}>
            Seoul Urban Forest Explorer
          </p>
        </div>

        <div
          className="splash-hint"
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            animation: 'tapHint 1.5s ease-in-out 2.5s infinite',
            opacity: 0
          }}
        >
          화면을 터치하세요
        </div>
      </div>
    </>
  );
};

export default SplashScreen;
