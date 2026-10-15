import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  Download,
  ExternalLink,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import type { TransparencyOverview } from '../../../types/open-data';

export const PublicTransparencyView: React.FC = () => {
  const { data: overview, isLoading } = useQuery<TransparencyOverview>({
    queryKey: ['transparency-overview'],
    queryFn: () => sectoralApi.getTransparencyOverview() as Promise<TransparencyOverview>,
  });

  const rti20Points = [
    { no: 1, title: 'पालिकाको स्वरूप र प्रकृति', status: 'सार्वजनिक' },
    { no: 2, title: 'काम, कर्तव्य र अधिकार', status: 'सार्वजनिक' },
    { no: 3, title: 'कर्मचारी संख्या र कार्य विवरण', status: 'सार्वजनिक' },
    { no: 4, title: 'प्रदान गरिने सेवाको प्रकार', status: 'सार्वजनिक' },
    { no: 5, title: 'सेवा प्रदान गर्ने शाखा र अधिकारी', status: 'सार्वजनिक' },
    { no: 6, title: 'सेवा प्राप्त गर्न लाग्ने दस्तुर र समय', status: 'सार्वजनिक' },
    { no: 7, title: 'निर्णय गर्ने कार्यविधि र आधार', status: 'सार्वजनिक' },
    { no: 8, title: 'निर्णय उपर उजुरी सुन्ने अधिकारी', status: 'सार्वजनिक' },
    { no: 9, title: 'सम्पादन गरेको कामको विवरण', status: 'सार्वजनिक' },
    { no: 10, title: 'सूचना अधिकारीको नाम र पद', status: 'सार्वजनिक' },
    { no: 11, title: 'स्वीकृत बजेट र खर्चको विवरण', status: 'सार्वजनिक' },
    { no: 12, title: 'विकास आयोजना तथा कार्यक्रम स्थिति', status: 'सार्वजनिक' },
    { no: 13, title: 'अनुदान तथा आर्थिक सहायता विवरण', status: 'सार्वजनिक' },
    { no: 14, title: 'सार्वजनिक खरिद तथा ठेक्का सम्झौता', status: 'सार्वजनिक' },
    { no: 15, title: 'वार्षिक लेखापरीक्षण र बेरुजु स्थिति', status: 'सार्वजनिक' },
    { no: 16, title: 'नागरिक बडापत्र तथा गुनासो व्यवस्थापन', status: 'सार्वजनिक' },
    { no: 17, title: 'अघिल्लो त्रैमासिकमा माग गरिएका सूचना', status: 'सार्वजनिक' },
    { no: 18, title: 'सूचनाको वर्गीकरण तथा अभिलेख सूची', status: 'सार्वजनिक' },
    { no: 19, title: 'गाउँसभा तथा कार्यपालिका निर्णयहरू', status: 'सार्वजनिक' },
    { no: 20, title: 'अन्य तोकिएका सार्वजनिक महत्वका सूचना', status: 'सार्वजनिक' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Transparency Score Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} />
            <span>सार्वजनिक पारदर्शिता तथा सुशासन सूचकाङ्क (Municipal Transparency Index)</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
            पाँचपोखरी थाङपाल गाउँपालिका पारदर्शिता स्थिति
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            सूचनाको हक सम्बन्धी ऐन २०६४, स्थानीय सरकार सञ्चालन ऐन २०७४ तथा सुशासन ऐन २०६४ बमोजिम पालिकाका सम्पूर्ण निर्णय, बजेट, खरिद, सामाजिक परीक्षण तथा सार्वजनिक सुनुवाइ शतप्रतिशत पारदर्शी रूपमा सार्वजनिक गरिएको छ।
          </p>
        </div>

        {/* Score Ring / Pill */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '1.25rem 2rem',
            textAlign: 'center',
            minWidth: '180px',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>समग्र पारदर्शिता अङ्क</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#4ade80', margin: '0.2rem 0' }}>
            {overview?.transparency_score ?? 88.5}
            <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/१००</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
            आ.व. {overview?.fiscal_year ?? '२०८१/०८२'}
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {/* Pillar 1: Proactive RTI */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <FileText size={18} />
            <span>सूचनाको हक स्वतः प्रकाशन</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            २० बुँदे सूची सार्वजनिक
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            प्रत्येक ३/३ महिनामा ऐनको दफा ५ बमोजिम २० प्रकारका अनिवार्य सार्वजनिक सूचनाहरू स्वतः प्रकाशन सम्पन्न।
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>पछिल्लो अद्यावधिक: २०८१-०४-१५</span>
          </div>
        </div>

        {/* Pillar 2: Public Hearings & Social Audits */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <Users size={18} />
            <span>सार्वजनिक सुनुवाइ तथा परीक्षण</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            ८ वटै वडामा सामाजिक परीक्षण सम्पन्न
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            १,४२० जना नागरिक तथा सरोकारवालाहरूको प्रत्यक्ष सहभागितामा सम्पन्न सार्वजनिक सुनुवाइ।
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>प्रतिवेदन कार्यपालिकाबाट स्वीकृत</span>
          </div>
        </div>

        {/* Pillar 3: Citizen Charter SLA */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <Clock size={18} />
            <span>नागरिक बडापत्र सेवा मानक</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            औसत २.५ घण्टामा सिफारिस
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            ४०+ प्रकारका डिजिटल सिफारिसहरू ९४.२% तोकिएको समयसीमा भित्रै सफल फछ्र्यौट।
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>डिजिटल हस्ताक्षरसहित प्रमाणीकरण</span>
          </div>
        </div>

        {/* Pillar 4: Financial & Audit Discipline */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={18} />
            <span>वित्तीय सुशासन र बेरुजु</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            ८८.५% बेरुजु फछ्र्यौट दर
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            सार्वजनिक खरिदमा शतप्रतिशत ई-बिडिङ (e-GP) प्रणाली लागू गरी खुला प्रतिस्पर्धा सुनिश्चित।
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} />
            <span>महालेखा परीक्षक प्रतिवेदन सार्वजनिक</span>
          </div>
        </div>
      </div>

      {/* RTI 20-Point Proactive Disclosure Table & Information Officer */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Table */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              सूचनाको हक ऐन २०६४ बमोजिम २० बुँदे स्वतः प्रकाशन स्थिति
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
              २०/२० पूर्ण
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
            {rti20Points.map((item) => (
              <div
                key={item.no}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#0284c7', fontWeight: 800, width: '18px' }}>{item.no}.</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{item.title}</span>
                </div>
                <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <CheckCircle2 size={13} />
                  <span>{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RTI Officer Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            className="dt-card"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              <UserCheck size={18} />
              <span>सूचना अधिकारी (Information Officer)</span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
              सन्तोष लम्साल
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.85rem' }}>
              अधिकृत छैटौं / सूचना अधिकारी
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="#0284c7" />
                <span>फोन: ०११-६६०१२३ / ९८५१२४००००</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#0284c7" />
                <span>इमेल: info@panchpokharimun.gov.np</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #bae6fd', fontSize: '0.75rem', color: '#64748b' }}>
              सूचना माग दर्ता भएको ७ देखि १५ दिनभित्र अनिवार्य रूपमा सूचना उपलब्ध गराइनेछ।
            </div>
          </div>

          <div
            className="dt-card"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              backgroundColor: '#fdf4ff',
              border: '1px solid #f0abfc',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a21caf', marginBottom: '0.35rem' }}>
              सार्वजनिक सुनुवाइ तथा सुझाव पेटिका
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              प्रत्येक वडा कार्यालय तथा गाउँपालिका केन्द्र तिपेनीमा नागरिक सहायता कक्ष तथा सार्वजनिक सुझाव पेटिका राखिएको छ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
