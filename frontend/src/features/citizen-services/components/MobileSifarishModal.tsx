import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  FileCheck2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  Printer,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  Building2,
  Calendar,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { SifarishTemplate } from '../sifarishTemplates';
import { api } from '../../../api/client';
import { revenueApi } from '../../../api/revenue';
import { RevenuePaymentModal } from '../../revenue/components/RevenuePaymentModal';
import { OfficialSifarishLetterhead } from '../OfficialSifarishLetterhead';

interface MobileSifarishModalProps {
  template: SifarishTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (application: any) => void;
}

export const MobileSifarishModal: React.FC<MobileSifarishModalProps> = ({
  template,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');

  // Core Applicant State
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCitizenship, setApplicantCitizenship] = useState('');
  const [wardNumber, setWardNumber] = useState<number>(3);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');

  // Dynamic Specific Fields State
  const [specificData, setSpecificData] = useState<Record<string, any>>({});

  // Payment State
  const [feePaid, setFeePaid] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [paymentTxnId, setPaymentTxnId] = useState<string>('');

  // Created Application State
  const [createdApp, setCreatedApp] = useState<any>(null);
  const [showLetterheadModal, setShowLetterheadModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !template) return null;

  const feeAmount = typeof template.feeNpr === 'number' ? template.feeNpr : 0;
  const isFree = template.feeNpr === 'free' || feeAmount === 0;

  const handleFieldChange = (key: string, val: any) => {
    setSpecificData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      setErrorMsg('कृपया निवेदकको पूरा नाम लेख्नुहोस्।');
      return;
    }
    if (!isFree && !feePaid) {
      // Prompt payment first
      setShowPayModal(true);
      return;
    }

    setErrorMsg('');
    setStep('submitting');

    try {
      const payload = {
        serviceType: template.serviceType,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim() || undefined,
        wardNumber: Number(wardNumber) || 1,
        purpose: purpose.trim() || template.subject,
        fee: feeAmount,
        status: 'applied',
        formData: {
          templateId: template.id,
          templateCode: template.code,
          templateTitle: template.title,
          applicantCitizenship,
          remarks,
          paymentTxnId,
          ...specificData,
        },
      };

      const res = await api.post('/citizen-services', payload);
      const app = (res as any)?.data || res;
      setCreatedApp(app);
      setStep('success');
      if (onSuccess) onSuccess(app);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setErrorMsg('आवेदन पेश गर्न प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
      setStep('form');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '0.75rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '1.15rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#bae6fd', fontWeight: 600 }}>
              <span>{template.code}</span> • <span>वडा ई-सिफारिस सेवा</span>
            </div>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
              {template.title}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#e0f2fe', marginTop: '0.25rem' }}>
              दस्तुर: <strong style={{ color: '#ffffff' }}>{isFree ? 'निःशुल्क' : `रु. ${feeAmount}`}</strong> | समय: {template.timeEstimate}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM FILLING */}
          {step === 'form' && (
            <form onSubmit={handleSubmitApplication}>
              {/* Required Documents Alert */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={15} />
                  <span>आवश्यक प्रमाण कागजातहरू:</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', lineHeight: 1.5 }}>
                  {template.requiredDocs.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              {/* Applicant Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    निवेदकको पूरा नाम (Applicant Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="जस्तै: दावा छिरिङ लामा"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      सम्पर्क फोन *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="९८४१२३४५६७"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      वडा नम्बर *
                    </label>
                    <select
                      value={wardNumber}
                      onChange={(e) => setWardNumber(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>वडा नं. {w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    नागरिकता / जन्मदर्ता नं.
                  </label>
                  <input
                    type="text"
                    value={applicantCitizenship}
                    onChange={(e) => setApplicantCitizenship(e.target.value)}
                    placeholder="उदा: २३-०१-७५-००३४१"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Specific Fields Required by Template */}
                {template.specificFields && template.specificFields.length > 0 && (
                  <div
                    style={{
                      borderTop: '1px dashed #cbd5e1',
                      paddingTop: '0.85rem',
                      marginTop: '0.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      {template.title} का लागि थप विवरण:
                    </div>
                    {template.specificFields.map((field) => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                          {field.label}
                        </label>
                        {field.type === 'select' && field.options ? (
                          <select
                            required={field.required}
                            value={specificData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.875rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          >
                            <option value="">-- छनोट गर्नुहोस् --</option>
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            required={field.required}
                            value={specificData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder || ''}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.875rem',
                              outline: 'none',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fee and Payment Indicator */}
              {!isFree && (
                <div
                  style={{
                    backgroundColor: feePaid ? '#f0fdf4' : '#eff6ff',
                    border: `1.5px solid ${feePaid ? '#86efac' : '#93c5fd'}`,
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: feePaid ? '#15803d' : '#1e40af' }}>
                      सिफारिस दस्तुर: रु. {feeAmount}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {feePaid ? `भुक्तानी सम्पन्न (Txn: ${paymentTxnId})` : 'Fonepay, eSewa, Khalti, ConnectIPS बाट अनलाइन भुक्तानी'}
                    </div>
                  </div>

                  {!feePaid ? (
                    <button
                      type="button"
                      onClick={() => setShowPayModal(true)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CreditCard size={14} />
                      <span>ई-भुक्तानी</span>
                    </button>
                  ) : (
                    <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={16} /> चुक्ता
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.6rem 1.15rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <span>{isFree || feePaid ? 'आवेदन दर्ता गर्नुहोस्' : `रु. ${feeAmount} भुक्तानी र दर्ता`}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SUBMITTING STATE */}
          {step === 'submitting' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <RefreshCw size={36} color="#0284c7" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                आवेदन प्रणालीमा प्रविष्टि हुँदैछ...
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                वडा कार्यालयको अनलाइन स्रेस्तामा दर्ता गरी टोकन नम्बर सृजना गरिँदैछ।
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && createdApp && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', margin: '0 0 0.25rem' }}>
                ई-सिफारिस आवेदन दर्ता सम्पन्न!
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                पाँचपोखरी थाङपाल गाउँपालिका वडा नं. {createdApp.wardNumber || wardNumber} को नागरिक सेवा प्रणालीमा दर्ता भएको छ।
              </p>

              {/* Token Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  padding: '1.15rem',
                  textAlign: 'left',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <strong>आवेदन टोकन नम्बर:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>
                    {createdApp.applicationNo}
                  </span>
                </div>
                <div><strong>सेवाको नाम:</strong> {template.title}</div>
                <div><strong>निवेदक:</strong> {createdApp.applicantName || applicantName}</div>
                <div>
                  <strong>अवस्था (Status):</strong>{' '}
                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                    आवेदन पेश भएको (Applied)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLetterheadModal(true)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FileCheck2 size={18} />
                  <span>आधिकारिक डिजिटल सिफारिस पत्र पूर्वावलोकन / डाउनलोड</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EMBEDDED E-PAYMENT GATEWAY MODAL ── */}
      {showPayModal && (
        <RevenuePaymentModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          revenueHead={`सिफारिस दस्तुर: ${template.title}`}
          baseAmount={feeAmount}
          netAmount={feeAmount}
          initialPayerName={applicantName}
          initialPayerPhone={applicantPhone}
          initialWardNumber={wardNumber}
          onPaymentSuccess={(receipt) => {
            setFeePaid(true);
            setPaymentTxnId(receipt.transactionId || receipt.receiptNo || 'TXN-PAID');
            setShowPayModal(false);
          }}
        />
      )}

      {/* ── OFFICIAL SIFARISH LETTERHEAD A4 MODAL ── */}
      {showLetterheadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', padding: '0.75rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setShowLetterheadModal(false)}
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
              >
                बन्द गर्नुहोस् ✕
              </button>
            </div>
            <OfficialSifarishLetterhead
              template={template}
              applicantData={{
                applicantName,
                applicantPhone,
                wardNumber,
                purpose,
                applicationNo: createdApp?.applicationNo || 'SVC-2081-00101',
                certificateNo: `PPK-SIF-${wardNumber}-2081-${Math.floor(1000 + Math.random() * 9000)}`,
                dispatchNo: `${Math.floor(200 + Math.random() * 600)}`,
                formData: {
                  applicantCitizenship,
                  ...specificData,
                },
              }}
              onClose={() => setShowLetterheadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSifarishModal;
