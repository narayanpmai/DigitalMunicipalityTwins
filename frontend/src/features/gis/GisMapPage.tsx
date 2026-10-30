import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSensorsSocket } from '../../api/socket';
import { municipalityApi, type SensorItem } from '../../api/municipality';
import { tourismApi, type Hotel, type Destination } from '../../api/tourism';
import { disasterApi, type Shelter } from '../../api/disaster';
import { complaintsApi } from '../../api/complaints';
import type { Complaint } from '../../types/complaint';
import { citizenServicesApi } from '../../api/citizenServices';
import { sectoralApi } from '../../api/sectoral';
import { api } from '../../api/client';
import { cooperativesApi } from '../../api/cooperatives';
import { PalikaMap } from '../../components/maps/PalikaMap';
import { Terrain3DView } from '../../components/maps/Terrain3DView';
import { PANCHPOKHARI_TRAIL_HOTELS, PANCHPOKHARI_WAYPOINTS } from '../../data/panchpokhariTrailData';
import {
  Layers,
  Building,
  GraduationCap,
  HeartPulse,
  Radio,
  Compass,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Activity,
  Zap,
  Box,
  Map,
  Search,
  Phone,
  Eye,
  CheckCircle2,
  Tent,
  MessageSquare,
  FileCheck,
  Truck,
  Accessibility,
  HardHat,
  Building2,
  Pickaxe,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  X,
  Landmark,
} from 'lucide-react';

interface BufferResult {
  center: { lat: number; lng: number };
  buffer_radius_meters: number;
  geojson: any;
}

interface RiskResult {
  ward_no: number;
  hazard_type: string;
  hazard_score: number;
  risk_level: string;
  facilities_at_risk_count: number;
  high_risk_facilities: string[];
  recommended_action: string;
  evacuation_center?: string;
}

