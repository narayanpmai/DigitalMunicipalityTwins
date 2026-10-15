import { api, apiClient } from './client';
import type {
  DocumentArchiveItem,
  DocumentExtractionItem,
  DocumentStats,
  BaselineIndicator,
} from '../types/document';

export const documentsApi = {
  // ── 1. ARCHIVED DOCUMENTS ────────────────────────────────────────────────
  getAll: (params?: { fiscalYear?: string; search?: string; limit?: number }): Promise<DocumentArchiveItem[]> => {
    return api.get<DocumentArchiveItem[]>('/documents', { params });
  },

  getById: (id: string): Promise<DocumentArchiveItem> => {
    return api.get<DocumentArchiveItem>(`/documents/${id}`);
  },

  create: (payload: Partial<DocumentArchiveItem>): Promise<DocumentArchiveItem> => {
    return api.post<DocumentArchiveItem>('/documents', payload);
  },

  delete: (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/documents/${id}`);
  },

  getStats: (): Promise<DocumentStats> => {
    return api.get<DocumentStats>('/documents/stats');
  },

  // ── 2. OCR EXTRACTIONS ───────────────────────────────────────────────────
  getExtractions: (params?: {
    status?: string;
    category?: string;
    documentId?: string;
    search?: string;
    limit?: number;
  }): Promise<DocumentExtractionItem[]> => {
    return api.get<DocumentExtractionItem[]>('/documents/extractions', { params });
  },

  verifyExtraction: (id: string): Promise<{ message: string; extraction: DocumentExtractionItem }> => {
    return api.put<{ message: string; extraction: DocumentExtractionItem }>(`/documents/extractions/${id}/verify`, {});
  },

  publishExtraction: (
    id: string,
    payload?: { nameNp?: string; value?: number; fiscalYear?: string; category?: string }
  ): Promise<{ message: string; extraction: DocumentExtractionItem; publishedData: any }> => {
    return api.post<{ message: string; extraction: DocumentExtractionItem; publishedData: any }>(
      `/documents/extractions/${id}/publish`,
      payload
    );
  },

  uploadDocument: (formData: FormData): Promise<{ message: string; document: DocumentArchiveItem; extractionId: string }> => {
    return apiClient
      .post<{ message: string; document: DocumentArchiveItem; extractionId: string }>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  // ── 3. BASELINE INDICATORS ───────────────────────────────────────────────
  getIndicators: (params?: { fiscalYear?: string }): Promise<BaselineIndicator[]> => {
    return api.get<BaselineIndicator[]>('/documents/indicators', { params });
  },
};

export default documentsApi;
