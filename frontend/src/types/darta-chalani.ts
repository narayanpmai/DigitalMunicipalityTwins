export type RecordType = 'darta' | 'chalani';

export interface DartaRecord {
  id: string;
  dartaNo: number;
  dartaDateBs: string;
  senderOrganization: string;
  letterNo: string;
  letterDateBs: string;
  subject: string;
  department: string;
  recipientOfficial: string;
  fiscalYear: string;
  documentUrl?: string;
  remarks?: string;
  status: 'registered' | 'forwarded' | 'completed';
}

export interface ChalaniRecord {
  id: string;
  chalaniNo: number;
  chalaniDateBs: string;
  recipientOrganization: string;
  subject: string;
  department: string;
  senderOfficial: string;
  fiscalYear: string;
  documentUrl?: string;
  remarks?: string;
  status: 'dispatched' | 'delivered';
}
