import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { GisFacility } from '../../types/profile';
import type { SensorItem } from '../../api/municipality';
import {
  PANCHPOKHARI_TRAIL_COORDINATES,
  PANCHPOKHARI_WAYPOINTS,
  PANCHPOKHARI_TRAIL_HOTELS,
  KATHMANDU_TO_BHOTANG_ROAD_COORDINATES,
  ROAD_WAYPOINTS,
  SACRED_LAKES_DATA,
  type TrailHotel,
  type TrailWaypoint,
  type SacredLake,
} from '../../data/panchpokhariTrailData';
import {
  KATHMANDU_TO_TARKEGHYANG_ROAD_COORDINATES,
  AMA_YANGRI_TRAIL_COORDINATES,
  AMA_YANGRI_WAYPOINTS,
  AMA_YANGRI_HOTELS,
} from '../../data/amaYangriTrailData';
import {
  Compass,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  Bed,
  Star,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Users,
  Sparkles,
} from 'lucide-react';

interface PalikaMapProps {
  facilities?: GisFacility[];
  sensors?: SensorItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedWard?: number | 'all';
  bufferData?: any;
  selectedLocation?: { lat: number; lng: number; name?: string };
  onSelectLocation?: (lat: number, lng: number, name?: string) => void;
  onUpdateLocation?: (id: string, lat: number, lng: number) => void;
  isPublic?: boolean;
  baseLayer?: 'satellite' | 'streets' | 'topo';
  onBaseLayerChange?: (layer: 'satellite' | 'streets' | 'topo') => void;
  showTrekkingTrail?: boolean;
}

interface PendingMoveInfo {
  id: string;
  name: string;
  typeNepali: string;
  iconEmoji: string;
  iconColor: string;
  oldLat: number;
  oldLng: number;
  newLat: number;
  newLng: number;
}

