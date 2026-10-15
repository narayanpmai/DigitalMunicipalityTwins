import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Phone,
  Users,
  Heart,
  Wheat,
  Compass,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Home,
  Navigation,
  Droplet,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import apiClient from '../../services/api';
import {
  MOCK_PROJECTS,
  MOCK_OFFICIALS,
  MOCK_BLOOD_DONORS,
  MOCK_HEALTH_POSTS,
  MOCK_AGRI_MARKET,
  MOCK_FERTILIZER,
  MOCK_TOURISM_SPOTS,
  MOCK_TREKKING_TRAILS,
  MOCK_HOMESTAYS,
} from '../../data/mockCitizenServicesData';
import { CriticalCivicHub } from '../CriticalCivic/CriticalCivicHub';
import { MunicipalOfficial } from '../../types';

interface CitizenServicesHubProps {
  initialCategory?: 'critical' | 'development';
  initialTab?: 'projects' | 'directory' | 'health' | 'agri' | 'tourism';
}

export const CitizenServicesHub: React.FC<CitizenServicesHubProps> = ({
  initialCategory = 'critical',
  initialTab = 'projects',
}) => {
  // Category switch: Critical 5 Features vs 5 Development Services
  const [hubCategory, setHubCategory] = useState<'critical' | 'development'>(
    initialTab === 'directory' || initialTab === 'projects' ? 'development' : initialCategory
  );

  // 5 Main Tabs (Development Services)
  const [activeTab, setActiveTab] = useState<'projects' | 'directory' | 'health' | 'agri' | 'tourism'>(initialTab);

  // Dynamic States
  const [officials, setOfficials] = useState<MunicipalOfficial[]>(MOCK_OFFICIALS);

  useEffect(() => {
    if (initialTab === 'directory' || initialTab === 'projects') {
      setHubCategory('development');
      setActiveTab(initialTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, initialCategory]);

  useEffect(() => {
    // Fetch live directory
    const fetchDirectory = async () => {
      try {
        const [repsRes, empsRes] = await Promise.all([
          apiClient.get('/representatives'),
          apiClient.get('/employees')
        ]);
        
        const repsData = repsRes.data || [];
        const empsData = empsRes.data || [];
        
        const mappedReps: MunicipalOfficial[] = repsData.map((r: any) => ({
          id: r.id,
          name: r.name,
          role: r.designation,
          department: r.wardNo || r.ward_no ? `${r.wardNo || r.ward_no} नं. वडा कार्यालय` : 'कार्यपालिका कार्यालय',
          phone: r.phone || '-',
          isElected: true
        }));
        
        const mappedEmps: MunicipalOfficial[] = empsData.map((e: any) => ({
          id: e.id,
          name: e.fullName || e.full_name,
          role: e.designation,
          department: e.department,
          phone: e.contactPhone || e.contact_phone || '-',
          isElected: false
        }));
        
        if (mappedReps.length > 0 || mappedEmps.length > 0) {
          setOfficials([...mappedReps, ...mappedEmps]);
        }
      } catch (error) {
        console.error("Error fetching directory:", error);
      }
    };

    fetchDirectory();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  // Sub-tabs
  const [healthSubTab, setHealthSubTab] = useState<'blood' | 'healthpost'>('blood');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');

  const [agriSubTab, setAgriSubTab] = useState<'prices' | 'fertilizer'>('prices');
  const [tourismSubTab, setTourismSubTab] = useState<'spots' | 'trails' | 'homestays'>('spots');

  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');

  // Filter Projects
  const filteredProjects = MOCK_PROJECTS.filter((p) => {
    const matchWard = selectedWard === 'all' || p.wardNo === selectedWard;
    const matchQ = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.contractorOrSamiti.toLowerCase().includes(searchQuery.toLowerCase());
    return matchWard && matchQ;
  });

  // Filter Officials
  const filteredOfficials = officials.filter((o) => {
    const matchQ = !searchQuery || o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.role.toLowerCase().includes(searchQuery.toLowerCase()) || o.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQ;
  });

  // Filter Blood Donors
  const filteredDonors = MOCK_BLOOD_DONORS.filter((d) => {
    const matchBg = selectedBloodGroup === 'all' || d.bloodGroup === selectedBloodGroup;
    const matchQ = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.tole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBg && matchQ;
  });

  // Filter Agri Market
  const filteredAgri = MOCK_AGRI_MARKET.filter((item) => {
    return !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.marketCenter.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      {/* ─── DUAL SERVICE CATEGORY TOGGLE (१० वटा एकीकृत स्थानीय सेवाहरू) ─── */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '0.85rem',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          type="button"
          onClick={() => setHubCategory('critical')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: hubCategory === 'critical' ? '#0F4C81' : 'transparent',
            color: hubCategory === 'critical' ? '#ffffff' : '#64748b',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
            boxShadow: hubCategory === 'critical' ? '0 2px 8px rgba(15, 76, 129, 0.25)' : 'none',
          }}
        >
          <span>⚡ अति आवश्यक ५ स्मार्ट सेवा</span>
          <span
            style={{
              fontSize: '0.6rem',
              backgroundColor: hubCategory === 'critical' ? '#E65100' : '#e2e8f0',
              color: '#ffffff',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 800,
            }}
          >
            नयाँ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setHubCategory('development')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: hubCategory === 'development' ? '#0F4C81' : 'transparent',
            color: hubCategory === 'development' ? '#ffffff' : '#64748b',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
            boxShadow: hubCategory === 'development' ? '0 2px 8px rgba(15, 76, 129, 0.25)' : 'none',
          }}
        >
          <span>🏛️ विकास तथा सार्वजनिक सेवा</span>
        </button>
      </div>

      {/* Render 5 Critical Civic Features */}
      {hubCategory === 'critical' && <CriticalCivicHub />}

      {/* Render 5 Development Services */}
      {hubCategory === 'development' && (
        <div>
          {/* ─── 5-TAB HORIZONTAL CHIPS DOCK ─── */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              marginBottom: '0.75rem',
            }}
          >
        {[
          { id: 'projects', label: '१. योजना ट्र्याकर', icon: <HardHat size={14} />, badge: MOCK_PROJECTS.length },
          { id: 'directory', label: '२. कर्मचारी डाइरेक्टरी', icon: <Users size={14} />, badge: MOCK_OFFICIALS.length },
          { id: 'health', label: '३. रक्तदान/स्वास्थ्य', icon: <Heart size={14} />, badge: MOCK_BLOOD_DONORS.length },
          { id: 'agri', label: '४. कृषि बजारभाउ', icon: <Wheat size={14} />, badge: MOCK_AGRI_MARKET.length },
          { id: 'tourism', label: '५. पर्यटन तथा ट्रेल', icon: <Compass size={14} />, badge: MOCK_TOURISM_SPOTS.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              style={{
                backgroundColor: isActive ? '#0F4C81' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? '1.5px solid #0F4C81' : '1px solid #cbd5e1',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: isActive ? 800 : 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isActive ? '0 3px 8px rgba(15, 76, 129, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── LIVE SEARCH BAR ─── */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder={
            activeTab === 'projects'
              ? 'योजनाको नाम वा टोल खोज्नुहोस्...'
              : activeTab === 'directory'
              ? 'जनप्रतिनिधि वा कर्मचारीको नाम/पद खोज्नुहोस्...'
              : activeTab === 'health'
              ? 'रक्तदाता वा स्वास्थ्य चौकी खोज्नुहोस्...'
              : activeTab === 'agri'
              ? 'तरकारी, फलफूल वा बजार केन्द्र खोज्नुहोस्...'
              : 'पर्यटकीय स्थल, पदमार्ग वा होमस्टे खोज्नुहोस्...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '34px',
            paddingRight: '12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. PUBLIC PROJECTS TRACKER (योजना तथा बजेट पारदर्शी ट्र्याकर) */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              वडागत विकास योजनाहरू ({filteredProjects.length})
            </span>
            <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>
              शतप्रतिशत सार्वजनिक पारदर्शिता
            </span>
          </div>

          {filteredProjects.map((prj) => (
            <div
              key={prj.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '0.85rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  वडा नं. {prj.wardNo} • {prj.category}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: prj.status === 'सम्पन्न भएको' ? '#f0fdf4' : '#fffbeb',
                    color: prj.status === 'सम्पन्न भएको' ? '#16a34a' : '#d97706',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${prj.status === 'सम्पन्न भएको' ? '#bbf7d0' : '#fde68a'}`,
                  }}
                >
                  {prj.status}
                </span>
              </div>

              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                {prj.title}
              </h3>

              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
                निर्माण समिति/ठेकेदार: <strong>{prj.contractorOrSamiti}</strong> • म्याद: {prj.targetCompletionDate}
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span>भौतिक प्रगति:</span>
                  <span style={{ color: '#0284c7' }}>{prj.progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${prj.progressPercent}%`, height: '100%', backgroundColor: prj.progressPercent === 100 ? '#16a34a' : '#0284c7' }} />
                </div>
              </div>

              {/* Budget Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                <div>कुल बजेट: <strong>रु. {prj.budgetAllocatedRs.toLocaleString('ne-NP')}</strong></div>
                <div>भुक्तानी: <strong>रु. {prj.budgetSpentRs.toLocaleString('ne-NP')}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LEADERSHIP & STAFF DIRECTORY (जनप्रतिनिधि तथा कर्मचारी डाइरेक्टरी) */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              सम्पर्क डाइरेक्टरी ({filteredOfficials.length})
            </span>
            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>
              📞 १-ट्याप प्रत्यक्ष फोन कल
            </span>
          </div>

          {filteredOfficials.map((off) => (
            <div
              key={off.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', color: off.isElected ? '#0369a1' : '#059669', fontWeight: 800 }}>
                  {off.role}
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                  {off.name}
                </h4>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {off.department} {off.roomNo && `• कार्यकक्ष: ${off.roomNo}`}
                </div>
              </div>

              <a
                href={`tel:${off.phone}`}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                  flexShrink: 0,
                }}
                title="कल गर्नुहोस्"
              >
                <Phone size={18} />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BLOOD NETWORK & HEALTH SERVICES (रक्तदान तथा स्वास्थ्य सञ्जाल) */}
      {/* ========================================================================= */}
      {activeTab === 'health' && (
        <div>
          {/* Sub Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setHealthSubTab('blood')}
              style={{
                backgroundColor: healthSubTab === 'blood' ? '#fee2e2' : '#ffffff',
                color: healthSubTab === 'blood' ? '#dc2626' : '#64748b',
                border: healthSubTab === 'blood' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                padding: '7px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🩸 आपतकालीन रक्तदाता खोज्नुहोस्
            </button>
            <button
              type="button"
              onClick={() => setHealthSubTab('healthpost')}
              style={{
                backgroundColor: healthSubTab === 'healthpost' ? '#e0f2fe' : '#ffffff',
                color: healthSubTab === 'healthpost' ? '#0284c7' : '#64748b',
                border: healthSubTab === 'healthpost' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                padding: '7px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏥 स्वास्थ्य चौकी तथा ओपीडी
            </button>
          </div>

          {/* Blood Donors List */}
          {healthSubTab === 'blood' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Blood Group Filter Chips */}
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setSelectedBloodGroup(bg)}
                    style={{
                      backgroundColor: selectedBloodGroup === bg ? '#dc2626' : '#ffffff',
                      color: selectedBloodGroup === bg ? '#ffffff' : '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '14px',
                      padding: '3px 9px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {bg === 'all' ? 'सबै ग्रुप' : bg}
                  </button>
                ))}
              </div>

              {filteredDonors.map((donor) => (
                <div
                  key={donor.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 5px rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      {donor.bloodGroup}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {donor.name}
                      </h4>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                        वडा नं. {donor.wardNo} ({donor.tole}) • {donor.isAvailable ? '✓ तत्काल उपलब्ध' : 'हाल व्यस्त'}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${donor.phone}`}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                    title="रक्तदानका लागि सम्पर्क गर्नुहोस्"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Health Posts List */}
          {healthSubTab === 'healthpost' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_HEALTH_POSTS.map((hp) => (
                <div
                  key={hp.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        वडा नं. {hp.wardNo} • {hp.location}
                      </span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                        {hp.name}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        इन्चार्ज: <strong>{hp.incharge}</strong>
                      </div>
                    </div>

                    <a
                      href={`tel:${hp.phone}`}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={13} />
                      <span>ओपीडी कल</span>
                    </a>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '6px', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                    🕒 समय: <strong>{hp.opdHours}</strong>
                    {hp.ambulancePhone && (
                      <div style={{ marginTop: '2px', color: '#dc2626', fontWeight: 700 }}>
                        🚑 एम्बुलेन्स २४ घण्टा: {hp.ambulancePhone}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {hp.services.map((srv, idx) => (
                      <span key={idx} style={{ fontSize: '0.62rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                        • {srv}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AGRI-MARKET PRICES & FERTILIZER (कृषि तथा हाटबजार बजारभाउ) */}
      {/* ========================================================================= */}
      {activeTab === 'agri' && (
        <div>
          {/* Sub Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setAgriSubTab('prices')}
              style={{
                backgroundColor: agriSubTab === 'prices' ? '#dcfce7' : '#ffffff',
                color: agriSubTab === 'prices' ? '#166534' : '#64748b',
                border: agriSubTab === 'prices' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                padding: '7px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🥬 आजको हाटबजार बजारभाउ
            </button>
            <button
              type="button"
              onClick={() => setAgriSubTab('fertilizer')}
              style={{
                backgroundColor: agriSubTab === 'fertilizer' ? '#dbeafe' : '#ffffff',
                color: agriSubTab === 'fertilizer' ? '#1d4ed8' : '#64748b',
                border: agriSubTab === 'fertilizer' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                padding: '7px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🌱 मलखाद वितरण कोटा
            </button>
          </div>

          {/* Daily Prices List */}
          {agriSubTab === 'prices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                <span>स्थानीय उपज तथा संकलन केन्द्र</span>
                <span>प्रतिकूल/बजार दर</span>
              </div>

              {filteredAgri.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.62rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px' }}>
                      {item.category}
                    </span>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 1px 0' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      केन्द्र: {item.marketCenter}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#16a34a' }}>
                      रु. {item.todayPriceRs} <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>/{item.unit}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', color: item.priceTrend === 'up' ? '#16a34a' : item.priceTrend === 'down' ? '#dc2626' : '#64748b' }}>
                      {item.priceTrend === 'up' && <TrendingUp size={12} />}
                      {item.priceTrend === 'down' && <TrendingDown size={12} />}
                      {item.priceTrend === 'stable' && <Minus size={12} />}
                      <span>हिजो: रु. {item.yesterdayPriceRs}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fertilizer Distribution List */}
          {agriSubTab === 'fertilizer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {MOCK_FERTILIZER.map((ft) => (
                <div
                  key={ft.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        वडा नं. {ft.wardNo} सहकारी केन्द्र
                      </span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 1px 0' }}>
                        {ft.fertilizerType}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {ft.centerName}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: ft.status === 'मौज्दात उपलब्ध' ? '#f0fdf4' : '#fffbeb',
                        color: ft.status === 'मौज्दात उपलब्ध' ? '#16a34a' : '#d97706',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {ft.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                    <div>उपलब्ध बोरा: <strong>{ft.stockBags} बोरा</strong></div>
                    <div>अनुदान मूल्य: <strong style={{ color: '#0284c7' }}>रु. {ft.pricePerBagRs}/बोरा</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TOURISM, TRAILS & HOMESTAYS (पर्यटन, पदमार्ग तथा होमस्टे) */}
      {/* ========================================================================= */}
      {activeTab === 'tourism' && (
        <div>
          {/* Sub Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setTourismSubTab('spots')}
              style={{
                backgroundColor: tourismSubTab === 'spots' ? '#e0f2fe' : '#ffffff',
                color: tourismSubTab === 'spots' ? '#0369a1' : '#64748b',
                border: tourismSubTab === 'spots' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                padding: '6px 4px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏔️ पर्यटकीय स्थल
            </button>
            <button
              type="button"
              onClick={() => setTourismSubTab('trails')}
              style={{
                backgroundColor: tourismSubTab === 'trails' ? '#e0f2fe' : '#ffffff',
                color: tourismSubTab === 'trails' ? '#0369a1' : '#64748b',
                border: tourismSubTab === 'trails' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                padding: '6px 4px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🥾 पदमार्ग (Trails)
            </button>
            <button
              type="button"
              onClick={() => setTourismSubTab('homestays')}
              style={{
                backgroundColor: tourismSubTab === 'homestays' ? '#e0f2fe' : '#ffffff',
                color: tourismSubTab === 'homestays' ? '#0369a1' : '#64748b',
                border: tourismSubTab === 'homestays' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                padding: '6px 4px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏡 होमस्टे सूची
            </button>
          </div>

          {/* Tourism Spots */}
          {tourismSubTab === 'spots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_TOURISM_SPOTS.map((ts) => (
                <div
                  key={ts.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        {ts.category} • वडा नं. {ts.wardNo}
                      </span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px 0' }}>
                        {ts.title}
                      </h4>
                    </div>

                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#f0f9ff', padding: '3px 8px', borderRadius: '6px' }}>
                      {ts.altitudeMeters}m उचाइ
                    </span>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.5, margin: '6px 0' }}>
                    {ts.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {ts.highlights.map((h, i) => (
                      <span key={i} style={{ fontSize: '0.62rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                        ✨ {h}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                    उत्तम मौसम: <strong>{ts.bestSeason}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trekking Trails */}
          {tourismSubTab === 'trails' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_TREKKING_TRAILS.map((tr) => (
                <div
                  key={tr.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {tr.trailName}
                    </h4>
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {tr.difficulty}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px', fontSize: '0.72rem', margin: '8px 0' }}>
                    <div>दूरी: <strong>{tr.totalDistanceKm} km</strong></div>
                    <div>समय: <strong>{tr.durationDays} दिन</strong></div>
                    <div>उचाइ: <strong>{tr.maxAltitudeMeters}m</strong></div>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                    पदमार्ग बिन्दुहरू: <strong>{tr.routePoints.join(' → ')}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Homestays List */}
          {tourismSubTab === 'homestays' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {MOCK_HOMESTAYS.map((hs) => (
                <div
                  key={hs.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.62rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      वडा नं. {hs.wardNo} • {hs.village}
                    </span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 2px 0' }}>
                      {hs.name}
                    </h4>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      सञ्चालक: <strong>{hs.ownerName}</strong> • क्षमता: {hs.totalRooms} कोठा ({hs.totalBeds} बेड)
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: '2px' }}>
                      विशेष परिकार: {hs.specialFood}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369a1' }}>
                      रु. {hs.pricePerNightRs}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: '4px' }}>/रात प्रतिव्यक्ति</div>
                    <a
                      href={`tel:${hs.phone}`}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                      title="होमस्टे बुकिङ कल"
                    >
                      <Phone size={15} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};

