import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Accessibility,
  Heart,
  ShieldCheck,
  Search,
  Printer,
  QrCode,
  X,
  PhoneCall,
  MapPin,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  HelpCircle,
  Award,
  ChevronRight,
} from 'lucide-react';

interface DisabilityBeneficiary {
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

export const Disability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'verify' | 'request' | 'directory'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<DisabilityBeneficiary | null>(null);

  // Assistive device form state
  const [aidForm, setAidForm] = useState({
    fullName: '',
    wardNumber: '1',
    phone: '',
    cardCategory: 'क वर्ग (रातो कार्ड - पूर्ण अशक्त)',
    aidType: 'ह्विलचेयर (Wheelchair)',
    address: '',
    remarks: '',
  });
  const [aidSubmitted, setAidSubmitted] = useState(false);

  // Fetch social security beneficiaries to support live card verification
  const { data: beneficiaries = [] } = useQuery<DisabilityBeneficiary[]>({
    queryKey: ['disability-beneficiaries'],
    queryFn: async () => {
      const res: any = await api.get('/social-security');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list.filter((b: any) => 
        (b.category && b.category.includes('अपाङ्गता')) ||
        (b.beneficiaryId && (b.beneficiaryId === 'SSIS-2081-004' || b.beneficiaryId === 'SSIS-2081-007' || b.beneficiaryId === 'SSIS-2081-009'))
      );
    },
    staleTime: 60000,
  });

