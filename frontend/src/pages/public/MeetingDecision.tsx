import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Gavel, Calendar, Users, CheckCircle2, Clock, Search,
  ChevronRight, FileText, Landmark, Tag, Filter, AlertCircle,
  BookOpen, ShieldCheck, Download, ArrowRight, XCircle, Edit2, Plus, Save, X, Trash2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Meeting & Decision System — बैठक तथा निर्णय प्रणाली
   पाँचपोखरी थाङपाल गाउँपालिका
   ═══════════════════════════════════════════════════════════════════════════ */

type MeetingType = 'gaun_sabha' | 'karyapalika' | 'ward' | 'committee' | 'special';
type DecisionStatus = 'implemented' | 'in_progress' | 'pending' | 'cancelled';

interface Decision {
  id: string;
  title: string;
  details?: string;
  status: DecisionStatus;
  responsibleDept: string;
  deadline?: string;
}

interface Meeting {
  id: string;
  type: MeetingType;
  session: string;
  date: string;
  venue: string;
  chairperson: string;
  attendees: number;
  quorum: number;
  agendaCount: number;
  decisions: Decision[];
  minutesUrl?: string;
}

const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  gaun_sabha:  { label: 'गाउँ सभा',     color: '#0F4C81', bg: '#EBF3FA', icon: <Landmark size={14} /> },
  karyapalika: { label: 'कार्यपालिका', color: '#047857', bg: '#ECFDF5', icon: <Gavel size={14} /> },
  ward:        { label: 'वडा बैठक',     color: '#7C3AED', bg: '#F5F3FF', icon: <Users size={14} /> },
  committee:   { label: 'समिति बैठक',   color: '#B45309', bg: '#FFFBEB', icon: <BookOpen size={14} /> },
  special:     { label: 'विशेष बैठक',   color: '#DC2626', bg: '#FEF2F2', icon: <AlertCircle size={14} /> },
};

const DECISION_STATUS: Record<DecisionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  implemented: { label: 'कार्यान्वयन भयो', color: '#065F46', bg: '#ECFDF5', icon: <CheckCircle2 size={12} /> },
  in_progress: { label: 'प्रक्रियामा छ',   color: '#1D4ED8', bg: '#EFF6FF', icon: <Clock size={12} /> },
  pending:     { label: 'बाँकी छ',          color: '#92400E', bg: '#FFFBEB', icon: <Clock size={12} /> },
  cancelled:   { label: 'खारेज भयो',        color: '#991B1B', bg: '#FEF2F2', icon: <XCircle size={12} /> },
};

