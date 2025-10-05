// src/services/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { TreeData, FavoriteTree, Visit } from '../types';

// Firebase 설정 타입
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

// API 응답 타입
interface AuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

interface BasicResponse {
  success: boolean;
  error?: string;
}

interface FavoritesResponse {
  success: boolean;
  favorites?: FavoriteTree[];
  error?: string;
}

interface PhotoUploadResponse {
  success: boolean;
  photoURL?: string;
  error?: string;
}

interface VisitResponse {
  success: boolean;
  visitId?: string;
  error?: string;
}

interface VisitsResponse {
  success: boolean;
  visits: Visit[];
  error?: string;
}

interface FavoriteResponse {
  success: boolean;
  treeId?: string;
  error?: string;
}

// 사용자 데이터 타입
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLoginAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
  createdAt?: ReturnType<typeof serverTimestamp>;
  favoriteTreeIds?: string[];
  visitedTreeIds?: string[];
  totalTreesViewed?: number;
  profileSettings?: {
    showRealName: boolean;
    shareActivity: boolean;
    emailNotifications: boolean;
  };
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 인증 관련 함수들
export const authService = {
  signInWithGoogle: async (): Promise<AuthResponse> => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await authService.createOrUpdateUser(user);
      if (process.env.NODE_ENV === 'development') {
        console.log('Google 로그인 성공:', user.displayName);
      }
      return { success: true, user };
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      return { success: false, error: error.message };
    }
  },

  signOut: async (): Promise<BasicResponse> => {
    try {
      await signOut(auth);
      if (process.env.NODE_ENV === 'development') {
        console.log('로그아웃 완료');
      }
      return { success: true };
    } catch (error: any) {
      console.error('로그아웃 실패:', error);
      return { success: false, error: error.message };
    }
  },

  createOrUpdateUser: async (user: FirebaseUser): Promise<UserData> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (!userSnap.exists()) {
        userData.createdAt = serverTimestamp();
        userData.favoriteTreeIds = [];
        userData.visitedTreeIds = [];
        userData.totalTreesViewed = 0;
        userData.profileSettings = {
          showRealName: true,
          shareActivity: true,
          emailNotifications: true
        };

        await setDoc(userRef, userData);
      if (process.env.NODE_ENV === 'development') {
        console.log('신규 사용자 생성:', user.displayName);
      }
      } else {
        await updateDoc(userRef, userData as any);
      if (process.env.NODE_ENV === 'development') {
        console.log('기존 사용자 업데이트:', user.displayName);
      }
      }

      return userData;
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// 나무 즐겨찾기 관련 함수들
export const treeService = {
  addToFavorites: async (userId: string, treeData: TreeData): Promise<FavoriteResponse> => {
    try {
      const userRef = doc(db, 'users', userId);
      const treeId = treeData.source_id;

      if (!treeId) {
        return { success: false, error: '나무 ID가 없습니다.' };
      }

      const favoriteTree = {
        id: treeId,
        species_kr: treeData.species_kr,
        tree_type: treeData.tree_type,
        borough: treeData.borough,
        district: treeData.district,
        coordinates: {
          lat: treeData.clickCoordinates.lat,
          lng: treeData.clickCoordinates.lng
        },
        source_id: treeData.source_id,
        dbh_cm: treeData.dbh_cm,
        height_m: treeData.height_m,
        addedAt: serverTimestamp()
      };

      await updateDoc(userRef, {
        favoriteTreeIds: arrayUnion(treeId),
        updatedAt: serverTimestamp()
      });

      const favoriteRef = doc(db, 'favorites', `${userId}_${treeId}`);
      await setDoc(favoriteRef, {
        userId,
        treeId,
        ...favoriteTree
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('즐겨찾기 추가 완료:', favoriteTree.species_kr);
      }
      return { success: true, treeId };
    } catch (error: any) {
      console.error('즐겨찾기 추가 실패:', error);
      return { success: false, error: error.message };
    }
  },

  removeFromFavorites: async (userId: string, treeId: string): Promise<BasicResponse> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        favoriteTreeIds: arrayRemove(treeId),
        updatedAt: serverTimestamp()
      });

      const favoriteRef = doc(db, 'favorites', `${userId}_${treeId}`);
      await deleteDoc(favoriteRef);

      if (process.env.NODE_ENV === 'development') {
        console.log('즐겨찾기 제거 완료:', treeId);
      }
      return { success: true };
    } catch (error: any) {
      console.error('즐겨찾기 제거 실패:', error);
      return { success: false, error: error.message };
    }
  },

  getUserFavorites: async (userId: string): Promise<FavoritesResponse> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: true, favorites: [] };
      }

      const favoriteTreeIds = userSnap.data().favoriteTreeIds || [];

      const favoritePromises = favoriteTreeIds.map(async (treeId: string) => {
        const favoriteRef = doc(db, 'favorites', `${userId}_${treeId}`);
        const favoriteSnap = await getDoc(favoriteRef);
        return favoriteSnap.exists() ? favoriteSnap.data() : null;
      });

      const favorites = (await Promise.all(favoritePromises))
        .filter((favorite): favorite is DocumentData => favorite !== null)
        .sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds) as FavoriteTree[];

      return { success: true, favorites };
    } catch (error: any) {
      console.error('즐겨찾기 조회 실패:', error);
      return { success: false, error: error.message };
    }
  },

  recordTreeView: async (userId: string, treeData: TreeData): Promise<BasicResponse> => {
    try {
      const userRef = doc(db, 'users', userId);
      const treeId = treeData.source_id;

      await updateDoc(userRef, {
        visitedTreeIds: arrayUnion(treeId),
        lastActivityAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('나무 조회 기록 실패:', error);
      return { success: false, error: error.message };
    }
  }
};

// 방문기록 서비스
export const visitService = {
  uploadVisitPhoto: async (userId: string, treeId: string, photoBlob: Blob): Promise<PhotoUploadResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('사진 업로드 시작:', { userId, treeId, size: photoBlob.size });
      }

      const timestamp = Date.now();
      const storageRef = ref(storage, `visits/${userId}/${treeId}_${timestamp}.jpg`);

      if (process.env.NODE_ENV === 'development') {
        console.log('Storage 경로:', storageRef.fullPath);
      }

      const snapshot = await uploadBytes(storageRef, photoBlob);
      if (process.env.NODE_ENV === 'development') {
        console.log('업로드 완료, URL 가져오는 중...');
      }

      const photoURL = await getDownloadURL(snapshot.ref);
      if (process.env.NODE_ENV === 'development') {
        console.log('사진 URL:', photoURL);
      }

      return { success: true, photoURL };
    } catch (error: any) {
      console.error('사진 업로드 실패 상세:', error);
      return { success: false, error: error.message };
    }
  },

  addVisit: async (
    userId: string,
    userName: string,
    userPhotoURL: string,
    treeData: TreeData,
    photoURL: string,
    comment: string
  ): Promise<VisitResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('방문기록 저장 시작:', { userId, treeId: treeData.source_id });
      }

      const visitId = `${userId}_${treeData.source_id}_${Date.now()}`;
      const visitRef = doc(db, 'visits', visitId);

      const visitData = {
        userId,
        userName,
        userPhotoURL,
        treeId: treeData.source_id,
        photoURL,
        comment: comment.slice(0, 14),
        createdAt: serverTimestamp(),
        treeInfo: {
          species_kr: treeData.species_kr,
          tree_type: treeData.tree_type,
          borough: treeData.borough,
          district: treeData.district,
          coordinates: {
            lat: treeData.clickCoordinates?.lat || 37.5665,
            lng: treeData.clickCoordinates?.lng || 126.9780
          }
        }
      };

      await setDoc(visitRef, visitData);
      if (process.env.NODE_ENV === 'development') {
        console.log('Firestore 저장 완료');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        visitedTreeIds: arrayUnion(treeData.source_id),
        lastActivityAt: serverTimestamp()
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('사용자 기록 업데이트 완료');
      }

      return { success: true, visitId };
    } catch (error: any) {
      console.error('방문기록 추가 실패 상세:', error);
      return { success: false, error: error.message };
    }
  },

  getTreeVisits: async (treeId: string, userId: string | null = null): Promise<VisitsResponse> => {
    try {
      const visitsRef = collection(db, 'visits');
      let q = query(
        visitsRef,
        where('treeId', '==', treeId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let visits: Visit[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visit[];

      if (userId) {
        visits = visits.filter(v => v.userId === userId);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`방문기록 조회 완료: ${visits.length}개`);
      }
      return { success: true, visits };
    } catch (error: any) {
      console.error('방문기록 조회 실패:', error);
      return { success: false, error: error.message, visits: [] };
    }
  },

  deleteVisit: async (userId: string, visitId: string): Promise<BasicResponse> => {
    try {
      const visitRef = doc(db, 'visits', visitId);
      const visitSnap = await getDoc(visitRef);

      if (!visitSnap.exists()) {
        return { success: false, error: '방문기록을 찾을 수 없습니다.' };
      }

      if (visitSnap.data().userId !== userId) {
        return { success: false, error: '삭제 권한이 없습니다.' };
      }

      await deleteDoc(visitRef);
      if (process.env.NODE_ENV === 'development') {
        console.log('방문기록 삭제 완료:', visitId);
      }
      return { success: true };
    } catch (error: any) {
      console.error('방문기록 삭제 실패:', error);
      return { success: false, error: error.message };
    }
  },
  // 사용자의 모든 방문기록 조회
  getUserVisits: async (userId: string): Promise<VisitsResponse> => {
    try {
      const visitsRef = collection(db, 'visits');
      const q = query(
        visitsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const visits: Visit[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visit[];

      if (process.env.NODE_ENV === 'development') {
        console.log(`사용자 방문기록 조회 완료: ${visits.length}개`);
      }
      return { success: true, visits };
    } catch (error: any) {
      console.error('사용자 방문기록 조회 실패:', error);
      return { success: false, error: error.message, visits: [] };
    }
  }

};
