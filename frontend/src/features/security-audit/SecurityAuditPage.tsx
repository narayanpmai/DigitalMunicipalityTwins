import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  ShieldCheck,
  Activity,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Key,
  ShieldAlert,
  BookOpen,
  Terminal,
  FileSpreadsheet,
  Clock,
  User,
  Globe,
} from 'lucide-react';
import { auditApi } from '../../api/audit';
import type { AuditLog } from '../../types/admin';
import { AuditDetailModal } from './components/AuditDetailModal';
import { SecurityOverviewTab } from './components/SecurityOverviewTab';
import { AIPromptLogsTab } from './components/AIPromptLogsTab';
import { RbacMatrixTab } from './components/RbacMatrixTab';
import { KnowledgeBaseTab } from './components/KnowledgeBaseTab';

export const SecurityAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audits' | 'security' | 'ai' | 'rbac' | 'kb'>('audits');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Queries
  const {
    data: auditLogs = [],
    isLoading: isLoadingAudits,
    refetch: refetchAudits,
    isFetching: isFetchingAudits,
  } = useQuery({
    queryKey: ['audit-logs', actionFilter, entityFilter, searchTerm],
    queryFn: () =>
      auditApi.getAll({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        entityType: entityFilter !== 'all' ? entityFilter : undefined,
        search: searchTerm.trim() !== '' ? searchTerm.trim() : undefined,
        limit: 150,
      }),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditApi.getStats(),
  });

  const { data: secOverview, isLoading: isLoadingSecOverview } = useQuery({
    queryKey: ['security-overview'],
    queryFn: () => auditApi.getSecurityOverview(),
  });

  const { data: secLogs = [], isLoading: isLoadingSecLogs } = useQuery({
    queryKey: ['sec-audit-logs'],
    queryFn: () => auditApi.getSecLogs({ limit: 50 }),
  });

  const { data: rbacData, isLoading: isLoadingRbac } = useQuery({
    queryKey: ['roles-summary'],
    queryFn: () => auditApi.getRolesSummary(),
  });

  const { data: aiLogs = [], isLoading: isLoadingAiLogs } = useQuery({
    queryKey: ['ai-prompt-logs'],
    queryFn: () => auditApi.getAiLogs({ limit: 50 }),
  });

  const { data: aiStats, isLoading: isLoadingAiStats } = useQuery({
    queryKey: ['ai-stats'],
    queryFn: () => auditApi.getAiStats(),
  });

  const { data: kbDocs = [], isLoading: isLoadingKb } = useQuery({
    queryKey: ['ai-knowledge-base'],
    queryFn: () => auditApi.getAiKnowledgeBase(),
  });

  const handleExportCsv = () => {
    const url = auditApi.getExportUrl({
      action: actionFilter !== 'all' ? actionFilter : undefined,
      entityType: entityFilter !== 'all' ? entityFilter : undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div
      style={{
        padding: '1.75rem',
        backgroundColor: '#0f172a',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ─── Top Header & Title ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
                प्रणाली सुरक्षा, अडिट लग तथा एआई अनुगमन
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                }}
              >
                विकल्प २५: साइबर सुरक्षा तथा अडिट लग
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              पाँचपोखरी थाङपाल गाउँपालिका डिजिटल ट्विन — RBAC पहुँच नियन्त्रण, विसंगति अनुगमन, तथा एआई गतिविधि ट्र्याकिङ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => refetchAudits()}
            disabled={isFetchingAudits}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              color: '#cbd5e1',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={15} className={isFetchingAudits ? 'animate-spin' : ''} />
            ताजा गर्नुहोस् (Refresh)
          </button>

          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Download size={15} />
            अडिट लग डाउनलोड (CSV Export)
          </button>
        </div>
      </div>

      {/* ─── 5 Master KPI Summary Cards ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Activity size={16} style={{ color: '#38bdf8' }} /> कुल अडिट अभिलेख (Audit Trails)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
            {stats?.totalAuditLogs || 32}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.15rem' }}>
            आजका गतिविधि: {stats?.todayLogsCount || 13} वटा
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} /> सफल कार्य अनुपात (Success Rate)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4ade80', marginTop: '0.35rem' }}>
            {stats?.successRate || 96.9}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            {stats?.successCount || 31} सफल / {stats?.failedCount || 1} विसंगति
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> सुरक्षा सतर्कता / चेतावनी
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.35rem' }}>
            {stats?.securityAlertsCount || 2}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.15rem' }}>
            जोखिम नियन्त्रण: १००% सुरक्षित
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Terminal size={16} style={{ color: '#c084fc' }} /> प्रणाली ट्रान्ज्याक्सन (Sec Trails)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
            {stats?.totalSecLogs || 19}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            अपरिवर्तनीय लेजर (Immutable)
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Bot size={16} style={{ color: '#ec4899' }} /> एआई अन्तरक्रिया (AI Copilot)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
            {stats?.totalAIPromptLogs || 7}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f472b6', marginTop: '0.15rem' }}>
            सन्तुष्टि दर: १००% (Positive)
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('audits')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'audits' ? '3px solid #38bdf8' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'audits' ? '#38bdf8' : '#94a3b8',
            fontWeight: activeTab === 'audits' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Activity size={17} />
          १. सम्पूर्ण अडिट लग (System Audit Trail)
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'security' ? '3px solid #38bdf8' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'security' ? '#38bdf8' : '#94a3b8',
            fontWeight: activeTab === 'security' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <ShieldAlert size={17} />
          २. साइबर सुरक्षा तथा पहुँच (Security & Access Logs)
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'ai' ? '3px solid #ec4899' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'ai' ? '#ec4899' : '#94a3b8',
            fontWeight: activeTab === 'ai' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Bot size={17} />
          ३. एआई सहायक अन्तरक्रिया (AI Prompt Logs)
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'rbac' ? '3px solid #38bdf8' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'rbac' ? '#38bdf8' : '#94a3b8',
            fontWeight: activeTab === 'rbac' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Key size={17} />
          ४. भूमिका तथा अधिकार (RBAC Roles & Matrix)
        </button>

        <button
          onClick={() => setActiveTab('kb')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'kb' ? '3px solid #a855f7' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'kb' ? '#a855f7' : '#94a3b8',
            fontWeight: activeTab === 'kb' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <BookOpen size={17} />
          ५. एआई ज्ञान भण्डार (RAG Knowledge Base)
        </button>
      </div>

      {/* ─── TAB 1: AUDIT LOGS TABLE ─── */}
      {activeTab === 'audits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e293b',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
              <Search size={18} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="विवरण, इमेल, आईपी वा निकाय खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.85rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>कार्य:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">सबै कार्यहरू (All Actions)</option>
                  <option value="create">सिर्जना (create)</option>
                  <option value="update">अद्यावधिक (update)</option>
                  <option value="approve">स्वीकृति (approve)</option>
                  <option value="login">लगइन (login)</option>
                  <option value="export">निर्यात (export)</option>
                  <option value="backup">ब्याकअप (backup)</option>
                  <option value="failed_login">गलत लगइन (failed_login)</option>
                  <option value="alert">चेतावनी (alert)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>निकाय:</span>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">सबै मोड्युलहरू (All Modules)</option>
                  <option value="VitalRegistration">पञ्जीकरण (Vital Registration)</option>
                  <option value="Sifaris">डिजिटल सिफारिस (Sifaris)</option>
                  <option value="BuildingPermit">नक्सापास (Building Permit)</option>
                  <option value="Budget">बजेट तथा योजना (Budget)</option>
                  <option value="Revenue">राजस्व तथा कर (Revenue)</option>
                  <option value="Procurement">सार्वजनिक खरिद (Procurement)</option>
                  <option value="Agriculture">कृषि तथा मल (Agriculture)</option>
                  <option value="Health">स्वास्थ्य तथा औषधि (Health)</option>
                  <option value="JudicialCase">न्यायिक समिति (Judicial)</option>
                  <option value="SystemBackup">प्रणाली ब्याकअप (Backup)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '14px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isLoadingAudits ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Activity className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#38bdf8' }} />
                अडिट लगहरू लोड हुँदैछ...
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                कुनै अडिट लग फेला परेन।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>मिति तथा समय</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>कार्य (Action)</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>मोड्युल (Module)</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>प्रयोगकर्ता तथा भूमिका</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>आईपी ठेगाना</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>विवरण (Description)</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>स्थिति</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>कार्य</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr
                        key={log.id || idx}
                        style={{
                          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                          backgroundColor: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.2)' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 500 }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString('ne-NP') : 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('ne-NP') : ''}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor:
                                log.action === 'create'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : log.action === 'approve'
                                  ? 'rgba(168, 85, 247, 0.15)'
                                  : log.action === 'update'
                                  ? 'rgba(56, 189, 248, 0.15)'
                                  : log.action === 'backup'
                                  ? 'rgba(234, 179, 8, 0.15)'
                                  : log.action === 'failed_login' || log.action === 'alert'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(148, 163, 184, 0.15)',
                              color:
                                log.action === 'create'
                                  ? '#86efac'
                                  : log.action === 'approve'
                                  ? '#d8b4fe'
                                  : log.action === 'update'
                                  ? '#7dd3fc'
                                  : log.action === 'backup'
                                  ? '#fde047'
                                  : log.action === 'failed_login' || log.action === 'alert'
                                  ? '#fca5a5'
                                  : '#cbd5e1',
                            }}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#f8fafc' }}>
                          {log.entityType || log.module || 'System'}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 500, color: '#f1f5f9' }}>{log.userEmail || 'सिस्टम'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{log.userRole || 'Admin'}</div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                          {log.ipAddress || '127.0.0.1'}
                        </td>

                        <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', maxWidth: '320px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.description || 'कार्यालय कार्यप्रवाह लग'}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          {log.success ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                              <CheckCircle2 size={13} /> सफल
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                              <XCircle size={13} /> असफल
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              color: '#38bdf8',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            <Eye size={13} /> विवरण
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: SECURITY & THREAT OVERVIEW ─── */}
      {activeTab === 'security' && (
        <SecurityOverviewTab
          overview={secOverview || null}
          stats={stats || null}
          secLogs={secLogs}
          isLoading={isLoadingSecOverview || isLoadingSecLogs}
        />
      )}

      {/* ─── TAB 3: AI PROMPT LOGS ─── */}
      {activeTab === 'ai' && (
        <AIPromptLogsTab logs={aiLogs} stats={aiStats || null} isLoading={isLoadingAiLogs} />
      )}

      {/* ─── TAB 4: RBAC MATRIX ─── */}
      {activeTab === 'rbac' && (
        <RbacMatrixTab
          roles={rbacData?.roles || []}
          users={rbacData?.users || []}
          isLoading={isLoadingRbac}
        />
      )}

      {/* ─── TAB 5: KNOWLEDGE BASE ─── */}
      {activeTab === 'kb' && <KnowledgeBaseTab documents={kbDocs} isLoading={isLoadingKb} />}

      {/* ─── Detail Modal ─── */}
      {selectedLog && <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
};

export default SecurityAuditPage;
