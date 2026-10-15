import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  TreePine,
  Home,
  Building2,
  Store,
  Factory,
  Landmark,
  Pickaxe,
  Waves,
  FileText,
  ChevronRight,
  X,
  Compass,
  Download,
  Table as TableIcon,
  Sparkles,
  Database,
  Grid,
  Sliders,
  Eye,
  EyeOff,
  Printer,
  ExternalLink,
  Crosshair,
  Map as MapIcon,
  Check,
} from 'lucide-react';
import {
  landClassificationApi,
  type LandClassificationSummary,
  type ZoneSummary,
  type GdbInfo,
  type CadastreSummary,
} from '../../api/landClassification';

const WARD_LABELS: Record<number, string> = {
  1: 'वडा नं. १ (बाँसखर्क)',
  2: 'वडा नं. २ (बरुवा)',
  3: 'वडा नं. ३ (भोताङ)',
  4: 'वडा नं. ४ (थाङपालकोट)',
  5: 'वडा नं. ५ (गुन्सा)',
  6: 'वडा नं. ६ (थाङपालधाप)',
  7: 'वडा नं. ७ (तिपेनी)',
  8: 'वडा नं. ८ (लागर्चे)',
  99: 'लाङटाङ राष्ट्रिय निकुञ्ज क्षेत्र',
};

const ZONE_ICONS: Record<string, any> = {
  FOR: TreePine,
  PUB: Building2,
  AGR: Sparkles,
  HYD: Waves,
  RES: Home,
  COM: Store,
  CULARCH: Landmark,
  MIN: Pickaxe,
  IND: Factory,
};