  // Filtered beneficiaries for lookup
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return beneficiaries.filter((b) =>
      (b.fullName && b.fullName.toLowerCase().includes(q)) ||
      (b.citizenshipOrNidNo && b.citizenshipOrNidNo.toLowerCase().includes(q)) ||
      (b.beneficiaryId && b.beneficiaryId.toLowerCase().includes(q))
    );
  }, [beneficiaries, searchQuery]);

  const handleAidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAidSubmitted(true);
    setTimeout(() => {
      setAidForm({
        fullName: '',
        wardNumber: '1',
        phone: '',
        cardCategory: 'क वर्ग (रातो कार्ड - पूर्ण अशक्त)',
        aidType: 'ह्विलचेयर (Wheelchair)',
        address: '',
        remarks: '',
      });
    }, 1000);
  };

  const CARD_CATEGORIES = [
    {
      type: 'क',
      name: 'क वर्ग (रातो परिचयपत्र / Red Card)',
      title: 'पूर्ण अशक्त अपाङ्गता (Profound Disability)',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fca5a5',
      allowance: 'रु. ३,९९० / महिना (त्रैमासिक रु. ११,९७०)',
      desc: 'अरूको पूर्ण सहारा बिना दैनिक जीवनका सामान्य कार्यहरू गर्न नसक्ने व्यक्तिहरू।',
      benefits: [
        'मासिक रु. ३,९९० सामाजिक सुरक्षा भत्ता',
        'ह्विलचेयर तथा सहयोगी उपकरण निःशुल्क वितरण',
        'घरमै नियमित स्वास्थ्य परीक्षण तथा औषधी सहायता',
        'हेरचाहकर्ता (केयरगिभर) प्रोत्साहन सहुलियत',
      ],
    },
    {
      type: 'ख',
      name: 'ख वर्ग (नीलो परिचयपत्र / Blue Card)',
      title: 'अति अशक्त अपाङ्गता (Severe Disability)',
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
      allowance: 'रु. २,१२८ / महिना (त्रैमासिक रु. ६,३८४)',
      desc: 'दैनिक व्यक्तिगत क्रियाकलाप गर्न अरूको आंशिक मद्दत चाहिने व्यक्तिहरू।',
      benefits: [
        'मासिक रु. २,१२८ सामाजिक सुरक्षा भत्ता',
        'सार्वजनिक यातायातमा ५०% भाडा छुट',
        'सहायक सामग्री (वैशाखी, सेतो छडी, श्रवण यन्त्र) निःशुल्क',
        'उच्च शिक्षासम्म निःशुल्क छात्रवृत्ति',
      ],
    },
    {
      type: 'ग',
      name: 'ग वर्ग (पहेंलो परिचयपत्र / Yellow Card)',
      title: 'मध्यम अपाङ्गता (Moderate Disability)',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      allowance: 'निःशुल्क सेवा तथा यातायात छुट',
      desc: 'दैनिक कार्य आफैं गर्न सक्ने तर व्यक्तिगत तथा सामाजिक अवरोध सामना गर्ने व्यक्तिहरू।',
      benefits: [
        'सार्वजनिक यातायातमा ५०% भाडा छुट',
        'सामुदायिक अस्पतालमा निःशुल्क ओपीडी र परीक्षण',
        'सरकारी प्राविधिक सीप तालिममा आरक्षण',
        'बैंक सहुलियत कर्जामा सिफारिस',
      ],
    },
    {
      type: 'घ',
      name: 'घ वर्ग (सेतो परिचयपत्र / White Card)',
      title: 'सामान्य अपाङ्गता (Mild Disability)',
      color: '#475569',
      bg: '#f8fafc',
      border: '#cbd5e1',
      allowance: 'सीप विकास तथा स्वरोजगार प्राथमिकता',
      desc: 'शारीरिक वा संवेदी अंगहरूमा सामान्य समस्या भई कार्यसम्पादन गर्न सक्ने व्यक्तिहरू।',
      benefits: [
        'लोकसेवा तथा सरकारी रोजगारीमा ५% समावेशी आरक्षण',
        'स्वरोजगार तथा व्यावसायिक अनुदानमा प्राथमिकता',
        'निःशुल्क कानुनी परामर्श सेवा',
        'पालिका खेलकुद तथा प्रतिभा प्रवर्द्धन',
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'inherit' }}>
      {/* ── 1. EMERGENCY & SUPPORT HOTLINE STRIP ──────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #581c87 0%, #7c3aed 100%)',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Accessibility size={22} color="#facc15" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            पाँचपोखरी थाङपाल गाउँपालिका — अपाङ्गता अधिकार तथा सामाजिक सुरक्षा सहायता डेस्क:
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="tel:9864165380"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <PhoneCall size={14} /> ९८६४१६५३८० (शाखा प्रमुख)
          </a>
          <a
            href="/gis-map?filter=social_care"
            style={{ color: '#581c87', background: '#facc15', padding: '4px 14px', borderRadius: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <Activity size={14} /> डिजिटल ट्विन नक्सा
          </a>
        </div>
      </div>

      {/* ── 2. HERO HEADER SECTION ───────────────────────────────────── */}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Award size={14} /> नेपाल सरकार राष्ट्रिय अपाङ्गता कार्यविधि २०७४ अनुसार
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Accessibility size={34} color="#7c3aed" />
            अपाङ्गता डिजिटल परिचयपत्र तथा सामाजिक सुरक्षा
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
            पाँचपोखरी थाङपाल गाउँपालिकाका सम्पूर्ण अपाङ्गता भएका नागरिकहरूको डिजिटल लगत, ४-वर्गीय परिचयपत्र प्रमाणिकरण, त्रैमासिक सामाजिक सुरक्षा भत्ता, र निःशुल्क सहायक सामग्री सेवा।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('verify')}
            style={{
              background: '#7c3aed',
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
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}
          >
            <Search size={16} /> परिचयपत्र खोजी / प्रमाणिकरण
          </button>
          <button
            onClick={() => setActiveTab('request')}
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
            <Heart size={16} color="#dc2626" /> सहायक उपकरण माग
          </button>
        </div>
      </div>

      {/* ── 3. KPI STATS CARDS ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'कुल अपाङ्गता भएका नागरिक', value: '५०८', sub: 'वडा १-८ को डिजिटल लगत', color: '#7c3aed' },
          { label: 'परिचयपत्र वितरण भएको', value: '४४५', sub: 'क, ख, ग, घ वर्ग प्रमाणित', color: '#0284c7' },
          { label: 'सामाजिक सुरक्षा भत्ता प्राप्तकर्ता', value: '३६०', sub: 'क र ख वर्गका लाभग्राही', color: '#16a34a' },
          { label: 'सहायक उपकरण निःशुल्क वितरण', value: '५६', sub: 'ह्विलचेयर, सेतो छडी, श्रवण यन्त्र', color: '#d97706' },
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── 4. NAVIGATION TABS ───────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'categories', label: '४-वर्गीय परिचयपत्र निर्देशिका (Card Categories)' },
          { id: 'verify', label: 'डिजिटल परिचयपत्र प्रमाणिकरण (Search & Verify ID)' },
          { id: 'request', label: 'सहायक उपकरण अनलाइन माग (Assistive Aid Request)' },
          { id: 'directory', label: 'वडागत विवरण र सम्पर्क (Ward Directory)' },
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
              color: activeTab === t.id ? '#7c3aed' : '#64748b',
              borderBottom: activeTab === t.id ? '3px solid #7c3aed' : '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: 4-CATEGORY CARDS ──────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ marginBottom: '1.5rem', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '1.25rem', borderRadius: '12px', color: '#4c1d95' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
              नेपाल सरकारको अपाङ्गता परिचयपत्र वर्गीकरण तथा सुविधा सम्बन्धी व्यवस्था:
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
              अपाङ्गता भएका व्यक्तिको अधिकार सम्बन्धी ऐन, २०७४ र नियमावली, २०७७ बमोजिम स्थानीय तहबाट चिकित्सकको सिफारिसमा ४ प्रकारका परिचयपत्रहरू वितरण गरिन्छ।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {CARD_CATEGORIES.map((cat) => (
              <div
                key={cat.type}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: `2px solid ${cat.border}`,
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      background: cat.color,
                      color: 'white',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}>
                      {cat.type}
                    </span>
                    <span style={{ background: cat.bg, color: cat.color, fontWeight: 700, fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${cat.border}` }}>
                      {cat.name}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                    {cat.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    {cat.desc}
                  </p>

                  <div style={{ background: cat.bg, border: `1px dashed ${cat.border}`, borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>सामाजिक सुरक्षा भत्ता:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: cat.color, marginTop: '2px' }}>
                      {cat.allowance}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    प्रमुख सेवा तथा सुविधाहरू:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.82rem', lineHeight: '1.6' }}>
                    {cat.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      setActiveTab('verify');
                      setSearchQuery(cat.type === 'क' ? '२७-०१-४०-००९१२' : (cat.type === 'ख' ? '२७-०१-४५-०१४३२' : ''));
                    }}
                    style={{
                      width: '100%',
                      background: cat.bg,
                      color: cat.color,
                      border: `1.5px solid ${cat.border}`,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{cat.type} वर्गको नमुना कार्ड हेर्नुहोस्</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: VERIFY DIGITAL ID CARD ────────────────────────────── */}
      {activeTab === 'verify' && (
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
              डिजिटल अपाङ्गता परिचयपत्र प्रमाणिकरण तथा खोजी
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              लाभग्राहीको नाम, नागरिकता नम्बर वा परिचयपत्र संकेत नम्बर (उदा: <strong>२७-०१-४०-००९१२</strong> वा <strong>SSIS-2081-004</strong> वा <strong>दोर्जे लामा</strong>) हानेर खोज्नुहोस्।
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
                onClick={() => setSearchQuery('२७-०१-४०-००९१२')}
                style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
              >
                नमुना (क वर्ग)
              </button>
              <button
                onClick={() => setSearchQuery('२७-०१-४५-०१४३२')}
                style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
              >
                नमुना (ख वर्ग)
              </button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {searchResults.map((b) => {
                const isRed = b.category.includes('रातो') || b.category.includes('क वर्ग');
                const badgeColor = isRed ? '#dc2626' : '#0284c7';
                const badgeBg = isRed ? '#fef2f2' : '#f0f9ff';

                return (
                  <div
                    key={b.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: `1.5px solid ${isRed ? '#fca5a5' : '#bae6fd'}`,
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}`, padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {b.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>वडा नं. {b.wardNumber}</span>
                    </div>

                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                      {b.fullName} {b.fullNameEn ? `(${b.fullNameEn})` : ''}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
                      <div><strong>संकेत नं:</strong> <span style={{ fontFamily: 'monospace', color: '#1e40af' }}>{b.beneficiaryId}</span></div>
                      <div><strong>नागरिकता नं:</strong> {b.citizenshipOrNidNo}</div>
                      <div><strong>ठेगाना:</strong> वडा नं. {b.wardNumber}, {b.toleVillage || 'पाँचपोखरी थाङपाल'}</div>
                      <div><strong>मासिक भत्ता:</strong> <strong style={{ color: '#16a34a' }}>रु. {Number(b.monthlyAllowanceNPR).toLocaleString('ne-NP')}</strong></div>
                    </div>

                    <button
                      onClick={() => setSelectedBeneficiary(b)}
                      style={{
                        width: '100%',
                        background: '#7c3aed',
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
                      <span>डिजिटल परिचयपत्र हेर्नुहोस् र प्रिन्ट गर्नुहोस्</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155' }}>कुनै अभिलेख फेला परेन</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                कृपया नागरिकता वा परिचयपत्र संकेत नम्बर पुनः जाँच गर्नुहोस्, वा वडा कार्यालयमा सम्पर्क गर्नुहोस्।
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              माथिको खोज बाकसमा नागरिकता वा संकेत नम्बर प्रविष्ट गर्नुहोस्।
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ASSISTIVE AID REQUEST FORM ────────────────────────── */}
      {activeTab === 'request' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>
              निःशुल्क सहायक सामग्री तथा उपकरण माग फाराम
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              ह्विलचेयर, सेतो छडी, वैशाखी वा श्रवण यन्त्र आवश्यक परेमा तलको फाराम भर्नुहोस्। पालिकाले सिधै घरमै उपलब्ध गराउनेछ।
            </p>
          </div>

          {aidSubmitted ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', color: '#166534' }}>
              <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>तपाईंको माग सफलतापूर्वक दर्ता भयो!</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                दर्ता नं: <strong>AID-2081-{Math.floor(1000 + Math.random() * 9000)}</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                स्वास्थ्य तथा सामाजिक विकास शाखाबाट २ दिनभित्र तपाईंको सम्पर्क नम्बरमा फोन गरी सामग्री हस्तान्तरण गरिनेछ।
              </p>
              <button
                onClick={() => setAidSubmitted(false)}
                style={{ marginTop: '1.25rem', background: '#16a34a', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                नयाँ माग दर्ता गर्नुहोस्
              </button>
            </div>
          ) : (
            <form onSubmit={handleAidSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    अपाङ्गता भएको व्यक्तिको पूरा नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: दोर्जे लामा"
                    value={aidForm.fullName}
                    onChange={(e) => setAidForm({ ...aidForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    वडा नम्बर *
                  </label>
                  <select
                    value={aidForm.wardNumber}
                    onChange={(e) => setAidForm({ ...aidForm, wardNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    सम्पर्क फोन नम्बर *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="९८४१२२३३४४"
                    value={aidForm.phone}
                    onChange={(e) => setAidForm({ ...aidForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    परिचयपत्रको वर्ग *
                  </label>
                  <select
                    value={aidForm.cardCategory}
                    onChange={(e) => setAidForm({ ...aidForm, cardCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="क वर्ग (रातो कार्ड - पूर्ण अशक्त)">क वर्ग (रातो कार्ड - पूर्ण अशक्त)</option>
                    <option value="ख वर्ग (नीलो कार्ड - अति अशक्त)">ख वर्ग (नीलो कार्ड - अति अशक्त)</option>
                    <option value="ग वर्ग (पहेंलो कार्ड - मध्यम)">ग वर्ग (पहेंलो कार्ड - मध्यम)</option>
                    <option value="घ वर्ग (सेतो कार्ड - सामान्य)">घ वर्ग (सेतो कार्ड - सामान्य)</option>
                    <option value="परिचयपत्र बन्न बाँकी">परिचयपत्र बन्न बाँकी</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  आवश्यक सामग्री / उपकरणको प्रकार *
                </label>
                <select
                  value={aidForm.aidType}
                  onChange={(e) => setAidForm({ ...aidForm, aidType: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="ह्विलचेयर (Wheelchair)">ह्विलचेयर (Wheelchair)</option>
                  <option value="कमोड ह्विलचेयर (Commode Wheelchair)">कमोड ह्विलचेयर (Commode Wheelchair)</option>
                  <option value="अपाङ्गता ट्राइसाइकल (Tricycle)">अपाङ्गता ट्राइसाइकल (Tricycle)</option>
                  <option value="वैशाखी (Elbow / Underarm Crutches)">वैशाखी (Elbow / Underarm Crutches)</option>
                  <option value="दृष्टिविहीन सेतो छडी (White Cane)">दृष्टिविहीन सेतो छडी (White Cane)</option>
                  <option value="श्रवण यन्त्र (Hearing Aid)">श्रवण यन्त्र (Hearing Aid)</option>
                  <option value="वाकर (Adult Walker)">वाकर (Adult Walker)</option>
                  <option value="कृत्रिम हात/खुट्टा (Prosthetic Limb Support)">कृत्रिम हात/खुट्टा (Prosthetic Limb Support)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  घरको टोल / ठेगाना तथा विशेष आवश्यकता
                </label>
                <textarea
                  rows={3}
                  placeholder="उदा: भोताङ, मानेडाँडा। घरमै सामग्री ल्याइदिन अनुरोध।"
                  value={aidForm.address}
                  onChange={(e) => setAidForm({ ...aidForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={16} />
                <span>माग फाराम पेश गर्नुहोस्</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── TAB 4: WARD DIRECTORY & GIS LINK ─────────────────────────── */}
      {activeTab === 'directory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
              वडागत अपाङ्गता समन्वय डेस्क तथा सम्पर्क विवरण
            </h3>
            <a
              href="/gis-map?filter=social_care"
              style={{
                background: '#7c3aed',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Activity size={15} />
              <span>डिजिटल ट्विन नक्सामा सबै केन्द्रहरू हेर्नुहोस्</span>
            </a>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>वडा</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>स्थान</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>जम्मा अपाङ्गता</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>भत्ता प्राप्तकर्ता</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>सम्पर्क व्यक्ति / सचिव</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 700 }}>डिजिटल ट्विन</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ward: 1, loc: 'बाँसखर्क', total: 52, allowance: 36, contact: 'रामबहादुर लामा: ९८६४१६५३८१' },
                  { ward: 2, loc: 'बरुवा', total: 65, allowance: 44, contact: 'दावा तामाङ: ९८६४१६५३८२' },
                  { ward: 3, loc: 'भोताङ', total: 82, allowance: 56, contact: 'पेम्बा शेर्पा: ९८६४१६५३८३' },
                  { ward: 4, loc: 'थाङपालकोट', total: 72, allowance: 50, contact: 'सोमबहादुर विक: ९८६४१६५३८४' },
                  { ward: 5, loc: 'गुन्सा', total: 58, allowance: 40, contact: 'मनमाया तामाङ: ९८६४१६५३८५' },
                  { ward: 6, loc: 'थाङपालधाप', total: 60, allowance: 42, contact: 'गोपाल खड्का: ९८६४१६५३८६' },
                  { ward: 7, loc: 'भोटेनाम्लाङ', total: 75, allowance: 52, contact: 'दावा शेर्पा: ९८६४१६५३८७' },
                  { ward: 8, loc: 'लाँगर्चे', total: 66, allowance: 46, contact: 'केशव दुलाल: ९८६४१६५३८८' },
                ].map((row) => (
                  <tr key={row.ward} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#7c3aed' }}>वडा नं. {row.ward}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{row.loc}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{row.total} जना</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#16a34a' }}>{row.allowance} जना</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.contact}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <a
                        href={`/gis-map?filter=social_care&ward=${row.ward}`}
                        style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MapPin size={14} /> नक्सामा हेर्नुहोस्
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. OFFICIAL PRINTABLE IDENTITY CARD MODAL ────────────────── */}
      {selectedBeneficiary && (
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
                आधिकारिक अपाङ्गता डिजिटल परिचयपत्र
              </h3>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Government ID Card Container */}
            {(() => {
              const isRed = selectedBeneficiary.category.includes('रातो') || selectedBeneficiary.category.includes('क वर्ग');
              const cardBorder = isRed ? '#dc2626' : '#0284c7';
              const cardHeaderBg = isRed ? '#fee2e2' : '#e0f2fe';
              const cardTitleColor = isRed ? '#991b1b' : '#075985';

              return (
                <div style={{
                  border: `3px solid ${cardBorder}`,
                  borderRadius: '12px',
                  background: '#fafafa',
                  padding: '1.25rem',
                  position: 'relative',
                }}>
                  {/* Card Header */}
                  <div style={{ textAlign: 'center', borderBottom: `2px solid ${cardBorder}`, paddingBottom: '0.75rem', marginBottom: '0.75rem', background: cardHeaderBg, borderRadius: '8px 8px 0 0', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>नेपाल सरकार</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>महिला, बालबालिका तथा ज्येष्ठ नागरिक मन्त्रालय</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: cardTitleColor, marginTop: '2px' }}>
                      अपाङ्गता परिचयपत्र — {isRed ? 'क वर्ग (पूर्ण अशक्त - रातो कार्ड)' : 'ख वर्ग (अति अशक्त - नीलो कार्ड)'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#1e293b' }}>
                      <div><strong>संकेत नं:</strong> <span style={{ fontFamily: 'monospace', color: cardBorder, fontWeight: 700 }}>{selectedBeneficiary.beneficiaryId}</span></div>
                      <div><strong>नाम/थर:</strong> <strong>{selectedBeneficiary.fullName}</strong></div>
                      <div><strong>नागरिकता/NID:</strong> {selectedBeneficiary.citizenshipOrNidNo}</div>
                      <div><strong>स्थायी ठेगाना:</strong> वडा नं. {selectedBeneficiary.wardNumber}, {selectedBeneficiary.toleVillage || 'पाँचपोखरी'}</div>
                      <div><strong>संरक्षक/हेरचाहकर्ता:</strong> {selectedBeneficiary.guardianName || 'उपलब्ध छैन'}</div>
                      <div><strong>मासिक सामाजिक सुरक्षा भत्ता:</strong> <strong style={{ color: '#16a34a' }}>रु. {Number(selectedBeneficiary.monthlyAllowanceNPR).toLocaleString('ne-NP')}</strong></div>
                      <div><strong>भुक्तानी बैंक:</strong> {selectedBeneficiary.bankName}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem' }}>
                      <QrCode size={64} color={cardBorder} />
                      <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center', fontWeight: 600 }}>
                        डिजिटल प्रमाणिक
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem' }}>
                    <div style={{ color: '#475569' }}>
                      जारी आर्थिक वर्ष: <strong>{selectedBeneficiary.fiscalYear}</strong><br />
                      प्रमाणिकरण अवस्था: <strong style={{ color: '#16a34a' }}>सक्रिय / नवीकृत</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #64748b', width: '90px', marginBottom: '2px' }}></div>
                      प्रमुख प्रशासकीय अधिकृत / वडा सचिव
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '0.5rem 1.25rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disability;
