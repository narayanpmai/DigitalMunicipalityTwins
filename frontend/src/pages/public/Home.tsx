import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Layers,
  ShieldAlert,
  Users,
  Building2,
  FileCheck2,
  AlertTriangle,
  FolderGit2,
  TrendingUp,
  Waves,
  Video,
  PhoneCall,
  ChevronRight,
  ExternalLink,
  MapPin,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  Activity,
  HeartHandshake,
  Briefcase,
} from 'lucide-react';
import { municipalityApi, type SensorItem, type CameraItem } from '../../api/municipality';
import { useAuth } from '../../context/AuthContext';
import { GisMapPage } from '../../features/gis/GisMapPage';
import { DashboardOverview, toNepaliDigits } from '../../features/dashboard/DashboardOverview';
import { PublicModulesDirectory } from '../../components/home/PublicModulesDirectory';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real-time sensors
  const { data: sensors = [] } = useQuery<SensorItem[]>({
    queryKey: ['home-sensors'],
    queryFn: () => municipalityApi.getSensors(),
    refetchInterval: 12000,
  });

  // Fetch real-time cameras
  const { data: cameras = [] } = useQuery<CameraItem[]>({
    queryKey: ['home-cameras'],
    queryFn: () => municipalityApi.getCameras(),
    refetchInterval: 15000,
  });

  const { data: profile } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
  });

  const melamchiSensor = sensors.find(s => s.sensorId === 'SEN-MEL-01') || {
    name: 'मेलम्ची खोला जलसतह',
    lastValue: 3.2,
    unit: 'm',
    dangerThreshold: 5.5,
    status: 'Normal',
  };

  const bhotangSensor = sensors.find(s => s.sensorId === 'SEN-BHO-02') || {
    name: 'भोताङ स्वचालित वर्षा मापन',
    lastValue: 42.0,
    unit: 'mm',
    dangerThreshold: 80.0,
    status: 'Normal',
  };

  const citizenServices = [
    {
      title: 'नागरिक ई-सिफारिस (e-Sifarish)',
      desc: 'नाता प्रमाणित, चार किल्ला, व्यवसाय लगायतका ४५+ वडा सिफारिस अनलाइनबाटै',
      icon: <FileCheck2 size={28} color="#0284c7" />,
      link: '/citizen-services',
      badge: 'अनलाइन उपलब्ध',
      badgeColor: '#0284c7',
    },
    {
      title: 'प्रगति प्रतिवेदन तथा विकास सूचक',
      desc: 'वार्षिक तथा पञ्चवर्षीय भौतिक र वित्तीय प्रगति, विकास सूचकाङ्क र आधिकारिक प्रतिवेदन',
      icon: <TrendingUp size={28} color="#8b5cf6" />,
      link: '/progress-reports',
      badge: 'आधिकारिक प्रतिवेदन',
      badgeColor: '#8b5cf6',
    },
    {
      title: 'एआई डिजिटल सहायक (AI Assistant)',
      desc: 'पालिकाका सेवा, योजना, नियम तथा आकस्मिक सुविधाहरूबारे २४/७ प्रत्यक्ष नेपाली संवाद',
      icon: <Sparkles size={28} color="#06b6d4" />,
      link: '/ai-assistant',
      badge: '२४/७ डिजिटल सेवा',
      badgeColor: '#06b6d4',
    },
    {
      title: 'घर-नक्सा पास तथा भवन अनुमति (e-BPS)',
      desc: 'नागरिकले घरमै बसी अनलाइन नक्सा पेश, डिजिटल ड्रइङ रुजु र प्रत्यक्ष फाइल ट्र्याकिङ',
      icon: <Layers size={28} color="#7c3aed" />,
      link: '/ebps?tab=apply',
      badge: 'अनलाइन नक्सा दरखास्त',
      badgeColor: '#10b981',
    },
    {
      title: 'व्यक्तिगत घटना पञ्जीकरण',
      desc: 'जन्म, मृत्यु, विवाह, बसाइँसराइ र सम्बन्धविच्छेद अनलाइन दर्ता तथा लगत',
      icon: <Users size={28} color="#10b981" />,
      link: '/vital-events',
      badge: 'राष्ट्रिय प्रणाली',
      badgeColor: '#10b981',
    },
    {
      title: 'स्थानीय कर तथा राजस्व भुक्तानी (e-Tax)',
      desc: 'सम्पत्ति कर, व्यवसाय कर र मालपोत सिधै eSewa/Khalti/ConnectIPS बाट',
      icon: <CreditCard size={28} color="#f59e0b" />,
      link: '/revenue',
      badge: 'ई-पेमेन्ट',
      badgeColor: '#f59e0b',
    },
    {
      title: 'डिजिटल नक्सा (GIS) तथा डिजिटल ट्विन',
      desc: '५,८०५+ घरधुरी, पूर्वाधार, जोखिम क्षेत्र र ३डी डिजिटल मोडल अवलोकन',
      icon: <MapPin size={28} color="#ec4899" />,
      link: '/gis-map',
      badge: '३D GIS ट्विन',
      badgeColor: '#ec4899',
    },
    {
      title: 'गुनासो तथा उजुरी सुनुवाई',
      desc: 'नागरिकका समस्या, सुझाव र उजुरी प्रत्यक्ष दर्ता तथा ट्र्याकिङ प्रणाली',
      icon: <AlertTriangle size={28} color="#ef4444" />,
      link: '/complaints',
      badge: 'द्रुत सुनुवाई',
      badgeColor: '#ef4444',
    },
    {
      title: 'कृषक प्रोफाइल तथा अनुदान पोर्टल',
      desc: 'किसान सूचीकरण, माटो स्वास्थ्य कार्ड, कृषि अनुदान तथा उत्पादन विवरण',
      icon: <Briefcase size={28} color="#16a34a" />,
      link: '/farmer-profile',
      badge: 'किसान पोर्टल',
      badgeColor: '#16a34a',
    },
    {
      title: 'खुला तथ्याङ्क (Open Data Portal)',
      desc: 'बजेट, खर्च, जनसांख्यिकी र विकास योजनाहरूको पारदर्शी खुला तथ्याङ्क',
      icon: <FileText size={28} color="#3b82f6" />,
      link: '/open-data',
      badge: 'खुला तथ्याङ्क',
      badgeColor: '#3b82f6',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('नक्सा') && !q.includes('gis')) {
      navigate(isAuthenticated ? '/ebps' : '/register');
    }
    else if (q.includes('ठेक्का') || q.includes('बोलपत्र') || q.includes('खरिद')) {
      navigate(isAuthenticated ? '/procurement?tab=apply' : '/register');
    }
    else if (q.includes('gis')) navigate('/gis-map');
    else if (q.includes('विपद्') || q.includes('बाढी') || q.includes('सेन्सर')) navigate('/disaster');
    else if (q.includes('योजना') || q.includes('प्रोजेक्ट')) navigate('/projects');
    else if (q.includes('सिफारिस') || q.includes('सेवा')) navigate('/citizen-services');
    else if (q.includes('गुनासो')) navigate('/complaints');
    else if (q.includes('पर्यटन') || q.includes('पाँचपोखरी')) navigate('/tourism');
    else navigate('/citizen-portal');
  };

  const handleProtectedAction = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      alert("यो सेवा प्रयोग गर्नको लागि पहिले दर्ता (Register) वा लगइन (Login) गर्नुपर्दछ।");
      navigate('/register');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-family, sans-serif)' }}>
      {/* ── 1. PREMIUM DIGITAL TWIN HERO SECTION ───────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          background: "linear-gradient(135deg, rgba(8, 20, 39, 0.90) 0%, rgba(15, 23, 42, 0.94) 50%, rgba(6, 78, 59, 0.88) 100%), url('/hero.jpg') no-repeat center center",
          backgroundSize: 'cover',
          minHeight: '460px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.75rem 1.25rem',
          color: '#ffffff',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Glowing Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '15%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '15%',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle Geometric Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.45,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '920px', margin: '0 auto', zIndex: 2, position: 'relative' }}>
          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.09)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.3rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.85rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ letterSpacing: '0.02em', color: '#f8fafc' }}>
              LIVE · पाँचपोखरी थाङपाल गाउँपालिका · एकीकृत डिजिटल ट्विन
            </span>
            <span style={{ opacity: 0.35 }}>|</span>
            <span style={{ color: '#a7f3d0', fontWeight: 700 }}>८ वडा · ३३ विषयगत क्षेत्र</span>
          </div>

          {/* Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3.1vw, 2.35rem)',
              fontWeight: 800,
              lineHeight: 1.24,
              margin: '0 0 0.65rem',
              letterSpacing: '-0.02em',
              textShadow: '0 3px 16px rgba(0,0,0,0.45)',
            }}
          >
            नक्सामा विकास । तथ्याङ्कमा प्रगति ।<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              AI तथा IoT बाट आधुनिक सुशासन
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.84rem, 1.15vw, 0.96rem)',
              color: '#e2e8f0',
              maxWidth: '720px',
              margin: '0 auto 1.35rem',
              lineHeight: 1.55,
              opacity: 0.95,
            }}
          >
            पालिकाका ८ वटै वडा, ५,८०५ घरधुरी, नदी जलसतह सेन्सर, CCTV सर्भिलेन्स, डिजिटल नक्सा र नागरिक सेवाहरू एउटै अत्याधुनिक डिजिटल प्लेटफर्मबाट।
          </p>

          {/* Smart Search Bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: '560px', margin: '0 auto 0.75rem', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(20px)',
                borderRadius: '50px',
                padding: '0.28rem 0.35rem 0.28rem 1.1rem',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              <Search size={18} color="#0284c7" style={{ flexShrink: 0, marginRight: '0.55rem' }} />
              <input
                type="text"
                placeholder="सिफारिस, घर-नक्सा, योजना, बाढी सतर्कता वा वडा सेवा खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  fontWeight: 500,
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '0.55rem 1.35rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>खोज्नुहोस्</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>

          {/* Quick Search Chip Pills (द्रुत खोज) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>⚡</span> द्रुत खोज:
            </span>
            {[
              { label: '३D नक्सा', path: '/gis-map' },
              { label: 'नागरिक सिफारिस', path: '/citizen-services' },
              { label: 'घर-नक्सा (e-BPS)', path: '/ebps' },
              { label: 'विकास योजना', path: '/projects' },
              { label: 'बाढी सतर्कता', path: '/disaster' },
              { label: 'राजस्व तथा कर', path: '/revenue' },
            ].map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => {
                  setSearchQuery(tag.label);
                  navigate(tag.path);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#e2e8f0';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Primary High-Value Action Buttons (Streamlined to 3 Cohesive Pillars) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* 1. Flagship 3D GIS Digital Twin */}
            <Link
              to="/gis-map"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#0f172a',
                padding: '0.62rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 800,
                textDecoration: 'none',
                fontSize: '0.86rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(245, 158, 11, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.3)';
              }}
            >
              <Layers size={16} />
              <span>३D डिजिटल नक्सा (GIS Twin)</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  background: 'rgba(15, 23, 42, 0.2)',
                  color: '#0f172a',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  marginLeft: '0.15rem',
                }}
              >
                LIVE
              </span>
            </Link>

            {/* 2. Citizen Services Portal */}
            <Link
              to="/citizen-services"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#0f172a',
                padding: '0.62rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.86rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.12)';
              }}
            >
              <FileCheck2 size={16} color="#0284c7" />
              <span>नागरिक ई-सेवा तथा सिफारिस</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  marginLeft: '0.15rem',
                }}
              >
                ४५+ सेवा
              </span>
            </Link>

            {/* 3. AI Municipal Assistant */}
            <Link
              to="/ai-assistant"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(99, 102, 241, 0.45) 100%)',
                border: '1.5px solid rgba(192, 132, 252, 0.55)',
                color: '#ffffff',
                backdropFilter: 'blur(12px)',
                padding: '0.62rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.86rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 6px 18px rgba(139, 92, 246, 0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(168, 85, 247, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(216, 180, 254, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(139, 92, 246, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.55)';
              }}
            >
              <Sparkles size={16} color="#c084fc" />
              <span>AI पालिका सहायक</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  background: 'rgba(192, 132, 252, 0.25)',
                  color: '#f5d0fe',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  marginLeft: '0.15rem',
                }}
              >
                २४/७
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. UNIFIED COMMAND DASHBOARD (एकीकृत कमान्ड ड्यासबोर्ड - Public View Mode) ── */}
      <section id="unified-dashboard" style={{ padding: '2rem 1rem 3rem', backgroundColor: '#f8fafc' }}>
        <DashboardOverview readOnly={true} defaultTab="executive" />
      </section>

      {/* ── 3. REAL-TIME HYDROMET & RIVER LEVEL BANNER ────────────────────────────── */}
      <section style={{ width: '100%', maxWidth: '100%', margin: '2rem 0 0', padding: '0 0.5rem' }}>
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Waves size={26} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                प्रत्यक्ष जलसतह तथा बाढी पूर्वसूचना (Live Hydromet Alert)
              </div>
              <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
                मेलम्ची खोला: <span style={{ color: melamchiSensor.status === 'Critical' ? '#ef4444' : '#38bdf8' }}>{melamchiSensor.lastValue} {melamchiSensor.unit}</span> (खतरा: {melamchiSensor.dangerThreshold}m) · भोताङ वर्षा: <span style={{ color: '#a78bfa' }}>{bhotangSensor.lastValue} {bhotangSensor.unit}</span>
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/disaster"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Video size={15} /> प्रत्यक्ष सेन्सर र CCTV हेर्नुहोस्
            </Link>
            <a
              href="tel:011460111"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <PhoneCall size={15} /> हटलाइन: ०११-४६०१११
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. DIGITAL CITIZEN SERVICES (E-SERVICES GRID) ─────────────────────────── */}
      <section style={{ width: '100%', maxWidth: '100%', margin: '3rem 0', padding: '0 0.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>
            नागरिक सेवाहरू (Citizen Services)
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0 0.5rem' }}>
            घरबाटै पालिकाका डिजिटल सेवाहरूको उपयोग गर्नुहोस्
          </h2>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            पारदर्शी, छिटो र प्रभावकारी सार्वजनिक सेवा प्रवाहका लागि एकीकृत डिजिटल गेटवे
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {citizenServices.map((svc, i) => (
            <Link
              key={i}
              to={svc.link}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    {svc.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: `${svc.badgeColor}15`, color: svc.badgeColor }}>
                    {svc.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {svc.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {svc.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', marginTop: '1.25rem' }}>
                <span>सेवा सुरु गर्नुहोस्</span>
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4.5 PALIKA 9 SECTORAL DOMAINS & 53 MODULES DIRECTORY ─────────────── */}
      <PublicModulesDirectory />

      {/* ── 5. DIGITAL TWIN 3D/GIS SHOWCASE ───────────────────────────────────────── */}
      <section style={{ width: '100%', maxWidth: '100%', margin: '3rem 0', padding: '0 0.5rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} />
              <span>नेपालकै पहिलो नगरस्तरीय डिजिटल ट्विन</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, margin: '0 0 1rem' }}>
              पाँचपोखरीको ३डी नक्सा तथा भू-स्थानिक (GIS) इन्टेलिजेन्स
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              प्रत्येक घरधुरीको स्थान, भवन संरचना, बाढी तथा पहिरो जोखिम क्षेत्र, खानेपानी तथा सडक सञ्जाललाई एकीकृत थ्री-डी जियो-पोर्टलमा अवलोकन गर्नुहोस्।
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/gis-map"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Layers size={18} /> GIS नक्सा खोल्नुहोस्
              </Link>
              <Link
                to="/projects"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                }}
              >
                योजनाहरूको प्रगति हेर्नुहोस्
              </Link>
            </div>
          </div>

          <div
            style={{
              minHeight: '340px',
              background: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000') no-repeat center center",
              backgroundSize: 'cover',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '2rem',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>३डी डिजिटल नक्सा प्रणाली</div>
              <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 700 }}>थाङपाल भ्याली तथा पाँचपोखरी बेसिन मोडल</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5.5 EMBEDDED GIS MAP ─────────────────────────────────────────────────── */}
      <section style={{ width: '100%', maxWidth: '100%', margin: '0 0 3rem', padding: '0 0.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '1.5rem', overflow: 'hidden' }}>
          <GisMapPage isPublic={true} />
        </div>
      </section>

      {/* ── 6. TOURISM & HERITAGE HIGHLIGHTS ──────────────────────────────────────── */}
      <section style={{ width: '100%', maxWidth: '100%', margin: '3rem 0 4rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>पर्यटन तथा संस्कृति</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0' }}>धार्मिक, सांस्कृतिक तथा प्राकृतिक गन्तव्यहरू</h2>
          </div>
          <Link to="/tourism" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            सबै गन्तव्यहरू हेर्नुहोस् <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {[
            { title: 'पवित्र पाँचपोखरी कुण्ड (४,१००m)', desc: 'विश्वकै नवौं उच्च स्थानमा रहेको पवित्र पाँच तलाउ', tag: 'धार्मिक / साहसिक' },
            { title: 'आमा यांग्री पिक (३,७७१m)', desc: 'हेलम्बु-पाँचपोखरीको मनोरम दृश्यावलोकन केन्द्र', tag: 'पदयात्रा' },
            { title: 'थाङपालधाप ड्रागन गुम्बा', desc: 'प्राचीन तिब्बती बौद्ध कला तथा ध्यान केन्द्र', tag: 'सम्पदा' },
            { title: 'भोताङ रैथाने ट्राउट तथा अर्गानिक खेती', desc: 'हिमाली चिसो पानीको ट्राउट माछा र रैथाने स्वाद', tag: 'कृषि पर्यटन' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {item.tag}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.6rem 0 0.3rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{item.desc}</p>
              </div>
              <Link to="/tourism" style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                विस्तृत जानकारी →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
