import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Scale,
  Search,
  Download,
  ExternalLink,
  FileText,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Tag,
  Calendar,
  Eye,
  BookMarked,
  ScrollText,
  Landmark,
  ShieldCheck,
  Gavel,
  Edit2,
  UploadCloud,
  Plus,
  X,
  Save,
  Trash2,
  Hash,
} from 'lucide-react';

type DocStatus = 'active' | 'draft' | 'amended' | 'repealed';
type DocCategory = 'act' | 'procedure' | 'policy' | 'guideline' | 'regulation' | 'decision';

interface LegalDocument {
  id: string;
  title: string;
  titleEn?: string;
  category: DocCategory;
  status: DocStatus;
  enacted: string;       // BS date
  amended?: string;
  docNo?: string;
  session?: string;       // e.g. "२०७९ सालको ७ौं अधिवेशन"
  summary: string;
  tags: string[];
  fileUrl?: string;       // PDF link (optional)
  pages?: number;
}

const DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-001',
    title: 'पाँचपोखरी थाङपाल गाउँपालिका आन्तरिक राजस्व ऐन, २०७४',
    category: 'act', status: 'active',
    enacted: '२०७४ फागुन १५', docNo: 'गापा/ऐन/०७४/०१', session: '२०७४ सालको पहिलो अधिवेशन',
    summary: 'गाउँपालिकाभित्र उठाइने सम्पत्ति कर, व्यवसाय कर, घर-जग्गा नामसारी दस्तुर र अन्य स्थानीय राजस्व सम्बन्धी व्यवस्था गरिएको ऐन।',
    tags: ['राजस्व', 'कर', 'आर्थिक'], pages: 24,
  },
  {
    id: 'doc-002',
    title: 'पाँचपोखरी थाङपाल गाउँपालिका शिक्षा ऐन, २०७५',
    category: 'act', status: 'active',
    enacted: '२०७५ जेठ ०५', docNo: 'गापा/ऐन/०७५/०२', session: '२०७५ सालको दोस्रो अधिवेशन',
    summary: 'गाउँपालिकाभित्रका विद्यालयहरूको दर्ता, व्यवस्थापन, शिक्षक नियुक्ति तथा शैक्षिक मानकसम्बन्धी व्यवस्था।',
    tags: ['शिक्षा', 'विद्यालय'], pages: 32,
  },
  {
    id: 'doc-003',
    title: 'घर-जग्गा विकास तथा भवन निर्माण कार्यविधि, २०७७',
    category: 'procedure', status: 'active',
    enacted: '२०७७ असोज २०', amended: '२०८०/०३/१५', docNo: 'गापा/का/०७७/०५',
    summary: 'भवन निर्माण अनुमति दिने र नियमन गर्ने प्रक्रिया, नक्सा पास मापदण्डसम्बन्धी व्यवस्था।',
    tags: ['भवन', 'नक्सापास'], pages: 18,
  }
];

const CAT_CONFIG: Record<DocCategory, { label: string; bg: string; color: string }> = {
  act:        { label: 'ऐन',         bg: '#EBF3FA', color: '#0F4C81' },
  procedure:  { label: 'कार्यविधि',     bg: '#ECFDF5', color: '#047857' },
  policy:     { label: 'नीति',         bg: '#F5F3FF', color: '#7C3AED' },
  guideline:  { label: 'निर्देशिका',     bg: '#FFFBEB', color: '#B45309' },
  regulation: { label: 'विनियमावली',   bg: '#FDF2F8', color: '#BE185D' },
  decision:   { label: 'निर्णय/आदेश',   bg: '#FEF2F2', color: '#DC2626' },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; bg: string; color: string; border: string }> = {
  active:   { label: 'सक्रिय',      bg: '#F0FDF4', color: '#166534', border: '#bbf7d0' },
  draft:    { label: 'मस्यौदा',     bg: '#FFFBEB', color: '#92400E', border: '#fde68a' },
  amended:  { label: 'संशोधित',    bg: '#EFF6FF', color: '#1E40AF', border: '#bfdbfe' },
  repealed: { label: 'खारेज',       bg: '#FEF2F2', color: '#991B1B', border: '#fecaca' },
};

