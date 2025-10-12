// src/components/Popup/TreePopup.jsx - 모바일 탭 구조 추가 (PC는 기존 유지)
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitService } from '../../services/firebase';
import CameraCapture from '../Visit/CameraCapture';
import VisitRecordForm from '../Visit/VisitRecordForm';
import VisitList from '../Visit/VisitList';
import LoadingSpinner from '../UI/LoadingSpinner';
import ActionButton from '../UI/ActionButton';
import PopupHeader from './TreePopup/PopupHeader';
import TabMenu from './TreePopup/TabMenu';
import TreeInfoBox from './TreePopup/TreeInfoBox';
import BenefitsSection from './TreePopup/BenefitsSection';

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

  const isTreeFavorited = useMemo(() => {
    return user && treeData ? isFavorite(treeData) : false;
  }, [user, treeData, isFavorite]);

  const hasBenefitsData = treeData?.benefits && (
    treeData.benefits.total_annual_value_krw ||
    treeData.benefits.stormwater_liters_year ||
    treeData.benefits.energy_kwh_year ||
    treeData.benefits.air_pollution_kg_year ||
    treeData.benefits.carbon_storage_kg_year
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
    background: 'var(--surface)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -2px 20px var(--shadow-color-md)',
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
    background: 'var(--surface)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px var(--shadow-color-lg)',
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
              background: isDragging ? 'var(--primary)' : 'var(--outline)',
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
          <PopupHeader
            treeData={treeData}
            isMobile={isMobile}
            isMinimized={isMinimized}
            onClose={onClose}
          />

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
                    background: 'var(--surface-variant)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--outline)',
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
                    연간 생태적 편익 {treeData.benefits?.total_annual_value_krw ? formatKRW(treeData.benefits.total_annual_value_krw) : '정보 없음'}
                  </span>
                  <span className="material-icons" style={{ fontSize: '12px' }}>expand_more</span>
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
                  background: 'var(--surface-variant)',
                  color: shareStatus === 'copied' ? 'var(--primary-light)' : 'var(--text-secondary)',
                  border: '1px solid var(--outline)',
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
                disabled={favoriteStatus !== 'idle'}
                style={{
                  width: '48px',
                  height: '48px',
                  background: !user ? 'var(--surface-variant)' :
                            isTreeFavorited ? 'var(--error)' : 'var(--primary)',
                  color: 'var(--surface)',
                  border: !user ? '1px solid var(--outline)' : 'none',
                  borderRadius: '8px',
                  cursor: favoriteStatus !== 'idle' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: favoriteStatus !== 'idle' ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  {isTreeFavorited ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>
          ) : (
            // 확장 모드
            <>
              {/* 액션 버튼들 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                flexDirection: isMobile ? 'row' : 'row'
              }}>
                {/* 방문기록 버튼 (메인 버튼 - 모바일만) */}
                {isMobile && (
                  <button
                    onClick={handleVisitRecord}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 -960 960 960" fill="currentColor">
                      <path d="M480-40 192-256q-15-11-23.5-28t-8.5-36v-480q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v480q0 19-8.5 36T768-256L480-40Zm0-100 240-180v-480H240v480l240 180Zm-42-220 226-226-56-58-170 170-84-84-58 56 142 142Zm42-440H240h480-240Z"/>
                    </svg>
                    <span style={{ fontSize: '13px' }}>방문기록</span>
                  </button>
                )}

                {/* 보조 버튼들 */}
                <button
                  onClick={handleShare}
                  disabled={shareStatus === 'copying'}
                  style={{
                    flex: isMobile ? 0 : 1,
                    padding: '12px 16px',
                    background: 'var(--surface-variant)',
                    color: shareStatus === 'copied' ? 'var(--primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: shareStatus === 'copying' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: isMobile ? '90px' : 'auto',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                  </svg>
                  <span style={{ fontSize: '13px' }}>
                    {shareStatus === 'copying' ? '복사중' :
                     shareStatus === 'copied' ? '완료' : '공유'}
                  </span>
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteStatus !== 'idle'}
                  style={{
                    flex: isMobile ? 0 : 1,
                    padding: '12px 16px',
                    background: 'var(--surface-variant)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: favoriteStatus !== 'idle' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: isMobile ? '90px' : 'auto',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>
                    {isTreeFavorited ? 'favorite' : 'favorite_border'}
                  </span>
                  <span style={{ fontSize: '13px' }}>즐겨찾기</span>
                </button>
              </div>

              {/* 탭 메뉴 (모바일만) */}
              {isMobile && (
                <TabMenu
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              )}

              {/* 탭 컨텐츠 */}
              {isMobile && activeTab === 'visits' ? (
                // 방문록 탭
                loadingVisits ? (
                  <LoadingSpinner size="medium" />
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
                  <TreeInfoBox treeData={treeData} />

                  <BenefitsSection
                    treeData={treeData}
                    showBenefits={showBenefits}
                    onToggle={() => setShowBenefits(!showBenefits)}
                    hasBenefitsData={hasBenefitsData}
                  />
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