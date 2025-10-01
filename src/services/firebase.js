// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
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
  getDocs
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 인증 관련 함수들
export const authService = {
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await authService.createOrUpdateUser(user);
      console.log('Google 로그인 성공:', user.displayName);
      return { success: true, user };
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 완료');
      return { success: true };
    } catch (error) {
      console.error('로그아웃 실패:', error);
      return { success: false, error: error.message };
    }
  },

  createOrUpdateUser: async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = {
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
        console.log('신규 사용자 생성:', user.displayName);
      } else {
        await updateDoc(userRef, userData);
        console.log('기존 사용자 업데이트:', user.displayName);
      }
      
      return userData;
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// 나무 즐겨찾기 관련 함수들
export const treeService = {
  addToFavorites: async (userId, treeData) => {
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

      console.log('즐겨찾기 추가 완료:', favoriteTree.species_kr);
      return { success: true, treeId };
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      return { success: false, error: error.message };
    }
  },

  removeFromFavorites: async (userId, treeId) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        favoriteTreeIds: arrayRemove(treeId),
        updatedAt: serverTimestamp()
      });

      const favoriteRef = doc(db, 'favorites', `${userId}_${treeId}`);
      await deleteDoc(favoriteRef);

      console.log('즐겨찾기 제거 완료:', treeId);
      return { success: true };
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      return { success: false, error: error.message };
    }
  },

  getUserFavorites: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return { success: true, favorites: [] };
      }

      const favoriteTreeIds = userSnap.data().favoriteTreeIds || [];
      
      const favoritePromises = favoriteTreeIds.map(async (treeId) => {
        const favoriteRef = doc(db, 'favorites', `${userId}_${treeId}`);
        const favoriteSnap = await getDoc(favoriteRef);
        return favoriteSnap.exists() ? favoriteSnap.data() : null;
      });

      const favorites = (await Promise.all(favoritePromises))
        .filter(favorite => favorite !== null)
        .sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds);

      return { success: true, favorites };
    } catch (error) {
      console.error('즐겨찾기 조회 실패:', error);
      return { success: false, error: error.message };
    }
  },

  recordTreeView: async (userId, treeData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const treeId = treeData.source_id;
      
      await updateDoc(userRef, {
        visitedTreeIds: arrayUnion(treeId),
        lastActivityAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('나무 조회 기록 실패:', error);
      return { success: false, error: error.message };
    }
  }
};

// 방문기록 서비스
export const visitService = {
  uploadVisitPhoto: async (userId, treeId, photoBlob) => {
    try {
      console.log('사진 업로드 시작:', { userId, treeId, size: photoBlob.size });
      
      const timestamp = Date.now();
      const storageRef = ref(storage, `visits/${userId}/${treeId}_${timestamp}.jpg`);
      
      console.log('Storage 경로:', storageRef.fullPath);
      
      const snapshot = await uploadBytes(storageRef, photoBlob);
      console.log('업로드 완료, URL 가져오는 중...');
      
      const photoURL = await getDownloadURL(snapshot.ref);
      console.log('사진 URL:', photoURL);
      
      return { success: true, photoURL };
    } catch (error) {
      console.error('사진 업로드 실패 상세:', error);
      return { success: false, error: error.message };
    }
  },

  addVisit: async (userId, userName, userPhotoURL, treeData, photoURL, comment) => {
    try {
      console.log('방문기록 저장 시작:', { userId, treeId: treeData.source_id });
      
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
          district: treeData.district
        }
      };

      await setDoc(visitRef, visitData);
      console.log('Firestore 저장 완료');

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        visitedTreeIds: arrayUnion(treeData.source_id),
        lastActivityAt: serverTimestamp()
      });
      console.log('사용자 기록 업데이트 완료');

      return { success: true, visitId };
    } catch (error) {
      console.error('방문기록 추가 실패 상세:', error);
      return { success: false, error: error.message };
    }
  },

  getTreeVisits: async (treeId, userId = null) => {
    try {
      const visitsRef = collection(db, 'visits');
      let q = query(
        visitsRef,
        where('treeId', '==', treeId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let visits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (userId) {
        visits = visits.filter(v => v.userId === userId);
      }

      console.log(`방문기록 조회 완료: ${visits.length}개`);
      return { success: true, visits };
    } catch (error) {
      console.error('방문기록 조회 실패:', error);
      return { success: false, error: error.message, visits: [] };
    }
  },

  deleteVisit: async (userId, visitId) => {
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
      console.log('방문기록 삭제 완료:', visitId);
      return { success: true };
    } catch (error) {
      console.error('방문기록 삭제 실패:', error);
      return { success: false, error: error.message };
    }
  },
  // 사용자의 모든 방문기록 조회
  getUserVisits: async (userId) => {
    try {
      const visitsRef = collection(db, 'visits');
      const q = query(
        visitsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const visits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`사용자 방문기록 조회 완료: ${visits.length}개`);
      return { success: true, visits };
    } catch (error) {
      console.error('사용자 방문기록 조회 실패:', error);
      return { success: false, error: error.message, visits: [] };
    }
  }

};