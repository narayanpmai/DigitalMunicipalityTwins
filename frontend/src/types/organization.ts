export type OrgType =
  | 'ngo'
  | 'ingo'
  | 'cooperative'
  | 'club'
  | 'community'
  | 'private'
  | 'government';

export type OrgStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string; // अध्यक्ष, उपाध्यक्ष, सचिव, कोषाध्यक्ष, सदस्य
  phone?: string;
  email?: string;
  address?: string;
  citizenshipNo?: string;
  joinedDate?: string;
  termEnd?: string;
  photoUrl?: string;
}

export interface OrgRenewal {
  id: string;
  fiscalYear: string; // e.g. 2080/081
  renewalDate: string; // B.S.
  fee: number;
  receiptNo?: string;
  certificateUrl?: string;
  renewedUpTo?: string;
  validUntil?: string;
  remarks?: string;
}

export interface OrgAgreement {
  id: string;
  subject: string;
  fiscalYear: string;
  agreementDate: string;
  endDate?: string;
  totalBudget: number;
  palikaBudget?: number;
  orgBudget?: number;
  donorAgency?: string;
  firstParty?: string;
  secondParty?: string;
  status: 'active' | 'completed' | 'terminated';
  documentUrl?: string;
  terms?: string;
}

export interface OrgProgram {
  id: string;
  title: string;
  sector: string; // स्वास्थ्य, शिक्षा, कृषि, वातावरण, विपद्, पूर्वाधार, महिला/बालबालिका
  fiscalYear: string;
  budget: number;
  spentBudget?: number;
  targetWards?: number[];
  beneficiariesCount?: number;
  status: 'planning' | 'ongoing' | 'completed';
  completionDate?: string;
  reportUrl?: string;
}

export interface OrgAudit {
  id: string;
  fiscalYear: string;
  agmDate: string;
  auditorName: string;
  auditReportUrl?: string;
  taxClearanceUrl?: string;
  submissionDate?: string;
  remarks?: string;
}

export interface Organization {
  id: string;
  tenantId?: string;
  name: string;
  nameEn?: string;
  registrationNo: string;
  panNo?: string;
  type: OrgType;
  category?: string;
  wardNo?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: OrgStatus;
  establishedDate?: string;
  lastRenewalDate?: string;
  membersCount?: number;
  workingSectors?: string[];
  sector?: string;
  registrationDate?: string;
  executiveHead?: string;
  executiveContact?: string;
  committeeMembers?: CommitteeMember[];
  renewals?: OrgRenewal[];
  agreements?: OrgAgreement[];
  programs?: OrgProgram[];
  audits?: OrgAudit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationFilters {
  type?: OrgType | 'all';
  status?: OrgStatus | 'all';
  wardNo?: number | 'all';
  search?: string;
}
