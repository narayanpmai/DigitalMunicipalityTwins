import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  QrCode, Search, CheckCircle2, XCircle, Shield, FileText,
  Calendar, User, Hash, Building2, Download, RefreshCw,
  AlertTriangle, ShieldCheck, ScanLine, Loader2, Copy, Check, Edit2, Plus, Save, X, Trash2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   QR Certificate Verification — प्रमाणपत्र प्रमाणीकरण केन्द्र
   पाँचपोखरी थाङपाल गाउँपालिका
   ═══════════════════════════════════════════════════════════════════════════ */

type CertType = 'citizenship_recommendation' | 'birth' | 'death' | 'marriage' |
  'relationship' | 'income' | 'land' | 'business' | 'residence';

interface CertificateRecord {
  qrCode: string;
  certNo: string;
  type: CertType;
  issuedTo: string;
  issuedDate: string;      // BS
  issuedBy: string;
  ward: number | string;
  purpose?: string;
  expiryDate?: string;
  isValid: boolean;
  invalidReason?: string;
  details: Record<string, string>;
}

const CERT_TYPE_CONFIG: Record<CertType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  citizenship_recommendation: { label: 'नागरिकता सिफारिस',    icon: <Shield size={18} />,    color: '#0F4C81', bg: '#EBF3FA' },
  birth:      { label: 'जन्म दर्ता प्रमाण',       icon: <FileText size={18} />,   color: '#047857', bg: '#ECFDF5' },
  death:      { label: 'मृत्यु दर्ता प्रमाण',     icon: <FileText size={18} />,   color: '#374151', bg: '#F9FAFB' },
  marriage:   { label: 'विवाह दर्ता प्रमाण',      icon: <FileText size={18} />,   color: '#7C3AED', bg: '#F5F3FF' },
  relationship: { label: 'नाता प्रमाणित',          icon: <User size={18} />,       color: '#B45309', bg: '#FFFBEB' },
  income:     { label: 'आय प्रमाण',               icon: <FileText size={18} />,   color: '#0369A1', bg: '#F0F9FF' },
  land:       { label: 'घर-जग्गा सम्बन्धी',       icon: <Building2 size={18} />,  color: '#DC2626', bg: '#FEF2F2' },
  business:   { label: 'व्यवसाय दर्ता प्रमाण',    icon: <Building2 size={18} />,  color: '#BE185D', bg: '#FDF2F8' },
  residence:  { label: 'बसोबास सिफारिस',           icon: <Shield size={18} />,    color: '#6B7280', bg: '#F3F4F6' },
};

const MOCK_CERTS: CertificateRecord[] = [
  {
    qrCode: 'PTGP-2081-NR-001245',
    certNo: 'गापा/ना/२०८१/१२४५',
    type: 'citizenship_recommendation',
    issuedTo: 'राम बहादुर थापा',
    issuedDate: '२०८१ भाद्र ०५',
    issuedBy: 'वडा सचिव, वडा नं. ३',
    ward: 3,
    purpose: 'नागरिकताको लागि',
    expiryDate: '२०८१ कार्तिक ०५',
    isValid: true,
    details: {
      'नाम':           'राम बहादुर थापा',
      'बुबाको नाम':    'कृष्ण बहादुर थापा',
      'आमाको नाम':    'सीता थापा',
      'जन्म मिति (BS)': '२०३५ असार १५',
      'वडा नं.':        '३',
    },
  },
  {
    qrCode: 'PTGP-2081-BR-004512',
    certNo: 'गापा/ज/२०८१/४५१२',
    type: 'birth',
    issuedTo: 'सुमन कुमार श्रेष्ठ',
    issuedDate: '२०८१ श्रावण १२',
    issuedBy: 'दर्ता अधिकृत, गाउँपालिका',
    ward: 5,
    isValid: true,
    details: {
      'बच्चाको नाम':   'सुमन कुमार श्रेष्ठ',
      'बुबाको नाम':    'मनोज श्रेष्ठ',
    },
  },
  {
    qrCode: 'PTGP-2080-NR-007823',
    certNo: 'गापा/ना/२०८०/७८२३',
    type: 'citizenship_recommendation',
    issuedTo: 'सरिता देवी गुरुङ',
    issuedDate: '२०८० चैत्र २०',
    issuedBy: 'वडा सचिव, वडा नं. १',
    ward: 1,
    expiryDate: '२०८१ जेठ २०',
    isValid: false,
    invalidReason: 'म्याद समाप्त — पुनः सिफारिस लिनुहोस्।',
    details: {
      'नाम':        'सरिता देवी गुरुङ',
    },
  },
];

