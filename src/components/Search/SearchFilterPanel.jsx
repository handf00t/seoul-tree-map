// components/Search/SearchFilterPanel.jsx - PC 전용 인라인 필터
import React, { useState, useRef, useEffect } from 'react';

const SearchFilterPanel = ({ map, activeFilterCount, onFilterApply }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterExpanded, setShowFilterExpanded] = useState(false);
  const debounceRef = useRef(null);

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
    { name: '기타', color: '#84cc16' }
  ];

  // DBH 크기별 분류
  const sizeCategories = [
    { id: 'small', label: '소형 (15cm 미만)', range: [0, 15], color: '#90EE90' },
    { id: 'medium-small', label: '중소형 (15-30cm)', range: [15, 30], color: '#32CD32' },
    { id: 'medium', label: '중형 (30-50cm)', range: [30, 50], color: '#228B22' },
    { id: 'medium-large', label: '중대형 (50-80cm)', range: [50, 80], color: '#006400' },
    { id: 'large', label: '대형 (80cm 이상)', range: [80, 999], color: '#013220' }
  ];

  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Mapbox Geocoding API로 위치 검색
  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        new URLSearchParams({
          access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
          country: 'KR',
          proximity: '126.9780,37.5665',
          bbox: '126.734,37.428,127.269,37.701',
          language: 'ko',
          limit: 6
        })
      );

      if (!response.ok) {
        throw new Error('Geocoding API 오류');
      }

      const data = await response.json();
      
      const formattedSuggestions = data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name_ko || feature.place_name,
        shortName: feature.text_ko || feature.text,
        coordinates: feature.center,
        type: getPlaceType(feature.place_type),
        icon: getPlaceIcon(feature.place_type)
      }));

      setSuggestions(formattedSuggestions);
      
    } catch (error) {
      console.error('위치 검색 오류:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceType = (placeTypes) => {
    if (placeTypes.includes('region')) return '지역';
    if (placeTypes.includes('district')) return '구';
    if (placeTypes.includes('locality')) return '동네';
    if (placeTypes.includes('neighborhood')) return '동';
    if (placeTypes.includes('address')) return '주소';
    if (placeTypes.includes('poi')) return '관심장소';
    return '위치';
  };

  const getPlaceIcon = (placeTypes) => {
    if (placeTypes.includes('region')) return 'location_city';
    if (placeTypes.includes('district')) return 'account_balance';
    if (placeTypes.includes('locality')) return 'home_work';
    if (placeTypes.includes('neighborhood')) return 'place';
    if (placeTypes.includes('address')) return 'home';
    if (placeTypes.includes('poi')) return 'push_pin';
    return 'place';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const selectLocation = (location) => {
    if (!map) return;

    map.flyTo({
      center: location.coordinates,
      zoom: 15,
      duration: 2000
    });

    setQuery(location.shortName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  // 필터 적용
  const applyFilters = () => {
    if (!map) return;

    const filters = { species: selectedSpecies, sizes: selectedSizes };
    
    // 지도 레이어에 필터 적용
    const layers = ['protected-trees', 'roadside-trees', 'park-trees'];
    
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        const filterConditions = [];

        // 레이어 타입 필터
        const layerType = layerId === 'protected-trees' ? 'protected' :
                         layerId === 'roadside-trees' ? 'roadside' : 'park';
        filterConditions.push(['==', ['get', 'tree_type'], layerType]);

        // 수종 필터
        if (selectedSpecies.length > 0 && selectedSpecies.length < availableSpecies.length) {
          if (selectedSpecies.includes('기타')) {
            const mainSpecies = selectedSpecies.filter(s => s !== '기타');
            if (mainSpecies.length > 0) {
              filterConditions.push(['in', ['get', 'species_kr'], ['literal', mainSpecies]]);
            }
          } else {
            filterConditions.push(['in', ['get', 'species_kr'], ['literal', selectedSpecies]]);
          }
        }

        // 크기 필터
        if (selectedSizes.length > 0 && selectedSizes.length < sizeCategories.length) {
          const sizeOrConditions = [];
          
          selectedSizes.forEach(sizeId => {
            const sizeCategory = sizeCategories.find(s => s.id === sizeId);
            if (sizeCategory) {
              const [min, max] = sizeCategory.range;
              
              if (max === 999) {
                sizeOrConditions.push(['>=', ['get', 'dbh_cm'], min]);
              } else {
                sizeOrConditions.push(['all', 
                  ['>=', ['get', 'dbh_cm'], min],
                  ['<', ['get', 'dbh_cm'], max]
                ]);
              }
            }
          });
          
          if (sizeOrConditions.length === 1) {
            filterConditions.push(sizeOrConditions[0]);
          } else if (sizeOrConditions.length > 1) {
            filterConditions.push(['any', ...sizeOrConditions]);
          }
        }

        const finalFilter = filterConditions.length === 1 ? 
          filterConditions[0] : ['all', ...filterConditions];
        
        map.setFilter(layerId, finalFilter);
      }
    });

    // 상위 컴포넌트에 필터 상태 알림
    if (onFilterApply) {
      onFilterApply(filters);
    }

    setShowFilterExpanded(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!map) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      width: '350px',
      maxWidth: 'calc(100vw - 40px)'
    }}>
      <div className="surface-elevated" style={{
        overflow: 'hidden',
        animation: 'slideDown var(--duration-normal) ease',
        maxHeight: showFilterExpanded ? '80vh' : '400px',
        transition: 'max-height 0.3s ease'
      }}>

        {/* 위치 검색 */}
        <div style={{
          padding: '16px',
          borderBottom: showSuggestions && suggestions.length > 0 ? '1px solid var(--outline-variant)' : 'none'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="(예: 강남구, 테헤란로)"
              className="form-input"
              style={{
                width: '100%',
                padding: '12px 45px 12px 40px',
                fontSize: '14px',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--duration-normal) ease',
                border: '2px solid var(--outline)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--outline)';
                e.target.style.boxShadow = 'none';
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            
            <div style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--primary)',
              fontSize: '18px',
              pointerEvents: 'none'
            }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>place</span>
            </div>

            <div style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              {isLoading ? (
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
              ) : query && (
                <button
                  onClick={clearSearch}
                  className="interactive-element"
                  style={{
                    border: 'none',
                    background: 'var(--surface-variant)',
                    color: 'var(--on-surface-variant)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '14px' }}>close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 필터 버튼 또는 확장된 필터 */}
        {!showFilterExpanded ? (
          <div style={{ padding: '16px' }}>
            <button
              onClick={() => setShowFilterExpanded(true)}
              className="interactive-element"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: activeFilterCount > 0 ? 'var(--primary)' : 'var(--surface-variant)',
                color: activeFilterCount > 0 ? 'var(--surface)' : 'var(--text-secondary)',
                border: activeFilterCount > 0 ? 'none' : '1px solid var(--outline)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: activeFilterCount > 0 ? 'var(--shadow-primary)' : 'var(--shadow-color-sm)'
              }}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>filter_alt</span>
              나무 필터
              {activeFilterCount > 0 && (
                <span className="badge" style={{
                  background: 'var(--overlay-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4px 8px',
                  fontSize: '12px',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          /* 확장된 필터 섹션 */
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '50vh'
          }}>
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--outline)',
              overflowY: 'auto',
              paddingBottom: '80px' // 하단 버튼 공간 확보
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  나무 필터 설정
                </h3>
                <button
                  onClick={() => setShowFilterExpanded(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* 수종 필터 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    수종별 필터
                  </h4>
                  <button
                    onClick={toggleAllSpecies}
                    style={{
                      background: 'none',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedSpecies.length === availableSpecies.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px'
                }}>
                  {availableSpecies.map((species) => (
                    <label
                      key={species.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--outline-light)',
                        cursor: 'pointer',
                        background: selectedSpecies.includes(species.name) ? 'var(--primary-surface)' : 'var(--surface)',
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
                        onChange={() => {}}
                        style={{ 
                          marginRight: '8px',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: species.color,
                          marginRight: '6px'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {species.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 크기별 필터 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    크기별 필터
                  </h4>
                  <button
                    onClick={toggleAllSizes}
                    style={{
                      background: 'none',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedSizes.length === sizeCategories.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '6px'
                }}>
                  {sizeCategories.map((size) => (
                    <label
                      key={size.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--outline-light)',
                        cursor: 'pointer',
                        background: selectedSizes.includes(size.id) ? 'var(--primary-surface)' : 'var(--surface)',
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
                        onChange={() => {}}
                        style={{ 
                          marginRight: '8px',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: size.color,
                          marginRight: '6px'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 액션 버튼 - 고정 위치 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              background: 'var(--surface)',
              borderTop: '1px solid var(--outline)',
              borderRadius: '0 0 16px 16px',
              display: 'flex',
              gap: '12px',
              boxShadow: '0 -2px 8px var(--shadow-color-md)'
            }}>
              <button
                onClick={resetFilters}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--surface-variant)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                초기화
              </button>
              <button
                onClick={applyFilters}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: 'var(--primary)',
                  color: 'var(--surface)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                적용
              </button>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {showSuggestions && (
          <div style={{
            maxHeight: '280px',
            overflowY: 'auto'
          }}>
            {isLoading ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--on-surface-variant)'
              }}>
                <div className="loading-spinner" style={{ 
                  width: '24px', 
                  height: '24px',
                  margin: '0 auto 8px'
                }} />
                탐험 지역을 찾는 중...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => selectLocation(suggestion)}
                  className="interactive-element"
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-surface)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'var(--surface)',
                    flexShrink: 0
                  }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>{suggestion.icon}</span>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--on-surface)',
                      marginBottom: '2px',
                      fontSize: '14px'
                    }}>
                      {suggestion.shortName}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--on-surface-variant)',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {suggestion.name}
                    </div>
                  </div>
                  
                  <span className="badge" style={{
                    fontSize: '10px',
                    color: 'var(--on-surface-variant)',
                    background: 'var(--surface-variant)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-md)',
                    flexShrink: 0
                  }}>
                    {suggestion.type}
                  </span>
                </div>
              ))
            ) : query.length > 1 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--on-surface-variant)',
                fontSize: '14px'
              }}>
                <span className="material-icons" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}>search</span>
                탐험할 수 있는 장소를 찾지 못했어요
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterPanel;