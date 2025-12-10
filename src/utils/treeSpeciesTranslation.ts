// Tree species name translations
export const TREE_SPECIES_EN: { [key: string]: string } = {
  // 주요 수종 (Top 10)
  '은행나무': 'Ginkgo',
  '단풍나무': 'Maple',
  '양버즘나무': 'London Plane',
  '플라타너스': 'Platanus',
  '소나무': 'Pine',
  '참나무': 'Oak',
  '회화나무': 'Japanese Pagoda Tree',
  '메타세쿼이아': 'Dawn Redwood',
  '느티나무': 'Zelkova',
  '벚나무': 'Cherry',

  // 추가 일반 수종
  '왕벚나무': 'Yoshino Cherry',
  '산벚나무': 'Hill Cherry',
  '겹벚나무': 'Double-flowered Cherry',
  '전나무': 'Fir',
  '잣나무': 'Korean Pine',
  '향나무': 'Juniper',
  '측백나무': 'Arborvitae',
  '편백': 'Hinoki Cypress',
  '화백': 'Sawara Cypress',
  '낙엽송': 'Larch',
  '리기다소나무': 'Pitch Pine',
  '곰솔': 'Black Pine',
  '스트로브잣나무': 'Eastern White Pine',

  '상수리나무': 'Sawtooth Oak',
  '굴참나무': 'Konara Oak',
  '신갈나무': 'Mongolian Oak',
  '졸참나무': 'Jolcham Oak',

  '버드나무': 'Willow',
  '수양버들': 'Weeping Willow',
  '능수버들': 'Weeping Willow',
  '갯버들': 'Pussy Willow',

  '느릅나무': 'Elm',
  '당느릅나무': 'Japanese Elm',
  '참느릅나무': 'Chinese Elm',

  '팽나무': 'Hackberry',
  '푸조나무': 'Aphananthe',
  '음나무': 'Castor Aralia',
  '이팝나무': 'Chinese Fringe Tree',
  '백합나무': 'Tulip Tree',
  '칠엽수': 'Horse Chestnut',

  '아까시나무': 'Black Locust',
  '아까시아': 'Black Locust',
  '자귀나무': 'Silk Tree',

  '배롱나무': 'Crape Myrtle',
  '목련': 'Magnolia',
  '백목련': 'White Magnolia',
  '자목련': 'Purple Magnolia',

  '오동나무': 'Paulownia',
  '개오동': 'Empress Tree',

  '가중나무': 'Japanese Judas Tree',
  '계수나무': 'Katsura',
  '산수유': 'Cornelian Cherry',
  '층층나무': 'Giant Dogwood',
  '때죽나무': 'Japanese Snowbell',
  '산딸나무': 'Kousa Dogwood',

  '사철나무': 'Japanese Euonymus',
  '회양목': 'Boxwood',
  '광나무': 'Tree Privet',
  '쥐똥나무': 'Privet',

  '미상': 'Unknown',
  '기타': 'Other'
};

/**
 * Get translated tree species name
 * @param koreanName - Korean name of the tree species
 * @param language - Target language ('ko' or 'en')
 * @returns Translated species name
 */
export const getTreeSpeciesName = (koreanName: string, language: string = 'ko'): string => {
  if (!koreanName) return language === 'en' ? 'Unknown' : '미상';

  if (language === 'en') {
    return TREE_SPECIES_EN[koreanName] || koreanName;
  }

  return koreanName;
};
