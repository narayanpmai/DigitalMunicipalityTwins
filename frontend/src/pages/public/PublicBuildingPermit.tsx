import React, { useState, useMemo, useEffect } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Building2,
  Search,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Compass,
  Coins,
  MapPin,
  Calendar,
  User,
  Phone,
  CreditCard,
  Ruler,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Eye,
  Plus,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  QrCode,
  LocateFixed,
  Send,
  X,
  Layers,
  Sparkles,
  Info,
  Printer,
  HardHat,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingPermit, BuildingPermitPage, WORKFLOW_STAGES, BUILDING_CLASSES, USAGE_TYPES, STRUCTURE_TYPES } from '../../features/building-permit/BuildingPermitPage';

export const CAD_VERSIONS = [
  'AutoCAD 2024 (.dwg)',
  'AutoCAD 2023 (.dwg)',
  'AutoCAD 2022 (.dwg)',
  'AutoCAD 2021 (.dwg)',
  'AutoCAD 2020 (.dwg)',
  'AutoCAD 2018 (.dwg)',
  'AutoCAD 2016 (.dwg)',
];

export const STRUCTURAL_SOFTWARE_TYPES = [
  'ETABS (.edb)',
  'SAP2000 (.sdb)',
  'STAAD.Pro (.std)',
  'अन्य प्राविधिक सफ्टवेयर',
];

export const OWNERSHIP_TYPES = [
  'आफ्नै (Self-Owned)',
  'भाडाको जग्गा (Leased Land)',
  'पारिवारिक / मन्जुरीनामा (Family / PoA)',
];

export type EBPSPublicTab = 'admin' | 'track' | 'apply' | 'notices' | 'calculator' | 'verify';

