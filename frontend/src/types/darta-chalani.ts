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
  dispatchNo?: string;
  chalaniDateBs: string;
  dispatchDate?: string;
  recipientOrganization: string;
  receiverName?: string;
  subject: string;
  department: string;
  senderOfficial: string;
  signedBy?: string;
  fiscalYear: string;
  documentUrl?: string;
  remarks?: string;
  status: 'dispatched' | 'delivered' | 'चलानी भएको';
  sourceModule?: string;
  sourceRecordId?: string;
  sourceTitle?: string;
  letterType?: string;
  verificationCode?: string;
}
