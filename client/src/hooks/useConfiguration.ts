import { useState } from "react";
import { ClientDetails, OrganizationDetails, KnowledgeFile, HttpHeader, SectionExpansion, WebhookConfiguration } from "@/types/apiConfig";
import { toast } from "@/components/ui/use-toast";

const defaultClientDetails: ClientDetails = {
  customerName: "",
  customerPhone: "",
  serviceAdvisorName: "",
  serviceType: "",
  lastServiceComment: ""
};

const defaultOrganizationDetails: OrganizationDetails = {
  organizationName: "",
  organizationDescription: "",
  serviceCentreDescription: "",
  location: "",
  googleReviewLink: "",
  areasToFocus: ""
};

const defaultWebhookConfiguration: WebhookConfiguration = {
  serverUrl: "",
  secretToken: "",
  timeout: "20",
  httpHeaders: []
};

const defaultSectionExpansion: SectionExpansion = {
  apiKeys: false,
  webhookConfiguration: false,
  clientDetails: false,
  organizationDetails: false,
  knowledgeFiles: false
};

export const useConfiguration = () => {
  const [clientDetails, setClientDetails] = useState<ClientDetails>(defaultClientDetails);
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails>(defaultOrganizationDetails);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfiguration>(defaultWebhookConfiguration);
  const [expandedSections, setExpandedSections] = useState<SectionExpansion>(defaultSectionExpansion);

  const toggleSection = (section: keyof SectionExpansion) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateClientDetails = (updates: Partial<ClientDetails>) => {
    setClientDetails(prev => ({ ...prev, ...updates }));
  };

  const updateOrganizationDetails = (updates: Partial<OrganizationDetails>) => {
    setOrganizationDetails(prev => ({ ...prev, ...updates }));
  };

  const updateWebhookConfig = (updates: Partial<WebhookConfiguration>) => {
    setWebhookConfig(prev => ({ ...prev, ...updates }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      }));
      setKnowledgeFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) have been uploaded successfully.`
      });
    }
  };

  const removeKnowledgeFile = (index: number) => {
    setKnowledgeFiles(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "Knowledge file has been removed."
    });
  };

  const addHttpHeader = (key: string, value: string) => {
    if (key.trim() && value.trim()) {
      setWebhookConfig(prev => ({
        ...prev,
        httpHeaders: [...prev.httpHeaders, { key: key.trim(), value: value.trim() }]
      }));
      toast({
        title: "Header added",
        description: "HTTP header has been added successfully."
      });
      return true;
    }
    return false;
  };

  const removeHttpHeader = (index: number) => {
    setWebhookConfig(prev => ({
      ...prev,
      httpHeaders: prev.httpHeaders.filter((_, i) => i !== index)
    }));
    toast({
      title: "Header removed",
      description: "HTTP header has been removed."
    });
  };

  const updateHttpHeader = (index: number, key: string, value: string) => {
    setWebhookConfig(prev => ({
      ...prev,
      httpHeaders: prev.httpHeaders.map((header, i) => 
        i === index ? { key, value } : header
      )
    }));
  };

  const resetConfiguration = () => {
    setClientDetails(defaultClientDetails);
    setOrganizationDetails(defaultOrganizationDetails);
    setKnowledgeFiles([]);
    setWebhookConfig(defaultWebhookConfiguration);
    setExpandedSections(defaultSectionExpansion);
  };

  // Initialize with default values
  const initializeWithDefaults = (defaults: {
    clientDetails?: Partial<ClientDetails>;
    organizationDetails?: Partial<OrganizationDetails>;
  }) => {
    if (defaults.clientDetails) {
      setClientDetails(prev => ({ ...prev, ...defaults.clientDetails }));
    }
    
    if (defaults.organizationDetails) {
      setOrganizationDetails(prev => ({ ...prev, ...defaults.organizationDetails }));
    }
  };

  return {
    // State
    clientDetails,
    organizationDetails,
    knowledgeFiles,
    webhookConfig,
    expandedSections,
    
    // Actions
    toggleSection,
    updateClientDetails,
    updateOrganizationDetails,
    updateWebhookConfig,
    handleFileUpload,
    removeKnowledgeFile,
    addHttpHeader,
    removeHttpHeader,
    updateHttpHeader,
    resetConfiguration,
    initializeWithDefaults
  };
};