export const GisMapPage: React.FC<{ isPublic?: boolean }> = ({ isPublic = false }) => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter');
  const urlWard = searchParams.get('ward');
  const initialType = (urlFilter === 'health' || urlFilter === 'health_post')
    ? 'health_post'
    : (urlFilter === 'ambulance'
      ? 'ambulance'
      : (urlFilter === 'social_care' || urlFilter === 'disability'
        ? 'social_care'
        : (urlFilter === 'project' || urlFilter === 'infrastructure')
          ? 'project'
          : (urlFilter === 'building_permit' || urlFilter === 'bps')
            ? 'building_permit'
            : (urlFilter === 'tourism' || urlFilter === 'viewpoint')
              ? 'viewpoint'
              : (urlFilter === 'hotel'
                ? 'hotel'
                : (urlFilter === 'shelter'
                  ? 'shelter'
                  : (urlFilter === 'agriculture'
                    ? 'agriculture'
                    : (urlFilter === 'complaint' || urlFilter === 'grievance'
                      ? 'complaint'
                      : (urlFilter === 'citizen_service' || urlFilter === 'sifarish'
                        ? 'citizen_service'
                        : 'all')))))));


  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [selectedWard, setSelectedWard] = useState<number | 'all'>(urlWard ? Number(urlWard) : 'all');
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSideTab, setActiveSideTab] = useState<'facilities' | 'simulation' | 'sensors'>('facilities');

  // Fullscreen & Layout Expansion States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDrawerOpenInFullscreen, setIsDrawerOpenInFullscreen] = useState<boolean>(false);
  const [currentBaseLayer, setCurrentBaseLayer] = useState<'satellite' | 'streets' | 'topo'>('satellite');

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Keyboard shortcut: ESC key exits fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Selected Location for Buffer / Risk Analysis
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  }>({
    lat: 27.9736,
    lng: 85.6425,
    name: 'गाउँपालिका प्रशासकीय भवन (थाङपालधाप)',
  });

  const [bufferDistanceMeters, setBufferDistanceMeters] = useState<number>(500);
  const [hazardType, setHazardType] = useState<'flood' | 'landslide'>('landslide');

  const { data: facilities = [], isLoading: isLoadingFacilities } = useQuery({
    queryKey: ['gis-facilities'],
    queryFn: () => municipalityApi.getGisFacilities(),
  });

  const { data: businesses = [] } = useQuery<any[]>({
    queryKey: ['gis-businesses'],
    queryFn: () => api.get('/businesses').then((r: any) => r.data || []),
  });

  const { data: assets = [] } = useQuery<any[]>({
    queryKey: ['gis-assets'],
    queryFn: () => api.get('/assets').then((r: any) => r.data || []),
  });

  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['tourism-hotels'],
    queryFn: () => tourismApi.getHotels(),
  });

  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ['tourism-destinations'],
    queryFn: () => tourismApi.getDestinations(),
  });

  const { data: shelters = [] } = useQuery<Shelter[]>({
    queryKey: ['gis-shelters'],
    queryFn: () => disasterApi.getShelters(),
  });

  const { data: complaints = [] } = useQuery<Complaint[]>({
    queryKey: ['gis-complaints'],
    queryFn: () => complaintsApi.getAll(),
  });

  const { data: citizenServices = [] } = useQuery<any[]>({
    queryKey: ['gis-citizen-services'],
    queryFn: () => citizenServicesApi.getAll(),
  });

  const { data: ambulances = [] } = useQuery<any[]>({
    queryKey: ['gis-ambulances'],
    queryFn: () => sectoralApi.getAmbulanceContacts(),
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['gis-projects'],
    queryFn: () => sectoralApi.getProjects({}),
  });

  const { data: buildingPermits = [] } = useQuery<any[]>({
    queryKey: ['gis-building-permits'],
    queryFn: () => api.get('/building-permits').then((r: any) => Array.isArray(r) ? r : r.data || []),
  });

  const { data: coops = [] } = useQuery<any[]>({
    queryKey: ['gis-cooperatives'],
    queryFn: () => cooperativesApi.list(),
  });

  const { data: schools = [] } = useQuery<any[]>({
    queryKey: ['gis-schools'],
    queryFn: () => sectoralApi.getSchools(),
  });

  const { data: naturalResources = [] } = useQuery<any[]>({
    queryKey: ['gis-natural-resources'],
    queryFn: () => api.get('/gis/natural-resources').then((r: any) => Array.isArray(r) ? r : r.data || []),
  });

  const { data: envRisks = [] } = useQuery<any[]>({
    queryKey: ['gis-environmental-risks'],
    queryFn: () => api.get('/gis/environmental-risks').then((r: any) => Array.isArray(r) ? r : r.data || []),
  });

  const allFacilities = useMemo(() => {
    const list = [...facilities];

    const WARD_OFFSETS: Record<number, { lat: number; lng: number }> = {
      1: { lat: 28.025, lng: 85.690 },
      2: { lat: 27.995, lng: 85.670 },
      3: { lat: 27.980, lng: 85.655 },
      4: { lat: 27.965, lng: 85.645 },
      5: { lat: 27.950, lng: 85.630 },
      6: { lat: 27.9736, lng: 85.6425 },
      7: { lat: 27.935, lng: 85.615 },
      8: { lat: 27.920, lng: 85.600 },
    };

    businesses.forEach((b: any, idx: number) => {
      const coord = WARD_OFFSETS[b.wardNumber] || WARD_OFFSETS[6];
      list.push({
        id: `biz-${b.id || idx}`,
        name: b.businessName,
        type: 'business',
        wardNo: b.wardNumber || 6,
        lat: coord.lat + (idx * 0.001 - 0.002),
        lng: coord.lng + (idx * 0.0015 - 0.002),
        categoryNepali: b.category || 'व्यापार तथा पसल',
        contact: b.proprietorPhone || b.proprietorName,
        elevation: 1950,
      } as any);
    });

    assets.forEach((a: any, idx: number) => {
      const coord = WARD_OFFSETS[a.wardNumber] || WARD_OFFSETS[6];
      list.push({
        id: `asset-${a.id || idx}`,
        name: a.assetName,
        type: 'asset',
        wardNo: a.wardNumber || 6,
        lat: coord.lat + (idx * 0.0012 - 0.001),
        lng: coord.lng - (idx * 0.001 - 0.001),
        categoryNepali: `मलेप जिन्सी: ${a.category || 'सम्पत्ति'}`,
        contact: a.assetCode,
        elevation: 1960,
      } as any);
    });

    // Real Tourist Destinations from Database
    destinations.forEach((d: Destination, idx: number) => {
      const coord = WARD_OFFSETS[d.wardNo || 3] || WARD_OFFSETS[3];
      list.push({
        id: `dest-${d.id || idx}`,
        name: d.name,
        type: 'viewpoint',
        wardNo: d.wardNo || 3,
        lat: d.lat || (coord.lat + (idx * 0.002 - 0.003)),
        lng: d.lng || (coord.lng + (idx * 0.0025 - 0.002)),
        categoryNepali: `पर्यटन: ${d.category === 'lake' ? 'पवित्र कुण्ड/ताल' : d.category === 'peak' ? 'हिमशिखर' : 'सम्पदा'}`,
        contact: d.trekDuration ? `अवधि: ${d.trekDuration}` : undefined,
        elevation: d.altitudeMeters || 2400,
        description: d.description,
        imageUrl: d.imageUrl,
      } as any);
    });

    // Real Hotels & Homestays from Database
    hotels.forEach((h: Hotel, idx: number) => {
      const coord = WARD_OFFSETS[h.wardNo || 3] || WARD_OFFSETS[3];
      list.push({
        id: `hotel-${h.id || idx}`,
        name: h.name,
        type: 'hotel',
        wardNo: h.wardNo || 3,
        lat: (coord.lat + (idx * 0.0018 - 0.002)),
        lng: (coord.lng + (idx * 0.0015 - 0.002)),
        categoryNepali: h.type === 'homestay' ? 'ग्रामीण होमस्टे' : 'पर्यटन होटल',
        contact: h.contactNumber || h.phone || h.ownerName,
        elevation: 1800,
        capacity: h.capacity,
        price: h.pricePerNight,
        imageUrl: h.imageUrl,
      } as any);
    });

    // Authentic Panchpokhari Trekking Route Hotels & Lodges
    PANCHPOKHARI_TRAIL_HOTELS.forEach((th) => {
      list.push({
        id: `trail-${th.id}`,
        name: th.name,
        type: 'hotel',
        wardNo: 3,
        lat: th.lat,
        lng: th.lng,
        categoryNepali: `पदमार्ग ${th.typeNepali}`,
        contact: `${th.ownerName} (${th.phone})`,
        elevation: th.altitudeMeters,
        capacity: th.bedCapacity,
        price: th.priceRange,
        imageUrl: th.imageUrl,
        description: th.description,
      } as any);
    });

    // Panchpokhari Trekking Route Waypoints
    PANCHPOKHARI_WAYPOINTS.forEach((wp) => {
      list.push({
        id: `waypoint-${wp.id}`,
        name: wp.name,
        type: 'viewpoint',
        wardNo: 3,
        lat: wp.lat,
        lng: wp.lng,
        categoryNepali: `पदमार्ग स्थान (${wp.nameEn})`,
        contact: `उचाइ: ${wp.altitudeMeters} मिटर`,
        elevation: wp.altitudeMeters,
        description: wp.description,
      } as any);
    });

    // Real Safe Evacuation Shelters from Disaster Database
    shelters.forEach((sh: Shelter, idx: number) => {
      const coord = WARD_OFFSETS[sh.wardNumber] || WARD_OFFSETS[4];
      list.push({
        id: `shelter-${sh.id || idx}`,
        name: sh.name,
        type: 'shelter',
        wardNo: sh.wardNumber || 4,
        lat: sh.lat || (coord.lat + (idx * 0.0012 - 0.001)),
        lng: sh.lng || (coord.lng + (idx * 0.0012 - 0.001)),
        categoryNepali: `सुरक्षित आश्रयस्थल (क्षमता: ${sh.capacity} जना)`,
        contact: sh.contactPhone ? `${sh.contactPerson ? sh.contactPerson + ': ' : ''}${sh.contactPhone}` : 'सम्पर्क उपलब्ध छैन',
        elevation: 2050,
        address: sh.location,
        capacity: sh.capacity,
        hasWater: sh.hasWater,
        hasPowerBackup: sh.hasPowerBackup,
      } as any);
    });

    // Real Agricultural Collection Centers, Cold Storage & Vet Hubs
    const agriFacilities = [
      {
        id: 'agri-bhotang-hub',
        name: 'भोताङ कृषि उपज संकलन केन्द्र',
        type: 'agriculture',
        wardNo: 3,
        lat: 27.9352,
        lng: 85.5861,
        categoryNepali: 'कृषि उपज संकलन केन्द्र (आलु, सिमी, किबी)',
        contact: 'दावा साङ्गे शेर्पा: ९८४१२३८९१०',
        elevation: 2150,
        address: 'भोताङ, गाम्चेत बजार',
        capacity: 120,
      },
      {
        id: 'agri-thangpalkot-kiwi',
        name: 'थाङपालकोट किबी तथा फलफूल संकलन केन्द्र',
        type: 'agriculture',
        wardNo: 2,
        lat: 27.9150,
        lng: 85.5684,
        categoryNepali: 'फलफूल संकलन केन्द्र (किबी तथा सिमी)',
        contact: 'पेम्बा दोर्जे तामाङ: ९८६०१२३४५६',
        elevation: 1950,
        address: 'थाङपालकोट, खोलाघारी',
        capacity: 80,
      },
      {
        id: 'agri-banskharka-lapsi',
        name: 'बाँसखर्क लप्सी तथा सुन्तला प्रशोधन केन्द्र',
        type: 'agriculture',
        wardNo: 1,
        lat: 27.8820,
        lng: 85.5452,
        categoryNepali: 'लप्सी तथा सुन्तला प्रशोधन केन्द्र',
        contact: 'शान्ति माया तामाङ: ९८६०९८१२३४',
        elevation: 1650,
        address: 'बाँसखर्क, सिम्पानी',
        capacity: 95,
      },
      {
        id: 'agri-dairy-coop',
        name: 'थाङपालधाप कृषि तथा दुग्ध संकलन सहकारी',
        type: 'agriculture',
        wardNo: 6,
        lat: 27.8765,
        lng: 85.6023,
        categoryNepali: 'दुग्ध संकलन केन्द्र (चिस्यान केन्द्र)',
        contact: 'हरि प्रसाद न्यौपाने: ९८४१५६७८९०',
        elevation: 1420,
        address: 'थाङपालधाप, सानोबजार',
        capacity: 3500,
      },
      {
        id: 'agri-cold-storage',
        name: 'भोटेसिपा शीत भण्डार तथा बीउ बैंक',
        type: 'agriculture',
        wardNo: 7,
        lat: 27.8540,
        lng: 85.5821,
        categoryNepali: 'शीत भण्डार (Cold Storage) तथा बीउ बैंक',
        contact: 'कृष्ण बहादुर श्रेष्ठ: ९८४१७७८८९९',
        elevation: 1380,
        address: 'भोटेसिपा बजार',
        capacity: 250,
      },
      {
        id: 'agri-gunsa-vet',
        name: 'गुन्सा पशुरोग उपचार तथा खोप सेवा उपकेन्द्र',
        type: 'agriculture',
        wardNo: 5,
        lat: 27.8980,
        lng: 85.6205,
        categoryNepali: 'पशु सेवा उपकेन्द्र (खोप तथा उपचार)',
        contact: 'प्राविधिक: डा. सन्दीप अधिकारी (९८५११२२३३४)',
        elevation: 1820,
        address: 'गुन्सा स्वास्थ्य चौकी परिसर',
        capacity: 400,
      },
      {
        id: 'agri-trout-farm',
        name: 'मानेखर्क उच्च हिमाली ट्राउट माछा स्रोत केन्द्र',
        type: 'agriculture',
        wardNo: 4,
        lat: 27.9220,
        lng: 85.6050,
        categoryNepali: 'रेन्बो ट्राउट माछा ह्याचरी तथा फार्म',
        contact: 'सुजन लामा: ९८०१२३४८८८',
        elevation: 1980,
        address: 'मानेखर्क, खोला किनार',
        capacity: 35,
      },
      {
        id: 'agri-langtang-organic',
        name: 'लाङटाङ प्राङ्गारिक कृषि अनुसन्धान तथा तालिम केन्द्र',
        type: 'agriculture',
        wardNo: 8,
        lat: 27.8420,
        lng: 85.5610,
        categoryNepali: 'प्राङ्गारिक कृषि अनुसन्धान तथा तालिम केन्द्र',
        contact: 'कृषि शाखा अधिकृत: ९८४१००११२२',
        elevation: 1510,
        address: 'लाङटाङ, बेसी टोल',
        capacity: 60,
      },
    ];

    agriFacilities.forEach((ag) => {
      list.push(ag as any);
    });

    // Real Complaints from Database with Live Status
    complaints.forEach((c: Complaint, idx: number) => {
      const coord = WARD_OFFSETS[c.wardNumber || 3] || WARD_OFFSETS[3];
      const lat = c.latitude || (coord.lat + (idx * 0.0016 - 0.002));
      const lng = c.longitude || (coord.lng + (idx * 0.0014 - 0.0015));
      list.push({
        id: c.complaintNo || `CMP-${c.id || idx}`,
        name: c.title,
        type: 'complaint',
        wardNo: c.wardNumber || 3,
        lat,
        lng,
        categoryNepali: `जनगुनासो (${c.category})`,
        contact: c.complainantPhone ? `${c.complainantName || 'नागरिक'} (${c.complainantPhone})` : (c.complainantName || 'गोप्य उजुरीकर्ता'),
        status: c.status,
        code: c.complaintNo,
        description: c.description,
        elevation: 1950,
      } as any);
    });

    // Ward Citizen Service & e-Sifarish Centers (1 - 8)
    const WARD_SERVICE_DESKS = [
      { ward: 1, name: 'वडा नं. १ नागरिक सहायता तथा ई-सिफारिस डेस्क (बाँसखर्क)', officer: 'कृष्ण प्रसाद (वडा सचिव)', phone: '९८०३४५६७८९' },
      { ward: 2, name: 'वडा नं. २ नागरिक सहायता तथा ई-सिफारिस डेस्क (बरुवा)', officer: 'सुरेश श्रेष्ठ (वडा सचिव)', phone: '९८५१२३४०२२' },
      { ward: 3, name: 'वडा नं. ३ नागरिक सहायता तथा ई-सिफारिस डेस्क (भोताङ)', officer: 'रामकृष्ण श्रेष्ठ (वडा सचिव)', phone: '९८४१२३४५६७' },
      { ward: 4, name: 'वडा नं. ४ नागरिक सहायता तथा ई-सिफारिस डेस्क (थाङपालकोट)', officer: 'दीपक न्यौपाने (वडा सचिव)', phone: '९८६०४४५५६६' },
      { ward: 5, name: 'वडा नं. ५ नागरिक सहायता तथा ई-सिफारिस डेस्क (गुन्साकोट)', officer: 'गणेश अधिकारी (वडा सचिव)', phone: '९८५१०२०३०४' },
      { ward: 6, name: 'वडा नं. ६ नागरिक सहायता तथा ई-सिफारिस डेस्क (तिपेनी)', officer: 'प्रकाश सापकोटा (वडा सचिव)', phone: '९८१३५५४४३३' },
      { ward: 7, name: 'वडा नं. ७ नागरिक सहायता तथा ई-सिफारिस डेस्क (थाङपालधाप)', officer: 'सुवास तामाङ (वडा सचिव)', phone: '९८०१९९८८७७' },
      { ward: 8, name: 'वडा नं. ८ नागरिक सहायता तथा ई-सिफारिस डेस्क (लागर्चे)', officer: 'कृष्णबहादुर दनुवार (वडा अध्यक्ष)', phone: '९८०८११२२३३' },
    ];
    WARD_SERVICE_DESKS.forEach((desk) => {
      const coord = WARD_OFFSETS[desk.ward];
      list.push({
        id: `desk-w${desk.ward}`,
        name: desk.name,
        type: 'citizen_service',
        wardNo: desk.ward,
        lat: coord.lat - 0.0008,
        lng: coord.lng + 0.0008,
        categoryNepali: 'नागरिक सेवा तथा ई-सिफारिस डेस्क',
        contact: `${desk.officer} · ${desk.phone}`,
        code: `SVC-DESK-0${desk.ward}`,
        elevation: 1960,
      } as any);
    });

    // Real Ambulances with live GPS tracking and driver contact
    ambulances.forEach((amb: any, idx: number) => {
      const wardNo = amb.wardNumber || 3;
      const coord = WARD_OFFSETS[wardNo] || WARD_OFFSETS[3];
      const lat = amb.latitude ? Number(amb.latitude) : (coord.lat + (idx * 0.001 - 0.001));
      const lng = amb.longitude ? Number(amb.longitude) : (coord.lng + (idx * 0.001 - 0.001));
      list.push({
        id: `amb-${amb.id || idx}`,
        name: `${amb.vehicleNumber} (${amb.driverName})`,
        type: 'ambulance',
        wardNo,
        lat,
        lng,
        categoryNepali: `एम्बुलेन्स सेवा (${amb.ambulanceType || "'ख' वर्ग"} | ${amb.isAvailable ? '🟢 उपलब्ध' : '🔴 व्यस्त'})`,
        contact: `${amb.driverName}: ${amb.contactNumber}`,
        code: `AMB-0${wardNo}`,
        elevation: 1950,
        address: amb.stationLocation,
      } as any);
    });

    // Ward Disability & Senior Citizen Social Care Desks (1 - 8)
    const SOCIAL_CARE_DESKS = [
      { ward: 1, name: 'बाँसखर्क अपाङ्गता तथा ज्येष्ठ नागरिक सहायता डेस्क', contact: 'रामबहादुर लामा: ९८६४१६५३८१', loc: 'बाँसखर्क वडा कार्यालय' },
      { ward: 2, name: 'बरुवा ज्येष्ठ नागरिक तथा अपाङ्गता सेवा केन्द्र', contact: 'दावा तामाङ: ९८६४१६५३८२', loc: 'बरुवा वडा कार्यालय' },
      { ward: 3, name: 'भोताङ सामाजिक सुरक्षा तथा पुनर्स्थापना डेस्क', contact: 'पेम्बा शेर्पा: ९८६४१६५३८३', loc: 'भोताङ मानेडाँडा' },
      { ward: 4, name: 'थाङपालकोट अपाङ्गता तथा ज्येष्ठ नागरिक मिलन केन्द्र', contact: 'सोमबहादुर विक: ९८६४१६५३८४', loc: 'मानेखर्क' },
      { ward: 5, name: 'गुन्सा सामाजिक समावेशीकरण सहायता डेस्क', contact: 'मनमाया तामाङ: ९८६४१६५३८५', loc: 'गुन्सा वडा कार्यालय' },
      { ward: 6, name: 'थाङपालधाप केन्द्रीय सामाजिक सुरक्षा महाशाखा', contact: 'गोपाल खड्का: ९८६४१६५३८६', loc: 'गाउँ कार्यपालिका प्रशासकीय भवन' },
      { ward: 7, name: 'भोटेनाम्लाङ ज्येष्ठ नागरिक सहायता केन्द्र', contact: 'दावा शेर्पा: ९८६४१६५३८७', loc: 'भोटेनाम्लाङ वडा कार्यालय' },
      { ward: 8, name: 'लाँगर्चे सामाजिक सुरक्षा तथा बाल संरक्षण डेस्क', contact: 'केशव दुलाल: ९८६४१६५३८८', loc: 'लाँगर्चे वडा कार्यालय' },
    ];
    SOCIAL_CARE_DESKS.forEach((sc) => {
      const coord = WARD_OFFSETS[sc.ward];
      list.push({
        id: `care-w${sc.ward}`,
        name: sc.name,
        type: 'social_care',
        wardNo: sc.ward,
        lat: coord.lat + 0.0006,
        lng: coord.lng - 0.0006,
        categoryNepali: 'अपाङ्गता तथा ज्येष्ठ नागरिक सहायता डेस्क',
        contact: sc.contact,
        code: `CARE-0${sc.ward}`,
        elevation: 1940,
        address: sc.loc,
      } as any);
    });

    // Real Development Projects across wards
    projects.forEach((prj: any, idx: number) => {
      const wardNo = Number(prj.wardNumber) || 3;
      const coord = WARD_OFFSETS[wardNo] || WARD_OFFSETS[3];
      const lat = prj.latitude ? Number(prj.latitude) : (coord.lat + ((idx % 8) * 0.0012 - 0.003));
      const lng = prj.longitude ? Number(prj.longitude) : (coord.lng + ((idx % 7) * 0.0014 - 0.002));
      const isCompleted = prj.status === 'completed' || prj.physicalProgressPercent === 100 || prj.progressPercentage === 100;
      const prog = prj.progressPercentage || prj.physicalProgressPercent || (isCompleted ? 100 : 70);
      list.push({
        id: `prj-${prj.id || idx}`,
        name: prj.name,
        type: 'project',
        wardNo,
        lat,
        lng,
        categoryNepali: `विकास योजना (${prj.sector || 'पूर्वाधार'} | प्रगति: ${prog}%)`,
        contact: prj.committeeChair ? `${prj.committeeChair}: ${prj.committeePhone || ''}` : (prj.contractor || 'उपभोक्ता समिति'),
        code: prj.projectCode || `PPK-W0${wardNo}-PRJ-${idx + 1}`,
        status: prj.status || (isCompleted ? 'completed' : 'ongoing'),
        progressPercentage: prog,
        physicalProgressPercent: prog,
        budget: prj.budget || prj.allocatedBudget || prj.totalAgreementAmount,
        elevation: 1950,
        address: `वडा नं. ${wardNo}, पाँचपोखरी`,
      } as any);
    });

    // Real e-BPS Building Permits
    buildingPermits.forEach((bp: any, idx: number) => {
      const wardNo = Number(bp.wardNumber) || 3;
      const coord = WARD_OFFSETS[wardNo] || WARD_OFFSETS[3];
      const lat = bp.gpsLat ? Number(bp.gpsLat) : (coord.lat + (idx * 0.0009 - 0.002));
      const lng = bp.gpsLon ? Number(bp.gpsLon) : (coord.lng + (idx * 0.0011 - 0.0015));
      list.push({
        id: `bps-${bp.id || idx}`,
        name: `${bp.landOwnerName || bp.applicantName} (${bp.usageType || 'भवन'})`,
        type: 'building_permit',
        wardNo,
        lat,
        lng,
        categoryNepali: `e-BPS भवन (${bp.buildingClass || 'ख वर्ग'} | ${bp.status || 'दर्ता'})`,
        contact: `${bp.applicantName}: ${bp.applicantPhone || ''}`,
        code: bp.applicationNo || `BPS-2081-00${idx + 1}`,
        status: bp.status,
        elevation: 1960,
        address: bp.toleAddress || `वडा नं. ${wardNo}`,
      } as any);
    });

    // Real Cooperatives from COPOMIS system
    coops.forEach((c: any, idx: number) => {
      const wardNo = Number(c.ward_number) || 3;
      const coord = WARD_OFFSETS[wardNo] || WARD_OFFSETS[3];
      const lat = c.latitude ? Number(c.latitude) : (coord.lat + (idx * 0.0012 - 0.001));
      const lng = c.longitude ? Number(c.longitude) : (coord.lng + (idx * 0.0013 - 0.001));
      list.push({
        id: `coop-${c.id || idx}`,
        name: c.name,
        type: 'cooperative',
        wardNo,
        lat,
        lng,
        categoryNepali: `सहकारी संस्था (${c.coop_type} | ${c.risk_level || 'नियमित'})`,
        contact: c.chairperson_name ? `${c.chairperson_name}: ${c.chairperson_phone || ''}` : (c.phone || ''),
        code: c.copomis_code || c.registration_no,
        elevation: 1950,
        address: c.tole_address || `वडा नं. ${wardNo}, पाँचपोखरी`,
      } as any);
    });

    // Real Schools from MunSMS Education System
    schools.forEach((s: any, idx: number) => {
      const wardNo = Number(s.wardNumber) || 3;
      const coord = WARD_OFFSETS[wardNo] || WARD_OFFSETS[3];
      const lat = s.latitude ? Number(s.latitude) : (coord.lat + (idx * 0.0015 - 0.002));
      const lng = s.longitude ? Number(s.longitude) : (coord.lng - (idx * 0.001 - 0.0015));
      list.push({
        id: `school-${s.id || idx}`,
        name: s.nameNepali || s.name || s.nameEn,
        type: 'school',
        wardNo,
        lat,
        lng,
        categoryNepali: `विद्यालय (${s.type === 'private' ? 'संस्थागत' : 'सामुदायिक'} | तह: ${s.level || 'आधारभूत'})`,
        contact: s.principalName ? `${s.principalName}: ${s.contactNumber || s.contactPhone || ''}` : (s.contactNumber || s.contactPhone || ''),
        code: s.emisCode || s.code,
        elevation: 1950,
        address: s.tole || s.location || `वडा नं. ${wardNo}, पाँचपोखरी`,
      } as any);
    });

    // Real Natural Resources & Watersheds from Database
    naturalResources.forEach((nr: any, idx: number) => {
      const wardNum = parseInt(nr.ward_id || nr.wardId || '3', 10) || 3;
      const coord = WARD_OFFSETS[wardNum] || WARD_OFFSETS[3];
      const geom = nr.gis_geometry || nr.gisGeometry;
      let lat = coord.lat + (idx * 0.001 - 0.002);
      let lng = coord.lng + (idx * 0.001 - 0.002);
      if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
        lng = geom.coordinates[0];
        lat = geom.coordinates[1];
      } else if (geom?.type === 'Polygon' && Array.isArray(geom.coordinates?.[0]?.[0])) {
        lng = geom.coordinates[0][0][0];
        lat = geom.coordinates[0][0][1];
      } else if (geom?.type === 'LineString' && Array.isArray(geom.coordinates?.[0])) {
        lng = geom.coordinates[0][0];
        lat = geom.coordinates[0][1];
      }
      list.push({
        id: `nat-${nr.id || idx}`,
        name: nr.name,
        type: 'natural_resource',
        wardNo: wardNum,
        lat,
        lng,
        categoryNepali: `प्राकृतिक स्रोत: ${nr.resource_type || nr.resourceType} (${nr.conservation_status || nr.conservationStatus || 'संरक्षित'})`,
        contact: nr.management_committee_id ? `व्यवस्थापन: ${nr.management_committee_id}` : undefined,
        elevation: 2100,
        description: `क्षेत्रफल/लम्बाइ: ${nr.area_or_length || nr.areaOrLength || '-'}`,
      } as any);
    });

    // Real Environmental Hazards & Risk Zones from Database
    envRisks.forEach((er: any, idx: number) => {
      const poly = er.gis_polygon || er.gisPolygon;
      let lat = 27.985 + (idx * 0.005 - 0.01);
      let lng = 85.642 + (idx * 0.005 - 0.01);
      if (Array.isArray(poly?.coordinates?.[0]?.[0])) {
        lng = poly.coordinates[0][0][0];
        lat = poly.coordinates[0][0][1];
      }
      list.push({
        id: `risk-${er.id || idx}`,
        name: `${er.risk_type || er.riskType} जोखिम क्षेत्र (${er.id})`,
        type: 'hazard',
        wardNo: idx % 8 + 1,
        lat,
        lng,
        categoryNepali: `वातावरणीय जोखिम: ${er.risk_type || er.riskType} (${er.severity_level || er.severityLevel})`,
        contact: `अवस्था: ${er.mitigation_status || er.mitigationStatus}`,
        elevation: 2050,
      } as any);
    });

    return list;
  }, [facilities, businesses, assets, destinations, hotels, shelters, complaints, citizenServices, ambulances, projects, buildingPermits, coops, schools, naturalResources, envRisks]);


  // IoT Sensors Query
  const { data: sensors = [], refetch: refetchSensors } = useQuery<SensorItem[]>({
    queryKey: ['iot-sensors'],
    queryFn: () => municipalityApi.getSensors(),
  });

  useEffect(() => {
    const socket = getSensorsSocket();
    
    const handleSensorUpdate = (updatedSensor: SensorItem) => {
      queryClient.setQueryData<SensorItem[]>(['iot-sensors'], (oldSensors = []) => {
        const exists = oldSensors.find(s => s.sensorId === updatedSensor.sensorId);
        if (exists) {
          return oldSensors.map(s => s.sensorId === updatedSensor.sensorId ? updatedSensor : s);
        }
        return [...oldSensors, updatedSensor];
      });
    };

    socket.on('sensorUpdate', handleSensorUpdate);

    return () => {
      socket.off('sensorUpdate', handleSensorUpdate);
    };
  }, [queryClient]);

  // Telemetry Simulation Mutation
  const telemetryMutation = useMutation({
    mutationFn: ({ sensorId, value }: { sensorId: string; value: number }) =>
      municipalityApi.pushSensorTelemetry(sensorId, value),
    onSuccess: () => {
      refetchSensors();
    },
  });

  // FastAPI Buffer Mutation
  const bufferMutation = useMutation<
    BufferResult,
    Error,
    { lat: number; lng: number; buffer_meters: number }
  >({
    mutationFn: (params) => municipalityApi.calculateBuffer(params) as Promise<BufferResult>,
  });

  // FastAPI Risk Zoning Mutation
  const riskMutation = useMutation<
    RiskResult,
    Error,
    { ward_no: number; hazard_type: string }
  >({
    mutationFn: (params) => municipalityApi.analyzeRisk(params) as Promise<RiskResult>,
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const updateLocationMutation = useMutation({
    mutationFn: (data: { id: string; lat: number; lng: number }) =>
      api.put(`/gis/facilities/${data.id}/location`, { lat: data.lat, lng: data.lng }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gis-facilities'] });
      setSelectedLocation((prev) => ({
        ...prev,
        lat: variables.lat,
        lng: variables.lng,
      }));
      setSaveSuccessMessage(`✅ पूर्वाधारको नयाँ GPS स्थान (${variables.lat.toFixed(5)}° N, ${variables.lng.toFixed(5)}° E) डेटाबेसमा सुरक्षित भयो!`);
      setTimeout(() => setSaveSuccessMessage(null), 6000);
    },
    onError: () => {
      alert('स्थान अद्यावधिक गर्दा प्राविधिक त्रुटि भयो।');
    },
  });

  const handleUpdateLocation = (id: string, lat: number, lng: number) => {
    updateLocationMutation.mutate({ id, lat, lng });
  };

  const handleRunSimulation = () => {
    if (!selectedLocation) return;
    bufferMutation.mutate({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      buffer_meters: bufferDistanceMeters,
    });

    const wardNum = typeof selectedWard === 'number' ? selectedWard : 3;
    riskMutation.mutate({
      ward_no: wardNum,
      hazard_type: hazardType,
    });
  };

  // Facility Counts by Category
  const counts = useMemo(() => {
    const health = allFacilities.filter((f) => f.type === 'health_post' || f.type === 'hospital').length;
    const school = allFacilities.filter((f) => f.type === 'school').length;
    const wardOffice = allFacilities.filter((f) => f.type === 'ward_office').length;
    const viewpoint = allFacilities.filter((f) => f.type === 'viewpoint' || f.type === 'destination').length;
    const hotel = allFacilities.filter((f) => f.type === 'hotel').length;
    const shelter = allFacilities.filter((f) => f.type === 'shelter').length;
    const agriculture = allFacilities.filter((f) => f.type === 'agriculture').length;
    const complaint = allFacilities.filter((f) => f.type === 'complaint').length;
    const citizenService = allFacilities.filter((f) => f.type === 'citizen_service').length;
    const ambulance = allFacilities.filter((f) => f.type === 'ambulance').length;
    const socialCare = allFacilities.filter((f) => f.type === 'social_care').length;
    const project = allFacilities.filter((f) => f.type === 'project').length;
    const buildingPermit = allFacilities.filter((f) => f.type === 'building_permit').length;
    const cooperative = allFacilities.filter((f) => f.type === 'cooperative').length;
    return {
      all: allFacilities.length,
      health,
      school,
      wardOffice,
      viewpoint,
      hotel,
      shelter,
      agriculture,
      complaint,
      citizenService,
      ambulance,
      socialCare,
      project,
      buildingPermit,
      cooperative,
    };
  }, [allFacilities]);


  // Filtered Facilities based on Ward, Type & Search
  const filteredFacilities = useMemo(() => {
    return allFacilities.filter((fac) => {
      const matchesWard = selectedWard === 'all' || fac.wardNo === selectedWard;

      const matchesType =
        selectedType === 'all'
          ? true
          : selectedType === 'health_post'
          ? fac.type === 'health_post' || fac.type === 'hospital'
          : selectedType === 'viewpoint'
          ? fac.type === 'viewpoint' || fac.type === 'destination'
          : selectedType === 'shelter'
          ? fac.type === 'shelter'
          : selectedType === 'agriculture'
          ? fac.type === 'agriculture'
          : selectedType === 'complaint'
          ? fac.type === 'complaint'
          : selectedType === 'citizen_service'
          ? fac.type === 'citizen_service'
          : selectedType === 'ambulance'
          ? fac.type === 'ambulance'
          : selectedType === 'social_care'
          ? fac.type === 'social_care'
          : selectedType === 'project'
          ? fac.type === 'project'
          : selectedType === 'building_permit'
          ? fac.type === 'building_permit'
          : fac.type === selectedType;


      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        fac.name.toLowerCase().includes(query) ||
        (fac.categoryNepali && fac.categoryNepali.toLowerCase().includes(query)) ||
        (fac.contact && fac.contact.includes(query)) ||
        `वडा ${fac.wardNo}`.includes(query) ||
        `ward ${fac.wardNo}`.includes(query);

      return matchesWard && matchesType && matchesSearch;
    });
  }, [allFacilities, selectedWard, selectedType, searchQuery]);

  const activeAlerts = sensors.filter((s) => s.status === 'Warning' || s.status === 'Critical');

  // Select a facility for Map navigation and buffer analysis
  const handleSelectFacility = (fac: { lat: number; lng: number; name: string }) => {
    setSelectedLocation({ lat: fac.lat, lng: fac.lng, name: fac.name });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={28} color="var(--primary)" />
            <span>डिजिटल ट्विन GIS नक्सा तथा ३D भू-धरातल</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            सार्वजनिक पूर्वाधार (स्वास्थ्य सेवा, शिक्षा प्रणाली, वडा कार्यालय) को GPS नक्साङ्कन, Shapely बफर विश्लेषण र प्रत्यक्ष IoT सेन्सर टेलिमेट्री
          </p>
        </div>

        {/* 2D / 3D Mode Switcher & Fullscreen Action */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('2d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: viewMode === '2d' ? 'var(--primary)' : 'transparent',
                color: viewMode === '2d' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Map size={16} />
              <span>२D GIS नक्सा</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: viewMode === '3d' ? '#0284c7' : 'transparent',
                color: viewMode === '3d' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Box size={16} />
              <span>३D डिजिटल ट्विन भू-धरातल</span>
            </button>
          </div>

          {/* Direct Link to Land Classification Twin */}
          <Link
            to={isPublic ? "/land-classification" : "/app/land-classification"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={16} />
            <span>जग्गा वर्गीकरण तथा भू-उपयोग नक्सा</span>
          </Link>

          {/* Quick Base Layer Switcher (Normal View) */}
          {viewMode === '2d' && (
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              <button
                onClick={() => setCurrentBaseLayer('satellite')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: currentBaseLayer === 'satellite' ? '#059669' : 'transparent',
                  color: currentBaseLayer === 'satellite' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: currentBaseLayer === 'satellite' ? '0 1px 4px rgba(5, 150, 105, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title="स्याटेलाइट भ्यू (Satellite Hybrid Imagery)"
              >
                <span>🛰️ स्याटेलाइट</span>
              </button>
              <button
                onClick={() => setCurrentBaseLayer('streets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: currentBaseLayer === 'streets' ? '#0284c7' : 'transparent',
                  color: currentBaseLayer === 'streets' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
                title="सडक नक्सा (Street Map)"
              >
                <span>🗺️ सडक</span>
              </button>
              <button
                onClick={() => setCurrentBaseLayer('topo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: currentBaseLayer === 'topo' ? '#d97706' : 'transparent',
                  color: currentBaseLayer === 'topo' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
                title="टोपोग्राफी धरातल (Topographic Contour)"
              >
                <span>🏔️ टोपो</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid var(--primary, #0284c7)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: isFullscreen ? 'var(--primary, #0284c7)' : '#eff6ff',
              color: isFullscreen ? '#ffffff' : 'var(--primary, #0284c7)',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)',
              transition: 'all 0.15s ease',
            }}
            title="नक्सालाई पुरै स्क्रिनभरि हेर्नुहोस् (Full Page / Fullscreen)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFullscreen ? 'सामान्य दृश्य (Exit)' : '⛶ फुलपेज नक्सा (Full Page)'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>कूल संकलित पूर्वाधार (GPS)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a' }}>{counts.all}</div>
          </div>
          <Layers size={28} color="#3b82f6" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>स्वास्थ्य सेवा पूर्वाधार</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7f1d1d' }}>{counts.health}</div>
          </div>
          <HeartPulse size={28} color="#ef4444" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>शिक्षा प्रणाली (विद्यालय)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532d' }}>{counts.school}</div>
          </div>
          <GraduationCap size={28} color="#10b981" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>वडा तथा प्रशासकीय कार्यालय</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0c4a6e' }}>{counts.wardOffice}</div>
          </div>
          <Building size={28} color="#0284c7" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>पर्यटन तथा सम्पदा केन्द्र</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#78350f' }}>{counts.viewpoint}</div>
          </div>
          <Compass size={28} color="#f59e0b" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('shelter')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>सुरक्षित आश्रयस्थल (Shelters)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b' }}>{counts.shelter}</div>
          </div>
          <Tent size={28} color="#059669" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('agriculture')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>कृषि तथा पशुपन्छी केन्द्र</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532d' }}>{counts.agriculture}</div>
          </div>
          <span style={{ fontSize: '26px' }}>🌾</span>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1px solid #fed7aa',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('complaint')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 600 }}>दर्ता जनगुनासो (Hello Palika)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9a3412' }}>{counts.complaint}</div>
          </div>
          <MessageSquare size={28} color="#ea580c" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('citizen_service')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 600 }}>नागरिक सेवा तथा ई-सिफारिस डेस्क</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3730a3' }}>{counts.citizenService}</div>
          </div>
          <FileCheck size={28} color="#6366f1" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('ambulance')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>सक्रिय एम्बुलेन्स सेवा (२४/७)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7f1d1d' }}>{counts.ambulance}</div>
          </div>
          <Truck size={28} color="#dc2626" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('social_care')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 600 }}>अपाङ्गता तथा ज्येष्ठ नागरिक केन्द्र</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#581c87' }}>{counts.socialCare}</div>
          </div>
          <Accessibility size={28} color="#7c3aed" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('project')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>विकास पूर्वाधार आयोजना</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>{counts.project}</div>
          </div>
          <HardHat size={28} color="#d97706" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('building_permit')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>e-BPS भवन नक्सापास</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0c4a6e' }}>{counts.buildingPermit}</div>
          </div>
          <Building2 size={28} color="#0284c7" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            border: '1px solid #99f6e4',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedType('cooperative')}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>सहकारी संस्था (COPOMIS)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#115e59' }}>{counts.cooperative}</div>
          </div>
          <Landmark size={28} color="#0d9488" />
        </div>
      </div>


      {/* Active Sensor Alert Banner if any */}
      {activeAlerts.length > 0 && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span>
              <strong>🚨 विपद् सतर्कता अलर्ट:</strong> {activeAlerts.map((a) => `${a.name} मा खतरा सीमा पार (${a.lastValue} ${a.unit})`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => setActiveSideTab('sensors')}
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            सेन्सर हेर्नुहोस् &rarr;
          </button>
        </div>
      )}

      {/* Save Location Success Notification Banner */}
      {saveSuccessMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #10b981',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#047857',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters Bar (Only relevant for 2D Map) */}
      <div
        className="dt-card"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Modern Layer Toggles (Filter Chips) */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '0.6rem', 
            flexWrap: 'wrap',
            paddingBottom: '0.5rem',
            paddingTop: '0.25rem',
            width: '100%',
          }}
        >
          
          {[
            { id: 'all', label: 'सबै पूर्वाधार', count: counts.all, icon: <Layers size={15} /> },
            { id: 'health_post', label: 'स्वास्थ्य सेवा', count: counts.health, icon: <HeartPulse size={15} /> },
            { id: 'school', label: 'शिक्षा प्रणाली', count: counts.school, icon: <GraduationCap size={15} /> },
            { id: 'ward_office', label: 'वडा/प्रशासकीय कार्यालय', count: counts.wardOffice, icon: <Building size={15} /> },
            { id: 'viewpoint', label: 'पर्यटन तथा सम्पदा', count: counts.viewpoint, icon: <Compass size={15} /> },
            { id: 'hotel', label: 'होटल/होमस्टे', count: counts.hotel, icon: <Tent size={15} /> },
            { id: 'shelter', label: 'सुरक्षित आश्रयस्थल', count: counts.shelter, icon: <Tent size={15} color={selectedType === 'shelter' ? '#fff' : '#059669'} /> },
            { id: 'agriculture', label: 'कृषि तथा पशुपन्छी', count: counts.agriculture, icon: <span style={{ fontSize: '1rem', lineHeight: 1 }}>🌾</span> },
            { id: 'complaint', label: 'जनगुनासो', count: counts.complaint, icon: <MessageSquare size={15} /> },
            { id: 'citizen_service', label: 'नागरिक सेवा डेस्क', count: counts.citizenService, icon: <FileCheck size={15} /> },
            { id: 'ambulance', label: 'एम्बुलेन्स सेवा', count: counts.ambulance, icon: <Truck size={15} /> },
            { id: 'social_care', label: 'सामाजिक सुरक्षा', count: counts.socialCare, icon: <Accessibility size={15} /> },
            { id: 'project', label: 'विकास आयोजना', count: counts.project, icon: <HardHat size={15} /> },
            { id: 'building_permit', label: 'e-BPS नक्सापास', count: counts.buildingPermit, icon: <Building2 size={15} /> },
          ].map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid transparent' : '1px solid #e2e8f0',
                  background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.25)' : '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }
                }}
              >
                {tab.icon}
                <span>{tab.label} <span style={{ opacity: isActive ? 0.9 : 0.6, fontSize: '0.8rem', marginLeft: '0.1rem' }}>({tab.count})</span></span>
              </button>
            );
          })}
        </div>


        {/* Ward Selector & Layout Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>वडा छान्नुहोस्:</span>
            <select
              className="dt-select"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ minWidth: '160px' }}
            >
              <option value="all">सबै वडाहरू (१ - ८)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w}>
                  वडा नं. {w}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Side Panel Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: isSidebarCollapsed ? '#f1f5f9' : '#ffffff',
              color: isSidebarCollapsed ? 'var(--primary, #0284c7)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isSidebarCollapsed ? 'दायाँ प्यानल देखाउनुहोस्' : 'दायाँ प्यानल लुकाउनुहोस् (नक्सालाई फराकिलो बनाउनुहोस्)'}
          >
            {isSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
            <span>{isSidebarCollapsed ? 'प्यानल देखाउनुहोस्' : 'प्यानल लुकाउनुहोस्'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--primary, #0284c7)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.15s ease',
            }}
            title="नक्सालाई पुरै स्क्रिनभरि फुलपेज बनाउनुहोस्"
          >
            <Maximize2 size={16} />
            <span>फुलपेज (Full Page)</span>
          </button>
        </div>
      </div>

      {/* Map + Side Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isSidebarCollapsed ? '1fr' : 'minmax(0, 1.8fr) minmax(360px, 1.2fr)', gap: '1.25rem', transition: 'all 0.25s ease' }}>
        {/* Map / 3D Canvas Container */}
        <div className="dt-card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
          {/* Quick Floating Action Bar on the Map */}
          <div style={{ position: 'absolute', top: '12px', left: '56px', zIndex: 999, display: 'flex', gap: '6px' }}>
            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0284c7',
              }}
              title="नक्सालाई पुरै स्क्रिनभरि फुलपेज बनाउनुहोस् (Full Page)"
            >
              <Maximize2 size={13} color="#0284c7" />
              <span>फुलपेज नक्सा</span>
            </button>
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                }}
                title="पूर्वाधार तथा सेन्सर सूची प्यानल देखाउनुहोस्"
              >
                <PanelRightOpen size={13} />
                <span>प्यानल खोल्नुहोस्</span>
              </button>
            )}
          </div>

          {viewMode === '2d' ? (
            <PalikaMap
              facilities={filteredFacilities}
              sensors={sensors}
              selectedWard={selectedWard}
              selectedLocation={selectedLocation}
              isPublic={isPublic}
              baseLayer={currentBaseLayer}
              onBaseLayerChange={setCurrentBaseLayer}
              onUpdateLocation={isPublic ? undefined : handleUpdateLocation}
              height={isSidebarCollapsed ? '780px' : '650px'}
              bufferData={bufferMutation.data}
              onSelectLocation={(lat, lng, name) => {
                setSelectedLocation({ lat, lng, name });
                setActiveSideTab('simulation');
                if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              }}
            />
          ) : (
            <Terrain3DView
              sensors={sensors}
              height={isSidebarCollapsed ? '780px' : '650px'}
            />
          )}

          <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Radio size={14} color="#0284c7" />
              <span>
                {viewMode === '2d'
                  ? '💡 सुझाव: नक्सामा कुनै पनि पिनमा क्लिक गर्दा GPS विवरण र Shapely Geodesic बफर विश्लेषण सक्रिय हुन्छ।'
                  : '💡 सुझाव: माउस थिचेर ३D क्यामेरा घुमाउनुहोस्, स्क्रोल गरेर उचाइ (Zoom) हेर्नुहोस्।'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#ef4444' }}>● स्वास्थ्य</span>
              <span style={{ color: '#10b981' }}>● शिक्षा</span>
              <span style={{ color: '#0284c7' }}>● वडा कार्यालय</span>
              <span style={{ color: '#f59e0b' }}>● पर्यटन</span>
              <span style={{ color: '#8b5cf6' }}>● होटल ({counts.hotel})</span>
              <span style={{ color: '#6366f1' }}>● व्यवसाय ({businesses.length})</span>
              <span style={{ color: '#059669' }}>● सार्वजनिक जिन्सी ({assets.length})</span>
            </div>
          </div>
        </div>

        {/* Right Side Panel with 3 Tabs */}
        {!isSidebarCollapsed && (
          <div className="dt-card" style={{ display: 'flex', flexDirection: 'column', height: '710px', overflow: 'hidden' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveSideTab('facilities')}
              style={{
                flex: 1.2,
                padding: '0.65rem 0.4rem',
                border: 'none',
                background: 'none',
                fontWeight: activeSideTab === 'facilities' ? 700 : 500,
                color: activeSideTab === 'facilities' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeSideTab === 'facilities' ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Layers size={14} />
              <span>पूर्वाधार ({filteredFacilities.length})</span>
            </button>

            <button
              onClick={() => setActiveSideTab('simulation')}
              style={{
                flex: 1,
                padding: '0.65rem 0.4rem',
                border: 'none',
                background: 'none',
                fontWeight: activeSideTab === 'simulation' ? 700 : 500,
                color: activeSideTab === 'simulation' ? '#0284c7' : 'var(--text-muted)',
                borderBottom: activeSideTab === 'simulation' ? '2px solid #0284c7' : 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Compass size={14} />
              <span>AI बफर</span>
            </button>

            <button
              onClick={() => setActiveSideTab('sensors')}
              style={{
                flex: 1.1,
                padding: '0.65rem 0.4rem',
                border: 'none',
                background: 'none',
                fontWeight: activeSideTab === 'sensors' ? 700 : 500,
                color: activeSideTab === 'sensors' ? '#10b981' : 'var(--text-muted)',
                borderBottom: activeSideTab === 'sensors' ? '2px solid #10b981' : 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Activity size={14} />
              <span>IoT स्ट्रिम ({sensors.length})</span>
            </button>
          </div>

          {/* Tab 1: Facilities List with Live Search */}
          {activeSideTab === 'facilities' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '0.5rem' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', padding: '0 0.25rem' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="पूर्वाधार, स्वास्थ्य चौकी, विद्यालय खोज्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Facility Cards List */}
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1, paddingRight: '0.2rem' }}>
                {isLoadingFacilities ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    GPS डाटा लोड हुँदैछ...
                  </div>
                ) : filteredFacilities.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>कुनै पूर्वाधार भेटिएन</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>खोज शब्द वा फिल्टर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।</div>
                  </div>
                ) : (
                  filteredFacilities.map((fac) => {
                    const isSelected = selectedLocation.lat === fac.lat && selectedLocation.lng === fac.lng;
                    const isHealth = fac.type === 'health_post' || fac.type === 'hospital';
                    const isSchool = fac.type === 'school';
                    const isWardOffice = fac.type === 'ward_office';
                    const isTourism = fac.type === 'viewpoint';
                    const isHotel = fac.type === 'hotel';
                    const isShelter = fac.type === 'shelter';
                    const isAgri = fac.type === 'agriculture';

                    const badgeColor = isHealth
                      ? '#ef4444'
                      : isSchool
                      ? '#10b981'
                      : isWardOffice
                      ? '#0284c7'
                      : isShelter
                      ? '#059669'
                      : isAgri
                      ? '#15803d'
                      : isHotel
                      ? '#8b5cf6'
                      : '#f59e0b';

                    const badgeBg = isHealth
                      ? '#fee2e2'
                      : isSchool
                      ? '#dcfce7'
                      : isWardOffice
                      ? '#e0f2fe'
                      : isShelter
                      ? '#ecfdf5'
                      : isAgri
                      ? '#dcfce7'
                      : isHotel
                      ? '#f3e8ff'
                      : '#fef3c7';

                    const iconEmoji = isHealth
                      ? '🏥'
                      : isSchool
                      ? '🎓'
                      : isWardOffice
                      ? '🏛️'
                      : isShelter
                      ? '⛺'
                      : isAgri
                      ? '🌾'
                      : isHotel
                      ? '🏨'
                      : '🏔️';


                    return (
                      <div
                        key={fac.id}
                        onClick={() => handleSelectFacility(fac)}
                        style={{
                          padding: '0.7rem 0.8rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none',
                        }}
                      >
                        {/* Header: Badge & Ward */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: badgeColor,
                              backgroundColor: badgeBg,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            {iconEmoji} {fac.categoryNepali || (isHealth ? 'स्वास्थ्य सेवा' : isSchool ? 'विद्यालय' : isWardOffice ? 'वडा कार्यालय' : 'पर्यटन')}
                          </span>

                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#475569',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            वडा नं. {fac.wardNo}
                          </span>
                        </div>

                        {/* Facility Name */}
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                          {fac.name}
                        </div>

                        {/* GPS Coordinates & Contact */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'monospace' }}>
                            <MapPin size={12} color="#64748b" />
                            {fac.lat.toFixed(4)}, {fac.lng.toFixed(4)}
                          </span>

                          {fac.contact && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#0284c7', fontWeight: 600 }}>
                              <Phone size={11} />
                              {fac.contact}
                            </span>
                          )}
                        </div>

                        {/* Quick action footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem', paddingTop: '0.35rem', borderTop: '1px dashed #f1f5f9' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFacility(fac);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284c7',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              padding: 0,
                            }}
                          >
                            <Eye size={12} />
                            <span>नक्सामा हेर्नुहोस्</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFacility(fac);
                              setActiveSideTab('simulation');
                            }}
                            style={{
                              background: '#e0f2fe',
                              border: '1px solid #bae6fd',
                              color: '#0369a1',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              padding: '0.2rem 0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <span>बफर विश्लेषण &rarr;</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: AI Buffer & Risk Simulation */}
          {activeSideTab === 'simulation' && (
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, paddingRight: '0.2rem' }}>
              {/* Selected Point Info */}
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0369a1', fontWeight: 700, fontSize: '0.85rem' }}>
                  <MapPin size={16} />
                  <span>छानिएको केन्द्र बिन्दु:</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: '0.3rem', color: 'var(--text-main)' }}>
                  {selectedLocation.name || 'नक्सा बिन्दु'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                  अक्षांश (Lat): {selectedLocation.lat.toFixed(5)}° N | देशान्तर (Lng): {selectedLocation.lng.toFixed(5)}° E
                </div>
              </div>

              {/* Buffer Radius Selector */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Shapely Geodesic बफर परिधि:</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{bufferDistanceMeters} मिटर</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="100"
                  value={bufferDistanceMeters}
                  onChange={(e) => setBufferDistanceMeters(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>२०० मिटर</span>
                  <span>१००० मिटर</span>
                  <span>२५०० मिटर</span>
                </div>
              </div>

              {/* Hazard Type Selector */}
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  प्राकृतिक विपद् संवेदनशीलता:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setHazardType('landslide')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: hazardType === 'landslide' ? '#fee2e2' : 'white',
                      color: hazardType === 'landslide' ? '#991b1b' : 'var(--text-main)',
                    }}
                  >
                    पहिरो (Landslide)
                  </button>
                  <button
                    onClick={() => setHazardType('flood')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: hazardType === 'flood' ? '#e0f2fe' : 'white',
                      color: hazardType === 'flood' ? '#0369a1' : 'var(--text-main)',
                    }}
                  >
                    बाढी (Flood)
                  </button>
                </div>
              </div>

              {/* Simulation Action Button */}
              <button
                onClick={handleRunSimulation}
                disabled={bufferMutation.isPending || riskMutation.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} className={bufferMutation.isPending ? 'spin' : ''} />
                <span>
                  {bufferMutation.isPending ? 'सिमुलेशन चल्दैछ...' : 'Shapely बफर तथा जोखिम विश्लेषण गर्नुहोस्'}
                </span>
              </button>

              {/* Results Display */}
              {bufferMutation.data && (
                <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <ShieldCheck size={16} />
                    <span>Python FastAPI बफर पोलिगोन तयार भयो</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#14532d' }}>
                    नक्सामा <strong>{bufferMutation.data.buffer_radius_meters} मिटर</strong> को Geodesic पोलिगोन अङ्कित गरिएको छ।
                  </div>
                </div>
              )}

              {riskMutation.data && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    backgroundColor: riskMutation.data.risk_level === 'high' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${riskMutation.data.risk_level === 'high' ? '#fecaca' : '#fef3c7'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: riskMutation.data.risk_level === 'high' ? '#991b1b' : '#92400e',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>
                      जोखिम स्तर:{' '}
                      {riskMutation.data.risk_level === 'high' ? 'उच्च जोखिम (High Risk)' : 'मध्यम जोखिम (Medium Risk)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                    <strong>सुरक्षित आश्रयस्थल:</strong> {riskMutation.data.evacuation_center}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <strong>सुझाव:</strong> {riskMutation.data.recommended_action}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Live IoT Sensor Telemetry Stream */}
          {activeSideTab === 'sensors' && (
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, paddingRight: '0.2rem' }}>
              {/* Simulation Actions */}
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={14} color="#f59e0b" />
                  <span>टेलिमेट्री सिमुलेटर (Telemetry Trigger)</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => telemetryMutation.mutate({ sensorId: 'SEN-MEL-01', value: 5.8 })}
                    disabled={telemetryMutation.isPending}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🚨 उच्च बाढी (५.८m)
                  </button>
                  <button
                    onClick={() => telemetryMutation.mutate({ sensorId: 'SEN-MEL-01', value: 3.2 })}
                    disabled={telemetryMutation.isPending}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '4px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    सामान्य रिसेट (३.२m)
                  </button>
                </div>
              </div>

              {/* Sensor Cards List */}
              {sensors.map((s) => {
                const isCritical = s.status === 'Critical';
                const isWarning = s.status === 'Warning';
                const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedLocation({ lat: s.latitude, lng: s.longitude, name: s.name });
                      setActiveSideTab('simulation');
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${isCritical ? '#fca5a5' : 'var(--border)'}`,
                      backgroundColor: isCritical ? '#fef2f2' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {s.sensorId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                        }}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {s.name}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      📍 {s.location || 'पाँचपोखरी'}
                    </div>

                    {/* Value readout */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>वर्तमान मापन:</span>
                      <strong style={{ fontSize: '1.1rem', color: statusColor }}>
                        {s.lastValue} {s.unit}
                      </strong>
                    </div>

                    {s.dangerThreshold && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        खतरा थ्रेसहोल्ड: {s.dangerThreshold} {s.unit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Fullscreen Map Overlay Viewport */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top Floating Glassmorphism Bar */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: Palika Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Palika Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>पाँचपोखरी थाङपाल गाउँपालिका</span>
                  <span style={{ fontSize: '10px', background: '#0284c7', padding: '1px 7px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Full Page GIS</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  डिजिटल ट्विन कमान्ड सेन्टर • २D/३D टोपोग्राफी नक्सा
                </div>
              </div>
            </div>

            {/* Middle: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '2px', borderRadius: '6px' }}>
                <button
                  onClick={() => setViewMode('2d')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: viewMode === '2d' ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                  }}
                >
                  २D नक्सा
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: viewMode === '3d' ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                  }}
                >
                  ३D ट्विन
                </button>
              </div>

              {/* Base Layer Switcher in Fullscreen */}
              {viewMode === '2d' && (
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.12)', padding: '2px', borderRadius: '6px', gap: '2px' }}>
                  <button
                    onClick={() => setCurrentBaseLayer('satellite')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: currentBaseLayer === 'satellite' ? '#10b981' : 'transparent',
                      color: '#ffffff',
                      boxShadow: currentBaseLayer === 'satellite' ? '0 1px 4px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="स्याटेलाइट भ्यू सक्रिय गर्नुहोस्"
                  >
                    <span>🛰️ स्याटेलाइट</span>
                  </button>
                  <button
                    onClick={() => setCurrentBaseLayer('streets')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: currentBaseLayer === 'streets' ? '#0284c7' : 'transparent',
                      color: '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                    title="सडक नक्सा सक्रिय गर्नुहोस्"
                  >
                    <span>🗺️ सडक</span>
                  </button>
                  <button
                    onClick={() => setCurrentBaseLayer('topo')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: currentBaseLayer === 'topo' ? '#d97706' : 'transparent',
                      color: '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                    title="टोपो नक्सा सक्रिय गर्नुहोस्"
                  >
                    <span>🏔️ टोपो</span>
                  </button>
                </div>
              )}

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">सबै पूर्वाधार ({counts.all})</option>
                <option value="health_post">स्वास्थ्य सेवा ({counts.health})</option>
                <option value="school">शिक्षा प्रणाली ({counts.school})</option>
                <option value="ward_office">वडा/प्रशासकीय ({counts.wardOffice})</option>
                <option value="viewpoint">पर्यटन सम्पदा ({counts.viewpoint})</option>
                <option value="hotel">होटल/होमस्टे ({counts.hotel})</option>
                <option value="shelter">आश्रयस्थल ({counts.shelter})</option>
                <option value="agriculture">कृषि केन्द्र ({counts.agriculture})</option>
                <option value="complaint">जनगुनासो ({counts.complaint})</option>
                <option value="citizen_service">नागरिक सेवा ({counts.citizenService})</option>
                <option value="ambulance">एम्बुलेन्स ({counts.ambulance})</option>
                <option value="social_care">सामाजिक सुरक्षा ({counts.socialCare})</option>
                <option value="project">विकास आयोजना ({counts.project})</option>
                <option value="building_permit">e-BPS नक्सापास ({counts.buildingPermit})</option>
              </select>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">सबै वडाहरू (१ - ८)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Exit Fullscreen Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={toggleFullscreen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.15s ease',
                }}
                title="फुलपेज बन्द गर्नुहोस् (वा किबोर्डमा Esc थिच्नुहोस्)"
              >
                <Minimize2 size={15} />
                <span>सामान्य दृश्य (Esc)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="fullscreen-leaflet-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <style>{`
              .fullscreen-leaflet-container .leaflet-top {
                top: 72px !important;
              }
            `}</style>
            {viewMode === '2d' ? (
              <PalikaMap
                facilities={filteredFacilities}
                sensors={sensors}
                selectedWard={selectedWard}
                selectedLocation={selectedLocation}
                isPublic={isPublic}
                baseLayer={currentBaseLayer}
                onBaseLayerChange={setCurrentBaseLayer}
                onUpdateLocation={isPublic ? undefined : handleUpdateLocation}
                height="100vh"
                bufferData={bufferMutation.data}
                onSelectLocation={(lat, lng, name) => {
                  setSelectedLocation({ lat, lng, name });
                  setActiveSideTab('simulation');
                }}
              />
            ) : (
              <Terrain3DView
                sensors={sensors}
                height="100vh"
              />
            )}

            {/* Bottom Floating Legend */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '6px 18px',
                fontSize: '11.5px',
                color: '#e2e8f0',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                pointerEvents: 'none',
              }}
            >
              <span style={{ color: '#f87171' }}>● स्वास्थ्य</span>
              <span style={{ color: '#34d399' }}>● शिक्षा</span>
              <span style={{ color: '#38bdf8' }}>● वडा कार्यालय</span>
              <span style={{ color: '#fbbf24' }}>● पर्यटन</span>
              <span style={{ color: '#a78bfa' }}>● होटल ({counts.hotel})</span>
              <span style={{ color: '#818cf8' }}>● व्यवसाय ({businesses.length})</span>
              <span style={{ color: '#10b981' }}>● सार्वजनिक जिन्सी ({assets.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GisMapPage;
