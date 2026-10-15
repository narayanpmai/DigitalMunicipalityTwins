import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  AlertOctagon,
  Bell,
  FolderArchive,
  Download,
  Wifi,
  WifiOff,
  Search,
  MapPin,
  Phone,
  Send,
  Volume2,
  VolumeX,
  Radio,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Shield,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Share2,
  X,
  Compass,
  Flashlight,
  Sliders,
  LifeBuoy,
  FileCheck2,
  CreditCard,
  QrCode,
  Printer,
  Calculator,
  Award,
  Building2,
  Calendar,
  Check,
  RefreshCw,
  Eye,
  Layers,
  ArrowRight,
  Receipt,
  Mountain,
  Bed,
  Navigation
} from 'lucide-react';
import { SIFARISH_TEMPLATES, SifarishTemplate } from '../../features/citizen-services/sifarishTemplates';
import { MobileSifarishModal } from '../../features/citizen-services/components/MobileSifarishModal';
import { TaxCalculatorCard } from '../../features/revenue/components/TaxCalculatorCard';
import { RevenuePaymentModal } from '../../features/revenue/components/RevenuePaymentModal';
import { MalepaReceiptModal } from '../../features/revenue/components/MalepaReceiptModal';
import { OfficialSifarishLetterhead } from '../../features/citizen-services/OfficialSifarishLetterhead';
import { PalikaMap } from '../../components/maps/PalikaMap';
import { SACRED_LAKES_DATA, PANCHPOKHARI_TRAIL_HOTELS, PANCHPOKHARI_WAYPOINTS } from '../../data/panchpokhariTrailData';
import { AMA_YANGRI_WAYPOINTS, AMA_YANGRI_HOTELS } from '../../data/amaYangriTrailData';
import { revenueApi, RevenueRecord } from '../../api/revenue';
import { api } from '../../api/client';

// --- Badapatra Service Interface ---
interface BadapatraService {
  id: number;
  type: 'ward' | 'palika';
  category: string;
  title: string;
  price: string;
  serviceTime: string;
  provider: string;
  official: string;
  room: string;
  document: string;
  remarks?: string;
}

// Fallback embedded essential services
const FALLBACK_SERVICES: BadapatraService[] = [
  {
    id: 1,
    type: 'ward',
    category: 'वडा कार्यालय',
    title: 'नागरिकता प्रमाणपत्रको लागि सिफारिस',
    price: 'रु. १०० (आर्थिक ऐन अनुसार)',
    serviceTime: 'प्रक्रिया पूरा भएमा सोही दिन',
    provider: 'सम्बन्धित वडा कार्यालय (वडा १-८)',
    official: 'वडा अध्यक्ष / वडा सचिव',
    room: 'वडा प्रशासन कक्ष',
    document: '१) जन्म दर्ता प्रमाणपत्र २) बाबु-आमाको नागरिकता प्रमाणपत्रको प्रतिलिपि ३) विवाह दर्ता (विवाहित महिलाको हकमा) ४) बसाइसराइ भए सोको प्रमाणपत्र ५) २ प्रति पासपोर्ट साइजको फोटो।',
    remarks: 'अनलाइन ई-सिफारिस मार्फत मोबाइलबाटै आवेदन दिन सकिन्छ।'
  },
  {
    id: 2,
    type: 'ward',
    category: 'वडा कार्यालय',
    title: 'पारिवारिक नाता प्रमाणित प्रमाणपत्र',
    price: 'रु. २००',
    serviceTime: 'सोही दिन',
    provider: 'सम्बन्धित वडा कार्यालय',
    official: 'वडा अध्यक्ष / वडा सचिव',
    room: 'वडा प्रशासन कक्ष',
    document: '१) निवेदकको नागरिकता २) परिवारका सदस्यहरूको नागरिकता वा जन्मदर्ता प्रतिलिपि ३) पासपोर्ट साइजको फोटो।',
    remarks: 'स्थलगत मुचुल्का पश्चात तत्काल प्रमाणित पत्र जारी हुन्छ।'
  },
  {
    id: 3,
    type: 'ward',
    category: 'वडा कार्यालय',
    title: 'जग्गाधनी दर्ता स्रेस्ता / घरबाटो प्रमाणित सिफारिस',
    price: 'रु. ३००',
    serviceTime: 'सोही दिन',
    provider: 'वडा कार्यालय',
    official: 'वडा अध्यक्ष / प्राविधिक सहायक',
    room: 'वडा प्रशासन कक्ष',
    document: '१) जग्गाधनी दर्ता प्रमाण पुर्जा (लालपुर्जा) २) चालु आ.व. को सम्पत्ति तथा मालपोत कर चुक्ता रसिद ३) नागरिकता प्रमाणपत्रको प्रतिलिपि।',
    remarks: 'बैंक कर्जा प्रयोजनका लागि उपयोगी।'
  },
  {
    id: 4,
    type: 'palika',
    category: 'राजस्व शाखा',
    title: 'एकीकृत सम्पत्ति कर तथा मालपोत कर संकलन',
    price: 'क्षेत्रफल र संरचना अनुसार',
    serviceTime: 'तत्काल अनलाइन',
    provider: 'राजस्व तथा आन्तरिक लेखा शाखा',
    official: 'राजस्व अधिकृत',
    room: 'कोठा नं. १०२ (राजस्व शाखा)',
    document: '१) लालपुर्जा प्रतिलिपि २) अघिल्लो वर्षको कर चुक्ता रसिद ३) नागरिकता प्रतिलिपि।',
    remarks: 'Fonepay QR, eSewa, Khalti, ConnectIPS बाट तत्काल भुक्तानी।'
  },
  {
    id: 5,
    type: 'palika',
    category: 'राजस्व शाखा',
    title: 'व्यवसाय दर्ता तथा नवीकरण प्रमाणपत्र',
    price: 'लगानी अनुसार रु. ५०० देखि ५,०००',
    serviceTime: 'सोही दिन',
    provider: 'गाउँपालिका राजस्व तथा उद्योग शाखा',
    official: 'राजस्व अधिकृत / उद्योग सहायक',
    room: 'कोठा नं. १०२ (राजस्व शाखा)',
    document: '१) व्यवसाय सञ्चालन दरखास्त फारम २) नागरिकता प्रतिलिपि ३) घरबहाल सम्झौता पत्र ४) वडा कार्यालयको सिफारिस।',
    remarks: 'क्युआर कोड सहितको डिजिटल व्यवसाय प्रमाणपत्र जारी गरिन्छ।'
  },
  {
    id: 6,
    type: 'palika',
    category: 'विपद् व्यवस्थापन शाखा',
    title: 'विपद् राहत तथा पुनर्निर्माण सहायता सिफारिस',
    price: 'निःशुल्क',
    serviceTime: 'स्थलगत मुचुल्का पश्चात तत्काल',
    provider: 'गाउँपालिका विपद् व्यवस्थापन सेल',
    official: 'विपद् अधिकृत / प्रमुख प्रशासकीय अधिकृत',
    room: 'आपतकालीन कार्यसञ्चालन केन्द्र (LEOC)',
    document: '१) प्रहरी मुचुल्का प्रतिवेदन २) वडा विपद् व्यवस्थापन समितिको मुचुल्का ३) नागरिकता र क्षति भएको तस्विर ४) बैंक खाता नम्बर।',
    remarks: 'बाढी, पहिरो तथा आगलागी पीडितका लागि प्राथमिकता सेवा।'
  }
];