const MEETINGS: Meeting[] = [
  {
    id: 'mtg-001',
    type: 'gaun_sabha',
    session: '२०८१ सालको ६ औं अधिवेशन (बजेट अधिवेशन)',
    date: '२०८१ असार १५',
    venue: 'गाउँपालिका सभाहल',
    chairperson: 'गाउँपालिका अध्यक्ष',
    attendees: 21, quorum: 19, agendaCount: 8,
    decisions: [
      { id: 'd1', title: 'आ.व. २०८१/८२ को वार्षिक बजेट रू. ३२ करोड ७५ लाख पारित', status: 'implemented', responsibleDept: 'आर्थिक शाखा' },
      { id: 'd2', title: 'घर-जग्गा नामसारी दस्तुर संशोधन (१.५% बाट २% गर्ने)', status: 'implemented', responsibleDept: 'राजस्व शाखा' },
      { id: 'd3', title: 'वडा नं. ३ मा नयाँ सामुदायिक भवन निर्माण स्वीकृत', status: 'in_progress', responsibleDept: 'पूर्वाधार शाखा', deadline: '२०८२ चैत्र' },
      { id: 'd4', title: 'डिजिटल ट्विन प्रणाली कार्यान्वयन बजेट विनियोजन', status: 'implemented', responsibleDept: 'IT शाखा' },
    ],
  },
  {
    id: 'mtg-002',
    type: 'karyapalika',
    session: 'कार्यपालिका बैठक — ११४औं',
    date: '२०८१ भाद्र ०५',
    venue: 'कार्यपालिका बैठक कक्ष',
    chairperson: 'गाउँपालिका अध्यक्ष',
    attendees: 11, quorum: 9, agendaCount: 6,
    decisions: [
      { id: 'd5', title: 'वडा ४ र ५ को खानेपानी लाइन विस्तार खरिद स्वीकृत', status: 'in_progress', responsibleDept: 'खानेपानी शाखा', deadline: '२०८१ मंसिर' },
      { id: 'd6', title: 'सामाजिक सुरक्षा लाभग्राहीहरूको तेस्रो किस्ता भुक्तानी स्वीकृत', status: 'implemented', responsibleDept: 'सामाजिक विकास' },
      { id: 'd7', title: '२०८१/०८२ को वार्षिक योजना कार्यक्रम स्वीकृत', status: 'implemented', responsibleDept: 'योजना शाखा' },
    ],
  },
  {
    id: 'mtg-003',
    type: 'karyapalika',
    session: 'कार्यपालिका बैठक — ११५औं',
    date: '२०८१ असोज १८',
    venue: 'कार्यपालिका बैठक कक्ष',
    chairperson: 'उपाध्यक्ष (कार्यवाहक)',
    attendees: 10, quorum: 9, agendaCount: 5,
    decisions: [
      { id: 'd8', title: 'पर्यटन प्रवर्द्धन कार्यक्रम बजेट रकम रू. ५ लाख स्वीकृत', status: 'pending', responsibleDept: 'पर्यटन शाखा', deadline: '२०८२ फागुन' },
      { id: 'd9', title: 'वडा ७ मा कृषि सहकारी दर्ता अनुमोदन', status: 'implemented', responsibleDept: 'कृषि शाखा' },
    ],
  },
  {
    id: 'mtg-004',
    type: 'ward',
    session: 'वडा नं. २ को मासिक बैठक',
    date: '२०८१ असोज ०१',
    venue: 'वडा नं. २ कार्यालय',
    chairperson: 'वडा अध्यक्ष (वडा २)',
    attendees: 9, quorum: 7, agendaCount: 4,
    decisions: [
      { id: 'd10', title: 'वडाको सडक मर्मत सम्बन्धमा गाउँपालिकामा माग पत्र पठाउने निर्णय', status: 'implemented', responsibleDept: 'वडा कार्यालय' },
      { id: 'd11', title: 'स्थानीय स्वास्थ्य शिविर आयोजना मिति तय', status: 'in_progress', responsibleDept: 'स्वास्थ्य शाखा', deadline: '२०८१ कार्तिक' },
    ],
  },
  {
    id: 'mtg-005',
    type: 'committee',
    session: 'सार्वजनिक लेखा समिति बैठक — तेस्रो',
    date: '२०८१ श्रावण २०',
    venue: 'समिति बैठक कक्ष',
    chairperson: 'लेखा समिति सभापति',
    attendees: 7, quorum: 5, agendaCount: 3,
    decisions: [
      { id: 'd12', title: 'आ.व. २०८०/८१ को लेखापरीक्षण प्रतिवेदन समीक्षा सम्पन्न', status: 'implemented', responsibleDept: 'लेखा शाखा' },
      { id: 'd13', title: 'अनियमितता भएको ३ ठेक्का सम्बन्धमा स्पष्टीकरण माग', status: 'in_progress', responsibleDept: 'खरिद शाखा' },
    ],
  },
  {
    id: 'mtg-006',
    type: 'special',
    session: 'विपद् प्रतिकार्य — आपतकालीन बैठक',
    date: '२०८१ असार २०',
    venue: 'गाउँपालिका प्रमुख कार्यालय',
    chairperson: 'गाउँपालिका अध्यक्ष',
    attendees: 15, quorum: 13, agendaCount: 2,
    decisions: [
      { id: 'd14', title: 'बाढी प्रभावित वडा ३, ४ मा तत्काल राहत रकम रू. ३ लाख निकासा', status: 'implemented', responsibleDept: 'विपद् व्यवस्थापन' },
      { id: 'd15', title: 'विपद् पूर्वतयारी बजेटबाट थप रकम माग पत्र प्रदेश सरकारमा पठाउने', status: 'implemented', responsibleDept: 'विपद् शाखा' },
    ],
  },
];

