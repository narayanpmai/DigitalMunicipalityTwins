import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Scale,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface InspectionRecord {
  id: string;
  shopName: string; // पसल / व्यवसायको नाम
  ownerName: string; // प्रोप्राइटर
  ward: number; // वडा
  location: string; // स्थान/बजार
  businessType: 'किराना/खाद्य' | 'मासु पसल/बधशाला' | 'होटल/रेस्टुरेन्ट' | 'औषधि पसल' | 'एग्रोभेट' | 'कपडा/इलेक्ट्रोनिक्स';
  inspectionDateBs: string; // अनुगमन मिति
  teamLeader: string; // अनुगमन टोली संयोजक (उपप्रमुख/अधिकृत)
  checklistPassed: boolean; // चेकलिस्ट पास
  deficiencies: string; // देखिएका कैफियत (मूल्यसूची नभएको, म्याद नाघेको)
  actionTaken: 'सन्तोषजनक' | 'सचेत गराइएको' | 'सामग्री जफत/नष्ट' | 'जरिवाना' | 'सिलबन्दी';
  fineAmountNpr: number; // जरिवाना रकम (रू.)
}

const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'insp-1',
    shopName: 'थाङपाल किराना तथा जनरल स्टोर',
    ownerName: 'हरि प्रसाद श्रेष्ठ',
    ward: 1,
    location: 'थाङपालधाप बजार',
    businessType: 'किराना/खाद्य',
    inspectionDateBs: '२०८१-०६-०२',
    teamLeader: 'उपाध्यक्ष (संयोजक)',
    checklistPassed: true,
    deficiencies: 'कुनै कैफियत नदेखिएको',
    actionTaken: 'सन्तोषजनक',
    fineAmountNpr: 0,
  },
  {
    id: 'insp-2',
    shopName: 'न्यू मानेखर्क फ्रेस हाउस तथा मासु पसल',
    ownerName: 'राजेश तामाङ',
    ward: 3,
    location: 'मानेखर्क चोक',
    businessType: 'मासु पसल/बधशाला',
    inspectionDateBs: '२०८१-०६-०२',
    teamLeader: 'उपाध्यक्ष (संयोजक)',
    checklistPassed: false,
    deficiencies: 'डीप फ्रिजर सफा नरहेको, जाली नभएको',
    actionTaken: 'सचेत गराइएको',
    fineAmountNpr: 0,
  },
  {
    id: 'insp-3',
    shopName: 'भोताङ मिनीमार्ट एण्ड खाजा घर',
    ownerName: 'पेम्बा दोर्जे शेर्पा',
    ward: 4,
    location: 'भोताङ बजार',
    businessType: 'किराना/खाद्य',
    inspectionDateBs: '२०८१-०५-२८',
    teamLeader: 'अधिकृत स्तरको अनुगमन टोली',
    checklistPassed: false,
    deficiencies: 'म्याद नाघेका पेय पदार्थ तथा बिस्कुट फेला परेको',
    actionTaken: 'सामग्री जफत/नष्ट',
    fineAmountNpr: 5000,
  },
  {
    id: 'insp-4',
    shopName: 'सिन्धु आधुनिक मेडिकल हल',
    ownerName: 'डा. दीपक अधिकारी',
    ward: 1,
    location: 'थाङपाल अस्पताल रोड',
    businessType: 'औषधि पसल',
    inspectionDateBs: '२०८१-०५-१५',
    teamLeader: 'स्वास्थ्य शाखा प्रमुख',
    checklistPassed: true,
    deficiencies: 'दर्ता तथा नवीकरण अद्यावधिक रहेको',
    actionTaken: 'सन्तोषजनक',
    fineAmountNpr: 0,
  },
];

export interface MarketInspectionPageProps {
  isPublic?: boolean;
}

