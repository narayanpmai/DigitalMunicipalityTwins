import React from 'react';
import { X, ShieldCheck, AlertTriangle, Clock, User, Globe, CheckCircle2, XCircle, Code, Copy, Check } from 'lucide-react';
import type { AuditLog } from '../../../types/admin';

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDiff = log.oldValues || log.newValues;

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
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
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
                backgroundColor: log.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: log.success ? '#22c55e' : '#ef4444',
              }}
            >
              {log.success ? <ShieldCheck size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                अडिट लग विस्तृत प्राविधिक विवरण
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Event ID: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{log.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status & Action Highlight Banner */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: log.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${log.success ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {log.success ? (
                <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              ) : (
                <XCircle size={18} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontWeight: 600, color: log.success ? '#86efac' : '#fca5a5' }}>
                {log.success ? 'कार्य सम्पन्न (Success)' : 'असफल / चेतावनी (Failed / Security Alert)'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                Action: {log.action}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                Entity: {log.entityType || log.module || 'N/A'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              कार्य विवरण (Action Description)
            </label>
            <p
              style={{
                marginTop: '0.35rem',
                fontSize: '0.95rem',
                color: '#f1f5f9',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                lineHeight: 1.5,
              }}
            >
              {log.description || 'कुनै अतिरिक्त विवरण उपलब्ध छैन।'}
            </p>
          </div>

          {/* Grid Metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                <User size={14} /> प्रयोगकर्ता / भूमिका
              </div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                {log.userEmail || 'सिस्टम प्रोसेस / अज्ञात'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>भूमिका: {log.userRole || 'Admin'}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                <Globe size={14} /> आईपी ठेगाना (IP Address)
              </div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'monospace' }}>
                {log.ipAddress || '127.0.0.1'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                निकाय आईडी: {log.entityId || 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                <Clock size={14} /> समय तथा मिति (Timestamp)
              </div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                {log.createdAt ? new Date(log.createdAt).toLocaleString('ne-NP') : 'अभिलेख नभएको'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                {log.createdAt || ''}
              </div>
            </div>
          </div>

          {/* User Agent */}
          {log.userAgent && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                क्लाइन्ट उपकरण तथा ब्राउजर (User Agent)
              </label>
              <div
                style={{
                  marginTop: '0.35rem',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#cbd5e1',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  wordBreak: 'break-all',
                }}
              >
                {log.userAgent}
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {log.errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fca5a5' }}>त्रुटि सन्देश (Error Details):</div>
              <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#fecaca', fontFamily: 'monospace' }}>
                {log.errorMessage}
              </div>
            </div>
          )}

          {/* Changes Diff (Old vs New Values) */}
          {hasDiff && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  डाटाबेसमा परिवर्तन भएका विवरणहरू (Audit Delta / Payload)
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: log.oldValues && log.newValues ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                {log.oldValues && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>पहिलाको मान (Previous State):</span>
                    <pre
                      style={{
                        margin: '0.25rem 0 0',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: '#fca5a5',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        maxHeight: '180px',
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(log.oldValues, null, 2)}
                    </pre>
                  </div>
                )}
                {log.newValues && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>परिवर्तित नयाँ मान (New State):</span>
                    <pre
                      style={{
                        margin: '0.25rem 0 0',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: '#86efac',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        maxHeight: '180px',
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(log.newValues, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            onClick={handleCopyJson}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
            {copied ? 'प्रतिलिपि गरियो (Copied)' : 'पूर्ण JSON कपी गर्नुहोस्'}
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
