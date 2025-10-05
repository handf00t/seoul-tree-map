// Visit record related type definitions

import { Coordinates } from './tree';

export interface TreeInfo {
  species_kr: string;
  tree_type: string;
  borough: string;
  district: string;
  coordinates: Coordinates;
}

export interface Visit {
  id: string;
  userId: string;
  userName: string | null;
  userPhotoURL: string | null;
  treeId: string;
  photoURL: string;
  comment: string;
  createdAt: any; // Firebase Timestamp
  treeInfo: TreeInfo;
}

export interface VisitFormData {
  photo: Blob | null;
  comment: string;
}
