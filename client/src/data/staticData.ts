// Static data for demo purposes - replaces all backend API calls

export interface User {
  name: string;
  email: string;
  userId: number;
  role: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_number: string;
  is_active: boolean;
}

export interface Question {
  id: number;
  text: string;
  section: string;
  createdAt: string;
  isActive: boolean;
}

export interface ServiceCall {
  vehicle_number: string;
  service_details: string;
  service_date: string;
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  assigned_user_id: number;
  created_at: string;
  status: string;
  call_interactions: CallInteraction[];
}

export interface CallInteraction {
  id: number;
  call_date: string;
  status: string;
  duration_seconds: number;
  transcription: string;
  overall_feedback: string;
  overall_score: number;
  timeliness_score: number;
  cleanliness_score: number;
  advisor_helpfulness_score: number;
  work_quality_score: number;
  recommendation_score: number;
  action_items: string;
  completed_at: string;
  nps_score?: number;
}

export interface CallListItem {
  id: number;
  customer: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  serviceDate: string;
  serviceDetails: string;
  status: string;
}

// Static user data
export const STATIC_USER: User = {
  name: "Saleeq Muhammed",
  email: "saleeq.muhammed@autocare.com",
  userId: 1,
  role: "admin"
};

// Static customers data
export const STATIC_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Raoof Naushad",
    email: "raoofnaushad.7@gmail.com",
    phone: "9029897685",
    vehicle_number: "B3KM6K",
    is_active: true
  },
  {
    id: 2,
    name: "Aisha Rahman",
    email: "aisha.rahman@example.com",
    phone: "4165551234",
    vehicle_number: "ONT1234",
    is_active: true
  },
  {
    id: 3,
    name: "Deepak Menon",
    email: "deepak.menon@example.com",
    phone: "6475559876",
    vehicle_number: "MH12AB1234",
    is_active: false
  },
  {
    id: 4,
    name: "Sara George",
    email: "sara.george@example.com",
    phone: "9055552468",
    vehicle_number: "TN09CA9087",
    is_active: true
  },
  {
    id: 5,
    name: "Jayanth Reddy",
    email: "jayanth.reddy@example.com",
    phone: "7805553344",
    vehicle_number: "TS07GH7865",
    is_active: false
  },
  {
    id: 6,
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "6045551122",
    vehicle_number: "BC34DE5678",
    is_active: true
  },
  {
    id: 7,
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    phone: "4035559988",
    vehicle_number: "AB12CD3456",
    is_active: true
  },
  {
    id: 8,
    name: "Lisa Chen",
    email: "lisa.chen@example.com",
    phone: "5145557766",
    vehicle_number: "QC78EF9012",
    is_active: false
  }
];

// Static questions data
export const STATIC_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How would you rate your overall service experience?",
    section: "Overall Service",
    createdAt: "2024-03-15T09:30:00Z",
    isActive: true
  },
  {
    id: 2,
    text: "Was the service completed on time?",
    section: "Timeliness",
    createdAt: "2024-03-15T10:15:00Z",
    isActive: true
  },
  {
    id: 3,
    text: "How would you rate the cleanliness of your vehicle after service?",
    section: "Cleanliness",
    createdAt: "2024-03-15T11:00:00Z",
    isActive: true
  },
  {
    id: 4,
    text: "How would you rate the helpfulness and information provided by the service advisor?",
    section: "Advisor Helpfulness",
    createdAt: "2024-03-16T09:00:00Z",
    isActive: true
  },
  {
    id: 5,
    text: "How would you rate the quality of the work performed on your vehicle?",
    section: "Work Quality",
    createdAt: "2024-03-16T10:30:00Z",
    isActive: true
  },
  {
    id: 6,
    text: "How likely are you to recommend our dealership to others?",
    section: "Recommendation",
    createdAt: "2024-03-16T14:15:00Z",
    isActive: true
  },
  {
    id: 7,
    text: "Were you satisfied with the communication throughout the service process?",
    section: "Communication",
    createdAt: "2024-03-17T08:45:00Z",
    isActive: true
  },
  {
    id: 8,
    text: "How would you rate the value for money of the services provided?",
    section: "Value",
    createdAt: "2024-03-17T11:20:00Z",
    isActive: false
  }
];

