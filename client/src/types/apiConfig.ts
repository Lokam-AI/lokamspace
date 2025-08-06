export interface ClientDetails {
  customerName: string;
  customerPhone: string;
  serviceAdvisorName: string;
  serviceType: string;
  lastServiceComment: string;
  vehicleInfo: string;
  appointmentDate: string;
}

export interface OrganizationDetails {
  organizationName: string;
  organizationDescription: string;
  serviceCentreDescription: string;
  location: string;
  googleReviewLink: string;
  areasToFocus: string;
}

// API format interfaces (snake_case)
export interface APIClientDetails {
  customer_name?: string | null;
  customer_phone?: string | null;
  service_advisor_name?: string | null;
  service_type?: string | null;
  last_service_comment?: string | null;
  vehicle_info?: string | null;
  appointment_date?: string | null;
}

export interface APIOrganizationDetails {
  organization_name?: string | null;
  organization_description?: string | null;
  service_centre_description?: string | null;
  location?: string | null;
  google_review_link?: string | null;
  areas_to_focus?: string | null;
}

export interface KnowledgeFile {
  name: string;
  size: string;
  type: string;
}

export interface HttpHeader {
  key: string;
  value: string;
}

export interface WebhookConfiguration {
  serverUrl: string;
  secretToken: string;
  timeout: string;
  httpHeaders: HttpHeader[];
}

export interface ConfigurationData {
  feedback_call: {
    client_details: APIClientDetails;
    organization_details: APIOrganizationDetails;
    knowledge_files: KnowledgeFile[];
    webhook_configuration: {
      server_url: string;
      timeout: number;
      http_headers: Record<string, string>;
    };
  };
}

export interface SectionExpansion {
  apiKeys: boolean;
  webhookConfiguration: boolean;
  clientDetails: boolean;
  organizationDetails: boolean;
  knowledgeFiles: boolean;
}