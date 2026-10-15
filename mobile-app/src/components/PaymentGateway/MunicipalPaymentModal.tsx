import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  Printer,
  Sparkles,
  ArrowRight,
  Lock,
  Building2,
  Calendar,
  User,
} from 'lucide-react';

interface MunicipalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: string;
  amount: number;
  referenceNo: string;
  payerName: string;
  payerPhone: string;
  wardNo: number;
  onPaymentSuccess: (receipt: any) => void;
}

export const MunicipalPaymentModal: React.FC<MunicipalPaymentModalProps> = ({
  isOpen,
  onClose,
  purpose,
  amount,
  referenceNo,
  payerName,
  payerPhone,
  wardNo,
  onPaymentSuccess,
}) => {
  const [gateway, setGateway] = useState<'esewa' | 'khalti' | 'fonepay'>('esewa');
  const [step, setStep] = useState<'select' | 'processing' | 'receipt'>('select');
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setStep('processing');
    setTimeout(() => {
      const receipt = {
        receiptNo: `मलेप १०२-०८१-${Math.floor(1000 + Math.random() * 9000)}`,
        dateBs: '२०८१/०६/१२',
        time: '११:३५ AM',
        payerName: payerName || 'राम बहादुर तामाङ',
        phone: payerPhone || '९८४१२३४५६७',
        wardNo: wardNo || 3,
        purpose: purpose,
        amountRs: amount,
        paymentGateway: gateway === 'esewa' ? 'eSewa Mobile Wallet' : gateway === 'khalti' ? 'Khalti Digital Wallet' : 'Fonepay Interbank QR',
        transactionCode: `TXN-PP-${Date.now().toString().slice(-8)}`,
        fiscalYear: '२०८१/८२',
        remarks: 'नेपाल राष्ट्र बैंक स्वीकृत डिजिटल भुक्तानी प्रणाली मार्फत गाउँपालिका सञ्चित कोषमा दाखिला।',
      };
      setGeneratedReceipt(receipt);
      setStep('receipt');
      onPaymentSuccess(receipt);
    }, 1400);
  };

  const handleDownload = () => {
    alert(`आधिकारिक मलेप १०२ रसिद (${generatedReceipt?.receiptNo}) सफलतापूर्वक डाउनलोड भयो!`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(5px)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F4C81 0%, #1E3A8A 60%, #0F2342 100%)',
            color: '#ffffff',
            padding: '1.15rem 1.25rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0,
              }}
            >
              <img src="/panchpokhari-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 900 }}>
                {step === 'receipt' ? 'मलेप १०२ डिजिटल रसिद' : 'सुरक्षित डिजिटल भुक्तानी'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#FCD34D' }}>
                पाँचपोखरी थाङपाल गाउँपालिका सञ्चित कोष खाता
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          {/* ─── STEP 1: PAYMENT GATEWAY SELECTION ─── */}
          {step === 'select' && (
            <div>
              {/* Bill Summary Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  marginBottom: '1.15rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>भुक्तानी प्रयोजन:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                  {purpose}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>संकेत नं:</span> <strong>{referenceNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>करदाता:</span> <strong>{payerName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>वडा नं:</span> <strong>{wardNo} (मानेखर्क)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>आ.व.:</span> <strong>२०८१/८२</strong>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E' }}>जम्मा तिर्नुपर्ने रकम:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#B45309' }}>रु. {amount}/-</span>
                </div>
              </div>

              {/* Gateway Selection Tabs */}
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                भुक्तानी माध्यम छान्नुहोस्:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                {/* Gateway 1: eSewa */}
                <div
                  onClick={() => setGateway('esewa')}
                  style={{
                    backgroundColor: gateway === 'esewa' ? '#F0FDF4' : '#ffffff',
                    border: gateway === 'esewa' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: gateway === 'esewa' ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#60BB46',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                      }}
                    >
                      e
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>eSewa Mobile Wallet</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>ईसेवा वालेट / मोबाइल बैंकिङ मार्फत</div>
                    </div>
                  </div>
                  <input type="radio" checked={gateway === 'esewa'} readOnly />
                </div>

                {/* Gateway 2: Khalti */}
                <div
                  onClick={() => setGateway('khalti')}
                  style={{
                    backgroundColor: gateway === 'khalti' ? '#FAF5FF' : '#ffffff',
                    border: gateway === 'khalti' ? '2px solid #9333EA' : '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: gateway === 'khalti' ? '0 4px 12px rgba(147, 51, 234, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#5C2D91',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                      }}
                    >
                      K
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Khalti Digital Wallet</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>खल्ती वालेट / स्मार्ट भुक्तानी</div>
                    </div>
                  </div>
                  <input type="radio" checked={gateway === 'khalti'} readOnly />
                </div>

                {/* Gateway 3: Fonepay */}
                <div
                  onClick={() => setGateway('fonepay')}
                  style={{
                    backgroundColor: gateway === 'fonepay' ? '#FEF2F2' : '#ffffff',
                    border: gateway === 'fonepay' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: gateway === 'fonepay' ? '0 4px 12px rgba(220, 38, 38, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#E11D48',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCode size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Fonepay Interbank QR</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>नेपालका कुनै पनि ५०+ बैंकका एपबाट स्क्यान</div>
                    </div>
                  </div>
                  <input type="radio" checked={gateway === 'fonepay'} readOnly />
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePayNow}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '14px',
                  fontSize: '0.94rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
                }}
              >
                <Lock size={16} />
                <span>रु. {amount} तत्काल भुक्तानी गर्नुहोस्</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ─── STEP 2: PROCESSING ANIMATION ─── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '3px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  animation: 'pulse 1.2s infinite',
                }}
              >
                <ShieldCheck size={36} color="#059669" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
                भुक्तानी प्रमाणीकरण हुँदैछ...
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
                नेपाल राष्ट्र बैंक स्वीकृत गेटवे र पालिका सञ्चित कोष सर्भरसँग सम्पर्क स्थापित हुँदैछ। कृपया केही सेकेन्ड प्रतीक्षा गर्नुहोस्।
              </div>
            </div>
          )}

          {/* ─── STEP 3: OFFICIAL MALEP 102 DIGITAL RECEIPT ─── */}
          {step === 'receipt' && generatedReceipt && (
            <div>
              {/* Success Badge */}
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  color: '#065F46',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem',
                  fontWeight: 800,
                }}
              >
                <CheckCircle2 size={18} color="#059669" />
                <span>भुक्तानी सफलतापूर्वक सम्पन्न भयो! मलेप १०२ रसिद जारी गरियो।</span>
              </div>

              {/* Official Nepal Govt Malep 102 Receipt Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Official Watermark */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.06,
                    pointerEvents: 'none',
                  }}
                >
                  <img src="/panchpokhari-logo.png" alt="watermark" style={{ width: '220px', height: '220px' }} />
                </div>

                {/* Receipt Header */}
                <div style={{ textAlign: 'center', borderBottom: '1.5px solid #0F172A', paddingBottom: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B' }}>
                    महालेखा नियन्त्रक कार्यालय (म.ले.प. फाराम नं. १०२)
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0F172A' }}>
                    पाँचपोखरी थाङपाल गाउँपालिका
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                    गाउँ कार्यपालिकाको कार्यालय, मानेखर्क, सिन्धुपाल्चोक • बागमती प्रदेश
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#F1F5F9',
                      padding: '2px 10px',
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      marginTop: '4px',
                    }}
                  >
                    डिजिटल आम्दानी नगदी रसिद
                  </div>
                </div>

                {/* Receipt Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem', marginBottom: '8px' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>रसिद नं.:</span> <strong style={{ color: '#DC2626' }}>{generatedReceipt.receiptNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>आर्थिक वर्ष:</span> <strong>{generatedReceipt.fiscalYear}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>मिति / समय:</span> <strong>{generatedReceipt.dateBs} ({generatedReceipt.time})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>भुक्तानी माध्यम:</span> <strong>{generatedReceipt.paymentGateway}</strong>
                  </div>
                </div>

                {/* Taxpayer Information */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', fontSize: '0.72rem', marginBottom: '10px' }}>
                  <div>
                    करदाता / सेवाग्राही: <strong>{generatedReceipt.payerName}</strong>
                  </div>
                  <div>
                    मोबाइल नं.: <strong>{generatedReceipt.phone}</strong> • स्थायी ठेगाना: <strong>वडा नं {generatedReceipt.wardNo}, पाँचपोखरी</strong>
                  </div>
                </div>

                {/* Particulars Table */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', backgroundColor: '#F1F5F9', padding: '6px 8px', fontWeight: 800 }}>
                    <span>विवरण (Particulars)</span>
                    <span style={{ textAlign: 'right' }}>रकम (रु.)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', padding: '8px', borderTop: '1px solid #E2E8F0' }}>
                    <span>{generatedReceipt.purpose}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700 }}>{generatedReceipt.amountRs}.००</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', padding: '8px', backgroundColor: '#F8FAFC', borderTop: '1.5px solid #CBD5E1', fontWeight: 900 }}>
                    <span>जम्मा दाखिला रकम (अक्षरेपी: दुई सय मात्र):</span>
                    <span style={{ textAlign: 'right', color: '#059669' }}>रु. {generatedReceipt.amountRs}.००</span>
                  </div>
                </div>

                {/* Stamp & Verification */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        border: '1.5px dashed #16A34A',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16A34A',
                        fontSize: '0.45rem',
                        fontWeight: 900,
                        lineHeight: 1.1,
                      }}
                    >
                      <span>डिजिटल छाप</span>
                      <span>पाँचपोखरी</span>
                      <span>२०८१</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                      प्रमाणित नगदी रसिद
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <QrCode size={36} color="#0F172A" />
                    <span style={{ fontSize: '0.55rem', color: '#64748B', display: 'block' }}>
                      स्क्यान गरी जाँच्नुहोस्
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    backgroundColor: '#0F4C81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={14} />
                  <span>रसिद डाउनलोड</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  सम्पन्न भयो
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
