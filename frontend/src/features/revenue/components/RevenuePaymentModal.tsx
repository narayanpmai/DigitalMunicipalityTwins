import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CreditCard,
  Shield,
  QrCode as QrIcon,
  CheckCircle2,
  RefreshCw,
  Landmark,
  ArrowRight,
  Smartphone,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { revenueApi, RevenueRecord } from '../../../api/revenue';
import { toNepaliDigits } from '../utils/nepaliCurrencyWords';

interface RevenuePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueHead: string;
  baseAmount: number;
  discountAmount?: number;
  fineAmount?: number;
  netAmount: number;
  initialPayerName?: string;
  initialPayerPhone?: string;
  initialPayerPan?: string;
  initialWardNumber?: number;
  taxAssessmentDetails?: any;
  onPaymentSuccess: (receipt: RevenueRecord) => void;
}

export const RevenuePaymentModal: React.FC<RevenuePaymentModalProps> = ({
  isOpen,
  onClose,
  revenueHead,
  baseAmount,
  discountAmount = 0,
  fineAmount = 0,
  netAmount,
  initialPayerName = '',
  initialPayerPhone = '',
  initialPayerPan = '',
  initialWardNumber = 3,
  taxAssessmentDetails,
  onPaymentSuccess,
}) => {
  const [gateway, setGateway] = useState<'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CONNECTIPS' | 'CLEAN_CASH'>('FONEPAY');
  const [payerName, setPayerName] = useState(initialPayerName);
  const [payerPhone, setPayerPhone] = useState(initialPayerPhone);
  const [payerPan, setPayerPan] = useState(initialPayerPan);
  const [wardNumber, setWardNumber] = useState(initialWardNumber);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Generate dynamic transaction ID
  const [tempTxnId] = useState(() => `TXN-${Math.floor(100000 + Math.random() * 900000)}`);

  // Generate dynamic QR code based on selected gateway and amount
  useEffect(() => {
    if (!isOpen) return;

    const qrPayload = JSON.stringify({
      scheme: 'nepalqr',
      merchantName: 'PANCHPOKHARI THANGPAL RM',
      merchantId: 'P5-REV-MERC-01',
      gateway: gateway,
      amount: netAmount,
      currency: 'NPR',
      ref: tempTxnId,
      head: revenueHead,
      timestamp: new Date().toISOString(),
    });

    const qrColors: Record<string, string> = {
      FONEPAY: '#b91c1c', // red
      ESEWA: '#15803d',   // green
      KHALTI: '#6d28d9',  // purple
      CONNECTIPS: '#0369a1', // blue
    };

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: qrColors[gateway] || '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating payment QR:', err));
  }, [isOpen, gateway, netAmount, tempTxnId, revenueHead]);

  if (!isOpen) return null;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim()) {
      setErrorMsg('कृपया करदाता वा संस्थाको नाम अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const payload = {
        payerName: payerName.trim(),
        payerPhone: payerPhone.trim() || undefined,
        payerPan: payerPan.trim() || undefined,
        wardNumber: Number(wardNumber) || 1,
        revenueHead,
        baseAmount,
        discountAmount,
        fineAmount,
        netAmount,
        paymentGateway: gateway,
        transactionId: `${gateway}-${tempTxnId}`,
        taxAssessmentDetails,
        description: `अनलाइन ई-भुक्तानी (${gateway}) - ${revenueHead}`,
      };

      const res = await revenueApi.verifyEPayment(payload);
      const responseData = (res as any)?.data ?? res;
      setIsProcessing(false);

      if (responseData && responseData.verified) {
        onPaymentSuccess(responseData);
      } else {
        setErrorMsg('भुक्तानी प्रमाणीकरण हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setIsProcessing(false);
      setErrorMsg(err?.response?.data?.message || 'भुक्तानी दर्तामा प्राविधिक समस्या आयो।');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
          maxWidth: '720px',
          width: '100%',
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                अनलाइन ई-भुक्तानी गेटवे (National e-Payment Switch)
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                पाँचपोखरी थाङपाल गाउँपालिका सञ्चित कोष खाता (१००% सुरक्षित भुक्तानी)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmPayment} style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Amount & Head Summary */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कर / दस्तुर शीर्षक</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{revenueHead}</div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.2rem' }}>
                मूल कर: रु. {baseAmount.toLocaleString('ne-NP')} | छुट: रु. {discountAmount.toLocaleString('ne-NP')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>दाखिला गर्नुपर्ने खुद रकम</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', lineHeight: 1.1 }}>
                रु. {netAmount.toLocaleString('ne-NP')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                Ref: {tempTxnId}
              </div>
            </div>
          </div>

          {/* Gateway Selector Radio Cards */}
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
            भुक्तानी माध्यम छनोट गर्नुहोस् (Select Payment Gateway):
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Fonepay (Nepal QR) */}
            <div
              onClick={() => setGateway('FONEPAY')}
              style={{
                border: `2px solid ${gateway === 'FONEPAY' ? '#dc2626' : '#e2e8f0'}`,
                backgroundColor: gateway === 'FONEPAY' ? '#fef2f2' : '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                FP
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Fonepay QR</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>सबै मोबाइल बैंकिङ्ग</div>
            </div>

            {/* eSewa */}
            <div
              onClick={() => setGateway('ESEWA')}
              style={{
                border: `2px solid ${gateway === 'ESEWA' ? '#16a34a' : '#e2e8f0'}`,
                backgroundColor: gateway === 'ESEWA' ? '#f0fdf4' : '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                eS
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>eSewa</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>डिजिटल वालेट</div>
            </div>

            {/* Khalti */}
            <div
              onClick={() => setGateway('KHALTI')}
              style={{
                border: `2px solid ${gateway === 'KHALTI' ? '#7c3aed' : '#e2e8f0'}`,
                backgroundColor: gateway === 'KHALTI' ? '#f5f3ff' : '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                Kh
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Khalti</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>डिजिटल वालेट</div>
            </div>

            {/* ConnectIPS */}
            <div
              onClick={() => setGateway('CONNECTIPS')}
              style={{
                border: `2px solid ${gateway === 'CONNECTIPS' ? '#0284c7' : '#e2e8f0'}`,
                backgroundColor: gateway === 'CONNECTIPS' ? '#f0f9ff' : '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                IPS
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>ConnectIPS</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>नेपाल राष्ट्रिय स्वीच</div>
            </div>

            {/* Clean for Cash Wallet */}
            <div
              onClick={() => setGateway('CLEAN_CASH')}
              style={{
                border: `2px solid ${gateway === 'CLEAN_CASH' ? '#16a34a' : '#e2e8f0'}`,
                backgroundColor: gateway === 'CLEAN_CASH' ? '#f0fdf4' : '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                C4C
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Clean for Cash</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>फोहोरबाट मोहर वालेट</div>
            </div>
          </div>

          {/* Two Columns: Payer Information (Left) + Interactive QR & Scan (Right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              alignItems: 'start',
              marginBottom: '1.25rem',
            }}
          >
            {/* Payer Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  करदाता वा संस्थाको नाम (Payer Name)*
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
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
                    सम्पर्क फोन (Phone)
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
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
                    वडा नं. (Ward)
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
                  स्थायी लेखा नम्बर (PAN - ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={payerPan}
                  onChange={(e) => setPayerPan(e.target.value)}
                  placeholder="६०१२३४५६७"
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

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>कारोबार संकेत: <strong>{gateway}-{tempTxnId}</strong></span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${gateway}-${tempTxnId}`)}
                  style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {copiedTxn ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedTxn ? 'कपी भयो' : 'कपी'}</span>
                </button>
              </div>
            </div>

            {/* QR Code & Direct Scan instructions or Clean for Cash Wallet */}
            {gateway === 'CLEAN_CASH' ? (
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #16a34a',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ marginBottom: '0.75rem', color: '#4ade80' }}>
                  <Shield size={40} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>वालेट ब्यालेन्स</h4>
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>हालको ब्यालेन्स:</span>
                  <span style={{ color: '#22c55e', fontSize: '1.15rem', fontWeight: 800 }}>रु. २,५००</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  भुक्तानी गर्दा तपाईंको वालेटबाट रु. {netAmount.toLocaleString('ne-NP')} सीधै कट्टा हुनेछ।
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  {gateway === 'FONEPAY' && 'नेपाल पे (Fonepay QR) स्क्यान गर्नुहोस्'}
                  {gateway === 'ESEWA' && 'eSewa स्क्यान गर्नुहोस्'}
                  {gateway === 'KHALTI' && 'Khalti स्क्यान गर्नुहोस्'}
                  {gateway === 'CONNECTIPS' && 'ConnectIPS QR स्क्यान गर्नुहोस्'}
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Payment QR" style={{ width: '170px', height: '170px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrIcon size={48} color="#94a3b8" />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.725rem', color: '#64748b', lineHeight: 1.4 }}>
                  १. आफ्नो वालेट वा मोबाइल बैंकिङ्ग एप खोल्नुहोस्<br />
                  २. माथिको क्युआर स्क्यान गरी रु. <strong>{netAmount.toLocaleString('ne-NP')}</strong> भुक्तानी गर्नुहोस्
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#475569',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: '0.65rem 1.75rem',
                backgroundColor: isProcessing ? '#0d9488' : '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>प्रमाणीकरण तथा रसिद सृजना हुँदैछ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>भुक्तानी सम्पन्न भयो, मलेप १०२ रसिद जारी गर्नुहोस्</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