export const LandClassificationPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const landLayersRef = useRef<L.GeoJSON | null>(null);
  const cadastreLayerRef = useRef<L.GeoJSON | null>(null);
  const highlightParcelLayerRef = useRef<L.GeoJSON | null>(null);

  // Core Data State
  const [summary, setSummary] = useState<LandClassificationSummary | null>(null);
  const [cadastreSummary, setCadastreSummary] = useState<CadastreSummary | null>(null);
  const [gdbInfo, setGdbInfo] = useState<GdbInfo | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [baseMap, setBaseMap] = useState<'satellite' | 'topo' | 'osm'>('satellite');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'map' | 'rules' | 'wards'>('map');
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);

  // 4 Core GIS Workflows State
  const [isFullscreenGis, setIsFullscreenGis] = useState<boolean>(false);
  const [isGdbModalOpen, setIsGdbModalOpen] = useState<boolean>(false);
  const [isCadastreLayerActive, setIsCadastreLayerActive] = useState<boolean>(true);
  const [isLanduse87Active, setIsLanduse87Active] = useState<boolean>(true);
  const [landuseOpacity, setLanduseOpacity] = useState<number>(0.6);

  // Cadastre Search State
  const [searchParcelNo, setSearchParcelNo] = useState<string>('');
  const [searchParcelWard, setSearchParcelWard] = useState<number | 'all'>('all');
  const [searchingParcel, setSearchingParcel] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  const [wardGeojson, setWardGeojson] = useState<any | null>(null);
  const [landGeojson, setLandGeojson] = useState<any | null>(null);

  // 1. Fetch Summary, Wards & GDB info
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        setLoading(true);
        const [sumData, wardData, gdbData, cadData] = await Promise.allSettled([
          landClassificationApi.getSummary(),
          landClassificationApi.getWardBoundariesGeoJSON(),
          landClassificationApi.getGdbInfo(),
          landClassificationApi.getCadastreSummary(),
        ]);

        if (isMounted) {
          if (sumData.status === 'fulfilled') setSummary(sumData.value);
          if (wardData.status === 'fulfilled') setWardGeojson(wardData.value);
          if (gdbData.status === 'fulfilled') setGdbInfo(gdbData.value);
          if (cadData.status === 'fulfilled') setCadastreSummary(cadData.value);
        }
      } catch (err) {
        console.error('Error fetching land classification data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Land Classification Polygons (MUTM 87)
  useEffect(() => {
    let isMounted = true;
    async function loadLandGeojson() {
      try {
        const data = await landClassificationApi.getLandClassificationGeoJSON({
          ward: selectedWard === 'all' ? undefined : selectedWard,
          zone: selectedZone === 'ALL' ? undefined : selectedZone,
          limit: 4000,
        });
        if (isMounted) {
          setLandGeojson(data);
        }
      } catch (err) {
        console.error('Failed to load land geojson:', err);
      }
    }
    loadLandGeojson();
    return () => {
      isMounted = false;
    };
  }, [selectedWard, selectedZone]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [27.9736, 85.6425],
      zoom: 12,
      minZoom: 10,
      maxZoom: 22,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Mouse coordinates tracking
    map.on('mousemove', (e) => {
      setCursorCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Update Tile Layer on BaseMap Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (baseMap === 'satellite') {
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxNativeZoom: 20,
        maxZoom: 22,
        attribution: '&copy; Google Satellite Hybrid | Municipal Digital Twins',
      }).addTo(map);
    } else if (baseMap === 'topo') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 20,
        attribution: '&copy; Esri World Topo Map',
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    }
  }, [baseMap]);

  // 5. Render Ward Boundaries Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !wardGeojson) return;

    if (wardsLayerRef.current) {
      map.removeLayer(wardsLayerRef.current);
    }

    const layer = L.geoJSON(wardGeojson, {
      style: (feature) => {
        const isCurrent = selectedWard !== 'all' && feature?.properties?.ward_no === selectedWard;
        return {
          color: isCurrent ? '#f59e0b' : '#38bdf8',
          weight: isCurrent ? 3.5 : 2,
          dashArray: '5, 5',
          fillColor: '#38bdf8',
          fillOpacity: isCurrent ? 0.08 : 0.02,
        };
      },
      onEachFeature: (feature, l) => {
        const p = feature.properties;
        l.bindTooltip(
          `<div style="font-weight:700;font-size:12px;color:#0f172a;">वडा नं. ${p.ward_no} (${p.ward_name || ''})</div>`,
          { permanent: false, direction: 'center', className: 'ward-tooltip' }
        );
      },
    });

    layer.addTo(map);
    wardsLayerRef.current = layer;
  }, [wardGeojson, selectedWard]);

  // 6. Render Land Classification Layer (Land Use 87)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (landLayersRef.current) {
      map.removeLayer(landLayersRef.current);
    }

    if (!isLanduse87Active || !landGeojson || !landGeojson.features) return;

    const layer = L.geoJSON(landGeojson, {
      style: (feature) => {
        const p = feature?.properties || {};
        const isSelected = selectedFeature?.properties?.id === p.id;
        return {
          color: isSelected ? '#ffffff' : (p.color || '#10b981'),
          weight: isSelected ? 3 : 1.2,
          fillColor: p.color || '#10b981',
          fillOpacity: isSelected ? Math.min(landuseOpacity + 0.3, 0.95) : landuseOpacity,
        };
      },
      onEachFeature: (feature, l) => {
        const p = feature.properties || {};
        l.bindTooltip(
          `<strong>${p.zone_name_np}</strong> (वडा ${p.ward_no})<br/><span style="font-size:11px;">${p.area_ropani || ''}</span>`,
          { sticky: true, opacity: 0.95 }
        );

        l.on({
          click: () => {
            setSelectedFeature(feature);
            setSelectedParcel(null);
            if (l instanceof L.Path) {
              l.bringToFront();
            }
          },
          mouseover: () => {
            if (l instanceof L.Path && selectedFeature?.properties?.id !== p.id) {
              l.setStyle({ weight: 2.5, fillOpacity: Math.min(landuseOpacity + 0.2, 0.95) });
            }
          },
          mouseout: () => {
            if (l instanceof L.Path && selectedFeature?.properties?.id !== p.id) {
              l.setStyle({ weight: 1.2, fillOpacity: landuseOpacity });
            }
          },
        });
      },
    });

    layer.addTo(map);
    landLayersRef.current = layer;

    // Zoom to features if filtered
    if (selectedWard !== 'all' && layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 16 });
    }
  }, [landGeojson, selectedFeature, selectedWard, isLanduse87Active, landuseOpacity]);

  // 7. Dynamic Viewport Cadastre Parcels (when zoomed in)
  const fetchViewportCadastre = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map || !isCadastreLayerActive) return;

    const zoom = map.getZoom();
    if (zoom < 14) {
      if (cadastreLayerRef.current) {
        map.removeLayer(cadastreLayerRef.current);
        cadastreLayerRef.current = null;
      }
      return;
    }

    try {
      const b = map.getBounds();
      const cadData = await landClassificationApi.getCadastreInBBox({
        minLat: b.getSouth(),
        minLng: b.getWest(),
        maxLat: b.getNorth(),
        maxLng: b.getEast(),
        limit: 250,
      });

      if (cadastreLayerRef.current) {
        map.removeLayer(cadastreLayerRef.current);
      }

      if (!cadData || !cadData.features || cadData.features.length === 0) return;

      const layer = L.geoJSON(cadData, {
        style: {
          color: '#38bdf8',
          weight: 1.2,
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          dashArray: '3, 2',
        },
        onEachFeature: (f, l) => {
          const p = f.properties || {};
          l.bindTooltip(`<strong>कित्ता नं. ${p.parcel_no}</strong> (वडा ${p.ward_no})<br/>${p.area_ropani || ''}`, {
            sticky: true,
          });
          l.on('click', () => {
            handleSelectCadastreFeature(f);
          });
        },
      });

      layer.addTo(map);
      cadastreLayerRef.current = layer;
    } catch (err) {
      console.error('Error fetching viewport cadastre:', err);
    }
  }, [isCadastreLayerActive]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isCadastreLayerActive) {
      if (cadastreLayerRef.current) {
        map.removeLayer(cadastreLayerRef.current);
        cadastreLayerRef.current = null;
      }
      return;
    }

    fetchViewportCadastre();
    map.on('moveend', fetchViewportCadastre);
    return () => {
      map.off('moveend', fetchViewportCadastre);
    };
  }, [isCadastreLayerActive, fetchViewportCadastre]);

  // Parcel Feature Selection Handler
  const handleSelectCadastreFeature = (feature: any) => {
    setSelectedParcel(feature);
    setSelectedFeature(null);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (highlightParcelLayerRef.current) {
      map.removeLayer(highlightParcelLayerRef.current);
    }

    const hlLayer = L.geoJSON(feature, {
      style: {
        color: '#f43f5e',
        weight: 3.5,
        fillColor: '#f43f5e',
        fillOpacity: 0.35,
      },
    }).addTo(map);
    highlightParcelLayerRef.current = hlLayer;
  };

  // Cadastre Search Handler
  const handleSearchParcel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchParcelNo.trim()) return;

    setSearchingParcel(true);
    try {
      const res = await landClassificationApi.searchCadastreParcels(
        searchParcelNo.trim(),
        searchParcelWard === 'all' ? undefined : searchParcelWard
      );

      if (res && res.features && res.features.length > 0) {
        const feature = res.features[0];
        handleSelectCadastreFeature(feature);

        const map = mapInstanceRef.current;
        if (map && highlightParcelLayerRef.current) {
          map.fitBounds(highlightParcelLayerRef.current.getBounds(), {
            maxZoom: 18,
            padding: [80, 80],
          });
        }
      } else {
        alert(`कित्ता नं. "${searchParcelNo}" फेला परेन। कृपया वडा वा कित्ता नम्बर सही छ कि छैन जाँच गर्नुहोस्।`);
      }
    } catch (err) {
      console.error('Error searching parcel:', err);
    } finally {
      setSearchingParcel(false);
    }
  };

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([27.9736, 85.6425], 12);
    }
    setSelectedWard('all');
    setSelectedZone('ALL');
    setSelectedFeature(null);
    setSelectedParcel(null);
    if (highlightParcelLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(highlightParcelLayerRef.current);
      highlightParcelLayerRef.current = null;
    }
  };

  const zonesList = useMemo(() => summary?.zones || [], [summary]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreenGis ? '100vh' : '100%',
        minHeight: isFullscreenGis ? '100vh' : 'calc(100vh - 64px)',
        background: '#0b1329',
        color: '#f8fafc',
        position: isFullscreenGis ? 'fixed' : 'relative',
        inset: isFullscreenGis ? 0 : 'auto',
        zIndex: isFullscreenGis ? 99999 : 'auto',
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}
          >
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                जग्गा वर्गीकरण तथा डिजिटल भू-उपयोग नक्सा (Land Classification Twin)
              </h1>
              <span
                style={{
                  background: 'rgba(56,189,248,0.15)',
                  border: '1px solid rgba(56,189,248,0.35)',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}
              >
                MUTM 87 Active
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              पाँचपोखरी थाङपाल गाउँपालिका — भू-उपयोग ऐन २०७६ र नापी विभाग मापदण्ड अनुसार आधिकारिक जग्गा तथा कित्ता नक्सा
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'map' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Compass size={14} /> डिजिटल नक्सा (GIS Map)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'rules' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={14} /> ऐन तथा कानुनी मापदण्ड (Rules)
          </button>
          <button
            onClick={() => setActiveTab('wards')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'wards' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <TableIcon size={14} /> वडागत तथ्याङ्क (Wards)
          </button>
        </div>
      </div>

      {/* ── 4-in-1 Quick GIS Workflow Bar (Requested Features) ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #090e1f 0%, #111a36 100%)',
          borderBottom: '1.5px solid rgba(56,189,248,0.2)',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            GIS कार्यप्रवाह:
          </span>

          {/* 1. Open GIS */}
          <button
            onClick={() => setIsFullscreenGis(!isFullscreenGis)}
            style={{
              background: isFullscreenGis ? '#22c55e' : 'rgba(59,130,246,0.18)',
              border: `1.5px solid ${isFullscreenGis ? '#4ade80' : '#3b82f6'}`,
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: isFullscreenGis ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isFullscreenGis ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreenGis ? 'नक्सा सानो बनाउनुहोस्' : 'Open GIS (पूर्ण स्क्रिन)'}</span>
          </button>

          {/* 2. Add Geodatabase */}
          <button
            onClick={() => setIsGdbModalOpen(true)}
            style={{
              background: 'rgba(147,51,234,0.18)',
              border: '1.5px solid #a855f7',
              color: '#f3e8ff',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Database size={15} color="#c084fc" />
            <span>Add Geodatabase</span>
            <span
              style={{
                background: '#9333ea',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '8px',
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              MUTM 87.gdb
            </span>
          </button>

          {/* 3. Add Cadastre Data */}
          <button
            onClick={() => setIsCadastreLayerActive(!isCadastreLayerActive)}
            style={{
              background: isCadastreLayerActive ? 'rgba(14,165,233,0.22)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${isCadastreLayerActive ? '#38bdf8' : 'rgba(255,255,255,0.15)'}`,
              color: isCadastreLayerActive ? '#38bdf8' : '#94a3b8',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Grid size={15} />
            <span>Cadastre Data (नापी कित्ता)</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isCadastreLayerActive ? '#38bdf8' : '#64748b',
              }}
            />
          </button>

          {/* 4. Add Land Use 87 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isLanduse87Active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${isLanduse87Active ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px',
              padding: '0.25rem 0.75rem',
            }}
          >
            <button
              onClick={() => setIsLanduse87Active(!isLanduse87Active)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isLanduse87Active ? '#4ade80' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
              }}
            >
              <Layers size={15} />
              <span>Land Use 87</span>
              {isLanduse87Active ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>

            {/* Opacity Slider */}
            {isLanduse87Active && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.25rem', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>पारदर्शिता:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={landuseOpacity}
                  onChange={(e) => setLanduseOpacity(parseFloat(e.target.value))}
                  style={{ width: '60px', cursor: 'pointer', accentColor: '#10b981' }}
                  title="Land use layer opacity"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cadastre Parcel Quick Search Bar */}
        <form onSubmit={handleSearchParcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={searchParcelWard}
            onChange={(e) => setSearchParcelWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all">सबै वडा</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={w}>वडा {w}</option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="कित्ता नम्बर हान्नुहोस् (उदा. ६९८)..."
              value={searchParcelNo}
              onChange={(e) => setSearchParcelNo(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid rgba(56,189,248,0.4)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                width: '180px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={searchingParcel || !searchParcelNo.trim()}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.38rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              opacity: !searchParcelNo.trim() ? 0.6 : 1,
            }}
          >
            {searchingParcel ? <RefreshCw size={13} className="spin" /> : <Search size={13} />}
            <span>कित्ता खोज्नुहोस्</span>
          </button>
        </form>
      </div>

      {/* ── KPI Summary Cards ── */}
      {!isFullscreenGis && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.65rem',
            padding: '0.75rem 1.5rem',
            background: '#090e1f',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>कुल जग्गा वर्गीकरण</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.15rem' }}>
              {summary ? summary.total_area_ha.toLocaleString() : '४३,६३४.८'} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>हेक्टर</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600, marginTop: '0.1rem' }}>
              {summary?.total_area_ropani || '८,५७,७३७ रोपनी'}
            </div>
          </div>

          <div style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.25)', borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>नापी कित्ता संख्या (Cadastre)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.15rem' }}>
              {cadastreSummary?.total_parcels ? cadastreSummary.total_parcels.toLocaleString() : '५३,१८०'} <span style={{ fontSize: '0.72rem', color: '#7dd3fc' }}>कित्ता</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 600, marginTop: '0.1rem' }}>
              {cadastreSummary?.total_area_ropani || '२,९२,९९८ रोपनी'}
            </div>
          </div>

          <div style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.25)', borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: 700 }}>वन क्षेत्र (Forest)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80', marginTop: '0.15rem' }}>
              ५१.५९% <span style={{ fontSize: '0.72rem', color: '#86efac' }}>२२,५०९ Ha</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 600, marginTop: '0.1rem' }}>
              ४,४२,४७८ रोपनी (९०१ पोलिगन)
            </div>
          </div>

          <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#22c55e', textTransform: 'uppercase', fontWeight: 700 }}>कृषि क्षेत्र (Agricultural)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22c55e', marginTop: '0.15rem' }}>
              १५.५६% <span style={{ fontSize: '0.72rem', color: '#86efac' }}>६,७८८ Ha</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 600, marginTop: '0.1rem' }}>
              १,३३,४३८ रोपनी (३७६ पोलिगन)
            </div>
          </div>

          <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#eab308', textTransform: 'uppercase', fontWeight: 700 }}>आवासीय क्षेत्र (Residential)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#facc15', marginTop: '0.15rem' }}>
              ५९६.८ <span style={{ fontSize: '0.72rem', color: '#fde047' }}>हेक्टर</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 600, marginTop: '0.1rem' }}>
              ११,७३१ रोपनी (१,५७९ पोलिगन)
            </div>
          </div>
        </div>
      )}

      {/* ── Main Tab 1: GIS Map Area ── */}
      {activeTab === 'map' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Controls Strip */}
          <div
            style={{
              background: 'rgba(15,23,42,0.92)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '0.55rem 1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              zIndex: 10,
            }}
          >
            {/* Ward Selector & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>वडा छान्नुहोस्:</span>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{
                  background: '#1e293b',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">सबै वडाहरू (All Wards 1-8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>{WARD_LABELS[w]}</option>
                ))}
              </select>

              <button
                onClick={resetMapView}
                title="दृश्य रिसेट गर्नुहोस्"
                style={{
                  background: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={12} /> रिसेट
              </button>
            </div>

            {/* Coordinates and Zoom info badge */}
            {cursorCoords && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'monospace',
                }}
              >
                अक्षांश: <span style={{ color: '#38bdf8' }}>{cursorCoords.lat}°</span> | देशान्तर: <span style={{ color: '#38bdf8' }}>{cursorCoords.lng}°</span> | जुम: <span style={{ color: '#facc15' }}>{currentZoom}</span>
              </div>
            )}

            {/* Base Map Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', padding: '0 0.35rem', fontWeight: 700 }}>बेस म्याप:</span>
              {(['satellite', 'topo', 'osm'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBaseMap(b)}
                  style={{
                    background: baseMap === b ? '#3b82f6' : 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: baseMap === b ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {b === 'satellite' ? 'Google Hybrid' : b === 'topo' ? 'Topographic' : 'OSM Streets'}
                </button>
              ))}
            </div>
          </div>

          {/* Zone Chips Filter Strip */}
          <div
            style={{
              background: 'rgba(15,23,42,0.95)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '0.45rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              overflowX: 'auto',
              zIndex: 9,
            }}
          >
            <button
              onClick={() => setSelectedZone('ALL')}
              style={{
                background: selectedZone === 'ALL' ? '#ffffff' : 'rgba(255,255,255,0.06)',
                color: selectedZone === 'ALL' ? '#0f172a' : '#94a3b8',
                border: 'none',
                borderRadius: '20px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              सबै वर्ग (All Zones)
            </button>

            {zonesList.map((z) => {
              const isActive = selectedZone === z.zone_code;
              return (
                <button
                  key={z.zone_code}
                  onClick={() => setSelectedZone(isActive ? 'ALL' : z.zone_code)}
                  style={{
                    background: isActive ? z.color : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    border: `1.5px solid ${z.color}`,
                    borderRadius: '20px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? `0 2px 8px ${z.color}66` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: z.color, border: '1px solid #ffffff' }} />
                  {z.zone_name_np} ({z.percentage}%)
                </button>
              );
            })}
          </div>

          {/* Leaflet Map Canvas */}
          <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: isFullscreenGis ? 'calc(100vh - 120px)' : '540px' }}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%', minHeight: isFullscreenGis ? 'calc(100vh - 120px)' : '540px' }} />

            {/* Cadastre Zoom Helper Notification */}
            {isCadastreLayerActive && currentZoom < 14 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  background: 'rgba(15,23,42,0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.74rem',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <Grid size={14} />
                <span>कित्ता नापी नक्सा हेर्न नक्सालाई अझै <strong>जुम (Zoom In)</strong> गर्नुहोस् वा सिधै कित्ता नं. खोजी गर्नुहोस्।</span>
              </div>
            )}

            {/* Selected Parcel Detail Card (Right Drawer) */}
            {selectedParcel && (
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '370px',
                  maxHeight: 'calc(100% - 2rem)',
                  overflowY: 'auto',
                  background: 'rgba(15,23,42,0.96)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  border: '2px solid #f43f5e',
                  boxShadow: '0 20px 40px rgba(244,63,94,0.25), 0 10px 25px rgba(0,0,0,0.6)',
                  padding: '1.25rem',
                  zIndex: 1000,
                  color: '#f8fafc',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: selectedParcel.properties.zone_color || '#f43f5e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Grid size={20} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#f43f5e', textTransform: 'uppercase', fontWeight: 800 }}>नापी कित्ता विवरण (Cadastral Parcel)</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                        कित्ता नं. {selectedParcel.properties.parcel_no}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedParcel(null);
                      if (highlightParcelLayerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(highlightParcelLayerRef.current);
                        highlightParcelLayerRef.current = null;
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>वडा:</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{WARD_LABELS[selectedParcel.properties.ward_no] || `वडा नं. ${selectedParcel.properties.ward_no}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>ग्रिड सिट नं.:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{selectedParcel.properties.grid_sheet || 'MUTM-87-S1'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>क्षेत्रफल (रोपनीमा):</span>
                    <span style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.9rem' }}>{selectedParcel.properties.area_ropani || '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>क्षेत्रफल (वर्गमिटर):</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{selectedParcel.properties.area_sqm ? selectedParcel.properties.area_sqm.toLocaleString() : '—'} m²</span>
                  </div>

                  {/* Land Use 87 Classification Result */}
                  <div style={{ marginTop: '0.35rem', padding: '0.8rem', background: 'rgba(56,189,248,0.08)', border: '1.5px solid rgba(56,189,248,0.3)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedParcel.properties.zone_color || '#10b981' }} />
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>आधिकारिक भू-उपयोग वर्गीकरण (Land Use 87):</span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: selectedParcel.properties.zone_color || '#38bdf8' }}>
                      {selectedParcel.properties.zone_name_np || 'कृषि क्षेत्र'}
                    </div>
                  </div>

                  {/* Legal compliance */}
                  <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <CheckCircle2 size={14} /> भू-उपयोग ऐन, २०७६ अनुसार कानुनी मापदण्ड:
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      {selectedParcel.properties.rules_np || 'भू-उपयोग ऐन अनुसार तोकिएको प्रयोजन बाहेक अन्य कार्य गर्न पाइने छैन।'}
                    </div>
                  </div>

                  {/* Print Button */}
                  <button
                    onClick={() => window.print()}
                    style={{
                      marginTop: '0.5rem',
                      background: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <Printer size={15} /> कित्ता जग्गा वर्गीकरण विवरण प्रिन्ट गर्नुहोस्
                  </button>
                </div>
              </div>
            )}

            {/* General Land Classification Feature Inspect Card */}
            {selectedFeature && !selectedParcel && (
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '360px',
                  maxHeight: 'calc(100% - 2rem)',
                  overflowY: 'auto',
                  background: 'rgba(15,23,42,0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  padding: '1.25rem',
                  zIndex: 1000,
                  color: '#f8fafc',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: selectedFeature.properties.color || '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Layers size={18} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>जग्गा वर्गीकरण क्षेत्र (Land Use 87)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {selectedFeature.properties.zone_name_np}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFeature(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>वडा:</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{WARD_LABELS[selectedFeature.properties.ward_no] || `वडा नं. ${selectedFeature.properties.ward_no}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>क्षेत्रफल (रोपनीमा):</span>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>{selectedFeature.properties.area_ropani || '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>क्षेत्रफल (हेक्टर/वर्गमिटर):</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{selectedFeature.properties.area_hectare} Ha ({selectedFeature.properties.area_sqm?.toLocaleString()} m²)</span>
                  </div>

                  {selectedFeature.properties.remarks && (
                    <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                      <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>कैफियत / टिप्पणी:</span>
                      <span style={{ fontWeight: 600, color: '#facc15' }}>{selectedFeature.properties.remarks}</span>
                    </div>
                  )}

                  {/* Legal rules under Land Use Act 2076 */}
                  <div style={{ marginTop: '0.4rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <CheckCircle2 size={14} /> भू-उपयोग ऐन, २०७६ अनुसार कानुनी मापदण्ड:
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      {selectedFeature.properties.rules || 'भू-उपयोग ऐन अनुसार तोकिएको प्रयोजन बाहेक अन्य कार्य गर्न पाइने छैन।'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Land Use Rules & Catalog ── */}
      {activeTab === 'rules' && (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              भू-उपयोग ऐन, २०७६ अनुसार ९ वटै क्षेत्रका मापदण्ड तथा कानुनी व्यवस्था
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
              पाँचपोखरी थाङपाल गाउँपालिकाको जग्गा वर्गीकरण नक्सामा समेटिएका आधिकारिक ९ वटा क्षेत्रहरू र तिनका कानूनी सर्तहरू
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {zonesList.map((z) => {
              const Icon = ZONE_ICONS[z.zone_code] || Layers;
              return (
                <div
                  key={z.zone_code}
                  style={{
                    background: '#131d36',
                    border: `1.5px solid ${z.color}44`,
                    borderRadius: '16px',
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: z.color }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${z.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={z.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{z.zone_name_np}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{z.zone_name_en}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: z.color }}>{z.percentage}%</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{z.polygon_count} पोलिगन</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#94a3b8' }}>कुल क्षेत्रफल:</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{z.total_area_ha.toLocaleString()} Ha ({z.area_ropani_str})</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.75rem', borderRadius: '8px' }}>
                    <strong style={{ color: z.color, display: 'block', marginBottom: '0.2rem' }}>स्वीकृत उपयोग तथा कानुनी बन्देज:</strong>
                    {z.rules_np}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 3: Ward-Wise Distribution Table ── */}
      {activeTab === 'wards' && (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              वडागत जग्गा वर्गीकरण वितरण तालिका
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
              पाँचपोखरी थाङपाल गाउँपालिकाका ८ वटै वडा तथा राष्ट्रिय निकुञ्ज क्षेत्रको हेक्टर र रोपनी अनुसार वर्गीकरण
            </p>
          </div>

          <div style={{ background: '#131d36', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700 }}>वडा</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700 }}>कुल क्षेत्रफल (हेक्टर)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700 }}>क्षेत्रफल (रोपनी)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#22c55e', fontWeight: 700 }}>कृषि (AGR)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#eab308', fontWeight: 700 }}>आवासीय (RES)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#15803d', fontWeight: 700 }}>वन (FOR)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700 }}>सार्वजनिक (PUB)</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#06b6d4', fontWeight: 700 }}>जलस्रोत (HYD)</th>
                </tr>
              </thead>
              <tbody>
                {summary?.wards?.map((w, idx) => (
                  <tr key={w.ward_no} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#ffffff' }}>
                      {WARD_LABELS[w.ward_no] || `वडा नं. ${w.ward_no}`}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#38bdf8' }}>
                      {w.total_area_ha.toLocaleString()} Ha
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                      {w.area_ropani_str}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#4ade80' }}>
                      {w.zones['AGR'] || 0} Ha
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#facc15' }}>
                      {w.zones['RES'] || 0} Ha
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#86efac' }}>
                      {w.zones['FOR'] || 0} Ha
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      {w.zones['PUB'] || 0} Ha
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#67e8f9' }}>
                      {w.zones['HYD'] || 0} Ha
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Geodatabase (GDB) Connection & Layer Inventory Modal ── */}
      {isGdbModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1.5px solid rgba(56,189,248,0.3)',
              borderRadius: '20px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              padding: '1.75rem',
              color: '#f8fafc',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(147,51,234,0.2)', border: '1px solid #9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={24} color="#c084fc" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    Geodatabase (GDB) व्यवस्थापन तथा स्थिति
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    नापी तथा भू-उपयोग नक्साङ्कन फाइल विवरण (ESRI File Geodatabase)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsGdbModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* GDB Connection Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                  <strong style={{ fontSize: '0.85rem', color: '#4ade80' }}>Geodatabase सिङ्क गरिएको छ (Connected & Active)</strong>
                </div>
                <span style={{ background: '#3b82f6', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                  EPSG: Nepal Nagarkot TM 87
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div><strong>फाइल नाम:</strong> <code style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>SINDHUPALCHOK_PKG_09_MUTM_87.gdb</code></div>
                <div style={{ marginTop: '0.25rem' }}><strong>कम्प्युटर पाथ:</strong> <code style={{ color: '#cbd5e1', fontSize: '0.72rem', wordBreak: 'break-all' }}>C:\Users\UNepal\OneDrive\Panchpokhari offce\ToPachpakhoriLocalLevel\01Data\Geodatabase\SINDHUPALCHOK_PKG_09_MUTM_87.gdb</code></div>
                <div style={{ marginTop: '0.25rem' }}><strong>प्रोजेक्सन (CRS):</strong> Nepal Nagarkot TM 87 (Central Meridian 87°, False Easting 500,000m, False Northing 0m)</div>
                <div style={{ marginTop: '0.25rem' }}><strong>क्षेत्राधिकार:</strong> पाँचपोखरी थाङपाल गाउँपालिका (८ वटै वडा)</div>
              </div>
            </div>

            {/* Layers in GDB */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.65rem' }}>
                GDB भित्र रहेका मुख्य डिजिटल तहहरू (Layers):
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Grid size={18} color="#38bdf8" />
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Cadastre (नापी कित्ता नक्सा)</strong>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>५३,१८० वटा कित्ताहरू | २,९२,९९८ रोपनी</div>
                    </div>
                  </div>
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                    सक्रिय (Active)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Layers size={18} color="#10b981" />
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Land Use 87 (Panchpokhari_no_road)</strong>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>३,७४३ भू-उपयोग पोलिगन | ९ वटै वर्ग | ८,५७,७३७ रोपनी</div>
                    </div>
                  </div>
                  <span style={{ background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                    नक्सामा प्रदर्शित
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Compass size={18} color="#eab308" />
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Sindhupalchok_Wards (वडा सिमाना)</strong>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>१ देखि ८ वडाको आधिकारिक सिमाना र क्षेत्रफल</div>
                    </div>
                  </div>
                  <span style={{ background: '#ca8a04', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                    सक्रिय
                  </span>
                </div>
              </div>
            </div>

            {/* QGIS / Desktop GIS Workflow steps */}
            <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                💡 QGIS वा ArcGIS मा यस GDB लाई कसरी खोल्ने?
              </div>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li>QGIS खोल्नुहोस् र <strong>Browser Panel</strong> मा जानुहोस्।</li>
                <li><strong>Vector Data</strong> वा <strong>FileGDB</strong> मा Right-Click गरी माथिको GDB पाथ ब्राउज गर्नुहोस्।</li>
                <li><strong>Cadastre</strong> र <strong>Panchpokhari_no_road</strong> लेयरलाई क्यानभासमा ड्र्याग गर्नुहोस्।</li>
                <li>प्रोजेक्सन <strong>Nepal Nagarkot TM 87</strong> मा मिलेको सुनिश्चित गर्नुहोस्।</li>
              </ol>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setIsGdbModalOpen(false)}
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandClassificationPage;
