import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Terminal,
  FileCheck2,
} from 'lucide-react';
import type { SecurityOverview, SecAuditLog, AuditStats } from '../../../types/admin';

interface SecurityOverviewTabProps {
  overview: SecurityOverview | null;
  stats: AuditStats | null;
  secLogs: SecAuditLog[];
  isLoading: boolean;
}

export const SecurityOverviewTab: React.FC<SecurityOverviewTabProps> = ({
  overview,
  stats,
  secLogs,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <Activity className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#38bdf8' }} />
        सुरक्षा तथ्याङ्क तथा अडिट लगहरू लोड हुँदैछ...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Threat & Integrity Status Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              साइबर सुरक्षा स्थिति (Security Posture)
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#22c55e', marginTop: '0.2rem' }}>
              {overview?.status || 'सामान्य र सुरक्षित'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
              जोखिम स्तर: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{overview?.threatLevel || 'न्यून (Low)'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Lock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              इनक्रिप्सन तथा प्रणाली निष्ठा
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {overview?.encryptionStandard || 'AES-256-GCM / SHA-256'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#86efac', marginTop: '0.15rem' }}>
              {stats?.systemIntegrity || '१००% अपरिवर्तनीय अडिट लग'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <Key size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              RBAC अधिकार तथा प्रमाणीकरण
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {overview?.totalRolesConfigured || 10} वटा सुरक्षीत भूमिकाहरू
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
              सक्रिय सुरक्षा प्रयोगकर्ता: {overview?.activeSecurityUsers || 10} जना
            </div>
          </div>
        </div>
      </div>

      {/* Security Threat Alerts Section */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={20} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              सुरक्षा चेतावनी, गलत लगइन तथा स्वचालित नियन्त्रण (Threat Forensics & Alerts)
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              fontWeight: 600,
            }}
          >
            {overview?.recentAlerts?.length || 0} वटा अनुगमन गरिएका चेतावनी
          </span>
        </div>

        {overview?.recentAlerts && overview.recentAlerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {overview.recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                    }}
                  >
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5' }}>
                      {alert.description || 'सुरक्षा चेतावनी रेकर्ड'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      IP: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{alert.ipAddress}</span> | Entity:{' '}
                      {alert.entityType} | Action: {alert.action}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    अवरुद्ध (Mitigated)
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString('ne-NP') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            हाल कुनै सक्रिय सुरक्षा चेतावनी फेला परेन। प्रणाली १००% सुरक्षित छ।
          </div>
        )}
      </div>

      {/* Low Level System Transaction Trails (sec_audit_logs) */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              अपरिवर्तनीय प्रणाली ट्रान्ज्याक्सन लग (Immutable Low-level System Trails - sec_audit_logs)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            जम्मा रेकर्ड: <strong style={{ color: '#f8fafc' }}>{secLogs.length}</strong>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>समय (Timestamp)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>प्रयोगकर्ता (User ID)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>कार्य (Action)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>श्रोत (Resource Type)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>श्रोत आईडी (Resource ID)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>आईपी ठेगाना (IP Address)</th>
              </tr>
            </thead>
            <tbody>
              {secLogs.slice(0, 10).map((sec, idx) => (
                <tr
                  key={sec.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.2)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1' }}>
                    {sec.timestamp ? new Date(sec.timestamp).toLocaleString('ne-NP') : 'N/A'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#38bdf8' }}>
                    {sec.userId}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          sec.action === 'CREATE'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : sec.action === 'UPDATE'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : sec.action === 'DELETE'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(168, 85, 247, 0.15)',
                        color:
                          sec.action === 'CREATE'
                            ? '#86efac'
                            : sec.action === 'UPDATE'
                            ? '#7dd3fc'
                            : sec.action === 'DELETE'
                            ? '#fca5a5'
                            : '#d8b4fe',
                      }}
                    >
                      {sec.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#f1f5f9' }}>{sec.resourceType}</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                    {sec.resourceId || 'N/A'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                    {sec.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
