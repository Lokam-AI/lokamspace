# Feedback Calls Page Implementation Plan

## Overview

This document outlines the plan for implementing the Feedback Calls Page functionality, which includes call schedule configuration, call status management (Ready for Call, Missed Calls, Completed Calls), and demo call capabilities.

## 1. Current Frontend Components Analysis

The frontend already has several components related to feedback calls:

### Call Management Components

- `ReadyForCallTab.tsx` - Displays calls that are ready to be made
- `MissedCallsTab.tsx` - Displays calls that were missed or failed
- `CompletedCallsTab.tsx` - Displays completed calls with details
- `DemoCallSection.tsx` - Allows setting up and initiating a demo call
- `CallDetailPanel.tsx` - Shows detailed information about a specific call
- `ScheduleSettings.tsx` - Configuration for call scheduling

### Call Table Fields Identified

- Customer Name
- Vehicle Number
- Service Advisor
- Service Type
- Call Status
- Phone Number
- Call Date/Time
- Rating/NPS Score
- Tags
- Feedback/Transcript
- Audio URL

## 2. Database Model & Schema Analysis

### Current Models

#### Call Model (`call.py`)

- Basic call tracking fields exist:
  - id, organization_id, service_record_id
  - customer_number, direction, start_time, end_time, duration_sec
  - status, recording_url
  - Relationships to organization, service_record, agent, transcript, audio_file

#### ServiceRecord Model (`service_record.py`)

- Customer information:
  - customer_name, customer_phone, vehicle_info
  - service_type, status, appointment_date
  - feedback, rating
  - Relationships to organization, campaign, calls

#### ScheduleConfig Model (`schedule_config.py`)

- Configuration for call scheduling:
  - organization_id, campaign_id
  - config_json (JSONB field)

### Current Schemas

#### Call Schema (`call.py`)

- Base schema includes:
  - call_type, status, scheduled_time, start/end_time, duration
  - phone_number, customer_name, notes
  - service_record_id, campaign_id, tags

## 3. Gaps and Implementation Needs

### Schema/Model Updates Needed

1. **Call Model Updates**

   - Add fields for:
     - NPS score (Integer field)
     - Tags (Array or relationship to tags)
     - Call reason/details

2. **ServiceRecord Model Updates**

   - Add fields for:
     - Service advisor name/ID
     - Areas to improve (Array or JSONB)
     - Positive mentions (Array or JSONB)
     - Overall feedback

3. **Schema Updates**

   - Update `CallResponse` to include:
     - NPS score
     - Service advisor details
     - Vehicle information
     - Positive/negative mentions
     - Overall feedback

4. **New API Endpoints**
   - Endpoint for call schedule configuration
   - Endpoint for demo call setup and initiation
   - Endpoints for filtering calls by status (ready, missed, completed)

## 4. Backend Implementation Plan

### 1. Model and Schema Updates

1. **Update Call Model**

```python
# Add to Call model
nps_score = Column(Integer, nullable=True)
call_reason = Column(String(100), nullable=True)
feedback_summary = Column(Text, nullable=True)
```

2. **Update Call Schema**

```python
# Add to CallBase
nps_score: Optional[int] = None
call_reason: Optional[str] = None
feedback_summary: Optional[str] = None
service_advisor_id: Optional[int] = None
service_advisor_name: Optional[str] = None
vehicle_info: Optional[str] = None
positive_mentions: Optional[List[str]] = None
areas_to_improve: Optional[List[str]] = None
```

3. **Update ServiceRecord Schema**

```python
# Add/enhance ServiceRecord schema
service_advisor_id: Optional[int] = None
service_advisor_name: Optional[str] = None
positive_mentions: Optional[List[str]] = None
areas_to_improve: Optional[List[str]] = None
overall_feedback: Optional[str] = None
```

### 2. Schedule Configuration Service

1. **Create/Update Schedule Config Service**

```python
# schedule_config_service.py
async def get_organization_schedule_config(organization_id: UUID, db: AsyncSession):
    """Get schedule configuration for an organization."""
    # Implementation

async def update_schedule_config(
    organization_id: UUID,
    config_data: dict,
    db: AsyncSession
):
    """Update schedule configuration."""
    # Implementation
```

2. **Add Schedule Config API Endpoints**

```python
# Add to calls.py or create schedule_config.py endpoints
@router.get("/schedule-config", response_model=ScheduleConfigResponse)
async def get_schedule_config(...):
    # Implementation

@router.put("/schedule-config", response_model=ScheduleConfigResponse)
async def update_schedule_config(...):
    # Implementation
```

### 3. Demo Call Implementation

1. **Create Demo Call Service**

```python
# Add to call_service.py
async def create_demo_call(
    demo_data: DemoCallCreate,
    organization_id: UUID,
    db: AsyncSession
):
    """Create a demo call entry."""
    # Implementation

async def initiate_demo_call(
    call_id: int,
    organization_id: UUID,
    db: AsyncSession
):
    """Initiate a demo call."""
    # Implementation
```

2. **Add Demo Call API Endpoints**

