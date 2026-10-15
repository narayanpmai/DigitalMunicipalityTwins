import React, { useState, useEffect } from 'react';
import {
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  FileText,
  FileCheck2,
  Coins,
  AlertTriangle,
  Users,
  HardHat,
  Waves,
  UserCheck,
  Truck,
  Scale,
  Wrench,
  Camera,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Eye,
  Info,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Search,
  Compass,
  Landmark,
  LogIn,
  User,
  QrCode,
  Lock,
  Home,
  Stethoscope,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { CitizenUser } from '../../types';
import { AppLanguage } from '../../utils/localization';
import apiClient from '../../services/api';

interface DigiHomeDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenAiChat: () => void;
  onOpenNotifications: () => void;
  onOpenMenuDrawer: () => void;
  currentUser: CitizenUser | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  currentLang?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
}

export const DigiHomeDashboard: React.FC<DigiHomeDashboardProps> = ({
  onNavigateTab,
  onOpenAiChat,
  onOpenNotifications,
  onOpenMenuDrawer,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  currentLang = 'ne',
  onLanguageChange,
}) => {
  // Current active news index
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<any | null>(null);
  const [isChairmanModalOpen, setIsChairmanModalOpen] = useState(false);

  // Demographics State
  const [demoStats, setDemoStats] = useState<{ total_population: number; total_households: number } | null>(null);
  const [isLoadingDemoStats, setIsLoadingDemoStats] = useState(true);

  // Environmental Risks / Flood Alert State
  const [riskStats, setRiskStats] = useState<{ active_alerts: number } | null>(null);
  const [isLoadingRisks, setIsLoadingRisks] = useState(true);

  // Fetch Demographics Data
  useEffect(() => {
    const fetchDemoStats = async () => {
      try {
        const response = await apiClient.get('/demographics/dashboard/stats');
        if (response.data) {
          setDemoStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch demographic stats:', error);
      } finally {
        setIsLoadingDemoStats(false);
      }
    };

    const fetchRiskStats = async () => {
      try {
        const response = await apiClient.get('/gis/environmental-risks/stats');
        if (response.data) {
          setRiskStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch risk stats:', error);
      } finally {
        setIsLoadingRisks(false);
      }
    };

    fetchDemoStats();
    fetchRiskStats();
  }, []);

  const NEWS_ITEMS = [
    {
      id: 1,
      title: 'आ.व. २०८१/८२ का वडास्तरीय योजनाहरूको उपभोक्ता समिति सम्झौता सम्बन्धी अत्यन्त जरुरी सूचना।',
      date: '२०८१/०६/१२',
      category: 'योजना सम्झौता',
      fullText:
        'पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत चालु आर्थिक वर्ष २०८१/८२ का लागि स्वीकृत वडास्तरीय तथा पालिकास्तरीय विकास योजनाहरू (सडक, खानेपानी, सिंचाई) को उपभोक्ता समिति गठन गरी १५ दिनभित्र योजना शाखामा सम्झौता गर्न सम्बन्धित सबै उपभोक्ता समितिहरूलाई सूचित गरिन्छ।',
    },
    {
      id: 2,
      title: 'सम्पत्ति कर तथा व्यवसाय कर समयमै चुक्ता गर्दा १०% सम्म विशेष छुट योजना।',
      date: '२०८१/०६/१०',
      category: 'राजस्व छुट',
      fullText:
        'पाँचपोखरी थाङपाल गाउँपालिकाको अनलाइन डिजिटल कर प्रणाली मार्फत चालु आ.व. को असोज मसान्तभित्र सम्पूर्ण सम्पत्ति कर, भूमि कर र व्यवसाय कर चुक्ता गर्ने करदाताहरूलाई १०% सम्मको विशेष छुट प्रदान गरिएको छ। घरमै बसेर मोबाइलबाटै तिर्न सकिनेछ।',
    },
    {
      id: 3,
      title: 'कागजबिहीन ई-सिफारिस प्रणाली मार्फत २३ वटा सेवा नागरिक मोबाइल एपमै सुचारु।',
      date: '२०८१/०६/०५',
      category: 'डिजिटल सुशासन',
      fullText:
        'वडा कार्यालयहरूलाई पूर्ण रूपमा पेपरलेस बनाउने अभियान अन्तर्गत नागरिकता, चारकिल्ला, घरबाटो, व्यवसाय दर्ता र सामाजिक सुरक्षा लगायत २३ वटा सेवा अब मोबाइल एपबाटै आवेदन दिन र क्युआर कोड सहितको डिजिटल सिफारिस पत्र प्राप्त गर्न सकिनेछ।',
    },
    {
      id: 4,
      title: 'इन्द्रावती तथा याङ्ग्री नदी तटीय क्षेत्रका बासिन्दाहरूलाई बाढी पूर्वसूचना सतर्कता।',
      date: '२०८१/०६/०२',
      category: 'विपद् सतर्कता',
      fullText:
        'पाँचपोखरी जलाधार क्षेत्रमा निरन्तर वर्षा भइरहेकोले नदी किनारका बस्तीहरूमा जडान गरिएको IoT पूर्वसूचना साइरन तथा मोबाइल बाढी अलर्ट प्रणाली सक्रिय अवस्थामा रहेको छ। तटीय क्षेत्रका बासिन्दाहरूलाई उच्च सतर्कता अपनाउन अनुरोध गरिन्छ।',
    },
  ];

  const handleNextNews = () => {
    setCurrentNewsIdx((prev) => (prev + 1) % NEWS_ITEMS.length);
  };

  const handlePrevNews = () => {
    setCurrentNewsIdx((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const activeNews = NEWS_ITEMS[currentNewsIdx];

  return (
    <div style={{ paddingBottom: '90px', width: '100%' }}>
      {/* ========================================================================= */}
      {/* 1. digi SIGNATURE TOP HEADER WITH GRADIENT & LATEST NEWS                   */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #a81c3c 0%, #7c1d4a 45%, #253368 100%)',
          color: '#ffffff',
          borderRadius: '0 0 28px 28px',
          paddingTop: 'calc(1rem + env(safe-area-inset-top, 24px))',
          paddingBottom: '1.4rem',
          paddingLeft: '1.15rem',
          paddingRight: '1.15rem',
          boxShadow: '0 8px 32px rgba(168, 28, 60, 0.3)',
          position: 'relative',
          margin: '0 -0.85rem 1.1rem -0.85rem',
        }}
      >
        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
          {/* Palika / digi Circular Emblem */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2.5px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                flexShrink: 0,
                padding: '1px',
              }}
            >
              {/* Official Panchpokhari Logo */}
              <img
                src="/panchpokhari-logo.png"
                alt="पाँचपोखरी थाङपाल गाउँपालिका"
                style={{ display: 'block', margin: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, letterSpacing: '0.3px', lineHeight: 1.2 }}>
                पाँचपोखरी थाङपाल गाउँपालिका
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span style={{ fontWeight: 700 }}>Municipal Digital Twins</span>
                <span style={{ fontSize: '0.6rem', backgroundColor: 'rgba(255,255,255,0.22)', padding: '1px 6px', borderRadius: '10px' }}>
                  सिन्धुपाल्चोक • बागमती
                </span>
              </div>
            </div>
          </div>

          {/* Right Hamburger Menu & Notification Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenNotifications}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              title="सूचनाहरू"
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#F59E0B',
                }}
              />
            </button>

            <button
              type="button"
              onClick={onOpenMenuDrawer}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="मुख्य मेनू"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* ─── LANGUAGE SWITCHER PILL BAR ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.22)',
            borderRadius: '12px',
            padding: '4px 6px',
            marginBottom: '0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.14)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#FDE047', paddingLeft: '4px' }}>
            {currentLang === 'hy'
              ? 'तासी देलेक (ह्योल्मो युल्सा)'
              : currentLang === 'ta'
              ? 'फ्याफुल्ला (तामाङ ह्युल)'
              : currentLang === 'en'
              ? 'Welcome to Panchpokhari'
              : 'नमस्ते! पाँचपोखरी थाङपाल'}
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            {[
              { id: 'ne', label: 'नेपाली' },
              { id: 'hy', label: 'ह्योल्मो' },
              { id: 'ta', label: 'तामाङ' },
              { id: 'en', label: 'EN' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLanguageChange?.(l.id as AppLanguage)}
                style={{
                  backgroundColor: currentLang === l.id ? '#F59E0B' : 'transparent',
                  color: currentLang === l.id ? '#0F172A' : '#ffffff',
                  border: 'none',
                  padding: '3px 7px',
                  borderRadius: '8px',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── CITIZEN PROFILE / AUTHENTICATION BAR ─── */}
        <div
          style={{
            backgroundColor: currentUser ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '8px 12px',
            border: currentUser ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.18)',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {currentUser ? (
            <div
              onClick={onOpenProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #10B981',
                  color: '#0F4C81',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}
              >
                {currentUser.fullName.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.fullName}
                  </span>
                  <span style={{ backgroundColor: '#10B981', color: '#fff', fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: '6px' }}>
                    प्रमाणित
                  </span>
                </div>
                <div style={{ fontSize: '0.66rem', opacity: 0.9, marginTop: '1px' }}>
                  वडा नं {currentUser.permanentAddress.wardNo} ({currentUser.permanentAddress.tole}) • मेरो पालिका प्रोफाइल
                </div>
              </div>
              <ChevronRight size={16} color="#FDE047" />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={16} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>अतिथि नागरिक (Guest User)</div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.85 }}>व्यक्तिगत सेवा र प्रोफाइलका लागि लगइन आवश्यक</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                }}
              >
                <LogIn size={13} />
                <span>नागरिक लगइन</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── LATEST NEWS TICKER SECTION (digi STYLE) ─── */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255,255,255,0.22)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#FDE047' }}>
                Latest News
              </span>
              <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '8px' }}>
                {activeNews.category}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Previous / Next News arrows */}
              <button
                type="button"
                onClick={handlePrevNews}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '2px',
                  opacity: 0.8,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextNews}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '2px',
                  opacity: 0.8,
                }}
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setSelectedNoticeModal(activeNews)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                }}
              >
                <span>View</span>
                <Info size={12} color="#0F4C81" />
              </button>
            </div>
          </div>

          <p
            onClick={() => setSelectedNoticeModal(activeNews)}
            style={{
              fontSize: '0.8rem',
              lineHeight: 1.4,
              margin: '3px 0 0 0',
              opacity: 0.95,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {activeNews.title}
          </p>
        </div>
      </div>

      {/* ─── DEMOGRAPHICS AT A GLANCE (API DRIVEN) ─── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Palika At a Glance</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(एक झलक)</span>
          </h3>
          <span
            onClick={() => onNavigateTab('ward-analytics')}
            style={{ fontSize: '0.72rem', color: '#0F4C81', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            वडागत तथ्यांक <ChevronRight size={14} />
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}>
            <Users size={28} color="#0F4C81" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E293B' }}>
              {isLoadingDemoStats ? '...' : demoStats?.total_population?.toLocaleString() || 'N/A'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>कुल जनसंख्या</div>
          </div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}>
            <Home size={28} color="#E65100" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E293B' }}>
              {isLoadingDemoStats ? '...' : demoStats?.total_households?.toLocaleString() || 'N/A'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>कुल घरधुरी</div>
          </div>
        </div>
      </div>

      {/* ─── MUNICIPAL DIGITAL TWIN 3D GIS SPOTLIGHT BANNER ─── */}
      <div
        id="municipal-digital-twins-banner"
        onClick={() => onNavigateTab('tourism-twin')}
        style={{
          background: 'linear-gradient(135deg, #0F4C81 0%, #1E355B 60%, #0F2342 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 14px rgba(15, 76, 129, 0.18)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1.5px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} color="#FDE047" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 900 }}>Municipal Digital Twins</span>
              <span style={{ fontSize: '0.58rem', backgroundColor: '#F59E0B', color: '#0F172A', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                ३D GIS
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', opacity: 0.85, marginTop: '2px' }}>
              ८ वटै वडाको ३D भू-धरातल, घरधुरी ODK सर्भे र प्रत्यक्ष आयोजना ट्र्याकिङ
            </div>
          </div>
        </div>
        <ChevronRight size={18} color="#FDE047" />
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: INTERACTIVE SERVICES (अन्तरक्रियात्मक सेवा)                  */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Interactive Services</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(अन्तरक्रियात्मक)</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
            <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
            <ChevronRight size={16} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
          {/* Card 1: Chairman's Secretariat (अध्यक्ष सचिवालय) */}
          <div
            onClick={() => setIsChairmanModalOpen(true)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Chairman Avatar / Photo with Nepali Topi */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                border: '2px solid #38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="14" r="8" fill="#FBCFE8" />
                {/* Traditional Nepali Dhaka Topi */}
                <path d="M12 11L20 4L28 11H12Z" fill="#991B1B" />
                <path d="M14 9L20 4L26 9" stroke="#FDE047" strokeWidth="1" />
                <path d="M8 36C8 28 13 24 20 24C27 24 32 28 32 36" fill="#0F4C81" />
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              अध्यक्ष सचिवालय
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#0F4C81', fontWeight: 700, marginBottom: '2px' }}>
              Chairman's Secretariat
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              संवाद, भेटघाट तथा प्रत्यक्ष सम्पर्क
            </span>
          </div>

          {/* Card 2: Citizen Complaint (नागरिक गुनासो) */}
          <div
            onClick={() => onNavigateTab('complaints')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Grievance Icon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="14" r="8" fill="#FED7AA" />
                <path d="M14 10L20 5L26 10H14Z" fill="#1E293B" />
                <path d="M8 36C8 28 13 24 20 24C27 24 32 28 32 36" fill="#D97706" />
                <path d="M17 24L20 29L23 24" fill="#FFFFFF" />
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              नागरिक गुनासो
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#D97706', fontWeight: 700, marginBottom: '2px' }}>
              Citizen Complaint
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              गुनासो दर्ता, सुनुवाइ तथा ट्र्याकिङ
            </span>
          </div>

          {/* Card 3: Weather Info (मौसम जानकारी) */}
          <div
            onClick={() => onNavigateTab('weather')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Weather Icon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                border: '2px solid #0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M14 24C10.6863 24 8 21.3137 8 18C8 14.6863 10.6863 12 14 12C14.7723 12 15.5103 12.146 16.1884 12.4087C17.478 9.2559 20.4907 7 24 7C28.9706 7 33 11.0294 33 16C33 16.5369 32.953 17.0628 32.8631 17.5746C35.2534 18.4239 37 20.6729 37 23.5C37 26.5376 34.5376 29 31.5 29H14Z" fill="#38BDF8" opacity="0.8"/>
                <path d="M16 26V32M22 26V32M28 26V32" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              मौसम जानकारी
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#0284C7', fontWeight: 700, marginBottom: '2px' }}>
              Weather Info
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              वर्षा मापन, तापक्रम र अलर्ट
            </span>
          </div>

          {/* Card 4: Event Calendar (कार्यक्रम क्यालेन्डर) */}
          <div
            onClick={() => onNavigateTab('calendar')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Calendar Icon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#EDE9FE',
                border: '2px solid #8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="8" y="10" width="24" height="22" rx="4" fill="#C4B5FD" opacity="0.3" stroke="#8B5CF6" strokeWidth="2" />
                <path d="M14 7V13" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 7V13" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 18H32" stroke="#8B5CF6" strokeWidth="2" />
                <circle cx="14" cy="24" r="1.5" fill="#8B5CF6" />
                <circle cx="20" cy="24" r="1.5" fill="#8B5CF6" />
                <circle cx="26" cy="24" r="1.5" fill="#8B5CF6" />
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              कार्यक्रम क्यालेन्डर
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#8B5CF6', fontWeight: 700, marginBottom: '2px' }}>
              Event Calendar
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              सार्वजनिक कार्यक्रम र बैठकहरू
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: EGOVERNANCE SERVICES (ई-सुशासन सेवाहरू)                     */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>eGovernance Services</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(ई-सुशासन)</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
              <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
              <ChevronRight size={16} style={{ cursor: 'pointer' }} />
            </div>
            <Eye size={17} color="#0F4C81" style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
          {/* Card 1: e-Sifarish */}
          <div
            onClick={() => onNavigateTab('sifarish')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #BFDBFE',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.05)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* eSifarish Official Vector Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <rect x="4" y="6" width="26" height="20" rx="3" stroke="#DC2626" strokeWidth="2" fill="#FFFFFF" />
                <circle cx="11" cy="14" r="3" fill="#0F4C81" />
                <path d="M7 21C7 18 9 18 11 18C13 18 15 18 15 21" fill="#0F4C81" />
                <rect x="17" y="11" width="10" height="2" rx="1" fill="#94A3B8" />
                <rect x="17" y="15" width="8" height="2" rx="1" fill="#CBD5E1" />
                <rect x="17" y="19" width="6" height="2" rx="1" fill="#CBD5E1" />
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              ई-सिफारिस
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#0F4C81', fontWeight: 700, marginBottom: '2px' }}>
              e-Sifarish
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              २३ वटा कागजबिहीन अनलाइन सिफारिस सेवा
            </span>
          </div>

          {/* Card 2: e-Tax */}
          <div
            onClick={() => onNavigateTab('revenue')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #FDE68A',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* eTax Official Vector Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                {/* Gold Coins Stack */}
                <ellipse cx="14" cy="22" rx="7" ry="2.5" fill="#F59E0B" />
                <ellipse cx="14" cy="18" rx="7" ry="2.5" fill="#FBBF24" />
                <ellipse cx="14" cy="14" rx="7" ry="2.5" fill="#FDE047" />
                {/* % Tax Red Badge */}
                <circle cx="23" cy="12" r="6" fill="#DC2626" />
                <text x="20.5" y="15" fill="#FFFFFF" fontSize="8" fontWeight="900">%</text>
              </svg>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              डिजिटल कर
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#D97706', fontWeight: 700, marginBottom: '2px' }}>
              e-Tax
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              सम्पत्ति, भूमि तथा व्यवसाय कर भुक्तानी
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: INFORMATION (सूचना तथा जानकारी)                             */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Information</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(विवरण तथा जानकारी)</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
            <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
            <ChevronRight size={16} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
          {/* Card 1: Delegates/Employee */}
          <div
            onClick={() => onNavigateTab('directory')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Delegates Vector Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FFF1F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <Users size={26} color="#E11D48" />
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              जनप्रतिनिधि / कर्मचारी
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#E11D48', fontWeight: 700, marginBottom: '2px' }}>
              Delegates & Staff
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              गाउँपालिका अध्यक्ष, उपाध्यक्ष तथा वडा सचिवहरू
            </span>
          </div>

          {/* Card 2: Citizen Charter */}
          <div
            onClick={() => onNavigateTab('charter')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Citizen Charter Vector Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <FileText size={26} color="#0F4C81" />
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              नागरिक वडापत्र
            </h4>
            <div style={{ fontSize: '0.66rem', color: '#0F4C81', fontWeight: 700, marginBottom: '2px' }}>
              Citizen Charter
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              वडा तथा पालिकाका सेवा, शुल्क र समयसीमा
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4.5. SECTION: HERITAGE & CULTURE (पर्यटन, सम्पदा तथा सङ्ग्रहालय)          */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Heritage & Cultural Museum</span>
            <span style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 700 }}>(पर्यटन तथा सङ्ग्रहालय)</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
            <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
            <ChevronRight size={16} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
          {/* Card 1: पर्यटन तथा सम्पदा डिजिटल ट्विन */}
          <div
            onClick={() => onNavigateTab('tourism-twin')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #BAE6FD',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.08)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#EFF6FF',
                color: '#0284C7',
                fontSize: '0.55rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              ३D GIS
            </span>

            {/* Tourism Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#F0F9FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <Compass size={26} color="#0284C7" />
            </div>

            <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              पर्यटन तथा सम्पदा
            </h4>
            <div style={{ fontSize: '0.64rem', color: '#0284C7', fontWeight: 700, marginBottom: '2px' }}>
              Heritage Digital Twin
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              ५ कुण्ड, आमायाङ्ग्री, ३D पदमार्ग र अडियो गाइड
            </span>
          </div>

          {/* Card 2: सांस्कृतिक सङ्ग्रहालय */}
          <div
            onClick={() => onNavigateTab('cultural-museum')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #FECDD3',
              padding: '1.1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#FFF1F2',
                color: '#E11D48',
                fontSize: '0.55rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              सङ्ग्रह
            </span>

            {/* Museum Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FFF1F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <Landmark size={26} color="#E11D48" />
            </div>

            <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px 0' }}>
              सांस्कृतिक सङ्ग्रहालय
            </h4>
            <div style={{ fontSize: '0.64rem', color: '#E11D48', fontWeight: 700, marginBottom: '2px' }}>
              Cultural Museum
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.25 }}>
              ह्योल्मो प्राचीन कलाकृति, पाण्डुलिपि र ३D भ्यू
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: SMART CIVIC SERVICES (अति आवश्यक ५ स्मार्ट सेवा)             */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Smart Civic Services</span>
            <span style={{ fontSize: '0.72rem', color: '#E65100', fontWeight: 700 }}>(५ स्मार्ट सेवा)</span>
          </h3>
          <span
            onClick={() => onNavigateTab('more')}
            style={{ fontSize: '0.72rem', color: '#0F4C81', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            सबै हेर्नुहोस् <ChevronRight size={14} />
          </span>
        </div>

        {/* 5 Horizontal Scrollable Cards */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
          }}
        >
          {/* Card 1: बाढी पूर्वसूचना */}
          <div
            onClick={() => onNavigateTab('more')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1rem 0.85rem',
              minWidth: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <Waves size={22} color="#0284C7" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>बाढी पूर्वसूचना</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>IoT नदी सेन्सर</div>
            <span style={{ fontSize: '0.6rem', color: isLoadingRisks ? '#64748B' : (riskStats?.active_alerts ? '#EF4444' : '#16A34A'), fontWeight: 700, marginTop: '6px', backgroundColor: isLoadingRisks ? '#F1F5F9' : (riskStats?.active_alerts ? '#FEF2F2' : '#F0FDF4'), padding: '1px 6px', borderRadius: '8px' }}>
              {isLoadingRisks ? '...' : riskStats?.active_alerts ? `${riskStats.active_alerts} अलर्ट` : 'सुरक्षित अवस्था'}
            </span>
          </div>

          {/* Card 2: भत्ता e-KYC */}
          <div
            onClick={() => onNavigateTab('more')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1rem 0.85rem',
              minWidth: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <UserCheck size={22} color="#16A34A" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>भत्ता e-KYC</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>फेस प्रमाणीकरण</div>
            <span style={{ fontSize: '0.6rem', color: '#16A34A', fontWeight: 700, marginTop: '6px', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '8px' }}>
              अनलाइन नवीकरण
            </span>
          </div>

          {/* Card 3: फोहोर गाडी GPS */}
          <div
            onClick={() => onNavigateTab('more')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1rem 0.85rem',
              minWidth: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <Truck size={22} color="#D97706" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>फोहोर गाडी GPS</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>प्रत्यक्ष नक्सा ट्र्याक</div>
            <span style={{ fontSize: '0.6rem', color: '#D97706', fontWeight: 700, marginTop: '6px', backgroundColor: '#FFFBEB', padding: '1px 6px', borderRadius: '8px' }}>
              घण्टी अलर्ट
            </span>
          </div>

          {/* Card 4: न्यायिक इजलास */}
          <div
            onClick={() => onNavigateTab('more')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1rem 0.85rem',
              minWidth: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <Scale size={22} color="#7E22CE" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>न्यायिक इजलास</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>उजुरी तथा मेलमिलाप</div>
            <span style={{ fontSize: '0.6rem', color: '#7E22CE', fontWeight: 700, marginTop: '6px', backgroundColor: '#FAF5FF', padding: '1px 6px', borderRadius: '8px' }}>
              तारेख ट्र्याकिङ
            </span>
          </div>

          {/* Card 5: सीप बैंक */}
          <div
            onClick={() => onNavigateTab('more')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1rem 0.85rem',
              minWidth: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <Wrench size={22} color="#EA580C" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>सीप तथा रोजगार</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>स्थानीय प्राविधिक</div>
            <span style={{ fontSize: '0.6rem', color: '#EA580C', fontWeight: 700, marginTop: '6px', backgroundColor: '#FFF7ED', padding: '1px 6px', borderRadius: '8px' }}>
              १-ट्याप सम्पर्क
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SECTION 5: DIGITAL TOOLS (कागजात स्क्यानर, सर्भे, पुस्तकालय)            */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Digital Palika Tools</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(डिजिटल औजार)</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
          <div
            onClick={() => onNavigateTab('scanner')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #FED7AA',
              padding: '0.85rem 0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} color="#EA580C" />
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E293B' }}>स्क्यानर</div>
            <div style={{ fontSize: '0.6rem', color: '#64748B' }}>कागजात स्क्यान</div>
          </div>

          <div
            onClick={() => onNavigateTab('survey')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #BFDBFE',
              padding: '0.85rem 0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(15, 76, 129, 0.08)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color="#0F4C81" />
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E293B' }}>घरधुरी सर्भे</div>
            <div style={{ fontSize: '0.6rem', color: '#64748B' }}>अफलाइन ODK</div>
          </div>

          <div
            onClick={() => onNavigateTab('elibrary')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #BBF7D0',
              padding: '0.85rem 0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#16A34A" />
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E293B' }}>ई-पुस्तकालय</div>
            <div style={{ fontSize: '0.6rem', color: '#64748B' }}>किताब तथा अडियो</div>
          </div>

          <div
            onClick={() => onNavigateTab('health-facilities')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #FBCFE8',
              padding: '0.85rem 0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(236, 72, 153, 0.08)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={20} color="#EC4899" />
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E293B' }}>स्वास्थ्य संस्था</div>
            <div style={{ fontSize: '0.6rem', color: '#64748B' }}>अस्पताल र क्लिनिक</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. NOTICE DETAIL MODAL (WHEN VIEW CLICKED)                                */}
      {/* ========================================================================= */}
      {selectedNoticeModal && (
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
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: '#EBF3FA',
                    color: '#0F4C81',
                    padding: '2px 8px',
                    borderRadius: '8px',
                  }}
                >
                  {selectedNoticeModal.category} • {selectedNoticeModal.date}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1E293B', margin: '6px 0 0 0', lineHeight: 1.35 }}>
                  {selectedNoticeModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeModal(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
              {selectedNoticeModal.fullText}
            </div>

            <button
              type="button"
              onClick={() => setSelectedNoticeModal(null)}
              style={{
                width: '100%',
                backgroundColor: '#0F4C81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              बुझें / बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CHAIRMAN SECRETARIAT MODAL (अध्यक्ष सचिवालय प्रत्यक्ष संवाद)            */}
      {/* ========================================================================= */}
      {isChairmanModalOpen && (
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
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    border: '2px solid #38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="14" r="8" fill="#FBCFE8" />
                    <path d="M12 11L20 4L28 11H12Z" fill="#991B1B" />
                    <path d="M14 9L20 4L26 9" stroke="#FDE047" strokeWidth="1" />
                    <path d="M8 36C8 28 13 24 20 24C27 24 32 28 32 36" fill="#0F4C81" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                    अध्यक्ष सचिवालय
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#0F4C81', fontWeight: 700 }}>
                    टासी लामा ह्योल्मो • गाउँपालिका अध्यक्ष
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChairmanModalOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Information Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                padding: '0.9rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>कार्यकक्ष:</span>
                <strong style={{ color: '#1E293B' }}>१०१ (अध्यक्ष कार्यकक्ष, थाङपालधाप)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>नागरिक भेटघाट समय:</span>
                <strong style={{ color: '#1E293B' }}>आइतबार - शुक्रबार (बिहान १०:०० - १२:००)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>सचिवालय सम्पर्क:</span>
                <strong style={{ color: '#0F4C81' }}>९८५११००००१ / ०११-५०५००१</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="tel:9851100001"
                style={{
                  backgroundColor: '#16A34A',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 8px rgba(22, 163, 74, 0.25)',
                }}
              >
                <Phone size={16} />
                <span>सिधा कल गर्नुहोस् (९८५११००००१)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsChairmanModalOpen(false);
                  onNavigateTab('directory');
                }}
                style={{
                  backgroundColor: '#0F4C81',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                <span>सम्पूर्ण जनप्रतिनिधि तथा कर्मचारी डाइरेक्टरी</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChairmanModalOpen(false)}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '9px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
