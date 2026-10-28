import React, { useState, useEffect, useMemo } from 'react';
import {
  Gavel,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Eye,
  Award,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useFiscalYear } from '../../context/FiscalYearContext';

interface SocialAuditRecord {
  id: string;
  projectName: string; // आयोजनाको नाम
  ward: number; // वडा
  budgetNpr: number; // सम्झौता बजेट (रू.)
  actualExpenditureNpr: number; // वास्तविक खर्च (रू.)
  completionDateBs: string; // सम्पन्न मिति
  auditDateBs: string; // सामाजिक परीक्षण मिति
  citizenAttendees: number; // उपस्थित नागरिक संख्या
  facilitator: string; // सहजकर्ता (नागरिक समाज/प्राविधिक)
  findingsSummary: string; // सामाजिक परीक्षणका मुख्य निष्कर्ष
  satisfactionStatus: 'उत्कृष्ट' | 'सन्तोषजनक' | 'कैफियत सम्बोधन गर्नुपर्ने';
}

const INITIAL_AUDITS: SocialAuditRecord[] = [
  {
    id: 'sa-1',
    projectName: 'मानेखर्क एकीकृत लिफ्टिङ खानेपानी आयोजना',
    ward: 3,
    budgetNpr: 4500000,
    actualExpenditureNpr: 4480000,
    completionDateBs: '२०८१-०४-२५',
    auditDateBs: '२०८१-०५-१०',
    citizenAttendees: 145,
    facilitator: 'स्थानीय नागरिक सरोकार मञ्च',
    findingsSummary: 'सबै उपभोक्ता धारामा पानी पुगेको, हिसाबकिताब पारदर्शी रूपमा सार्वजनिक गरिएको।',
    satisfactionStatus: 'उत्कृष्ट',
  },
  {
    id: 'sa-2',
    projectName: 'गुन्सा सिम्ले कृषि सडक स्तरोन्नति तथा ग्राभेलिङ',
    ward: 2,
    budgetNpr: 2800000,
    actualExpenditureNpr: 2795000,
    completionDateBs: '२०८१-०३-१५',
    auditDateBs: '२०८१-०४-०२',
    citizenAttendees: 88,
    facilitator: 'गाउँ अनुगमन समिति प्रतिनिधि',
    findingsSummary: 'नाली निर्माणमा केही सुधार गर्नुपर्ने सुझावसहित आयोजना सार्वजनिक परीक्षण पारित।',
    satisfactionStatus: 'सन्तोषजनक',
  },
  {
    id: 'sa-3',
    projectName: 'थाङपालधाप सामुदायिक स्वास्थ्य इकाई भवन निर्माण',
    ward: 1,
    budgetNpr: 6000000,
    actualExpenditureNpr: 5950000,
    completionDateBs: '२०८०-१२-२०',
    auditDateBs: '२०८१-०१-१२',
    citizenAttendees: 195,
    facilitator: 'सुशासन तथा विकास समाज',
    findingsSummary: 'गुणस्तर स्ट्यान्डर्ड अनुसार रहेको, अपाङ्गतामैत्री र्‍याम्प थप गर्न सिफारिस।',
    satisfactionStatus: 'उत्कृष्ट',
  },
];

interface PublicHearingItem {
  id: string;
  hearingTitle: string;
  quarter: 'प्रथम चौमासिक' | 'दोस्रो चौमासिक' | 'तेस्रो चौमासिक' | 'वार्षिक';
  dateBs: string;
  venue: string;
  attendeeCount: number;
  citizensIssuesRaised: string[];
  palikaCommitments: string[];
}

