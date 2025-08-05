export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface APIEndpoint {
  method: string;
  path: string;
  name: string;
  description: string;
  parameters: APIParameter[];
  response: any;
}

export interface APICategory {
  category: string;
  endpoints: APIEndpoint[];
}

export const API_ENDPOINTS: APICategory[] = [
  {
    category: "Calls",
    endpoints: [
      {
        method: "POST",
        path: "/call",
        name: "Create Call",
        description: "Create a new feedback call with the specified configuration parameters.",
        parameters: [
          {
            name: "customer_name",
            type: "string",
            required: true,
            description: "The name of the customer to call."
          },
          {
            name: "customer_phone",
            type: "string",
            required: true,
            description: "The phone number to call."
          },
          {
            name: "service_advisor_name",
            type: "string",
            required: false,
            description: "The name of the service advisor."
          },
          {
            name: "service_type",
            type: "string",
            required: true,
            description: "The type of service performed (e.g., oil-change, brake-service)."
          },
          {
            name: "last_service_comment",
            type: "string",
            required: false,
            description: "Details about the last service performed."
          },
          {
            name: "vehicle_info",
            type: "string",
            required: false,
            description: "Vehicle information including make, model, year, and VIN."
          },
          {
            name: "appointment_date",
            type: "datetime",
            required: false,
            description: "The date and time of the service appointment (ISO 8601 format)."
          },
          {
            name: "organization_name",
            type: "string",
            required: true,
            description: "The name of the organization."
          },
          {
            name: "organization_description",
            type: "string",
            required: false,
            description: "Description of the organization."
          },
          {
            name: "service_centre_description",
            type: "string",
            required: false,
            description: "Description of the service centre."
          },
          {
            name: "location",
            type: "string",
            required: true,
            description: "The location of the service centre."
          },
          {
            name: "google_review_link",
            type: "string",
            required: false,
            description: "Link to Google review page."
          },
          {
            name: "areas_to_focus",
            type: "string",
            required: false,
            description: "Areas to focus on during the feedback call."
          },
          {
            name: "knowledge_files",
            type: "array",
            required: false,
            description: "Array of knowledge file objects with name, size, and type."
          },
          {
            name: "server_url",
            type: "string",
            required: false,
            description: "Webhook server URL for call events."
          },
          {
            name: "secret_token",
            type: "string",
            required: false,
            description: "Secret token for webhook authentication."
          },
          {
            name: "timeout",
            type: "integer",
            required: false,
            description: "Call timeout in seconds (default: 20)."
          },
          {
            name: "http_headers",
            type: "object",
            required: false,
            description: "Custom HTTP headers for webhook requests."
          }
        ],
        response: {
          id: "string",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:05:00Z",
          cost: 0.15,
          transcript: [
            {
              role: "agent",
              message: "Hello, this is your service advisor calling about your recent visit.",
              time: 0,
              endTime: 3,
              secondsFromStart: 0,
              duration: 3
            },
            {
              role: "customer",
              message: "Hi, yes I remember the visit.",
              time: 3,
              endTime: 6,
              secondsFromStart: 3,
              duration: 3
            }
          ],
          status: "completed",
          endedReason: "call_ended",
          startedAt: "2024-01-01T00:00:00Z",
          endedAt: "2024-01-01T00:05:00Z",
          analysis: {
            summary: "Customer was satisfied with the service and would recommend to others.",
            structuredData: {
              satisfaction_level: "high",
              recommendation_likelihood: "very_likely"
            },
            structuredDataMulti: [
              {
                category: "service_quality",
                rating: 5,
                feedback: "Excellent service"
              }
            ],
            successEvaluation: "successful"
          },
          recording_url: "https://api.lokam.ai/recordings/call_123.mp3",
          variable_values: {
            customer_name: "John Doe",
            customer_phone: "+1234567890",
            service_advisor_name: "Mike Smith",
            service_type: "oil-change",
            last_service_comment: "Oil change and filter replacement completed",
            vehicle_info: "2020 Honda Civic",
            appointment_date: "2024-01-15T10:00:00Z",
            organization_name: "ABC Auto Service",
            organization_description: "Professional auto service center",
            service_centre_description: "Full-service automotive repair and maintenance",
            location: "123 Main St, City, State",
            google_review_link: "https://g.page/abc-auto-service/review",
            areas_to_focus: "Customer satisfaction, Service quality",
            knowledge_files: [
              {
                name: "service_manual.pdf",
                size: "2.5 MB",
                type: "application/pdf"
              }
            ],
            server_url: "https://your-server.com/api/webhook",
            secret_token: "sk-8kIA...8kIA",
            timeout: 20,
            http_headers: {
              "Content-Type": "application/json"
            }
          }
        }
      }
    ]
  }
];

export const SERVICE_TYPES = [
  { value: "oil-change", label: "Oil Change" },
  { value: "brake-service", label: "Brake Service" },
  { value: "tire-rotation", label: "Tire Rotation" },
  { value: "engine-repair", label: "Engine Repair" },
  { value: "transmission", label: "Transmission Service" },
  { value: "other", label: "Other" }
];

export const METHOD_COLORS = {
  GET: "bg-green-100 text-green-800 border-green-200",
  POST: "bg-blue-100 text-blue-800 border-blue-200", 
  PATCH: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DELETE: "bg-red-100 text-red-800 border-red-200"
};