export const LegalRepository: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState(DOCUMENTS);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab]     = useState<DocCategory | 'all'>('all');
  const [expandedId, setExpandedId]   = useState<string | null>('doc-001');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return docs.filter((d) => {
      const matchTab = activeTab === 'all' || d.category === activeTab;
      const matchSearch = !q ||
        d.title.toLowerCase().includes(q) ||
        (d.docNo && d.docNo.toLowerCase().includes(q)) ||
        d.tags.some(t => t.toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [searchQuery, activeTab, docs]);

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setDocs(docs.map(d => d.id === id ? { ...d, fileUrl: url } : d));
    }
  };

  const handleAddDoc = () => {
    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      title: 'नयाँ कानुन / ऐन',
      category: 'act',
      status: 'draft',
      enacted: '२०८१/०१/०१',
      summary: 'यसको विवरण यहाँ लेख्नुहोस्...',
      tags: [],
    };
    setDocs([newDoc, ...docs]);
    setExpandedId(newDoc.id);
    setIsEditing(true);
  };

  const handleEdit = (id: string, field: string, value: any) => {
    setDocs(docs.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleDelete = (id: string) => {
    if(window.confirm("के तपाईं यो डकुमेन्ट मेटाउन निश्चित हुनुहुन्छ?")) {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', fontSize: '0.85rem', border: '1.5px solid #CBD5E1', borderRadius: '6px',
    outline: 'none', fontFamily: 'inherit', width: '100%', color: '#0F172A', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: '0.5rem 0', width: '100%', minHeight: 'auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EBF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scale size={24} color="#0F4C81" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                कानुन तथा ऐन संगालो
              </h1>
              <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '9999px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> आधिकारिक स्रोत
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '6px 0 0 0' }}>
              पाँचपोखरी थाङपाल गाउँपालिकाद्वारा निर्मित ऐन, कानुन, कार्यविधि, नीति र निर्देशिकाहरूको आधिकारिक संग्रह
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: isEditing ? '#DC2626' : '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isEditing ? <><Save size={14} /> सुरक्षित गर्नुहोस्</> : <><Edit2 size={14} /> सम्पादन गर्नुहोस्</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="ऐन, कार्यविधि, ट्याग वा दर्ता नम्बर खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        {isAdmin && (
          <button onClick={handleAddDoc} style={{ padding: '10px 16px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(15,76,129,0.15)' }}>
            <Plus size={16} /> नयाँ थप्नुहोस्
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('all')} style={{ padding: '8px 18px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '9999px', cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid transparent', background: activeTab === 'all' ? '#0F172A' : '#F1F5F9', color: activeTab === 'all' ? '#fff' : '#64748B' }}>सबै</button>
        {Object.entries(CAT_CONFIG).map(([k, v]) => (
          <button key={k} onClick={() => setActiveTab(k as any)} style={{ padding: '8px 18px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '9999px', cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${activeTab === k ? v.color : 'transparent'}`, background: activeTab === k ? v.bg : '#F1F5F9', color: activeTab === k ? v.color : '#64748B' }}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((doc) => {
          const cat = CAT_CONFIG[doc.category];
          const st = STATUS_CONFIG[doc.status];
          const isOpen = expandedId === doc.id;

          return (
            <div key={doc.id} style={{ background: '#fff', border: '1.5px solid', borderColor: isOpen ? '#BCD5EB' : '#E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: isOpen ? '0 4px 20px rgba(15,76,129,0.08)' : 'none', transition: 'all 0.2s' }}>
              <button onClick={() => toggleExpand(doc.id)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'inherit' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ScrollText size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input type="text" value={doc.title} onChange={e => handleEdit(doc.id, 'title', e.target.value)} onClick={e => e.stopPropagation()} style={{ ...inputStyle, fontWeight: 700, fontSize: '1.15rem', marginBottom: '8px' }} />
                  ) : (
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>{doc.title}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {isEditing ? (
                      <>
                        <select value={doc.category} onChange={e => handleEdit(doc.id, 'category', e.target.value)} onClick={e => e.stopPropagation()} style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
                          {Object.entries(CAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={doc.status} onChange={e => handleEdit(doc.id, 'status', e.target.value)} onClick={e => e.stopPropagation()} style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <input type="text" value={doc.enacted} placeholder="जारी मिति" onChange={e => handleEdit(doc.id, 'enacted', e.target.value)} onClick={e => e.stopPropagation()} style={{ ...inputStyle, width: '140px', padding: '6px 10px', fontSize: '0.85rem' }} />
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', background: cat.bg, color: cat.color }}>{cat.label}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', background: st.bg, color: st.color, border: '1px solid ' + st.border }}>{st.label}</span>
                        {doc.docNo && <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{doc.docNo}</span>}
                        <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {doc.enacted}</span>
                      </>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div onClick={e => { e.stopPropagation(); handleDelete(doc.id); }} style={{ color: '#EF4444', background: '#FEF2F2', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </div>
                )}
                <div style={{ color: '#64748B', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                  <ChevronRight size={18} />
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid #E2E8F0', padding: '20px', background: '#F8FAFC' }}>
                  {isEditing ? (
                    <textarea value={doc.summary} onChange={e => handleEdit(doc.id, 'summary', e.target.value)} style={{ ...inputStyle, minHeight: '80px', marginBottom: '20px', fontSize: '1rem' }} placeholder="संक्षिप्त विवरण (Summary) लेख्नुहोस्..." />
                  ) : (
                    <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.65, margin: '0 0 20px 0' }}>{doc.summary}</p>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'जारी मिति', value: doc.enacted, icon: <Calendar size={14} />, field: 'enacted' },
                      { label: 'पछिल्लो संशोधन', value: doc.amended || '', icon: <Clock size={14} />, field: 'amended' },
                      { label: 'दर्ता नं.', value: doc.docNo || '', icon: <Hash size={14} />, field: 'docNo' },
                      { label: 'अधिवेशन', value: doc.session || '', icon: <Landmark size={14} />, field: 'session' },
                    ].map((item) => (
                      <div key={item.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                          {item.icon} {item.label}
                        </div>
                        {isEditing ? (
                          <input type="text" value={item.value} onChange={e => handleEdit(doc.id, item.field, e.target.value)} style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.9rem' }} />
                        ) : (
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{item.value || '-'}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" download={doc.title + ".pdf"} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, background: '#0F4C81', color: '#fff', textDecoration: 'none' }}>
                        <Download size={16} /> PDF डाउनलोड
                      </a>
                    ) : (
                      <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, background: '#F1F5F9', color: '#64748B', border: '1.5px solid #E2E8F0', cursor: 'pointer' }}>
                        <Download size={16} /> प्रिन्ट गर्नुहोस्
                      </button>
                    )}

                    {isEditing && (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, background: '#047857', color: '#fff', cursor: 'pointer' }}>
                        <UploadCloud size={16} /> PDF अपलोड
                        <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, doc.id)} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LegalRepository;