const INITIAL_HEARINGS: PublicHearingItem[] = [
  {
    id: 'ph-1',
    hearingTitle: 'आ.व. २०८०/०८१ को वार्षिक सार्वजनिक सुनुवाइ कार्यक्रम',
    quarter: 'वार्षिक',
    dateBs: '२०८१-०५-१५',
    venue: 'गाउँ कार्यपालिका प्राङ्गण, थाङपालधाप',
    attendeeCount: 320,
    citizensIssuesRaised: [
      'वर्षायाममा सडक अवरुद्ध हुँदा वैकल्पिक रूटको व्यवस्था गर्नुपर्ने',
      'कृषकहरूलाई रासायनिक मल तथा अनुदान वितरण समयमै हुनुपर्ने',
      'स्वास्थ्य चौकीहरूमा २४ घण्टे प्रसूति सेवा नियमित हुनुपर्ने',
    ],
    palikaCommitments: [
      'वडापिच्छे डोजर परिचालन गरी तत्काल सडक खुलाउन बजेट व्यवस्था',
      'सहकारीमार्फत मल वितरण प्रणाली पारदर्शी बनाइने',
      'अस्पताल तथा बर्थिङ सेन्टरमा नर्सिङ जनशक्ति थप गरिएको',
    ],
  },
];

export interface SocialAuditPageProps {
  isPublic?: boolean;
}

