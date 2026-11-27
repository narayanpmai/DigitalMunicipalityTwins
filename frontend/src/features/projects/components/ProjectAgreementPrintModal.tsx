import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import type { Project } from '../../../types/sectoral';
import { municipalityApi } from '../../../api/municipality';
import { branchesApi } from '../../../api/branches';
import { useTenant } from '../../../context/TenantContext';

export interface ProjectAgreementPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const toNepaliNum = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '—';
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

const formatNpr = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '०.००';
  return toNepaliNum(
    Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const ProjectAgreementPrintModal: React.FC<ProjectAgreementPrintModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const { data: palikaProfile } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
    staleTime: 60000,
    enabled: isOpen,
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['branches-list'],
    queryFn: () => branchesApi.getAll('palika'),
    staleTime: 60000,
    enabled: isOpen,
  });

  if (!isOpen || !project) return null;

  const chiefOfficerName =
    project.signatories?.approverName ||
    palikaProfile?.leadership?.chiefOfficer?.name ||
    'लक्ष्मण कुईकेल (प्रमुख प्रशासकीय अधिकृत)';
  const chiefOfficerDesig =
    project.signatories?.approverDesignation || 'प्रमुख प्रशासकीय अधिकृत';

  const infraBranch = branches.find((b) => b.code === 'INF' || String(b.name || '').includes('पूर्वाधार'));
  const engineerName =
    project.signatories?.technicalRecommenderName ||
    project.responsibleEngineer ||
    infraBranch?.headEmployeeName ||
    'योजना तथा पूर्वाधार विकास शाखा';
  const engineerDesig =
    project.signatories?.technicalRecommenderDesignation || 'सब-इन्जिनियर / प्राविधिक';

  const handlePrint = () => {
    window.print();
  };

  const totalOffice = Number(project.officeCost !== undefined ? project.officeCost : project.allocatedBudget || project.budget || 0);
  const totalCommittee = Number(project.committeeCost || 0);
  const laborContribution = Number(project.laborContribution || 0);
  const totalGrant = Number(project.palikaGrant || totalOffice);
  const contingencyAmt = Number(project.contingencyAmount || Math.round((totalOffice * (project.contingencyRatePercent || 3)) / 100));
  const totalEstimate = Number(project.technicalEstimateAmount || totalOffice + totalCommittee + laborContribution);

  const schedule = project.installmentDetails?.schedule || [
    { phase: 'पहिलो किस्ता', dateBs: project.startDateBs || 'सम्झौता पश्चात', amount: Math.round(totalOffice * 0.4), materialsQty: '४०% पेश्की किस्ता', remarks: 'सम्झौता स्वीकृत पश्चात' },
    { phase: 'दोस्रो किस्ता', dateBs: '', amount: Math.round(totalOffice * 0.4), materialsQty: '४०% दोस्रो किस्ता', remarks: '५०% भौतिक प्रगति पछि' },
    { phase: 'तेस्रो किस्ता', dateBs: project.completionDateBs || '', amount: totalOffice - Math.round(totalOffice * 0.4) * 2, materialsQty: '२०% अन्तिम किस्ता', remarks: 'नापी किताब र सामाजिक परीक्षण पछि' },
  ];

  return (
    <div
      className="agreement-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar (Screen only) */}
        <div
          className="d-print-none"
          style={{
            padding: '0.85rem 1.35rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <FileText size={18} color="#38bdf8" />
            <span>औपचारिक योजना सम्झौता पत्र (Formal Agreement Deed) — प्रिन्ट पूर्वावलोकन</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Printer size={16} />
              <span>सम्झौता पत्र प्रिन्ट गर्नुहोस् (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 format) */}
        <div
          className="printable-sheet"
          style={{
            padding: '2.5rem 3.25rem',
            overflowY: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            color: '#0f172a',
            backgroundColor: '#ffffff',
            fontFamily: 'Noto Sans Devanagari, Outfit, sans-serif',
          }}
        >
          {/* Municipal Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px double #0f172a', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ width: '65px', textAlign: 'left' }}>
                <img
                  src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                  alt="नेपाल सरकार निशान छाप"
                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                />
              </div>

              <div style={{ flex: 1, padding: '0 1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
                  स्थानीय सरकार सञ्चालन ऐन, २०७४ बमोजिम
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#991b1b', margin: '0.15rem 0' }}>
                  {tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  {tenantSettings?.office_title || 'गाउँ कार्यपालिकाको कार्यालय'}
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>
                  {tenantSettings?.headquarters || 'थाङपालधाप, सिन्धुपाल्चोक'}, {tenantSettings?.province || 'बागमती प्रदेश'}, नेपाल
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginTop: '0.2rem' }}>
                  योजना, पूर्वाधार विकास तथा अनुगमन शाखा
                </div>
              </div>

              <div style={{ width: '65px', textAlign: 'right' }}>
                <img
                  src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                  alt="Palika Logo"
                  style={{ width: '55px', height: '55px', objectFit: 'contain' }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.35rem 2rem',
                borderRadius: '4px',
                backgroundColor: '#f1f5f9',
                border: '1.5px solid #0f172a',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.5px',
              }}
            >
              योजना सम्झौता पत्र (Formal Agreement Deed)
            </div>
          </div>

          {/* Reference Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            <div>
              <span><strong>आ.व.:</strong> {toNepaliNum(project.fiscalYear || '२०८१/०८२')}</span>
              <span style={{ marginLeft: '1rem' }}><strong>बजेट उप-शीर्षक नं.:</strong> {toNepaliNum(project.budgetSubHead || '—')}</span>
              {project.chalaniNo && <span style={{ marginLeft: '1rem' }}><strong>च.नं./निर्णय:</strong> {toNepaliNum(project.chalaniNo)}</span>}
            </div>
            <div>
              <span><strong>सम्झौता मिति:</strong> वि.सं. {toNepaliNum(project.agreementDateBs || project.startDateBs || 'मिति उपलब्ध छैन')}</span>
            </div>
          </div>

          {/* Preamble */}
          <p style={{ textIndent: '2rem', textAlign: 'justify', marginBottom: '1rem' }}>
            यस पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय (प्रथम पक्ष) र <strong>{project.committeeName || `${project.name} उपभोक्ता समिति`}</strong> (दोस्रो पक्ष) बीच स्वीकृत वार्षिक कार्यक्रम अनुसार वडा नं. <strong>{toNepaliNum(project.wardNumber || 'सबै')}</strong> मा देहाय बमोजिमको विकास निर्माण कार्य स्थानीय सरकार सञ्चालन ऐन, २०७४ तथा उपभोक्ता समिति गठन, परिचालन र व्यवस्थापन कार्यविधि अनुसार सम्पन्न गर्न तपसिलका सर्तहरूमा मञ्जुर भई यो सम्झौता पत्रमा हस्ताक्षर गरिएको छ।
          </p>

          {/* Section 1: Project Core Details Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: '#0369a1' }}>
              १. आयोजना तथा सम्झौताको मुख्य विवरण:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', fontSize: '0.85rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, width: '28%', backgroundColor: '#f8fafc' }}>आयोजनाको नाम</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{project.name}</td>
                </tr>
                {project.subProjectName && (
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>सह-आयोजनाको नाम</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.subProjectName}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>बजेट स्रोत</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.budgetSource || 'संघीय सरकार वित्तीय समानीकरण अनुदान'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>स्तर र आयोजना स्थल</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                    {project.level || 'नगर स्तरिय'} (वडा नं. {toNepaliNum(project.wardNumber || 'सबै')}) — <strong>{project.location || 'पाँचपोखरी थाङपाल गाउँपालिका'}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>कार्यान्वयन को मार्फत</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.marfat || 'उपभोक्ता समिति'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>कार्य क्षेत्र / उद्देश्य</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                    {project.sector || 'पूर्वाधार विकास'}{project.objective ? ` — ${project.objective}` : ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>आयोजना सुरु र सम्पन्न मिति</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                    सुरु मिति: <strong>वि.सं. {toNepaliNum(project.startDateBs || '—')}</strong> | सम्पन्न हुने मिति: <strong>वि.सं. {toNepaliNum(project.completionDateBs || '—')}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Cost Breakdown Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: '#0369a1' }}>
              २. लागत अनुमान तथा वित्तीय स्रोत बाँडफाँड:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'left', width: '50%' }}>लागत विवरण</th>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', width: '25%' }}>रकम (रु.)</th>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'left', width: '25%' }}>कैफियत</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>१. कुल स्वीकृत लागत अनुमान रु.</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>रु. {formatNpr(totalEstimate)}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>प्राविधिक शाखाबाट स्वीकृत</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>२. गाउँपालिका कार्यालय लागत (अनुदान रकम) रु.</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#0369a1' }}>रु. {formatNpr(totalOffice)}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>नगद निकासा हुने रकम</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>३. उपभोक्ता समिति लागत रु.</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रु. {formatNpr(totalCommittee)}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>लागत साझेदारी</td>
                </tr>
                {laborContribution > 0 && (
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>४. उपभोक्ताको जन श्रमदान रकम रु.</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रु. {formatNpr(laborContribution)}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>श्रम सहभागिता</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>५. कन्टिन्जेन्सी कट्टी ({toNepaliNum(project.contingencyRatePercent || 3)}%) रु.</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#b91c1c' }}>रु. {formatNpr(contingencyAmt)}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>नियमानुसार कट्टी हुने</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>कुल जम्मा सम्झौता दायित्व (२ + ३) रु.</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#059669', fontSize: '0.925rem' }}>
                    रु. {formatNpr(totalOffice + totalCommittee)}
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>कुल वित्तीय दायित्व</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Beneficiary Demographics */}
          {(project.beneficiaryHouseholds || project.beneficiaryCount || project.beneficiaryFemale) && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: '#0369a1' }}>
                ३. लाभान्वित हुने जनसंख्या विवरण:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.65rem', fontSize: '0.825rem', backgroundColor: '#f8fafc' }}>
                <div><strong>घरपरिवार संख्या:</strong> {toNepaliNum(project.beneficiaryHouseholds || '—')}</div>
                <div><strong>समुदाय:</strong> {project.beneficiaryCommunity || 'मिश्रित'}</div>
                <div><strong>महिला:</strong> {toNepaliNum(project.beneficiaryFemale || '—')} | <strong>पुरुष:</strong> {toNepaliNum(project.beneficiaryMale || '—')}</div>
                <div><strong>कुल जम्मा जनसंख्या:</strong> {toNepaliNum(project.beneficiaryCount || '—')} जना</div>
              </div>
            </div>
          )}

          {/* Section 4: 3-Installment Schedule */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: '#0369a1' }}>
              ४. किस्ता भुक्तानी निकासा तालिका (Installment Release Schedule):
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'left', width: '15%' }}>किस्ता क्रम</th>
                  <th style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'left', width: '20%' }}>मिति (वि.सं.)</th>
                  <th style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', width: '25%' }}>रकम (रु.)</th>
                  <th style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'left', width: '40%' }}>शर्त तथा निर्माण सामग्री परिमाण</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{row.phase}</td>
                    <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{toNepaliNum(row.dateBs || '—')}</td>
                    <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#0369a1' }}>रु. {formatNpr(row.amount)}</td>
                    <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{row.materialsQty} {row.remarks ? `(${row.remarks})` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Committee Officials */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: '#0369a1' }}>
              ५. उपभोक्ता समितिका मुख्य पदाधिकारीहरू:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', fontSize: '0.825rem', backgroundColor: '#f8fafc' }}>
              <div>
                <strong>अध्यक्ष:</strong> {project.committeeChair || '.........................'}
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>सम्पर्क: {toNepaliNum(project.committeePhone || '—')}</div>
              </div>
              <div>
                <strong>उपाध्यक्ष:</strong> {project.committeeViceChair || '.........................'}
              </div>
              <div>
                <strong>सचिव:</strong> {project.committeeSecretary || '.........................'}
              </div>
              <div>
                <strong>कोषाध्यक्ष:</strong> {project.committeeTreasurer || '.........................'}
              </div>
            </div>
          </div>

          {/* Section 6: Standard Legal Agreement Terms */}
          <div style={{ marginBottom: '2.5rem', fontSize: '0.8rem', color: '#334155' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              ६. सम्झौताका मुख्य शर्त तथा प्रतिवद्धताहरू:
            </div>
            <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'justify' }}>
              <li>स्वीकृत डिजाइन, नक्सा, स्पेसिफिकेसन र प्राविधिक लागत अनुमान अनुसार नै तोकिएको मितिभित्र गुणस्तरीय काम सम्पन्न गर्नुपर्नेछ।</li>
              <li>उपभोक्ता समितिले कुनै पनि निर्माण व्यवसायी वा बिचौलियालाई कामको जिम्मा दिन पाउने छैन; स्थानीय समुदाय र श्रमिक परिचालन गर्नुपर्नेछ।</li>
              <li>कार्यस्थलमा योजनाको नाम, लागत, समिति र सम्पन्न मिति उल्लेख भएको <strong>नागरिक सूचना पाटी (Signboard)</strong> अनिवार्य राख्नुपर्नेछ।</li>
              <li>प्राविधिकको स्थलगत नापजाँच (MB) तथा अनुगमन प्रतिवेदनका आधारमा मात्र किस्ताबन्दी रूपमा भुक्तानी प्रदान गरिनेछ।</li>
              <li>दोस्रो किस्ता निकासा अगाडि पहिलो किस्ताको कार्यप्रगति र अन्तिम भुक्तानी अगाडि अनिवार्य रूपमा <strong>सार्वजनिक परीक्षण (Public Audit)</strong> सम्पन्न गरी सोको प्रतिवेदन पेश गर्नुपर्नेछ।</li>
              <li>तोकिएको म्याद मिति <strong>वि.सं. {toNepaliNum(project.completionDateBs || '—')}</strong> भित्र कार्य सम्पन्न नभएमा वा सम्झौताको उल्लंघन भएमा पेश्की रकम असुलउपर गरिनेछ।</li>
              <li>नियमानुसार मर्मत सम्भार कोष ३% र कन्टिन्जेन्सी ३% कट्टी गरी फरफारक गरिनेछ।</li>
            </ol>
          </div>

          {/* Signatures Block */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #64748b', textAlign: 'center', fontSize: '0.85rem' }}>
            {/* Committee Side */}
            <div>
              <div style={{ height: '45px', borderBottom: '1px solid #000', marginBottom: '6px' }}></div>
              <div style={{ fontWeight: 700 }}>उपभोक्ता समितिको तर्फबाट</div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>अध्यक्ष: {project.committeeChair || '...........................'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>सचिव: {project.committeeSecretary || '...........................'}</div>
            </div>

            {/* Technical Officer */}
            <div>
              <div style={{ height: '45px', borderBottom: '1px solid #000', marginBottom: '6px' }}></div>
              <div style={{ fontWeight: 700 }}>सिफारिस गर्ने प्राविधिक</div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>{engineerName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{engineerDesig}</div>
            </div>

            {/* CAO / Office Head */}
            <div>
              <div style={{ height: '45px', borderBottom: '1px solid #000', marginBottom: '6px' }}></div>
              <div style={{ fontWeight: 700 }}>सम्झौता स्वीकृत गर्ने</div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>{chiefOfficerName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{chiefOfficerDesig}</div>
            </div>
          </div>

          {/* Official Seal and Footnote */}
          <div style={{ marginTop: '2.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#94a3b8' }}>
            <span>पाँचपोखरी थाङपाल गाउँपालिका — डिजिटल ट्विन योजना व्यवस्थापन प्रणाली</span>
            <span>कम्प्युटर सिर्जित आधिकारिक सम्झौता पत्र | प्रमाणीकरण कोड: {project.projectCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
