import { ClientDetails, OrganizationDetails, KnowledgeFile, HttpHeader, ConfigurationData, APIClientDetails, APIOrganizationDetails } from "@/types/apiConfig";

export const generateConfigurationJSON = (
  clientDetails: ClientDetails,
  organizationDetails: OrganizationDetails,
  knowledgeFiles: KnowledgeFile[],
  serverUrl: string,
  timeout: string,
  httpHeaders: HttpHeader[]
): string => {
  // Convert datetime-local value to ISO string if provided
  const formatAppointmentDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      // datetime-local input returns "YYYY-MM-DDTHH:MM" format
      // We need to convert it to ISO string
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.warn("Invalid appointment date format:", dateString);
      return null;
    }
  };

  const config: ConfigurationData = {
    feedback_call: {
      client_details: {
        customer_name: clientDetails.customerName || null,
        customer_phone: clientDetails.customerPhone || null,
        service_advisor_name: clientDetails.serviceAdvisorName || null,
        service_type: clientDetails.serviceType || null,
        last_service_comment: clientDetails.lastServiceComment || null,
        vehicle_info: clientDetails.vehicleInfo || null,
        appointment_date: formatAppointmentDate(clientDetails.appointmentDate)
      },
      organization_details: {
        organization_name: organizationDetails.organizationName || null,
        organization_description: organizationDetails.organizationDescription || null,
        service_centre_description: organizationDetails.serviceCentreDescription || null,
        location: organizationDetails.location || null,
        google_review_link: organizationDetails.googleReviewLink || null,
        areas_to_focus: organizationDetails.areasToFocus || null
      },
      knowledge_files: knowledgeFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      webhook_configuration: {
        server_url: serverUrl,
        timeout: parseInt(timeout) || 20,
        http_headers: httpHeaders.reduce((acc, header) => {
          acc[header.key] = header.value;
          return acc;
        }, {} as Record<string, string>)
      }
    }
  };

  return JSON.stringify(config, null, 2);
};