import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import type { Project } from '../../../types/sectoral';

export interface ProjectAgreementPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const ProjectAgreementPrintModal: React.FC<ProjectAgreementPrintModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen || !project) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalOffice = Number(project.officeCost !== undefined ? project.officeCost : project.allocatedBudget || 0);
  const totalCommittee = Number(project.committeeCost || 0);
  const totalGrant = Number(project.palikaGrant || (totalOffice - totalCommittee) || totalOffice);

  return (
    <div
      className="agreement-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          maxWidth: '820px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar (Not printed) */}
        <div
          className="d-print-none"
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <FileText size={18} color="#38bdf8" />
            <span>योजना सम्झौता पत्र पूर्वावलोकन (Agreement Letter Preview)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>प्रिन्ट गर्नुहोस्</span>
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

        {/* Printable Document Sheet */}
        <div
          className="printable-sheet"
          style={{
            padding: '2.5rem 3rem',
            overflowY: 'auto',
            fontSize: '0.925rem',
            lineHeight: 1.6,
            color: '#0f172a',
            backgroundColor: '#ffffff',
            fontFamily: 'Noto Sans Devanagari, Outfit, sans-serif',
          }}
        >
          {/* Municipal Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px double #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0' }}>
              गाउँ कार्यपालिकाको कार्यालय
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '0.85rem',
                padding: '0.35rem 1.5rem',
                borderRadius: '4px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.5px',
              }}
            >
              योजना सम्झौता पत्र तथा कार्यादेश
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <div>
              <strong>आयोजना संकेत नं:</strong> {project.projectCode}
            </div>
            <div>
              <strong>सम्झौता मिति:</strong> {project.startDateBs || project.agreementDateBs || 'मिति उपलब्ध छैन'}
            </div>
          </div>

          <p style={{ textIndent: '2rem', textAlign: 'justify', marginBottom: '1rem' }}>
            पाँचपोखरी थाङपाल गाउँपालिका र <strong>{project.committeeName || `${project.name} उपभोक्ता समिति`}</strong> बीच आ.व. <strong>{project.fiscalYear || ''}</strong> को वार्षिक स्वीकृत कार्यक्रम अनुसार देहाय बमोजिमको विकास निर्माण कार्य सम्पन्न गर्न स्थानीय तह उपभोक्ता समिति गठन तथा परिचालन कार्यविधि बमोजिम यो सम्झौता गरिएको छ।
          </p>

          {/* Section A: Project Metadata Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#0369a1' }}>
              १. आयोजना तथा सम्झौताको मुख्य विवरण:
            </div>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, width: '30%', backgroundColor: '#f8fafc' }}>आयोजनाको नाम</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{project.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>बजेट स्रोत</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.budgetSource || 'संघीय सरकार वित्तीय समानीकरण अनुदान'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>वडा / नगर स्तर</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.level || 'नगर स्तरिय'} (वडा नं. {project.wardNumber || 'सबै'})</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>कार्यान्वयन मार्फत</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{project.marfat || 'उपभोक्ता समिति'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>काम सुरु हुने र सम्पन्न मिति</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>सुरु: {project.startDateBs || 'मिति उपलब्ध छैन'} | सम्पन्न: {project.completionDateBs || 'मिति उपलब्ध छैन'}</td>
                </tr>
              </tbody>
            </table>
</div>
          </div>

          {/* Section B: Cost Breakdown Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#0369a1' }}>
              २. लागत अनुमान तथा वित्तीय स्रोत विवरण:
            </div>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>विवरण</th>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रकम (रु.)</th>
                  <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>कैफियत</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>क) कार्यालय लागत / स्वीकृत लागत अनुमान</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>रु. {totalOffice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>प्राविधिक शाखाबाट स्वीकृत</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>ख) गाउँपालिकाबाट व्यहोरिने अनुदान</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रु. {totalGrant.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>नगद भुक्तानी हुने</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>ग) उपभोक्ता समिति लागत / जनसहभागिता</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रु. {totalCommittee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>श्रमदान वा लागत साझेदारी</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>कुल जम्मा सम्झौता रकम (ख + ग)</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0369a1' }}>रु. {(totalGrant + totalCommittee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>कुल वित्तीय दायित्व</td>
                </tr>
              </tbody>
            </table>
</div>
          </div>

          {/* Section C: Committee Officials */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#0369a1' }}>
              ३. उपभोक्ता समितिका मुख्य पदाधिकारीहरू:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <strong>अध्यक्ष:</strong> {project.committeeChair || 'दावा दोर्जे तामाङ'}
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>सम्पर्क: {project.committeePhone || '९८४१५२६३७१'}</div>
              </div>
              <div>
                <strong>सचिव:</strong> {project.committeeSecretary || 'निमा लामा'}
              </div>
              <div>
                <strong>कोषाध्यक्ष:</strong> {project.committeeTreasurer || 'पासाङ ल्हामु शेर्पा'}
              </div>
            </div>
          </div>

          {/* Section D: Agreement Terms */}
          <div style={{ marginBottom: '2.5rem', fontSize: '0.825rem', color: '#334155' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>४. मुख्य सर्तहरू:</div>
            <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>तोकिएको मिति भित्र गुणस्तरीय रूपमा काम सम्पन्न गरी सार्वजनिक परीक्षण (Public Audit) सम्पन्न गर्नुपर्नेछ।</li>
              <li>प्राविधिक नापजाँच तथा कार्यसम्पादन प्रतिवेदनका आधारमा किस्ताबन्दी रूपमा भुक्तानी प्रदान गरिनेछ।</li>
              <li>स्वीकृत लागत अनुमान विपरीत काम गरेमा उपभोक्ता समिति स्वयं जिम्मेवार हुनेछ।</li>
            </ol>
          </div>

          {/* Signatures Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px dashed #94a3b8' }}>
            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '6px', height: '40px' }}></div>
              <div style={{ fontWeight: 700 }}>उपभोक्ता समिति अध्यक्ष</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>नाम: {project.committeeChair || '...........................'}</div>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '6px', height: '40px' }}></div>
              <div style={{ fontWeight: 700 }}>योजना / प्राविधिक शाखा प्रमुख</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '6px', height: '40px' }}></div>
              <div style={{ fontWeight: 700 }}>प्रमुख प्रशासकीय अधिकृत</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
