import { api } from './client';

export interface ZoneSummary {
  zone_code: string;
  zone_name_np: string;
  zone_name_en: string;
  color: string;
  polygon_count: number;
  total_area_sqm: number;
  total_area_ha: number;
  area_ropani_str: string;
  percentage: number;
  rules_np: string;
}

export interface WardSummary {
  ward_no: number;
  ward_name: string;
  total_area_sqm: number;
  total_area_ha: number;
  area_ropani_str: string;
  zones: Record<string, number>;
}

export interface LandClassificationSummary {
  palika_name: string;
  total_polygons: number;
  total_area_sqm: number;
  total_area_ha: number;
  total_area_ropani: string;
  zones: ZoneSummary[];
  wards: WardSummary[];
}

export interface GdbLayerItem {
  id: string;
  name: string;
  layer_name: string;
  type?: string;
  count?: number;
  area_ropani?: string;
  zones_count?: number;
  status: string;
  layers?: string[];
}

export interface GdbInfo {
  status: string;
  gdb_path: string;
  gdb_name: string;
  projection: string;
  central_meridian: number;
  datum: string;
  unit: string;
  palika: string;
  layers: GdbLayerItem[];
  summary: {
    total_parcels: number;
    total_land_zones: number;
    total_area_ha: number;
  };
}

export interface CadastreSummary {
  total_parcels: number;
  total_area_sqm?: number;
  total_area_ha?: number;
  total_area_ropani?: string;
  ward_distribution: { ward_no: number; parcel_count: number }[];
}

export const landClassificationApi = {
  getSummary: (): Promise<LandClassificationSummary> =>
    api.get<LandClassificationSummary>('/gis/land-classification/summary'),

  getWardBoundariesGeoJSON: (): Promise<any> =>
    api.get<any>('/gis/land-classification/wards-geojson'),

  getLandClassificationGeoJSON: (params?: { ward?: number; zone?: string; limit?: number }): Promise<any> => {
    const queryParts: string[] = [];
    if (params?.ward && params.ward > 0) queryParts.push(`ward=${params.ward}`);
    if (params?.zone && params.zone !== 'ALL') queryParts.push(`zone=${params.zone}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<any>(`/gis/land-classification/geojson${qs}`);
  },

  getZoneCatalog: (): Promise<ZoneSummary[]> =>
    api.get<ZoneSummary[]>('/gis/land-classification/zones'),

  getGdbInfo: (): Promise<GdbInfo> =>
    api.get<GdbInfo>('/gis/land-classification/gdb-info'),

  getCadastreSummary: (): Promise<CadastreSummary> =>
    api.get<CadastreSummary>('/gis/land-classification/cadastre/summary'),

  searchCadastreParcels: (parcelNo: string, wardNo?: number): Promise<any> => {
    const params = new URLSearchParams();
    params.set('parcel_no', parcelNo);
    if (wardNo && wardNo > 0) params.set('ward_no', wardNo.toString());
    return api.get<any>(`/gis/land-classification/cadastre/search?${params.toString()}`);
  },

  getCadastreInBBox: (bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number; limit?: number }): Promise<any> => {
    const params = new URLSearchParams({
      min_lat: bounds.minLat.toString(),
      min_lng: bounds.minLng.toString(),
      max_lat: bounds.maxLat.toString(),
      max_lng: bounds.maxLng.toString(),
      limit: (bounds.limit || 200).toString(),
    });
    return api.get<any>(`/gis/land-classification/cadastre/bbox?${params.toString()}`);
  },
};