export const MarketInspectionPage: React.FC<MarketInspectionPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'inspections' | 'checklist' | 'actions' | 'haatbazaar'>('inspections');
  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem(`market_inspections_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formShop, setFormShop] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formWard, setFormWard] = useState('1');
  const [formLocation, setFormLocation] = useState('');
  const [formType, setFormType] = useState<InspectionRecord['businessType']>('किराना/खाद्य');
  const [formDeficiencies, setFormDeficiencies] = useState('');
  const [formAction, setFormAction] = useState<InspectionRecord['actionTaken']>('सन्तोषजनक');
  const [formFine, setFormFine] = useState('0');

  useEffect(() => {
    localStorage.setItem(`market_inspections_${tenantId}`, JSON.stringify(inspections));
  }, [inspections, tenantId]);

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formShop) return;

    const newRec: InspectionRecord = {
      id: `insp-${Date.now()}`,
      shopName: formShop,
      ownerName: formOwner || 'प्रोप्राइटर',
      ward: Number(formWard),
      location: formLocation || 'बजार क्षेत्र',
      businessType: formType,
      inspectionDateBs: '२०८१-०६-१०',
      teamLeader: 'उपाध्यक्ष (संयोजक)',
      checklistPassed: formAction === 'सन्तोषजनक',
      deficiencies: formDeficiencies || 'कैफियत नभएको',
      actionTaken: formAction,
      fineAmountNpr: Number(formFine) || 0,
    };

    setInspections([newRec, ...inspections]);
    setIsAddModalOpen(false);
    setFormShop('');
    setFormOwner('');
  };

  // KPIs
  const totalInspected = inspections.length;
  const deficiencyCount = inspections.filter((i) => i.actionTaken !== 'सन्तोषजनक').length;
  const totalFines = inspections.reduce((acc, i) => acc + i.fineAmountNpr, 0);
  const satisfactoryPct = totalInspected > 0 ? (((totalInspected - deficiencyCount) / totalInspected) * 100).toFixed(1) : '100';

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      const matchSearch =
        i.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'all' || i.businessType === selectedType;
      return matchSearch && matchType;
    });
  }, [inspections, searchQuery, selectedType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(180, 83, 9, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Store size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                बजार अनुगमन, उपभोक्ता हित तथा हाटबजार
              </h1>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                संविधान अनुसूची ८ (एकल अधिकार १०)
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — उपप्रमुख/उपाध्यक्ष संयोजकत्वको बजार अनुगमन समिति, डिजिटल चेकलिस्ट तथा उपभोक्ता अधिकार संरक्षण
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#b45309',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={18} />
            <span>नयाँ अनुगमन प्रतिवेदन दर्ता</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            <Scale size={16} />
            <span>उपभोक्ता हित तथा खुला बजार अनुगमन विवरण</span>
          </div>
        )}
      </div>

      {/* ── KPI METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #b45309' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>कुल अनुगमन गरिएका पसल/फर्म</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>{totalInspected} वटा</div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px', fontWeight: 600 }}>
            आ.व. {activeFiscalYear} मा सम्पन्न अनुगमन
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>मापदण्ड अनुरुप सन्तोषजनक %</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>{satisfactoryPct}%</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            मूल्यसूची, म्याद तथा दर्ता नियमित
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>कैफियत/कारबाही गरिएका</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{deficiencyCount} पसल</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
            जफत, नष्ट तथा सचेत गराइएको
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>संकलित जरिवाना राजस्व</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>रू. {totalFines.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '2px', fontWeight: 600 }}>
            उपभोक्ता संरक्षण ऐन अनुरुप
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'inspections', label: 'बजार अनुगमन प्रतिवेदन सूची', icon: <Store size={16} /> },
          { key: 'checklist', label: 'डिजिटल अनुगमन चेकलिस्ट मापदण्ड', icon: <FileText size={16} /> },
          { key: 'actions', label: 'जफत/नष्ट तथा जरिवाना अभिलेख', icon: <Scale size={16} /> },
          { key: 'haatbazaar', label: 'स्थानीय हाटबजार तथा संकलन केन्द्र', icon: <Layers size={16} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              backgroundColor: activeTab === t.key ? '#ffffff' : 'transparent',
              color: activeTab === t.key ? '#b45309' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #b45309' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: INSPECTIONS TABLE ── */}
      {activeTab === 'inspections' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="पसल नाम, सञ्चालक, बजार..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="all">सबै व्यवसाय प्रकार</option>
                <option value="किराना/खाद्य">किराना/खाद्य</option>
                <option value="मासु पसल/बधशाला">मासु पसल/बधशाला</option>
                <option value="होटल/रेस्टुरेन्ट">होटल/रेस्टुरेन्ट</option>
                <option value="औषधि पसल">औषधि पसल</option>
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
              देखाउँदै: {filtered.length} / {inspections.length} अभिलेखहरू
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>पसल / फर्मको नाम</th>
                  <th style={{ padding: '10px 12px' }}>सञ्चालक (प्रोप्राइटर)</th>
                  <th style={{ padding: '10px 12px' }}>स्थान</th>
                  <th style={{ padding: '10px 12px' }}>व्यवसाय प्रकार</th>
                  <th style={{ padding: '10px 12px' }}>अनुगमन मिति</th>
                  <th style={{ padding: '10px 12px' }}>देखिएका कैफियतहरू</th>
                  <th style={{ padding: '10px 12px' }}>कारबाही / निष्कर्ष</th>
                  <th style={{ padding: '10px 12px' }}>जरिवाना</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{i.shopName}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{i.ownerName}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      वडा {i.ward}, {i.location}
                    </td>
                    <td style={{ padding: '12px' }}>{i.businessType}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{i.inspectionDateBs}</td>
                    <td style={{ padding: '12px', color: i.checklistPassed ? '#15803d' : '#b91c1c', maxWidth: '240px' }}>
                      {i.deficiencies}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: i.actionTaken === 'सन्तोषजनक' ? '#dcfce7' : '#fee2e2',
                          color: i.actionTaken === 'सन्तोषजनक' ? '#166534' : '#991b1b',
                        }}
                      >
                        ● {i.actionTaken}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: i.fineAmountNpr > 0 ? '#dc2626' : '#64748b' }}>
                      {i.fineAmountNpr > 0 ? `रू. ${i.fineAmountNpr.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: CHECKLIST ── */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { title: '१. व्यवसाय दर्ता तथा इजाजतपत्र', desc: 'गाउँ/नगरपालिकामा दर्ता र चालु आर्थिक वर्षको नवीकरण प्रमाणपत्र देखिने गरी राखेको।' },
            { title: '२. स्पष्ट मूल्यसूची (Price Board)', desc: 'उपभोक्ताले प्रष्ट देख्ने स्थानमा सबै खाद्य तथा दैनिक उपभोग्य वस्तुको मूल्यसूची टाँसेको।' },
            { title: '३. म्याद नाघेका वस्तु (Expiry Check)', desc: 'उत्पादन तथा उपभोग्य म्याद (Expiry Date) नाघेका खाद्य, पेय तथा औषधि वस्तु नभएको।' },
            { title: '४. नापतौल प्रमाणीकरण', desc: 'गुणस्तर तथा नापतौल विभागबाट डिजिटल वा स्ट्याण्डर्ड तराजु प्रमाणिकरण गरिएको।' },
            { title: '५. सरसफाइ तथा भण्डारण मापदण्ड', desc: 'मासु पसलमा डीप फ्रिजर/जाली, होटलमा सफा भान्सा र सुरक्षित पिउने पानीको व्यवस्था।' },
          ].map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.2rem' }}>
              <h5 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: ACTIONS ── */}
      {activeTab === 'actions' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>जफत तथा नष्ट गरिएका सामग्री विवरण</h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            अनुगमनका क्रममा फेला परेका म्याद गुज्रिएका पेय पदार्थ, अखाद्य रङ मिसाइएका मिठाई, म्याद नाघेका बिस्कुट-चाउचाउ स्थानीय जनप्रतिनिधि, प्रहरी तथा उद्योग वाणिज्य संघका प्रतिनिधिको रोहबरमा मुचुल्का उठाएर सुरक्षित रूपमा नष्ट गरिएको छ।
          </p>
        </div>
      )}

      {/* ── TAB 4: HAATBAZAAR ── */}
      {activeTab === 'haatbazaar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800 }}>थाङपालधाप साप्ताहिक हाटबजार</h4>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
              दिन: <strong>प्रत्येक शनिबार</strong> | स्थान: थाङपाल बजार चोक
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              स्थानीय कृषकहरूले उत्पादन गरेका आलु, मुला, सागपात, कोदो, घिउ तथा स्थानीय हस्तकला सामग्री सिधै उपभोक्तालाई बिक्री गर्ने प्रबन्ध।
            </p>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800 }}>कृषि उपज संकलन केन्द्र (मानेखर्क)</h4>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
              सञ्चालन: दैनिक बिहान ६ देखि १० बजेसम्म | शीतभण्डार सुविधासहित
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              राजधानी काठमाडौँ तथा मेलम्ची बजारतर्फ तरकारी तथा दूध संकलन र ढुवानी सहजीकरण।
            </p>
          </div>
        </div>
      )}

      {/* ── ADD INSPECTION MODAL ── */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '550px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>नयाँ बजार अनुगमन प्रतिवेदन दर्ता</h3>
            <form onSubmit={handleAddInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>पसल / फर्मको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. थाङपाल किराना स्टोर"
                  value={formShop}
                  onChange={(e) => setFormShop(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>सञ्चालक (प्रोप्राइटर)</label>
                  <input
                    type="text"
                    placeholder="नाम"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>व्यवसाय प्रकार</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="किराना/खाद्य">किराना/खाद्य</option>
                    <option value="मासु पसल/बधशाला">मासु पसल/बधशाला</option>
                    <option value="होटल/रेस्टुरेन्ट">होटल/रेस्टुरेन्ट</option>
                    <option value="औषधि पसल">औषधि पसल</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>वडा नं.</label>
                  <select
                    value={formWard}
                    onChange={(e) => setFormWard(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>स्थान / बजार</label>
                  <input
                    type="text"
                    placeholder="उदा. थाङपाल बजार"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>देखिएका कैफियतहरू</label>
                <textarea
                  rows={2}
                  placeholder="उदा. मूल्यसूची अद्यावधिक नभएको, म्याद गुज्रेको २ कार्टुन बिस्कुट फेला"
                  value={formDeficiencies}
                  onChange={(e) => setFormDeficiencies(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>कारबाही / निष्कर्ष</label>
                  <select
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="सन्तोषजनक">सन्तोषजनक</option>
                    <option value="सचेत गराइएको">सचेत गराइएको</option>
                    <option value="सामग्री जफत/नष्ट">सामग्री जफत/नष्ट</option>
                    <option value="जरिवाना">जरिवाना</option>
                    <option value="सिलबन्दी">सिलबन्दी</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>जरिवाना रकम (रू.)</label>
                  <input
                    type="number"
                    value={formFine}
                    onChange={(e) => setFormFine(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#b45309', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  प्रतिवेदन सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
