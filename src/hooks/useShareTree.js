// src/hooks/useShareTree.js
import { useState, useCallback } from 'react';

export const useShareTree = () => {
  const [shareStatus, setShareStatus] = useState('idle'); // 'idle' | 'copying' | 'copied' | 'failed'

  const shareTree = useCallback(async (treeData) => {
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
  }, []);

  return { shareStatus, shareTree };
};
