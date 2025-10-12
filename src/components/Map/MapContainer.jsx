// MapContainer.jsx - 나무 Circle 크기 확대 + 지도 조작 이벤트 추가
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapContainer = ({ onMapLoad, onTreeClick, selectedTree, onMapInteractionChange, onMapClick }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const selectedMarkerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [126.9780, 37.5665],
      zoom: 11
    });

    mapRef.current = map;

    map.on('load', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('지도 로드 완료 - 나무 데이터만 표시');
      }

      // 서울 구 경계 타일셋 소스 추가
      map.addSource('seoul-districts', {
        type: 'vector',
        url: 'mapbox://handfoot.90o0fc3l'
      });

      // 구 경계 Fill 레이어 추가
      map.addLayer({
        id: 'seoul-districts-fill',
        type: 'fill',
        source: 'seoul-districts',
        'source-layer': 'seoul_districts_with_tree_cou-7qhe0y',
        maxzoom: 14,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'tree_count'],
            0, '#f7fcf0',
            10000, '#e0f3db',  
            20000, '#ccebc5',
            30000, '#a8ddb5',
            40000, '#7bccc4',
            50000, '#4eb3d3',
            60000, '#2b8cbe',
            70000, '#08589e'
          ],
          'fill-opacity': 0.6,
          'fill-outline-color': 'transparent'
        }
      });

      // 구 경계선 레이어 추가
      map.addLayer({
        id: 'seoul-districts-stroke',
        type: 'line',
        source: 'seoul-districts',
        'source-layer': 'seoul_districts_with_tree_cou-7qhe0y',
        maxzoom: 14,
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // 개별 나무 데이터 소스 추가
      map.addSource('seoul-trees', {
        type: 'vector',
        url: `mapbox://${process.env.REACT_APP_TILESET_ID}`
      });

      // 보호수 레이어
      map.addLayer({
        id: 'protected-trees',
        type: 'circle',
        source: 'seoul-trees',
        'source-layer': 'trees_with_benefits',
        minzoom: 10,
        filter: ['==', 'tree_type', 'protected'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 8,
            14, 12,
            16, 16,
            18, 20
          ],
          'circle-color': '#FF6B6B',
          'circle-opacity': 0.9,
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 2,
            14, 3,
            18, 4
          ],
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // 가로수 레이어
      map.addLayer({
        id: 'roadside-trees',
        type: 'circle',
        source: 'seoul-trees',
        'source-layer': 'trees_with_benefits',
        minzoom: 10,
        filter: ['==', 'tree_type', 'roadside'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 6,
            14, 9,
            16, 12,
            18, 16
          ],
          'circle-color': [
            'match', ['get', 'species_kr'],
            '은행나무', '#FFD700',
            '느티나무', '#228B22',
            '플라타너스', '#8FBC8F',
            '벚나무', '#FFB6C1',
            '단풍나무', '#FF4500',
            '소나무', '#006400',
            '버드나무', '#32CD32',
            '참나무', '#8B4513',
            '#22C55E'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 1.5,
            14, 2,
            18, 3
          ],
          'circle-stroke-color': '#ffffff'
        }
      });

      // 공원수목 레이어
      map.addLayer({
        id: 'park-trees',
        type: 'circle',
        source: 'seoul-trees',
        'source-layer': 'trees_with_benefits',
        minzoom: 10,
        filter: ['==', 'tree_type', 'park'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 5,
            14, 7,
            16, 10,
            18, 14
          ],
          'circle-color': '#45B7D1',
          'circle-opacity': 0.7,
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 1.5,
            14, 2,
            18, 3
          ],
          'circle-stroke-color': '#ffffff'
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('나무 레이어 추가 완료');
      }

      // 지도 조작 이벤트 리스너 추가
      if (onMapInteractionChange) {
        map.on('dragstart', () => onMapInteractionChange(true));
        map.on('dragend', () => {
          setTimeout(() => onMapInteractionChange(false), 100);
        });
        map.on('zoomstart', () => onMapInteractionChange(true));
        map.on('zoomend', () => {
          setTimeout(() => onMapInteractionChange(false), 100);
        });
        map.on('pitchstart', () => onMapInteractionChange(true));
        map.on('pitchend', () => {
          setTimeout(() => onMapInteractionChange(false), 100);
        });
        map.on('rotatestart', () => onMapInteractionChange(true));
        map.on('rotateend', () => {
          setTimeout(() => onMapInteractionChange(false), 100);
        });
      }

      // 나무 클릭 이벤트
      const treeLayers = ['protected-trees', 'roadside-trees', 'park-trees'];
      
      treeLayers.forEach(layerId => {
        map.on('click', layerId, (e) => {
          const properties = e.features[0].properties;
          const feature = e.features[0];
          const coordinates = feature.geometry.coordinates;

          if (process.env.NODE_ENV === 'development') {
            console.log('나무 클릭:', properties);
          }

          if (onTreeClick) {
            // 평탄화된 타일셋 데이터를 중첩 구조로 변환
            const treeData = {
              source_id: properties.source_id,
              species_kr: properties.species_kr,
              tree_type: properties.tree_type,
              dbh_cm: properties.dbh_cm,
              height_m: properties.height_m,
              borough: properties.borough,
              district: properties.district,
              address: properties.address,
              latitude: properties.latitude,
              longitude: properties.longitude,
              clickCoordinates: {
                lat: coordinates[1],  // GeoJSON은 [lng, lat] 순서
                lng: coordinates[0]
              }
            };

            // benefits 데이터가 있으면 중첩 객체로 구성
            if (properties.total_annual_value_krw !== undefined ||
                properties.stormwater_liters_year !== undefined ||
                properties.energy_kwh_year !== undefined ||
                properties.air_pollution_kg_year !== undefined ||
                properties.carbon_storage_kg_year !== undefined) {
              treeData.benefits = {
                total_annual_value_krw: properties.total_annual_value_krw,
                stormwater_liters_year: properties.stormwater_liters_year,
                stormwater_value_krw_year: properties.stormwater_value_krw_year,
                energy_kwh_year: properties.energy_kwh_year,
                energy_value_krw_year: properties.energy_value_krw_year,
                air_pollution_kg_year: properties.air_pollution_kg_year,
                air_pollution_value_krw_year: properties.air_pollution_value_krw_year,
                carbon_storage_kg_year: properties.carbon_storage_kg_year,
                carbon_value_krw_year: properties.carbon_value_krw_year
              };
            }

            onTreeClick(treeData);
          }
        });
        
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // 지도 클릭 이벤트 (빈 영역 클릭 시)
      map.on('click', (e) => {
        // 나무 레이어를 클릭하지 않은 경우만 처리
        const features = map.queryRenderedFeatures(e.point, {
          layers: treeLayers
        });
        
        if (features.length === 0 && onMapClick) {
          onMapClick();
        }
      });

      // 데이터 로드 확인
      map.on('sourcedata', (e) => {
        if (e.sourceId === 'seoul-trees' && e.isSourceLoaded) {
          if (process.env.NODE_ENV === 'development') {
            console.log('나무 데이터 로드 완료');
          }
          
          setTimeout(() => {
            const features = map.queryRenderedFeatures({
              layers: ['protected-trees', 'roadside-trees', 'park-trees']
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('현재 화면의 나무 수:', features.length);
              if (features.length > 0) {
                console.log('첫 번째 나무 데이터:', features[0].properties);
              }
            }
          }, 1000);
        }
      });

      if (onMapLoad) {
        onMapLoad(map);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 선택된 나무 마커 표시
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedTree && selectedTree.clickCoordinates) {
      const getMarkerColor = (treeType) => {
        const style = getComputedStyle(document.documentElement);
        switch(treeType) {
          case 'protected': return style.getPropertyValue('--tree-protected').trim() || '#FF6B6B';
          case 'roadside': return style.getPropertyValue('--primary').trim() || '#22C55E';
          case 'park': return style.getPropertyValue('--tree-park').trim() || '#45B7D1';
          default: return style.getPropertyValue('--primary').trim() || '#a3e635';
        }
      };

      const marker = new mapboxgl.Marker({
        color: getMarkerColor(selectedTree.tree_type),
        scale: 1.3
      })
        .setLngLat([
          selectedTree.clickCoordinates.lng,
          selectedTree.clickCoordinates.lat
        ])
        .addTo(mapRef.current);

      selectedMarkerRef.current = marker;

      const currentZoom = Math.max(mapRef.current.getZoom(), 16);
      
      mapRef.current.flyTo({
        center: [
          selectedTree.clickCoordinates.lng,
          selectedTree.clickCoordinates.lat
        ],
        zoom: currentZoom,
        duration: 1000
      });
    }
  }, [selectedTree]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default MapContainer;