// Tree species to leaf image mapping
export const TREE_LEAF_IMAGES: { [key: string]: string } = {
  '은행나무': 'leaf_image_ginko.png',
  '단풍나무': 'leaf_image_maple.png',
  '양버즘나무': 'leaf_image_london_plane.png',
  '플라타너스': 'leaf_image_platanus.png',
  '소나무': 'leaf_image_pine.png',
  '참나무': 'leaf_image_oak.png',
  '회화나무': 'leaf_image_pagoda.png',
  '메타세쿼이아': 'leaf_image_metasequoia.png',
  '느티나무': 'leaf_image_zelkova.png',
  '벚나무': 'leaf_image_cherry.png',
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
