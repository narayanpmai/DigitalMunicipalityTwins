export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type ComplaintCategory =
  | 'infrastructure'
  | 'drinking_water'
  | 'electricity'
  | 'health'
  | 'education'
  | 'waste_management'
  | 'governance_corruption'
  | 'service_delay'
  | 'environment'
  | 'other';

export interface Complaint {
  id: string;
  tenantId?: string;
  complaintNo: string;
  title: string;
  description: string;
  category: ComplaintCategory | string;
  status: ComplaintStatus;
  complainantName?: string;
  complainantPhone?: string;
  complainantAddress?: string;
  isAnonymous?: boolean;
  wardNumber?: number;
  assignedTo?: string;
  assignedDepartment?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  actionTakenNotes?: string;
  resolution?: string;
  resolvedAt?: string;
  dateReportedBs?: string;
  attachmentUrl?: string;
  trackingToken?: string;
  channel?: 'web' | 'whatsapp' | 'live_chat' | 'phone' | 'counter' | string;
  whatsappSenderPhone?: string;
  whatsappMessageId?: string;
  latitude?: number;
  longitude?: number;
  sourceDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  category: string;
  complainantName?: string;
  complainantPhone?: string;
  complainantAddress?: string;
  isAnonymous?: boolean;
  wardNumber?: number;
  channel?: string;
  whatsappSenderPhone?: string;
  latitude?: number;
  longitude?: number;
}
