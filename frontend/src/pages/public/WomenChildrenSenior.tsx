import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Users,
  Heart,
  Baby,
  Shield,
  Search,
  Printer,
  QrCode,
  X,
  PhoneCall,
  Calendar,
  Building,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface SeniorBeneficiary {
  id: string;
  beneficiaryId: string;
  fullName: string;
  fullNameEn?: string;
  citizenshipOrNidNo: string;
  category: string;
  wardNumber: number;
  toleVillage?: string;
  gender?: string;
  dateOfBirthBs?: string;
  contactPhone?: string;
  guardianName?: string;
  bankName?: string;
  bankAccountNo?: string;
  monthlyAllowanceNPR: number;
  quarterlyAllowanceNPR: number;
  status: string;
  fiscalYear: string;
}

export const WomenChildrenSenior: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'seniors' | 'schedule' | 'camps' | 'children_women'>('seniors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSenior, setSelectedSenior] = useState<SeniorBeneficiary | null>(null);

  // Fetch social security beneficiaries for Senior Citizen ID Verification
  const { data: beneficiaries = [] } = useQuery<SeniorBeneficiary[]>({
    queryKey: ['senior-beneficiaries'],
    queryFn: async () => {
      const res: any = await api.get('/social-security');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list.filter((b: any) => 
        b.category && (b.category.includes('जेष्ठ') || b.category.includes('एकल महिला') || b.category.includes('ज्येष्ठ'))
      );
    },
    staleTime: 60000,
  });

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return beneficiaries.filter((b) =>
      (b.fullName && b.fullName.toLowerCase().includes(q)) ||
      (b.citizenshipOrNidNo && b.citizenshipOrNidNo.toLowerCase().includes(q)) ||
      (b.beneficiaryId && b.beneficiaryId.toLowerCase().includes(q))
    );
  }, [beneficiaries, searchQuery]);

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '1.5rem 0.5rem', fontFamily: 'inherit' }}>
      {/* ── 1. HELPLINE & QUICK BANNER ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #9d174d 0%, #be123c 100%)',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(190, 18, 60, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield size={22} color="#fde047" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            पाँचपोखरी थाङपाल — महिला, बालबालिका तथा ज्येष्ठ नागरिक संरक्षण हटलाइन:
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="tel:1145"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <PhoneCall size={14} /> महिला हिंसा: ११४५
          </a>
          <a
            href="tel:1098"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <Baby size={14} /> बाल हेल्पलाइन: १०९८
          </a>
          <a
            href="/gis-map?filter=social_care"
            style={{ color: '#881337', background: '#fde047', padding: '4px 14px', borderRadius: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <Activity size={14} /> डिजिटल ट्विन नक्सा
          </a>
        </div>
      </div>

      {/* ── 2. HERO HEADER ───────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffe4e6', color: '#be123c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> सामाजिक सुरक्षा तथा संरक्षण ऐन, २०७५ अनुसार
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={34} color="#e11d48" />
            ज्येष्ठ नागरिक, महिला तथा बालबालिका डिजिटल पोर्टल
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
            पाँचपोखरी थाङपाल गाउँपालिकामा रहेका २,२१५+ ज्येष्ठ नागरिक, एकल महिला र बालबालिकाहरूका लागि डिजिटल परिचयपत्र, त्रैमासिक सामाजिक सुरक्षा भत्ता क्यालेन्डर, र निःशुल्क घरदैलो स्वास्थ्य सेवा।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('seniors')}
            style={{
              background: '#be123c',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(190, 18, 60, 0.3)',
            }}
          >
            <Search size={16} /> ज्येष्ठ नागरिक परिचयपत्र खोजी
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Calendar size={16} color="#0284c7" /> भत्ता भुक्तानी तालिका
          </button>
        </div>
      </div>

      {/* ── 3. KPI STATS CARDS ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'ज्येष्ठ नागरिक लाभग्राही', value: '२,२१५', sub: '६८ वर्ष माथि (रु. ४,०००/महिना)', color: '#be123c' },
          { label: 'त्रैमासिक भत्ता भुक्तानी बजेट', value: 'रु २.६५ करोड', sub: 'प्रत्यक्ष बैंक खातामा जम्मा', color: '#16a34a' },
          { label: 'एकल महिला तथा विधवा', value: '३४२', sub: '६० वर्ष माथि (रु. २,६६०/महिना)', color: '#0284c7' },
          { label: 'बाल पोषण भत्ता प्राप्तकर्ता', value: '५३२', sub: '५ वर्ष मुनिका बालबालिका', color: '#d97706' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              borderTop: `4px solid ${stat.color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── 4. TABS NAVIGATION ───────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'seniors', label: '👴 ज्येष्ठ नागरिक डिजिटल परिचयपत्र (Senior Citizen ID)' },
          { id: 'schedule', label: '📅 त्रैमासिक भत्ता भुक्तानी क्यालेन्डर (Allowance Schedule)' },
          { id: 'camps', label: '🩺 घरदैलो स्वास्थ्य शिविर तथा न्यानो कपडा (Care Programs)' },
          { id: 'children_women', label: '👩👶 महिला तथा बाल कल्याण कार्यक्रम (Inclusion)' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '0.85rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.95rem',
              color: activeTab === t.id ? '#be123c' : '#64748b',
              borderBottom: activeTab === t.id ? '3px solid #be123c' : '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: SENIOR CITIZEN DIGITAL ID ─────────────────────────── */}
      {activeTab === 'seniors' && (
        <div>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            marginBottom: '2rem',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
              ज्येष्ठ नागरिक डिजिटल परिचयपत्र प्रमाणिकरण
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              ज्येष्ठ नागरिकको नाम, नागरिकता नम्बर वा परिचयपत्र संकेत नम्बर (उदा: <strong>२७-०१-२८-००१४५</strong> वा <strong>SSIS-2081-001</strong> वा <strong>बुद्धिमान तामाङ</strong>) हानेर खोज्नुहोस्।
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.75rem', gap: '0.5rem' }}>
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="नागरिकता नं. वा संकेत नं. टाइप गर्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setSearchQuery('२७-०१-२८-००१४५')}
                style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
              >
                नमुना १ (वडा ३)
              </button>
              <button
                onClick={() => setSearchQuery('२७-०१-२६-०२३११')}
                style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
              >
                नमुना २ (वडा ८)
              </button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {searchResults.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #fbcfe8',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#fdf2f8', color: '#be123c', border: '1px solid #be123c', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {b.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>वडा नं. {b.wardNumber}</span>
                  </div>

                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                    {b.fullName} {b.fullNameEn ? `(${b.fullNameEn})` : ''}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
                    <div><strong>संकेत नं:</strong> <span style={{ fontFamily: 'monospace', color: '#be123c' }}>{b.beneficiaryId}</span></div>
                    <div><strong>नागरिकता नं:</strong> {b.citizenshipOrNidNo}</div>
                    <div><strong>जन्म मिति:</strong> वि.सं. {b.dateOfBirthBs || '२००१-०३-१५'}</div>
                    <div><strong>ठेगाना:</strong> वडा नं. {b.wardNumber}, {b.toleVillage || 'पाँचपोखरी'}</div>
                    <div><strong>मासिक भत्ता:</strong> <strong style={{ color: '#16a34a' }}>रु. {Number(b.monthlyAllowanceNPR).toLocaleString('ne-NP')}</strong></div>
                  </div>

                  <button
                    onClick={() => setSelectedSenior(b)}
                    style={{
                      width: '100%',
                      background: '#be123c',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <QrCode size={16} />
                    <span>डिजिटल ज्येष्ठ नागरिक कार्ड हेर्नुहोस् र प्रिन्ट गर्नुहोस्</span>
                  </button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155' }}>कुनै लाभग्राही फेला परेन</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                कृपया नागरिकता वा संकेत नम्बर पुनः जाँच गर्नुहोस्।
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              माथिको खोज बाकसमा ज्येष्ठ नागरिकको नागरिकता वा संकेत नम्बर प्रविष्ट गर्नुहोस्।
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: QUARTERLY ALLOWANCE SCHEDULE ──────────────────────── */}
      {activeTab === 'schedule' && (
        <div>
          <div style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', color: '#166534' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
              आर्थिक वर्ष २०८१/०८२ सामाजिक सुरक्षा भत्ता भुक्तानी तालिका:
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
              नेपाल सरकारको DoNIDCR प्रणाली मार्फत प्रत्येक त्रैमासिकको अन्तिम महिनाभित्र तोकिएको बैंक खातामा सोझै भत्ता रकम जम्मा हुने व्यवस्था मिलाइएको छ।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              {
                quarter: 'प्रथम किस्ता (1st Trimester)',
                period: 'साउन, भदौ र असोज',
                disburse: 'असोज २० देखि २५ भित्र',
                status: 'सम्पन्न (Disbursed)',
                color: '#16a34a',
                bg: '#f0fdf4',
              },
              {
                quarter: 'दोस्रो किस्ता (2nd Trimester)',
                period: 'कात्तिक, मंसीर र पुस',
                disburse: 'पुस २० देखि २५ भित्र',
                status: 'सम्पन्न (Disbursed)',
                color: '#16a34a',
                bg: '#f0fdf4',
              },
              {
                quarter: 'तेस्रो किस्ता (3rd Trimester)',
                period: 'माघ, फागुन र चैत',
                disburse: 'चैत २० देखि २५ भित्र',
                status: 'भुक्तानी प्रक्रियामा (In Process)',
                color: '#d97706',
                bg: '#fffbeb',
              },
              {
                quarter: 'चौथो किस्ता (4th Trimester)',
                period: 'वैशाख, जेठ र असार',
                disburse: 'असार २० देखि २५ भित्र',
                status: 'आगामी (Upcoming)',
                color: '#64748b',
                bg: '#f8fafc',
              },
            ].map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: `1.5px solid ${q.color}40`,
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: q.color, background: q.bg, padding: '3px 8px', borderRadius: '4px' }}>
                    {q.status}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
                  {q.quarter}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                  <div><strong>अवधि:</strong> {q.period}</div>
                  <div><strong>निकासा मिति:</strong> {q.disburse}</div>
                </div>
              </div>
            ))}
          </div>

          <h4 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            🏦 तोकिएका भुक्तानी बैंक तथा वडा समन्वय विन्दुहरू:
          </h4>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>वडा</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>तोकिएको बैंक</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>शाखा स्थान</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>घरदैलो भुक्तानी सेवा</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ward: 'वडा नं. १ र २ (बाँसखर्क, बरुवा)', bank: 'नेपाल बैंक लिमिटेड', loc: 'भोताङ एक्सटेन्सन काउन्टर', door: 'अति अशक्त र ९० वर्ष माथिका लागि घरमै' },
                  { ward: 'वडा नं. ३ (भोताङ)', bank: 'नेपाल बैंक लिमिटेड', loc: 'भोताङ शाखा', door: 'प्रत्येक टोलमा बैंक टोली परिचालन' },
                  { ward: 'वडा नं. ४ र ६ (मानेखर्क, थाङपालकोट)', bank: 'कृषि विकास बैंक', loc: 'थाङपालधाप शाखा', door: 'वडा कार्यालयबाट घुम्ती बैंकिङ' },
                  { ward: 'वडा नं. ५ र ७ (गुन्सा, भोटेनाम्लाङ)', bank: 'ग्लोबल आइएमई बैंक', loc: 'पाँचपोखरी शाखा', door: 'अशक्तका लागि प्रतिनिधि मार्फत' },
                  { ward: 'वडा नं. ८ (लाँगर्चे)', bank: 'कृषि विकास बैंक', loc: 'थाङपालधाप शाखा', door: 'वडा कार्यालय घुम्ती भुक्तानी' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#be123c' }}>{row.ward}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{row.bank}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.loc}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 600 }}>{row.door}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GERIATRIC CAMPS & NUTRITION ───────────────────────── */}
      {activeTab === 'camps' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#be123c' }}>
                <Heart size={22} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>निःशुल्क घरदैलो ज्येष्ठ नागरिक स्वास्थ्य जाँच</h3>
              </div>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                गाउँपालिका स्वास्थ्य शाखा तथा थाङपालधाप आधारभूत अस्पतालका डाक्टर तथा नर्सहरूको टोलीद्वारा वडा १ देखि ८ का घरमै पुगेर रक्तचाप, मधुमेह, मुटुको गति, र निःशुल्क औषधि वितरण गरिन्छ।
              </p>
              <div style={{ background: '#fff1f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#9f1239' }}>
                ✓ प्रत्येक महिनाको १५ गते घुम्ती टोली परिचालन<br />
                ✓ निःशुल्क दीर्घरोग औषधि (एम्लोडिपिन, मेटफर्मिन आदि)
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0284c7' }}>
                <Award size={22} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>न्यानो कपडा तथा पौष्टिक आहार कार्यक्रम</h3>
              </div>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                जाडो मौसममा हिमाली तथा उच्च पहाडी भेग (भोताङ, बरुवा, गुन्सा) का ७५ वर्ष माथिका सम्पूर्ण ज्येष्ठ नागरिकहरूलाई न्यानो कम्बल, ज्याकेट, थर्मास र हर्लिक्स/पौष्टिक आहार वितरण।
              </p>
              <div style={{ background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#0369a1' }}>
                ✓ वार्षिक ६००+ ज्येष्ठ नागरिक लाभान्वित<br />
                ✓ वडा कार्यालय मार्फत गाउँबस्तीमै वितरण
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: WOMEN & CHILDREN INCLUSION ────────────────────────── */}
      {activeTab === 'children_women' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid #fbcfe8', borderRadius: '14px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#be123c', fontSize: '1.15rem', fontWeight: 700 }}>
              👩 महिला सशक्तिकरण तथा सीप विकास
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.88rem', lineHeight: '1.7' }}>
              <li>अल्लो तथा उन प्रशोधन, ढाका बुनाई, र स्थानीय हस्तकला तालिम</li>
              <li>घरेलु हिंसा न्यूनीकरण तथा निःशुल्क कानुनी परामर्श सहायता</li>
              <li>एकल महिला उद्यमशीलता विकासका लागि बीउ पुँजी अनुदान</li>
              <li>महिला स्वास्थ्य स्वयंसेविका (FCHV) प्रोत्साहन कार्यक्रम</li>
            </ul>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#0284c7', fontSize: '1.15rem', fontWeight: 700 }}>
              👶 बाल अधिकार तथा पोषण संरक्षण
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.88rem', lineHeight: '1.7' }}>
              <li>५ वर्ष मुनिका ५३२ बालबालिकालाई मासिक रु. ५३२ पोषण भत्ता</li>
              <li>१४ वटा प्रारम्भिक बाल विकास केन्द्र (ECED) सुदृढीकरण</li>
              <li>विद्यालयमा निःशुल्क दिवा खाजा कार्यक्रम (स्थानीय परिकार)</li>
              <li>बालमैत्री स्थानीय शासन (CFLG) वडा घोषणा अभियान</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── 5. OFFICIAL PRINTABLE SENIOR CITIZEN CARD MODAL ──────────── */}
      {selectedSenior && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                आधिकारिक ज्येष्ठ नागरिक परिचयपत्र (DoNIDCR ढाँचा)
              </h3>
              <button
                onClick={() => setSelectedSenior(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Golden bordered senior citizen card container */}
            <div style={{
              border: '3px solid #b45309',
              borderRadius: '12px',
              background: '#fffdfa',
              padding: '1.25rem',
              position: 'relative',
              boxShadow: 'inset 0 0 10px rgba(180, 83, 9, 0.08)',
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #b45309', paddingBottom: '0.6rem', marginBottom: '0.75rem', background: '#fef3c7', borderRadius: '8px 8px 0 0', padding: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>नेपाल सरकार</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>महिला, बालबालिका तथा ज्येष्ठ नागरिक मन्त्रालय</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                  ज्येष्ठ नागरिक परिचयपत्र (Senior Citizen Identity Card)
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#1e293b' }}>
                  <div><strong>संकेत नं:</strong> <span style={{ fontFamily: 'monospace', color: '#b45309', fontWeight: 700 }}>{selectedSenior.beneficiaryId}</span></div>
                  <div><strong>लाभग्राही:</strong> <strong>{selectedSenior.fullName}</strong></div>
                  <div><strong>नागरिकता/NID:</strong> {selectedSenior.citizenshipOrNidNo}</div>
                  <div><strong>जन्म मिति:</strong> वि.सं. {selectedSenior.dateOfBirthBs || '२००१-०३-१५'}</div>
                  <div><strong>स्थायी ठेगाना:</strong> वडा नं. {selectedSenior.wardNumber}, {selectedSenior.toleVillage || 'पाँचपोखरी थाङपाल'}</div>
                  <div><strong>बैंक खाता:</strong> {selectedSenior.bankName} - {selectedSenior.bankAccountNo || 'खाता प्रमाणित'}</div>
                  <div><strong>मासिक भत्ता:</strong> <strong style={{ color: '#16a34a' }}>रु. {Number(selectedSenior.monthlyAllowanceNPR).toLocaleString('ne-NP')}</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #d97706', borderRadius: '8px', padding: '0.4rem' }}>
                  <QrCode size={64} color="#b45309" />
                  <span style={{ fontSize: '0.65rem', color: '#b45309', marginTop: '4px', textAlign: 'center', fontWeight: 700 }}>
                    DoNIDCR प्रमाणित
                  </span>
                </div>
              </div>

              {/* Privileges Badge */}
              <div style={{ marginTop: '0.75rem', background: '#fef3c7', border: '1px dashed #d97706', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.4' }}>
                ⭐ <strong>कानूनी सुविधा:</strong> स्वास्थ्य संस्थामा प्राथमिकता तथा ५०% छुट, र सार्वजनिक यातायातमा ५०% भाडा छुट प्राप्त हुनेछ।
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', paddingTop: '0.6rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem' }}>
                <div style={{ color: '#475569' }}>
                  आर्थिक वर्ष: <strong>{selectedSenior.fiscalYear}</strong><br />
                  अवस्था: <strong style={{ color: '#16a34a' }}>सक्रिय लाभग्राही</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #64748b', width: '90px', marginBottom: '2px' }}></div>
                  पञ्जीकाधिकारी / वडा सचिव
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setSelectedSenior(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '0.5rem 1.25rem', background: '#be123c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>परिचयपत्र प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WomenChildrenSenior;
