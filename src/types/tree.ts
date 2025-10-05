// Tree-related type definitions

export interface Coordinates {
  lat: number;
  lng: number;
}

export type TreeType = 'protected' | 'roadside' | 'park';

export interface TreeBenefits {
  stormwater_liters_year?: number;
  stormwater_value_krw_year?: number;
  energy_kwh_year?: number;
  energy_value_krw_year?: number;
  air_pollution_kg_year?: number;
  air_pollution_value_krw_year?: number;
  carbon_storage_kg_year?: number;
  carbon_value_krw_year?: number;
  total_annual_value_krw?: number;
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
