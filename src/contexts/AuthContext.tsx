// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, treeService } from '../services/firebase';
import { UserProfile, FavoriteTree, TreeData } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  userFavorites: FavoriteTree[];
  signInWithGoogle: () => Promise<{ success: boolean; user?: any; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  addToFavorites: (treeData: TreeData) => Promise<{ success: boolean; error?: string; treeId?: string }>;
  removeFromFavorites: (treeId: string) => Promise<{ success: boolean; error?: string }>;
  recordTreeView: (treeData: TreeData) => Promise<void>;
  isFavorite: (treeData: TreeData | null) => boolean;
  loadUserFavorites: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<FavoriteTree[]>([]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (authUser: FirebaseUser | null) => {
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

  const loadUserFavorites = async (userId: string) => {
    const result = await treeService.getUserFavorites(userId);
    if (result.success && result.favorites) {
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

  const addToFavorites = async (treeData: TreeData) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };

    const result = await treeService.addToFavorites(user.uid, treeData);
    if (result.success) {
      await loadUserFavorites(user.uid);
    }
    return result;
  };

  const removeFromFavorites = async (treeId: string) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };

    const result = await treeService.removeFromFavorites(user.uid, treeId);
    if (result.success) {
      await loadUserFavorites(user.uid);
    }
    return result;
  };

  const recordTreeView = async (treeData: TreeData) => {
    if (!user) return;
    await treeService.recordTreeView(user.uid, treeData);
  };

  // source_id 기반으로 즐겨찾기 체크
  const isFavorite = (treeData: TreeData | null): boolean => {
    if (!user || !treeData || !treeData.source_id) {
      return false;
    }

    return userFavorites.some(fav => fav.source_id === treeData.source_id);
  };

  const value: AuthContextType = {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