// Static service calls data
export const STATIC_SERVICE_CALLS: ServiceCall[] = [
  {
    vehicle_number: "ABC-1234",
    service_details: "Tire Replacement - Completed routine maintenance and inspection",
    service_date: "2025-01-09T02:14:44.854405",
    id: 1,
    customer_id: 1,
    customer_name: "John Smith",
    customer_email: "john.smith@email.com",
    customer_phone: "9029897685",
    assigned_user_id: 1,
    created_at: "2025-01-09T02:14:44.854405",
    status: "pending",
    call_interactions: [
      {
        id: 1,
        call_date: "2025-01-10T02:14:44.854405",
        status: "completed",
        duration_seconds: 291,
        transcription: "Customer satisfaction call for John Smith. Discussed tire replacement service experience.",
        overall_feedback: "Great service experience at Lokam.ai. The tire replacement was handled professionally.",
        overall_score: 4.5,
        timeliness_score: 3.3,
        cleanliness_score: 4.4,
        advisor_helpfulness_score: 4.7,
        work_quality_score: 4.4,
        recommendation_score: 3.7,
        action_items: "Follow up on warranty information",
        completed_at: "2025-01-10T02:36:44.854405",
        nps_score: 9
      }
    ]
  },
  {
    vehicle_number: "XYZ-5678",
    service_details: "Oil Change - Routine oil and filter replacement",
    service_date: "2025-01-12T10:00:00.000000",
    id: 2,
    customer_id: 2,
    customer_name: "Jane Doe",
    customer_email: "jane.doe@email.com",
    customer_phone: "9876543210",
    assigned_user_id: 2,
    created_at: "2025-01-12T10:00:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 2,
        call_date: "2025-01-13T11:00:00.000000",
        status: "completed",
        duration_seconds: 180,
        transcription: "Customer satisfaction call for Jane Doe. Discussed oil change experience.",
        overall_feedback: "Quick and efficient service. Satisfied with the oil change.",
        overall_score: 4.8,
        timeliness_score: 4.5,
        cleanliness_score: 4.8,
        advisor_helpfulness_score: 4.9,
        work_quality_score: 4.7,
        recommendation_score: 4.6,
        action_items: "Send service reminder for next oil change",
        completed_at: "2025-01-13T11:30:00.000000",
        nps_score: 10
      }
    ]
  },
  {
    vehicle_number: "DEF-9012",
    service_details: "Brake System Inspection - Complete brake system check and maintenance",
    service_date: "2025-01-15T14:30:00.000000",
    id: 3,
    customer_id: 3,
    customer_name: "Mike Johnson",
    customer_email: "mike.johnson@email.com",
    customer_phone: "5551234567",
    assigned_user_id: 1,
    created_at: "2025-01-15T14:30:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 3,
        call_date: "2025-01-16T15:00:00.000000",
        status: "completed",
        duration_seconds: 245,
        transcription: "Customer satisfaction call for Mike Johnson. Discussed brake system service.",
        overall_feedback: "Excellent brake service. The technician was very thorough and explained everything clearly.",
        overall_score: 4.9,
        timeliness_score: 4.8,
        cleanliness_score: 4.9,
        advisor_helpfulness_score: 5.0,
        work_quality_score: 4.9,
        recommendation_score: 4.8,
        action_items: "Schedule follow-up brake inspection in 6 months",
        completed_at: "2025-01-16T15:25:00.000000",
        nps_score: 10
      }
    ]
  },
  {
    vehicle_number: "GHI-3456",
    service_details: "Air Conditioning Service - AC system check and refrigerant recharge",
    service_date: "2025-01-18T09:15:00.000000",
    id: 4,
    customer_id: 4,
    customer_name: "Sarah Wilson",
    customer_email: "sarah.wilson@email.com",
    customer_phone: "5559876543",
    assigned_user_id: 2,
    created_at: "2025-01-18T09:15:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 4,
        call_date: "2025-01-19T10:00:00.000000",
        status: "completed",
        duration_seconds: 198,
        transcription: "Customer satisfaction call for Sarah Wilson. Discussed AC service experience.",
        overall_feedback: "AC is working perfectly now. Service was quick and professional.",
        overall_score: 4.6,
        timeliness_score: 4.7,
        cleanliness_score: 4.5,
        advisor_helpfulness_score: 4.6,
        work_quality_score: 4.8,
        recommendation_score: 4.5,
        action_items: "Send seasonal AC maintenance reminder",
        completed_at: "2025-01-19T10:18:00.000000",
        nps_score: 8
      }
    ]
  },
  {
    vehicle_number: "JKL-7890",
    service_details: "Battery Replacement - New battery installation and testing",
    service_date: "2025-01-20T11:45:00.000000",
    id: 5,
    customer_id: 5,
    customer_name: "David Brown",
    customer_email: "david.brown@email.com",
    customer_phone: "5554567890",
    assigned_user_id: 1,
    created_at: "2025-01-20T11:45:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 5,
        call_date: "2025-01-21T12:00:00.000000",
        status: "completed",
        duration_seconds: 165,
        transcription: "Customer satisfaction call for David Brown. Discussed battery replacement.",
        overall_feedback: "Battery replacement was smooth. Car starts perfectly now.",
        overall_score: 4.7,
        timeliness_score: 4.6,
        cleanliness_score: 4.7,
        advisor_helpfulness_score: 4.8,
        work_quality_score: 4.7,
        recommendation_score: 4.6,
        action_items: "Schedule battery test in 2 years",
        completed_at: "2025-01-21T12:15:00.000000",
        nps_score: 9
      }
    ]
  },
  {
    vehicle_number: "MNO-2345",
    service_details: "Transmission Service - Fluid change and transmission inspection",
    service_date: "2025-01-22T13:20:00.000000",
    id: 6,
    customer_id: 6,
    customer_name: "Emily Davis",
    customer_email: "emily.davis@email.com",
    customer_phone: "5553216540",
    assigned_user_id: 2,
    created_at: "2025-01-22T13:20:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 6,
        call_date: "2025-01-23T14:00:00.000000",
        status: "completed",
        duration_seconds: 220,
        transcription: "Customer satisfaction call for Emily Davis. Discussed transmission service.",
        overall_feedback: "Transmission is shifting much smoother now. Very satisfied with the service.",
        overall_score: 4.8,
        timeliness_score: 4.7,
        cleanliness_score: 4.8,
        advisor_helpfulness_score: 4.9,
        work_quality_score: 4.8,
        recommendation_score: 4.7,
        action_items: "Schedule next transmission service in 30,000 miles",
        completed_at: "2025-01-23T14:20:00.000000",
        nps_score: 9
      }
    ]
  },
  {
    vehicle_number: "PQR-6789",
    service_details: "Suspension Repair - Shock absorber replacement and alignment",
    service_date: "2025-01-24T16:00:00.000000",
    id: 7,
    customer_id: 7,
    customer_name: "Robert Taylor",
    customer_email: "robert.taylor@email.com",
    customer_phone: "5557891234",
    assigned_user_id: 1,
    created_at: "2025-01-24T16:00:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 7,
        call_date: "2025-01-25T17:00:00.000000",
        status: "completed",
        duration_seconds: 275,
        transcription: "Customer satisfaction call for Robert Taylor. Discussed suspension repair.",
        overall_feedback: "Ride quality is much better now. Suspension feels like new.",
        overall_score: 4.9,
        timeliness_score: 4.8,
        cleanliness_score: 4.9,
        advisor_helpfulness_score: 5.0,
        work_quality_score: 4.9,
        recommendation_score: 4.8,
        action_items: "Schedule alignment check in 6 months",
        completed_at: "2025-01-25T17:25:00.000000",
        nps_score: 10
      }
    ]
  },
  {
    vehicle_number: "STU-0123",
    service_details: "Electrical System Diagnosis - Check engine light investigation",
    service_date: "2025-01-26T08:30:00.000000",
    id: 8,
    customer_id: 8,
    customer_name: "Lisa Anderson",
    customer_email: "lisa.anderson@email.com",
    customer_phone: "5556543210",
    assigned_user_id: 2,
    created_at: "2025-01-26T08:30:00.000000",
    status: "pending",
    call_interactions: [
      {
        id: 8,
        call_date: "2025-01-27T09:00:00.000000",
        status: "completed",
        duration_seconds: 190,
        transcription: "Customer satisfaction call for Lisa Anderson. Discussed electrical system diagnosis.",
        overall_feedback: "Check engine light is gone. Electrical system is working properly now.",
        overall_score: 4.6,
        timeliness_score: 4.5,
        cleanliness_score: 4.6,
        advisor_helpfulness_score: 4.7,
        work_quality_score: 4.6,
        recommendation_score: 4.5,
        action_items: "Monitor for any recurring electrical issues",
        completed_at: "2025-01-27T09:15:00.000000",
        nps_score: 7
      }
    ]
  }
];

