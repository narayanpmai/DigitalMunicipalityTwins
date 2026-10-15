import { api } from './client';

export interface RevenueRecord {
  id: string;
  receiptNo: string;
  receiptNumber?: string;
  type: string;
  payerName: string;
  payerPhone?: string;
  payerPan?: string;
  wardNumber: number;
  baseAmount?: number;
  fineAmount?: number;
  discountAmount?: number;
  amount: number;
  totalAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paymentGateway?: string;
  qrVerificationUrl?: string;
  taxAssessmentDetails?: string;
  fiscalYear: string;
  revenueHead: string;
  description?: string;
  collectedBy?: string;
  collectedAt?: string;
  createdAt: string;
}

export interface RevenueStats {
  totalRevenue: number;
  totalReceipts: number;
  propertyTaxAmount?: number;
  businessTaxAmount?: number;
  recommendationFeeAmount?: number;
  byType?: { type: string; amount: string | number; count: string | number }[];
  byMethod?: { method: string; amount: string | number; count: string | number }[];
  byWard?: { ward: number; amount: string | number; count: string | number }[];
}

export interface TaxCalculationParams {
  taxCategory?: 'property' | 'business' | 'rent' | 'land' | 'recommendation';
  landAreaRopani?: number;
  landAreaAana?: number;
  landAreaPaisa?: number;
  landAreaDaam?: number;
  kittaNo?: string;
  wardNumber?: number;
  charkillaEast?: string;
  charkillaWest?: string;
  charkillaNorth?: string;
  charkillaSouth?: string;
  roadAccess?: 'main' | 'branch' | 'trail' | 'none';
  structureType?: 'rcc' | 'semi_pakki' | 'kachhi';
  builtAreaSqFt?: number;
  businessCapital?: number;
  businessNature?: string;
  landGrade?: 'abbal' | 'doyam' | 'seem' | 'chahar';
  monthlyRent?: number;
  isEarlyRebateEligible?: boolean;
  delayPenaltyRatePercent?: number;
  payerName?: string;
  ownerPanOrCitizenship?: string;
}

export interface TaxCalculationBreakdown {
  title: string;
  amount: number;
  description: string;
}

export interface TaxCalculationResult {
  taxCategory: string;
  baseTax: number;
  fineAmount: number;
  discountAmount: number;
  netPayable: number;
  breakdown: TaxCalculationBreakdown[];
  fiscalYear: string;
  statutoryAct: string;
}

export interface EPaymentVerificationParams {
  payerName: string;
  payerPhone?: string;
  payerPan?: string;
  wardNumber?: number;
  revenueHead: string;
  baseAmount: number;
  fineAmount?: number;
  discountAmount?: number;
  netAmount: number;
  paymentGateway: 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CONNECTIPS' | 'CLEAN_CASH';
  transactionId: string;
  taxAssessmentDetails?: any;
  description?: string;
}

export const revenueApi = {
  getRevenueRecords: (params?: {
    type?: string;
    fiscalYear?: string;
    ward?: number;
    search?: string;
    paymentMethod?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.fiscalYear) query.append('fiscalYear', params.fiscalYear);
    if (params?.ward && params.ward > 0) query.append('ward', params.ward.toString());
    if (params?.paymentMethod && params.paymentMethod !== 'all') query.append('paymentMethod', params.paymentMethod);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<RevenueRecord[]>(`/revenue${qs ? `?${qs}` : ''}`);
  },

  getRevenueStats: (fiscalYear?: string) =>
    api.get<RevenueStats>(`/revenue/stats${fiscalYear ? `?fiscalYear=${fiscalYear}` : ''}`),

  getRevenueById: (id: string) => api.get<RevenueRecord>(`/revenue/${id}`),

  calculateTax: (params: TaxCalculationParams) =>
    api.post<TaxCalculationResult>('/revenue/calculate-tax', params),

  verifyEPayment: (data: EPaymentVerificationParams) =>
    api.post<RevenueRecord & { verified: boolean; message: string }>('/revenue/verify-epayment', data),

  createRevenueRecord: (data: Partial<RevenueRecord>) =>
    api.post<RevenueRecord>('/revenue', data),
};
