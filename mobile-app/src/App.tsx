import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  FileCheck2,
  Coins,
  AlertOctagon,
  AlertTriangle,
  Bell,
  Search,
  Phone,
  Volume2,
  Bookmark,
  Share2,
  CheckCircle2,
  X,
  MapPin,
  Camera,
  Download,
  QrCode,
  ShieldCheck,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ClipboardList,
  BookOpen,
  LayoutGrid,
  Bot,
  Home,
  Menu,
  UserCheck,
  User,
} from 'lucide-react';
import {
  MOCK_SERVICES,
  MOCK_SIFARISH_TEMPLATES,
  EMERGENCY_CONTACTS,
  MOCK_NOTIFICATIONS,
} from './data/mockData';
import { BadapatraService, SifarishTemplate, ComplaintData } from './types';
import { DocumentScanner } from './components/DocumentScanner/DocumentScanner';
import { DynamicSurveyEngine } from './components/DynamicSurvey/DynamicSurveyEngine';
import { ELibrary } from './components/ELibrary/ELibrary';
import { CitizenServicesHub } from './components/CitizenServices/CitizenServicesHub';
import { AiPalikaChat } from './components/AiAssistant/AiPalikaChat';
import { SifarishCategoryHub } from './components/Sifarish/SifarishCategoryHub';
import { CitizenCharterHub } from './components/CitizenCharter/CitizenCharterHub';
import { DigiHomeDashboard } from './components/DigiDashboard/DigiHomeDashboard';
import { DigiSideDrawer } from './components/DigiDashboard/DigiSideDrawer';
import { TourismHeritageTwin } from './components/Tourism/TourismHeritageTwin';
import { CulturalMuseum } from './components/Museum/CulturalMuseum';
import { CitizenUser } from './types';
import { CitizenAuthModal } from './components/CitizenAuth/CitizenAuthModal';
import { CitizenProfileModal } from './components/CitizenAuth/CitizenProfileModal';
import { AppLanguage, TRANSLATIONS } from './utils/localization';
import { PrivacyPolicyModal } from './components/Legal/PrivacyPolicyModal';
import { HealthFacilities } from './components/Health/HealthFacilities';
import { WardAnalytics } from './components/Demographics/WardAnalytics';
import { WeatherDashboard } from './components/Weather/WeatherDashboard';
import { EventCalendarDashboard } from './components/EventCalendar/EventCalendarDashboard';
import { initializePushNotifications } from './services/pushNotifications';

