// src/hooks/useFavoriteTree.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TreeData } from '../types';

type FavoriteStatus = 'idle' | 'adding' | 'removing';

interface UseFavoriteTreeParams {
  onLoginRequest?: () => void;
}

interface UseFavoriteTreeReturn {
  favoriteStatus: FavoriteStatus;
  toggleFavorite: (treeData: TreeData) => Promise<void>;
  isFavorited: (treeData: TreeData | null) => boolean;
}

export const useFavoriteTree = ({ onLoginRequest }: UseFavoriteTreeParams): UseFavoriteTreeReturn => {
  const { user, addToFavorites, removeFromFavorites, isFavorite, recordTreeView } = useAuth();
  const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>('idle');

  const toggleFavorite = useCallback(async (treeData: TreeData) => {
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
    isFavorited: (treeData: TreeData | null) => user && treeData ? isFavorite(treeData) : false
  };
};