export const CertificateVerification: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  const [isEditing, setIsEditing] = useState(false);
  const [certs, setCerts] = useState(MOCK_CERTS);

  const [inputCode, setInputCode]     = useState('');
  const [result, setResult]           = useState<CertificateRecord | 'not_found' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied]           = useState(false);

  // Edit Mode States for displaying the list of all certificates to manage
  const [manageView, setManageView] = useState(false);

  // Load certificates from backend API
  React.useEffect(() => {
    async function loadCerts() {
      try {
        const res = await fetch('/api/v1/e-services/certificates/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCerts(data);
          }
        }
      } catch (err) {
        console.warn('Using local certificates cache:', err);
      }
    }
    loadCerts();
  }, []);

  const handleVerify = async (code?: string) => {
    const query = (code || inputCode).trim();
    if (!query) return;

    setIsSearching(true);
    setResult(null);
    setManageView(false);
    if (code) setInputCode(code);

    try {
      const res = await fetch(`/api/v1/e-services/certificates/verify/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.warn('API verify fallback to client search:', err);
    }

    const found = certs.find((c) => 
      c.qrCode.toUpperCase() === query.toUpperCase() || 
      c.certNo.toUpperCase() === query.toUpperCase()
    );
    setResult(found || 'not_found');
    setIsSearching(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCert = () => {
    const newCert: CertificateRecord = {
      qrCode: `PTGP-NEW-${Date.now().toString().slice(-4)}`,
      certNo: 'नयाँ दर्ता',
      type: 'birth',
      issuedTo: 'नयाँ नाम',
      issuedDate: '२०८१/०१/०१',
      issuedBy: 'सचिव',
      ward: '१',
      isValid: true,
      details: {},
    };
    setCerts([newCert, ...certs]);
  };

  const handleEdit = (qrCode: string, field: keyof CertificateRecord, value: any) => {
    setCerts(certs.map(c => c.qrCode === qrCode ? { ...c, [field]: value } : c));
  };

  const handleDelete = (qrCode: string) => {
    if(window.confirm("के तपाईं यो प्रमाणपत्र हटाउन निश्चित हुनुहुन्छ?")) {
      setCerts(certs.filter(c => c.qrCode !== qrCode));
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', fontSize: '0.85rem', border: '1.5px solid #CBD5E1', borderRadius: '6px',
    outline: 'none', fontFamily: 'inherit', width: '100%', color: '#0F172A', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Noto Sans Devanagari','Outfit','Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EBF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={26} color="#0F4C81" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>प्रमाणपत्र प्रमाणीकरण (QR Verification)</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              डिजिटल हस्ताक्षरयुक्त प्रमाणपत्रहरूको सत्यता जाँच्नुहोस्
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setManageView(!manageView); setResult(null); }} style={{ padding: '8px 16px', background: manageView ? '#F1F5F9' : '#0F4C81', color: manageView ? '#475569' : '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              {manageView ? 'खोज पृष्ठ' : 'प्रमाणपत्र व्यवस्थापन'}
            </button>
            {manageView && (
              <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '8px 16px', background: isEditing ? '#DC2626' : '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isEditing ? <><Save size={14} /> सुरक्षित</> : <><Edit2 size={14} /> सम्पादन</>}
              </button>
            )}
          </div>
        )}
      </div>

      {!manageView ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Search Box */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <ScanLine size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="QR कोड वा दर्ता नम्बर टाइप गर्नुहोस्..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  style={{ width: '100%', padding: '14px 16px 14px 44px', fontSize: '1rem', border: '2px solid #E2E8F0', borderRadius: '10px', outline: 'none', background: '#F8FAFC', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={() => handleVerify()}
                disabled={isSearching || !inputCode.trim()}
                style={{ padding: '0 24px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: inputCode.trim() ? 'pointer' : 'not-allowed', opacity: inputCode.trim() ? 1 : 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                खोज्नुहोस्
              </button>
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>नमूना कोडहरू:</span>
              {['PTGP-2081-NR-001245', 'PTGP-2081-BR-004512'].map((code) => (
                <button key={code} onClick={() => handleVerify(code)} style={{ padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '9999px', fontSize: '0.75rem', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {result === 'not_found' && (
            <div style={{ background: '#FEF2F2', border: '2px dashed #FECACA', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <XCircle size={48} color="#EF4444" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991B1B', margin: '0 0 8px 0' }}>प्रमाणपत्र भेटिएन</h3>
              <p style={{ color: '#B91C1C', fontSize: '0.9rem', margin: 0 }}>
                तपाईंले प्रविष्ट गर्नुभएको QR कोड वा दर्ता नम्बर प्रणालीमा भेटिएन। कृपया कोड राम्ररी जाँचेर पुनः प्रयास गर्नुहोस्।
              </p>
            </div>
          )}

          {result && result !== 'not_found' && (
            <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
              {/* Header Status */}
              <div style={{ background: result.isValid ? '#ECFDF5' : '#FEF2F2', padding: '24px', textAlign: 'center', borderBottom: '1px solid ' + (result.isValid ? '#D1FAE5' : '#FEE2E2') }}>
                {result.isValid ? (
                  <CheckCircle2 size={54} color="#059669" style={{ marginBottom: '12px' }} />
                ) : (
                  <AlertTriangle size={54} color="#DC2626" style={{ marginBottom: '12px' }} />
                )}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: result.isValid ? '#065F46' : '#991B1B', margin: '0 0 6px 0' }}>
                  {result.isValid ? 'प्रमाणपत्र आधिकारिक छ' : 'प्रमाणपत्र अवैध वा म्याद सकिएको'}
                </h2>
                {!result.isValid && result.invalidReason && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#B91C1C', fontWeight: 600 }}>कारण: {result.invalidReason}</p>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', background: CERT_TYPE_CONFIG[result.type].bg, color: CERT_TYPE_CONFIG[result.type].color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {CERT_TYPE_CONFIG[result.type].icon}
                    {CERT_TYPE_CONFIG[result.type].label}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', background: '#F1F5F9', color: '#475569' }}>
                    वडा नं. {result.ward}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>नाम / जारी गरिएको व्यक्ति</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{result.issuedTo}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>दर्ता नम्बर</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{result.certNo}</div>
                  </div>
                </div>

                {/* Additional Details */}
                <div style={{ borderTop: '1.5px dashed #E2E8F0', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>थप विवरण</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'y-12px x-20px', rowGap: '12px', columnGap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>जारी मिति</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{result.issuedDate}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>जारी गर्ने अधिकारी</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{result.issuedBy}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => window.print()} style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} /> विवरण प्रिन्ट गर्नुहोस्
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── MANAGE VIEW (Admin CRUD) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <h2 style={{fontSize:'1.2rem', fontWeight: 800, color: '#0F172A', margin:0}}>सबै प्रमाणपत्रहरू ({certs.length})</h2>
             {isEditing && (
               <button onClick={handleAddCert} style={{ padding: '8px 16px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <Plus size={16} /> नयाँ दर्ता
               </button>
             )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {certs.map(c => (
              <div key={c.qrCode} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                 {isEditing ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>QR Code: {c.qrCode}</span>
                         <button onClick={() => handleDelete(c.qrCode)} style={{ padding: '4px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                      </div>
                      <input type="text" value={c.issuedTo} placeholder="नाम" onChange={e => handleEdit(c.qrCode, 'issuedTo', e.target.value)} style={{ ...inputStyle, fontWeight: 800, fontSize: '1rem' }} />
                      <input type="text" value={c.certNo} placeholder="दर्ता नम्बर" onChange={e => handleEdit(c.qrCode, 'certNo', e.target.value)} style={inputStyle} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={c.type} onChange={e => handleEdit(c.qrCode, 'type', e.target.value)} style={{ ...inputStyle, flex: 2 }}>
                          {Object.entries(CERT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <input type="text" value={c.ward} placeholder="वडा" onChange={e => handleEdit(c.qrCode, 'ward', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={c.isValid ? 'true' : 'false'} onChange={e => handleEdit(c.qrCode, 'isValid', e.target.value === 'true')} style={{ ...inputStyle, background: c.isValid ? '#F0FDF4' : '#FEF2F2', color: c.isValid ? '#166534' : '#991B1B' }}>
                          <option value="true">सक्रिय (Valid)</option>
                          <option value="false">अवैध (Invalid)</option>
                        </select>
                        <input type="text" value={c.issuedDate} placeholder="मिति" onChange={e => handleEdit(c.qrCode, 'issuedDate', e.target.value)} style={inputStyle} />
                      </div>
                   </div>
                 ) : (
                   <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: CERT_TYPE_CONFIG[c.type].bg, color: CERT_TYPE_CONFIG[c.type].color }}>{CERT_TYPE_CONFIG[c.type].label}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: c.isValid ? '#ECFDF5' : '#FEF2F2', color: c.isValid ? '#047857' : '#DC2626' }}>{c.isValid ? 'Valid' : 'Invalid'}</span>
                     </div>
                     <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{c.issuedTo}</div>
                     <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '2px' }}><Hash size={12} style={{marginRight:'4px'}}/> {c.certNo}</div>
                     <div style={{ fontSize: '0.8rem', color: '#475569' }}><QrCode size={12} style={{marginRight:'4px'}}/> {c.qrCode}</div>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default CertificateVerification;
