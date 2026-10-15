import React from 'react';
import { BookOpen, FileText, CheckCircle2, Clock, UploadCloud, ExternalLink, ShieldCheck } from 'lucide-react';
import type { AIKnowledgeDoc } from '../../../types/admin';

interface KnowledgeBaseTabProps {
  documents: AIKnowledgeDoc[];
  isLoading: boolean;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ documents, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <BookOpen className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#a855f7' }} />
        एआई ज्ञान भण्डार दस्तावेजहरू लोड हुँदैछ...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(88, 28, 135, 0.2))',
          borderRadius: '14px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
              एआई सहायक ज्ञान भण्डार (AI RAG Knowledge Base)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
              पाँचपोखरी थाङपाल गाउँपालिकाका ऐन, नियम, कार्यविधि तथा राजपत्रहरू भेक्टर इन्डेक्सिङ गरी सुरक्षित गरिएको।
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            ८ वटा दस्तावेज पूर्ण इन्डेक्स (100% Vectorized)
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {documents.map((doc, idx) => (
          <div
            key={doc.id || idx}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.85rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      doc.documentType === 'Act'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : doc.documentType === 'Guideline'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(168, 85, 247, 0.15)',
                    color:
                      doc.documentType === 'Act'
                        ? '#fca5a5'
                        : doc.documentType === 'Guideline'
                        ? '#7dd3fc'
                        : '#d8b4fe',
                  }}
                >
                  {doc.documentType}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#4ade80',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={13} /> {doc.indexingStatus}
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.4 }}>
                {doc.documentTitle}
              </h4>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>
                  Vector ID: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{doc.vectorReferenceId || 'vec-std'}</span>
                </div>
                <div>अपलोडकर्ता: {doc.uploadedBy}</div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <span>{doc.timestamp ? new Date(doc.timestamp).toLocaleDateString('ne-NP') : ''}</span>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                दस्तावेज हेर्नुहोस् <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
