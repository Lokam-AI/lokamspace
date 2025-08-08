/**
 * Agent types and interfaces for the Agent Library feature
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string; // Now a simple string instead of AgentCategory object
  language: string;
  country: string;
  countryCode?: string; // For flag display - optional since backend doesn't provide it
  voice_id?: string;
  personality: string;
  capabilities: string[];
  is_active: boolean;
  created_at?: string; // Optional since backend doesn't provide it
  updated_at?: string; // Optional since backend doesn't provide it
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface AgentCallRequest {
  agent_id: string;
  customer_name: string;
  phone_number: string;
  notes?: string;
}

export interface AgentCallResponse {
  call_id: string;
  status: string;
  message: string;
  estimated_duration?: number;
}

// Mock data for now - this will be replaced with API calls later
export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    id: "feedback",
    name: "Feedback Calling Agents",
    description: "Specialized agents for collecting customer feedback and NPS scores",
    icon: "MessageSquare",
    color: "bg-blue-500"
  },
  {
    id: "marketing",
    name: "Marketing Campaign Agents", 
    description: "Agents designed for promotional campaigns and customer outreach",
    icon: "Megaphone",
    color: "bg-green-500"
  }
];

export const MOCK_AGENTS: Agent[] = [
  // Feedback Agents
  {
    id: "fb-001",
    name: "Sarah - Customer Satisfaction Expert",
    description: "Friendly and empathetic agent specialized in post-service feedback collection with excellent rapport building skills.",
    category: AGENT_CATEGORIES[0],
    language: "English",
    country: "United States",
    countryCode: "US",
    voice_id: "sarah_us_friendly",
    personality: "Warm, professional, and patient",
    capabilities: ["NPS Collection", "Sentiment Analysis", "Issue Escalation", "Review Generation"],
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "fb-002", 
    name: "Ahmed - Arabic Service Specialist",
    description: "Native Arabic speaker with cultural sensitivity training, perfect for Middle Eastern automotive markets.",
    category: AGENT_CATEGORIES[0],
    language: "Arabic",
    country: "United Arab Emirates",
    countryCode: "AE",
    voice_id: "ahmed_ae_professional",
    personality: "Respectful, culturally aware, and thorough",
    capabilities: ["Arabic Dialect Recognition", "Cultural Adaptation", "Service Quality Assessment"],
    is_active: true,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-18T12:00:00Z"
  },
  {
    id: "fb-003",
    name: "Priya - Hindi Customer Care",
    description: "Bilingual agent fluent in Hindi and English, specialized in Indian automotive service feedback.",
    category: AGENT_CATEGORIES[0],
    language: "Hindi",
    country: "India", 
    countryCode: "IN",
    voice_id: "priya_in_bilingual",
    personality: "Polite, patient, and detail-oriented",
    capabilities: ["Hindi-English Code Switching", "Regional Service Understanding", "Complaint Resolution"],
    is_active: true,
    created_at: "2024-01-12T09:30:00Z",
    updated_at: "2024-01-22T11:15:00Z"
  },

  // Marketing Agents
  {
    id: "mk-001",
    name: "Alex - Promotional Campaign Expert", 
    description: "Dynamic marketing agent with proven track record in automotive service promotions and upselling.",
    category: AGENT_CATEGORIES[1],
    language: "English",
    country: "United Kingdom",
    countryCode: "GB",
    voice_id: "alex_gb_energetic",
    personality: "Enthusiastic, persuasive, and informative",
    capabilities: ["Service Upselling", "Promotional Offers", "Seasonal Campaigns", "Customer Retention"],
    is_active: true,
    created_at: "2024-01-08T14:00:00Z",
    updated_at: "2024-01-25T16:45:00Z"
  },
  {
    id: "mk-002",
    name: "Isabella - Spanish Outreach Specialist",
    description: "Native Spanish speaker specialized in customer outreach and promotional campaigns for Hispanic markets.",
    category: AGENT_CATEGORIES[1],
    language: "Spanish",
    country: "Spain",
    countryCode: "ES",
    voice_id: "isabella_es_engaging",
    personality: "Engaging, trustworthy, and persuasive",
    capabilities: ["Spanish Market Understanding", "Promotional Campaigns", "Lead Generation"],
    is_active: true,
    created_at: "2024-01-14T11:00:00Z",
    updated_at: "2024-01-21T13:20:00Z"
  },
  {
    id: "mk-003",
    name: "Lucas - Brazilian Portuguese Marketing",
    description: "Brazilian marketing specialist with expertise in automotive service campaigns and customer engagement.",
    category: AGENT_CATEGORIES[1],
    language: "Portuguese",
    country: "Brazil",
    countryCode: "BR", 
    voice_id: "lucas_br_charismatic",
    personality: "Charismatic, friendly, and results-driven",
    capabilities: ["Brazilian Market Expertise", "Service Promotions", "Customer Loyalty Programs"],
    is_active: true,
    created_at: "2024-01-16T10:30:00Z",
    updated_at: "2024-01-23T14:00:00Z"
  }
];