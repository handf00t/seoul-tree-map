// User and authentication related type definitions

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  showRealName: boolean;
  shareActivity: boolean;
  emailNotifications: boolean;
}

export interface UserData extends UserProfile {
  createdAt?: any; // Firebase Timestamp
  lastLoginAt?: any;
  updatedAt?: any;
  favoriteTreeIds: string[];
  visitedTreeIds: string[];
  totalTreesViewed: number;
  profileSettings: UserSettings;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  addToFavorites: (treeData: any) => Promise<void>;
  removeFromFavorites: (treeId: string) => Promise<void>;
  isFavorite: (treeId: string) => boolean;
  userFavorites: any[];
  recordTreeView: (treeData: any) => Promise<void>;
}
