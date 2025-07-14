import { API_BASE_URL, getHeaders } from "../config";

// Organization configuration settings
export const updateOrganizationConfig = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/organizations/settings`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update organization configuration");
  }

  return await response.json();
};

// Settings
export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to get settings");
  }

  return await response.json();
};

export const getSettingsByCategory = async (category?: string) => {
  const url = category
    ? `${API_BASE_URL}/settings?category=${category}`
    : `${API_BASE_URL}/settings`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to get settings");
  }

  return await response.json();
};

export const updateSettingByKey = async (
  key: string,
  value: any,
  description?: string
) => {
  const response = await fetch(`${API_BASE_URL}/settings/by-key/${key}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ value, description }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update setting with key: ${key}`);
  }

  return await response.json();
};

export const initializeSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings/initialize`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize settings");
  }

  return await response.json();
};

// Organization descriptions
export const getOrganizationDescriptions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(
        "Failed to get organization descriptions:",
        response.statusText
      );
      return {
        companyDescription: "",
        serviceCenterDescription: "",
        hipaaCompliant: false,
        pciCompliant: false,
        organizationId: "",
      };
    }

    const data = await response.json();
    return {
      companyDescription: data.description || "",
      serviceCenterDescription: data.service_center_description || "",
      hipaaCompliant: data.hipaa_compliant || false,
      pciCompliant: data.pci_compliant || false,
      organizationId: data.id || "",
    };
  } catch (error) {
    console.error("Error fetching organization descriptions:", error);
    return {
      companyDescription: "",
      serviceCenterDescription: "",
      hipaaCompliant: false,
      pciCompliant: false,
      organizationId: "",
    };
  }
};

export const updateOrganizationDescriptions = async (
  companyDescription?: string,
  serviceCenterDescription?: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/descriptions`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        company_description: companyDescription,
        service_center_description: serviceCenterDescription,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update organization descriptions:", errorData);
      throw new Error("Failed to update organization descriptions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating organization descriptions:", error);
    throw error;
  }
};

// Focus Areas
export const getFocusAreas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/focus-areas`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to get focus areas:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching focus areas:", error);
    return [];
  }
};

export const updateFocusAreas = async (focusAreas: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/focus-areas`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(focusAreas),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update focus areas:", errorData);
      throw new Error("Failed to update focus areas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating focus areas:", error);
    throw error;
  }
};

// Service Types
export const getServiceTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/service-types`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to get service types:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching service types:", error);
    return [];
  }
};

export const updateServiceTypes = async (serviceTypes: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/service-types`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(serviceTypes),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update service types:", errorData);
      throw new Error("Failed to update service types");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating service types:", error);
    throw error;
  }
};

// Inquiry Topics
export const getInquiryTopics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/inquiry-topics`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to get inquiry topics:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching inquiry topics:", error);
    return [];
  }
};

export const updateInquiryTopics = async (inquiryTopics: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/inquiry-topics`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(inquiryTopics),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update inquiry topics:", errorData);
      throw new Error("Failed to update inquiry topics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating inquiry topics:", error);
    throw error;
  }
};

// Tags
export const listTags = async (tagType?: string) => {
  const queryParams = tagType ? `?tag_type=${tagType}` : "";
  const response = await fetch(`${API_BASE_URL}/tags${queryParams}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to get tags");
  }

  return await response.json();
};

export const createTag = async (tagData: any) => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(tagData),
  });

  if (!response.ok) {
    throw new Error("Failed to create tag");
  }

  return await response.json();
};

export const deleteTag = async (tagId: number) => {
  const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete tag");
  }

  return true;
};

export const checkRequiredTags = async () => {
  const response = await fetch(`${API_BASE_URL}/tags/check-required`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to check required tags");
  }

  return await response.json();
};

// DMS Integration
export const getDMSIntegration = async () => {
  // Return placeholder data instead of making API call
  return [
    {
      id: 1,
      name: "Demo DMS Integration",
      type: "Generic",
      config: {
        url: "https://example.com/api",
        auth_header: "",
        api_key: "",
      },
      timeout_seconds: 30,
      is_active: true,
      organization_id: "1",
    },
  ];
};

export const createDMSIntegration = async (dmsData: {
  name: string;
  type: string;
  config: any;
  timeout_seconds?: number;
  is_active?: boolean;
}) => {
  // Return placeholder data instead of making API call
  return {
    id: 1,
    name: dmsData.name,
    type: dmsData.type,
    config: dmsData.config,
    timeout_seconds: dmsData.timeout_seconds || 30,
    is_active: dmsData.is_active !== undefined ? dmsData.is_active : true,
    organization_id: "1",
  };
};

export const updateDMSIntegration = async (
  dmsId: number,
  dmsData: {
    name?: string;
    type?: string;
    config?: any;
    timeout_seconds?: number;
    is_active?: boolean;
  }
) => {
  // Return placeholder data instead of making API call
  return {
    id: dmsId,
    name: dmsData.name || "Demo DMS Integration",
    type: dmsData.type || "Generic",
    config: dmsData.config || {
      url: "https://example.com/api",
      auth_header: "",
      api_key: "",
    },
    timeout_seconds: dmsData.timeout_seconds || 30,
    is_active: dmsData.is_active !== undefined ? dmsData.is_active : true,
    organization_id: "1",
  };
};

export const deleteDMSIntegration = async (dmsId: number) => {
  // Return success without making API call
  return true;
};

// Knowledge Files
export const uploadKnowledgeFile = async (file: File, description?: string) => {
  // Return placeholder data instead of making API call
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    name: file.name,
    file_type: file.type,
    file_size: file.size,
    description: description || "Uploaded file",
    file_path: `/uploads/knowledge_files/${file.name}`,
    uploaded_by: 1,
    organization_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const getKnowledgeFiles = async () => {
  // Return placeholder data instead of making API call
  return [
    {
      id: 1,
      name: "service_manual.pdf",
      file_type: "application/pdf",
      file_size: 1024000,
      description: "Service manual for vehicle maintenance",
      file_path: "/uploads/knowledge_files/service_manual.pdf",
      uploaded_by: 1,
      organization_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "warranty_info.docx",
      file_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 512000,
      description: "Warranty information for customers",
      file_path: "/uploads/knowledge_files/warranty_info.docx",
      uploaded_by: 1,
      organization_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

export const updateKnowledgeFile = async (
  fileId: number,
  fileData: {
    name?: string;
    description?: string;
  }
) => {
  // Return placeholder data instead of making API call
  return {
    id: fileId,
    name: fileData.name || "Updated file",
    file_type: "application/pdf",
    file_size: 1024000,
    description: fileData.description || "Updated description",
    file_path: "/uploads/knowledge_files/updated_file.pdf",
    uploaded_by: 1,
    organization_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const deleteKnowledgeFile = async (fileId: number) => {
  // Return success without making API call
  return true;
};