export const PalikaMap: React.FC<PalikaMapProps> = ({
  facilities = [],
  sensors = [],
  center = [27.9736, 85.6425],
  zoom = 12,
  height = '600px',
  selectedWard = 'all',
  bufferData,
  selectedLocation,
  onSelectLocation,
  onUpdateLocation,
  isPublic = false,
  baseLayer = 'satellite',
  onBaseLayerChange,
  showTrekkingTrail = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayersRef = useRef<{ satellite: L.TileLayer; esri: L.TileLayer; osm: L.TileLayer; topo: L.TileLayer } | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const sensorsLayerRef = useRef<L.LayerGroup | null>(null);
  const trekkingLayerRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerRef = useRef<L.GeoJSON | null>(null);
  const facilityMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Store user-dragged coordinates in memory so re-renders NEVER snap markers back
  const movedCoordsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // State for active dragged facility pending save
  const [pendingMove, setPendingMove] = useState<PendingMoveInfo | null>(null);
  const [isSavingMove, setIsSavingMove] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Trekking Trail and Hotel Modal State
  const [isTrailActive, setIsTrailActive] = useState<boolean>(showTrekkingTrail);
  const [routeMode, setRouteMode] = useState<'trek' | 'full'>('full');
  const [modalHotel, setModalHotel] = useState<TrailHotel | null>(null);
  const [modalWaypoint, setModalWaypoint] = useState<TrailWaypoint | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    phone: '',
    checkInDate: new Date().toISOString().split('T')[0],
    guests: 2,
    roomType: 'standard',
    notes: '',
  });

  // Initialize Map with High-Zoom (up to zoom 22) and Base Layers
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Google Satellite Hybrid (with roads, trails, place names & mountains)
    const satellite = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxNativeZoom: 20,
        maxZoom: 22,
        attribution: '&copy; Google Satellite Hybrid | Municipal Digital Twins',
      }
    );

    // Esri World Imagery (High-Res Photogrammetric Imagery)
    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 19,
        maxZoom: 22,
        attribution: '&copy; Esri World Imagery',
      }
    );

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      maxZoom: 22,
      attribution: '&copy; OpenStreetMap contributors | Municipal Digital Twins (पाँचपोखरी थाङपाल)',
    });

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 17,
      maxZoom: 22,
      attribution: '&copy; OpenTopoMap | SRTM',
    });

    const initialLayer = baseLayer === 'streets' ? osm : baseLayer === 'topo' ? topo : satellite;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      minZoom: 8,
      maxZoom: 22, // Deep building-level and rooftop zoom
      zoomControl: true,
      layers: [initialLayer], // Satellite (स्याटेलाइट) as default!
    });

    baseLayersRef.current = { satellite, esri, osm, topo };

    trekkingLayerRef.current = L.layerGroup().addTo(map);

    // Layer Switcher Control: Satellite, Esri, Streets, Terrain + Overlays
    L.control
      .layers(
        {
          '🛰️ स्याटेलाइट (Satellite Hybrid)': satellite,
          '🌍 Esri Satellite (फोटो स्याटेलाइट)': esri,
          '🗺️ सडक (Streets)': osm,
          '🏔️ टोपो धरातल (Terrain)': topo,
        },
        {
          '🥾 पाँचपोखरी पदमार्ग र होटल': trekkingLayerRef.current,
        },
        { position: 'topright', collapsed: true }
      )
      .addTo(map);

    // Automatically collapse the layer control after selecting a base layer
    map.on('baselayerchange', (e: any) => {
      const layerControl = mapContainerRef.current?.querySelector('.leaflet-control-layers');
      if (layerControl) {
        layerControl.classList.remove('leaflet-control-layers-expanded');
      }
      if (e.name.includes('Satellite') || e.name.includes('स्याटेलाइट') || e.name.includes('Esri')) {
        onBaseLayerChange?.('satellite');
      } else if (e.name.includes('Streets') || e.name.includes('सडक')) {
        onBaseLayerChange?.('streets');
      } else if (e.name.includes('Topo') || e.name.includes('टोपो') || e.name.includes('Terrain')) {
        onBaseLayerChange?.('topo');
      }
    });

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    facilitiesLayerRef.current = L.layerGroup().addTo(map);
    sensorsLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    if (mapContainerRef.current) {
      (mapContainerRef.current as any)._leafletMap = map;
    }
    (window as any).__leafletMap = map;
    setIsMapReady(true);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectLocation?.(e.latlng.lat, e.latlng.lng, 'नक्सामा छानिएको GPS बिन्दु');
    });

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      setIsMapReady(false);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Synchronize baseLayer prop changes to active map tile layer
  useEffect(() => {
    if (!mapInstanceRef.current || !baseLayersRef.current) return;
    const { satellite, esri, osm, topo } = baseLayersRef.current;
    const targetLayer =
      baseLayer === 'streets'
        ? osm
        : baseLayer === 'topo'
        ? topo
        : satellite;

    [satellite, esri, osm, topo].forEach((layer) => {
      if (layer !== targetLayer && mapInstanceRef.current?.hasLayer(layer)) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    if (!mapInstanceRef.current.hasLayer(targetLayer)) {
      mapInstanceRef.current.addLayer(targetLayer);
      targetLayer.bringToBack();
    }
  }, [baseLayer]);

  // ResizeObserver to ensure Leaflet re-renders tiles immediately when entering fullscreen or resizing container
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [height]);

  // Update Facility Markers when facilities or selectedWard changes
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerRef.current) return;

    facilitiesLayerRef.current.clearLayers();
    facilityMarkersMapRef.current.clear();

    const filtered = facilities.filter((f) => {
      if (selectedWard === 'all') return true;
      return f.wardNo === selectedWard;
    });

    filtered.forEach((fac) => {
      let iconColor = '#2563eb';
      let iconEmoji = '🏛️';
      let typeNepali = fac.categoryNepali || 'कार्यालय';

      if (fac.type === 'health_post' || fac.type === 'hospital') {
        iconColor = '#ef4444';
        iconEmoji = '🏥';
        if (!fac.categoryNepali) typeNepali = 'स्वास्थ्य सेवा';
      } else if (fac.type === 'school') {
        iconColor = '#10b981';
        iconEmoji = '🎓';
        if (!fac.categoryNepali) typeNepali = 'विद्यालय / क्याम्पस';
      } else if (fac.type === 'ward_office') {
        iconColor = '#0284c7';
        iconEmoji = '🏛️';
        if (!fac.categoryNepali) typeNepali = 'वडा कार्यालय';
      } else if (fac.type === 'viewpoint') {
        iconColor = '#f59e0b';
        iconEmoji = '🏔️';
        if (!fac.categoryNepali) typeNepali = 'पर्यटन तथा सम्पदा';
      } else if (fac.type === 'business') {
        iconColor = '#6366f1';
        iconEmoji = '🏪';
        if (!fac.categoryNepali) typeNepali = 'व्यवसाय / फर्म';
      } else if (fac.type === 'hotel') {
        iconColor = '#8b5cf6';
        iconEmoji = '🏨';
        if (!fac.categoryNepali) typeNepali = 'होटल तथा होमस्टे';
      } else if (fac.type === 'asset') {
        iconColor = '#059669';
        iconEmoji = '📦';
        if (!fac.categoryNepali) typeNepali = 'सार्वजनिक सम्पत्ति (PAMS)';
      } else if (fac.type === 'building_permit') {
        iconColor = '#d97706';
        iconEmoji = '🏗️';
        if (!fac.categoryNepali) typeNepali = 'घर-नक्सा पास (e-BPS)';
      } else if (fac.type === 'shelter') {
        iconColor = '#059669';
        iconEmoji = '⛺';
        if (!fac.categoryNepali) typeNepali = 'सुरक्षित आश्रयस्थल (Evacuation Shelter)';
      } else if (fac.type === 'agriculture') {
        iconColor = '#15803d';
        iconEmoji = '🌾';
        if (!fac.categoryNepali) typeNepali = 'कृषि तथा पशुपन्छी पूर्वाधार';
      } else if (fac.type === 'complaint') {
        const rawStatus = (fac as any).status || '';
        if (rawStatus === 'resolved') {
          iconColor = '#10b981';
          iconEmoji = '✅';
        } else if (rawStatus === 'in_progress') {
          iconColor = '#3b82f6';
          iconEmoji = '⚙️';
        } else if (rawStatus === 'rejected') {
          iconColor = '#ef4444';
          iconEmoji = '❌';
        } else {
          iconColor = '#f59e0b';
          iconEmoji = '📢';
        }
        if (!fac.categoryNepali) typeNepali = 'नागरिक गुनासो (Grievance)';
      } else if (fac.type === 'citizen_service') {
        iconColor = '#6366f1';
        iconEmoji = '🏛️';
        if (!fac.categoryNepali) typeNepali = 'वडा नागरिक सेवा डेस्क';
      } else if (fac.type === 'ambulance') {
        iconColor = '#dc2626';
        iconEmoji = '🚑';
        if (!fac.categoryNepali) typeNepali = 'एम्बुलेन्स सेवा (Ambulance)';
      } else if (fac.type === 'social_care') {
        iconColor = '#7c3aed';
        iconEmoji = '🦽';
        if (!fac.categoryNepali) typeNepali = 'अपाङ्गता तथा ज्येष्ठ नागरिक सहायता डेस्क';
      } else if (fac.type === 'project') {
        const rawStatus = (fac as any).status || '';
        const progress = (fac as any).progressPercentage || (fac as any).physicalProgressPercent || 0;
        if (rawStatus === 'completed' || progress === 100) {
          iconColor = '#10b981';
          iconEmoji = '✅';
        } else if (rawStatus === 'ongoing') {
          iconColor = '#f59e0b';
          iconEmoji = '🏗️';
        } else {
          iconColor = '#6366f1';
          iconEmoji = '📐';
        }
        if (!fac.categoryNepali) typeNepali = 'विकास पूर्वाधार योजना (Project)';
      } else if (fac.type === 'building_permit') {
        const rawStatus = (fac as any).status || '';
        if (rawStatus.includes('सम्पन्न')) {
          iconColor = '#10b981';
          iconEmoji = '🏢';
        } else {
          iconColor = '#0284c7';
          iconEmoji = '🏠';
        }
        if (!fac.categoryNepali) typeNepali = 'e-BPS नक्सापास भवन';
      } else if (fac.type === 'cooperative') {
        iconColor = '#0f766e';
        iconEmoji = '🏛️';
        if (!fac.categoryNepali) typeNepali = 'सहकारी संस्था (Cooperative)';
      }


      // Check if user previously dragged this facility in the current session
      const activeCoords = movedCoordsRef.current.get(fac.id) || { lat: fac.lat, lng: fac.lng };

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="
            position: relative;
            background: ${iconColor};
            color: white;
            min-width: 34px;
            height: 32px;
            padding: 0 6px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.38);
            border: 2px solid white;
            font-size: 11px;
            font-weight: bold;
            cursor: grab;
            transition: transform 0.15s ease;
          ">
            <span>${iconEmoji}</span>
            <span style="font-size: 10px; opacity: 0.95;">W${fac.wardNo}</span>
          </div>
        `,
        iconSize: [44, 32],
        iconAnchor: [22, 16],
      });

      const marker = L.marker([activeCoords.lat, activeCoords.lng], {
        icon: customIcon,
        draggable: !isPublic,
        title: isPublic ? fac.name : `${fac.name} (तानेर नयाँ GPS स्थानमा सार्न सकिन्छ)`,
      });

      const buildPopupContent = (curLat: number, curLng: number, isMoved: boolean) => {
        const popupEl = document.createElement('div');
        popupEl.style.fontFamily = 'inherit';
        popupEl.style.padding = '4px';
        popupEl.style.minWidth = '250px';

        const codeDisplay = fac.code || (
          fac.type === 'school' ? `SCH-0${fac.wardNo}-${(fac.id.replace(/\D/g, '') || '01').padStart(3, '0')}` :
          fac.type === 'health_post' ? `HP-0${fac.wardNo}-${(fac.id.replace(/\D/g, '') || '01').padStart(3, '0')}` :
          fac.type === 'ward_office' ? `WARD-0${fac.wardNo}` :
          fac.type === 'viewpoint' ? `TOUR-0${fac.id.replace(/\D/g, '') || '01'}` :
          fac.type === 'complaint' ? `${fac.id}` :
          fac.type === 'ambulance' ? `AMB-0${fac.wardNo}` :
          fac.type === 'social_care' ? `CARE-0${fac.wardNo}` :
          fac.type === 'project' ? (fac.code || `PRJ-0${fac.wardNo}-${(fac.id.replace(/\D/g, '') || '01').slice(-3)}`) :
          fac.type === 'building_permit' ? (fac.code || `BPS-0${fac.wardNo}-${fac.id.slice(0, 4)}`) :
          `FAC-${fac.id}`
        );

        const detailBtnLabel = (
          fac.type === 'school' ? '🏫 विद्यालय विवरण' :
          fac.type === 'health_post' ? '🏥 स्वास्थ्य संस्था विवरण' :
          fac.type === 'ward_office' ? '🏛️ वडा कार्यालय विवरण' :
          fac.type === 'viewpoint' ? '🏔️ पर्यटकीय स्थल विवरण' :
          fac.type === 'hotel' ? '🏨 होटल/होमस्टे विवरण' :
          fac.type === 'agriculture' ? '🌾 कृषि केन्द्र विवरण' :
          fac.type === 'complaint' ? '📢 गुनासो विवरण तथा सम्बोधन' :
          fac.type === 'citizen_service' ? '📝 ई-सिफारिस सेवा' :
          fac.type === 'ambulance' ? '🚑 एम्बुलेन्स सेवा र कल' :
          fac.type === 'social_care' ? '🦽 अपाङ्गता तथा सामाजिक सुरक्षा' :
          fac.type === 'project' ? '🏗️ योजना विस्तृत लगत' :
          fac.type === 'building_permit' ? '🏢 e-BPS नक्सापास विवरण' :
          fac.type === 'shelter' ? '⛺ सुरक्षित आश्रयस्थल विवरण' :
          '🏢 विस्तृत विवरण'
        );

        const detailUrl = fac.type === 'school' ? `/schools/${fac.id}` : 
                          fac.type === 'hotel' ? `/tourism` : 
                          fac.type === 'viewpoint' ? `/tourism` :
                          fac.type === 'agriculture' ? `/agriculture` :
                          fac.type === 'shelter' ? `/disaster` :
                          fac.type === 'complaint' ? `/complaints?track=${encodeURIComponent(fac.code || fac.id)}` :
                          fac.type === 'citizen_service' ? `/citizen-services` :
                          fac.type === 'ambulance' ? `/health` :
                          fac.type === 'social_care' ? `/disability` :
                          fac.type === 'project' ? `/projects` :
                          fac.type === 'building_permit' ? `/public-building-permit` :
                          `/facilities/${fac.id}`;


        popupEl.innerHTML = `
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: ${iconColor}; background: ${iconColor}15; padding: 2px 7px; border-radius: 9999px; border: 1px solid ${iconColor}40;">
                ${iconEmoji} ${typeNepali}
              </span>
              <span style="font-size: 11px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 7px; border-radius: 9999px;">
                वडा नं. ${fac.wardNo}
              </span>
            </div>
            <h4 style="margin: 0 0 3px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35;">${fac.name}</h4>
            <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">
              कोड: <span style="color: #1e293b; font-family: monospace; font-weight: 700;">${codeDisplay}</span>
            </div>
          </div>
          
          ${isMoved ? `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 5px; padding: 4px 8px; margin-bottom: 6px; font-size: 11px; color: #065f46; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span>📍 नयाँ GPS स्थानमा सारिएको छ</span>
            </div>
          ` : (!isPublic ? `
            <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
              💡 <em>पिनलाई माउसले तानेर (Drag) नयाँ GPS स्थानमा सार्न सकिन्छ</em>
            </div>
          ` : '')}

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; font-size: 11.5px; display: flex; flex-direction: column; gap: 3px;">
            ${fac.categoryNepali ? `
            <div style="display: flex; justify-content: space-between; gap: 8px;">
              <span style="color: #64748b; flex-shrink: 0;">🏷️ प्रकार:</span>
              <span style="font-weight: 600; color: #15803d; text-align: right;">${fac.categoryNepali}</span>
            </div>` : ''}
            ${(fac as any).elevation ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">⛰️ उचाइ:</span>
              <span style="font-weight: 600; color: #0f172a;">${(fac as any).elevation} मिटर</span>
            </div>` : ''}
            ${(fac as any).capacity ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">📦 क्षमता:</span>
              <span style="font-weight: 600; color: #0f172a;">${(fac as any).capacity} ${(fac as any).name?.includes('दुग्ध') ? 'लिटर' : 'मे.टन'}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">📍 GPS अक्षांश:</span>
              <span id="lat-${fac.id}" style="font-family: monospace; font-weight: 700; color: ${isMoved ? '#059669' : '#0f172a'};">${curLat.toFixed(5)}° N</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">📍 GPS देशान्तर:</span>
              <span id="lng-${fac.id}" style="font-family: monospace; font-weight: 700; color: ${isMoved ? '#059669' : '#0f172a'};">${curLng.toFixed(5)}° E</span>
            </div>
            ${fac.contact ? `
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 3px; margin-top: 2px;">
              <span style="color: #64748b;">📞 सम्पर्क:</span>
              <span style="font-weight: 600; color: #0284c7;">${fac.contact}</span>
            </div>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <button class="gis-detail-page-btn" style="
              width: 100%;
              background: #1d4ed8;
              color: white;
              border: none;
              padding: 7px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              box-shadow: 0 2px 6px rgba(29, 78, 216, 0.25);
            ">
              <span>${detailBtnLabel}</span>
              <span style="font-size: 13px;">➔</span>
            </button>
            <button class="gis-buffer-btn" style="
              width: 100%;
              background: #0284c7;
              color: white;
              border: none;
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            ">
              <span>🎯 Shapely बफर तथा जोखिम विश्लेषण</span>
            </button>
            <button class="gis-save-btn" style="
              width: 100%;
              background: #10b981;
              color: white;
              border: none;
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 11.5px;
              font-weight: 700;
              cursor: pointer;
              display: ${isMoved ? 'flex' : 'none'};
              align-items: center;
              justify-content: center;
              gap: 4px;
            ">
              <span>💾 नयाँ स्थान सुरक्षित गर्नुहोस्</span>
            </button>
          </div>
        `;

        const detailBtn = popupEl.querySelector('.gis-detail-page-btn');
        if (detailBtn) {
          detailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = detailUrl;
          });
        }

        const btn = popupEl.querySelector('.gis-buffer-btn');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentPos = marker.getLatLng();
            onSelectLocation?.(currentPos.lat, currentPos.lng, fac.name);
            marker.closePopup();
          });
        }

        const saveBtn = popupEl.querySelector('.gis-save-btn');
        if (saveBtn) {
          saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentPos = marker.getLatLng();
            setIsSavingMove(true);
            onUpdateLocation?.(fac.id, currentPos.lat, currentPos.lng);
            setPendingMove(null);
            setTimeout(() => setIsSavingMove(false), 500);
            marker.closePopup();
          });
        }

        return popupEl;
      };

      marker.bindPopup(buildPopupContent(activeCoords.lat, activeCoords.lng, movedCoordsRef.current.has(fac.id)));

      marker.on('click', () => {
        const currentPos = marker.getLatLng();
        onSelectLocation?.(currentPos.lat, currentPos.lng, fac.name);
      });

      // Live update coordinates in popup during drag
      marker.on('drag', (e: L.LeafletEvent) => {
        const target = e.target as L.Marker;
        const newPos = target.getLatLng();
        const popup = target.getPopup();
        if (popup && popup.isOpen()) {
          const el = popup.getElement();
          if (el) {
            const latEl = el.querySelector(`#lat-${fac.id}`);
            const lngEl = el.querySelector(`#lng-${fac.id}`);
            if (latEl) latEl.textContent = `${newPos.lat.toFixed(5)}° N`;
            if (lngEl) lngEl.textContent = `${newPos.lng.toFixed(5)}° E`;

            const saveBtn = el.querySelector('.gis-save-btn') as HTMLElement;
            if (saveBtn) saveBtn.style.display = 'flex';
          }
        }
      });

      // On Drag End: Persist to ref, update right-panel coordinates, and display pending move banner
      marker.on('dragend', (e: L.LeafletEvent) => {
        const target = e.target as L.Marker;
        const newPos = target.getLatLng();

        // Save in memory ref so re-renders won't snap it back
        movedCoordsRef.current.set(fac.id, { lat: newPos.lat, lng: newPos.lng });

        // Update popup content with new position
        marker.setPopupContent(buildPopupContent(newPos.lat, newPos.lng, true));
        marker.openPopup();

        // Notify parent immediately so Shapely Buffer & Risk simulation tab updates its coordinates!
        onSelectLocation?.(newPos.lat, newPos.lng, `${fac.name} (नयाँ स्थान)`);

        // Set state for the interactive floating bottom banner
        setPendingMove({
          id: fac.id,
          name: fac.name,
          typeNepali,
          iconEmoji,
          iconColor,
          oldLat: fac.lat,
          oldLng: fac.lng,
          newLat: newPos.lat,
          newLng: newPos.lng,
        });
      });

      facilitiesLayerRef.current?.addLayer(marker);
      facilityMarkersMapRef.current.set(fac.id, marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities, selectedWard]);

  // Render IoT Sensors Layer (Separated so 8s telemetry updates don't reload facilities!)
  useEffect(() => {
    if (!mapInstanceRef.current || !sensorsLayerRef.current) return;

    sensorsLayerRef.current.clearLayers();

    sensors.forEach((s) => {
      const isCritical = s.status === 'Critical';
      const isWarning = s.status === 'Warning';
      const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

      const sensorIcon = L.divIcon({
        className: 'custom-iot-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${color};
              opacity: 0.35;
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              background: ${color};
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.35);
              border: 2px solid white;
              font-size: 11px;
              font-weight: 800;
              z-index: 2;
              cursor: pointer;
            ">
              📡
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const sMarker = L.marker([s.latitude, s.longitude], { icon: sensorIcon });

      const sPopup = `
        <div style="font-family: inherit; padding: 4px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: ${color}; background: ${color}20; padding: 2px 6px; border-radius: 4px;">
              ${s.status.toUpperCase()}
            </span>
            <span style="font-size: 11px; color: #64748b;">${s.sensorId}</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a;">${s.name}</h4>
          <div style="font-size: 12px; color: #334155; margin: 4px 0;">स्थान: <strong>${s.location || 'पाँचपोखरी'}</strong></div>
          <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; margin: 6px 0; display: flex; justify-content: space-between;">
            <span style="font-size: 12px; color: #64748b;">हालको मापन:</span>
            <strong style="font-size: 13px; color: ${color};">${s.lastValue} ${s.unit}</strong>
          </div>
          ${s.dangerThreshold ? `<div style="font-size: 11px; color: #64748b;">खतरा सीमा: ${s.dangerThreshold} ${s.unit}</div>` : ''}
          <div style="margin-top: 6px; font-size: 11px; color: #0284c7; font-weight: 600;">➔ बफर तथा जोखिम सिमुलेसनका लागि क्लिक भयो</div>
        </div>
      `;

      sMarker.bindPopup(sPopup);
      sMarker.on('click', () => {
        onSelectLocation?.(s.latitude, s.longitude, s.name);
      });

      sensorsLayerRef.current?.addLayer(sMarker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensors]);

  // Render Kathmandu-to-Panchpokhari Route (Motor Road + Alpine Trail)
  useEffect(() => {
    if (!mapInstanceRef.current || !trekkingLayerRef.current) return;

    trekkingLayerRef.current.clearLayers();

    if (!isTrailActive) return;

    // 1. Draw Motorable Road (Kathmandu -> Sankhu -> Melamchi -> Bhotang: 75.1 km)
    if (routeMode === 'full') {
      const roadOuter = L.polyline(KATHMANDU_TO_BHOTANG_ROAD_COORDINATES, {
        color: '#1e3a8a',
        weight: 7,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round',
      });

      const roadInner = L.polyline(KATHMANDU_TO_BHOTANG_ROAD_COORDINATES, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '6, 5',
        lineCap: 'round',
        lineJoin: 'round',
      });

      roadOuter.bindTooltip(
        '🚙 <strong>काठमाडौँ ➔ भोताङ सडक खण्ड (Motor Road)</strong><br><small>चाबहिल ➔ साँखु ➔ मेलम्ची ➔ भोताङ • ७५.१ कि.मी. (जिप/बस ४-५ घण्टा)</small>',
        { sticky: true, className: 'trail-waypoint-tooltip' }
      );

      trekkingLayerRef.current.addLayer(roadOuter);
      trekkingLayerRef.current.addLayer(roadInner);

      // Road Waypoints along the Highway
      ROAD_WAYPOINTS.forEach((rwp) => {
        const rIcon = L.divIcon({
          className: 'custom-trail-waypoint-pin',
          html: `<div class="trail-waypoint-pin-inner" style="background: ${rwp.color}; font-size: 13px;">${rwp.iconEmoji}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const rMarker = L.marker([rwp.lat, rwp.lng], { icon: rIcon });
        rMarker.bindTooltip(
          `<span style="display:inline-flex; align-items:center; gap:4px;"><span>${rwp.iconEmoji}</span><strong>${rwp.name}</strong> <span style="opacity:0.85; font-size:10px;">(${rwp.altitudeMeters}m)</span></span>`,
          { permanent: true, direction: 'top', offset: [0, -12], className: 'trail-waypoint-tooltip' }
        );

        rMarker.bindPopup(`
          <div style="font-family: inherit; width: 260px; padding: 10px;">
            <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 2px;">${rwp.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">उचाइ: <strong>${rwp.altitudeMeters} मिटर</strong></div>
            <p style="font-size: 12px; color: #334155; margin: 0 0 8px; line-height: 1.4;">${rwp.description}</p>
            <div style="font-size: 10.5px; color: #0284c7; font-weight: 700;">🚙 काठमाडौँ ➔ भोताङ सडक खण्ड</div>
          </div>
        `);
        trekkingLayerRef.current?.addLayer(rMarker);
      });
    }

    // 2. Draw Exact Alpine Trekking Route (Bhotang -> Chhimti -> Deurali -> Tuppi Danda -> Tangu -> Panchpokhari: 28.4 km)
    const outerTrack = L.polyline(PANCHPOKHARI_TRAIL_COORDINATES, {
      color: '#064e3b',
      weight: 8,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const innerTrack = L.polyline(PANCHPOKHARI_TRAIL_COORDINATES, {
      color: '#10b981',
      weight: 4,
      opacity: 0.95,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round',
    });

    outerTrack.bindTooltip(
      '🥾 <strong>पवित्र पाँचपोखरी तीर्थ पदमार्ग (Alpine Trek)</strong><br><small>भोताङ (२,१०० मी.) ➔ टुपी डाँडा ➔ ताङ्गु ➔ पाँचपोखरी (४,१०० मी.) • २८.४ कि.मी.</small>',
      { sticky: true, className: 'trail-waypoint-tooltip' }
    );

    trekkingLayerRef.current.addLayer(outerTrack);
    trekkingLayerRef.current.addLayer(innerTrack);

    // 3. Draw Trail Waypoints / Place Names (Exact coordinates matching OSM & Satellite ridge)
    PANCHPOKHARI_WAYPOINTS.forEach((wp) => {
      const wpIcon = L.divIcon({
        className: 'custom-trail-waypoint-pin',
        html: `
          <div class="trail-waypoint-pin-inner" style="background: ${wp.color};">
            ${wp.iconEmoji}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const wpMarker = L.marker([wp.lat, wp.lng], {
        icon: wpIcon,
        title: `${wp.name} (${wp.altitudeMeters} मी.)`,
      });

      // Permanent Tooltip: Shows Place Name and Altitude directly on the map
      wpMarker.bindTooltip(
        `<span style="display:inline-flex; align-items:center; gap:4px;"><span>${wp.iconEmoji}</span><strong>${wp.name}</strong> <span style="opacity:0.85; font-size:10px;">(${wp.altitudeMeters}m)</span></span>`,
        {
          permanent: true,
          direction: 'top',
          offset: [0, -14],
          className: 'trail-waypoint-tooltip',
        }
      );

      // Interactive Click Popup for Place Waypoint
      const wpPopup = `
        <div style="font-family: inherit; width: 280px; padding: 0;">
          <div style="background: linear-gradient(135deg, ${wp.color} 0%, #0f172a 100%); color: white; padding: 10px 14px; border-radius: 12px 12px 0 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,0.25); padding: 2px 7px; border-radius: 9999px;">
                ${wp.iconEmoji} ${wp.type.toUpperCase()}
              </span>
              <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #0f172a; padding: 2px 8px; border-radius: 9999px;">
                ⛰️ ${wp.altitudeMeters} मिटर
              </span>
            </div>
            <h4 style="margin: 0; font-size: 14.5px; font-weight: 800; line-height: 1.3;">${wp.name}</h4>
            <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">${wp.nameEn}</div>
          </div>
          <div style="padding: 12px; background: #ffffff;">
            <p style="margin: 0 0 10px; font-size: 12px; color: #334155; line-height: 1.45;">
              ${wp.description}
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✨ मुख्य विशेषताहरू:</div>
              <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: #1e293b; display: flex; flex-direction: column; gap: 3px;">
                ${wp.highlights.map((h) => `<li>${h}</li>`).join('')}
              </ul>
            </div>
            <div style="font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
              <span>📍 GPS: ${wp.lat.toFixed(4)}° N, ${wp.lng.toFixed(4)}° E</span>
              <button class="trail-wp-locate-btn" style="background:#0284c7; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:10.5px; font-weight:700; cursor:pointer;">
                लोकेट
              </button>
            </div>
          </div>
        </div>
      `;

      const wpPopupEl = document.createElement('div');
      wpPopupEl.innerHTML = wpPopup;
      const locateBtn = wpPopupEl.querySelector('.trail-wp-locate-btn');
      if (locateBtn) {
        locateBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectLocation?.(wp.lat, wp.lng, wp.name);
          wpMarker.closePopup();
        });
      }

      wpMarker.bindPopup(wpPopupEl, { maxWidth: 300 });
      trekkingLayerRef.current?.addLayer(wpMarker);
    });

    // 4. Draw Trail Hotels & Lodges (Tungna, Deurali, Tangu Hotel, etc.)
    PANCHPOKHARI_TRAIL_HOTELS.forEach((hotel) => {
      const hIcon = L.divIcon({
        className: 'custom-trail-hotel-pin',
        html: `
          <div class="trail-hotel-pin-inner">
            <span>🏨</span>
            <span>${hotel.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [84, 28],
        iconAnchor: [42, 14],
      });

      const hMarker = L.marker([hotel.lat, hotel.lng], {
        icon: hIcon,
        title: `${hotel.name} • ${hotel.priceRange}`,
      });

      // Tooltip displaying Hotel Name & Price
      hMarker.bindTooltip(
        `<span>🏨 <strong>${hotel.name}</strong> • ${hotel.priceRange.split('/')[0]}</span>`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -14],
          className: 'trail-hotel-tooltip',
        }
      );

      // Interactive Rich Popup Card with Photo, Specs, Phone and Booking
      const popupContainer = document.createElement('div');
      popupContainer.style.width = '315px';
      popupContainer.innerHTML = `
        <div style="border-radius: 12px; overflow: hidden; font-family: inherit;">
          <div style="position: relative; height: 130px; background-image: url('${hotel.imageUrl}'); background-size: cover; background-position: center; background-color: #1e1b4b;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.2) 60%, transparent 100%);"></div>
            <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 5px;">
              <span style="background: rgba(124, 58, 237, 0.92); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px;">
                🏨 ${hotel.typeNepali}
              </span>
              ${hotel.isOxygenAvailable ? `
                <span style="background: rgba(16, 185, 129, 0.92); color: white; font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
                  🫁 अक्सिजन
                </span>
              ` : ''}
            </div>
            <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.65); color: #fbbf24; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px; display: flex; align-items: center; gap: 3px;">
              ⭐ ${hotel.rating}
            </div>
            <div style="position: absolute; bottom: 8px; left: 10px; right: 10px; color: white;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${hotel.name}</h4>
              <div style="font-size: 10.5px; opacity: 0.9; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                <span>📍 ${hotel.locationName}</span>
                <span>•</span>
                <span>⛰️ ${hotel.altitudeMeters} मिटर</span>
              </div>
            </div>
          </div>

          <div style="padding: 10px 12px; background: #ffffff;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: 11px;">
              <div>
                <span style="color: #64748b;">🛏️ क्षमता:</span>
                <strong style="color: #0f172a; margin-left: 3px;">${hotel.totalRooms} कोठा (${hotel.bedCapacity} बेड)</strong>
              </div>
              <div>
                <span style="color: #64748b;">💰 मूल्य:</span>
                <strong style="color: #16a34a; margin-left: 3px;">${hotel.priceRange.split(' ')[0]} ${hotel.priceRange.split(' ')[1] || ''}</strong>
              </div>
              <div style="grid-column: span 2;">
                <span style="color: #64748b;">👤 सञ्चालक:</span>
                <strong style="color: #0f172a; margin-left: 3px;">${hotel.ownerName}</strong>
              </div>
            </div>

            ${hotel.specialty ? `
              <div style="font-size: 10.5px; color: #334155; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px;">
                🍲 <strong>विशेषता:</strong> ${hotel.specialty}
              </div>
            ` : ''}

            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
              ${hotel.amenities.slice(0, 4).map((a) => `
                <span style="font-size: 10px; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  ✓ ${a}
                </span>
              `).join('')}
            </div>

            <div style="display: flex; gap: 6px;">
              <a href="tel:${hotel.phone}" style="
                flex: 1;
                background: #16a34a;
                color: white;
                text-decoration: none;
                text-align: center;
                padding: 7px 8px;
                border-radius: 6px;
                font-size: 11.5px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
              ">
                <span>📞 सिधै कल</span>
              </a>
              <button class="trail-hotel-detail-btn" style="
                flex: 1.25;
                background: #7c3aed;
                color: white;
                border: none;
                padding: 7px 8px;
                border-radius: 6px;
                font-size: 11.5px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
              ">
                <span>🏨 बुकिङ / सोधपुछ</span>
              </button>
            </div>
          </div>
        </div>
      `;

      const detailBtn = popupContainer.querySelector('.trail-hotel-detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hMarker.closePopup();
          setModalHotel(hotel);
          setBookingSuccess(false);
        });
      }

      hMarker.bindPopup(popupContainer, { maxWidth: 330 });
      trekkingLayerRef.current?.addLayer(hMarker);
    });

    // 5. Draw the 5 Sacred Lakes of Panchpokhari with Distinct Colored Rings & Water Polygons
    SACRED_LAKES_DATA.forEach((lake) => {
      // a. Water Boundary Polygon
      const lakePoly = L.polygon(lake.polygon, {
        color: lake.color,
        weight: 2.5,
        opacity: 0.95,
        fillColor: lake.color,
        fillOpacity: 0.42,
      });

      // b. Distinct Colored Glowing Ring (विभिन्न कलर सहितको घेरा)
      const lakeCircle = L.circle(lake.center, {
        radius: lake.radiusMeters,
        color: lake.glowColor,
        weight: 3.5,
        dashArray: '6, 5',
        opacity: 0.95,
        fillColor: lake.color,
        fillOpacity: 0.15,
      });

      // c. Sacred Lake Badge Marker with Pulse Animation
      const lakeIcon = L.divIcon({
        className: 'custom-sacred-lake-badge',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: ${lake.color};
              opacity: 0.4;
              animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div class="sacred-lake-badge-inner" style="
              background: linear-gradient(135deg, ${lake.color} 0%, #0f172a 100%);
              border-color: ${lake.glowColor};
              box-shadow: 0 4px 14px ${lake.color}80;
            ">
              ${lake.iconEmoji}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const lakeMarker = L.marker(lake.center, { icon: lakeIcon });

      // Tooltip showing Lake Name, Number, and Elevation
      lakeMarker.bindTooltip(
        `<span style="display:inline-flex; align-items:center; gap:5px; border-left: 3px solid ${lake.color}; padding-left: 5px;">` +
          `<span>${lake.iconEmoji}</span>` +
          `<strong style="color:${lake.color}; font-size:12px;">${lake.number}. ${lake.name}</strong> ` +
          `<span style="opacity:0.8; font-size:10px; color:#94a3b8;">(${lake.altitudeMeters}m)</span>` +
        `</span>`,
        {
          permanent: true,
          direction: 'top',
          offset: [0, -18],
          className: 'sacred-lake-tooltip',
        }
      );

      // Detailed Spiritual Popup Card
      const lakePopupHtml = `
        <div style="width: 295px; border-radius: 12px; overflow: hidden; font-family: inherit;">
          <div style="background: linear-gradient(135deg, ${lake.color} 0%, #0f172a 100%); color: white; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; background: rgba(255,255,255,0.22); padding: 2px 8px; border-radius: 9999px;">
                ${lake.iconEmoji} कुण्ड नं. ${lake.number}
              </span>
              <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #0f172a; padding: 2px 8px; border-radius: 9999px;">
                ⛰️ ${lake.altitudeMeters} मिटर
              </span>
            </div>
            <h4 style="margin: 0; font-size: 15.5px; font-weight: 800; line-height: 1.3;">${lake.name}</h4>
            <div style="font-size: 11px; opacity: 0.88; margin-top: 2px;">${lake.nameEn}</div>
          </div>
          <div style="padding: 12px; background: #ffffff;">
            <div style="background: ${lake.color}15; border: 1px solid ${lake.color}35; border-radius: 8px; padding: 8px 10px; margin-bottom: 9px;">
              <div style="font-size: 11px; font-weight: 700; color: ${lake.color}; margin-bottom: 2px;">🙏 आराध्य देव / देवी:</div>
              <div style="font-size: 12.5px; font-weight: 800; color: #0f172a;">${lake.deity}</div>
            </div>
            <p style="margin: 0 0 10px; font-size: 12px; color: #334155; line-height: 1.45;">
              ${lake.significance}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 7px;">
              <span>घेरा व्यास: ~${lake.radiusMeters * 2} मिटर</span>
              <span style="font-family: monospace; font-weight: 700; color: ${lake.color};">📍 ${lake.center[0].toFixed(4)}°N, ${lake.center[1].toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      `;

      lakePoly.bindPopup(lakePopupHtml, { maxWidth: 310 });
      lakeCircle.bindPopup(lakePopupHtml, { maxWidth: 310 });
      lakeMarker.bindPopup(lakePopupHtml, { maxWidth: 310 });

      trekkingLayerRef.current?.addLayer(lakePoly);
      trekkingLayerRef.current?.addLayer(lakeCircle);
      trekkingLayerRef.current?.addLayer(lakeMarker);
    });

    // 6. Draw Ama Yangri Peak Route (Tarkeghyang -> Jhankri Danda -> Ama Yangri Summit: 3.86 km)
    // Motorable Road (Kathmandu -> Melamchi -> Tipeni -> Tarkeghyang: 87.0 km)
    if (routeMode === 'full') {
      const ayRoadOuter = L.polyline(KATHMANDU_TO_TARKEGHYANG_ROAD_COORDINATES, {
        color: '#312e81',
        weight: 6,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      });
      const ayRoadInner = L.polyline(KATHMANDU_TO_TARKEGHYANG_ROAD_COORDINATES, {
        color: '#c084fc',
        weight: 3,
        opacity: 0.9,
        dashArray: '6, 5',
        lineCap: 'round',
        lineJoin: 'round',
      });
      ayRoadOuter.bindTooltip(
        '🚙 <strong>काठमाडौँ ➔ तार्केघ्याङ सडक खण्ड (Ama Yangri Drive)</strong><br><small>चाबहिल ➔ साँखु ➔ मेलम्ची ➔ तिपेनी ➔ तार्केघ्याङ • ८७.० कि.मी.</small>',
        { sticky: true, className: 'trail-waypoint-tooltip' }
      );
      trekkingLayerRef.current.addLayer(ayRoadOuter);
      trekkingLayerRef.current.addLayer(ayRoadInner);
    }

    // Exact Alpine Trail (Tarkeghyang 2,600m -> Ama Yangri Summit 3,771m: 3.86 km)
    const ayTrailOuter = L.polyline(AMA_YANGRI_TRAIL_COORDINATES, {
      color: '#4c1d95',
      weight: 8,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    });
    const ayTrailInner = L.polyline(AMA_YANGRI_TRAIL_COORDINATES, {
      color: '#a855f7',
      weight: 4,
      opacity: 0.95,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round',
    });
    ayTrailOuter.bindTooltip(
      '🥾 <strong>आमायाङ्ग्री पिक तथा ह्योल्मो सांस्कृतिक पदमार्ग</strong><br><small>तार्केघ्याङ (२,६०० मी.) ➔ झाँक्री डाँडा ➔ आमायाङ्ग्री चुचुरो (३,७७१ मी.) • ३.८६ कि.मी.</small>',
      { sticky: true, className: 'trail-waypoint-tooltip' }
    );
    trekkingLayerRef.current.addLayer(ayTrailOuter);
    trekkingLayerRef.current.addLayer(ayTrailInner);

    // Ama Yangri Waypoints
    AMA_YANGRI_WAYPOINTS.forEach((wp) => {
      const isSummit = wp.type === 'summit';
      const wpIcon = L.divIcon({
        className: isSummit ? 'custom-sacred-lake-badge' : 'custom-trail-waypoint-pin',
        html: isSummit ? `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #7c3aed; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid #ffffff; box-shadow: 0 0 14px rgba(124, 58, 237, 0.7); font-weight: 900;">
              🚩
            </div>
          </div>
        ` : `
          <div class="trail-waypoint-pin-inner" style="background: ${wp.color}; font-size: 13px;">
            ${wp.iconEmoji}
          </div>
        `,
        iconSize: isSummit ? [44, 44] : [30, 30],
        iconAnchor: isSummit ? [22, 22] : [15, 15],
      });

      const wpMarker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
      wpMarker.bindTooltip(
        `<span style="display:inline-flex; align-items:center; gap:4px;"><span>${wp.iconEmoji}</span><strong>${wp.name}</strong> <span style="opacity:0.85; font-size:10px;">(${wp.altitudeMeters}m)</span></span>`,
        { permanent: true, direction: 'top', offset: [0, isSummit ? -16 : -12], className: 'trail-waypoint-tooltip' }
      );

      wpMarker.bindPopup(`
        <div style="font-family: inherit; width: 280px; padding: 0;">
          <div style="background: linear-gradient(135deg, ${wp.color} 0%, #0f172a 100%); color: white; padding: 10px 14px; border-radius: 12px 12px 0 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,0.25); padding: 2px 7px; border-radius: 9999px;">
                ${wp.iconEmoji} ${wp.type.toUpperCase()}
              </span>
              <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #0f172a; padding: 2px 8px; border-radius: 9999px;">
                ⛰️ ${wp.altitudeMeters} मिटर
              </span>
            </div>
            <h4 style="margin: 0; font-size: 14.5px; font-weight: 800; line-height: 1.3;">${wp.name}</h4>
            <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">${wp.nameEn}</div>
          </div>
          <div style="padding: 12px; background: #ffffff;">
            <p style="margin: 0 0 10px; font-size: 12px; color: #334155; line-height: 1.45;">
              ${wp.description}
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✨ मुख्य विशेषताहरू:</div>
              <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: #1e293b; display: flex; flex-direction: column; gap: 3px;">
                ${wp.highlights.map((h) => `<li>${h}</li>`).join('')}
              </ul>
            </div>
            <div style="font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
              <span>📍 GPS: ${wp.lat.toFixed(4)}° N, ${wp.lng.toFixed(4)}° E</span>
              <span style="font-size: 10.5px; color: #7c3aed; font-weight: 700;">आमायाङ्ग्री रुट</span>
            </div>
          </div>
        </div>
      `, { maxWidth: 300 });

      trekkingLayerRef.current?.addLayer(wpMarker);
    });

    // Ama Yangri Hotels & Homestays
    AMA_YANGRI_HOTELS.forEach((hotel) => {
      const hIcon = L.divIcon({
        className: 'custom-trail-hotel-pin',
        html: `
          <div class="trail-hotel-pin-inner" style="background: #7c3aed;">
            🏨
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const hMarker = L.marker([hotel.lat, hotel.lng], {
        icon: hIcon,
        title: `${hotel.name} (${hotel.typeNepali})`,
      });

      hMarker.bindTooltip(
        `<span style="display:inline-flex; align-items:center; gap:4px;"><span>🏨</span><strong>${hotel.name}</strong> <span style="opacity:0.85; font-size:10px;">(${hotel.bedCapacity} बेड)</span></span>`,
        { permanent: false, direction: 'top', offset: [0, -12], className: 'trail-waypoint-tooltip' }
      );

      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = `
        <div style="font-family: inherit; width: 300px; padding: 0;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%); color: white; padding: 10px 14px; border-radius: 12px 12px 0 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,0.25); padding: 2px 7px; border-radius: 9999px;">
                ${hotel.typeNepali}
              </span>
              <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #0f172a; padding: 2px 8px; border-radius: 9999px;">
                ⛰️ ${hotel.altitudeMeters} मिटर
              </span>
            </div>
            <h4 style="margin: 0; font-size: 14.5px; font-weight: 800; line-height: 1.3;">${hotel.name}</h4>
            <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">📍 ${hotel.locationName}</div>
          </div>
          <div style="padding: 12px; background: #ffffff;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #334155; line-height: 1.4;">${hotel.description}</p>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; font-size: 11px;">
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">🛏️ ${hotel.bedCapacity} बेड</span>
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">💰 ${hotel.priceRange}</span>
              ${hotel.isOxygenAvailable ? '<span style="background: #dbeafe; color: #1e40af; font-weight: 700; padding: 2px 6px; border-radius: 4px;">🫁 अक्सिजन उपलब्ध</span>' : ''}
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${hotel.phone}" style="flex: 1; background: #16a34a; color: white; text-decoration: none; padding: 7px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>📞 कल: ${hotel.phone}</span>
              </a>
            </div>
          </div>
        </div>
      `;

      hMarker.bindPopup(popupContainer, { maxWidth: 320 });
      trekkingLayerRef.current?.addLayer(hMarker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, isTrailActive, routeMode]);

  // Zoom to entire Kathmandu -> Panchpokhari corridor (103.5 km)
  const handleFocusFullJourney = () => {
    if (!mapInstanceRef.current) return;
    setRouteMode('full');
    setIsTrailActive(true);
    const bounds = L.latLngBounds(
      [27.6900, 85.3200], // southwest: Kathmandu
      [28.0500, 85.7300]  // northeast: Panchpokhari
    );
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  };

  // Center & Zoom directly onto Panchpokhari Trekking Route (Tuppi Danda / Deurali hotspot)
  const handleFocusTrail = () => {
    if (!mapInstanceRef.current) return;
    setIsTrailActive(true);
    mapInstanceRef.current.setView([27.9920, 85.6880], 14);
  };

  // Center & Zoom directly onto the 5 Sacred Lakes of Panchpokhari (4,100m)
  const handleFocusLakes = () => {
    if (!mapInstanceRef.current) return;
    setIsTrailActive(true);
    mapInstanceRef.current.flyTo([28.0416, 85.7160], 16, { duration: 1.2 });
  };

  // Center & Zoom directly onto Ama Yangri Peak Summit (3,771m)
  const handleFocusAmaYangri = () => {
    if (!mapInstanceRef.current) return;
    setIsTrailActive(true);
    mapInstanceRef.current.flyTo([28.01425, 85.56929], 15, { duration: 1.2 });
  };

  // Handle flyTo when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
      duration: 1.2,
    });
  }, [selectedLocation]);

  // Handle Buffer Polygon updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (bufferLayerRef.current) {
      mapInstanceRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }

    if (bufferData?.geojson) {
      const layer = L.geoJSON(bufferData.geojson, {
        style: {
          color: '#0284c7',
          weight: 2,
          dashArray: '5, 5',
          fillColor: '#38bdf8',
          fillOpacity: 0.25,
        },
      });

      layer.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #0284c7;">Shapely Geodesic Buffer</strong>
          <div style="font-size: 12px; margin-top: 2px;">बफर दूरी: <strong>${bufferData.buffer_radius_meters} मिटर</strong></div>
          <div style="font-size: 11px; color: #64748b;">FastAPI माइक्रोसर्भिस मार्फत गणना गरिएको</div>
        </div>
      `);

      layer.addTo(mapInstanceRef.current);
      bufferLayerRef.current = layer;

      // Fit map bounds to buffer polygon
      mapInstanceRef.current.fitBounds(layer.getBounds(), { padding: [30, 30] });
    }
  }, [bufferData]);

  // Revert moved marker
  const handleRevertMove = () => {
    if (!pendingMove) return;
    const marker = facilityMarkersMapRef.current.get(pendingMove.id);
    if (marker) {
      marker.setLatLng([pendingMove.oldLat, pendingMove.oldLng]);
      movedCoordsRef.current.delete(pendingMove.id);
      onSelectLocation?.(pendingMove.oldLat, pendingMove.oldLng, pendingMove.name);
    }
    setPendingMove(null);
  };

  // Confirm save moved marker
  const handleSaveMove = () => {
    if (!pendingMove) return;
    setIsSavingMove(true);
    onUpdateLocation?.(pendingMove.id, pendingMove.newLat, pendingMove.newLng);
    setPendingMove(null);
    setTimeout(() => setIsSavingMove(false), 500);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          zIndex: 1,
        }}
      />

      {/* Floating Panchpokhari Journey Route & Hotels Control Bar */}
      <div
        className="trail-floating-control-bar"
        style={{
          position: 'absolute',
          top: height === '100vh' ? '74px' : '14px',
          left: '52px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '30px',
          padding: '4px 12px',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
          maxWidth: 'calc(100% - 110px)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🗺️</span>
          <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}>
            काठमाडौँ ➔ पाँचपोखरी रुट
          </span>
          <span
            style={{
              background: '#38bdf8',
              color: '#082f49',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '10px',
            }}
          >
            १०३.५ कि.मी.
          </span>
        </div>

        <button
          onClick={handleFocusFullJourney}
          style={{
            background: routeMode === 'full' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
            boxShadow: routeMode === 'full' ? '0 2px 8px rgba(2, 132, 199, 0.5)' : 'none',
          }}
          title="काठमाडौँ देखि पाँचपोखरी सम्मको पूर्ण रुट (१०३.५ कि.मी.)"
        >
          <span>🚗 पूर्ण रुट (KTM ➔ पाँचपोखरी)</span>
        </button>

        <button
          onClick={handleFocusTrail}
          style={{
            background: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.4)',
          }}
          title="पाँचपोखरी पदमार्ग खण्डमा जुम गर्नुहोस् (२८ कि.मी.)"
        >
          <Compass size={12} />
          <span>🥾 पदमार्ग खण्ड (Zoom)</span>
        </button>

        <button
          onClick={handleFocusLakes}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 11px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.45)',
          }}
          title="पाँचवटै पवित्र कुण्डहरू (भैरव, सरस्वती, सूर्य, गणेश, नाग/तारा) मा जुम गर्नुहोस्"
        >
          <Sparkles size={12} />
          <span>✨ ५ पवित्र कुण्डहरू (Lakes)</span>
        </button>

        <button
          onClick={handleFocusAmaYangri}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 11px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.45)',
          }}
          title="आमायाङ्ग्री पिक चुचुरो (३,७७१ मिटर) मा जुम गर्नुहोस्"
        >
          <span>🚩 आमायाङ्ग्री पिक (3,771m)</span>
        </button>

        <button
          onClick={() => setIsTrailActive((prev) => !prev)}
          style={{
            background: isTrailActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            color: isTrailActive ? '#34d399' : '#f87171',
            border: `1px solid ${isTrailActive ? '#10b981' : '#ef4444'}`,
            borderRadius: '20px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title={isTrailActive ? 'रुट लेयर लुकाउनुहोस्' : 'रुट लेयर देखाउनुहोस्'}
        >
          {isTrailActive ? '✓ सक्रिय' : '✗ बन्द'}
        </button>
      </div>

      {/* Floating Action Banner when a pin is dragged to a new GPS location */}
      {pendingMove && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            padding: '10px 16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '92%',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{pendingMove.iconEmoji}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{pendingMove.name}</span>
                <span style={{ fontSize: '11px', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>
                  नयाँ स्थानमा सारियो
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', fontFamily: 'monospace', marginTop: '2px' }}>
                GPS अक्षांश: <strong>{pendingMove.newLat.toFixed(5)}° N</strong> | देशान्तर: <strong>{pendingMove.newLng.toFixed(5)}° E</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <button
              onClick={handleSaveMove}
              disabled={isSavingMove}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span>{isSavingMove ? 'सुरक्षित हुँदैछ...' : '💾 नयाँ स्थान सुरक्षित गर्नुहोस्'}</span>
            </button>

            <button
              onClick={() => {
                onSelectLocation?.(pendingMove.newLat, pendingMove.newLng, pendingMove.name);
              }}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 12px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              🎯 बफर विश्लेषण
            </button>

            <button
              onClick={handleRevertMove}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 10px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ↺ पहिलेकै ठाउँमा फर्काउनुहोस्
            </button>
          </div>
        </div>
      )}

      {/* Hotel Detail & Online Booking Modal */}
      {modalHotel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setModalHotel(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1.5px solid #c084fc',
              position: 'relative',
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div
              style={{
                height: '180px',
                backgroundImage: `url('${modalHotel.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: '14px 14px 0 0',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
                }}
              />
              <button
                onClick={() => setModalHotel(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                <span style={{ background: '#7c3aed', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                  🏨 {modalHotel.typeNepali}
                </span>
                {modalHotel.isOxygenAvailable && (
                  <span style={{ background: '#10b981', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    🫁 अक्सिजन उपलब्ध
                  </span>
                )}
              </div>

              <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', color: '#ffffff' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{modalHotel.name}</h3>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '2px', display: 'flex', gap: '10px' }}>
                  <span>📍 {modalHotel.locationName}</span>
                  <span>⛰️ उचाइ: <strong>{modalHotel.altitudeMeters} मिटर</strong></span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '18px 20px' }}>
              {/* Hotel Quick Specs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>👤 सञ्चालक:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{modalHotel.ownerName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>🛏️ कोठा क्षमता:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {modalHotel.totalRooms} कोठा ({modalHotel.bedCapacity} बेड)
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>💰 प्रति रात मूल्य:</span>
                  <div style={{ fontWeight: 700, color: '#16a34a' }}>{modalHotel.priceRange}</div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                {modalHotel.description}
              </p>

              {/* Specialty */}
              {modalHotel.specialty && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    color: '#166534',
                    marginBottom: '14px',
                  }}
                >
                  🍲 <strong>विशेषता:</strong> {modalHotel.specialty}
                </div>
              )}

              {/* Amenities */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                  उपलब्ध सुविधाहरू:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {modalHotel.amenities.map((a, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#1e293b',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Call & Booking Section */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                {bookingSuccess ? (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      color: '#065f46',
                    }}
                  >
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 6px' }} />
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>
                      बुकिङ सोधपुछ सफलतापूर्वक दर्ता भयो !
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      होटल सञ्चालक <strong>{modalHotel.ownerName}</strong> लाई जानकारी पठाइएको छ। केही बेरमा तपाईंलाई फोन <strong>{bookingForm.phone || modalHotel.phone}</strong> मा सम्पर्क हुनेछ।
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                      📞 आपतकालीन सोधपुछ: <a href={`tel:${modalHotel.phone}`} style={{ color: '#0284c7' }}>{modalHotel.phone}</a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <a
                        href={`tel:${modalHotel.phone}`}
                        style={{
                          flex: 1,
                          background: '#16a34a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
                        }}
                      >
                        <Phone size={16} />
                        <span>सिधै फोन गर्नुहोस् ({modalHotel.phone})</span>
                      </a>
                    </div>

                    {/* Booking Form */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        📅 अनलाइन कोठा सोधपुछ / बुकिङ फाराम
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>तपाईंको नाम</label>
                          <input
                            type="text"
                            placeholder="राम श्रेष्ठ"
                            value={bookingForm.guestName}
                            onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '2px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>सम्पर्क मोबाइल</label>
                          <input
                            type="text"
                            placeholder="९८xxxxxxxx"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '2px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>आगमन मिति</label>
                          <input
                            type="date"
                            value={bookingForm.checkInDate}
                            onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '2px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>पाहुना संख्या</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={bookingForm.guests}
                            onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '2px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBookingSuccess(true);
                        }}
                        style={{
                          width: '100%',
                          background: '#7c3aed',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        ✉️ बुकिङ सोधपुछ पठाउनुहोस्
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PalikaMap;
