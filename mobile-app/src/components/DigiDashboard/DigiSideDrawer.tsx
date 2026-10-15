import React from 'react';
import {
  X,
  Home,
  FileCheck2,
  FileText,
  Coins,
  AlertTriangle,
  HardHat,
  Users,
  AlertOctagon,
  Camera,
  ClipboardList,
  BookOpen,
  Waves,
  ChevronRight,
  Phone,
  ShieldCheck,
  Bot,
  Sparkles,
  Compass,
  Landmark,
  ExternalLink,
  LogIn,
  UserCheck,
  User,
  LogOut,
} from 'lucide-react';
import { CitizenUser } from '../../types';
import { AppLanguage } from '../../utils/localization';

interface DigiSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  currentUser: CitizenUser | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentLang?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onOpenPrivacyPolicy?: () => void;
}

export const DigiSideDrawer: React.FC<DigiSideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  currentLang = 'ne',
  onLanguageChange,
  onOpenPrivacyPolicy,
}) => {
  if (!isOpen) return null;

  const MENU_SECTIONS = [
    {
      title: 'नागरिक प्रोफाइल तथा सेवाहरू (My Palika)',
      items: [
        {
          id: 'profile',
          label: currentUser ? `मेरो प्रोफाइल (${currentUser.fullName.split(' ')[0]})` : 'नागरिक प्रोफाइल (लगइन आवश्यक)',
          icon: <UserCheck size={18} color="#10B981" />,
        },
        { id: 'home', label: 'गृहपृष्ठ (Home Dashboard)', icon: <Home size={18} color="#0F4C81" /> },
        { id: 'sifarish', label: 'ई-सिफारिस (e-Sifarish Paper-less)', icon: <FileCheck2 size={18} color="#E65100" /> },
        { id: 'charter', label: 'नागरिक बडापत्र (Citizen Charter)', icon: <FileText size={18} color="#0F4C81" /> },
        { id: 'revenue', label: 'डिजिटल कर (e-Tax Online Payment)', icon: <Coins size={18} color="#D97706" /> },
        { id: 'complaints', label: 'नागरिक गुनासो (Citizen Grievance)', icon: <AlertTriangle size={18} color="#0284C7" /> },
      ],
    },
    {
      title: 'सम्पदा, संस्कृति तथा सङ्ग्रहालय (Heritage & Twins)',
      items: [
        { id: 'tourism-twin', label: 'पर्यटन तथा सम्पदा डिजिटल ट्विन (3D GIS)', icon: <Compass size={18} color="#0284C7" /> },
        { id: 'cultural-museum', label: 'सांस्कृतिक सङ्ग्रहालय (Cultural Museum)', icon: <Landmark size={18} color="#E11D48" /> },
      ],
    },
    {
      title: 'सुशासन तथा पारदर्शी सेवा (Governance)',
      items: [
        { id: 'projects', label: 'योजना तथा बजेट ट्र्याकर (Project Tracker)', icon: <HardHat size={18} color="#059669" /> },
        { id: 'directory', label: 'जनप्रतिनिधि तथा कर्मचारी (Staff Directory)', icon: <Users size={18} color="#4F46E5" /> },
        { id: 'more', label: 'अति आवश्यक ५ स्मार्ट सेवा (Smart Services)', icon: <Waves size={18} color="#0284C7" /> },
        { id: 'sos', label: 'आपतकालीन SOS तथा हटलाइन (Emergency)', icon: <AlertOctagon size={18} color="#DC2626" /> },
      ],
    },
    {
      title: 'डिजिटल औजार तथा ज्ञान (Tools & Library)',
      items: [
        { id: 'scanner', label: 'स्मार्ट कागजात स्क्यानर (Camera Scanner)', icon: <Camera size={18} color="#EA580C" /> },
        { id: 'survey', label: 'एकिकृत घरधुरी सर्भे (Household Survey)', icon: <ClipboardList size={18} color="#0F4C81" /> },
        { id: 'elibrary', label: 'पालिका ई-पुस्तकालय (Digital Library)', icon: <BookOpen size={18} color="#16A34A" /> },
      ],
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '84%',
          maxWidth: '340px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '4px 0 25px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'slideInLeft 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header with digi Crimson Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #a81c3c 0%, #7c1d4a 50%, #253368 100%)',
            color: '#ffffff',
            padding: '1.4rem 1.15rem 1.15rem 1.15rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          {/* Emblem & Palika Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                flexShrink: 0,
                padding: '2px',
              }}
            >
              <img
                src="/panchpokhari-logo.png"
                alt="पाँचपोखरी थाङपाल गाउँपालिका"
                style={{ display: 'block', margin: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, lineHeight: 1.2 }}>
                पाँचपोखरी थाङपाल गाउँपालिका
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '2px' }}>
                Municipal Digital Twins - नागरिक सेवा पोर्टल
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255,255,255,0.14)',
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.72rem',
            }}
          >
            <span>स्थिति: <strong>सक्रिय अनलाइन</strong></span>
            <span style={{ backgroundColor: '#10B981', width: '8px', height: '8px', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Citizen Profile / Auth Mini Card */}
        <div style={{ padding: '0.85rem 1rem 0.25rem 1rem' }}>
          {currentUser ? (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '14px',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    flexShrink: 0,
                  }}
                >
                  {currentUser.fullName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                    {currentUser.fullName}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#059669', fontWeight: 700 }}>
                    वडा नं {currentUser.permanentAddress.wardNo} • प्रमाणित नागरिक ✅
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('के तपाईं लगआउट गर्न चाहनुहुन्छ?')) {
                    onLogout();
                    onClose();
                  }
                }}
                title="सुरक्षित लगआउट"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FDE68A',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E' }}>
                  अतिथि नागरिक (Guest User)
                </div>
                <div style={{ fontSize: '0.64rem', color: '#B45309' }}>
                  नागरिक सेवा लिन कृपया लगइन गर्नुहोस्
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                style={{
                  backgroundColor: '#D97706',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <LogIn size={13} />
                <span>लगइन</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu Sections List */}
        <div style={{ padding: '0.75rem 1rem', flex: 1 }}>
          {MENU_SECTIONS.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: '1.15rem' }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#94A3B8',
                  marginBottom: '0.45rem',
                  paddingLeft: '4px',
                }}
              >
                {sec.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'profile') {
                        onClose();
                        if (currentUser) {
                          onOpenProfile();
                        } else {
                          onOpenAuth();
                        }
                      } else {
                        onNavigateTab(item.id);
                        onClose();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.icon}
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Language Selection in Drawer */}
        <div style={{ padding: '0 1rem 0.65rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>
            भाषा छनोट (Language):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {[
              { id: 'ne', label: 'नेपाली' },
              { id: 'hy', label: 'ह्योल्मो' },
              { id: 'ta', label: 'तामाङ' },
              { id: 'en', label: 'English' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLanguageChange?.(l.id as AppLanguage)}
                style={{
                  backgroundColor: currentLang === l.id ? '#0F4C81' : '#F1F5F9',
                  color: currentLang === l.id ? '#ffffff' : '#334155',
                  border: '1px solid #CBD5E1',
                  padding: '5px 2px',
                  borderRadius: '8px',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Footer with Helpline & Credits */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            fontSize: '0.7rem',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>२४/७ हटलाइन: <strong>०११-५०५००१ / ९८५१२३४५६७</strong></span>
            <Phone size={13} color="#DC2626" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrivacyPolicy?.();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F4C81',
                fontSize: '0.68rem',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={12} />
              <span>गोपनीयता नीति (Privacy Policy)</span>
            </button>
            <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>v२.४ Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
