import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Share2,
  ExternalLink,
  Award
} from 'lucide-react';
import { RevenueRecord } from '../../../api/revenue';
import { DigitalSignatureBadge } from '../../../components/common/DigitalSignatureBadge';
import { numberToNepaliWords, toNepaliDigits } from '../utils/nepaliCurrencyWords';

interface MalepaReceiptModalProps {
  receipt: RevenueRecord | null;
  isOpen: boolean;
  onClose: () => void;
  isDirectVerification?: boolean;
}

export const MalepaReceiptModal: React.FC<MalepaReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  isDirectVerification = false,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const receiptNumber = receipt?.receiptNo || receipt?.receiptNumber || 'P5-REV-2081-00001';
  const totalPaid = Number(receipt?.amount || receipt?.totalAmount || 0);
  const baseAmount = Number(receipt?.baseAmount || totalPaid);
  const discountAmount = Number(receipt?.discountAmount || 0);
  const fineAmount = Number(receipt?.fineAmount || 0);

  useEffect(() => {
    if (!receipt || !isOpen) return;

    const verifyUrl = `${window.location.origin}/revenue?verify=${encodeURIComponent(receiptNumber)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating receipt verification QR:', err));
  }, [receipt, isOpen, receiptNumber]);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #malepa-receipt-printable, #malepa-receipt-printable * {
            visibility: visible !important;
          }
          #malepa-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            border: none !important;
            box-shadow: none !important;
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
          maxWidth: '680px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid #cbd5e1',
          position: 'relative',
        }}
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#5eead4" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              आधिकारिक डिजिटल कर रसिद (मलेप फारम १०२)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Verification Success Toast if opened via URL */}
        {isDirectVerification && (
          <div
            className="no-print"
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#065f46',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>✓ राष्ट्रिय डिजिटल अभिलेखबाट आधिकारिक रूपमा प्रमाणित कर रसिद</span>
          </div>
        )}

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div
          ref={receiptRef}
          id="malepa-receipt-printable"
          style={{
            padding: '1.75rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header Section */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #0f766e',
              paddingBottom: '0.75rem',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
              अनुसूची-२ (नियम ६ सँग सम्बन्धित)
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
              नेपाल सरकार / बागमती प्रदेश सरकार
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', margin: '0.15rem 0' }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
              गाउँ कार्यपालिकाको कार्यालय
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', marginTop: '0.2rem' }}>
              राजस्व तथा आन्तरिक लेखा शाखा
            </div>

            <div
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.25rem 1rem',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#042f2e',
              }}
            >
              स्थानीय कर तथा राजस्व आम्दानी रसिद (मलेप फारम नं. १०२)
            </div>
          </div>

          {/* Receipt Meta (2 columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: '1rem',
              fontSize: '0.825rem',
              lineHeight: 1.6,
              marginBottom: '1rem',
              backgroundColor: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div>
                <strong>करदाताको नाम:</strong>{' '}
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {receipt.payerName}
                </span>
              </div>
              <div>
                <strong>स्थायी लेखा नं (PAN):</strong> {receipt.payerPan || 'उल्लेख नभएको'}
              </div>
              <div>
                <strong>सम्पर्क फोन:</strong> {receipt.payerPhone || 'उल्लेख नभएको'}
              </div>
              <div>
                <strong>ठेगाना:</strong> वडा नं. {receipt.wardNumber || 1}, पाँचपोखरी थाङपाल गाउँपालिका
              </div>
            </div>

            <div>
              <div>
                <strong>रसिद नम्बर:</strong>{' '}
                <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 800 }}>
                  {receiptNumber}
                </span>
              </div>
              <div>
                <strong>आर्थिक वर्ष:</strong> {receipt.fiscalYear || '२०८१/०८२'}
              </div>
              <div>
                <strong>दाखिला मिति:</strong> {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString('ne-NP') : '२०८१/११/०४'}
              </div>
              <div>
                <strong>भुक्तानी माध्यम:</strong>{' '}
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {receipt.paymentGateway || receipt.paymentMethod || 'e-Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              border: '1px solid #cbd5e1',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.5rem', textAlign: 'center', width: '40px' }}>क्र.सं.</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>कर / आम्दानीको शीर्षक तथा विवरण</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>मूल रकम (रु.)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>छुट (रु.)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>जरिवाना (रु.)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>खुद रकम (रु.)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>१</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>
                  <strong style={{ color: '#0f172a' }}>
                    {receipt.revenueHead || receipt.type || 'सम्पत्ति कर'}
                  </strong>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    {receipt.description || 'स्थानीय सरकार सञ्चालन ऐन, २०७४ बमोजिम कर दाखिला'}
                  </div>
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontFamily: 'monospace' }}>
                  {baseAmount.toLocaleString('ne-NP')}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#15803d', fontFamily: 'monospace' }}>
                  {discountAmount > 0 ? `-${discountAmount.toLocaleString('ne-NP')}` : '०'}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#dc2626', fontFamily: 'monospace' }}>
                  {fineAmount > 0 ? fineAmount.toLocaleString('ne-NP') : '०'}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#0f766e', fontFamily: 'monospace' }}>
                  {totalPaid.toLocaleString('ne-NP')}
                </td>
              </tr>
              {/* Grand Total Row */}
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                <td colSpan={2} style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                  जम्मा दाखिला भएको खुद रकम:
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontFamily: 'monospace' }}>
                  रु. {baseAmount.toLocaleString('ne-NP')}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#15803d', fontFamily: 'monospace' }}>
                  रु. {discountAmount.toLocaleString('ne-NP')}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#dc2626', fontFamily: 'monospace' }}>
                  रु. {fineAmount.toLocaleString('ne-NP')}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontSize: '1rem', color: '#0f766e', fontFamily: 'monospace' }}>
                  रु. {totalPaid.toLocaleString('ne-NP')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Words Section */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
            }}
          >
            <strong>अक्षरेपी:</strong> {numberToNepaliWords(totalPaid)}
          </div>

          {/* E-Payment Audit Trail Box */}
          {receipt.transactionId && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#475569',
                backgroundColor: '#f1f5f9',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span>कारोबार संकेत (Txn ID): <strong style={{ fontFamily: 'monospace', color: '#0f766e' }}>{receipt.transactionId}</strong></span>
              <span>स्वीच गेटवे: <strong>{receipt.paymentGateway === 'CLEAN_CASH' ? 'फोहोरबाट मोहर (Clean for Cash)' : (receipt.paymentGateway || 'NCHL/Fonepay')}</strong></span>
              <span style={{ color: '#15803d', fontWeight: 700 }}>स्थिति: प्रमाणीकरण सम्पन्न (PAID)</span>
            </div>
          )}

          {/* Footer: QR Code + Digital Signature + Official Seal */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr 140px',
              gap: '1rem',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
            }}
          >
            {/* Online Verification QR */}
            <div style={{ textAlign: 'center' }}>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Verify QR"
                  style={{ width: '90px', height: '90px', display: 'block', margin: '0 auto' }}
                />
              ) : (
                <div style={{ width: '90px', height: '90px', backgroundColor: '#f1f5f9' }} />
              )}
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '3px' }}>
                स्क्यान गरी अनलाइन रसिद प्रमाणीकरण गर्नुहोस्
              </div>
            </div>

            {/* Digital Signature Badge */}
            <div>
              <DigitalSignatureBadge
                signatoryName="प्रकाश श्रेष्ठ"
                designation="राजस्व तथा आन्तरिक लेखा अधिकृत"
                documentTitle="स्थानीय कर तथा राजस्व आम्दानी रसिद (मलेप १०२)"
                documentNumber={receiptNumber}
                signatureId={`NITC-P5-REV-${receiptNumber}`}
              />
            </div>

            {/* Palika Seal Stamp Graphic */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '95px',
                  height: '95px',
                  borderRadius: '50%',
                  border: '2px solid #b91c1c',
                  color: '#b91c1c',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  margin: '0 auto',
                  transform: 'rotate(-10deg)',
                  boxShadow: 'inset 0 0 0 2px #b91c1c',
                  padding: '4px',
                  opacity: 0.9,
                }}
              >
                <div style={{ fontSize: '0.6rem' }}>पाँचपोखरी थाङपाल</div>
                <div style={{ fontSize: '0.55rem', borderTop: '1px solid #b91c1c', borderBottom: '1px solid #b91c1c', margin: '2px 0' }}>
                  गाउँ कार्यपालिका
                </div>
                <div style={{ fontSize: '0.6rem' }}>राजस्व प्रमाणित</div>
                <div style={{ fontSize: '0.55rem' }}>२०८१/८२</div>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#b91c1c', fontWeight: 700, marginTop: '3px' }}>
                आधिकारिक डिजिटल छाप
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderBottomLeftRadius: '15px',
            borderBottomRightRadius: '15px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#ffffff',
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
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '0.55rem 1.5rem',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)',
            }}
          >
            <Printer size={16} />
            <span>मलेप रसिद प्रिन्ट / PDF डाउनलोड</span>
          </button>
        </div>
      </div>
    </div>
  );
};
