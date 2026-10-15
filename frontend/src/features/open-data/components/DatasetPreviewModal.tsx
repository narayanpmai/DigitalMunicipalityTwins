import React from 'react';
import { X, Download, FileSpreadsheet, FileJson, CheckCircle2, ShieldCheck, Database, Calendar, Building, Layers } from 'lucide-react';
import type { OpenDataRecord } from '../../../types/open-data';

interface DatasetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OpenDataRecord | null;
  onDownload: (record: OpenDataRecord, format: 'csv' | 'json') => void;
}

export const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
  onDownload,
}) => {
  if (!isOpen || !record) return null;

  const sampleData = Array.isArray(record.sampleData) ? record.sampleData : [];
  const columns = record.columnsSchema && Array.isArray(record.columnsSchema) && record.columnsSchema.length > 0
    ? record.columnsSchema
    : sampleData.length > 0 && typeof sampleData[0] === 'object'
    ? Object.keys(sampleData[0]).map(key => ({ field: key, type: typeof sampleData[0][key], description: key }))
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
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
          borderRadius: '16px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                {record.subCategory || record.category}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                }}
              >
                {record.fiscalYear}
              </span>
              {record.wardNumber > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                  }}
                >
                  वडा नं. {record.wardNumber}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.35 }}>
              {record.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#e2e8f0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Metadata Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>जिम्मेवार शाखा / निकाय</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {record.authorOrDepartment || 'गाउँ कार्यपालिकाको कार्यालय'}
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>अनुक्रमणिका लगत सङ्ख्या</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginTop: '0.2rem' }}>
                {record.recordsCount || sampleData.length || '—'} रेकर्डहरू
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>खुला इजाजतपत्र (License)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={16} />
                <span>{record.license || 'CC-BY-SA 4.0'}</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल डाउनलोड सङ्ख्या</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d97706', marginTop: '0.2rem' }}>
                {record.downloadCount || 0} पटक
              </div>
            </div>
          </div>

          {/* Description */}
          {record.description && (
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', fontSize: '0.875rem', color: '#0369a1', lineHeight: 1.6 }}>
              <strong>विवरण:</strong> {record.description}
            </div>
          )}

          {/* Sample Data Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} color="#0284c7" />
                <span>डेटा पूर्वावलोकन (Data Preview)</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {sampleData.length > 0 ? `प्रदर्शन: ${sampleData.length} नमुना पंक्तिहरू` : 'डेटा नमुना उपलब्ध छैन'}
              </span>
            </div>

            {sampleData.length > 0 && columns.length > 0 ? (
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', maxHeight: '320px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#475569', width: '50px' }}>#</th>
                      {columns.map((col, idx) => (
                        <th key={idx} style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                          <div>{col.description || col.field}</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>{col.field}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        }}
                      >
                        <td style={{ padding: '0.6rem 0.85rem', color: '#64748b', fontWeight: 600 }}>{rIdx + 1}</td>
                        {columns.map((col, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.6rem 0.85rem', color: '#334155' }}>
                            {typeof row[col.field] === 'boolean'
                              ? (row[col.field] ? 'हो (Yes)' : 'होइन (No)')
                              : typeof row[col.field] === 'object'
                              ? JSON.stringify(row[col.field])
                              : String(row[col.field] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  color: '#64748b',
                  fontSize: '0.875rem',
                }}
              >
                यो डेटासेटमा संरचित नमुना तालिका उपलब्ध छैन। पूर्ण फाइल तल दिइएका बटनबाट डाउनलोड गर्नुहोस्।
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>पाँचपोखरी डिजिटल ट्विन खुला डाटा इन्जिनद्वारा प्रमाणीकृत</span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => onDownload(record, 'json')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <FileJson size={16} color="#0284c7" />
              <span>JSON डाउनलोड</span>
            </button>

            <button
              onClick={() => onDownload(record, 'csv')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              <FileSpreadsheet size={16} />
              <span>CSV डाउनलोड</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
