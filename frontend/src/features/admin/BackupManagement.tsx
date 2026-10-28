import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  ShieldCheck,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface BackupItem {
  filename: string;
  format: string;
  sizeBytes: number;
  sizeMB: number;
  createdAt: string;
  sha256: string;
  tableOfContentsEntries: number;
  status: string;
  municipality: string;
  hasUploads: boolean;
}

interface BackupListResponse {
  success: boolean;
  count: number;
  totalStorageMB: number;
  backups: BackupItem[];
}

export const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [totalStorageMB, setTotalStorageMB] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [includeSql, setIncludeSql] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastBackupResult, setLastBackupResult] = useState<BackupItem | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await axios.get<BackupListResponse>('/api/v1/system/backup/list');
      if (res.data?.success) {
        setBackups(res.data.backups || []);
        setTotalStorageMB(res.data.totalStorageMB || 0);
      }
    } catch (err: any) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    setLastBackupResult(null);

    try {
      const res = await axios.post(`/api/v1/system/backup/create?include_sql=${includeSql}`);
      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: res.data.message || 'डाटाबेस ब्याकअप सफलतापूर्वक सम्पन्न भयो!',
        });
        if (res.data.backup) {
          setLastBackupResult(res.data.backup);
        }
        await fetchBackups();
      } else {
        throw new Error(res.data?.message || 'ब्याकअप असफल भयो');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'ब्याकअप प्रक्रियाका क्रममा प्राविधिक त्रुटि भयो।';
      setStatusMessage({
        type: 'error',
        text: `त्रुटि: ${errorMsg}`,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      {/* ── Top Header & Context Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(15,23,42,0.12)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px', flex: 1 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.25)',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              flexShrink: 0,
            }}
          >
            <Database size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                डाटाबेस म्यानुअल तथा स्वचालित ब्याकअप (Database Backup)
              </h2>
              <span
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                PostGIS Live (municipal_twin_db)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
              पाँचपोखरी थाङपाल गाउँपालिकाको वास्तविक डेटा (185 तालिकाहरू, घरधुरी, GIS नक्सा, योजना, दर्ता-चलानी र अपलोड गरिएका कागजातहरू)
            </p>
          </div>
        </div>

        <button
          onClick={fetchBackups}
          disabled={loading || isBackingUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>रिफ्रेस</span>
        </button>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <HardDrive size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल ब्याकअप स्न्यापसट</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {backups.length} वटा स्न्यापसट
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>कुल भण्डारण (Storage Used)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {totalStorageMB} MB
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              flexShrink: 0,
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>स्वचालित तालिका (Scheduler)</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              राति ०१:०० AM & दिउँसो ०१:३० PM
            </div>
          </div>
        </div>
      </div>

      {/* ── Manual Backup Action Trigger Box ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '4px' }}>
              अहिले नै म्यानुअल ब्याकअप लिनुहोस् (Instant Manual Backup)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              डाटा इन्ट्री (Data Entry) गर्नुअघि वा दिनभरिको काम सकिएपछि यो बटन थिचेर ३-५ सेकेन्डभित्र नयाँ स्न्यापसट सुरक्षित गर्नुहोस्।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#475569',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={includeSql}
                onChange={(e) => setIncludeSql(e.target.checked)}
                disabled={isBackingUp}
                style={{ cursor: 'pointer' }}
              />
              <span>अतिरिक्त Plain .sql फाइल पनि समावेश गर्नुहोस्</span>
            </label>

            <button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                backgroundColor: isBackingUp ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isBackingUp ? 'not-allowed' : 'pointer',
                boxShadow: isBackingUp ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {isBackingUp ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>ब्याकअप तयार हुँदैछ...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>ब्याकअप लिनुहोस् (Backup Now)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} color="#059669" />
            ) : (
              <AlertTriangle size={18} color="#dc2626" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Latest Snapshot Success Card */}
        {lastBackupResult && (
          <div
            style={{
              marginTop: '1rem',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  ताजा स्न्यापसट: {lastBackupResult.filename}
                </strong>
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {lastBackupResult.sizeMB} MB
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                समय: {lastBackupResult.createdAt} | सत्यता: {lastBackupResult.tableOfContentsEntries} Objects | SHA-256: {lastBackupResult.sha256.substring(0, 16)}...
              </div>
            </div>

            <a
              href={`/api/v1/system/backup/download/${lastBackupResult.filename}`}
              download={lastBackupResult.filename}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
              }}
            >
              <Download size={14} />
              <span>डाउनलोड गर्नुहोस्</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Backup History Table ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} color="#2563eb" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              सुरक्षित स्न्यापसटहरूको सूची (Recent Backup Snapshots)
            </h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            पछिल्ला १४ दिनका स्न्यापसटहरू स्वतः सुरक्षित रहनेछन्
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
            ब्याकअप सूची लोड हुँदैछ...
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            अहिलेसम्म कुनै ब्याकअप फाइल फेला परेन। माथिको "ब्याकअप लिनुहोस्" बटन थिचेर पहिलो ब्याकअप लिनुहोस्।
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>फाइलको नाम</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>सिर्जना मिति तथा समय</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>साइज (Size)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>ढाँचा (Format)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>सत्यता (SHA-256)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>कार्य (Action)</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, idx) => (
                  <tr
                    key={b.filename}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
                        <span style={{ wordBreak: 'break-all' }}>{b.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>{b.createdAt}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {b.sizeMB} MB
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: b.filename.endsWith('.dump') ? '#eff6ff' : '#fef3c7',
                          color: b.filename.endsWith('.dump') ? '#1e40af' : '#92400e',
                        }}
                      >
                        {b.filename.endsWith('.dump') ? 'PostGIS Dump (.dump)' : 'Plain SQL (.sql)'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {b.sha256 && b.sha256 !== 'N/A' ? (
                        <span title={b.sha256} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} color="#059669" />
                          <span>{b.sha256.substring(0, 12)}...</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <a
                        href={`/api/v1/system/backup/download/${b.filename}`}
                        download={b.filename}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        <Download size={13} />
                        <span>डाउनलोड</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Emergency Disaster Recovery Hint ── */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '0.82rem',
          color: '#92400e',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ fontSize: '0.85rem' }}>आकस्मिक डाटा पुनःस्थापना (Disaster Recovery):</strong>
          <div style={{ marginTop: '3px', lineHeight: 1.45 }}>
            कुनै प्राविधिक समस्या भएमा टर्मिनलबाट <code>powershell -ExecutionPolicy Bypass -File scripts/restore_db.ps1</code> चलाएर कुनै पनि अघिल्लो स्न्यापसटबाट डाटा सुरक्षित रूपमा रिस्टोर गर्न सकिन्छ।
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManagement;
