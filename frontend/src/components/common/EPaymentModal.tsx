import React, { useState } from 'react';
import { CreditCard, QrCode, CheckCircle, Shield, AlertCircle, X, ArrowRight, RefreshCw, Landmark } from 'lucide-react';

export interface EPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  billNumber: string;
  payeeName: string;
  amountNpr: number;
  onSuccess: (txnDetails: { txnId: string; gateway: string; paidAmount: number }) => void;
}

export const EPaymentModal: React.FC<EPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  billNumber,
  payeeName,
  amountNpr,
  onSuccess,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<'connectips' | 'esewa' | 'khalti'>('connectips');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [txnId, setTxnId] = useState<string>('');

  if (!isOpen) return null;

  const handleProcessPayment = () => {
    setStep('processing');
    const generatedTxn = `TXN-${selectedGateway.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnId(generatedTxn);

    // Simulate gateway verification
    setTimeout(() => {
      setStep('success');
      onSuccess({
        txnId: generatedTxn,
        gateway: selectedGateway,
        paidAmount: amountNpr,
      });
    }, 1800);
  };

  const handleDone = () => {
    setStep('select');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #07193b 0%, #0d2757 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#93c5fd' }}>
              <Shield size={14} /> सुरक्षित ई-भुक्तानी गेटवे
            </div>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
              अनलाइन राजस्व संकलन
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {step === 'select' && (
            <>
              {/* Payment Summary Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  भुक्तानी शीर्षक: <strong style={{ color: '#0f172a' }}>{title}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  रसिद / बिल नं: <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 600 }}>{billNumber}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  करदाता / सेवाग्राही: <strong style={{ color: '#0f172a' }}>{payeeName}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>कुल बुझाउनुपर्ने रकम:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
                    रु. {Number(amountNpr).toLocaleString('ne-NP')}
                  </span>
                </div>
              </div>

              {/* Gateway Selector */}
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                भुक्तानी माध्यम छनोट गर्नुहोस्:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {/* ConnectIPS */}
                <div
                  onClick={() => setSelectedGateway('connectips')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${selectedGateway === 'connectips' ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: selectedGateway === 'connectips' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                      <Landmark size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>ConnectIPS (NCHL)</strong>
                      <small style={{ color: '#64748b' }}>नेपाल सरकारको राष्ट्रिय भुक्तानी स्वीच (०% शुल्क)</small>
                    </div>
                  </div>
                  <input type="radio" checked={selectedGateway === 'connectips'} readOnly />
                </div>

                {/* eSewa */}
                <div
                  onClick={() => setSelectedGateway('esewa')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${selectedGateway === 'esewa' ? '#16a34a' : '#e2e8f0'}`,
                    backgroundColor: selectedGateway === 'esewa' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#60bb46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.8rem' }}>
                      eS
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>eSewa डिजिटल वालेट</strong>
                      <small style={{ color: '#64748b' }}>मोबाइल वालेट तथा Fonepay QR स्क्यान</small>
                    </div>
                  </div>
                  <input type="radio" checked={selectedGateway === 'esewa'} readOnly />
                </div>

                {/* Khalti */}
                <div
                  onClick={() => setSelectedGateway('khalti')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${selectedGateway === 'khalti' ? '#7c3aed' : '#e2e8f0'}`,
                    backgroundColor: selectedGateway === 'khalti' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#5c2d91', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.8rem' }}>
                      Kh
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Khalti डिजिटल वालेट</strong>
                      <small style={{ color: '#64748b' }}>तत्काल क्यासब्याक तथा वालेट भुक्तानी</small>
                    </div>
                  </div>
                  <input type="radio" checked={selectedGateway === 'khalti'} readOnly />
                </div>
              </div>

              <button
                type="button"
                onClick={handleProcessPayment}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                }}
              >
                <span>रु. {Number(amountNpr).toLocaleString('ne-NP')} तुरुन्त भुक्तानी गर्नुहोस्</span>
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <RefreshCw size={32} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                भुक्तानी प्रमाणीकरण हुँदैछ...
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                NCHL / {selectedGateway.toUpperCase()} गेटवेसँग सुरक्षित सम्पर्क स्थापना गरिँदैछ। कृपया प्रतीक्षा गर्नुहोस्।
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle size={36} />
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', margin: '0 0 0.25rem' }}>
                भुक्तानी सफलतापूर्वक सम्पन्न भयो!
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                पालिकाको सञ्चित कोष खातामा राजस्व रकम दाखिला भइसकेको छ।
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                }}
              >
                <div><strong>कारोबार संकेत (Txn ID):</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{txnId}</span></div>
                <div><strong>भुक्तानी गेटवे:</strong> {selectedGateway.toUpperCase()}</div>
                <div><strong>दाखिला रकम:</strong> रु. {Number(amountNpr).toLocaleString('ne-NP')}</div>
                <div><strong>अवस्था:</strong> <span style={{ color: '#15803d', fontWeight: 700 }}>सम्पन्न (PAID)</span></div>
              </div>

              <button
                type="button"
                onClick={handleDone}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                रसिद हेर्नुहोस् र बन्द गर्नुहोस्
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
