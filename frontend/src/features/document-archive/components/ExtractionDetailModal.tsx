import React, { useState } from 'react';
import { X, CheckCircle2, Globe, FileText, Check, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import type { DocumentExtractionItem } from '../../../types/document';

interface ExtractionDetailModalProps {
  extraction: DocumentExtractionItem | null;
  onClose: () => void;
  onVerify: (id: string) => Promise<void>;
  onPublish: (id: string) => Promise<void>;
}

export const ExtractionDetailModal: React.FC<ExtractionDetailModalProps> = ({
  extraction,
  onClose,
  onVerify,
  onPublish,
}) => {
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!extraction) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(extraction.extractedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await onVerify(extraction.id);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await onPublish(extraction.id);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                OCR निष्कर्षण विस्तृत पृष्ठ विवरण
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                विधा: <span style={{ color: '#38bdf8' }}>{extraction.category}</span> | पृष्ठ संख्या:{' '}
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{extraction.pageNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Source Document banner */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                स्रोत दस्ताबेज (Source Document):
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.15rem' }}>
                {extraction.document?.title || 'गाउँपालिका डिजिटल अभिलेख'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.1rem' }}>
                आर्थिक वर्ष: {extraction.document?.fiscalYear || '२०८१/०८२'}
              </div>
            </div>

            {extraction.document?.fileUrl && (
              <a
                href={extraction.document.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                मूल PDF फाइल हेर्नुहोस् <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* Extracted Text Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                OCR निष्कर्षण पाठ (Extracted Text Data)
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {copied ? <Check size={13} style={{ color: '#4ade80' }} /> : null}
                {copied ? 'कपी गरियो' : 'पाठ कपी गर्नुहोस्'}
              </button>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#f8fafc',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto',
                borderLeft: '4px solid #38bdf8',
              }}
            >
              {extraction.extractedData}
            </div>
          </div>

          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>हालको प्रमाणीकरण स्थिति:</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor:
                  extraction.status === 'Published'
                    ? 'rgba(56, 189, 248, 0.15)'
                    : extraction.status === 'Verified'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(234, 179, 8, 0.15)',
                color:
                  extraction.status === 'Published'
                    ? '#7dd3fc'
                    : extraction.status === 'Verified'
                    ? '#86efac'
                    : '#fde047',
              }}
            >
              {extraction.status}
            </span>
          </div>
        </div>

        {/* Footer with Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            बन्द गर्नुहोस्
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {extraction.status === 'Pending Verification' && (
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                style={{
                  backgroundColor: '#22c55e',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <CheckCircle2 size={15} /> प्रमाणित गर्नुहोस् (Verify)
              </button>
            )}

            {extraction.status === 'Verified' && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                style={{
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={15} /> आधाररेखामा प्रकाशित गर्नुहोस् (Publish)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
