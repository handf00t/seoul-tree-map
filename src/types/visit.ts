// Visit record related type definitions

import { Coordinates } from './tree';
import { Timestamp } from 'firebase/firestore';

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
  userName: string;
  userPhotoURL: string;
  treeId: string;
  photoURL: string;
  comment: string;
  createdAt: Timestamp;
  treeInfo: TreeInfo;
}

export interface VisitFormData {
  photo: Blob | null;
  comment: string;
}
