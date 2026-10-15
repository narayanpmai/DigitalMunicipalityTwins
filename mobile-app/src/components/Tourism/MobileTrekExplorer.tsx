import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import {
  SACRED_LAKES_DATA,
  PANCHPOKHARI_TRAIL_COORDINATES,
  PANCHPOKHARI_TRAIL_HOTELS,
  PANCHPOKHARI_WAYPOINTS,
  KATHMANDU_TO_BHOTANG_ROAD_COORDINATES,
  ROAD_WAYPOINTS,
  type TrailHotel,
  type TrailWaypoint,
  type SacredLake,
} from '../../data/panchpokhariTrailData';
import {
  AMA_YANGRI_TRAIL_COORDINATES,
  AMA_YANGRI_WAYPOINTS,
  AMA_YANGRI_HOTELS,
  KATHMANDU_TO_TARKEGHYANG_ROAD_COORDINATES,
} from '../../data/amaYangriTrailData';
import {
  Compass,
  Navigation,
  Phone,
  MapPin,
  Sparkles,
  Mountain,
  AlertTriangle,
  Bed,
  CheckCircle2,
  Layers,
  ChevronRight,
  Star,
  Layers as LayersIcon,
  RefreshCw,
} from 'lucide-react';

interface MobileTrekExplorerProps {
  initialRoute?: 'panchpokhari' | 'ama_yangri';
  onBackToHeritage?: () => void;
}

