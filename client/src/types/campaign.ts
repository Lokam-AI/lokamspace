export interface Campaign {
  id: string;
  name: string;
  organizationId: string;
  dateCreated: string;
  callCount?: number;
}

export interface BulkUploadData {
  file: File;
  campaignId?: string;
  defaultScheduleTime?: string;
}

export interface DemoCall {
  customerName: string;
  phoneNumber: string;
  vehicleNumber?: string;
  campaignId?: string;
  serviceType?: string;
  serviceAdvisorName?: string;
}