export const App: React.FC = () => {
  // Active Tab - Defaulting to Panchpokhari Thangpal Rural Municipality (Municipal Digital Twins) Home Dashboard
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  const [activeTab, setActiveTab] = useState<
    'home' | 'charter' | 'sifarish' | 'scanner' | 'survey' | 'elibrary' | 'more' | 'revenue' | 'complaints' | 'sos' | 'projects' | 'directory' | 'tourism-twin' | 'cultural-museum' | 'health-facilities' | 'ward-analytics' | 'weather' | 'calendar'
  >((urlTab as any) || 'home');
  const [moreSubTab, setMoreSubTab] = useState<'hub' | 'revenue' | 'complaints' | 'sos'>('hub');
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  // Citizen Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<CitizenUser | null>(() => {
    try {
      const saved = localStorage.getItem('palika_citizen_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Initialize push notifications on app launch
    initializePushNotifications();
  }, []);

  const handleLoginSuccess = (user: CitizenUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('palika_citizen_user', JSON.stringify(user));
    } catch {}
    setIsAuthModalOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('palika_citizen_user');
    } catch {}
    setIsProfileModalOpen(false);
  };

  const handleOpenProfileOrAuth = () => {
    if (currentUser) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Language & Privacy Policy State
  const [currentLang, setCurrentLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('palika_app_language') as AppLanguage) || 'ne';
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleLanguageChange = (lang: AppLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('palika_app_language', lang);
  };

  // Notifications Drawer
  const [showNotifications, setShowNotifications] = useState(false);

  // 1. Charter State
  const [charterSearch, setCharterSearch] = useState('');
  const [selectedCharterCat, setSelectedCharterCat] = useState('सबै');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [selectedService, setSelectedService] = useState<BadapatraService | null>(null);

  // 2. Sifarish State
  const [sifarishSearch, setSifarishSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SifarishTemplate | null>(null);
  const [sifarishForm, setSifarishForm] = useState({
    name: '',
    phone: '',
    ward: 3,
    citizenshipNo: '',
    purpose: '',
  });
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);
  const [trackingNoInput, setTrackingNoInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<any>(null);

  // 3. Tax & Revenue State
  const [citizenIdInput, setCitizenIdInput] = useState('');
  const [kittaInput, setKittaInput] = useState('');
  const [taxData, setTaxData] = useState<any>(null);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<any>(null);

  // 4. Complaints State
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    desc: '',
    ward: 3,
    category: 'पूर्वाधार (सडक, खानेपानी, पुल)',
    name: '',
    phone: '',
    isAnonymous: false,
  });
  const [complaintGps, setComplaintGps] = useState<{ lat: number; lng: number } | null>(null);
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

  // 5. SOS State (Web Audio Siren)
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [strobeColor, setStrobeColor] = useState<'red' | 'blue'>('red');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Online / Offline listener
  useEffect(() => {
    const handleOn = () => setIsOnline(true);
    const handleOff = () => setIsOnline(false);
    window.addEventListener('online', handleOn);
    window.addEventListener('offline', handleOff);
    return () => {
      window.removeEventListener('online', handleOn);
      window.removeEventListener('offline', handleOff);
    };
  }, []);

  // Filtered charter services
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((s) => {
      const matchCat = selectedCharterCat === 'सबै' || s.category === selectedCharterCat;
      const q = charterSearch.toLowerCase();
      const matchQ = !q || s.title.toLowerCase().includes(q) || s.document.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [charterSearch, selectedCharterCat]);

  // Voice TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ne-NP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // SOS Siren Engine
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
      setIsSirenActive(true);
      setIsStrobeActive(true);
    } catch (e) {
      console.error('Audio siren error:', e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    setIsSirenActive(false);
    setIsStrobeActive(false);
  };

  // Strobe effect
  useEffect(() => {
    let t: any;
    if (isStrobeActive) {
      t = setInterval(() => {
        setStrobeColor((c) => (c === 'red' ? 'blue' : 'red'));
      }, 200);
    }
    return () => clearInterval(t);
  }, [isStrobeActive]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      paddingBottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
    }}>
      {/* ─── NATIVE APP HEADER: SHOWN ON NON-HOME SCREENS (digi AESTHETIC) ─── */}
      {activeTab !== 'home' && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            background: 'linear-gradient(135deg, #a81c3c 0%, #7c1d4a 45%, #253368 100%)',
            color: '#ffffff',
            paddingTop: 'calc(0.65rem + env(safe-area-inset-top, 0px))',
            paddingBottom: '0.65rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            boxShadow: '0 4px 14px rgba(168, 28, 60, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} />
              <span>गृहपृष्ठ</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img
                src="/panchpokhari-logo.png"
                alt="Panchpokhari Logo"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  backgroundColor: '#ffffff',
                  padding: '1px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 900 }}>
                {activeTab === 'sifarish'
                  ? 'ई-सिफारिस'
                  : activeTab === 'charter'
                  ? 'नागरिक बडापत्र'
                  : activeTab === 'scanner'
                  ? 'कागजात स्क्यानर'
                  : activeTab === 'survey'
                  ? 'एकिकृत घरधुरी सर्भे'
                  : activeTab === 'elibrary'
                  ? 'डिजिटल ई-पुस्तकालय'
                  : activeTab === 'revenue'
                  ? 'डिजिटल कर'
                  : activeTab === 'complaints'
                  ? 'नागरिक गुनासो'
                  : activeTab === 'sos'
                  ? 'आपतकालीन SOS'
                  : activeTab === 'directory'
                  ? 'कर्मचारी डाइरेक्टरी'
                  : activeTab === 'projects'
                  ? 'योजना ट्र्याकर'
                  : activeTab === 'tourism-twin'
                  ? 'पर्यटन तथा सम्पदा डिजिटल ट्विन'
                  : activeTab === 'cultural-museum'
                  ? 'सांस्कृतिक सङ्ग्रहालय'
                  : 'पाँचपोखरी थाङपाल गाउँपालिका'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Citizen Profile / Auth Trigger */}
            <button
              type="button"
              onClick={handleOpenProfileOrAuth}
              style={{
                background: currentUser ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.18)',
                border: currentUser ? '1px solid #10B981' : 'none',
                color: '#ffffff',
                padding: '5px 9px',
                borderRadius: '16px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={currentUser ? `${currentUser.fullName} - प्रोफाइल` : 'नागरिक लगइन'}
            >
              <UserCheck size={13} color={currentUser ? '#86EFAC' : '#ffffff'} />
              <span>{currentUser ? currentUser.fullName.split(' ')[0] : 'लगइन'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAiChatOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#ffffff',
                padding: '5px 9px',
                borderRadius: '16px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Bot size={13} />
              <span>AI साथी</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSideDrawerOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={18} />
            </button>
          </div>
        </header>
      )}

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main style={{
        flex: 1,
        padding: activeTab === 'home' ? '0 0.85rem' : '1rem',
        maxWidth: '520px',
        width: '100%',
        margin: '0 auto',
        overflowX: 'hidden',
      }}>
        {/* ========================================================================= */}
        {/* TAB 0: HOME DASHBOARD (पाँचपोखरी थाङपाल गाउँपालिका • Municipal Digital Twins) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <DigiHomeDashboard
            onNavigateTab={(tab) => {
              setActiveTab(tab as any);
              if (tab === 'more') setMoreSubTab('hub');
            }}
            onOpenAiChat={() => setIsAiChatOpen(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenMenuDrawer={() => setIsSideDrawerOpen(true)}
            currentUser={currentUser}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: WEATHER DASHBOARD (मौसम जानकारी) */}
        {/* ========================================================================= */}
        {activeTab === 'weather' && (
          <WeatherDashboard onBack={() => setActiveTab('home')} />
        )}

        {/* ========================================================================= */}
        {/* TAB: EVENT CALENDAR (कार्यक्रम क्यालेन्डर) */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <EventCalendarDashboard onBack={() => setActiveTab('home')} />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CITIZEN CHARTER (बडापत्र - MATCHING E-SIFARISH AESTHETICS) */}
        {/* ========================================================================= */}
        {activeTab === 'charter' && (
          <CitizenCharterHub
            onSelectService={setSelectedService}
            charterSearch={charterSearch}
            setCharterSearch={setCharterSearch}
          />
        )}

        {/* ========================================================================= */}
        {/* SUBTAB SHORTCUTS: DIRECTORY OR PROJECTS                                   */}
        {/* ========================================================================= */}
        {(activeTab === 'projects' || activeTab === 'directory') && (
          <CitizenServicesHub
            initialCategory="development"
            initialTab={activeTab === 'directory' ? 'directory' : 'projects'}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: E-SIFARISH (ई-सिफारिस - MATCHING REFERENCE UI SPECIFICATION) */}
        {/* ========================================================================= */}
        {activeTab === 'sifarish' && (
          <SifarishCategoryHub
            onSelectTemplate={setSelectedTemplate}
            trackingNoInput={trackingNoInput}
            setTrackingNoInput={setTrackingNoInput}
            trackedResult={trackedResult}
            setTrackedResult={setTrackedResult}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SMART DOCUMENT SCANNER (स्मार्ट कागजात स्क्यानर) */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && (
          <DocumentScanner
            onSelectForSifarish={(doc) => {
              setAttachedDocName(doc.title);
              setActiveTab('sifarish');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DYNAMIC HOUSEHOLD SURVEY ENGINE (एकिकृत घरधुरी सर्भे) */}
        {/* ========================================================================= */}
        {activeTab === 'survey' && (
          <DynamicSurveyEngine />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: E-LIBRARY (पालिका डिजिटल ई-पुस्तकालय) */}
        {/* ========================================================================= */}
        {activeTab === 'elibrary' && (
          <ELibrary />
        )}

        {/* ========================================================================= */}
        {/* TAB 5B: TOURISM & HERITAGE DIGITAL TWIN (पर्यटन तथा सम्पदा डिजिटल ट्विन) */}
        {/* ========================================================================= */}
        {activeTab === 'tourism-twin' && (
          <TourismHeritageTwin onBack={() => setActiveTab('home')} />
        )}

        {/* ========================================================================= */}
        {/* TAB 5C: CULTURAL MUSEUM (सांस्कृतिक सङ्ग्रहालय) */}
        {/* ========================================================================= */}
        {activeTab === 'cultural-museum' && (
          <CulturalMuseum onBack={() => setActiveTab('home')} />
        )}

        {/* ========================================================================= */}
        {/* TAB 6: MORE SERVICES (थप सेवा तथा सुशासन केन्द्र) */}
        {/* ========================================================================= */}
        {activeTab === 'more' && moreSubTab === 'hub' && (
          <div>
            {/* ─── 3 PRIMARY ACTION CARDS (MATCHING E-SIFARISH AESTHETICS) ─── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              {/* Card 1: डिजिटल कर */}
              <div
                onClick={() => setMoreSubTab('revenue')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #fde68a',
                  borderRadius: '16px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.08)';
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#fffbeb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)',
                  }}
                >
                  <Coins size={22} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C81' }}>
                    डिजिटल कर
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '1px' }}>
                    सम्पत्ति/व्यवसाय
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    backgroundColor: '#FFF3E0',
                    color: '#E65100',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  अनलाइन तिर्नुहोस्
                </span>
              </div>

              {/* Card 2: नागरिक गुनासो */}
              <div
                onClick={() => setMoreSubTab('complaints')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '16px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(15, 76, 129, 0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 76, 129, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 76, 129, 0.08)';
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(15, 76, 129, 0.15)',
                  }}
                >
                  <AlertTriangle size={22} color="#0F4C81" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C81' }}>
                    नागरिक गुनासो
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '1px' }}>
                    समस्या/उजुरी
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    backgroundColor: '#EBF3FA',
                    color: '#0F4C81',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  ट्र्याकिङ कोड
                </span>
              </div>

              {/* Card 3: आपतकालीन SOS */}
              <div
                onClick={() => setMoreSubTab('sos')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #fecdd3',
                  borderRadius: '16px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 29, 72, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.08)';
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.15)',
                  }}
                >
                  <AlertOctagon size={22} color="#e11d48" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e11d48' }}>
                    आपतकालीन SOS
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '1px' }}>
                    प्रहरी/एम्बुलेन्स
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    backgroundColor: '#ffe4e6',
                    color: '#e11d48',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  २४/७ सेवा
                </span>
              </div>
            </div>

            {/* Public Projects Tracker & Staff Directory Hub */}
            <CitizenServicesHub />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: DIGITAL TAX & REVENUE (डिजिटल कर) */}
        {/* ========================================================================= */}
        {(activeTab === 'revenue' || (activeTab === 'more' && moreSubTab === 'revenue')) && (
          <div>
            {activeTab === 'more' && (
              <button
                type="button"
                onClick={() => setMoreSubTab('hub')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                }}
              >
                ← सेवा केन्द्रमा फर्कनुहोस्
              </button>
            )}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '1rem',
                border: '1.5px solid #e2e8f0',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                💳 स्थानीय कर तथा अनलाइन भुक्तानी
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                सम्पत्ति कर, भूमि कर र व्यवसाय करको बक्यौता जाँच गरी eSewa, Khalti वा Fonepay बाट तत्काल तिर्नुहोस्।
              </p>
            </div>

            {/* Quick Tax Lookup */}
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                करदाता बक्यौता खोज्नुहोस्:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <input
                  type="text"
                  value={citizenIdInput}
                  onChange={(e) => setCitizenIdInput(e.target.value)}
                  placeholder="नागरिकता नं. वा करदाता संकेत..."
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTaxData({
                      owner: 'हरिकृष्ण तामाङ',
                      ward: 3,
                      kitta: '२३४, २३५ (थाङपालकोट)',
                      propertyTax: 450,
                      wasteCharge: 300,
                      discount: 75,
                      total: 675,
                    });
                  }}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    height: '40px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  कर विवरण हेर्नुहोस्
                </button>
              </div>

              {taxData && (
                <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    करदाता: {taxData.owner} (वडा नं. {taxData.ward})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>कित्ता नं: {taxData.kitta}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.4rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>
                    <span>सम्पत्ति कर:</span>
                    <strong>रु. {taxData.propertyTax}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>सरसफाइ सेवा शुल्क:</span>
                    <strong>रु. {taxData.wasteCharge}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#16a34a' }}>
                    <span>छुट (१०%):</span>
                    <strong>- रु. {taxData.discount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, color: '#b91c1c', marginTop: '0.4rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <span>कुल तिर्नुपर्ने:</span>
                    <span>रु. {taxData.total}</span>
                  </div>

                  <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentSuccessReceipt({
                          receiptNo: 'PPK-REC-2081-9921',
                          date: '२०८१/०६/१२',
                          amount: taxData.total,
                          owner: taxData.owner,
                        });
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Coins size={16} />
                      <span>eSewa / Fonepay बाट तिर्नुहोस्</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentSuccessReceipt && (
                <div style={{ marginTop: '1rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1.5px solid #86efac' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} />
                    <span>भुक्तानी सफल भयो! (मलेप फारम नं. १०२)</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.4rem' }}>
                    रसिद नं: <strong>{paymentSuccessReceipt.receiptNo}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    जम्मा बुझाएको: <strong>रु. {paymentSuccessReceipt.amount}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('डिजिटल कर चुक्ता प्रमाणपत्र (PDF) डाउनलोड हुँदैछ...')}
                    style={{
                      marginTop: '0.65rem',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={14} />
                    <span>रसिद PDF डाउनलोड गर्नुहोस्</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: COMPLAINTS & GRIEVANCE (नागरिक गुनासो) */}
        {/* ========================================================================= */}
        {(activeTab === 'complaints' || (activeTab === 'more' && moreSubTab === 'complaints')) && (
          <div>
            {activeTab === 'more' && (
              <button
                type="button"
                onClick={() => setMoreSubTab('hub')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                }}
              >
                ← सेवा केन्द्रमा फर्कनुहोस्
              </button>
            )}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '1rem',
                border: '1.5px solid #e2e8f0',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                📢 नागरिक गुनासो तथा समस्या दर्ता
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                सडक, खानेपानी, बिजुली वा सेवा ढिलाइ सम्बन्धी गुनासो फोटो र जीपीएस लोकेसन सहित पठाउनुहोस्।
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setComplaintSuccess(`CMP-2081-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>गुनासोको विषय:</label>
                <input
                  type="text"
                  required
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  placeholder="उदा. वडा नं. २ मा खानेपानी पाइप फुटेको..."
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    marginTop: '2px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>गुनासो विवरण:</label>
                <textarea
                  required
                  rows={3}
                  value={complaintForm.desc}
                  onChange={(e) => setComplaintForm({ ...complaintForm, desc: e.target.value })}
                  placeholder="समस्याको विस्तृत जानकारी खुलाउनुहोस्..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    marginTop: '2px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>सम्बन्धित वडा:</label>
                  <select
                    value={complaintForm.ward}
                    onChange={(e) => setComplaintForm({ ...complaintForm, ward: Number(e.target.value) })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>जीपीएस लोकेसन:</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setComplaintGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        });
                      } else {
                        setComplaintGps({ lat: 27.8721, lng: 85.6214 });
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: complaintGps ? '#f0fdf4' : '#f8fafc',
                      color: complaintGps ? '#16a34a' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={14} />
                    <span>{complaintGps ? 'GPS सुरक्षित भयो' : 'लोकेसन लिनुहोस्'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  height: '42px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={16} />
                <span>गुनासो दर्ता गर्नुहोस्</span>
              </button>

              {complaintSuccess && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>
                    ✓ गुनासो सफलतापूर्वक दर्ता भयो!
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px' }}>
                    ट्र्याकिङ कोड: <strong>{complaintSuccess}</strong>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: EMERGENCY SOS (आपतकालीन SOS) */}
        {/* ========================================================================= */}
        {(activeTab === 'sos' || (activeTab === 'more' && moreSubTab === 'sos')) && (
          <div>
            {activeTab === 'more' && (
              <button
                type="button"
                onClick={() => setMoreSubTab('hub')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                }}
              >
                ← सेवा केन्द्रमा फर्कनुहोस्
              </button>
            )}
            {/* Siren Emergency Box */}
            <div
              style={{
                backgroundColor: isStrobeActive ? (strobeColor === 'red' ? '#ef4444' : '#3b82f6') : '#ffffff',
                color: isStrobeActive ? '#ffffff' : '#0f172a',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '2px solid #ef4444',
                textAlign: 'center',
                marginBottom: '1.25rem',
                transition: 'background-color 0.1s ease',
                boxShadow: isSirenActive ? '0 0 25px rgba(239, 68, 68, 0.5)' : '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '0.35rem' }}>
                🚨 आपतकालीन SOS उद्धार साइरन (अफलाइन)
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '0 0 1rem 0' }}>
                बाढी, पहिरो वा आकस्मिक दुर्घटनामा तत्काल चर्को साइरन बजाउनुहोस्:
              </p>

              <button
                type="button"
                onClick={isSirenActive ? stopSiren : startSiren}
                style={{
                  backgroundColor: isSirenActive ? '#ffffff' : '#ef4444',
                  color: isSirenActive ? '#ef4444' : '#ffffff',
                  border: 'none',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  margin: '0 auto',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <AlertOctagon size={28} />
                <span>{isSirenActive ? 'बन्द' : 'SOS'}</span>
              </button>
            </div>

            {/* 1-Tap Emergency Hotlines */}
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
              📞 १-ट्याप आपतकालीन हटलाइनहरू (Direct Call):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.desc}</div>
                    {c.person && <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '2px' }}>{c.person}</div>}
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Phone size={14} />
                    <span>कल</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── digi OFFICIAL SMARTPALIKA BOTTOM NAVIGATION DOCK ─── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1E355B',
          background: 'linear-gradient(180deg, #243E6B 0%, #172A4A 100%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: '6px',
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: 'calc(5px + env(safe-area-inset-bottom, 0px))',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto 1fr 1fr',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'home' ? '#F59E0B' : '#ffffff',
            opacity: activeTab === 'home' ? 1 : 0.75,
            padding: '4px 0',
            transition: 'all 0.15s ease',
          }}
        >
          <Home size={19} />
          <span style={{ fontSize: '0.62rem', fontWeight: activeTab === 'home' ? 800 : 500, marginTop: '2px' }}>
            गृहपृष्ठ
          </span>
        </button>

        {/* 2. Badapatra */}
        <button
          type="button"
          onClick={() => setActiveTab('charter')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'charter' ? '#F59E0B' : '#ffffff',
            opacity: activeTab === 'charter' ? 1 : 0.75,
            padding: '4px 0',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={19} />
          <span style={{ fontSize: '0.62rem', fontWeight: activeTab === 'charter' ? 800 : 500, marginTop: '2px' }}>
            बडापत्र
          </span>
        </button>

        {/* 3. CENTER HERO FLOATING BUTTON (digi NAMASTE AVATAR - SMARTPALIKA ASSISTANT) */}
        <div style={{ position: 'relative', width: '56px', height: '36px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setIsAiChatOpen(true)}
            style={{
              position: 'absolute',
              top: '-18px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '3px solid #DC2626',
              boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              overflow: 'hidden',
              transition: 'transform 0.15s ease',
            }}
            title="नमस्ते स्मार्ट सहायक"
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ fontSize: '1.45rem', lineHeight: 1 }}>🙏</div>
            <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#DC2626', marginTop: '1px' }}>सहायक</span>
          </button>
        </div>

        {/* 4. e-Sifarish */}
        <button
          type="button"
          onClick={() => setActiveTab('sifarish')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'sifarish' ? '#F59E0B' : '#ffffff',
            opacity: activeTab === 'sifarish' ? 1 : 0.75,
            padding: '4px 0',
            transition: 'all 0.15s ease',
          }}
        >
          <FileCheck2 size={19} />
          <span style={{ fontSize: '0.62rem', fontWeight: activeTab === 'sifarish' ? 800 : 500, marginTop: '2px' }}>
            सिफारिस
          </span>
        </button>

        {/* 5. More / Citizen Services */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('more');
            setMoreSubTab('hub');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'more' ? '#F59E0B' : '#ffffff',
            opacity: activeTab === 'more' ? 1 : 0.75,
            padding: '4px 0',
            transition: 'all 0.15s ease',
          }}
        >
          <LayoutGrid size={19} />
          <span style={{ fontSize: '0.62rem', fontWeight: activeTab === 'more' ? 800 : 500, marginTop: '2px' }}>
            थप सेवा
          </span>
        </button>
      </nav>

      {/* ─── NOTIFICATIONS DRAWER ─── */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '380px',
              backgroundColor: '#fff',
              height: '100%',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                📢 पालिका सूचना तथा सतर्कता
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    backgroundColor: n.level === 'urgent' ? '#fff1f2' : '#f8fafc',
                    border: `1px solid ${n.level === 'urgent' ? '#fecdd3' : '#e2e8f0'}`,
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: n.level === 'urgent' ? '#e11d48' : '#0f172a' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 4px 0' }}>{n.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.4 }}>{n.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHARTER DETAIL MODAL ─── */}
      {selectedService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#EBF3FA', color: '#0F4C81', padding: '3px 10px', borderRadius: '8px' }}>
                  {selectedService.category}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F4C81', margin: '6px 0 0 0' }}>
                  {selectedService.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
              <div>दस्तुर: <strong style={{ color: '#E65100' }}>{selectedService.price}</strong></div>
              <div>समय: <strong>{selectedService.serviceTime}</strong></div>
              <div>शाखा: <strong>{selectedService.provider}</strong></div>
              <div>जिम्मेवार: <strong>{selectedService.official}</strong></div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                📋 आवश्यक कागजात तथा प्रमाण:
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                {selectedService.document}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => speakText(`${selectedService.title}। लाग्ने दस्तुर ${selectedService.price}। लाग्ने समय ${selectedService.serviceTime}। आवश्यक कागजात: ${selectedService.document}`)}
                style={{
                  flex: 1,
                  backgroundColor: '#f1f5f9',
                  color: '#0F4C81',
                  border: '1px solid #cbd5e1',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Volume2 size={16} />
                <span>आवाजमा सुन्नुहोस्</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setActiveTab('sifarish');
                }}
                style={{
                  flex: 1.2,
                  background: 'linear-gradient(135deg, #E9A873 0%, #E68A48 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(230, 138, 72, 0.35)',
                }}
              >
                <FileCheck2 size={16} />
                <span>ई-सिफारिस भर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIFARISH APPLICATION MODAL ─── */}
      {selectedTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                {selectedTemplate.name} फारम
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const appNo = `PPK-SIF-${sifarishForm.ward}-${Math.floor(1000 + Math.random() * 9000)}`;
                setSubmittedAppNo(appNo);
                setSelectedTemplate(null);
                setTrackingNoInput(appNo);
                setTrackedResult({
                  appNo,
                  name: sifarishForm.name,
                  service: selectedTemplate.name,
                  ward: sifarishForm.ward,
                  status: 'दर्ता सम्पन्न (वडा सचिव प्रमाणिकरण प्रतीक्षा)',
                  date: '२०८१/०६/१२',
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>आवेदकको पूरा नाम:</label>
                <input
                  type="text"
                  required
                  value={sifarishForm.name}
                  onChange={(e) => setSifarishForm({ ...sifarishForm, name: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>सम्पर्क मोबाइल नं.:</label>
                <input
                  type="tel"
                  required
                  value={sifarishForm.phone}
                  onChange={(e) => setSifarishForm({ ...sifarishForm, phone: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>नागरिकता नं. / जन्मदर्ता नं.:</label>
                <input
                  type="text"
                  required
                  value={sifarishForm.citizenshipNo}
                  onChange={(e) => setSifarishForm({ ...sifarishForm, citizenshipNo: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>सिफारिसको प्रयोजन:</label>
                <input
                  type="text"
                  required
                  value={sifarishForm.purpose}
                  onChange={(e) => setSifarishForm({ ...sifarishForm, purpose: e.target.value })}
                  placeholder="उदा. उच्च शिक्षा, राहदानी, जग्गा खरिदबिक्री..."
                  style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>प्रमाणित कागजात संलग्न गर्नुहोस्:</label>
                {attachedDocName ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#166534',
                      marginTop: '4px',
                    }}
                  >
                    <span>✓ {attachedDocName}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedDocName(null)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setActiveTab('scanner');
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      border: '1px dashed #0284c7',
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    <Camera size={14} />
                    <span>कागजात स्क्यानरबाट छान्नुहोस् वा खिच्नुहोस्</span>
                  </button>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569' }}>
                दस्तुर: <strong>रु. {selectedTemplate.fee}</strong> • पेश गर्नुपर्ने कागजात: {selectedTemplate.requiredDocs.join(', ')}
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  height: '40px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.35rem',
                }}
              >
                दरखास्त पेश गर्नुहोस्
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── FLOATING AI COMPANION TRIGGER BUTTON ─── */}
      {/* ─── FLOATING AI COMPANION TRIGGER BUTTON (ONLY ON NON-HOME SCREENS) ─── */}
      {!isAiChatOpen && activeTab !== 'home' && (
        <button
          type="button"
          onClick={() => setIsAiChatOpen(true)}
          aria-label="डिजिपालिका AI नागरिक सहायक खोल्नुहोस्"
          style={{
            position: 'fixed',
            bottom: '72px',
            right: '16px',
            zIndex: 90,
            background: 'linear-gradient(135deg, #a81c3c 0%, #0F4C81 100%)',
            color: '#ffffff',
            border: '1.5px solid rgba(245, 158, 11, 0.6)',
            borderRadius: '30px',
            padding: '9px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(168, 28, 60, 0.35), 0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={16} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 900, lineHeight: 1 }}>AI साथी</div>
            <div style={{ fontSize: '0.55rem', opacity: 0.85, marginTop: '2px' }}>सोध्नुहोस्</div>
          </div>
          <Sparkles size={13} color="#fde047" />
        </button>
      )}

      {activeTab === 'health-facilities' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, backgroundColor: '#fff', overflowY: 'auto' }}>
          <HealthFacilities onBack={() => setActiveTab('home')} />
        </div>
      )}

      {activeTab === 'ward-analytics' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, backgroundColor: '#fff', overflowY: 'auto' }}>
          <WardAnalytics onBack={() => setActiveTab('home')} />
        </div>
      )}

      {/* ─── AI PALIKA ASSISTANT CHATBOT MODAL ─── */}
      <AiPalikaChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsAiChatOpen(false);
        }}
      />

      {/* ─── digi OFFICIAL SIDE DRAWER (HAMBURGER MENU) ─── */}
      <DigiSideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'more') setMoreSubTab('hub');
        }}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
      />

      {/* ─── CITIZEN AUTHENTICATION MODAL (OTP / NAGARIK APP / NIN) ─── */}
      <CitizenAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ─── CITIZEN DIGITAL PROFILE MODAL (ID CARD / SIFARISH / TAXES) ─── */}
      {currentUser && (
        <CitizenProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setIsProfileModalOpen(false);
          }}
        />
      )}

      {/* ─── PLAY STORE / APP STORE PRIVACY POLICY MODAL ─── */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default App;

