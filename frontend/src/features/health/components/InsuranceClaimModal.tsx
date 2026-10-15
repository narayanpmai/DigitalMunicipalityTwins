import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Building2,
  Calendar,
  Share2,
  ArrowUpRight,
} from 'lucide-react';
import type { HealthInsuranceClaim } from '../../../types/health';

interface InsuranceClaimModalProps {
  claim: HealthInsuranceClaim | null;
  onClose: () => void;
  onUpdateStatus?: (claimId: string, status: string, reimbursedAmount?: number) => void;
}

export const InsuranceClaimModal: React.FC<InsuranceClaimModalProps> = ({
  claim,
  onClose,
  onUpdateStatus,
}) => {
  if (!claim) return null;

  const [activeTab, setActiveTab] = useState<'claim_form' | 'referral_slip'>('claim_form');
  const [newStatus, setNewStatus] = useState(claim.claimStatus || 'submitted');
  const [reimbursedAmt, setReimbursedAmt] = useState(claim.reimbursedAmount || claim.claimedAmount || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveStatus = () => {
    if (onUpdateStatus) {
      onUpdateStatus(claim.id, newStatus, Number(reimbursedAmt));
    }
  };

  // Simulated policy annual balance (Annual ceiling: Rs. 100,000)
  const annualLimit = 100000;
  const utilizedAmount = Number(claim.claimedAmount || 0) + 12450;
  const remainingLimit = Math.max(0, annualLimit - utilizedAmount);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-insurance-sheet, #printable-insurance-sheet * {
            visibility: visible !important;
          }
          #printable-insurance-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Toolbar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#4ade80" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              स्वास्थ्य बीमा बोर्ड (HIB) - दावी तथा सिफारिस व्यवस्थापन
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab & Action Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('claim_form')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: activeTab === 'claim_form' ? '#16a34a' : '#cbd5e1',
                backgroundColor: activeTab === 'claim_form' ? '#f0fdf4' : '#ffffff',
                color: activeTab === 'claim_form' ? '#15803d' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📄 बीमा दावी फारम (Claim Sheet)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('referral_slip')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: activeTab === 'referral_slip' ? '#16a34a' : '#cbd5e1',
                backgroundColor: activeTab === 'referral_slip' ? '#f0fdf4' : '#ffffff',
                color: activeTab === 'referral_slip' ? '#15803d' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 प्रेषण पुर्जी (Referral Slip)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* ── PRINTABLE CONTAINER ── */}
        <div
          id="printable-insurance-sheet"
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#0f172a',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              नेपाल सरकार | स्वास्थ्य तथा जनसंख्या मन्त्रालय
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#16a34a', margin: '2px 0' }}>
              स्वास्थ्य बीमा बोर्ड (Health Insurance Board - HIB)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {claim.healthFacilityName || 'पाँचपोखरी आधारभूत अस्पताल, थाङपालधाप'} (प्रथम सेवा बिन्दु)
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '3px 14px',
                borderRadius: '20px',
                backgroundColor: activeTab === 'claim_form' ? '#166534' : '#1e40af',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
              }}
            >
              {activeTab === 'claim_form' ? 'स्वास्थ्य बीमा सेवा दावी फारम (Claim Sheet)' : 'बिरामी प्रेषण पुर्जी (Hospital Referral Slip)'}
            </div>
          </div>

          {/* Meta Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '16px',
              fontSize: '0.82rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>दावी नं (Claim No): </span>
              <strong style={{ fontFamily: 'monospace', color: '#16a34a', fontSize: '0.95rem' }}>{claim.claimNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>बीमा कार्ड नं (Policy No): </span>
              <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{claim.policyNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>मिति: </span>
              <strong>{claim.claimDateBs}</strong>
            </div>
          </div>

          {/* Patient Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px 20px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>बिरामीको नाम:</span>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{claim.patientName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MRN: {claim.patientNo}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>उमेर / लिङ्ग:</span>
              <div style={{ fontWeight: 700 }}>
                {claim.patientAge} वर्ष / {claim.patientGender === 'female' ? 'महिला' : 'पुरुष'}
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>रोगको नाम तथा ICD कोड:</span>
              <div style={{ fontWeight: 700, color: '#0369a1' }}>
                {claim.diagnosisName || 'सामान्य स्वास्थ्य जाँच'} ({claim.diagnosisCode || 'Z76.0'})
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>सेवा प्रकार (Service Category):</span>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {claim.serviceType === 'pharmacy' ? 'औषधि (Pharmacy Dispense)' : claim.serviceType === 'opd' ? 'बहिरङ्ग सेवा (OPD Consultation)' : claim.serviceType}
              </div>
            </div>
          </div>

          {activeTab === 'claim_form' ? (
            /* ── CLAIM BREAKDOWN TABLE ── */
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>खर्च तथा दावी विवरण</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>विवरण</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>कुल रकम (रु.)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>सह-भुक्तानी (Co-Pay रु.)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>दावी रकम (Claimed रु.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>स्वास्थ्य सेवा तथा औषधि वितरण</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{Number(claim.totalBillAmount).toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>
                      {Number(claim.copayAmount).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                      {Number(claim.claimedAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                    <td style={{ padding: '8px' }}>जम्मा दावी पेश गरिएको रकम:</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{Number(claim.totalBillAmount).toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{Number(claim.copayAmount).toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.95rem', color: '#15803d' }}>
                      रु. {Number(claim.claimedAmount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Annual Balance Progress Card */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                  <span>वार्षिक सुविधा सीमा (Annual Benefit Ceiling): रु. १,००,०००/-</span>
                  <span>बाँकी सीमा: रु. {remainingLimit.toLocaleString('ne-NP')}/-</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, (utilizedAmount / annualLimit) * 100)}%`,
                      height: '100%',
                      backgroundColor: '#16a34a',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px' }}>
                  यस आर्थिक वर्षमा कुल खर्च भएको: रु. {utilizedAmount.toLocaleString('ne-NP')}/- (सक्रिय नीति)
                </div>
              </div>
            </div>
          ) : (
            /* ── REFERRAL SLIP VIEW ── */
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e40af', marginBottom: '8px' }}>
                उच्च तहको स्वास्थ्य संस्थामा प्रेषण (Referral to Higher Center)
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: '1.6', color: '#334155' }}>
                <p>
                  यस <strong>{claim.healthFacilityName}</strong> मा उपचाररत बिरामी <strong>{claim.patientName}</strong> (बीमा नं: {claim.policyNumber}) लाई थप विशेषज्ञ सेवा तथा आवश्यक जाँचका लागि <strong>धुलिखेल अस्पताल / पाटन अस्पताल</strong> मा सिफारिस (Refer) गरिएको छ।
                </p>
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                  <strong>रोगको निदान (Diagnosis):</strong> {claim.diagnosisName} ({claim.diagnosisCode})
                  <br />
                  <strong>रेफर गर्नुको कारण:</strong> विशेषज्ञ चिकित्सक परामर्श, उच्च स्तरको ल्याब/रेडियोलोजी जाँच तथा आवश्यक उपचार।
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '10px', fontSize: '0.8rem' }}>
            <div style={{ textAlign: 'center', width: '160px', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
              बिरामीको सही/औंठाछाप
            </div>
            <div style={{ textAlign: 'center', width: '160px', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
              उपचारक स्वास्थ्यकर्मीको सही
            </div>
            <div style={{ textAlign: 'center', width: '180px', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
              बीमा सहजकर्ता / प्रमुख
            </div>
          </div>
        </div>

        {/* Modal Status Controls Footer (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>दावी स्थिति (Status):</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#ffffff',
              }}
            >
              <option value="submitted">दावी पेश गरिएको (Submitted)</option>
              <option value="approved">बीमा बोर्डबाट स्वीकृत (Approved)</option>
              <option value="reimbursed">रकम भुक्तानी प्राप्त (Reimbursed)</option>
              <option value="rejected">अस्वीकृत (Rejected)</option>
            </select>

            {newStatus === 'reimbursed' && (
              <input
                type="number"
                placeholder="प्राप्त रकम"
                value={reimbursedAmt}
                onChange={(e) => setReimbursedAmt(parseFloat(e.target.value) || 0)}
                style={{ width: '100px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            )}

            <button
              type="button"
              onClick={handleSaveStatus}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              स्थिति अपडेट
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
