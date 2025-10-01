// components/Filter/TreeFilter.jsx
import React, { useState, useEffect } from 'react';

const TreeFilter = ({ map, isVisible, onClose, onFilterApply }) => {
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // 서울시 주요 수종 목록
  const availableSpecies = [
    { name: '은행나무', color: '#FFD700' },
    { name: '느티나무', color: '#228B22' },
    { name: '플라타너스', color: '#8FBC8F' },
    { name: '벚나무', color: '#FFB6C1' },
    { name: '단풍나무', color: '#FF4500' },
    { name: '소나무', color: '#006400' },
    { name: '회화나무', color: '#8B4513' },
    { name: '참나무', color: '#8B4513' },
    { name: '메타세쿼이아', color: '#228B22' },
    { name: '기타', color: '#4ECDC4' }
  ];

  // DBH 크기별 분류
  const sizeCategories = [
    { id: 'small', label: '소형 (15cm 미만)', range: [0, 15], color: '#90EE90' },
    { id: 'medium-small', label: '중소형 (15-30cm)', range: [15, 30], color: '#32CD32' },
    { id: 'medium', label: '중형 (30-50cm)', range: [30, 50], color: '#228B22' },
    { id: 'medium-large', label: '중대형 (50-80cm)', range: [50, 80], color: '#006400' },
    { id: 'large', label: '대형 (80cm 이상)', range: [80, 999], color: '#013220' }
  ];

  // 수종 선택/해제
  const toggleSpecies = (speciesName) => {
    setSelectedSpecies(prev => 
      prev.includes(speciesName) 
        ? prev.filter(s => s !== speciesName)
        : [...prev, speciesName]
    );
  };

  // 크기 선택/해제
  const toggleSize = (sizeId) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId) 
        ? prev.filter(s => s !== sizeId)
        : [...prev, sizeId]
    );
  };

  // 전체 선택/해제
  const toggleAllSpecies = () => {
    if (selectedSpecies.length === availableSpecies.length) {
      setSelectedSpecies([]);
    } else {
      setSelectedSpecies(availableSpecies.map(s => s.name));
    }
  };

  const toggleAllSizes = () => {
    if (selectedSizes.length === sizeCategories.length) {
      setSelectedSizes([]);
    } else {
      setSelectedSizes(sizeCategories.map(s => s.id));
    }
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedSpecies([]);
    setSelectedSizes([]);
  };

  // 지도 레이어에 필터 적용 (Mapbox 공식 문서 참고)
  const applyMapFilters = (filters) => {
    if (!map) return;

    console.log('필터 적용 중:', filters);

    const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
    
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        // 기본 필터 배열 (AND 조건)
        const filterConditions = [];

        // 1. 레이어 타입 필터 (항상 적용)
        const layerType = layerId === 'protected-trees' ? 'protected' :
                         layerId === 'roadside-trees' ? 'roadside' : 'park';
        filterConditions.push(['==', ['get', 'tree_type'], layerType]);

        // 2. 수종 필터
        if (filters.species.length > 0 && filters.species.length < availableSpecies.length) {
          console.log('수종 필터 적용:', filters.species);
          
          if (filters.species.includes('기타')) {
            // 기타 포함 시 복잡한 로직은 일단 생략하고 선택된 주요 수종만 표시
            const mainSpecies = filters.species.filter(s => s !== '기타');
            if (mainSpecies.length > 0) {
              filterConditions.push(['in', ['get', 'species_kr'], ['literal', mainSpecies]]);
            }
          } else {
            // 선택된 수종들 중 하나와 일치
            filterConditions.push(['in', ['get', 'species_kr'], ['literal', filters.species]]);
          }
        }

        // 3. 크기 필터  
        if (filters.sizes.length > 0 && filters.sizes.length < sizeCategories.length) {
          console.log('크기 필터 적용:', filters.sizes);
          
          const sizeOrConditions = []; // OR 조건들
          
          filters.sizes.forEach(sizeId => {
            const sizeCategory = sizeCategories.find(s => s.id === sizeId);
            if (sizeCategory) {
              const [min, max] = sizeCategory.range;
              
              if (max === 999) {
                // 대형: 80cm 이상
                sizeOrConditions.push(['>=', ['get', 'dbh_cm'], min]);
              } else {
                // 범위: min <= dbh < max
                sizeOrConditions.push(['all', 
                  ['>=', ['get', 'dbh_cm'], min],
                  ['<', ['get', 'dbh_cm'], max]
                ]);
              }
            }
          });
          
          // 크기 조건들을 OR로 결합
          if (sizeOrConditions.length === 1) {
            filterConditions.push(sizeOrConditions[0]);
          } else if (sizeOrConditions.length > 1) {
            filterConditions.push(['any', ...sizeOrConditions]);
          }
        }

        // 최종 필터 적용
        let finalFilter;
        if (filterConditions.length === 1) {
          finalFilter = filterConditions[0];
        } else {
          finalFilter = ['all', ...filterConditions];
        }

        console.log(`${layerId} 필터:`, finalFilter);
        map.setFilter(layerId, finalFilter);
      }
    });

    console.log('지도 필터 적용 완료');
  };

  // 필터 변경시 실시간 적용
  useEffect(() => {
    const filters = { species: selectedSpecies, sizes: selectedSizes };
    applyMapFilters(filters);
    
    if (onFilterApply) {
      onFilterApply(filters);
    }
  }, [selectedSpecies, selectedSizes, map]);

  if (!isVisible) return null;

  return (
    <>
      {/* 백그라운드 오버레이 */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1999
        }}
      />
      
      {/* 필터 패널 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 2000,
        width: 'min(90vw, 500px)',
        maxHeight: '85vh',
        overflow: 'hidden'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              나무 필터
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#666'
            }}>
              수종과 크기로 나무를 필터링하세요
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8f9fa',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* 필터 콘텐츠 */}
        <div style={{
          maxHeight: 'calc(85vh - 160px)',
          overflowY: 'auto',
          padding: '0 24px 24px 24px'
        }}>
          {/* 수종 필터 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                수종별 필터
              </h3>
              <button
                onClick={toggleAllSpecies}
                style={{
                  background: 'none',
                  border: '1px solid #4ECDC4',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#4ECDC4',
                  cursor: 'pointer'
                }}
              >
                {selectedSpecies.length === availableSpecies.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '8px'
            }}>
              {availableSpecies.map((species) => (
                <label
                  key={species.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    background: selectedSpecies.includes(species.name) ? '#f0f8ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSpecies(species.name);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecies.includes(species.name)}
                    onChange={() => {}} // 빈 함수로 경고 방지
                    style={{ 
                      marginRight: '8px',
                      pointerEvents: 'none' // 직접 클릭 방지, label로만 제어
                    }}
                  />
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: species.color,
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {species.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 크기별 필터 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                크기별 필터 (줄기 직경)
              </h3>
              <button
                onClick={toggleAllSizes}
                style={{
                  background: 'none',
                  border: '1px solid #4ECDC4',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#4ECDC4',
                  cursor: 'pointer'
                }}
              >
                {selectedSizes.length === sizeCategories.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '8px'
            }}>
              {sizeCategories.map((size) => (
                <label
                  key={size.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    background: selectedSizes.includes(size.id) ? '#f0f8ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSize(size.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size.id)}
                    onChange={() => {}} // 빈 함수로 경고 방지
                    style={{ 
                      marginRight: '8px',
                      pointerEvents: 'none' // 직접 클릭 방지, label로만 제어
                    }}
                  />
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: size.color,
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {size.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={resetFilters}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f8f9fa',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            필터 초기화
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 2,
              padding: '12px',
              background: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            적용 완료
          </button>
        </div>
      </div>
    </>
  );
};

export default TreeFilter;