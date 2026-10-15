export interface DocumentArchiveItem {
  id: string;
  tenantId?: string;
  title: string;
  fiscalYear: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  extractionsCount?: number;
  extractions?: DocumentExtractionItem[];
}

export interface DocumentExtractionItem {
  id: string;
  tenantId?: string;
  documentId?: string;
  category: string;
  extractedData: string;
  pageNumber: number;
  status: 'Pending Verification' | 'Verified' | 'Published' | string;
  extractedAt: string;
  document?: {
    id: string;
    title: string;
    fiscalYear: string;
    fileUrl: string;
    fileName: string;
  } | null;
}

export interface DocumentStats {
  totalDocuments: number;
  totalExtractions: number;
  verifiedExtractions: number;
  publishedExtractions: number;
  pendingVerification: number;
  ocrAccuracyRate: number;
  categoryBreakdown: Record<string, number>;
  fiscalYearBreakdown: Record<string, number>;
  ocrEngine: string;
  lastExtractionTimestamp: string;
}

export interface BaselineIndicator {
  id: string;
  category: string;
  nameNp: string;
  nameEn: string;
  value: string;
  unit: string;
  fiscalYear: string;
  sourceDocument: {
    id?: string | null;
    title: string;
    fileUrl: string;
  };
  verificationStatus: string;
  extractedTextSnippet: string;
}
