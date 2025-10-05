// Mapbox related type definitions

import { Map, MapMouseEvent } from 'mapbox-gl';

export interface MapLoadEvent {
  target: Map;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  shortName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type { Map, MapMouseEvent };
