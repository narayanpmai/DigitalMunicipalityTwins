from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class RevenueSchema(BaseModel):
    id: str
    receiptNo: Optional[str] = None
    receiptNumber: Optional[str] = None
    type: str = 'tax'
    payerName: str
    payerPhone: Optional[str] = None
    payerPan: Optional[str] = None
    wardNumber: Optional[int] = None
    baseAmount: Optional[float] = 0
    fineAmount: Optional[float] = 0
    discountAmount: Optional[float] = 0
    amount: float
    totalAmount: Optional[float] = None
    paymentMethod: str = 'CASH'
    paymentStatus: str = 'PAID'
    transactionId: Optional[str] = None
    paymentGateway: Optional[str] = None
    qrVerificationUrl: Optional[str] = None
    taxAssessmentDetails: Optional[str] = None
    fiscalYear: str = '२०८१/०८२'
    revenueHead: Optional[str] = None
    description: Optional[str] = None
    collectedBy: Optional[str] = None
    collectedAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class RevenueCreate(BaseModel):
    payerName: str
    payerPhone: Optional[str] = None
    payerPan: Optional[str] = None
    type: str = 'tax'
    wardNumber: Optional[int] = None
    baseAmount: float = 0
    fineAmount: float = 0
    discountAmount: float = 0
    amount: float
    totalAmount: Optional[float] = None
    paymentMethod: str = 'CASH'
    paymentStatus: str = 'PAID'
    paymentGateway: Optional[str] = None
    transactionId: Optional[str] = None
    revenueHead: Optional[str] = None
    fiscalYear: str = '२०८१/०८२'
    description: Optional[str] = None
    collectedBy: Optional[str] = None
    taxAssessmentDetails: Optional[Any] = None


class TaxCalculationRequest(BaseModel):
    taxCategory: Optional[str] = 'property'
    landAreaRopani: Optional[float] = 0
    landAreaAana: Optional[float] = 0
    landAreaPaisa: Optional[float] = 0
    landAreaDaam: Optional[float] = 0
    kittaNo: Optional[str] = None
    wardNumber: Optional[int] = None
    charkillaEast: Optional[str] = None
    charkillaWest: Optional[str] = None
    charkillaNorth: Optional[str] = None
    charkillaSouth: Optional[str] = None
    roadAccess: Optional[str] = 'branch'
    structureType: Optional[str] = 'rcc'
    builtAreaSqFt: Optional[float] = 0
    businessCapital: Optional[float] = 0
    businessNature: Optional[str] = None
    landGrade: Optional[str] = 'doyam'
    monthlyRent: Optional[float] = 0
    isEarlyRebateEligible: Optional[bool] = False
    delayPenaltyRatePercent: Optional[float] = 0
    payerName: Optional[str] = None
    ownerPanOrCitizenship: Optional[str] = None


class TaxCalculationBreakdown(BaseModel):
    title: str
    amount: float
    description: str


class TaxCalculationResult(BaseModel):
    taxCategory: str
    baseTax: float
    fineAmount: float
    discountAmount: float
    netPayable: float
    breakdown: List[TaxCalculationBreakdown]
    fiscalYear: str
    statutoryAct: str


class EPaymentVerificationRequest(BaseModel):
    payerName: str
    payerPhone: Optional[str] = None
    payerPan: Optional[str] = None
    wardNumber: Optional[int] = None
    revenueHead: str
    baseAmount: float
    fineAmount: Optional[float] = 0
    discountAmount: Optional[float] = 0
    netAmount: float
    paymentGateway: str
    transactionId: str
    taxAssessmentDetails: Optional[Any] = None
    description: Optional[str] = None


class RevenueStatsResponse(BaseModel):
    totalRevenue: float
    totalReceipts: int
    propertyTaxAmount: Optional[float] = None
    businessTaxAmount: Optional[float] = None
    recommendationFeeAmount: Optional[float] = None
    byType: Optional[List[Dict]] = None
    byMethod: Optional[List[Dict]] = None
    byWard: Optional[List[Dict]] = None