export const MeetingDecisionPage: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  const [isEditing, setIsEditing] = useState(false);
  const [meetings, setMeetings] = useState(MEETINGS);

  const [searchQuery, setSearchQuery]     = useState('');
  const [activeType, setActiveType]       = useState<MeetingType | 'all'>('all');
  const [expandedId, setExpandedId]       = useState<string | null>('mtg-001');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return meetings.filter((m) => {
      const matchType   = activeType === 'all' || m.type === activeType;
      const matchSearch = !q || m.session.toLowerCase().includes(q) ||
        m.decisions.some((d) => d.title.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [searchQuery, activeType, meetings]);

  const allDecisions = meetings.flatMap((m) => m.decisions);
  const decisionStats = {
    total:       allDecisions.length,
    implemented: allDecisions.filter((d) => d.status === 'implemented').length,
    in_progress: allDecisions.filter((d) => d.status === 'in_progress').length,
    pending:     allDecisions.filter((d) => d.status === 'pending').length,
  };

  // CRUD Functions
  const handleAddDecision = (meetingId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const newDecision: Decision = {
          id: `new-${Date.now()}`,
          title: '',
          status: 'pending',
          responsibleDept: '',
          deadline: '',
        };
        return { ...m, decisions: [...m.decisions, newDecision] };
      }
      return m;
    }));
  };

  const handleEditDecision = (meetingId: string, decisionId: string, field: string, value: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          decisions: m.decisions.map(d => d.id === decisionId ? { ...d, [field]: value } : d)
        };
      }
      return m;
    }));
  };

  const handleDeleteDecision = (meetingId: string, decisionId: string) => {
    if(!window.confirm("के तपाईं यो निर्णय मेटाउन निश्चित हुनुहुन्छ?")) return;
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return { ...m, decisions: m.decisions.filter(d => d.id !== decisionId) };
      }
      return m;
    }));
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '0.82rem',
    border: '1.5px solid #CBD5E1',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    color: '#0F172A',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Noto Sans Devanagari','Outfit','Inter',sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Gavel size={22} color="#047857" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              बैठक तथा निर्णय प्रणाली
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
              गाउँसभा, कार्यपालिका र समितिका बैठकहरूको आधिकारिक निर्णय अभिलेख
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setIsEditing(!isEditing)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: isEditing ? '#DC2626' : '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isEditing ? <><Save size={14} /> सुरक्षित गर्नुहोस्</> : <><Edit2 size={14} /> सम्पादन गर्नुहोस्</>}
            </button>
          )}
        </div>

        {/* Decision KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginTop: '18px' }}>
          {[
            { label: 'जम्मा निर्णय', value: decisionStats.total,       color: '#0F4C81', bg: '#EBF3FA', icon: <FileText size={18} color="#0F4C81" /> },
            { label: 'कार्यान्वयन भयो', value: decisionStats.implemented, color: '#047857', bg: '#ECFDF5', icon: <CheckCircle2 size={18} color="#047857" /> },
            { label: 'प्रक्रियामा',    value: decisionStats.in_progress, color: '#1D4ED8', bg: '#EFF6FF', icon: <Clock size={18} color="#1D4ED8" /> },
            { label: 'बाँकी छ',        value: decisionStats.pending,     color: '#B45309', bg: '#FFFBEB', icon: <AlertCircle size={18} color="#B45309" /> },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + Filter ──────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="बैठक वा निर्णय खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px', border: '1.5px solid #E2E8F0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{filtered.length} बैठक भेटियो</span>
        </div>
        {/* Type Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {([['all', 'सबै', '#64748B', '#F1F5F9']] as [string,string,string,string][])
            .concat(Object.entries(MEETING_TYPE_CONFIG).map(([k,v]) => [k,v.label,v.color,v.bg] as [string,string,string,string]))
            .map(([k, label, color, bg]) => (
              <button
                key={k}
                onClick={() => setActiveType(k as any)}
                style={{
                  padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', border: '1.5px solid transparent',
                  background: activeType === k ? color : bg,
                  color:      activeType === k ? '#fff' : color,
                  borderColor: activeType === k ? color : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      {/* ── Meeting List ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((meeting) => {
          const typeConf = MEETING_TYPE_CONFIG[meeting.type];
          const isOpen = expandedId === meeting.id;
          const implementedCount = meeting.decisions.filter(d => d.status === 'implemented').length;

          return (
            <div
              key={meeting.id}
              style={{
                background: '#fff',
                border: '1.5px solid ' + (isOpen ? '#BCD5EB' : '#E2E8F0'),
                borderRadius: '14px', overflow: 'hidden',
                boxShadow: isOpen ? '0 4px 16px rgba(15,76,129,0.08)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Meeting Row Header */}
              <button
                onClick={() => setExpandedId(isOpen ? null : meeting.id)}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'inherit' }}
              >
                {/* Type Icon */}
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: typeConf.bg, color: typeConf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {typeConf.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{meeting.session}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.72rem', color: '#64748B', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} /> {meeting.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={11} /> {meeting.attendees} सहभागी</span>
                    <span style={{ padding: '2px 7px', borderRadius: '9999px', background: typeConf.bg, color: typeConf.color, fontWeight: 700 }}>{typeConf.label}</span>
                    <span style={{ padding: '2px 7px', borderRadius: '9999px', background: '#ECFDF5', color: '#047857', fontWeight: 700 }}>
                      {implementedCount}/{meeting.decisions.length} निर्णय कार्यान्वयन
                    </span>
                  </div>
                </div>

                <div style={{ color: '#64748B', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                  <ChevronRight size={18} />
                </div>
              </button>

              {/* Expanded Detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  {/* Meeting Info Grid */}
                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px', borderBottom: '1px solid #E2E8F0' }}>
                    {[
                      { label: 'अध्यक्षता', value: meeting.chairperson },
                      { label: 'स्थान',      value: meeting.venue },
                      { label: 'सहभागी/कोरम', value: `${meeting.attendees}/${meeting.quorum}` },
                      { label: 'एजेन्डा संख्या', value: `${meeting.agendaCount} वटा` },
                    ].map((info) => (
                      <div key={info.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>{info.label}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{info.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Decisions */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Gavel size={15} color="#047857" /> निर्णयहरू ({meeting.decisions.length} वटा)
                      </span>
                      {isEditing && (
                        <button onClick={() => handleAddDecision(meeting.id)} style={{ padding: '6px 12px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(15,76,129,0.2)' }}>
                          <Plus size={14} /> नयाँ निर्णय
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {meeting.decisions.map((d, idx) => {
                        const dSt = DECISION_STATUS[d.status];
                        return (
                          <div key={d.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: isEditing ? 'inset 2px 0 0 #0F4C81' : 'none' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginTop: isEditing ? '10px' : '0' }}>{idx + 1}.</span>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={d.title}
                                  placeholder="निर्णयको शीर्षक राख्नुहोस्..."
                                  onChange={(e) => handleEditDecision(meeting.id, d.id, 'title', e.target.value)}
                                  style={{ ...inputStyle, fontWeight: 700, fontSize: '0.88rem' }}
                                />
                              ) : (
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{d.title}</div>
                              )}
                              
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {isEditing ? (
                                  <>
                                    <select
                                      value={d.status}
                                      onChange={(e) => handleEditDecision(meeting.id, d.id, 'status', e.target.value)}
                                      style={{ ...inputStyle, width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      {Object.entries(DECISION_STATUS).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      value={d.responsibleDept}
                                      placeholder="जिम्मेवार शाखा"
                                      onChange={(e) => handleEditDecision(meeting.id, d.id, 'responsibleDept', e.target.value)}
                                      style={{ ...inputStyle, width: '140px', padding: '4px 8px', fontSize: '0.75rem' }}
                                    />
                                    <input
                                      type="text"
                                      value={d.deadline || ''}
                                      placeholder="म्याद (उदा: २०८२ चैत्र)"
                                      onChange={(e) => handleEditDecision(meeting.id, d.id, 'deadline', e.target.value)}
                                      style={{ ...inputStyle, width: '120px', padding: '4px 8px', fontSize: '0.75rem' }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: dSt.bg, color: dSt.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      {dSt.icon} {dSt.label}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Users size={12} /> {d.responsibleDept}
                                    </span>
                                    {d.deadline && (
                                      <span style={{ fontSize: '0.7rem', color: '#B45309', background: '#FFFBEB', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> म्याद: {d.deadline}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {isEditing && (
                              <button onClick={() => handleDeleteDecision(meeting.id, d.id)} style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="हटाउनुहोस्">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.print()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600, background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <Download size={14} /> बैठक कार्यसूची PDF
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600, background: '#047857', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <FileText size={14} /> कार्यविवरण (Minutes)
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '20px', padding: '14px 18px', background: '#EBF3FA', border: '1px solid #BCD5EB', borderRadius: '10px', fontSize: '0.75rem', color: '#0F4C81', display: 'flex', gap: '8px' }}>
        <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span><strong>नोट:</strong> यहाँ सूचीकृत निर्णयहरू गाउँपालिकाको आधिकारिक बैठक कार्यविवरण (Minutes) मा आधारित छन्। PDF डाउनलोड सुविधा शीघ्र उपलब्ध हुनेछ।</span>
      </div>
    </div>
  );
};

export default MeetingDecisionPage;
