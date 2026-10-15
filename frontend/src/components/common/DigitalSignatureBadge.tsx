import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, FileText, QrCode, Lock, X } from 'lucide-react';

interface DigitalSignatureBadgeProps {
  signatoryName: string;
  designation: string;
  signatureId?: string;
  timestampBs?: string;
  documentTitle?: string;
  documentNumber?: string;
  verified?: boolean;
  style?: React.CSSProperties;
}

export const DigitalSignatureBadge: React.FC<DigitalSignatureBadgeProps> = ({
  signatoryName,
  designation,
  signatureId = 'NITC-PK-2081-SIG-84920A',
  timestampBs = '२०८१-०९-१४ १२:३०:४५',
  documentTitle = 'आधिकारिक पालिका अभिलेख',
  documentNumber = 'DT-DOC-2081/082',
  verified = true,
  style,
}) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowVerifyModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          backgroundColor: '#f0fdf4',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(22, 101, 52, 0.08)',
          ...style,
        }}
        title="डिजिटल हस्ताक्षर प्रमाणीकरण हेर्नुहोस्"
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={16} />
        </div>

        <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>डिजिटल हस्ताक्षरित</span>
            <CheckCircle size={11} color="#16a34a" />
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
            {signatoryName}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {designation}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    डिजिटल हस्ताक्षर प्रमाणीकरण
                  </h4>
                  <small style={{ color: '#15803d', fontWeight: 600 }}>
                    ✓ राष्ट्रिय सूचना प्रविधि केन्द्र (NITC) मापदण्ड
                  </small>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Verification Success Box */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <CheckCircle size={18} color="#16a34a" />
                <strong style={{ color: '#166534', fontSize: '0.9rem' }}>प्रमाणित तथा आधिकारिक अभिलेख</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                यो कागजात पालिकाको आधिकारिक डिजिटल ट्विन डाटाबेसमा सुरक्षित रूपमा दर्ता रहेको छ र कुनै पनि सम्पादन नगरिएको प्रमाणित हुन्छ।
              </p>
            </div>

            {/* Details Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>कागजात शीर्षक:</span>
                <strong style={{ color: '#0f172a' }}>{documentTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>दर्ता / संकेत नं:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>{documentNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>हस्ताक्षरकर्ता:</span>
                <strong style={{ color: '#0f172a' }}>{signatoryName} ({designation})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>हस्ताक्षर समय (वि.सं.):</span>
                <span style={{ color: '#334155' }}>{timestampBs}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>क्रिप्टोग्राफिक Signature ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>{signatureId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
                <span style={{ color: '#64748b' }}>प्रमाणीकरण अवस्था:</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                  VALID (सत्य)
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
