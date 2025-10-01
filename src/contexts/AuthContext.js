// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, treeService } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState([]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await loadUserFavorites(authUser.uid);
      } else {
        setUser(null);
        setUserFavorites([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserFavorites = async (userId) => {
    const result = await treeService.getUserFavorites(userId);
    if (result.success) {
      setUserFavorites(result.favorites);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await authService.signInWithGoogle();
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setLoading(false);
    return result;
  };

  const addToFavorites = async (treeData) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };
    
    const result = await treeService.addToFavorites(user.uid, treeData);
    if (result.success) {
      await loadUserFavorites(user.uid);
    }
    return result;
  };

  const removeFromFavorites = async (treeId) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };
    
    const result = await treeService.removeFromFavorites(user.uid, treeId);
    if (result.success) {
      await loadUserFavorites(user.uid);
    }
    return result;
  };

  const recordTreeView = async (treeData) => {
    if (!user) return;
    await treeService.recordTreeView(user.uid, treeData);
  };

  // source_id 기반으로 즐겨찾기 체크
  const isFavorite = (treeData) => {
    if (!user || !treeData || !treeData.source_id) {
      return false;
    }
    
    const isInFavorites = userFavorites.some(fav => fav.source_id === treeData.source_id);
    
    console.log('isFavorite 체크:', {
      treeSourceId: treeData.source_id,
      favoriteSourceIds: userFavorites.map(f => f.source_id),
      result: isInFavorites
    });
    
    return isInFavorites;
  };

  const value = {
    user,
    loading,
    userFavorites,
    signInWithGoogle,
    signOut,
    addToFavorites,
    removeFromFavorites,
    recordTreeView,
    isFavorite,
    loadUserFavorites
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  };
};