export const MobileTrekExplorer: React.FC<MobileTrekExplorerProps> = ({
  initialRoute = 'panchpokhari',
  onBackToHeritage,
}) => {
  const [activeRoute, setActiveRoute] = useState<'panchpokhari' | 'ama_yangri'>(initialRoute);
  const [baseLayerType, setBaseLayerType] = useState<'satellite' | 'streets'>('satellite');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] =
        activeRoute === 'panchpokhari' ? [28.04185, 85.71747] : [28.01425, 85.56929];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Satellite Hybrid base layer
      const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      });

      satelliteLayer.addTo(map);
      baseTileLayerRef.current = satelliteLayer;

      const group = L.layerGroup().addTo(map);
      layersGroupRef.current = group;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base tile layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    if (baseLayerType === 'satellite') {
      baseTileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
    } else {
      baseTileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  }, [baseLayerType]);

  // Render Route Features (Lakes, Lines, Waypoints, Hotels)
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    group.clearLayers();

    if (activeRoute === 'panchpokhari') {
      // 1. Road Polyline (Kathmandu -> Bhotang)
      const roadLine = L.polyline(KATHMANDU_TO_BHOTANG_ROAD_COORDINATES as [number, number][], {
        color: '#3b82f6',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '5, 8',
      });
      group.addLayer(roadLine);

      // 2. Trekking Trail Polyline (Bhotang -> Panchpokhari)
      const trailLine = L.polyline(PANCHPOKHARI_TRAIL_COORDINATES as [number, number][], {
        color: '#10b981',
        weight: 4.5,
        opacity: 0.95,
      });
      group.addLayer(trailLine);

      // 3. Sacred Lakes (5 Lakes with Polygons and Glowing Badges)
      SACRED_LAKES_DATA.forEach((lake) => {
        // Outer Polygon
        const poly = L.polygon(lake.polygon as [number, number][], {
          color: lake.color,
          weight: 3,
          opacity: 0.95,
          fillColor: lake.color,
          fillOpacity: 0.35,
          dashArray: '4, 4',
        });

        // Center Pulsing Circle
        const circle = L.circle(lake.center as [number, number], {
          radius: lake.radiusMeters,
          color: lake.color,
          weight: 2,
          fillColor: lake.color,
          fillOpacity: 0.25,
        });

        // Custom Lake Badge
        const lakeIcon = L.divIcon({
          className: 'custom-lake-badge',
          html: `<div style="background: rgba(15,23,42,0.92); border: 2px solid ${lake.color}; padding: 3px 8px; border-radius: 12px; font-weight: 800; font-size: 11px; color: #ffffff; box-shadow: 0 0 10px ${lake.glowColor}; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${lake.color}; box-shadow: 0 0 6px ${lake.glowColor};"></span>
            <span>${lake.number}. ${lake.name} (${lake.altitudeMeters}m)</span>
          </div>`,
          iconSize: [140, 24],
          iconAnchor: [70, 12],
        });

        const marker = L.marker(lake.center as [number, number], { icon: lakeIcon });

        const popupContent = `
          <div style="font-family: inherit; padding: 4px; max-width: 240px;">
            <div style="font-size: 13px; font-weight: 900; color: ${lake.color}; margin-bottom: 2px;">
              ${lake.number}. ${lake.name}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">
              ${lake.nameEn} • ${lake.altitudeMeters}m
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.4; margin-bottom: 6px;">
              ${lake.significance}
            </div>
            <div style="font-size: 10px; background: #f1f5f9; padding: 3px 6px; border-radius: 6px; color: #0f172a;">
              <strong>पुजिने देवता:</strong> ${lake.deity}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        poly.bindPopup(popupContent);

        group.addLayer(poly);
        group.addLayer(circle);
        group.addLayer(marker);
      });

      // 4. Hotels & Lodges along Panchpokhari
      PANCHPOKHARI_TRAIL_HOTELS.forEach((hotel) => {
        const hotelIcon = L.divIcon({
          className: 'hotel-marker',
          html: `<div style="background: #ffffff; border: 2px solid #7c3aed; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 13px;">
            🏨
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; max-width: 220px;">
            <div style="font-size: 12px; font-weight: 900; color: #1e293b;">${hotel.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">${hotel.locationName} (${hotel.altitudeMeters}m)</div>
            <div style="font-size: 10px; color: #047857; font-weight: 700; margin-bottom: 6px;">सञ्चालक: ${hotel.ownerName}</div>
            <a href="tel:${hotel.phone}" style="display: inline-flex; align-items: center; gap: 4px; background: #059669; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 800;">
              📞 प्रत्यक्ष कल (${hotel.phone})
            </a>
          </div>
        `);
        group.addLayer(marker);
      });

      // 5. Waypoints
      PANCHPOKHARI_WAYPOINTS.forEach((wp) => {
        const wpIcon = L.divIcon({
          className: 'waypoint-marker',
          html: `<div style="background: rgba(15,23,42,0.85); color: #ffffff; border: 1.5px solid ${wp.color}; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 800; white-space: nowrap; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            <span>${wp.iconEmoji}</span>
            <span>${wp.name}</span>
          </div>`,
          iconSize: [90, 20],
          iconAnchor: [45, 10],
        });
        const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
        marker.bindPopup(`<b>${wp.name}</b><br/>उचाइ: ${wp.altitudeMeters}m<br/>${wp.description}`);
        group.addLayer(marker);
      });

      // Fit to lakes
      map.flyTo([28.04185, 85.71747], 14, { duration: 1.2 });
    } else {
      // AMA YANGRI ROUTE
      // 1. Road (Kathmandu -> Tarkeghyang)
      const roadLine = L.polyline(KATHMANDU_TO_TARKEGHYANG_ROAD_COORDINATES as [number, number][], {
        color: '#3b82f6',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '5, 8',
      });
      group.addLayer(roadLine);

      // 2. Trail Line (Tarkeghyang -> Ama Yangri Summit)
      const trailLine = L.polyline(AMA_YANGRI_TRAIL_COORDINATES as [number, number][], {
        color: '#f59e0b',
        weight: 4.5,
        opacity: 0.95,
      });
      group.addLayer(trailLine);

      // 3. Summit Marker (3,771m Chhorten with prayer flags)
      const summitIcon = L.divIcon({
        className: 'summit-marker',
        html: `<div style="background: #dc2626; color: #ffffff; border: 2px solid #fde047; padding: 4px 8px; border-radius: 14px; font-size: 11px; font-weight: 900; box-shadow: 0 0 12px rgba(220,38,38,0.7); display: flex; align-items: center; gap: 4px;">
          <span>🚩</span>
          <span>आमायाङ्ग्री शिखर (३,७७१m)</span>
        </div>`,
        iconSize: [160, 26],
        iconAnchor: [80, 13],
      });
      const summitMarker = L.marker([28.01425, 85.56929], { icon: summitIcon });
      summitMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; max-width: 230px;">
          <div style="font-size: 13px; font-weight: 900; color: #dc2626;">🚩 आमायाङ्ग्री शिखर तथा छोर्तेन</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">उचाइ: ३,७७१ मिटर • ह्योल्मो कुलदेवी</div>
          <div style="font-size: 11px; color: #334155; line-height: 1.4;">
            ३६०° जुगल, लाङटाङ र गणेश हिमालको दृश्य देखिने पवित्र तीर्थस्थल।
          </div>
        </div>
      `);
      group.addLayer(summitMarker);

      // 4. Ama Yangri Waypoints & Hotels
      AMA_YANGRI_WAYPOINTS.forEach((wp) => {
        const wpIcon = L.divIcon({
          className: 'ama-wp-marker',
          html: `<div style="background: rgba(30,41,59,0.9); color: #fde047; border: 1.5px solid ${wp.color}; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 800; white-space: nowrap; display: flex; align-items: center; gap: 3px;">
            <span>${wp.iconEmoji}</span>
            <span>${wp.name}</span>
          </div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        });
        const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
        marker.bindPopup(`<b>${wp.name}</b><br/>उचाइ: ${wp.altitudeMeters}m<br/>${wp.description}`);
        group.addLayer(marker);
      });

      AMA_YANGRI_HOTELS.forEach((hotel) => {
        const hotelIcon = L.divIcon({
          className: 'hotel-marker',
          html: `<div style="background: #ffffff; border: 2px solid #059669; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 13px;">
            🏡
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; max-width: 220px;">
            <div style="font-size: 12px; font-weight: 900; color: #1e293b;">${hotel.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">${hotel.locationName} (${hotel.altitudeMeters}m)</div>
            <a href="tel:${hotel.phone}" style="display: inline-flex; align-items: center; gap: 4px; background: #059669; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 800;">
              📞 प्रत्यक्ष कल (${hotel.phone})
            </a>
          </div>
        `);
        group.addLayer(marker);
      });

      map.flyTo([28.01425, 85.56929], 14, { duration: 1.2 });
    }
  }, [activeRoute]);

  // Selected Location FlyTo
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
      duration: 1.0,
    });
  }, [selectedLocation]);

  // Live GPS Tracking with Capacitor Native Geolocation
  const handleTrackLiveLocation = async () => {
    setGpsStatus('🛰️ जीपीएस संकेत खोजी गर्दैछ...');
    try {
      let lat: number;
      let lng: number;

      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (e) {
        // Fallback to browser geolocation
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      setUserLocation([lat, lng]);
      setGpsStatus(`✓ तपाईंको प्रत्यक्ष GPS प्राप्त भयो: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          className: 'user-live-gps-marker',
          html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 14px #3b82f6; animation: pulse 1.5s infinite;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
          .bindPopup('<b>📍 तपाईंको हालको स्थान (Live GPS)</b>')
          .addTo(map);

        map.flyTo([lat, lng], 16, { duration: 1.2 });
      }
    } catch (err) {
      setGpsStatus('⚠️ GPS प्राप्त हुन सकेन। कृपया फोनको Location अन गर्नुहोस्।');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* ─── 1. ROUTE SELECTOR TABS (Panchpokhari vs Ama Yangri) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#E2E8F0',
          padding: '4px',
          borderRadius: '16px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveRoute('panchpokhari')}
          style={{
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeRoute === 'panchpokhari' ? '#047857' : 'transparent',
            color: activeRoute === 'panchpokhari' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            boxShadow: activeRoute === 'panchpokhari' ? '0 3px 10px rgba(4,120,87,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🏔️ १. पाँचपोखरी (४,१३५m)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRoute('ama_yangri')}
          style={{
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeRoute === 'ama_yangri' ? '#6D28D9' : 'transparent',
            color: activeRoute === 'ama_yangri' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            boxShadow: activeRoute === 'ama_yangri' ? '0 3px 10px rgba(109,40,217,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🚩 २. आमायाङ्ग्री पिक (३,७७१m)</span>
        </button>
      </div>

      {/* ─── 2. ROUTE BANNER ─── */}
      {activeRoute === 'panchpokhari' ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #022C22 100%)',
            color: '#ffffff',
            padding: '1.15rem',
            borderRadius: '18px',
            boxShadow: '0 8px 24px -4px rgba(6, 78, 59, 0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FDE047',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.66rem',
                fontWeight: 800,
              }}
            >
              🏔️ राष्ट्रिय धार्मिक तथा साहसिक गन्तव्य
            </span>
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 900 }}>
            काठमाडौँ - पाँचपोखरी पदमार्ग र ५ पवित्र कुण्डहरू
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.74rem', color: '#A7F3D0', lineHeight: 1.4 }}>
            काठमाडौँदेखि ४,१३५ मि उचाइमा रहेका ५ पवित्र कुण्ड (भैरव, सरस्वती, सूर्य, गणेश र नाग) सम्मको आधिकारिक डिजिटल नक्सा।
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.28)',
              padding: '8px 6px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6rem', color: '#6EE7B7' }}>🚗 कुल दुरी</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>१०३.५ km</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#6EE7B7' }}>🥾 पदयात्रा खण्ड</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>२८.४ km</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#6EE7B7' }}>⛰️ सर्वोच्च उचाइ</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>४,१३५ m</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#6EE7B7' }}>🌊 पवित्र ताल</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>५ कुण्ड</div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #2E1065 100%)',
            color: '#ffffff',
            padding: '1.15rem',
            borderRadius: '18px',
            boxShadow: '0 8px 24px -4px rgba(109, 40, 217, 0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FDE047',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.66rem',
                fontWeight: 800,
              }}
            >
              🚩 ह्योल्मो कुलदेवी तथा ३६०° हिम-दर्शन
            </span>
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 900 }}>
            काठमाडौँ - तार्केघ्याङ - आमायाङ्ग्री पिक पदमार्ग
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.74rem', color: '#DDD6FE', lineHeight: 1.4 }}>
            ऐतिहासिक ह्योल्मो बस्ती तार्केघ्याङ हुँदै ३,७७१ मिटर उचाइको आमायाङ्ग्री चुचुरो र कुलदेवी छोर्तेनसम्मको नक्सा।
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.28)',
              padding: '8px 6px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6rem', color: '#C4B5FD' }}>🚗 कुल दुरी</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>९०.९ km</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#C4B5FD' }}>🥾 पदयात्रा खण्ड</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>३.८६ km</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#C4B5FD' }}>⛰️ सर्वोच्च उचाइ</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>३,७७१ m</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#C4B5FD' }}>🛕 ह्योल्मो सम्पदा</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>गुम्बा/छोर्तेन</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. QUICK FLOATING CONTROL PILLS (Exact Match with Screenshot) ─── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '0.65rem',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {activeRoute === 'panchpokhari' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({ lat: 28.04185, lng: 85.71747, name: '५ पवित्र कुण्डहरू' });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #3B82F6',
                  borderRadius: '20px',
                  color: '#1D4ED8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={12} color="#3B82F6" />
                <span>✨ ५ पवित्र कुण्डहरू (Lakes)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({ lat: 27.97949, lng: 85.65647, name: 'भोताङ पदमार्ग' });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: '20px',
                  color: '#047857',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Compass size={12} color="#10B981" />
                <span>🧭 🏔️ पदमार्ग खण्ड (Zoom)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({ lat: 27.87, lng: 85.55, name: 'पूर्ण रुट' });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #94A3B8',
                  borderRadius: '20px',
                  color: '#334155',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🚗 पूर्ण रुट (KTM ➔ पाँचपोखरी)</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({ lat: 28.01425, lng: 85.56929, name: 'आमायाङ्ग्री चुचुरो' });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#FAF5FF',
                  border: '1.5px solid #7C3AED',
                  borderRadius: '20px',
                  color: '#6D28D9',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🚩 आमायाङ्ग्री चुचुरो (3,771m)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLocation({ lat: 27.99798, lng: 85.55395, name: 'तार्केघ्याङ गुम्बा' });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #3B82F6',
                  borderRadius: '20px',
                  color: '#1D4ED8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🛕 तार्केघ्याङ गुम्बा</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleTrackLiveLocation}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #EF4444',
              borderRadius: '20px',
              color: '#DC2626',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Navigation size={12} color="#DC2626" />
            <span>📍 मेरो Live GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setBaseLayerType(baseLayerType === 'satellite' ? 'streets' : 'satellite')}
            style={{
              padding: '6px 10px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LayersIcon size={12} />
            <span>{baseLayerType === 'satellite' ? 'स्याटेलाइट' : 'म्याप'}</span>
          </button>
        </div>

        {gpsStatus && (
          <div
            style={{
              fontSize: '0.7rem',
              padding: '4px 8px',
              backgroundColor: gpsStatus.includes('प्राप्त') ? '#F0FDF4' : '#FFFBEB',
              color: gpsStatus.includes('प्राप्त') ? '#15803D' : '#B45309',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            {gpsStatus}
          </div>
        )}
      </div>

      {/* ─── 4. INTERACTIVE LEAFLET MAP EMBED (Matching Screenshot) ─── */}
      <div
        style={{
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          backgroundColor: '#0F172A',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#0F172A',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
            <Compass size={14} color="#38BDF8" />
            <span>
              {activeRoute === 'panchpokhari'
                ? 'पाँचपोखरी ५ कुण्ड भू-सूचना प्रणाली (Leaflet / Google Satellite)'
                : 'आमायाङ्ग्री पिक भू-सूचना प्रणाली (Leaflet / Google Satellite)'}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>स्पर्श गरी जुम/सार्नुहोस्</span>
        </div>

        {/* The Map Div */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '420px', zIndex: 1 }} />
      </div>

      {/* ─── 5. SACRED LAKES CARDS (The 5 Sacred Lakes with Colored Glowing Borders) ─── */}
      {activeRoute === 'panchpokhari' ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #E2E8F0',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.9rem',
              }}
            >
              🌊
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#0F172A' }}>
                ५ पवित्र कुण्डहरू (The 5 Sacred Lakes)
              </h4>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                प्रत्येक कुण्डको विशिष्ट रङको घेरा र धार्मिक महिमा
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SACRED_LAKES_DATA.map((lake) => (
              <div
                key={lake.id}
                style={{
                  border: `1.5px solid ${lake.color}`,
                  borderRadius: '14px',
                  padding: '0.85rem',
                  backgroundColor: `${lake.color}0A`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: lake.color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        boxShadow: `0 0 8px ${lake.glowColor}`,
                      }}
                    >
                      {lake.number}
                    </span>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                        {lake.name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', marginLeft: '4px' }}>
                        ({lake.nameEn})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation({
                        lat: lake.center[0],
                        lng: lake.center[1],
                        name: `${lake.number}. ${lake.name}`,
                      });
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: lake.color,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: `0 2px 6px ${lake.color}40`,
                    }}
                  >
                    <MapPin size={11} />
                    <span>नक्सामा हेर्नुहोस्</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      color: '#0F172A',
                    }}
                  >
                    ⛰️ {lake.altitudeMeters} मिटर
                  </span>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${lake.color}50`,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      color: lake.color,
                    }}
                  >
                    🚩 {lake.deity}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                  {lake.significance}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Ama Yangri Heritage Cards */
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #E2E8F0',
            padding: '1rem',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.96rem', fontWeight: 900, color: '#0F172A' }}>
            🚩 आमायाङ्ग्री चुचुरो तथा छोर्तेन सम्पदाहरू
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {AMA_YANGRI_WAYPOINTS.map((wp) => (
              <div
                key={wp.id}
                style={{
                  border: `1.5px solid ${wp.color}50`,
                  borderRadius: '12px',
                  padding: '0.75rem',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>{wp.iconEmoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>{wp.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation({ lat: wp.lat, lng: wp.lng, name: wp.name });
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#6D28D9',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    नक्सामा हेर्नुहोस्
                  </button>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#6D28D9', fontWeight: 700, marginBottom: '4px' }}>
                  उचाइ: {wp.altitudeMeters} मिटर • {wp.type}
                </div>
                <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
                  {wp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 6. HOTEL & TEAHOUSE DIRECTORY (1-Tap Call) ─── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #E2E8F0',
          padding: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bed size={16} color="#7C3AED" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#0F172A' }}>
              पदमार्गका होटल, लज तथा टी-हाउस
            </h4>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              १-ट्याप फोन कल तथा अग्रिम कोठा बुकिङ सम्पर्क
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {(activeRoute === 'panchpokhari' ? PANCHPOKHARI_TRAIL_HOTELS : AMA_YANGRI_HOTELS).map((hotel) => (
            <div
              key={hotel.id}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E293B' }}>{hotel.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', margin: '2px 0' }}>
                  {hotel.locationName} • {hotel.altitudeMeters}m ({hotel.typeNepali})
                </div>
                <div style={{ fontSize: '0.66rem', color: '#047857', fontWeight: 700 }}>
                  सम्पर्क: {hotel.ownerName}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <a
                  href={`tel:${hotel.phone}`}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
                  }}
                >
                  <Phone size={11} />
                  <span>कल गर्नुहोस्</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation({ lat: hotel.lat, lng: hotel.lng, name: hotel.name });
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7C3AED',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  नक्सामा हेर्नुहोस् →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 7. HIGH ALTITUDE SAFETY & EMERGENCY ASSISTANCE ─── */}
      <div
        style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 800, fontSize: '0.86rem' }}>
          <AlertTriangle size={16} color="#D97706" />
          <span>
            {activeRoute === 'panchpokhari'
              ? 'पाँचपोखरी उचाइ (AMS) र स्वास्थ्य सुरक्षा'
              : 'आमायाङ्ग्री चुचुरो (३,७७१m) तीव्र हावाहुरी तथा पूर्वतयारी'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.74rem', color: '#78350F', lineHeight: 1.45 }}>
          {activeRoute === 'panchpokhari'
            ? 'पाँचपोखरी ४,१३५ मिटर उचाइमा पर्ने भएकाले टाउको दुख्ने वा सास फेर्न गाह्रो भएमा तत्काल होचो स्थानतर्फ ओर्लनुहोस्। प्रशस्त तातो पानी पिउनुहोस्।'
            : 'आमायाङ्ग्री चुचुरोमा तीव्र चिसो हावा चल्ने र पिउने पानीको स्रोत नभएकाले तार्केघ्याङबाटै पर्याप्त पानी र न्यानो ज्याकेट/टोपी बोक्नु अनिवार्य छ।'}
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          <a
            href="tel:011690011"
            style={{
              padding: '5px 10px',
              backgroundColor: '#DC2626',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Phone size={11} />
            <span>गाउँपालिका LEOC: ०११-६९००११</span>
          </a>
          <a
            href="tel:100"
            style={{
              padding: '5px 10px',
              backgroundColor: '#1E293B',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Phone size={11} />
            <span>प्रहरी कन्ट्रोल: १००</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileTrekExplorer;
