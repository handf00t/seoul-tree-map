// Tree-related type definitions

export interface Coordinates {
  lat: number;
  lng: number;
}

export type TreeType = 'protected' | 'roadside' | 'park';

export interface TreeBenefits {
  rainfall_interception: number;
  energy_savings: number;
  air_quality: number;
  co2_sequestration: number;
  total_value_krw: number;
}

export interface TreeData {
  source_id: string;
  species_kr: string;
  tree_type: TreeType;
  dbh_cm?: number;
  height_m?: number;
  borough: string;
  district: string;
  address?: string;
  clickCoordinates: Coordinates;
  latitude?: number;
  longitude?: number;
  benefits?: TreeBenefits;
}

export interface FavoriteTree {
  id: string;
  species_kr: string;
  tree_type: TreeType;
  borough: string;
  district: string;
  coordinates: Coordinates;
  source_id: string;
  dbh_cm?: number;
  height_m?: number;
  address?: string;
  addedAt?: any; // Firebase Timestamp
}

export interface SpeciesInfo {
  name: string;
  color: string;
}

export interface SizeCategory {
  id: string;
  label: string;
  range: [number, number];
  color: string;
}

export interface TreeFilters {
  species: string[];
  sizes: string[];
}