// Static call list data
export const STATIC_CALL_LIST: CallListItem[] = [
  { id: 1, customer: "John Smith", email: "john.smith@email.com", phone: "9029897685", vehicleNumber: "ABC-1234", serviceDate: "2025-01-09", serviceDetails: "Tire Replacement - Completed routine maintenance and inspection", status: "pending" },
  { id: 2, customer: "Jane Doe", email: "jane.doe@email.com", phone: "9876543210", vehicleNumber: "XYZ-5678", serviceDate: "2025-01-12", serviceDetails: "Oil Change - Routine oil and filter replacement", status: "pending" },
  { id: 3, customer: "Mike Johnson", email: "mike.johnson@email.com", phone: "5551234567", vehicleNumber: "DEF-9012", serviceDate: "2025-01-15", serviceDetails: "Brake System Inspection - Complete brake system check and maintenance", status: "pending" },
  { id: 4, customer: "Sarah Wilson", email: "sarah.wilson@email.com", phone: "5559876543", vehicleNumber: "GHI-3456", serviceDate: "2025-01-18", serviceDetails: "Air Conditioning Service - AC system check and refrigerant recharge", status: "pending" },
  { id: 5, customer: "David Brown", email: "david.brown@email.com", phone: "5554567890", vehicleNumber: "JKL-7890", serviceDate: "2025-01-20", serviceDetails: "Battery Replacement - New battery installation and testing", status: "pending" },
  { id: 6, customer: "Emily Davis", email: "emily.davis@email.com", phone: "5553216540", vehicleNumber: "MNO-2345", serviceDate: "2025-01-22", serviceDetails: "Transmission Service - Fluid change and transmission inspection", status: "pending" },
  { id: 7, customer: "Robert Taylor", email: "robert.taylor@email.com", phone: "5557891234", vehicleNumber: "PQR-6789", serviceDate: "2025-01-24", serviceDetails: "Suspension Repair - Shock absorber replacement and alignment", status: "pending" },
  { id: 8, customer: "Lisa Anderson", email: "lisa.anderson@email.com", phone: "5556543210", vehicleNumber: "STU-0123", serviceDate: "2025-01-26", serviceDetails: "Electrical System Diagnosis - Check engine light investigation", status: "pending" }
];

// Dashboard statistics
export const DASHBOARD_STATS = {
  totalCalls: 1600,
  completedCalls: 1450,
  averageRating: 4.7,
  detractors: 50,
  totalCustomers: 1250,
  activeCustomers: 1180,
  monthlyGrowth: 12.5,
  customerSatisfaction: 94.2
};

// Service metrics data
export const SERVICE_METRICS = {
  timeliness: 4.6,
  cleanliness: 4.8,
  advisorHelpfulness: 4.7,
  workQuality: 4.9,
  recommendation: 4.5
}; 