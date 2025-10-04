// src/hooks/useFavoriteTree.js
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFavoriteTree = ({ onLoginRequest }) => {
  const { user, addToFavorites, removeFromFavorites, isFavorite, recordTreeView } = useAuth();
  const [favoriteStatus, setFavoriteStatus] = useState('idle'); // 'idle' | 'adding' | 'removing'

  const toggleFavorite = useCallback(async (treeData) => {
    if (!user) {
      onLoginRequest?.();
      return;
    }

    if (!treeData || !treeData.source_id) {
      alert('나무 정보가 없습니다.');
      return;
    }

    if (favoriteStatus !== 'idle') return;

    try {
      const isCurrentlyFavorited = isFavorite(treeData);

      if (isCurrentlyFavorited) {
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
  }, [user, addToFavorites, removeFromFavorites, isFavorite, recordTreeView, favoriteStatus, onLoginRequest]);

  return {
    favoriteStatus,
    toggleFavorite,
    isFavorited: (treeData) => user && treeData ? isFavorite(treeData) : false
  };
};
