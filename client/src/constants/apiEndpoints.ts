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
  parameters?: APIParameter[];
  payload?: any;
  response: any;
  note?: string;
}

export interface APICategory {
  category: string;
  endpoints: APIEndpoint[];
}

export const API_ENDPOINTS: APICategory[] = [
  {
    category: "Organization Management",
    endpoints: [
      {
        method: "GET",
        path: "/api/organization",
        name: "Get Organization Information",
        description: "Retrieve current organization information and settings.",
        response: {
          organization_name: "Garage 25",
          organization_email: "garage25@example.com",
          organization_location: "Los Angeles, CA, USA",
          google_review_link: "https://g.page/garage25-review",
          company_description: "Professional auto repair services.",
          service_center_description: "Comprehensive automotive maintenance and repair.",
          areas_to_focus: ["Customer Experience", "Service Transparency"],
          service_types: ["Oil Change", "Brake Inspection"],
          inquiry_topics: ["Service Booking", "Pricing Inquiry"]
        }
      },
      {
        method: "PUT",
        path: "/api/organization",
        name: "Update Organization Information",
        description: "Update organization details and configuration settings.",
        payload: {
          organization_name: "Garage 25",
          organization_email: "garage25@example.com",
          organization_location: "Los Angeles, CA, USA",
          google_review_link: "https://g.page/garage25-review",
          company_description: "Professional auto repair services.",
          service_center_description: "Comprehensive automotive maintenance and repair.",
          areas_to_focus: ["Customer Experience", "Service Transparency"],
          service_types: ["Oil Change", "Brake Inspection"],
          inquiry_topics: ["Service Booking", "Pricing Inquiry"]
        },
        response: {
          success: true,
          message: "Organization updated successfully."
        }
      }
    ]
  },
  {
    category: "Call Management",
    endpoints: [
      {
        method: "POST",
        path: "/api/calls/demo",
        name: "Trigger Demo Call",
        description: "Initiate a demo feedback call for testing purposes.",
        payload: {
          customer_name: "John Doe",
          customer_number: "+15551234567",
          vehicle_number: "ABC-123",
          service_type: "Oil Change",
          service_advisor_name: "Mike Smith",
          appointment_date: "2025-08-06T09:00:00Z"
        },
        response: {
          call_id: "call_001",
          status: "initiated",
          message: "Demo call triggered successfully."
        },
        note: "Webhook will return call analysis, status, and transcript."
      },
      {
        method: "POST",
        path: "/api/calls/{call_id}/initiate",
        name: "Initiate Call by ID",
        description: "Start a previously scheduled call using its ID.",
        response: {
          success: true,
          message: "Call initiated successfully.",
          call_id: "call_001",
          status: "initiated"
        }
      },
      {
        method: "GET",
        path: "/api/calls/{call_id}",
        name: "Get Call Details by ID",
        description: "Retrieve detailed information about a specific call including transcript and analysis.",
        response: {
          call_id: "call_001",
          campaign_name: "August Feedback",
          appointment_date: "2025-08-06T09:00:00Z",
          customer_name: "John Doe",
          customer_number: "+15551234567",
          vehicle_number: "ABC-123",
          service_type: "Oil Change",
          service_advisor_name: "Mike Smith",
          status: "completed",
          recordingUrl: "https://storage.url/audio.mp3",
          startedAt: "2025-08-05T23:22:08.258Z",
          endedAt: "2025-08-05T23:23:18.677Z",
          endedReason: "assistant-ended-call",
          cost: 0.1363,
          analysis: {
            summary: "Headline: The customer had a positive service experience ...",
            structuredData: {
              overall_feedback: "It was good.",
              nps_score: 8,
              nps_validated: true,
              positives: ["The entire service experience was good"],
              detractors: [],
              action_items: []
            },
            successEvaluation: "Good"
          },
          messages: [
            {
              role: "system",
              message: "System instructions and configuration...",
              time: 1754436128121,
              secondsFromStart: 0
            },
            {
              role: "bot",
              message: "Hi, This is Luke from Garage 25...",
              time: 1754436129585,
              endTime: 1754436140835.001,
              secondsFromStart: 1.1999999,
              duration: 10240.000732421875,
              source: ""
            },
            {
              role: "user",
              message: "It was good.",
              time: 1754436148905,
              endTime: 1754436149625,
              secondsFromStart: 20.52,
              duration: 720
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/calls/{call_id}/cancel",
        name: "Cancel Scheduled Call",
        description: "Cancel a scheduled call before it's executed.",
        response: {
          success: true,
          message: "Call cancelled successfully."
        }
      }
    ]
  },
  {
    category: "Call Listing & Reporting",
    endpoints: [
      {
        method: "GET",
        path: "/api/calls",
        name: "List All Calls",
        description: "Retrieve a list of all calls with their basic information.",
        response: [
          {
            call_id: "call_001",
            campaign_name: "August Feedback",
            appointment_date: "2025-08-06T09:00:00Z",
            customer_name: "John Doe",
            customer_number: "+15551234567",
            vehicle_number: "ABC-123",
            service_type: "Oil Change",
            service_advisor_name: "Mike Smith",
            status: "completed",
            startedAt: "2025-08-05T23:22:08.258Z",
            endedAt: "2025-08-05T23:23:18.677Z"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/calls/demo",
        name: "List Demo Calls",
        description: "Retrieve a list of all demo calls that have been executed.",
        response: [
          {
            call_id: "call_001",
            appointment_date: "2025-08-06T09:00:00Z",
            customer_name: "John Doe",
            customer_number: "+15551234567",
            vehicle_number: "ABC-123",
            service_type: "Oil Change",
            service_advisor_name: "Mike Smith",
            status: "completed"
          }
        ]
      }
    ]
  },
  {
    category: "Campaign Management",
    endpoints: [
      {
        method: "POST",
        path: "/api/campaigns",
        name: "Create Campaign",
        description: "Create a new campaign for organizing bulk calls.",
        payload: {
          campaign_name: "August Customer Feedback"
        },
        response: {
          campaign_id: "123",
          campaign_name: "August Customer Feedback",
          success: true
        }
      },
      {
        method: "GET",
        path: "/api/campaigns",
        name: "Retrieve Campaigns",
        description: "Get a list of all available campaigns.",
        response: [
          { campaign_id: "123", campaign_name: "August Feedback" },
          { campaign_id: "124", campaign_name: "September Feedback" }
        ]
      },
      {
        method: "GET",
        path: "/api/campaigns/{campaign_id}/calls",
        name: "List Calls per Campaign",
        description: "Retrieve all calls associated with a specific campaign.",
        response: [
          {
            call_id: "call_002",
            campaign_name: "August Feedback",
            appointment_date: "2025-08-15T11:00:00Z",
            customer_name: "Jane Doe",
            customer_number: "+15557654321",
            vehicle_number: "XYZ-789",
            service_type: "Brake Inspection",
            service_advisor_name: "Mike Smith",
            status: "completed"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/campaigns/{campaign_id}/calls",
        name: "Add Calls to Campaign",
        description: "Add multiple calls to an existing campaign for bulk processing.",
        payload: {
          calls: [
            {
              customer_name: "Jane Doe",
              customer_number: "+15557654321",
              vehicle_number: "XYZ-789",
              service_type: "Brake Inspection",
              service_advisor_name: "Mike Smith",
              appointment_date: "2025-08-15T11:00:00Z"
            }
          ]
        },
        response: {
          success: true,
          added: 1,
          message: "Calls added to campaign and marked as ready."
        }
      }
    ]
  },
  {
    category: "Call Scheduling",
    endpoints: [
      {
        method: "GET",
        path: "/api/calls/schedule",
        name: "Get Schedule Configuration",
        description: "Retrieve current call scheduling configuration and time slots.",
        response: {
          enabled: true,
          active_days: ["Mon", "Wed", "Fri"],
          time_slots: {
            start_time: "09:00",
            end_time: "17:00"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/calls/schedule",
        name: "Update Schedule Configuration",
        description: "Update call scheduling settings including active days and time slots.",
        payload: {
          enabled: true,
          active_days: ["Mon", "Wed", "Fri"],
          time_slots: {
            start_time: "09:00",
            end_time: "17:00"
          }
        },
        response: {
          success: true,
          message: "Call schedule updated successfully."
        }
      }
    ]
  },
  {
    category: "Analytics & Metrics",
    endpoints: [
      {
        method: "GET",
        path: "/api/metrics/calls",
        name: "Retrieve Call Metrics",
        description: "Get comprehensive analytics and metrics for calls within a date range.",
        parameters: [
          {
            name: "start_date",
            type: "string",
            required: false,
            description: "Start date in YYYY-MM-DD format"
          },
          {
            name: "end_date",
            type: "string",
            required: false,
            description: "End date in YYYY-MM-DD format"
          }
        ],
        response: {
          total_calls: 100,
          completed_calls: 95,
          detractors: 5,
          average_nps: 8.5,
          cost_details: {
            total_cost: "$150",
            average_cost_per_call: "$1.50"
          }
        }
      }
    ]
  },
  {
    category: "Webhook Integration",
    endpoints: [
      {
        method: "WEBHOOK",
        path: "N/A",
        name: "Call Status Update",
        description: "Webhook event sent when call status changes.",
        response: {
          call_id: "abc123",
          status: "in-progress | completed | failed"
        }
      },
      {
        method: "WEBHOOK",
        path: "N/A",
        name: "End-of-Call Report",
        description: "Comprehensive webhook event sent when a call completes with full analysis.",
        response: {
          call_id: "abc123",
          transcript: "Full transcript of the call.",
          nps_score: 9,
          areas_to_improve: ["Wait time", "Advisor communication"],
          comments: "Customer was satisfied overall but indicated wait times could improve.",
          analysis: {
            summary: "...",
            structuredData: {
              overall_feedback: "...",
              nps_score: 8,
              nps_validated: true,
              positives: ["..."],
              detractors: [],
              action_items: []
            },
            successEvaluation: "Good"
          },
          recordingUrl: "<url_here>",
          startedAt: "2025-08-05T23:22:08.258Z",
          endedAt: "2025-08-05T23:23:18.677Z",
          endedReason: "assistant-ended-call",
          cost: 0.1363
        }
      },
      {
        method: "WEBHOOK",
        path: "N/A",
        name: "CRM Ticket / Escalation",
        description: "Webhook event for negative reviews requiring follow-up.",
        response: {
          call_id: "abc123",
          issue_type: "negative_review",
          details: "Customer provided negative feedback requiring follow-up."
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
  PUT: "bg-orange-100 text-orange-800 border-orange-200",
  PATCH: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  WEBHOOK: "bg-purple-100 text-purple-800 border-purple-200"
};