export const CitizenPwa: React.FC = () => {
  // Main 6-Dock Mobile Navigation
  const [activeTab, setActiveTab] = useState<'charter' | 'sifarish' | 'revenue' | 'trekking' | 'sos' | 'alerts_vault'>(() => {
    const urlTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
    if (urlTab === 'trekking' || urlTab === 'trail' || urlTab === 'gis' || urlTab === 'map') return 'trekking';
    if (urlTab === 'sifarish') return 'sifarish';
    if (urlTab === 'revenue') return 'revenue';
    if (urlTab === 'sos') return 'sos';
    if (urlTab === 'notifications' || urlTab === 'alerts_vault') return 'alerts_vault';
    return 'charter';
  });

  // Mobile Trekking & GIS Map State
  const [trekSelectedLocation, setTrekSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | undefined>(undefined);
  const [trekLiveGps, setTrekLiveGps] = useState<{ lat: number; lng: number; altitude?: number } | null>(null);
  const [trekGpsStatus, setTrekGpsStatus] = useState<string>('');
  const [activeTrekRoute, setActiveTrekRoute] = useState<'panchpokhari' | 'ama_yangri'>('panchpokhari');

  const handleTrackLiveLocation = () => {
    if (!navigator.geolocation) {
      setTrekGpsStatus('यो फोनमा GPS सुविधा उपलब्ध छैन।');
      return;
    }
    setTrekGpsStatus('GPS स्थान खोजी हुँदैछ...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : undefined,
        };
        setTrekLiveGps(coords);
        setTrekSelectedLocation({
          lat: coords.lat,
          lng: coords.lng,
          name: 'मेरो हालको प्रत्यक्ष GPS स्थान',
        });
        setTrekGpsStatus(`📍 GPS प्राप्त भयो (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`);
      },
      (err) => {
        setTrekGpsStatus('GPS प्राप्त हुन सकेन: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [services, setServices] = useState<BadapatraService[]>(FALLBACK_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<BadapatraService | null>(null);

  // --- E-Sifarish State ---
  const [selectedSifarishTemplate, setSelectedSifarishTemplate] = useState<SifarishTemplate | null>(null);
  const [showSifarishModal, setShowSifarishModal] = useState<boolean>(false);
  const [sifarishSearchQuery, setSifarishSearchQuery] = useState('');
  const [selectedSifarishCategory, setSelectedSifarishCategory] = useState<string>('all');

  // Application Tracker State
  const [trackingAppNo, setTrackingAppNo] = useState('');
  const [trackedApp, setTrackedApp] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [previewTrackedApp, setPreviewTrackedApp] = useState<any>(null);

  // --- Mobile Revenue & e-Payment State ---
  const [showMobileTaxPayModal, setShowMobileTaxPayModal] = useState<boolean>(false);
  const [mobileTaxPrefill, setMobileTaxPrefill] = useState({
    revenueHead: 'सम्पत्ति कर (Integrated Property Tax)',
    baseAmount: 15000,
    discountAmount: 1500,
    fineAmount: 0,
    netAmount: 13500,
    details: undefined as any,
  });
  const [mobileReceiptData, setMobileReceiptData] = useState<RevenueRecord | null>(null);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);

  // --- PWA Installation State ---
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // --- SOS Siren Audio Oscillator (Web Audio API) ---
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // --- Strobe Light State ---
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeColor, setStrobeColor] = useState<'red' | 'blue' | 'white'>('red');

  // --- GPS Location State ---
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy: number; time: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // --- Push Notifications State ---
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notificationLog, setNotificationLog] = useState<Array<{ id: string; title: string; body: string; time: string; level: 'critical' | 'info' | 'warning' }>>([
    {
      id: 'notif-1',
      title: '⚠️ मेलम्ची तथा याङ्ग्री नदी जलसतह सतर्कता',
      body: 'माथिल्लो जलाधार क्षेत्रमा भारी वर्षा भइरहेको हुँदा तटीय क्षेत्रका बासिन्दाहरूलाई पूर्वसतर्कता अपनाउन अनुरोध छ।',
      time: '१० मिनेट अगाडि',
      level: 'warning'
    },
    {
      id: 'notif-2',
      title: '📢 आ.व. २०८१/०८२ सामाजिक सुरक्षा भत्ता नवीकरण',
      body: 'सबै वडा कार्यालयहरूमा सामाजिक सुरक्षा भत्ताको बायोमेट्रिक नवीकरण कार्य सुरु भएको छ।',
      time: 'आज बिहान ९:०० बजे',
      level: 'info'
    }
  ]);

  // Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Revenue Records for Mobile User History
  useEffect(() => {
    revenueApi.getRevenueRecords()
      .then(res => setRevenueRecords(((res as any)?.data ?? res) || []))
      .catch(err => console.warn('Revenue records fetch error:', err));
  }, []);

  // Helper to match any Badapatra service to corresponding Sifarish template
  const matchServiceToTemplate = (serviceTitle: string, category: string): SifarishTemplate => {
    const t = serviceTitle.toLowerCase();
    if (t.includes('नागरिकता')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_citizenship') || SIFARISH_TEMPLATES[0];
    if (t.includes('नाता')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_relationship') || SIFARISH_TEMPLATES[0];
    if (t.includes('चार किल्ला') || t.includes('चारकिल्ला') || t.includes('घरबाटो')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_four_boundaries') || SIFARISH_TEMPLATES[0];
    if (t.includes('अविवाहित')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_unmarried') || SIFARISH_TEMPLATES[0];
    if (t.includes('विवाह')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_marriage') || SIFARISH_TEMPLATES[0];
    if (t.includes('विद्युत') || t.includes('बिजुली')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_electricity') || SIFARISH_TEMPLATES[0];
    if (t.includes('खानेपानी') || t.includes('धारा')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_water') || SIFARISH_TEMPLATES[0];
    if (t.includes('व्यवसाय')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_business') || SIFARISH_TEMPLATES[0];
    if (t.includes('विपन्न')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_deprivation') || SIFARISH_TEMPLATES[0];
    if (t.includes('नामसारी') || t.includes('हस्तान्तरण')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_land_transfer') || SIFARISH_TEMPLATES[0];
    if (t.includes('पेन्सन') || t.includes('जीवित')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_life_cert') || SIFARISH_TEMPLATES[0];
    if (t.includes('बसोबास')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_residency') || SIFARISH_TEMPLATES[0];
    if (t.includes('छात्रवृत्ति')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_scholarship') || SIFARISH_TEMPLATES[0];
    if (t.includes('धितो') || t.includes('बन्धकी')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_land_mortgage') || SIFARISH_TEMPLATES[0];
    if (t.includes('कित्ताकाट') || t.includes('अंशबन्डा')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_land_partition') || SIFARISH_TEMPLATES[0];
    if (t.includes('अपाङ्गता')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_disability') || SIFARISH_TEMPLATES[0];
    if (t.includes('ज्येष्ठ नागरिक')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_senior_citizen') || SIFARISH_TEMPLATES[0];
    if (t.includes('कर चुक्ता')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_tax_clearance') || SIFARISH_TEMPLATES[0];
    if (t.includes('राहत') || t.includes('विपद्')) return SIFARISH_TEMPLATES.find(x => x.id === 'sif_disaster_relief') || SIFARISH_TEMPLATES[0];
    return SIFARISH_TEMPLATES[0];
  };

  // Track Sifarish Application
  const handleTrackSifarish = async () => {
    if (!trackingAppNo.trim()) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackedApp(null);
    try {
      const res = await api.get(`/citizen-services/track/${encodeURIComponent(trackingAppNo.trim())}`);
      const data = (res as any)?.data || res;
      setTrackedApp(data);
    } catch (err: any) {
      setTrackingError('उक्त टोकन नम्बर फेला परेन। कृपया टोकन नम्बर (उदा. SVC-2081-00101) पुनः जाँच गर्नुहोस्।');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Filtered Sifarish Templates
  const filteredSifarishTemplates = useMemo(() => {
    return SIFARISH_TEMPLATES.filter((tpl) => {
      const q = sifarishSearchQuery.toLowerCase();
      const matchSearch =
        !q ||
        tpl.title.toLowerCase().includes(q) ||
        tpl.code.toLowerCase().includes(q) ||
        tpl.subject.toLowerCase().includes(q) ||
        tpl.department.toLowerCase().includes(q);

      const matchCat =
        selectedSifarishCategory === 'all' ||
        tpl.category === selectedSifarishCategory;

      return matchSearch && matchCat;
    });
  }, [sifarishSearchQuery, selectedSifarishCategory]);

  // Filtered Badapatra Services
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => set.add(s.category));
    return ['सबै', ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = selectedCategory === 'सबै' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.document.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bookmarkedServices = useMemo(() => {
    return services.filter(s => bookmarkedIds.includes(s.id));
  }, [services, bookmarkedIds]);

  // Voice Readout Helper (TTS)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ne-NP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // SOS Web Audio API Siren Engine
  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      let toggle = false;
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(885, ctx.currentTime);

      sirenIntervalRef.current = setInterval(() => {
        if (toggle) {
          osc1.frequency.setTargetAtTime(880, ctx.currentTime, 0.1);
          osc2.frequency.setTargetAtTime(885, ctx.currentTime, 0.1);
        } else {
          osc1.frequency.setTargetAtTime(1320, ctx.currentTime, 0.1);
          osc2.frequency.setTargetAtTime(1325, ctx.currentTime, 0.1);
        }
        toggle = !toggle;
      }, 350);

      osc1.start();
      osc2.start();
      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gain;
      setIsSirenActive(true);
      setIsStrobeActive(true);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (osc1Ref.current) try { osc1Ref.current.stop(); } catch(e){}
    if (osc2Ref.current) try { osc2Ref.current.stop(); } catch(e){}
    if (audioCtxRef.current) try { audioCtxRef.current.close(); } catch(e){}
    setIsSirenActive(false);
    setIsStrobeActive(false);
  };

  // GPS Dispatcher
  const getGpsCoordinates = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('तपाईंको उपकरणमा GPS सेवा उपलब्ध छैन।');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          time: new Date().toLocaleTimeString('ne-NP')
        });
        setGpsLoading(false);
      },
      err => {
        setGpsError('GPS स्थान प्राप्त गर्न सकिएन। कृपया अनुमति दिनुहोस्।');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '0.5rem 0', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Mobile Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #07193b 0%, #0d2757 100%)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem',
        boxShadow: '0 10px 25px -5px rgba(7, 25, 59, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
              P5
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.5px' }}>
                पाँचपोखरी थाङपाल गाउँपालिका
              </div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>
                नागरिक मोबाइल एप (Citizen PWA)
              </h1>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.25)',
            color: isOnline ? '#86efac' : '#fca5a5',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'अनलाइन' : 'अफलाइन मोड'}</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          ३२+ वडा ई-सिफारिस, डिजिटल कर तथा ई-पेमेन्ट गेटवे र आपतकालीन SOS साइरन (बिना इन्टरनेट पनि चल्ने)
        </p>
      </div>

      {/* 6-Tab Main Mobile Navigation Dock */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.25rem',
        background: '#ffffff',
        padding: '0.4rem 0.25rem',
        borderRadius: '14px',
        border: '1.5px solid #e2e8f0',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'charter', label: 'बडापत्र', sub: '११० सेवा', icon: <FileText size={15} /> },
          { id: 'sifarish', label: 'ई-सिफारिस', sub: '३२+ ढाँचा', icon: <FileCheck2 size={15} /> },
          { id: 'revenue', label: 'डिजिटल कर', sub: 'ई-पेमेन्ट', icon: <Coins size={15} /> },
          { id: 'trekking', label: 'पदमार्ग', sub: '५ कुण्ड र रुट', icon: <Compass size={15} /> },
          { id: 'sos', label: 'आपतकालीन', sub: 'SOS साइरन', icon: <AlertOctagon size={15} /> },
          { id: 'alerts_vault', label: 'सूचना/भल्ट', sub: 'अलर्ट र भल्ट', icon: <Bell size={15} /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 0.15rem',
                borderRadius: '9px',
                border: 'none',
                background: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '0.74rem', fontWeight: 800, marginTop: '0.15rem' }}>{tab.label}</span>
              <span style={{ fontSize: '0.62rem', opacity: isActive ? 0.9 : 0.65, whiteSpace: 'nowrap' }}>{tab.sub}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CITIZEN CHARTER (बडापत्र) */}
      {/* ========================================================================= */}
      {activeTab === 'charter' && (
        <div>
          {/* Search & Category Filter Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="कुनै पनि सेवा खोज्नुहोस् (उदा. नागरिकता, जन्म दर्ता, जग्गा, कर)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.4rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#0284c7' : '#cbd5e1',
                    background: selectedCategory === cat ? '#e0f2fe' : '#ffffff',
                    color: selectedCategory === cat ? '#0369a1' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>फेला परेका सेवाहरू: <strong>{filteredServices.length}</strong> वटा</span>
            <span>📱 अफलाइन क्यास सक्रिय</span>
          </div>

          {/* Services List Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>
            {filteredServices.map(srv => {
              const isBookmarked = bookmarkedIds.includes(srv.id);
              return (
                <div
                  key={srv.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: srv.type === 'ward' ? '#e0f2fe' : '#f3e8ff',
                      color: srv.type === 'ward' ? '#0369a1' : '#7e22ce',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px'
                    }}>
                      {srv.category} • {srv.type === 'ward' ? 'वडा सेवा' : 'पालिका सेवा'}
                    </span>

                    <button
                      onClick={() => toggleBookmark(srv.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? '#0284c7' : '#94a3b8', padding: '0.2rem' }}
                      title={isBookmarked ? 'बुकमार्क हटाइयो' : 'अफलाइन सुरक्षित गर्नुहोस्'}
                    >
                      {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
                    {srv.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.85rem', background: '#f8fafc', padding: '0.65rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Coins size={13} color="#0284c7" />
                      <span>दस्तुर/शुल्क: <strong style={{ color: '#0f172a' }}>{srv.price}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} color="#0284c7" />
                      <span>लाग्ने समय: <strong>{srv.serviceTime}</strong></span>
                    </div>
                  </div>

                  {/* 1-Tap e-Sifarish Apply Button right on card */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedServiceForModal(srv)}
                      style={{
                        flex: 1,
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      विवरण / कागजात
                    </button>

                    <button
                      onClick={() => {
                        const matched = matchServiceToTemplate(srv.title, srv.category);
                        setSelectedSifarishTemplate(matched);
                        setShowSifarishModal(true);
                      }}
                      style={{
                        background: '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FileCheck2 size={14} />
                      <span>ई-सिफारिस</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 32+ WARD E-SIFARISH (३२+ वडा ई-सिफारिस) */}
      {/* ========================================================================= */}
      {activeTab === 'sifarish' && (
        <div>
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <FileCheck2 size={24} color="#7dd3fc" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                ३२+ वडा ई-सिफारिस प्रणाली (e-Sifarish Suite)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#e0f2fe', lineHeight: 1.4 }}>
              स्थानीय सरकार सञ्चालन ऐन, २०७४ को दफा १२(२)(ङ) बमोजिम घरमै बसी अनलाइन दरखास्त, दस्तुर भुक्तानी र डिजिटल प्रमाणित पत्र
            </p>
          </div>

          {/* Application Tracker Box (मेरो सिफारिस स्थिति) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={16} color="#0284c7" />
              <span>मेरो सिफारिस आवेदन ट्र्याकिङ (Track Application Status):</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="टोकन नं. प्रविष्टि गर्नुहोस् (उदा. SVC-2081-00101)..."
                value={trackingAppNo}
                onChange={(e) => setTrackingAppNo(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleTrackSifarish}
                disabled={trackingLoading}
                style={{
                  padding: '0.55rem 1.15rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: trackingLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {trackingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                <span>ट्र्याक</span>
              </button>
            </div>

            {trackingError && (
              <div style={{ marginTop: '0.5rem', color: '#b91c1c', fontSize: '0.78rem' }}>
                {trackingError}
              </div>
            )}

            {/* Tracked App Display Card */}
            {trackedApp && (
              <div
                style={{
                  marginTop: '0.85rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #93c5fd',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.825rem',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                    {trackedApp.applicationNo}
                  </span>
                  <span
                    style={{
                      backgroundColor: trackedApp.status === 'delivered' ? '#dcfce7' : trackedApp.status === 'approved' ? '#e0f2fe' : '#fef3c7',
                      color: trackedApp.status === 'delivered' ? '#15803d' : trackedApp.status === 'approved' ? '#0369a1' : '#b45309',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  >
                    {trackedApp.status === 'delivered' ? 'प्रमाणित जारी (Delivered)' : trackedApp.status === 'approved' ? 'स्वीकृत (Approved)' : 'विचाराधीन (Processing)'}
                  </span>
                </div>
                <div><strong>निवेदक:</strong> {trackedApp.applicantName} (वडा नं. {trackedApp.wardNumber})</div>
                <div><strong>सेवा शीर्षक:</strong> {trackedApp.purpose}</div>
                {trackedApp.certificateNo && <div><strong>दर्ता प्रमाणपत्र नं:</strong> {trackedApp.certificateNo}</div>}
                {trackedApp.dispatchNo && <div><strong>चलानी नं:</strong> {trackedApp.dispatchNo}</div>}

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = matchServiceToTemplate(trackedApp.purpose || '', '');
                      setSelectedSifarishTemplate(matched);
                      setPreviewTrackedApp(trackedApp);
                    }}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FileCheck2 size={13} />
                    <span>डिजिटल सिफारिस पत्र हेर्नुहोस्</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search & Category Filter */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="३२+ वडा सिफारिस खोज्नुहोस् (उदा. नाता, चारकिल्ला, नागरिकता, पेन्सन, कित्ताकाट)..."
                value={sifarishSearchQuery}
                onChange={(e) => setSifarishSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.4rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              {[
                { id: 'all', label: 'सबै (३२+ सिफारिस)' },
                { id: 'recommendation', label: 'नागरिकता / व्यक्तिगत' },
                { id: 'property', label: 'जग्गा तथा घरबाटो' },
                { id: 'business', label: 'व्यवसाय तथा कर' },
                { id: 'social', label: 'सामाजिक तथा सहुलियत' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedSifarishCategory(c.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedSifarishCategory === c.id ? '#0284c7' : '#cbd5e1',
                    background: selectedSifarishCategory === c.id ? '#e0f2fe' : '#ffffff',
                    color: selectedSifarishCategory === c.id ? '#0369a1' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 32+ Sifarish Templates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>
            {filteredSifarishTemplates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>
                      {tpl.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: tpl.feeNpr === 'free' ? '#dcfce7' : '#f1f5f9',
                        color: tpl.feeNpr === 'free' ? '#15803d' : '#475569',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {tpl.feeNpr === 'free' ? 'निःशुल्क' : `दस्तुर: रु. ${tpl.feeNpr}`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                    {tpl.title}
                  </h3>

                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {tpl.legalReference}
                  </p>
                </div>

                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                    समय: <strong>{tpl.timeEstimate}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSifarishTemplate(tpl);
                      setShowSifarishModal(true);
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    <span>आवेदन भर्नुहोस्</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIGITAL REVENUE & E-PAYMENT (डिजिटल कर तथा ई-पेमेन्ट) */}
      {/* ========================================================================= */}
      {activeTab === 'revenue' && (
        <div>
          {/* Top Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #042f2e 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <Coins size={24} color="#5eead4" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                डिजिटल कर तथा ई-पेमेन्ट गेटवे (Mobile e-Tax)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccfbf1', lineHeight: 1.4 }}>
              घरमै बसी सम्पत्ति कर, व्यवसाय कर र मालपोत कर हिसाब गर्नुहोस् र Fonepay, eSewa, Khalti, ConnectIPS बाट तुरुन्त भुक्तानी गर्नुहोस्
            </p>
          </div>

          {/* Interactive Tax Calculator */}
          <TaxCalculatorCard
            onProceedToPayment={(calcDetails) => {
              setMobileTaxPrefill({
                revenueHead: calcDetails.revenueHead,
                baseAmount: calcDetails.baseAmount,
                discountAmount: calcDetails.discountAmount,
                fineAmount: calcDetails.fineAmount,
                netAmount: calcDetails.netAmount,
                details: calcDetails.details,
              });
              setShowMobileTaxPayModal(true);
            }}
          />

          {/* Recent Receipts / Lookup */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={17} color="#0f766e" />
                <span>मेरो कर दाखिला तथा मलेप १०२ रसिदहरू</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                कुल {revenueRecords.length} वटा अभिलेख
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {revenueRecords.slice(0, 5).map((rec) => {
                const rNo = rec.receiptNo || rec.receiptNumber || 'P5-REV-2081-00001';
                const amt = Number(rec.amount || rec.totalAmount || 0);

                return (
                  <div
                    key={rec.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {rec.payerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#0f766e', fontFamily: 'monospace' }}>
                        {rNo} • {rec.revenueHead || rec.type}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.9rem' }}>
                          रु. {amt.toLocaleString('ne-NP')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {rec.paymentGateway || rec.paymentMethod || 'e-Payment'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMobileReceiptData(rec)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#f0fdfa',
                          border: '1px solid #99f6e4',
                          color: '#0f766e',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Printer size={13} />
                        <span>रसिद</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: TREKKING TRAIL, GIS MAP & 5 SACRED LAKES */}
      {/* ========================================================================= */}
      {activeTab === 'trekking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Segmented Multi-Route Selector: Panchpokhari vs Ama Yangri */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.4rem',
              backgroundColor: '#ffffff',
              padding: '0.4rem',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTrekRoute('panchpokhari');
                setTrekSelectedLocation({
                  lat: 28.04185,
                  lng: 85.71747,
                  name: 'पाँचपोखरी ५ पवित्र कुण्डहरू (४,१३५m)',
                });
              }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTrekRoute === 'panchpokhari' ? '#065f46' : 'transparent',
                color: activeTrekRoute === 'panchpokhari' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: activeTrekRoute === 'panchpokhari' ? '0 4px 12px rgba(6,95,70,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🏔️ १. पाँचपोखरी (४,१३५m)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTrekRoute('ama_yangri');
                setTrekSelectedLocation({
                  lat: 28.01425,
                  lng: 85.56929,
                  name: 'आमायाङ्ग्री पिक चुचुरो तथा कुलदेवी छोर्तेन (३,७७१m)',
                });
              }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTrekRoute === 'ama_yangri' ? '#6d28d9' : 'transparent',
                color: activeTrekRoute === 'ama_yangri' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: activeTrekRoute === 'ama_yangri' ? '0 4px 12px rgba(109,40,217,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🚩 २. आमायाङ्ग्री पिक (३,७७१m)</span>
            </button>
          </div>

          {/* Route 1: Panchpokhari Banner */}
          {activeTrekRoute === 'panchpokhari' ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 8px 24px -4px rgba(6, 78, 59, 0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    🏔️ राष्ट्रिय धार्मिक तथा साहसिक गन्तव्य
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.3 }}>
                    काठमाडौँ - पाँचपोखरी पदमार्ग र ५ पवित्र कुण्डहरू
                  </h2>
                </div>
              </div>

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#a7f3d0', lineHeight: 1.45 }}>
                काठमाडौँदेखि सिन्धुपाल्चोकको ४,१३५ मि उचाइमा रहेका ५ वटा पवित्र कुण्ड (भैरव, सरस्वती, सूर्य, गणेश र नाग/तारा) सम्मको आधिकारिक डिजिटल नक्सा र पदमार्ग विवरण।
              </p>

              {/* Quick Metrics Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6ee7b7' }}>🚗 कुल दुरी</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>१०३.५ km</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6ee7b7' }}>🥾 पदयात्रा खण्ड</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>२८.४ km</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6ee7b7' }}>⛰️ सर्वोच्च उचाइ</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>४,१३५ m</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6ee7b7' }}>🌊 पवित्र ताल</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>५ कुण्ड</div>
                </div>
              </div>
            </div>
          ) : (
            /* Route 2: Ama Yangri Banner */
            <div
              style={{
                background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #2e1065 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 8px 24px -4px rgba(109, 40, 217, 0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    🚩 ह्योल्मो कुलदेवी तथा ३६०° हिम-दर्शन
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.3 }}>
                    काठमाडौँ - तार्केघ्याङ - आमायाङ्ग्री पिक पदमार्ग
                  </h2>
                </div>
              </div>

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#ddd6fe', lineHeight: 1.45 }}>
                काठमाडौँदेखि ऐतिहासिक ह्योल्मो बस्ती तार्केघ्याङ हुँदै ३,७७१ मिटर उचाइको पवित्र आमायाङ्ग्री चुचुरो र कुलदेवी छोर्तेनसम्मको डिजिटल नक्सा।
              </p>

              {/* Quick Metrics Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#c4b5fd' }}>🚗 कुल दुरी</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>९०.९ km</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#c4b5fd' }}>🥾 पदयात्रा खण्ड</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>३.८६ km</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#c4b5fd' }}>⛰️ सर्वोच्च उचाइ</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>३,७७१ m</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#c4b5fd' }}>🛕 ह्योल्मो सम्पदा</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>गुम्बा/छोर्तेन</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Navigation Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '0.75rem',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
              {activeTrekRoute === 'panchpokhari' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 28.04185,
                        lng: 85.71747,
                        name: 'पाँचपोखरी ५ पवित्र कुण्डहरू (Sacred Lakes)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      border: '1.5px solid #3b82f6',
                      borderRadius: '10px',
                      color: '#1d4ed8',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>✨ ५ पवित्र कुण्डहरू</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 27.97949,
                        lng: 85.65647,
                        name: 'भोताङ पदमार्ग प्रस्थान विन्दु (Trailhead)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '10px',
                      color: '#047857',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🥾 पदमार्ग खण्ड</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 27.87,
                        lng: 85.55,
                        name: 'काठमाडौँ - पाँचपोखरी समग्र रुट (Overview)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #94a3b8',
                      borderRadius: '10px',
                      color: '#334155',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🚗 पूर्ण रुट</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 28.01425,
                        lng: 85.56929,
                        name: 'आमायाङ्ग्री पिक चुचुरो तथा कुलदेवी छोर्तेन (३,७७१m)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#faf5ff',
                      border: '1.5px solid #7c3aed',
                      borderRadius: '10px',
                      color: '#6d28d9',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🚩 आमायाङ्ग्री चुचुरो (3,771m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 27.99798,
                        lng: 85.55395,
                        name: 'तार्केघ्याङ ऐतिहासिक गुम्बा तथा ह्योल्मो बस्ती (2,600m)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      border: '1.5px solid #3b82f6',
                      borderRadius: '10px',
                      color: '#1d4ed8',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🛕 तार्केघ्याङ गुम्बा</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 28.0006,
                        lng: 85.5670,
                        name: 'झाँक्री डाँडा / चौंरी खर्क (3,100m)',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '10px',
                      color: '#047857',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🌲 झाँक्री डाँडा</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrekSelectedLocation({
                        lat: 27.87,
                        lng: 85.45,
                        name: 'काठमाडौँ - तार्केघ्याङ पूर्ण रुट',
                      });
                    }}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #94a3b8',
                      borderRadius: '10px',
                      color: '#334155',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>🚗 पूर्ण रुट</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleTrackLiveLocation}
                style={{
                  flex: '1 0 auto',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #ef4444',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Navigation size={13} />
                <span>📍 मेरो Live GPS</span>
              </button>
            </div>

            {trekGpsStatus && (
              <div
                style={{
                  fontSize: '0.72rem',
                  padding: '0.4rem 0.65rem',
                  backgroundColor: trekGpsStatus.includes('प्राप्त भयो') ? '#f0fdf4' : '#fffbeb',
                  color: trekGpsStatus.includes('प्राप्त भयो') ? '#15803d' : '#b45309',
                  borderRadius: '8px',
                  border: '1px solid currentColor',
                  fontWeight: 600,
                }}
              >
                {trekGpsStatus}
              </div>
            )}
          </div>

          {/* Embedded Full Interactive GIS Map */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #cbd5e1',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800 }}>
                <Compass size={15} color="#38bdf8" />
                <span>
                  {activeTrekRoute === 'panchpokhari'
                    ? 'पाँचपोखरी ५ कुण्ड भू-सूचना प्रणाली (GIS Map)'
                    : 'आमायाङ्ग्री पिक भू-सूचना प्रणाली (GIS Map)'}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>स्पर्श गरि जुम/सार्नुहोस्</span>
            </div>

            <PalikaMap
              height="480px"
              showTrekkingTrail={true}
              isPublic={true}
              baseLayer="satellite"
              selectedLocation={trekSelectedLocation}
              onSelectLocation={(lat, lng, name) => setTrekSelectedLocation({ lat, lng, name })}
            />
          </div>

          {/* Route Guide Details: Panchpokhari vs Ama Yangri */}
          {activeTrekRoute === 'panchpokhari' ? (
            <>
              {/* 5 Sacred Lakes Guide Cards (५ पवित्र कुण्डहरूको सचित्र विवरण) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    🌊
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                      ५ पवित्र कुण्डहरू (The 5 Sacred Lakes)
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      प्रत्येक कुण्डको विशिष्ट रङको घेरा र धार्मिक महिमा
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {SACRED_LAKES_DATA.map((lake) => (
                    <div
                      key={lake.id}
                      style={{
                        border: `1.5px solid ${lake.color}`,
                        borderRadius: '12px',
                        padding: '0.75rem',
                        backgroundColor: `${lake.color}08`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {lake.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({lake.nameEn})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTrekSelectedLocation({
                              lat: lake.center[0],
                              lng: lake.center[1],
                              name: lake.name,
                            });
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            backgroundColor: lake.color,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <MapPin size={12} />
                          <span>नक्सामा हेर्नुहोस्</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                        <span
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.15rem 0.45rem',
                            fontWeight: 700,
                            color: '#0369a1',
                          }}
                        >
                          ⛰️ {lake.altitudeMeters} मिटर
                        </span>
                        <span
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.15rem 0.45rem',
                            fontWeight: 700,
                            color: '#475569',
                          }}
                        >
                          🚩 {lake.deity}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.4 }}>
                        {lake.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotel & Lodges Directory (पाँचपोखरी होटल, लज र विश्रामस्थल) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    🏨
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                      होटल, लज तथा विश्रामस्थल (Lodges & Hotels)
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      पदमार्गका मुख्य ठाउँहरूमा बसोबास र सम्पर्क फोन
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {PANCHPOKHARI_TRAIL_HOTELS.map((hotel) => (
                    <div
                      key={hotel.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {hotel.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700 }}>
                            📍 {hotel.locationName} • {hotel.altitudeMeters}m ({hotel.typeNepali})
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            सञ्चालक: {hotel.ownerName}
                          </div>
                        </div>

                        <a
                          href={`tel:${hotel.phone}`}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Phone size={13} />
                          <span>कल गर्नुहोस्</span>
                        </a>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.68rem', color: '#475569' }}>
                        <span style={{ backgroundColor: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          🛏️ {hotel.bedCapacity} बेड
                        </span>
                        <span style={{ backgroundColor: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          💰 {hotel.priceRange}
                        </span>
                        {hotel.isOxygenAvailable && (
                          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontWeight: 700 }}>
                            🫁 अक्सिजन उपलब्ध
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          सम्पर्क: {hotel.phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTrekSelectedLocation({
                              lat: hotel.lat,
                              lng: hotel.lng,
                              name: hotel.name,
                            });
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          नक्सामा खोज्नुहोस् →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Route 2: Ama Yangri Heritage, Viewpoint & Hotel Cards */
            <>
              {/* Ama Yangri Cultural & Heritage Highlights */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    🚩
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                      आमायाङ्ग्री सांस्कृतिक तथा प्राकृतिक आकर्षण
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ह्योल्मो कुलदेवी, ऐतिहासिक गुम्बा र ३६०° हिम-पानोरामा
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[
                    {
                      name: 'आमायाङ्ग्री पिक चुचुरो तथा कुलदेवी छोर्तेन',
                      nameEn: 'Ama Yangri Peak Summit & Chhorten',
                      altitude: '३,७७१ मिटर',
                      badge: 'ह्योल्मो कुलदेवी तथा ३६०° हिमदर्शन',
                      color: '#7c3aed',
                      lat: 28.01425,
                      lng: 85.56929,
                      desc: 'ह्योल्मो जातिकी संरक्षक देवीको रूपमा पुजिने पवित्र चुचुरो। यहाँबाट लाङटाङ, जुगल, दोर्जे लाक्पा र गणेश हिमाल आँखै अगाडि देखिन्छन्।',
                    },
                    {
                      name: 'झाँक्री डाँडा / चौंरी खर्क',
                      nameEn: 'Jhankri Danda / Chauri Kharka',
                      altitude: '३,१०० मिटर',
                      badge: 'लालीगुराँस जङ्गल तथा वन्यजन्तु',
                      color: '#059669',
                      lat: 28.0006,
                      lng: 85.5670,
                      desc: 'लालीगुराँस र धुपीको सुगन्धित जङ्गल, कस्तुरी मृग तथा डाँफे विचरण क्षेत्र। वसन्त ऋतुमा राताम्मे गुराँस फुल्छ।',
                    },
                    {
                      name: 'तार्केघ्याङ ऐतिहासिक गुम्बा तथा ह्योल्मो बस्ती',
                      nameEn: 'Tarkeghyang Monastery & Heritage Settlement',
                      altitude: '२,६०० मिटर',
                      badge: 'ह्योल्मो सांस्कृतिक राजधानी',
                      color: '#0284c7',
                      lat: 27.99798,
                      lng: 85.55395,
                      desc: 'सयौँ वर्ष पुरानो ऐतिहासिक तार्केघ्याङ गुम्बा (जिरी गोम्पा), काष्ठकलायुक्त ह्योल्मो घरहरू र पदमार्ग प्रस्थान विन्दु।',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: `1.5px solid ${item.color}`,
                        borderRadius: '12px',
                        padding: '0.75rem',
                        backgroundColor: `${item.color}08`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.nameEn}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTrekSelectedLocation({
                              lat: item.lat,
                              lng: item.lng,
                              name: item.name,
                            });
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            backgroundColor: item.color,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <MapPin size={12} />
                          <span>नक्सामा हेर्नुहोस्</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                        <span
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.15rem 0.45rem',
                            fontWeight: 700,
                            color: item.color,
                          }}
                        >
                          ⛰️ {item.altitude}
                        </span>
                        <span
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.15rem 0.45rem',
                            fontWeight: 700,
                            color: '#475569',
                          }}
                        >
                          ✨ {item.badge}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarkeghyang & Ama Yangri Hotels & Homestays */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    🏨
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                      तार्केघ्याङका होटल तथा ह्योल्मो होमस्टेहरू
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      आमायाङ्ग्री प्रस्थान विन्दु तार्केघ्याङमा बासस्थान र १-ट्याप सम्पर्क
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {AMA_YANGRI_HOTELS.map((hotel) => (
                    <div
                      key={hotel.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {hotel.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6d28d9', fontWeight: 700 }}>
                            📍 {hotel.locationName} • {hotel.altitudeMeters}m ({hotel.typeNepali})
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            सञ्चालक: {hotel.ownerName}
                          </div>
                        </div>

                        <a
                          href={`tel:${hotel.phone}`}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Phone size={13} />
                          <span>कल गर्नुहोस्</span>
                        </a>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.68rem', color: '#475569' }}>
                        <span style={{ backgroundColor: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          🛏️ {hotel.bedCapacity} बेड
                        </span>
                        <span style={{ backgroundColor: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          💰 {hotel.priceRange}
                        </span>
                        {hotel.isOxygenAvailable && (
                          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #bfdbfe', fontWeight: 700 }}>
                            🫁 अक्सिजन क्यान उपलब्ध
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          सम्पर्क: {hotel.phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTrekSelectedLocation({
                              lat: hotel.lat,
                              lng: hotel.lng,
                              name: hotel.name,
                            });
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#7c3aed',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          नक्सामा खोज्नुहोस् →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* High Altitude Safety & Emergency Assistance Card */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#92400e', fontWeight: 800, fontSize: '0.88rem' }}>
              <AlertTriangle size={18} color="#d97706" />
              <span>
                {activeTrekRoute === 'panchpokhari'
                  ? 'पाँचपोखरी उचाइ (AMS) र स्वास्थ्य सुरक्षा'
                  : 'आमायाङ्ग्री चुचुरो (३,७७१m) तीव्र हावाहुरी तथा पूर्वतयारी'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#78350f', lineHeight: 1.45 }}>
              {activeTrekRoute === 'panchpokhari'
                ? 'पाँचपोखरी ४,१३५ मिटर उचाइमा पर्ने भएकाले टाउको दुख्ने वा सास फेर्न गाह्रो भएमा तत्काल होचो स्थानतर्फ ओर्लनुहोस्। प्रशस्त तातो पानी पिउनुहोस्।'
                : 'आमायाङ्ग्री चुचुरोमा तीव्र चिसो हावा चल्ने र पिउने पानीको स्रोत नभएकाले तार्केघ्याङबाटै पर्याप्त पानी र न्यानो ज्याकेट/टोपी बोक्नु अनिवार्य छ।'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <a
                href="tel:011690011"
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Phone size={12} />
                <span>गाउँपालिका LEOC आपतकालीन: ०११-६९००११</span>
              </a>
              <a
                href="tel:100"
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Phone size={12} />
                <span>प्रहरी कन्ट्रोल: १००</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EMERGENCY SOS SIREN & LOCATION DISPATCHER */}
      {/* ========================================================================= */}
      {activeTab === 'sos' && (
        <div>
          {/* Main Siren Controller Card */}
          <div style={{
            background: isSirenActive ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' : '#ffffff',
            color: isSirenActive ? '#ffffff' : '#0f172a',
            borderRadius: '20px',
            border: isSirenActive ? '2px solid #ef4444' : '1px solid #e2e8f0',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: isSirenActive ? '0 0 35px rgba(220, 38, 38, 0.5)' : '0 4px 10px rgba(0,0,0,0.03)',
            transition: 'all 0.3s'
          }}>
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isSirenActive ? 'rgba(0,0,0,0.3)' : '#fee2e2', color: isSirenActive ? '#fecaca' : '#b91c1c', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                <Radio size={14} /> Web Audio API आपतकालीन साइरन (Offline Sound Engine)
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
                {isSirenActive ? '🚨 आपतकालीन साइरन बजिरहेको छ!' : 'आपतकालीन SOS साइरन'}
              </h2>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', opacity: 0.9 }}>
                बाढी, पहिरो, आगलागी वा उद्धार आवश्यक परेमा यो ठूलो आवाजको साइरन बजाउनुहोस्। बिना इन्टरनेट पनि तपाईंको फोनको स्पिकरबाट उच्च ध्वनिको अलार्म बज्नेछ।
              </p>

              <button
                onClick={isSirenActive ? stopSiren : startSiren}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: isSirenActive ? '#ffffff' : '#dc2626',
                  color: isSirenActive ? '#dc2626' : '#ffffff',
                  border: isSirenActive ? '4px solid #fecaca' : 'none',
                  boxShadow: isSirenActive ? '0 0 40px #ffffff' : '0 10px 25px rgba(220, 38, 38, 0.45)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  margin: '0 auto 1.5rem',
                  transition: 'all 0.2s',
                  animation: isSirenActive ? 'pulse 0.6s infinite' : 'none'
                }}
              >
                {isSirenActive ? <VolumeX size={36} /> : <Volume2 size={36} />}
                <span>{isSirenActive ? 'साइरन बन्द' : 'SOS साइरन'}</span>
              </button>
            </div>
          </div>

          {/* GPS Location Dispatcher */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  मेरो प्रत्यक्ष GPS स्थान (Live Rescue Coordinates)
                </h3>
              </div>
              <button
                onClick={getGpsCoordinates}
                disabled={gpsLoading}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: gpsLoading ? 'wait' : 'pointer'
                }}
              >
                {gpsLoading ? 'खोजी हुँदै...' : 'पुनः स्थान पत्ता लगाउनुहोस्'}
              </button>
            </div>

            {gpsLocation ? (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  <div>अक्षांश (Latitude): <strong>{gpsLocation.lat.toFixed(6)}° N</strong></div>
                  <div>देशान्तर (Longitude): <strong>{gpsLocation.lng.toFixed(6)}° E</strong></div>
                  <div>सटीकता: <strong>± {gpsLocation.accuracy}m</strong></div>
                </div>
              </div>
            ) : (
              <button
                onClick={getGpsCoordinates}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  fontSize: '0.88rem',
                  color: '#0369a1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <MapPin size={18} /> १-ट्याप GPS स्थान लिङ्क निकाल्नुहोस्
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ALERTS & OFFLINE VAULT (सूचना, बाढी पूर्वचेतावनी र अफलाइन भल्ट) */}
      {/* ========================================================================= */}
      {activeTab === 'alerts_vault' && (
        <div>
          {/* Notification Feed List */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Bell size={18} color="#0284c7" /> मेलम्ची तथा याङ्ग्री जलाधार सतर्कता तथा सूचनाहरू
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notificationLog.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${item.level === 'critical' ? '#ef4444' : item.level === 'warning' ? '#f59e0b' : '#0284c7'}`,
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>{item.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarked Offline Services */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FolderArchive size={18} color="#0284c7" /> अफलाइन सुरक्षित गरिएका सेवाहरू ({bookmarkedServices.length})
            </h3>

            {bookmarkedServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Bookmark size={28} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                <div>कुनै सेवा बुकमार्क गरिएको छैन।</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {bookmarkedServices.map(srv => (
                  <div
                    key={srv.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{srv.title}</span>
                      <button onClick={() => toggleBookmark(srv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7' }}>
                        <BookmarkCheck size={18} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      <strong>आवश्यक कागजात:</strong> {srv.document}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERVICE DETAIL MODAL (With 1-Tap e-Sifarish Button) */}
      {/* ========================================================================= */}
      {selectedServiceForModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {selectedServiceForModal.category} • {selectedServiceForModal.type === 'ward' ? 'वडा सेवा' : 'गाउँपालिका सेवा'}
                </span>
                <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  {selectedServiceForModal.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedServiceForModal(null)}
                style={{ background: '#f1f5f9', border: 'none', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.15rem', fontSize: '0.82rem' }}>
              <div>दस्तुर/शुल्क: <strong style={{ color: '#0284c7' }}>{selectedServiceForModal.price}</strong></div>
              <div>लाग्ने समय: <strong>{selectedServiceForModal.serviceTime}</strong></div>
              <div>सेवा दिने निकाय: <strong>{selectedServiceForModal.provider}</strong></div>
              <div>जिम्मेवार अधिकारी: <strong>{selectedServiceForModal.official}</strong></div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
                📋 आवश्यक प्रमाण तथा कागजातहरू:
              </h4>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem', borderRadius: '10px', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
                {selectedServiceForModal.document}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  toggleBookmark(selectedServiceForModal.id);
                  setSelectedServiceForModal(null);
                }}
                style={{
                  flex: 1,
                  background: bookmarkedIds.includes(selectedServiceForModal.id) ? '#f1f5f9' : '#0284c7',
                  color: bookmarkedIds.includes(selectedServiceForModal.id) ? '#0f172a' : '#fff',
                  border: '1px solid #cbd5e1',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {bookmarkedIds.includes(selectedServiceForModal.id) ? '✓ सुरक्षित छ' : '🔖 अफलाइन सुरक्षित गर्नुहोस्'}
              </button>

              <button
                onClick={() => {
                  const matched = matchServiceToTemplate(selectedServiceForModal.title, selectedServiceForModal.category);
                  setSelectedServiceForModal(null);
                  setSelectedSifarishTemplate(matched);
                  setShowSifarishModal(true);
                }}
                style={{
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FileCheck2 size={16} />
                <span>ई-सिफारिस दरखास्त</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SIFARISH APPLICATION MODAL */}
      {/* ========================================================================= */}
      <MobileSifarishModal
        template={selectedSifarishTemplate}
        isOpen={showSifarishModal}
        onClose={() => setShowSifarishModal(false)}
        onSuccess={(app) => {
          setTrackingAppNo(app.applicationNo);
          setTrackedApp(app);
        }}
      />

      {/* ========================================================================= */}
      {/* MOBILE TAX E-PAYMENT MODAL */}
      {/* ========================================================================= */}
      <RevenuePaymentModal
        isOpen={showMobileTaxPayModal}
        onClose={() => setShowMobileTaxPayModal(false)}
        revenueHead={mobileTaxPrefill.revenueHead}
        baseAmount={mobileTaxPrefill.baseAmount}
        discountAmount={mobileTaxPrefill.discountAmount}
        fineAmount={mobileTaxPrefill.fineAmount}
        netAmount={mobileTaxPrefill.netAmount}
        taxAssessmentDetails={mobileTaxPrefill.details}
        onPaymentSuccess={(newRec) => {
          setShowMobileTaxPayModal(false);
          setMobileReceiptData(newRec);
          setRevenueRecords(prev => [newRec, ...prev]);
        }}
      />

      {/* ========================================================================= */}
      {/* MALEPA 102 RECEIPT MODAL */}
      {/* ========================================================================= */}
      <MalepaReceiptModal
        receipt={mobileReceiptData}
        isOpen={!!mobileReceiptData}
        onClose={() => setMobileReceiptData(null)}
      />

      {/* ========================================================================= */}
      {/* PREVIEW TRACKED APPLICATION LETTERHEAD */}
      {/* ========================================================================= */}
      {previewTrackedApp && selectedSifarishTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', padding: '0.75rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setPreviewTrackedApp(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
              >
                बन्द गर्नुहोस् ✕
              </button>
            </div>
            <OfficialSifarishLetterhead
              template={selectedSifarishTemplate}
              applicantData={{
                applicantName: previewTrackedApp.applicantName,
                applicantPhone: previewTrackedApp.applicantPhone,
                wardNumber: previewTrackedApp.wardNumber,
                purpose: previewTrackedApp.purpose,
                applicationNo: previewTrackedApp.applicationNo,
                certificateNo: previewTrackedApp.certificateNo || `PPK-SIF-${previewTrackedApp.wardNumber}-2081-0042`,
                dispatchNo: previewTrackedApp.dispatchNo || '342',
                status: previewTrackedApp.status,
                formData: previewTrackedApp.formData || {},
              }}
              onClose={() => setPreviewTrackedApp(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPwa;
