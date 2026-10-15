export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'branding' | 'sms' | 'email' | 'security';
  description?: string;
  isPublic: boolean;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: string;
  entityType?: string;
  module?: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  description?: string;
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
  status?: 'success' | 'warning' | 'failed';
}

export interface AuditStats {
  totalAuditLogs: number;
  totalSecLogs: number;
  totalAIPromptLogs: number;
  todayLogsCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  securityAlertsCount: number;
  actionBreakdown: Record<string, number>;
  entityBreakdown: Record<string, number>;
  topUsers: Array<{
    userEmail: string;
    userRole: string;
    actionsCount: number;
  }>;
  systemIntegrity: string;
  lastAuditTimestamp: string;
}

export interface SecurityOverview {
  status: string;
  threatLevel: string;
  totalRolesConfigured: number;
  totalSecurityUsers: number;
  activeSecurityUsers: number;
  failedLoginAttempts24h: number;
  recentAlerts: AuditLog[];
  recentSecTrails: SecAuditLog[];
  encryptionStandard: string;
  rbacStatus: string;
  compliance: string;
}

export interface SecAuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SecurityRole {
  id: string;
  tenantId?: string;
  roleName: string;
  description: string;
  permissions: string[];
  createdAt?: string;
  usersCount?: number;
}

export interface SecurityUser {
  id: string;
  tenantId?: string;
  username: string;
  roleId: string;
  roleName?: string;
  employeeId?: string;
  wardRestriction?: number | null;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

export interface AIPromptLog {
  id: string;
  tenantId?: string;
  userId: string;
  sessionId: string;
  userPrompt: string;
  aiResponse: string;
  intentCategory: string;
  tokensUsed: number;
  userFeedback?: string | null;
  timestamp: string;
}

export interface AIKnowledgeDoc {
  id: string;
  tenantId?: string;
  documentTitle: string;
  fileUrl: string;
  documentType: string;
  indexingStatus: string;
  vectorReferenceId?: string;
  uploadedBy: string;
  timestamp: string;
}

export interface AIStats {
  totalPrompts: number;
  totalTokensConsumed: number;
  avgTokensPerQuery: number;
  positiveFeedbackCount: number;
  satisfactionRate: number;
  indexedKnowledgeDocuments: number;
  intentBreakdown: Record<string, number>;
  aiModel: string;
  avgResponseTimeSec: number;
}
