// src/components/Popup/TreePopup.jsx - 모바일 탭 구조 추가 (PC는 기존 유지)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitService } from '../../services/firebase';
import CameraCapture from '../Visit/CameraCapture';
import VisitRecordForm from '../Visit/VisitRecordForm';
import VisitList from '../Visit/VisitList';

const TreePopup = ({ treeData, onClose, isVisible, map, onMinimizedChange, isMapInteracting, onLoginRequest }) => {
  const { user, addToFavorites, removeFromFavorites, isFavorite, recordTreeView } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [shareStatus, setShareStatus] = useState('idle');
  const [showBenefits, setShowBenefits] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState('idle');
  const [isMinimized, setIsMinimized] = useState(false);

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const dragThreshold = 50;

  // 모바일 전용 - 방문기록 관련 상태
  const [activeTab, setActiveTab] = useState('info');
  const [visits, setVisits] = useState([]);
  const [showMyVisitsOnly, setShowMyVisitsOnly] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);

  const isTreeFavorited = user && treeData ? isFavorite(treeData) : false;

  const hasBenefitsData = treeData && (
    treeData.total_annual_value_krw ||
    treeData.stormwater_liters_year ||
    treeData.energy_kwh_year ||
    treeData.air_pollution_kg_year ||
    treeData.carbon_storage_kg_year
  );

  // 방문기록 로드 (모바일 + 방문록 탭일 때만)
  useEffect(() => {
    if (isMobile && isVisible && activeTab === 'visits' && treeData && treeData.source_id) {
      loadVisits();
    }
  }, [isMobile, isVisible, activeTab, treeData, showMyVisitsOnly]);

  const loadVisits = async () => {
    if (!treeData.source_id) return;
    
    setLoadingVisits(true);
    const result = await visitService.getTreeVisits(
      treeData.source_id,
      showMyVisitsOnly ? user?.uid : null
    );
    
    if (result.success) {
      setVisits(result.visits);
    }
    setLoadingVisits(false);
  };
  const handleDeleteVisit = async (visitId) => {
  if (!user) return;
  
  const result = await visitService.deleteVisit(user.uid, visitId);
  if (result.success) {
    loadVisits(); // 목록 새로고침
  } else {
    alert('삭제 실패: ' + result.error);
  }
};

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    return Math.round(num).toLocaleString();
  };

  const formatKRW = (amount) => {
    if (!amount || amount === 0) return '0원';
    return `${formatNumber(amount)}원`;
  };

  const hasValidData = (value) => {
    return value != null && value !== 0 && value !== '' && !isNaN(value) && value > 0;
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      if (onLoginRequest) {
        onLoginRequest();
      }
      return;
    }

    if (!treeData || !treeData.source_id) {
      alert('나무 정보가 없습니다.');
      return;
    }

    if (favoriteStatus !== 'idle') return;

    try {
      if (isTreeFavorited) {
        setFavoriteStatus('removing');
        await removeFromFavorites(treeData.source_id);
      } else {
        setFavoriteStatus('adding');
        await addToFavorites(treeData);
        recordTreeView(treeData);
      }
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
    } finally {
      setFavoriteStatus('idle');
    }
  };

  const handleShare = async () => {
    if (!treeData || !treeData.clickCoordinates) return;

    setShareStatus('copying');

    try {
      const params = new URLSearchParams({
        lat: treeData.clickCoordinates.lat.toFixed(6),
        lng: treeData.clickCoordinates.lng.toFixed(6),
        species: treeData.species_kr || '미상',
        type: treeData.tree_type || 'unknown',
        id: treeData.source_id || '',
        borough: treeData.borough || '',
        district: treeData.district || ''
      });

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000);

    } catch (error) {
      console.error('URL 복사 실패:', error);
      setShareStatus('failed');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const handleVisitRecord = () => {
    if (!user) {
      if (onLoginRequest) {
        onLoginRequest();
      }
      return;
    }
    setShowCamera(true);
  };

  const handlePhotoCapture = (photoBlob) => {
    setCapturedPhoto(photoBlob);
    setShowCamera(false);
    setShowVisitForm(true);
  };

  const handleVisitSubmit = async (comment) => {
    if (!user || !capturedPhoto || !treeData) return;

    try {
      const uploadResult = await visitService.uploadVisitPhoto(
        user.uid,
        treeData.source_id,
        capturedPhoto
      );

      if (!uploadResult.success) {
        alert('사진 업로드에 실패했습니다: ' + uploadResult.error);
        return;
      }

      const visitResult = await visitService.addVisit(
        user.uid,
        user.displayName,
        user.photoURL,
        treeData,
        uploadResult.photoURL,
        comment
      );

      if (visitResult.success) {
        setShowVisitForm(false);
        setCapturedPhoto(null);
        setActiveTab('visits');
        loadVisits();
        alert('방문기록이 등록되었습니다!');
      } else {
        alert('방문기록 저장에 실패했습니다: ' + visitResult.error);
      }
    } catch (error) {
      console.error('방문기록 처리 중 오류:', error);
      alert('방문기록 처리 중 오류가 발생했습니다.');
    }
  };

  const getTreeType = (type) => {
    switch(type) {
      case 'protected': return '보호수';
      case 'roadside': return '가로수';
      case 'park': return '공원수목';
      default: return type;
    }
  };

  const handleExpand = (openBenefits = false) => {
    setIsMinimized(false);
    if (openBenefits) {
      setShowBenefits(true);
    }
    if (onMinimizedChange) {
      onMinimizedChange(false);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    
    if (deltaY > dragThreshold) {
      if (showBenefits) {
        setShowBenefits(false);
      } else if (!isMinimized) {
        setIsMinimized(true);
        if (onMinimizedChange) {
          onMinimizedChange(true);
        }
      } else {
        onClose();
      }
    }
    else if (deltaY < -dragThreshold && isMinimized) {
      handleExpand();
    }
    
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const handleHandleClick = () => {
    if (isDragging) return;
    
    if (isMinimized) {
      setIsMinimized(false);
      if (onMinimizedChange) {
        onMinimizedChange(false);
      }
    } else {
      setIsMinimized(true);
      setShowBenefits(false);
      if (onMinimizedChange) {
        onMinimizedChange(true);
      }
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setIsMinimized(false);
      setShowBenefits(false);
      setActiveTab('info');
      if (onMinimizedChange) {
        onMinimizedChange(false);
      }
    } else {
      if (onMinimizedChange) {
        onMinimizedChange(false);
      }
    }
  }, [isVisible, onMinimizedChange]);

  if (!isVisible || !treeData) return null;

  const mobileCardStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#ffffff',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 2001,
    maxHeight: isMinimized ? '180px' : '85vh',
    overflowY: 'auto',
    transition: 'max-height 0.3s ease',
    pointerEvents: 'auto'
  };

  const desktopModalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    zIndex: 2001,
    width: '520px',
    maxHeight: '85vh',
    overflowY: 'auto',
    pointerEvents: 'auto'
  };

  return (
    <>
      {/* 카메라 모달 */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* 방문기록 작성 폼 */}
      {showVisitForm && capturedPhoto && (
        <VisitRecordForm
          photo={capturedPhoto}
          treeData={treeData}
          onSubmit={handleVisitSubmit}
          onCancel={() => {
            setShowVisitForm(false);
            setCapturedPhoto(null);
          }}
        />
      )}

      <div 
        style={isMobile ? mobileCardStyle : desktopModalStyle}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 (모바일만) */}
        {isMobile && (
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleHandleClick}
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px 0',
              cursor: 'pointer',
              touchAction: 'none'
            }}
          >
            <div style={{
              width: '36px',
              height: '4px',
              background: isDragging ? '#4ECDC4' : '#e0e0e0',
              borderRadius: '2px',
              transition: isDragging ? 'none' : 'all 0.2s ease'
            }} />
          </div>
        )}

        {/* 컨텐츠 */}
        <div 
          style={{ 
            padding: isMobile ? '8px 20px 20px 20px' : '24px',
            cursor: isMinimized ? 'pointer' : 'default'
          }}
          onClick={isMinimized ? handleExpand : undefined}
        >
          {/* 헤더 */}
          <div style={{ marginBottom: isMinimized ? '8px' : '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isMinimized ? '4px' : '8px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: '700',
                color: '#333',
                lineHeight: '1.2'
              }}>
                {treeData.species_kr || '미상'}
              </h2>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              fontSize: isMinimized ? '12px' : (isMobile ? '14px' : '16px'),
              color: '#666',
              marginBottom: isMinimized ? '0' : '4px'
            }}>
              {getTreeType(treeData.tree_type)}
              {isMinimized && (
                <span style={{ marginLeft: '8px', color: '#888' }}>
                  {treeData.borough} {treeData.district}
                </span>
              )}
            </div>

            {!isMinimized && (
              <div style={{
                fontSize: isMobile ? '13px' : '15px',
                color: '#888',
                lineHeight: '1.4'
              }}>
                {treeData.borough}
                {treeData.district && ` ${treeData.district}`}
                {treeData.address && (
                  <div style={{ marginTop: '2px' }}>
                    {treeData.address}
                  </div>
                )}
              </div>
            )}
          </div>

          {isMinimized ? (
            // 간소화 모드
            <div style={{ display: 'flex', gap: '8px' }}>
              {hasBenefitsData && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>
                    연간 생태적 편익 {treeData.total_annual_value_krw ? formatKRW(treeData.total_annual_value_krw) : '정보 없음'}
                  </span>
                  <span style={{ fontSize: '12px' }}>▼</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={shareStatus === 'copying'}
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#f8f9fa',
                  color: shareStatus === 'copied' ? '#22C55E' : '#666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: shareStatus === 'copying' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle();
                }}
                disabled={favoriteStatus !== 'idle' || !user}
                style={{
                  width: '48px',
                  height: '48px',
                  background: !user ? '#f8f9fa' : 
                            isTreeFavorited ? '#ff4757' : '#22C55E',
                  color: !user ? '#666' : '#fff',
                  border: !user ? '1px solid #e0e0e0' : 'none',
                  borderRadius: '8px',
                  cursor: (!user || favoriteStatus !== 'idle') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (!user || favoriteStatus !== 'idle') ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {favoriteStatus === 'adding' || favoriteStatus === 'removing' ? (
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                ) : (
                  <>💚</>
                )}
              </button>
            </div>
          ) : (
            // 확장 모드
            <>
              {/* 액션 버튼들 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={handleShare}
                  disabled={shareStatus === 'copying'}
                  style={{
                    flex: 1,
                    height: '44px',
                    background: '#f8f9fa',
                    color: shareStatus === 'copied' ? '#22C55E' : '#666',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: shareStatus === 'copying' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                  </svg>
                  {shareStatus === 'copying' ? '복사중' : 
                   shareStatus === 'copied' ? '복사완료' : '공유'}
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteStatus !== 'idle' || !user}
                  style={{
                    flex: 1,
                    height: '44px',
                    background: !user ? '#f8f9fa' : 
                              isTreeFavorited ? '#ff4757' : '#22C55E',
                    color: !user ? '#666' : '#fff',
                    border: !user ? '1px solid #e0e0e0' : 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: (!user || favoriteStatus !== 'idle') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    opacity: (!user || favoriteStatus !== 'idle') ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {favoriteStatus === 'adding' ? (
                    <>
                      <div className="loading-spinner" style={{ width: '14px', height: '14px' }} />
                      추가 중
                    </>
                  ) : favoriteStatus === 'removing' ? (
                    <>
                      <div className="loading-spinner" style={{ width: '14px', height: '14px' }} />
                      제거 중
                    </>
                  ) : !user ? (
                    <>💚 즐겨찾기</>
                  ) : isTreeFavorited ? (
                    <>💚 해제</>
                  ) : (
                    <>💚 추가</>
                  )}
                </button>

                {/* 방문기록 버튼 (모바일만) */}
                {isMobile && (
                  <button
    onClick={handleVisitRecord}
    style={{
      flex: 1,
      height: '44px',
      background: '#4ECDC4',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      transition: 'all 0.2s ease'
    }}
  >
    <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M480-40 192-256q-15-11-23.5-28t-8.5-36v-480q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v480q0 19-8.5 36T768-256L480-40Zm0-100 240-180v-480H240v480l240 180Zm-42-220 226-226-56-58-170 170-84-84-58 56 142 142Zm42-440H240h480-240Z"/></svg>
    방문기록
  </button>
                )}
              </div>

              {/* 탭 메뉴 (모바일만) */}
              {isMobile && (
                <div style={{
                  display: 'flex',
                  borderBottom: '2px solid #f0f0f0',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => setActiveTab('info')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'info' ? '2px solid #4ECDC4' : '2px solid transparent',
                      color: activeTab === 'info' ? '#4ECDC4' : '#999',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '-2px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    정보
                  </button>
                  <button
                    onClick={() => setActiveTab('visits')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'visits' ? '2px solid #4ECDC4' : '2px solid transparent',
                      color: activeTab === 'visits' ? '#4ECDC4' : '#999',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '-2px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    방문록
                  </button>
                </div>
              )}

              {/* 탭 컨텐츠 */}
              {isMobile && activeTab === 'visits' ? (
                // 방문록 탭
                loadingVisits ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="loading-spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }} />
                  </div>
                ) : (
                  <VisitList
                    visits={visits}
                    showMyVisitsOnly={showMyVisitsOnly}
                    onFilterChange={setShowMyVisitsOnly}
                    currentUserId={user?.uid}
                    onDeleteVisit={handleDeleteVisit}
                  />
                )
              ) : (
                // 정보 탭 (기존 내용)
                <>
                  {(hasValidData(treeData.height_m) || hasValidData(treeData.dbh_cm) || treeData.source_id) && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '16px',
                      background: '#F0FDF4',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      border: '1px solid #BBF7D0'
                    }}>
                      {hasValidData(treeData.height_m) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#666' }}>높이</span>
                          <span style={{ fontWeight: '600', color: '#22C55E' }}>
                            {Math.round(treeData.height_m)}m
                          </span>
                        </div>
                      )}
                      {hasValidData(treeData.dbh_cm) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#666' }}>직경</span>
                          <span style={{ fontWeight: '600', color: '#22C55E' }}>
                            {Math.round(treeData.dbh_cm)}cm
                          </span>
                        </div>
                      )}
                      {treeData.source_id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#666' }}>나무번호</span>
                          <span style={{ fontWeight: '600', color: '#22C55E' }}>
                            {treeData.source_id}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {hasBenefitsData && (
                    <div style={{ marginBottom: '16px' }}>
                      <button
                        onClick={() => setShowBenefits(!showBenefits)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: showBenefits ? '#22C55E' : '#f8f9fa',
                          color: showBenefits ? '#fff' : '#333',
                          border: showBenefits ? 'none' : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>
                          연간 생태적 편익 {treeData.total_annual_value_krw ? formatKRW(treeData.total_annual_value_krw) : '정보 없음'}
                        </span>
                        <span style={{ 
                          transform: showBenefits ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: '12px'
                        }}>
                          ▼
                        </span>
                      </button>
                    </div>
                  )}

                  {showBenefits && hasBenefitsData && (
                    <div style={{
                      background: '#DCFCE7',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: '1px solid #BBF7D0'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {hasValidData(treeData.stormwater_liters_year) && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #BBF7D0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', color: '#666' }}>빗물 흡수</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#22C55E' }}>
                                {formatNumber(treeData.stormwater_liters_year)}L
                              </div>
                              {hasValidData(treeData.stormwater_value_krw_year) && (
                                <div style={{ fontSize: '12px', color: '#16A34A' }}>
                                  {formatKRW(treeData.stormwater_value_krw_year)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {hasValidData(treeData.energy_kwh_year) && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #BBF7D0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', color: '#666' }}>에너지 절약</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#22C55E' }}>
                                {formatNumber(treeData.energy_kwh_year)}kWh
                              </div>
                              {hasValidData(treeData.energy_value_krw_year) && (
                                <div style={{ fontSize: '12px', color: '#16A34A' }}>
                                  {formatKRW(treeData.energy_value_krw_year)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {hasValidData(treeData.air_pollution_kg_year) && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #BBF7D0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', color: '#666' }}>대기 정화</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#22C55E' }}>
                                {formatNumber(treeData.air_pollution_kg_year * 1000)}g
                              </div>
                              {hasValidData(treeData.air_pollution_value_krw_year) && (
                                <div style={{ fontSize: '12px', color: '#16A34A' }}>
                                  {formatKRW(treeData.air_pollution_value_krw_year)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {hasValidData(treeData.carbon_storage_kg_year) && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #BBF7D0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', color: '#666' }}>탄소 흡수</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#22C55E' }}>
                                {formatNumber(treeData.carbon_storage_kg_year)}kg
                              </div>
                              {hasValidData(treeData.carbon_value_krw_year) && (
                                <div style={{ fontSize: '12px', color: '#16A34A' }}>
                                  {formatKRW(treeData.carbon_value_krw_year)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        padding: '12px',
                        marginTop: '12px',
                        fontSize: '12px',
                        color: '#666',
                        lineHeight: '1.4',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '6px',
                        border: '1px solid #BBF7D0'
                      }}>
                        <strong>편익 산정 기준:</strong> 한국 기후조건, 산림청 공익기능 평가 기준, 
                        환경부 대기오염 피해비용, K-ETS 탄소가격 등을 반영하여 계산된 연간 추정값입니다.
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TreePopup;