export const SocialAuditPage: React.FC<SocialAuditPageProps> = ({ isPublic: propIsPublic }) => {
  const location = useLocation();
  const isPublic = propIsPublic !== undefined ? propIsPublic : !location.pathname.startsWith('/app');
  const { tenantId, settings } = useTenant();
  const { activeFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<'audit' | 'hearings' | 'rti' | 'monitoring'>('audit');
  const [audits, setAudits] = useState<SocialAuditRecord[]>(() => {
    const saved = localStorage.getItem(`social_audits_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });
  const [hearings, setHearings] = useState<PublicHearingItem[]>(() => {
    const saved = localStorage.getItem(`public_hearings_${tenantId}`);
    return saved ? JSON.parse(saved) : INITIAL_HEARINGS;
  });

  const [isAddAuditModalOpen, setIsAddAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({
    projectName: '',
    ward: '1',
    budgetNpr: '1000000',
    attendees: '50',
    facilitator: '',
    findings: '',
  });

  useEffect(() => {
    localStorage.setItem(`social_audits_${tenantId}`, JSON.stringify(audits));
  }, [audits, tenantId]);

  useEffect(() => {
    localStorage.setItem(`public_hearings_${tenantId}`, JSON.stringify(hearings));
  }, [hearings, tenantId]);

  const handleAddAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.projectName) return;

    const newAudit: SocialAuditRecord = {
      id: `sa-${Date.now()}`,
      projectName: auditForm.projectName,
      ward: Number(auditForm.ward),
      budgetNpr: Number(auditForm.budgetNpr) || 1000000,
      actualExpenditureNpr: Number(auditForm.budgetNpr) || 1000000,
      completionDateBs: '२०८१-०५-०१',
      auditDateBs: '२०८१-०५-२०',
      citizenAttendees: Number(auditForm.attendees) || 50,
      facilitator: auditForm.facilitator || 'स्थानीय नागरिक मञ्च',
      findingsSummary: auditForm.findings || 'आयोजनाको वित्तीय तथा भौतिक प्रगति सार्वजनिक गरियो।',
      satisfactionStatus: 'उत्कृष्ट',
    };

    setAudits([newAudit, ...audits]);
    setIsAddAuditModalOpen(false);
  };

  // KPIs
  const totalAudits = audits.length;
  const totalCitizensAttended = audits.reduce((acc, a) => acc + a.citizenAttendees, 0);
  const totalHearingCount = hearings.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          borderRadius: '18px',
          padding: '1.75rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(30, 58, 138, 0.22)',
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
            <Gavel size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                सुशासन, सामाजिक परीक्षण तथा सार्वजनिक सुनुवाइ
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
                सुशासन ऐन २०६४ तथा पारदर्शिता
              </span>
            </div>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              {settings?.palika_name || 'गाउँ/नगर कार्यपालिका'} — योजनागत सामाजिक परीक्षण (Social Audit), त्रैमासिक सार्वजनिक सुनुवाइ तथा नागरिक सन्तुष्टि
            </p>
          </div>
        </div>

        {!isPublic ? (
          <button
            onClick={() => setIsAddAuditModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#1e3a8a',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            <Plus size={18} />
            <span>नयाँ सामाजिक परीक्षण दर्ता</span>
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
            <ShieldCheck size={16} />
            <span>सुशासन तथा सार्वजनिक सुनुवाइ खुला पोर्टल</span>
          </div>
        )}
      </div>

      {/* ── KPI METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #1e3a8a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>सम्पन्न सामाजिक परीक्षण (योजना)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{totalAudits} वटा</div>
          <div style={{ fontSize: '0.75rem', color: '#1e3a8a', marginTop: '2px', fontWeight: 600 }}>
            आयोजना सम्पन्नता पश्चात अनिवार्य परीक्षण
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>नागरिक सन्तुष्टि सूचक</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>९१.४%</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            नागरिक सन्तुष्टि सर्वेक्षण तथा पृष्ठपोषण
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>सार्वजनिक सुनुवाइ कार्यक्रम</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#6d28d9', marginTop: '4px' }}>{totalHearingCount} पटक</div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '2px', fontWeight: 600 }}>
            प्रत्यक्ष जनसहभागिता तथा प्रतिबद्धता
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>कुल नागरिक सहभागिता संख्या</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{totalCitizensAttended} जना</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
            महिला तथा सीमान्तकृत समुदायसहित
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {[
          { key: 'audit', label: 'आयोजनागत सामाजिक परीक्षण (Social Audit)', icon: <FileText size={16} /> },
          { key: 'hearings', label: 'सार्वजनिक सुनुवाइ तथा प्रतिबद्धता', icon: <Users size={16} /> },
          { key: 'rti', label: 'सूचनाको हक (RTI) तथा नागरिक बडापत्र', icon: <ShieldCheck size={16} /> },
          { key: 'monitoring', label: 'अनुगमन तथा सुपरिवेक्षण समिति निर्णय', icon: <Gavel size={16} /> },
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
              color: activeTab === t.key ? '#1e3a8a' : '#64748b',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === t.key ? '3px solid #1e3a8a' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: SOCIAL AUDITS TABLE ── */}
      {activeTab === 'audit' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>आयोजनाको नाम</th>
                <th style={{ padding: '10px 12px' }}>वडा</th>
                <th style={{ padding: '10px 12px' }}>सम्झौता बजेट (रू.)</th>
                <th style={{ padding: '10px 12px' }}>सम्पन्न मिति</th>
                <th style={{ padding: '10px 12px' }}>परीक्षण मिति</th>
                <th style={{ padding: '10px 12px' }}>उपस्थित नागरिक</th>
                <th style={{ padding: '10px 12px' }}>सहजकर्ता</th>
                <th style={{ padding: '10px 12px' }}>निष्कर्ष</th>
                <th style={{ padding: '10px 12px' }}>स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{a.projectName}</td>
                  <td style={{ padding: '12px' }}>वडा {a.ward}</td>
                  <td style={{ padding: '12px', fontWeight: 700 }}>रू. {a.budgetNpr.toLocaleString()}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{a.completionDateBs}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{a.auditDateBs}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#1e3a8a' }}>{a.citizenAttendees} जना</td>
                  <td style={{ padding: '12px', color: '#475569' }}>{a.facilitator}</td>
                  <td style={{ padding: '12px', maxWidth: '220px', color: '#334155' }}>{a.findingsSummary}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      ● {a.satisfactionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: PUBLIC HEARINGS ── */}
      {activeTab === 'hearings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {hearings.map((h) => (
            <div key={h.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{h.hearingTitle}</h4>
                <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>
                  {h.quarter} | मिति: {h.dateBs}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                स्थान: <strong>{h.venue}</strong> | कुल जनसहभागिता: <strong>{h.attendeeCount} जना</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '1rem', border: '1px solid #fecaca' }}>
                  <h5 style={{ margin: '0 0 8px', color: '#991b1b', fontWeight: 800, fontSize: '0.88rem' }}>
                    नागरिकहरूले उठाएका प्रमुख सवाल तथा गुनासोहरू:
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                    {h.citizensIssuesRaised.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #bbf7d0' }}>
                  <h5 style={{ margin: '0 0 8px', color: '#166534', fontWeight: 800, fontSize: '0.88rem' }}>
                    गाउँ/नगर कार्यपालिकाका तर्फबाट गरिएका प्रतिबद्धताहरू:
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6 }}>
                    {h.palikaCommitments.map((com, idx) => (
                      <li key={idx}>{com}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: RTI & CITIZEN CHARTER ── */}
      {activeTab === 'rti' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800 }}>सूचनाको हक (RTI) ३ महिने स्वतः प्रकाशन</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>नियमित प्रकाशित</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ५ (३) बमोजिम प्रत्येक ३/३ महिनामा सम्पादित मुख्य काम तथा बजेट खर्च विवरण वेबसाइट तथा सूचना पाटीमा स्वतः सार्वजनिक।
            </p>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800 }}>तोकिएको सूचना अधिकारी (RTI Officer)</h4>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>प्रमुख प्रशासकीय अधिकृत / सूचना अधिकारी</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
              नागरिकले माग गरेका सार्वजनिक सूचना १५ दिनभित्र अनिवार्य रूपमा उपलब्ध गराउने व्यवस्था।
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 4: MONITORING COMMITTEE ── */}
      {activeTab === 'monitoring' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800 }}>उपप्रमुख/उपाध्यक्ष संयोजकत्वको योजना अनुगमन समिति</h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            स्थानीय सरकार सञ्चालन ऐन, २०७४ को दफा १६ (४) बमोजिम गाउँ/नगरपालिकाका सबै विकास योजनाहरूको स्थलगत प्राविधिक तथा गुणस्तर अनुगमन गरी अन्तिम भुक्तानीका लागि सिफारिस गर्ने कार्य यस समितिबाट निरन्तर भइरहेको छ।
          </p>
        </div>
      )}

      {/* ── ADD AUDIT MODAL ── */}
      {isAddAuditModalOpen && (
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
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>नयाँ योजनागत सामाजिक परीक्षण दर्ता</h3>
            <form onSubmit={handleAddAudit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>योजनाको नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मानेखर्क लिफ्टिङ खानेपानी"
                  value={auditForm.projectName}
                  onChange={(e) => setAuditForm({ ...auditForm, projectName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>वडा नं.</label>
                  <select
                    value={auditForm.ward}
                    onChange={(e) => setAuditForm({ ...auditForm, ward: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>सम्झौता बजेट (रू.)</label>
                  <input
                    type="number"
                    value={auditForm.budgetNpr}
                    onChange={(e) => setAuditForm({ ...auditForm, budgetNpr: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>उपस्थित नागरिक संख्या</label>
                  <input
                    type="number"
                    value={auditForm.attendees}
                    onChange={(e) => setAuditForm({ ...auditForm, attendees: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>सहजकर्ता संस्था/व्यक्ति</label>
                  <input
                    type="text"
                    placeholder="उदा. स्थानीय नागरिक मञ्च"
                    value={auditForm.facilitator}
                    onChange={(e) => setAuditForm({ ...auditForm, facilitator: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>सामाजिक परीक्षणका मुख्य निष्कर्ष</label>
                <textarea
                  rows={2}
                  placeholder="नागरिकहरूको प्रतिक्रिया, गुणस्तर तथा हिसाबकिताब निष्कर्ष..."
                  value={auditForm.findings}
                  onChange={(e) => setAuditForm({ ...auditForm, findings: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddAuditModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
