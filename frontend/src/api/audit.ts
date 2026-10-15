import { api } from './client';
import type {
  AuditLog,
  AuditStats,
  SecurityOverview,
  SecAuditLog,
  SecurityRole,
  SecurityUser,
  AIPromptLog,
  AIKnowledgeDoc,
  AIStats,
} from '../types/admin';

export const auditApi = {
  // ── 1. AUDIT LOGS ──────────────────────────────────────────────────────────
  getAll: (params?: {
    action?: string;
    entityType?: string;
    userId?: string;
    search?: string;
    success?: boolean;
    limit?: number;
  }): Promise<AuditLog[]> => {
    return api.get<AuditLog[]>('/audits', { params });
  },

  getById: (id: string): Promise<AuditLog> => {
    return api.get<AuditLog>(`/audits/${id}`);
  },

  getStats: (): Promise<AuditStats> => {
    return api.get<AuditStats>('/audits/stats');
  },

  // ── 2. SECURITY POSTURE & ACCESS LOGS ──────────────────────────────────────
  getSecurityOverview: (): Promise<SecurityOverview> => {
    return api.get<SecurityOverview>('/audits/security-overview');
  },

  getSecLogs: (params?: {
    action?: string;
    resourceType?: string;
    userId?: string;
    limit?: number;
  }): Promise<SecAuditLog[]> => {
    return api.get<SecAuditLog[]>('/audits/sec-logs', { params });
  },

  getRolesSummary: (): Promise<{ roles: SecurityRole[]; users: SecurityUser[] }> => {
    return api.get<{ roles: SecurityRole[]; users: SecurityUser[] }>('/audits/roles-summary');
  },

  getExportUrl: (params?: { action?: string; entityType?: string }): string => {
    const query = new URLSearchParams();
    if (params?.action && params.action !== 'all') query.append('action', params.action);
    if (params?.entityType && params.entityType !== 'all') query.append('entityType', params.entityType);
    const qs = query.toString();
    return `/api/v1/audits/export${qs ? `?${qs}` : ''}`;
  },

  // ── 3. AI ASSISTANT ACTIVITY & KNOWLEDGE BASE ──────────────────────────────
  getAiLogs: (params?: { skip?: number; limit?: number }): Promise<AIPromptLog[]> => {
    return api.get<AIPromptLog[]>('/ai-assistant/logs-detailed', { params });
  },

  getAiKnowledgeBase: (): Promise<AIKnowledgeDoc[]> => {
    return api.get<AIKnowledgeDoc[]>('/ai-assistant/knowledge-base');
  },

  getAiStats: (): Promise<AIStats> => {
    return api.get<AIStats>('/ai-assistant/stats');
  },
};

export default auditApi;