export const PublicBuildingPermit: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');

  const getInitialTab = (): EBPSPublicTab => {
    if (queryTab && ['track', 'apply', 'notices', 'calculator', 'verify'].includes(queryTab)) {
      return queryTab as EBPSPublicTab;
    }
    // Default to 'track' for citizen portal
    return 'track';
  };

  const [activeTab, setActiveTab] = useState<EBPSPublicTab>(getInitialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['track', 'apply', 'notices', 'calculator', 'verify'].includes(tab)) {
      setActiveTab(tab as EBPSPublicTab);
    } else if (!tab) {
      setActiveTab('track');
    }
  }, [searchParams]);

  const handleTabChange = (tabId: EBPSPublicTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (activeTab === 'apply' && !isAuthenticated) {
      alert('तपाईंले ई-नक्सा पासमा आवेदन दिनको लागि पहिले दर्ता (Register) गर्नुपर्दछ।');
      navigate('/register');
    }
  }, [activeTab, isAuthenticated, navigate]);

  // ── Track Tab State ──────────────────────────────────────────────────────────
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackedPermit, setTrackedPermit] = useState<BuildingPermit | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // ── 15-Day Notice / Objection Modal State ─────────────────────────────────────
  const [selectedNoticeForObjection, setSelectedNoticeForObjection] = useState<BuildingPermit | null>(null);
  const [objectionForm, setObjectionForm] = useState({
    claimantName: '',
    claimantPhone: '',
    claimantCitizenship: '',
    relationToProperty: 'साँध-सिमानाको छिमेकी',
    boundarySide: 'पूर्व',
    reason: '',
  });

  // ── Verification Tab State ──────────────────────────────────────────────────
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifiedPermit, setVerifiedPermit] = useState<BuildingPermit | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // ── Fee Calculator Tab State ────────────────────────────────────────────────
  const [calcClass, setCalcClass] = useState('ख वर्ग (B - पेशागत / Engineered Design / RCC)');
  const [calcUsage, setCalcUsage] = useState('आवासीय (Residential)');
  const [calcPlinth, setCalcPlinth] = useState(1000);
  const [calcFloors, setCalcFloors] = useState(2.5);

  const calculatedFee = useMemo(() => {
    const totalArea = calcPlinth * calcFloors;
    let rate = 10.0;
    let svc = 1500;
    if (calcClass.includes('क वर्ग') || calcUsage.includes('व्यापारिक')) {
      rate = 14.0;
      svc = 2500;
    } else if (calcClass.includes('ग वर्ग')) {
      rate = 7.0;
      svc = 1000;
    } else if (calcClass.includes('घ वर्ग')) {
      rate = 4.0;
      svc = 500;
    }
    const total = Math.round(totalArea * rate + svc);
    return { totalArea, rate, svc, total };
  }, [calcClass, calcUsage, calcPlinth, calcFloors]);

  // ── Apply Wizard State ───────────────────────────────────────────────────────
  const [applyStep, setApplyStep] = useState(1);
  const [applySuccessData, setApplySuccessData] = useState<BuildingPermit | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    landOwnerName: '',
    applicantName: '',
    applicantPhone: '',
    applicantCitizenship: '',
    wardNumber: 3,
    toleAddress: '',
    sheetNo: '२३-क-०१',
    kittaNo: '',
    landAreaRopani: '०-६-२-०',
    eastBoundary: '',
    westBoundary: '',
    northBoundary: '',
    southBoundary: '',
    buildingClass: 'ख वर्ग (B - पेशागत / Engineered Design / RCC)',
    usageType: 'आवासीय (Residential)',
    structureType: 'आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)',
    totalFloors: 2.5,
    plinthAreaSqFt: 1000,
    roadWidthFt: 20.0,
    setbackFrontFt: 5.0,
    setbackRearFt: 3.0,
    setbackSideFt: 3.0,
    farRatio: 1.5,
    groundCoveragePct: 55.0,
    gpsLat: 27.93412,
    gpsLon: 85.60218,
    designerName: '',
    necLicenseNo: '',
    // ── मार्गदर्शन २०८२ Fields ──
    ownershipType: 'आफ्नै (Self-Owned)',
    leasePeriodYears: 10,
    relationshipToOwner: 'जग्गाधनी स्वयम्',
    cadVersion: 'AutoCAD 2021 (.dwg)',
    structuralModelType: 'ETABS (.edb)',
    hasStructuralDrawing: 'हो (NBC 105:2020)',
  });

  // Fetch Public Tenders / Building Permits
  const { data: permits = [], isLoading } = useQuery<BuildingPermit[]>({
    queryKey: ['public-building-permits'],
    queryFn: async () => {
      const res: any = await api.get('/building-permits');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Track Application Query / Action
  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTrackError(null);
    const q = trackSearchQuery.trim().toLowerCase();
    if (!q) return;
    const found = permits.find(
      (p) =>
        (p.applicationNo && p.applicationNo.toLowerCase() === q) ||
        (p.kittaNo && p.kittaNo.toString() === q) ||
        (p.applicantPhone && p.applicantPhone.includes(q))
    );
    if (found) {
      setTrackedPermit(found);
    } else {
      setTrackedPermit(null);
      setTrackError(`"${trackSearchQuery}" दर्ता नम्बर वा कित्ता नम्बर भएको कुनै दरखास्त फेला परेन। कृपया पुनः जाँच गर्नुहोस्।`);
    }
  };

  // Verify Certificate Action
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerifyError(null);
    const q = verifyQuery.trim().toLowerCase();
    if (!q) return;
    const found = permits.find(
      (p) =>
        (p.certificateNo && p.certificateNo.toLowerCase() === q) ||
        (p.applicationNo && p.applicationNo.toLowerCase() === q) ||
        (p.qrCode && p.qrCode.toLowerCase().includes(q))
    );
    if (found) {
      setVerifiedPermit(found);
    } else {
      setVerifiedPermit(null);
      setVerifyError(`"${verifyQuery}" नम्बरको कुनै आधिकारिक निर्माण सम्पन्न वा नक्सा पास प्रमाणपत्र पालिकाको डिजिटल अभिलेखमा फेला परेन।`);
    }
  };

  // Submit Public Application Mutation
  const applyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const liveTotal = Math.round(
        payload.plinthAreaSqFt * payload.totalFloors * (payload.buildingClass.includes('क वर्ग') ? 14 : 10) + 1500
      );
      const body = {
        ...payload,
        fourBoundaries: {
          east: payload.eastBoundary,
          west: payload.westBoundary,
          north: payload.northBoundary,
          south: payload.southBoundary,
        },
        totalBuiltAreaSqFt: payload.plinthAreaSqFt * payload.totalFloors,
        permitFee: liveTotal,
      };
      const res: any = await api.post('/building-permits', body);
      return res.data || res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-building-permits'] });
      setApplySuccessData(data);
    },
    onError: () => {
      alert('दरखास्त पेश गर्न असफल भयो। कृपया सबै अनिवार्य फिल्डहरू रुजु गर्नुहोस्।');
    },
  });

  // File Objection Mutation
  const objectionMutation = useMutation({
    mutationFn: async ({ permitId, data }: { permitId: string; data: any }) => {
      return api.post(`/building-permits/${permitId}/objections`, data);
    },
    onSuccess: () => {
      alert('तपाईंको दाबी-विरोध / उजुरी सफलतापूर्वक दर्ता भयो। पालिकाको प्राविधिक तथा न्यायिक समितिले यस विषयमा सर्जमिन तथा सुनुवाइ गर्नेछ।');
      setSelectedNoticeForObjection(null);
      queryClient.invalidateQueries({ queryKey: ['public-building-permits'] });
    },
  });

  // GPS Auto-detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('ब्राउजरमा Geolocation उपलब्ध छैन।');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lon = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy * 10) / 10;
        setFormData((prev) => ({ ...prev, gpsLat: lat, gpsLon: lon }));
        setGpsAccuracy(`±${acc} मिटर (सटीक)`);
        setGpsDetecting(false);
      },
      () => {
        setGpsDetecting(false);
        alert('GPS स्थान लिन सकिएन।');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Instant Scrutiny Check for Wizard Step 3
  const scrutinyPreview = useMemo(() => {
    const road = Number(formData.roadWidthFt) || 0;
    const front = Number(formData.setbackFrontFt) || 0;
    const rear = Number(formData.setbackRearFt) || 0;
    const side = Number(formData.setbackSideFt) || 0;
    const cov = Number(formData.groundCoveragePct) || 0;
    const far = Number(formData.farRatio) || 0;

    return {
      roadPass: road >= 14,
      frontPass: front >= (road >= 20 ? 5 : 4.5),
      rearPass: rear >= 3,
      sidePass: side >= 3,
      covPass: cov <= (formData.buildingClass.includes('क वर्ग') ? 50 : 60),
      farPass: far <= 2.0,
    };
  }, [formData.roadWidthFt, formData.setbackFrontFt, formData.setbackRearFt, formData.setbackSideFt, formData.groundCoveragePct, formData.farRatio, formData.buildingClass]);

  return (
    <div style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e1b4b 75%, #312e81 100%)',
          color: '#ffffff',
          padding: '2.5rem 1.5rem 4.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1040px', margin: '0 auto' }}>
          
          {/* Top Bar: Guidance 2082 Compliance Tag & Subtle Staff Login */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '20px', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 800 }}>
              <Sparkles size={14} color="#6ee7b7" />
              <span>भवन निर्माण मार्गदर्शन, २०८२ स्वीकृत (NBC 105:2020 Certified)</span>
            </div>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              title="पालिका प्राविधिक तथा अधिकृतहरूको प्रशासनिक कन्सोल"
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                color: '#e0e7ff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
              }}
            >
              <ShieldCheck size={14} color="#a5b4fc" />
              <span>🔐 प्राविधिक / कर्मचारी लगइन (Staff Portal)</span>
            </button>
          </div>

          {/* Portal Title Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.22)', padding: '0.4rem 1.1rem', borderRadius: '24px', color: '#c7d2fe', fontWeight: 700, fontSize: '0.84rem', marginBottom: '1rem', border: '1px solid rgba(165, 180, 252, 0.35)' }}>
            <Layers size={15} /> पाँचपोखरी थाङपाल गाउँपालिका — डिजिटल घर-नक्सा पास प्रणाली (e-BPS)
          </div>

          {/* Main Hero Heading */}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.85rem 0', lineHeight: 1.25, letterSpacing: '-0.025em', color: '#ffffff' }}>
            घर-नक्सा अनलाइन दरखास्त तथा डिजिटल प्रमाणीकरण
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 auto 2rem', maxWidth: '760px' }}>
            नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) र भवन निर्माण मार्गदर्शन, २०८२ बमोजिम घर-नक्सा पेश, प्रत्यक्ष फाइल ट्र्याकिङ, १५ दिने सार्वजनिक सूचना र डिजिटल निर्माण सम्पन्न प्रमाणपत्र।
          </p>

          {/* ── Citizen Instant Tracking Search Box ── */}
          <div style={{ maxWidth: '680px', margin: '0 auto 1.75rem', position: 'relative' }}>
            <form
              onSubmit={(e) => {
                handleTrackSearch(e);
                handleTabChange('track');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: '50px',
                padding: '6px 8px 6px 1.25rem',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
                border: '2px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <Search size={20} color="#4f46e5" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="दर्ता नं. (उदा: BPS-2081-001), कित्ता नं. वा फोन नम्बर हाल्नुहोस्..."
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '0.8rem 1.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(49, 46, 129, 0.4)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>स्थिति खोज्नुहोस्</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* ── Focused Citizen Action CTAs ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleTabChange('apply')}
              style={{
                padding: '0.85rem 1.85rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={20} />
              <span>+ नयाँ घर-नक्सा दरखास्त पेश गर्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('calculator')}
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
            >
              <Coins size={18} color="#fcd34d" />
              <span>नक्सा दस्तुर क्यालकुलेटर</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/engineers-directory')}
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
            >
              <HardHat size={18} color="#93c5fd" />
              <span>इन्जिनियर रोस्टर</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/gis-map?filter=building_permit')}
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
            >
              <Compass size={18} color="#67e8f9" />
              <span>GIS नक्सा</span>
            </button>
          </div>

          {/* ── 3 Key Features of Guidance 2082 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: 800, fontSize: '0.8rem' }}>
                  १
                </div>
                <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>अस्थायी प्रथम चरण (DPC)</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                स्वीकृत नक्सा अनुसार सडक सेटब्याक कायम गरी प्लिन्थ (DPC) निर्माणका लागि ७० दिने अस्थायी इजाजत।
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7', fontWeight: 800, fontSize: '0.8rem' }}>
                  २
                </div>
                <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>दोस्रो चरण (Super Structure)</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                स्थलगत जाँच तथा ETABS/SAP स्ट्रक्चरल डक्टाइल डिटेलिङ परीक्षणपछि सुपरस्ट्रक्चर निर्माण अनुमति।
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcd34d', fontWeight: 800, fontSize: '0.8rem' }}>
                  ३
                </div>
                <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>आंशिक निर्माण सम्पन्न प्रमाणपत्र</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                तल्लो तला सम्पन्न भई बसोबास योग्य भएमा मार्गदर्शन २०८२ परिच्छेद ५ बमोजिम तत्काल आंशिक BCC जारी।
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Navigation Bar (6 Tabs) ────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '-2rem 0 0 0', padding: '0 0.5rem', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            padding: '0.6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {([
            { id: 'track', label: '🔍 नक्सा पास ट्र्याकिङ', desc: 'दर्ता स्थिति हेर्नुहोस्' },
            { id: 'apply', label: '📝 अनलाइन दरखास्त', desc: 'नयाँ नक्सा पेश गर्नुहोस्', badge: 'नयाँ' },
            { id: 'notices', label: '📢 १५ दिने सूचना बोर्ड', desc: 'साँध-सिमाना दाबी-विरोध' },
            { id: 'calculator', label: '🧮 दस्तुर क्यालकुलेटर', desc: 'नक्सा पास शुल्क हिसाब' },
            { id: 'verify', label: '🛡️ प्रमाणपत्र प्रमाणीकरण', desc: 'QR तथा BCC रुजु' },
          ] as { id: string; label: string; desc: string; badge?: string }[]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#334155',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === tab.id ? '0 4px 14px rgba(49, 46, 129, 0.25)' : 'none',
                position: 'relative',
              }}
            >
              {tab.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    background: activeTab === tab.id ? '#10b981' : '#eff6ff',
                    color: activeTab === tab.id ? '#ffffff' : '#2563eb',
                    border: `1px solid ${activeTab === tab.id ? '#059669' : '#bfdbfe'}`,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '8px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
              <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{tab.label}</div>
              <div style={{ fontSize: '0.72rem', opacity: activeTab === tab.id ? 0.9 : 0.65, marginTop: '2px' }}>
                {tab.desc}
              </div>
            </button>
          ))}
        </div>

        {/* ── TAB: ई-नक्सा एडमिन ड्यासबोर्ड (Protected Engineer/Admin Console) ── */}
        {activeTab === 'admin' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                padding: '2.5rem 2rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
                borderRadius: '16px',
                color: '#ffffff',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <ShieldCheck size={32} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                🏛️ ई-नक्सा आधिकारिक प्राविधिक प्यानल (Municipal e-BPS Admin)
              </h3>
              <p style={{ color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 1.5rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
                यो खण्ड नक्सा पास स्वीकृति, स्थलगत जाँच (Site Inspection), NBC 105:2020 सुपरिवेक्षण तथा प्रमाणपत्र जारी गर्नका लागि पालिकाका आधिकारिक इन्जिनियर तथा प्राविधिक कर्मचारीका लागि मात्र सीमित गरिएको छ।
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('track')}
                  style={{
                    padding: '0.65rem 1.4rem',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🔍 नागरिक नक्सा ट्र्याकिङमा फर्कनुहोस्
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=/app/ebps-admin')}
                  style={{
                    padding: '0.65rem 1.4rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ExternalLink size={16} /> कर्मचारी/इन्जिनियर लगइन गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 1: नक्सा पास स्थिति ट्र्याकिङ (Live Tracking) ─────────── */}
        {activeTab === 'track' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                घर-नक्सा दरखास्तको प्रत्यक्ष स्थिति (Live Application Tracker)
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                तपाईंको दरखास्त दर्ता नम्बर (उदा: <strong>BPS-2081-001</strong>), कित्ता नम्बर वा मोबाइल नम्बर प्रविष्ट गर्नुहोस्।
              </p>

              <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <Search size={18} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="दर्ता नं (BPS-2081-001) वा कित्ता नम्बर हाल्नुहोस्..."
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: '#312e81',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  ट्र्याक गर्नुहोस् (Track Now)
                </button>
              </form>

              {trackError && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> {trackError}
                </div>
              )}

              {trackedPermit && (
                <div style={{ marginTop: '2rem', borderTop: '1.5px solid #f1f5f9', paddingTop: '1.75rem' }}>
                  {/* Status Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '1.5px solid #93c5fd',
                      padding: '1.25rem',
                      borderRadius: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>
                        दरखास्त दर्ता नं: {trackedPermit.applicationNo}
                      </span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a', margin: '2px 0 0 0' }}>
                        {trackedPermit.landOwnerName} — {trackedPermit.usageType}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#2563eb', marginTop: '3px' }}>
                        वडा नं: {trackedPermit.wardNumber} | कित्ता नं: {trackedPermit.kittaNo} | दर्ता मिति: {trackedPermit.applicationDateBs || '२०८१/०५/०१'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '20px', background: '#ffffff', border: '1.5px solid #60a5fa', color: '#1d4ed8', fontWeight: 800, fontSize: '0.85rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
                        {trackedPermit.status}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        रसिद नं: {trackedPermit.receiptNo}
                      </div>
                    </div>
                  </div>

                  {/* 6-Stage Visual Workflow Stepper */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginBottom: '1rem' }}>
                      नक्सा पास प्रकृया चरण (Workflow Pipeline Progress):
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                      {WORKFLOW_STAGES.map((stage, idx) => {
                        const curIdx = WORKFLOW_STAGES.findIndex((s) => s === trackedPermit.status || trackedPermit.status.includes(s));
                        const isDone = curIdx >= idx;
                        const isCurrent = curIdx === idx;

                        return (
                          <div
                            key={stage}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '10px',
                              background: isCurrent ? '#312e81' : isDone ? '#f0fdf4' : '#f8fafc',
                              color: isCurrent ? '#ffffff' : isDone ? '#15803d' : '#94a3b8',
                              border: isCurrent ? '1.5px solid #312e81' : isDone ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>चरण {idx + 1}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 800 : 600, marginTop: '2px' }}>
                              {isDone && !isCurrent ? '✓ ' : ''}{stage}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>जग्गा तथा ठेगाना</strong>
                      <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>वडा / टोल: <strong>{trackedPermit.wardNumber} / {trackedPermit.toleAddress || 'पालिका क्षेत्र'}</strong></div>
                        <div>कित्ता नं: <strong>{trackedPermit.kittaNo}</strong> (सिट नं: {trackedPermit.sheetNo || '-'})</div>
                        <div>क्षेत्रफल: <strong>{trackedPermit.landAreaRopani || trackedPermit.landArea}</strong></div>
                        <div>सडक चौडाइ: <strong>{trackedPermit.roadWidthFt} फिट</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>भवन तथा इन्जिनियरिङ</strong>
                      <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>वर्ग / प्रयोग: <strong>{trackedPermit.buildingClass?.slice(0, 7)} / {trackedPermit.usageType}</strong></div>
                        <div>तला / संरचना: <strong>{trackedPermit.totalFloors} तला / {trackedPermit.structureType}</strong></div>
                        <div>प्लिन्थ / कुल निर्मित: <strong>{trackedPermit.plinthAreaSqFt} / {trackedPermit.totalBuiltAreaSqFt} sq.ft</strong></div>
                        <div>डिजाइनर: <strong>{trackedPermit.designerName || '-'}</strong> (NEC: {trackedPermit.necLicenseNo || '-'})</div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>दस्तुर तथा १५ दिने सूचना</strong>
                      <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>नक्सा पास दस्तुर: <strong style={{ color: '#15803d' }}>रु. {Number(trackedPermit.permitFee || 0).toLocaleString('ne-NP')}</strong></div>
                        <div>१५ दिने सूचना मिति: <strong>{trackedPermit.publicNoticeDateBs || 'जारी हुन बाँकी'}</strong></div>
                        <div>सर्जमिन सम्पन्न: <strong>{trackedPermit.sarjaminDateBs || 'प्रकृयामा'}</strong></div>
                        <div>प्रमाणपत्र नं: <strong style={{ color: '#2563eb' }}>{trackedPermit.certificateNo || 'स्वीकृत हुन बाँकी'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {trackedPermit.technicalReport && (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '10px', fontSize: '0.82rem', color: '#1e40af', marginBottom: '1.5rem' }}>
                      <strong>प्राविधिक स्थलगत प्रतिवेदन / कैफियत:</strong> {trackedPermit.technicalReport}
                    </div>
                  )}

                  {/* Action Buttons: Certificate Download & GIS Map Location */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    {trackedPermit.certificateNo && (
                      <button
                        onClick={() => alert(`आधिकारिक डिजिटल प्रमाणपत्र डाउनलोड हुँदैछ:\n${trackedPermit.certificateNo}`)}
                        style={{
                          padding: '0.85rem 1.75rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                        }}
                      >
                        <Download size={18} /> आधिकारिक निर्माण प्रमाणपत्र डाउनलोड गर्नुहोस् ({trackedPermit.certificateNo})
                      </button>
                    )}
                    {trackedPermit.gpsLat && (
                      <button
                        onClick={() => navigate(`/gis-map?filter=building_permit&ward=${trackedPermit.wardNumber}`)}
                        style={{
                          padding: '0.85rem 1.75rem',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                        }}
                      >
                        <Compass size={18} /> 🗺️ डिजिटल ट्विन नक्सामा भवन हेर्नुहोस्
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: अनलाइन नक्सा दरखास्त (Online Application Wizard) ───── */}
        {applyStep && activeTab === 'apply' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              {applySuccessData ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <CheckCircle2 size={42} />
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#166534', margin: '0 0 0.5rem 0' }}>
                    घर-नक्सा दरखास्त सफलतापूर्वक दर्ता भयो!
                  </h2>
                  <p style={{ fontSize: '1rem', color: '#475569', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                    तपाईंको दरखास्त नम्बर <strong>{applySuccessData.applicationNo}</strong> कायम भएको छ। पालिकाको प्राविधिक शाखाले कागजात रुजु गरी १५ दिने सूचना जारी गर्नेछ।
                  </p>
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '12px', display: 'inline-block', textAlign: 'left', marginBottom: '2rem' }}>
                    <div>दरखास्त नम्बर: <strong>{applySuccessData.applicationNo}</strong></div>
                    <div>जग्गाधनी: <strong>{applySuccessData.landOwnerName}</strong></div>
                    <div>कित्ता नम्बर: <strong>{applySuccessData.kittaNo}</strong></div>
                    <div>अनुमानित दस्तुर: <strong>रु. {Number(applySuccessData.permitFee).toLocaleString('ne-NP')}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setTrackSearchQuery(applySuccessData.applicationNo);
                        setTrackedPermit(applySuccessData);
                        setApplySuccessData(null);
                        setActiveTab('track');
                      }}
                      style={{ padding: '0.75rem 1.4rem', background: '#312e81', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Search size={16} /> यस दरखास्तको स्थिति ट्र्याक गर्नुहोस्
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: '0.75rem 1.4rem', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Printer size={16} /> दरखास्त निस्सा प्रिन्ट गर्नुहोस्
                    </button>
                    <button
                      onClick={() => {
                        setApplySuccessData(null);
                        setApplyStep(1);
                      }}
                      style={{ padding: '0.75rem 1.4rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + अर्को नयाँ दरखास्त भर्नुहोस्
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ borderBottom: '1.5px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      अनलाइन घर-नक्सा दरखास्त फारम (e-BPS Online Submission)
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
                      नेपाल राष्ट्रिय भवन संहिता (NBC 105:2020) मापदण्ड अनुसार अनलाइन विवरण भरी आफ्नै घरबाट नक्सा पेश गर्नुहोस्।
                    </p>
                  </div>

                  {/* Stepper Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    {[
                      { step: 1, label: '१. जग्गाधनी विवरण' },
                      { step: 2, label: '२. जग्गा नापी र GPS' },
                      { step: 3, label: '३. भवन र संहिता मापदण्ड' },
                      { step: 4, label: '४. कागजात तथा ड्रइङ' },
                      { step: 5, label: '५. दस्तुर र पेश' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() => setApplyStep(s.step)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          color: applyStep === s.step ? '#312e81' : applyStep > s.step ? '#059669' : '#94a3b8',
                          fontWeight: applyStep === s.step ? 800 : 600,
                          fontSize: '0.82rem',
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: applyStep === s.step ? '#312e81' : applyStep > s.step ? '#059669' : '#cbd5e1',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          {applyStep > s.step ? '✓' : s.step}
                        </span>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Personal / Landowner */}
                  {applyStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            जग्गाधनीको पूरा नाम (लालपुर्जा बमोजिम)*
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा: पेम्बा दोर्जे तामाङ"
                            value={formData.landOwnerName}
                            onChange={(e) => setFormData({ ...formData, landOwnerName: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            दरखास्तवालाको नाम (यदि जग्गाधनीभन्दा फरक भए)
                          </label>
                          <input
                            type="text"
                            placeholder="उदा: पेम्बा दोर्जे तामाङ"
                            value={formData.applicantName}
                            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            सम्पर्क मोबाइल नम्बर*
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="९८४१२३४५६७"
                            value={formData.applicantPhone}
                            onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            नागरिकता नम्बर*
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="२३-०१-७४-०१२३४"
                            value={formData.applicantCitizenship}
                            onChange={(e) => setFormData({ ...formData, applicantCitizenship: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            भवन निर्माण हुने वडा नं.*
                          </label>
                          <select
                            value={formData.wardNumber}
                            onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                              <option key={w} value={w}>वडा नं {w}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* भवन निर्माण मार्गदर्शन, २०८२: जग्गा स्वामित्व तथा मन्जुरीनामा */}
                      <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          📜 भवन निर्माण मार्गदर्शन, २०८२ बमोजिम जग्गा स्वामित्व विवरण:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                              जग्गा स्वामित्व प्रकार*
                            </label>
                            <select
                              value={formData.ownershipType}
                              onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                            >
                              {OWNERSHIP_TYPES.map((ot) => (
                                <option key={ot} value={ot}>{ot}</option>
                              ))}
                            </select>
                          </div>

                          {formData.ownershipType.includes('भाडाको जग्गा') && (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                भाडा सम्झौता अवधि (वर्ष)*
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="99"
                                value={formData.leasePeriodYears}
                                onChange={(e) => setFormData({ ...formData, leasePeriodYears: Number(e.target.value) || 10 })}
                                placeholder="कम्तीमा १० वर्ष"
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                              />
                            </div>
                          )}

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                              दरखास्तवाला र जग्गाधनी सम्बन्ध
                            </label>
                            <select
                              value={formData.relationshipToOwner}
                              onChange={(e) => setFormData({ ...formData, relationshipToOwner: e.target.value })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                            >
                              <option value="जग्गाधनी स्वयम्">जग्गाधनी स्वयम्</option>
                              <option value="एकाघरको सदस्य (मन्जुरीनामा आवश्यक)">एकाघरको सदस्य (मन्जुरीनामा आवश्यक)</option>
                              <option value="भाडावाला / लिजधारक (सम्झौता आवश्यक)">भाडावाला / लिजधारक (सम्झौता आवश्यक)</option>
                              <option value="हकदार / प्रतिनिधि (वारिसनामा आवश्यक)">हकदार / प्रतिनिधि (वारिसनामा आवश्यक)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Land & GPS */}
                  {applyStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>नापी सिट नं*</label>
                          <input
                            type="text"
                            value={formData.sheetNo}
                            onChange={(e) => setFormData({ ...formData, sheetNo: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>कित्ता नम्बर*</label>
                          <input
                            type="text"
                            required
                            placeholder="जस्तै: ४५२"
                            value={formData.kittaNo}
                            onChange={(e) => setFormData({ ...formData, kittaNo: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>क्षेत्रफल (रोपनी-आना-पैसा)*</label>
                          <input
                            type="text"
                            value={formData.landAreaRopani}
                            onChange={(e) => setFormData({ ...formData, landAreaRopani: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      {/* 4 Boundaries */}
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.6rem' }}>चारकिल्ला विवरण (साँध-सिमाना):</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <input
                            type="text"
                            placeholder="पूर्व: सडक वा कित्ता नं..."
                            value={formData.eastBoundary}
                            onChange={(e) => setFormData({ ...formData, eastBoundary: e.target.value })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                          <input
                            type="text"
                            placeholder="पश्चिम: साँध वा कित्ता नं..."
                            value={formData.westBoundary}
                            onChange={(e) => setFormData({ ...formData, westBoundary: e.target.value })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                          <input
                            type="text"
                            placeholder="उत्तर: बाटो वा खुला..."
                            value={formData.northBoundary}
                            onChange={(e) => setFormData({ ...formData, northBoundary: e.target.value })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                          <input
                            type="text"
                            placeholder="दक्षिण: सिमाना वा खोल्सो..."
                            value={formData.southBoundary}
                            onChange={(e) => setFormData({ ...formData, southBoundary: e.target.value })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>

                      {/* GPS */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#065f46', display: 'block' }}>GPS अवस्थिति (Coordinates)</strong>
                          <span style={{ fontSize: '0.78rem', color: '#047857' }}>Lat: {formData.gpsLat} | Lon: {formData.gpsLon} {gpsAccuracy && <span>({gpsAccuracy})</span>}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectGPS}
                          disabled={gpsDetecting}
                          style={{ padding: '0.45rem 0.9rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          {gpsDetecting ? 'खोज्दैछ...' : '📍 १-क्लिक GPS लिनुहोस्'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Engineering & NBC Scrutiny */}
                  {applyStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>भवनको वर्ग*</label>
                          <select
                            value={formData.buildingClass}
                            onChange={(e) => setFormData({ ...formData, buildingClass: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          >
                            {BUILDING_CLASSES.filter((c) => c.id !== 'all').map((c) => (
                              <option key={c.id} value={c.label}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>प्रस्तावित प्रयोग*</label>
                          <select
                            value={formData.usageType}
                            onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          >
                            {USAGE_TYPES.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>संरचना प्रकार*</label>
                          <select
                            value={formData.structureType}
                            onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          >
                            {STRUCTURE_TYPES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>तला संख्या (Storeys)*</label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="8"
                            value={formData.totalFloors}
                            onChange={(e) => setFormData({ ...formData, totalFloors: parseFloat(e.target.value) || 1 })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>प्लिन्थ एरिया (sq.ft)*</label>
                          <input
                            type="number"
                            value={formData.plinthAreaSqFt}
                            onChange={(e) => setFormData({ ...formData, plinthAreaSqFt: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      {/* Live NBC 105:2020 Auto-Scrutiny Preview Card */}
                      <div style={{ background: '#f0fdfa', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #99f6e4' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <ShieldCheck size={20} color="#0f766e" />
                          <strong style={{ fontSize: '0.95rem', color: '#115e59' }}>
                            भवन संहिता (NBC 105:2020) अटो-स्क्रूटिनी प्रारम्भिक विश्लेषण
                          </strong>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                          <div style={{ padding: '0.5rem', borderRadius: '6px', background: scrutinyPreview.roadPass ? '#dcfce7' : '#fee2e2', color: scrutinyPreview.roadPass ? '#15803d' : '#b91c1c' }}>
                            {scrutinyPreview.roadPass ? '✓' : '✗'} सडक चौडाइ: {formData.roadWidthFt} ft (न्यूनतम १४ ft)
                          </div>
                          <div style={{ padding: '0.5rem', borderRadius: '6px', background: scrutinyPreview.frontPass ? '#dcfce7' : '#fee2e2', color: scrutinyPreview.frontPass ? '#15803d' : '#b91c1c' }}>
                            {scrutinyPreview.frontPass ? '✓' : '✗'} अगाडि सेटब्याक: {formData.setbackFrontFt} ft (न्यूनतम ५ ft)
                          </div>
                          <div style={{ padding: '0.5rem', borderRadius: '6px', background: scrutinyPreview.sidePass ? '#dcfce7' : '#fee2e2', color: scrutinyPreview.sidePass ? '#15803d' : '#b91c1c' }}>
                            {scrutinyPreview.sidePass ? '✓' : '✗'} दायाँ/बायाँ सेटब्याक: {formData.setbackSideFt} ft (न्यूनतम ३ ft)
                          </div>
                          <div style={{ padding: '0.5rem', borderRadius: '6px', background: scrutinyPreview.covPass ? '#dcfce7' : '#fee2e2', color: scrutinyPreview.covPass ? '#15803d' : '#b91c1c' }}>
                            {scrutinyPreview.covPass ? '✓' : '✗'} कभरेज: {formData.groundCoveragePct}% (अधिकतम ६०%)
                          </div>
                        </div>
                      </div>

                      {/* भवन निर्माण मार्गदर्शन, २०८२: CAD र स्ट्रक्चरल सफ्टवेयर मापदण्ड */}
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <HardHat size={20} color="#312e81" />
                          <strong style={{ fontSize: '0.95rem', color: '#1e1b4b' }}>
                            भवन निर्माण मार्गदर्शन, २०८२ प्राविधिक सफ्टवेयर विवरण
                          </strong>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.82rem' }}>
                          <div>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>
                              AutoCAD संस्करण (२०१६ भन्दा माथि अनिवार्य)*
                            </label>
                            <select
                              value={formData.cadVersion}
                              onChange={(e) => setFormData({ ...formData, cadVersion: e.target.value })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                            >
                              {CAD_VERSIONS.map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.72rem', color: '#059669', display: 'block', marginTop: '3px' }}>
                              ✓ मार्गदर्शन २०८२ अनुसार २०१६ वा सो भन्दा माथिल्लो संस्करण स्वीकृत हुने
                            </span>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>
                              स्ट्रक्चरल एनालाइसिस सफ्टवेयर / फाइल प्रकार*
                            </label>
                            <select
                              value={formData.structuralModelType}
                              onChange={(e) => setFormData({ ...formData, structuralModelType: e.target.value })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }}
                            >
                              {STRUCTURAL_SOFTWARE_TYPES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                              भूकम्प प्रतिरोधी गणना फाइल (.edb / .sdb)
                            </span>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>
                              डिजाइनर इन्जिनियर नाम र NEC दर्ता नं.*
                            </label>
                            <input
                              type="text"
                              placeholder="इ. सुमन श्रेष्ठ (NEC: 14205-Civil)"
                              value={formData.designerName}
                              onChange={(e) => setFormData({ ...formData, designerName: e.target.value })}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Documents Upload */}
                  {applyStep === 4 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                            📑 भवन निर्माण मार्गदर्शन, २०८२ बमोजिम अनिवार्य डिजिटल कागजात तथा ड्रइङ अपलोड:
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                            सबै फाइलहरू प्रस्ट बुझिने गरी स्क्यान गरिएको PDF, AutoCAD (.dwg), वा ETABS (.edb) फाइलमा अपलोड गर्नुहोस्।
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontWeight: 700 }}>
                          मार्गदर्शन २०८२ मापदण्ड
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {[
                          {
                            title: '१. जग्गाधनी प्रमाण पुर्जा (Lalpurja)*',
                            cat: 'लालपुर्जा स्क्यान PDF',
                            badge: 'अनिवार्य',
                            badgeBg: '#fef2f2',
                            badgeColor: '#b91c1c',
                            accept: '.pdf,image/*',
                            desc: 'स्पष्ट कित्ता नं. र क्षेत्रफल देखिने'
                          },
                          {
                            title: '२. नापी नक्सा / ब्लुप्रिन्ट ट्रेस नक्सा*',
                            cat: 'नापी ट्रेस नक्सा',
                            badge: 'अनिवार्य',
                            badgeBg: '#fef2f2',
                            badgeColor: '#b91c1c',
                            accept: '.pdf,image/*',
                            desc: 'सम्बन्धित नापी शाखाबाट प्रमाणित ट्रेस'
                          },
                          {
                            title: '३. चालु आ.व. को मालपोत / सम्पत्ति कर चुक्ता रसिद*',
                            cat: 'मालपोत तिरो रसिद',
                            badge: 'अनिवार्य',
                            badgeBg: '#fef2f2',
                            badgeColor: '#b91c1c',
                            accept: '.pdf,image/*',
                            desc: 'गाउँपालिका वा वडाको चुक्ता रसिद'
                          },
                          {
                            title: '४. नागरिकता प्रमाणपत्र प्रतिलिपि*',
                            cat: 'नागरिकता PDF',
                            badge: 'अनिवार्य',
                            badgeBg: '#fef2f2',
                            badgeColor: '#b91c1c',
                            accept: '.pdf,image/*',
                            desc: 'जग्गाधनी र दरखास्तवालाको दुवै'
                          },
                          {
                            title: '५. मन्जुरीनामा र नाता प्रमाणित कागजात',
                            cat: 'मन्जुरीनामा / नाता प्रमाणित',
                            badge: formData.relationshipToOwner === 'जग्गाधनी स्वयम्' ? 'ऐच्छिक' : 'अनिवार्य (मार्गदर्शन २०८२)',
                            badgeBg: formData.relationshipToOwner === 'जग्गाधनी स्वयम्' ? '#f1f5f9' : '#fef3c7',
                            badgeColor: formData.relationshipToOwner === 'जग्गाधनी स्वयम्' ? '#64748b' : '#92400e',
                            accept: '.pdf,image/*',
                            desc: 'जग्गाधनी र दरखास्तवाला फरक भएमा अनिवार्य'
                          },
                          {
                            title: '६. जग्गा भाडा सम्झौता पत्र (Lease Agreement)',
                            cat: 'भाडा सम्झौता (कम्तीमा १० वर्ष)',
                            badge: formData.ownershipType.includes('भाडाको जग्गा') ? 'अनिवार्य (मार्गदर्शन २०८२)' : 'भाडामा भए मात्र',
                            badgeBg: formData.ownershipType.includes('भाडाको जग्गा') ? '#fef3c7' : '#f1f5f9',
                            badgeColor: formData.ownershipType.includes('भाडाको जग्गा') ? '#92400e' : '#64748b',
                            accept: '.pdf',
                            desc: 'भाडामा लिएर बनाउने भए कम्तीमा १० वर्षे सम्झौता'
                          },
                          {
                            title: '७. आर्किटेक्चरल ड्रइङ (Architectural Plans)*',
                            cat: 'AutoCAD (.dwg) वा PDF (२०१६ माथी)',
                            badge: 'AutoCAD 2016+ (.dwg)',
                            badgeBg: '#e0e7ff',
                            badgeColor: '#3730a3',
                            accept: '.dwg,.pdf',
                            desc: `रोजिएको संस्करण: ${formData.cadVersion}`
                          },
                          {
                            title: '८. स्ट्रक्चरल ड्रइङ (Structural Drawings)*',
                            cat: 'NBC 105:2020 Detail Drawings',
                            badge: 'NBC 105:2020',
                            badgeBg: '#e0e7ff',
                            badgeColor: '#3730a3',
                            accept: '.dwg,.pdf',
                            desc: 'फाउन्डेसन, पिलर, बिम, स्ल्याब र रिइन्फोर्समेन्ट'
                          },
                          {
                            title: '९. स्ट्रक्चरल डिजाइन प्रतिवेदन ETABs/SAP फाइल*',
                            cat: 'Structural Calculation (.edb / .sdb)',
                            badge: formData.structuralModelType,
                            badgeBg: '#dcfce7',
                            badgeColor: '#166534',
                            accept: '.edb,.sdb,.std,.pdf',
                            desc: 'ख तथा ग वर्गको भूकम्प प्रतिरोधी कम्प्युटर मोडेल'
                          },
                        ].map((doc, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '1.1rem',
                              background: '#ffffff',
                              borderRadius: '14px',
                              border: '1.5px dashed #cbd5e1',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '0.86rem', color: '#0f172a', lineHeight: 1.35 }}>{doc.title}</strong>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: doc.badgeBg,
                                  color: doc.badgeColor,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {doc.badge}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#475569' }}>{doc.cat}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ℹ️ {doc.desc}</span>
                            <input
                              type="file"
                              accept={doc.accept}
                              style={{ fontSize: '0.76rem', marginTop: '0.5rem', padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Fee Preview & Submit */}
                  {applyStep === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #bbf7d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <Coins size={24} color="#16a34a" />
                          <strong style={{ fontSize: '1.1rem', color: '#166534' }}>नक्सा पास दस्तुर स्वतः निर्धारण (Fee Breakdown)</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>कुल निर्मित क्षेत्रफल (Built-up Area):</span>
                            <strong>{(formData.plinthAreaSqFt * formData.totalFloors).toLocaleString()} वर्गफिट</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>नक्सा पास दस्तुर दर ({formData.buildingClass.slice(0, 7)}):</span>
                            <strong>रु. {formData.buildingClass.includes('क वर्ग') ? 14 : 10} / sq.ft</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>प्रशासनिक सेवा शुल्क:</span>
                            <strong>रु. १५००</strong>
                          </div>
                          <div style={{ height: '1px', background: '#bbf7d0', margin: '6px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#14532d' }}>
                            <span>जम्मा बुझाउनुपर्ने दस्तुर:</span>
                            <span>रु. {Math.round(formData.plinthAreaSqFt * formData.totalFloors * (formData.buildingClass.includes('क वर्ग') ? 14 : 10) + 1500).toLocaleString('ne-NP')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Guidance 2082 Application Review Summary */}
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#1e1b4b', display: 'block', marginBottom: '0.75rem' }}>
                          📋 भवन निर्माण मार्गदर्शन, २०८२ प्राविधिक विवरण सारांश:
                        </strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', fontSize: '0.82rem' }}>
                          <div><strong>जग्गाधनी:</strong> {formData.landOwnerName || 'उल्लेख नभएको'}</div>
                          <div><strong>दरखास्तवाला:</strong> {formData.applicantName || formData.landOwnerName} ({formData.relationshipToOwner})</div>
                          <div><strong>स्वामित्व:</strong> {formData.ownershipType} {formData.ownershipType.includes('भाडाको') ? `(${formData.leasePeriodYears} वर्ष)` : ''}</div>
                          <div><strong>स्थान:</strong> वडा नं. {formData.wardNumber}, कित्ता नं. {formData.kittaNo || '---'}</div>
                          <div><strong>CAD Version:</strong> {formData.cadVersion}</div>
                          <div><strong>स्ट्रक्चरल मोडेल:</strong> {formData.structuralModelType}</div>
                          <div><strong>संहिता मापदण्ड:</strong> NBC 105:2020</div>
                          <div><strong>डिजाइनर:</strong> {formData.designerName || 'इन्जिनियर रोस्टरबाट'}</div>
                        </div>
                      </div>

                      <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e40af' }}>
                        <CheckCircle size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                        अनलाइन दरखास्त पेश गरेपछि प्रणालीले स्वतः दर्ता नम्बर उत्पादन गर्नेछ। तपाईंले घरमै बसी यसको स्थिति ट्र्याक गर्न सक्नुहुनेछ।
                      </div>
                    </div>
                  )}

                  {/* Form Step Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1.5px solid #f1f5f9', paddingTop: '1.25rem' }}>
                    <button
                      type="button"
                      disabled={applyStep === 1}
                      onClick={() => setApplyStep((p) => Math.max(1, p - 1))}
                      style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: applyStep === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ← अघिल्लो चरण
                    </button>

                    {applyStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => setApplyStep((p) => Math.min(5, p + 1))}
                        style={{ padding: '0.65rem 1.5rem', background: '#312e81', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
                      >
                        अर्को चरण →
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={applyMutation.isPending}
                        onClick={() => applyMutation.mutate(formData)}
                        style={{ padding: '0.75rem 2rem', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}
                      >
                        {applyMutation.isPending ? 'पेश हुँदैछ...' : '✓ अनलाइन दरखास्त पेश गर्नुहोस्'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: १५ दिने सार्वजनिक सूचना तथा दाबी-विरोध बोर्ड ─────── */}
        {activeTab === 'notices' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    १५ दिने सार्वजनिक सूचना तथा साँध-सिमाना उजुरी पाटी
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
                    स्थानीय सरकार सञ्चालन ऐन २०७४ दफा २७ बमोजिम प्रकाशित बोलपत्र/नक्सा सूचनाहरू। साँध-सिमाना विवाद भए छिमेकीले अनलाइन दाबी-विरोध दर्ता गर्न सक्नुहुन्छ।
                  </p>
                </div>
                <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                  कानुनी म्याद: १५ दिन
                </span>
              </div>

              {permits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>हाल कुनै १५ दिने सूचना प्रकाशित छैन।</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                  {permits.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                            {p.applicationNo}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                            ⏳ १५ दिने सूचना जारी
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                          {p.landOwnerName}
                        </h3>

                        <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                          <div>स्थान: <strong>वडा नं {p.wardNumber}, {p.toleAddress || 'पालिका क्षेत्र'}</strong></div>
                          <div>कित्ता नं: <strong>{p.kittaNo}</strong> (सिट: {p.sheetNo || '-'})</div>
                          <div>प्रस्तावित भवन: <strong>{p.totalFloors} तला ({p.usageType})</strong></div>
                          <div>सूचना मिति: <strong>{p.publicNoticeDateBs || p.applicationDateBs || '२०८१/०५/०१'}</strong></div>
                        </div>

                        {p.fourBoundaries && (
                          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', marginBottom: '1rem', border: '1px solid #f1f5f9' }}>
                            <strong>चारकिल्ला:</strong> पूर्व: {p.fourBoundaries.east || '-'} | पश्चिम: {p.fourBoundaries.west || '-'} <br />
                            उत्तर: {p.fourBoundaries.north || '-'} | दक्षिण: {p.fourBoundaries.south || '-'}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => alert(`१५ दिने सार्वजनिक सूचना पत्र प्रिन्ट हुँदैछ:\n${p.applicationNo}`)}
                          style={{ flex: 1, padding: '0.6rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}
                        >
                          📄 सूचना हेर्नुहोस्
                        </button>
                        <button
                          onClick={() => setSelectedNoticeForObjection(p)}
                          style={{ flex: 1, padding: '0.6rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
                        >
                          ⚠️ दाबी-विरोध / उजुरी
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: नक्सा पास दस्तुर क्यालकुलेटर (Instant Fee Estimator) ─ */}
        {activeTab === 'calculator' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                नक्सा पास तथा निर्माण अनुमति दस्तुर क्यालकुलेटर
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.75rem 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक ऐन बमोजिम भवनको वर्ग, प्रयोग र क्षेत्रफल अनुसार लाग्ने आधिकारिक दस्तुर हिसाब गर्नुहोस्।
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>भवनको वर्ग (Building Class)</label>
                    <select
                      value={calcClass}
                      onChange={(e) => setCalcClass(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    >
                      {BUILDING_CLASSES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>प्रस्तावित प्रयोग (Usage Type)</label>
                    <select
                      value={calcUsage}
                      onChange={(e) => setCalcUsage(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    >
                      {USAGE_TYPES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>प्लिन्थ एरिया (sq.ft)</label>
                      <input
                        type="number"
                        min="100"
                        value={calcPlinth}
                        onChange={(e) => setCalcPlinth(parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>तला संख्या (Floors)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="8"
                        value={calcFloors}
                        onChange={(e) => setCalcFloors(parseFloat(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Result Card */}
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '1.75rem', borderRadius: '16px', border: '1.5px solid #86efac', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Coins size={24} color="#15803d" />
                      <strong style={{ fontSize: '1.1rem', color: '#14532d' }}>अनुमानित नक्सा पास दस्तुर विवरण</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#166534' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>कुल निर्मित क्षेत्रफल:</span>
                        <strong>{calculatedFee.totalArea.toLocaleString()} sq.ft</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>प्रति वर्गफिट दर:</span>
                        <strong>रु. {calculatedFee.rate}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>फारम तथा सिफारिस सेवा शुल्क:</span>
                        <strong>रु. {calculatedFee.svc.toLocaleString()}</strong>
                      </div>
                      <div style={{ height: '1px', background: '#86efac', margin: '6px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, color: '#14532d' }}>
                        <span>जम्मा दस्तुर:</span>
                        <span>रु. {calculatedFee.total.toLocaleString('ne-NP')}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '1rem 0 0 0', lineHeight: 1.5 }}>
                    *नोट: यो गाउँपालिकाको वार्षिक आर्थिक ऐन बमोजिम अनुमानित रकम हो। अन्तिम प्राविधिक स्क्रूटिनी पश्चात आधिकारिक रसिद उत्पादन हुनेछ।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: प्रमाणपत्र तथा QR प्रमाणीकरण (Verification) ──────── */}
        {activeTab === 'verify' && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                आधिकारिक निर्माण सम्पन्न तथा नक्सा पास प्रमाणपत्र प्रमाणीकरण
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                बैंक, वित्तीय संस्था, मालपोत वा नापी कार्यालयले प्रमाणपत्रमा छापिएको प्रमाणपत्र नम्बर (उदा: <strong>BCC-2081-008</strong> वा <strong>DPC-2081-001</strong>) वा QR कोड प्रविष्ट गरी आधिकारिकता रुजु गर्न सक्नुहुन्छ।
              </p>

              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <QrCode size={18} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="प्रमाणपत्र नं (BCC-2081-008) वा QR कोड हाल्नुहोस्..."
                    value={verifyQuery}
                    onChange={(e) => setVerifyQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  प्रमाणीकरण गर्नुहोस् (Verify Now)
                </button>
              </form>

              {verifyError && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> {verifyError}
                </div>
              )}

              {verifiedPermit && (
                <div style={{ marginTop: '2rem', border: '2px solid #10b981', borderRadius: '16px', padding: '1.75rem', background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <ShieldCheck size={32} color="#16a34a" />
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                        ✓ आधिकारिक एवं प्रमाणित प्रमाणपत्र (Legally Valid Certificate)
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: '#15803d' }}>
                        पाँचपोखरी थाङपाल गाउँपालिका — e-BPS डिजिटल अभिलेख प्रमाणित
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#334155' }}>
                    <div>प्रमाणपत्र नं: <strong style={{ color: '#2563eb' }}>{verifiedPermit.certificateNo || 'BCC-2081-OFFICIAL'}</strong></div>
                    <div>दरखास्त नं: <strong>{verifiedPermit.applicationNo}</strong></div>
                    <div>जग्गाधनी: <strong>{verifiedPermit.landOwnerName}</strong></div>
                    <div>वडा / कित्ता नं: <strong>वडा नं {verifiedPermit.wardNumber} / कित्ता नं {verifiedPermit.kittaNo}</strong></div>
                    <div>भवन तला / वर्ग: <strong>{verifiedPermit.totalFloors} तला ({verifiedPermit.buildingClass?.slice(0, 7)})</strong></div>
                    <div>स्वीकृत मिति: <strong>{verifiedPermit.completionCertificateDateBs || verifiedPermit.plinthApprovalDateBs || '२०८१/०५/०१'}</strong></div>
                    <div>स्वीकृतिकर्ता: <strong>{verifiedPermit.approvedBy || 'प्रमुख प्रशासकीय अधिकृत'}</strong></div>
                    <div>संहिता अनुपालन: <strong style={{ color: '#16a34a' }}>NBC 105:2020 पूर्ण पालना</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CITIZEN INFORMATION & PROCESS GUIDE (७ मुख्य चरणहरू र निर्देशिका) ── */}
        <div style={{ marginTop: '3.5rem' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0e7ff', color: '#3730a3', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              <HelpCircle size={15} /> नागरिक सहजीकरण तथा प्रक्रिया मार्गचित्र
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              ई-नक्सा पास (e-BPS) प्रक्रियाका ७ मुख्य चरणहरू
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '700px', margin: '0 auto' }}>
              पाँचपोखरी थाङपाल गाउँपालिकामा घर निर्माण अनुमति प्राप्त गर्नका लागि पारदर्शी र व्यवस्थित ७-चरणे कार्यप्रवाह:
            </p>
          </div>

          {/* 7 Workflow Step Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            {[
              {
                step: '१',
                title: 'अनलाइन दरखास्त र कागजात',
                desc: 'नागरिकले अनलाइन पोर्टल वा वडा/पालिका केन्द्रबाट लालपुर्जा, नापी नक्सा र ड्रइङ सहित दरखास्त पेश गर्दछन्।',
                icon: <FileText size={22} color="#3b82f6" />,
                bg: '#eff6ff',
                border: '#bfdbfe',
              },
              {
                step: '२',
                title: 'वडा सर्जमिन तथा सिफारिस',
                desc: 'सम्बन्धित वडा प्राविधिक तथा जनप्रतिनिधिले स्थलगत अवलोकन गरी साँध-सिमाना सर्जमिन मुचुल्का तयार गर्दछन्।',
                icon: <MapPin size={22} color="#8b5cf6" />,
                bg: '#f5f3ff',
                border: '#ddd6fe',
              },
              {
                step: '३',
                title: '१५ दिने सार्वजनिक सूचना',
                desc: 'साँध-सिमाना तथा सार्वजनिक बाटोका छिमेकीहरूका लागि १५ दिने दाबी-विरोध सूचना अनलाइन बोर्डमा प्रकाशित हुन्छ।',
                icon: <Clock size={22} color="#f59e0b" />,
                bg: '#fffbeb',
                border: '#fde68a',
              },
              {
                step: '४',
                title: 'प्राविधिक तथा NBC स्क्रूटिनी',
                desc: 'इन्जिनियरिङ शाखाले राष्ट्रिय भवन संहिता (NBC 105:2020), सडक चौडाइ, सेटब्याक र कभरेजको स्वचालित जाँच गर्दछ।',
                icon: <Sparkles size={22} color="#06b6d4" />,
                bg: '#ecfeff',
                border: '#a5f3fc',
              },
              {
                step: '५',
                title: 'प्लिन्थ (DPC) निर्माण इजाजत',
                desc: 'दस्तुर भुक्तानी पश्चात जग (Plinth/DPC) तहसम्म निर्माण गर्नका लागि अस्थायी इजाजतपत्र जारी गरिन्छ।',
                icon: <Compass size={22} color="#10b981" />,
                bg: '#f0fdf4',
                border: '#bbf7d0',
              },
              {
                step: '६',
                title: 'स्थलगत सुपरिवेक्षण (DPC Check)',
                desc: 'DPC ढलानपछि प्राविधिकले स्थलगत नापजाँच गरी नक्सा अनुसार भए नभएको प्रमाणित गर्दछन्।',
                icon: <Ruler size={22} color="#6366f1" />,
                bg: '#eef2ff',
                border: '#c7d2fe',
              },
              {
                step: '७',
                title: 'निर्माण सम्पन्न प्रमाणपत्र (BCC)',
                desc: 'भवन पूर्ण निर्माण सम्पन्न भइसकेपछि QR कोड सहितको आधिकारिक अन्तिम निर्माण सम्पन्न प्रमाणपत्र प्रदान गरिन्छ।',
                icon: <ShieldCheck size={22} color="#059669" />,
                bg: '#ecfdf5',
                border: '#a7f3d0',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  border: `1.5px solid ${item.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', background: '#f1f5f9', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Grid: Required Documents & Helpdesk */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Required Documents Checklist */}
            <div
              style={{
                background: '#ffffff',
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <FileSpreadsheet size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  आवेदन गर्दा आवश्यक पर्ने अनिवार्य कागजातहरू
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#334155' }}>
                {[
                  'जग्गाधनी प्रमाणपुर्जा (लालपुर्जा) को प्रमाणित प्रतिलिपि',
                  'चालु आर्थिक वर्षको स्थानीय कर / मालपोत चुक्ता गरेको रसिद',
                  'नापी शाखाबाट प्रमाणित ट्रेस नक्सा (ब्लुप्रिन्ट) र फिल्डबुक उतार',
                  'भवन निर्माण संहिता (NBC 105:2020) अनुरुप इन्जिनियरबाट तयार भएको नक्सा ड्रइङ (AutoCAD/PDF)',
                  'आवेदक तथा जग्गाधनीको नेपाली नागरिकता प्रमाणपत्रको प्रतिलिपि',
                  'सार्वजनिक वा निजी बाटोको चौडाइ प्रमाणित वडा मुचुल्का',
                  'हकवालाको मञ्जुरीनामा वा वारिसनामा (आवश्यक भएमा)',
                ].map((doc, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Helpdesk and Contact Info */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 25px rgba(49, 46, 129, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Info size={22} color="#a5b4fc" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    नागरिक सहायता कक्ष तथा सम्पर्क
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                  घर-नक्सा दरखास्त दर्ता गर्न, शुल्क हिसाब गर्न वा प्राविधिक सहयोगका लागि गाउँपालिकाको पूर्वाधार विकास तथा भवन निर्माण शाखामा प्रत्यक्ष सम्पर्क गर्न सक्नुहुन्छ।
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={16} color="#a5b4fc" />
                    <span>पाँचपोखरी थाङपाल गाउँपालिका कार्यपालिकाको कार्यालय, थाङपालधोप</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Phone size={16} color="#a5b4fc" />
                    <span>फोन: ०११-५०५००१ / ९८५१२३४५६७</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={16} color="#a5b4fc" />
                    <span>कार्यालय समय: आइतबार - बिहीबार (१०:०० - ५:००), शुक्रबार (१०:०० - ३:००)</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                  e-BPS नागरिक सेवा हेल्पलाइन २४/७
                </span>
                <button
                  onClick={() => setActiveTab('apply')}
                  style={{
                    padding: '0.55rem 1.1rem',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  अनलाइन दरखास्त सुरु गर्नुहोस् →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── OBJECTION MODAL (१५ दिने सार्वजनिक सूचना दाबी-विरोध) ─────── */}
      {selectedNoticeForObjection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '540px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#991b1b', color: '#ffffff', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>साँध-सिमाना दाबी-विरोध / उजुरी फारम</h3>
                <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>{selectedNoticeForObjection.applicationNo} — {selectedNoticeForObjection.landOwnerName}</span>
              </div>
              <button onClick={() => setSelectedNoticeForObjection(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>उजुरीकर्ताको नाम*</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: रामप्रसाद न्यौपाने"
                    value={objectionForm.claimantName}
                    onChange={(e) => setObjectionForm({ ...objectionForm, claimantName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>सम्पर्क फोन नं*</label>
                  <input
                    type="tel"
                    required
                    placeholder="९८४१२३४५६७"
                    value={objectionForm.claimantPhone}
                    onChange={(e) => setObjectionForm({ ...objectionForm, claimantPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>सम्बन्ध*</label>
                  <select
                    value={objectionForm.relationToProperty}
                    onChange={(e) => setObjectionForm({ ...objectionForm, relationToProperty: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="साँध-सिमानाको छिमेकी">साँध-सिमानाको छिमेकी</option>
                    <option value="हकवाला / अंशियार">हकवाला / अंशियार</option>
                    <option value="सार्वजनिक बाटो/जग्गा सरोकारवाला">सार्वजनिक बाटो/जग्गा सरोकारवाला</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>कुन सिमानामा विवाद?*</label>
                  <select
                    value={objectionForm.boundarySide}
                    onChange={(e) => setObjectionForm({ ...objectionForm, boundarySide: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="पूर्व">पूर्व सिमाना</option>
                    <option value="पश्चिम">पश्चिम सिमाना</option>
                    <option value="उत्तर">उत्तर सिमाना</option>
                    <option value="दक्षिण">दक्षिण सिमाना</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>दाबी-विरोधको स्पष्ट कारण / विवरण*</label>
                <textarea
                  rows={3}
                  required
                  placeholder="मेरो साँध मिचेर सडक सेटब्याक नछाडी नक्सा बनाएकोले..."
                  value={objectionForm.reason}
                  onChange={(e) => setObjectionForm({ ...objectionForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>प्रमाण कागजात संलग्न (लालपुर्जा / प्रमाण फोटो)</label>
                <input type="file" style={{ fontSize: '0.8rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeForObjection(null)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="button"
                  disabled={!objectionForm.claimantName || !objectionForm.reason || objectionMutation.isPending}
                  onClick={() => objectionMutation.mutate({ permitId: selectedNoticeForObjection.id, data: objectionForm })}
                  style={{ padding: '0.6rem 1.5rem', background: '#b91c1c', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {objectionMutation.isPending ? 'पेश हुँदैछ...' : 'उजुरी दर्ता गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