```python
# Add to calls.py endpoints
@router.post("/demo", response_model=CallResponse)
async def create_demo_call(...):
    # Implementation

@router.post("/demo/{call_id}/initiate", response_model=CallResponse)
async def initiate_demo_call(...):
    # Implementation
```

### 4. Call Status-specific Endpoints

1. **Add Status-specific Endpoints**

```python
@router.get("/ready", response_model=List[CallResponse])
async def list_ready_calls(...):
    """Get calls with 'Ready' status."""
    # Implementation using CallService with status filter

@router.get("/missed", response_model=List[CallResponse])
async def list_missed_calls(...):
    """Get calls with 'Failed' or 'Missed' status."""
    # Implementation using CallService with status filter

@router.get("/completed", response_model=List[CallResponse])
async def list_completed_calls(...):
    """Get calls with 'Completed' status."""
    # Implementation using CallService with status filter
```

## 5. Frontend Integration Plan

### 1. API Service Functions

Create a new file `client/src/api/endpoints/calls.ts` with the following functions:

```typescript
// calls.ts
export const getCallsByStatus = async (status: string, filters: any = {}) => {
  return await fetch(
    `/api/v1/calls/${status}?${new URLSearchParams(filters)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
};

export const getCallDetails = async (callId: string) => {
  return await fetch(`/api/v1/calls/${callId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export const updateCall = async (callId: string, callData: any) => {
  return await fetch(`/api/v1/calls/${callId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(callData),
  }).then((res) => res.json());
};

export const getScheduleConfig = async () => {
  return await fetch("/api/v1/calls/schedule-config", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export const updateScheduleConfig = async (configData: any) => {
  return await fetch("/api/v1/calls/schedule-config", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configData),
  }).then((res) => res.json());
};

export const createDemoCall = async (demoData: any) => {
  return await fetch("/api/v1/calls/demo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(demoData),
  }).then((res) => res.json());
};

export const initiateDemoCall = async (callId: string) => {
  return await fetch(`/api/v1/calls/demo/${callId}/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};
```

### 2. Component Updates

1. **Update Call Tabs to Use Real Data**

Update the following components to fetch data from the API instead of using mock data:

- `ReadyForCallTab.tsx`
- `MissedCallsTab.tsx`
- `CompletedCallsTab.tsx`

2. **Update ScheduleSettings Component**

Modify `ScheduleSettings.tsx` to:

- Fetch actual configuration from the API on component mount
- Save changes to the API when saving
- Add loading and error states

3. **Update DemoCallSection**

Enhance `DemoCallSection.tsx` to:

- Create a real demo call in the database
- Initiate the call through the API
- Show real status updates

### 3. Error Handling and Loading States

Add proper error handling and loading states to all API calls:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await getCallsByStatus("ready");
    setCalls(data);
  } catch (err) {
    setError("Failed to fetch calls. Please try again later.");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};
```

## 6. Implementation Checklist

### Backend

- [ ] Update Call model
- [ ] Update ServiceRecord model
- [ ] Update Call schema
- [ ] Update ServiceRecord schema
- [ ] Implement Schedule Config service and endpoints
- [ ] Implement Demo Call service and endpoints
- [ ] Implement status-specific call endpoints
- [ ] Write database migrations for model changes
- [ ] Test all endpoints

### Frontend

- [ ] Create API service functions for calls
- [ ] Update ReadyForCallTab to use real data
- [ ] Update MissedCallsTab to use real data
- [ ] Update CompletedCallsTab to use real data
- [ ] Update ScheduleSettings to use real config
- [ ] Update DemoCallSection to create and initiate real calls
- [ ] Add proper error handling and loading states
- [ ] Test all functionality

## 7. API Routes Summary

| Endpoint                                | Method | Description                         |
| --------------------------------------- | ------ | ----------------------------------- |
| `/api/v1/calls/ready`                   | GET    | Get calls with Ready status         |
| `/api/v1/calls/missed`                  | GET    | Get calls with Failed/Missed status |
| `/api/v1/calls/completed`               | GET    | Get calls with Completed status     |
| `/api/v1/calls/{call_id}`               | GET    | Get call details                    |
| `/api/v1/calls/{call_id}`               | PUT    | Update call                         |
| `/api/v1/calls/{call_id}`               | DELETE | Delete call                         |
| `/api/v1/calls/schedule-config`         | GET    | Get schedule config                 |
| `/api/v1/calls/schedule-config`         | PUT    | Update schedule config              |
| `/api/v1/calls/demo`                    | POST   | Create a demo call                  |
| `/api/v1/calls/demo/{call_id}/initiate` | POST   | Initiate a demo call                |

## 8. Note on Call Functionality

The actual call initiation functionality is not yet available, so this implementation includes:

1. Placeholders for call initiation in both regular and demo calls
2. Complete CRUD operations for call records
3. All necessary database schema and model changes
4. UI integration with mock call flow for demonstration purposes
5. Preparation for future integration with a real calling service

The plan supports future extension to integrate with actual call services when they become available.
