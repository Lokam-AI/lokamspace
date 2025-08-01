export interface ClientDetails {
  customerName: string;
  customerPhone: string;
  serviceAdvisorName: string;
  serviceType: string;
  lastServiceComment: string;
}

export interface OrganizationDetails {
  organizationName: string;
  organizationDescription: string;
  serviceCentreDescription: string;
  location: string;
  googleReviewLink: string;
  areasToFocus: string;
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
    client_details: Partial<ClientDetails>;
    organization_details: Partial<OrganizationDetails>;
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