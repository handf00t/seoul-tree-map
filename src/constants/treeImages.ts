// Tree species to leaf image mapping (WebP format for 97% size reduction)
export const TREE_LEAF_IMAGES: { [key: string]: string } = {
  // 기존
  '은행나무': 'leaf_image_ginko.webp',
  '단풍나무': 'leaf_image_maple.webp',
  '양버즘나무': 'leaf_image_london_plane.webp',
  '플라타너스': 'leaf_image_platanus.webp',
  '소나무': 'leaf_image_pine.webp',
  '참나무': 'leaf_image_oak.webp',
  '회화나무': 'leaf_image_pagoda.webp',
  '메타세쿼이아': 'leaf_image_metasequoia.webp',
  '느티나무': 'leaf_image_zelkova.webp',
  '벚나무': 'leaf_image_cherry.webp',

  // 추가
  '향나무': 'leaf_image_juniper.webp',
  '가중나무': 'leaf_image_treeofheaven.webp',
  '아카시아나무': 'leaf_image_blacklocust.webp',
  '아까시나무': 'leaf_image_blacklocust.webp',
  '버드나무': 'leaf_image_willow.webp',
  '오동나무': 'leaf_image_paulownia.webp',
  '측백나무': 'leaf_image_orientalarborvitae.webp',
  '칠엽수': 'leaf_image_chestnut.webp',
  '감나무': 'leaf_image_persimmon.webp',
  '느릅나무': 'leaf_image_elm.webp',
  '상수리나무': 'leaf_image_sawtooth.webp',
  '이태리포플러': 'leaf_image_lombardypoplar.webp',
  '목련': 'leaf_image_magnolia.webp',
  '튤립나무': 'leaf_image_tuliptree.webp',
  '백합나무': 'leaf_image_tuliptree.webp', // 튤립나무와 동일
  '잣나무': 'leaf_image_koreanpine.webp',
  '사시나무': 'leaf_image_aspen.webp',
  '중국단풍나무': 'leaf_image_chinese_maple.webp',
  '양버즘': 'leaf_image_london_plane.webp', // 양버즘나무와 동일
  '가래나무': 'leaf_image_manchurianwalnut.webp',
  '히말라야시다': 'leaf_image_himalayancedar.webp',
};

/**
 * Get the leaf image path for a given tree species
 * @param speciesName - Korean name of the tree species
 * @returns Image path or null if no image is available
 */
export const getTreeLeafImage = (speciesName: string): string | null => {
  if (!speciesName) return null;

  const fileName = TREE_LEAF_IMAGES[speciesName];
  if (!fileName) return null;

  return `/images/trees/${fileName}`;
};