# Demo Calls Implementation Guide

This guide outlines how to implement demo call functionality for the AutoPulse application, using the agent-pulse implementation as a reference.

## Overview

The demo call feature allows users to initiate a sample call to experience the system's capabilities without affecting production data. The implementation follows this flow:

1. Frontend submits a request with customer details for a demo call
2. Backend creates necessary records in the database (Campaign, Service Record, Call)
3. Backend initiates the call through VAPI
4. Frontend receives a success response and displays appropriate feedback

## Detailed Implementation Steps

### 1. Backend API Endpoints

Create two main endpoints for handling demo calls:

#### 1.1. Create Demo Call Endpoint

```python
@router.post("/demo", response_model=DemoCallResponse)
async def create_demo_call(
    demo_data: DemoCallCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a demo call record.
    """
    try:
        # Set organization ID from current organization if not provided
        if not demo_data.organization_id:
            demo_data.organization_id = organization.id

        # Create demo call using service
        call = await CallService.create_demo_call(
            demo_data=demo_data,
            current_user_id=current_user.id,
            db=db
        )

        # Get service record details
        service_record = None
        if call.service_record_id:
            query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
            result = await db.execute(query)
            service_record = result.scalar_one_or_none()

        # Return response
        return DemoCallResponse(
            call_id=call.id,
            customer_name=service_record.customer_name if service_record else None,
            phone_number=call.customer_number,
            vehicle_number=service_record.vehicle_info if service_record else None,
            campaign_id=call.campaign_id,
            status=call.status
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create demo call: {str(e)}"
        )
```

#### 1.2. Initiate Demo Call Endpoint

```python
@router.post("/demo/{call_id}/initiate", response_model=DemoCallResponse)
async def initiate_demo_call(
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Initiate a demo call with VAPI.
    """
    try:
        # Initiate demo call
        call_result = await CallService.initiate_demo_call(
            call_id=call_id,
            organization_id=organization.id,
            db=db
        )

        # Return response with updated data
        return DemoCallResponse(
            call_id=call_result["call_id"],
            customer_name=call_result["customer_name"],
            phone_number=call_result["customer_number"],
            vehicle_number=call_result["vehicle_info"],
            campaign_id=call_result["campaign_id"],
            status=call_result["status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate demo call: {str(e)}"
        )
```

### 2. Call Service Implementation

#### 2.1. Create Demo Call Method

```python
@staticmethod
async def create_demo_call(
    demo_data: DemoCallCreate,
    current_user_id: int = None,
    db: AsyncSession = None
) -> Call:
    """
    Create a demo call entry in the database.
    """
    # Create or get 'Demo Campaign'
    campaign_query = select(Campaign).where(
        and_(
            Campaign.name == "Demo Campaign",
            Campaign.organization_id == demo_data.organization_id
        )
    )
    result = await db.execute(campaign_query)
    campaign = result.scalar_one_or_none()

    if not campaign:
        # Create new demo campaign
        campaign = Campaign(
            name="Demo Campaign",
            organization_id=demo_data.organization_id,
            status="Active",
            created_by=current_user_id,
            modified_by=current_user_id
        )
        db.add(campaign)
        await db.flush()

    # Create a service record for the demo call
    service_record = ServiceRecord(
        organization_id=demo_data.organization_id,
        customer_name=demo_data.customer_name,
        customer_phone=demo_data.phone_number,
        vehicle_info=demo_data.vehicle_number,
        status="Ready",
        service_type="Feedback Call",
        campaign_id=campaign.id,
        is_demo=True  # Flag as demo
    )

    db.add(service_record)
    await db.flush()  # Flush to get service_record.id

    # Create the call record
    call = Call(
        organization_id=demo_data.organization_id,
        service_record_id=service_record.id,
        customer_number=demo_data.phone_number,
        direction="outbound",
        status="Ready",
        call_reason="Demo Call",
        campaign_id=campaign.id,
        is_demo=True  # Flag as demo
    )

    db.add(call)
    await db.commit()
    await db.refresh(call)

    return call
```

#### 2.2. Initiate Demo Call Method

```python
@staticmethod
async def initiate_demo_call(
    call_id: int,
    organization_id: UUID,
    db: AsyncSession = None
) -> Dict:
    """
    Initiate a demo call using VAPI.
    """
    from app.services.vapi_service import VAPIService

    # Get the call and associated data
    call_query = select(Call).where(
        and_(
            Call.id == call_id,
            Call.organization_id == organization_id
        )
    )
    result = await db.execute(call_query)
    call = result.scalar_one_or_none()

    if not call:
        raise ValueError(f"Call with ID {call_id} not found")

    # Get service record
    service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
    service_result = await db.execute(service_query)
    service_record = service_result.scalar_one_or_none()

    if not service_record:
        raise ValueError(f"Service record for call ID {call_id} not found")

    # Get organization
    org_query = select(Organization).where(Organization.id == call.organization_id)
    org_result = await db.execute(org_query)
    organization = org_result.scalar_one_or_none()

    if not organization:
        raise ValueError(f"Organization for call ID {call_id} not found")

    # Initialize VAPI service
    vapi_service = VAPIService()

    try:
        # Make the call to VAPI
        vapi_response = await vapi_service.create_demo_call(
            phone=service_record.customer_phone,
            customer_name=service_record.customer_name,
            vehicle_info=service_record.vehicle_info or "Demo Vehicle",
            service_advisor_name=service_record.service_advisor_name or "Demo Advisor",
            service_type=service_record.service_type or "Feedback Call",
            organization_name=organization.name,
            location=organization.location or "Demo Location",
            call_id=call.id
        )

        # Update call status
        call.status = "In Progress"
        call.start_time = datetime.now()
        await db.commit()
        await db.refresh(call)

        # Update service record status too
        service_record.status = "In Progress"
        await db.commit()

        # Return response with all necessary information
        return {
            "call_id": call.id,
            "service_record_id": service_record.id,
            "customer_name": service_record.customer_name,
            "customer_number": call.customer_number,
            "vehicle_info": service_record.vehicle_info,
            "campaign_id": call.campaign_id,
            "status": call.status,
            "vapi_response": vapi_response
        }

    except Exception as e:
        # Update call and service record status to Failed if there's an error
        call.status = "Failed"
        service_record.status = "Failed"
        await db.commit()
        raise ValueError(f"Failed to initiate call with VAPI: {str(e)}")
```

### 3. VAPI Service Implementation

```python
async def create_demo_call(
    self,
    phone: str,
    customer_name: str,
    vehicle_info: str,
    service_advisor_name: str = "Demo Advisor",
    service_type: str = "Feedback Call",
    organization_name: str = "Demo Organization",
    location: str = "Demo Location",
    call_id: int = None
) -> Dict[str, Any]:
    """
    Create a demo call using VAPI's API.
    """
    customer = {
        "name": customer_name,
        "number": phone
    }

    assistant_overrides = {
        "variableValues": {
            "customer_name": customer_name,
            "vehicle_info": vehicle_info,
            "service_advisor_name": service_advisor_name,
            "service_type": service_type,
            "organization_name": organization_name,
            "location": location,
            "is_demo": "true"
        }
    }

    if call_id:
        assistant_overrides["variableValues"]["call_id"] = str(call_id)

    payload = {
        "assistantId": settings.DEMO_ASSISTANT_ID,
        "phoneNumberId": settings.PHONE_NUMBER_ID,
        "customer": customer,
        "assistantOverrides": assistant_overrides,
        "name": f"Demo Call: {customer_name}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/call",
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"VAPI API error: {str(e)}")
        logger.error(f"Request payload: {payload}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response content: {e.response.text}")
        raise
```

### 4. Schema Definitions

#### 4.1. Demo Call Create Schema

```python
class DemoCallCreate(BaseModel):
    """Schema for creating a demo call."""

    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    service_advisor_name: Optional[str] = None
    service_type: Optional[str] = "Feedback Call"
    organization_id: Optional[UUID] = None
```

#### 4.2. Demo Call Response Schema

```python
class DemoCallResponse(BaseModel):
    """Schema for demo call response."""

    call_id: int
    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    campaign_id: Optional[int] = None
    status: str
    vapi_response: Optional[Dict[str, Any]] = None
```

## Integration Flow

1. **Frontend Form Submission**:

   - User enters customer name, phone number, vehicle details
   - Form submits to `/api/v1/calls/demo` endpoint

2. **Backend Processing**:

   - Creates or gets a Demo Campaign
   - Creates a Service Record marked as `is_demo=True`
   - Creates a Call entry marked as `is_demo=True`
   - Returns the call ID to frontend

3. **Call Initiation**:

   - Frontend makes a second request to `/api/v1/calls/demo/{call_id}/initiate`
   - Backend retrieves all necessary data from database
   - Backend calls VAPI service to initiate the call
   - Updates database records with call status

4. **Completion**:
   - Call progress and completion are handled by webhooks (same as regular calls)
   - Demo calls are flagged in the database to distinguish them from regular calls

## Configuration Requirements

1. Set up environment variables:

   - `DEMO_ASSISTANT_ID`: The ID of the VAPI assistant to use for demo calls
   - `PHONE_NUMBER_ID`: The ID of the phone number to use for outbound calls
   - `VAPI_API_KEY`: The API key for accessing VAPI services

2. Database schema changes:
   - Add `is_demo` boolean field to Call and ServiceRecord models
   - Update queries to filter demo calls separately from regular calls

## Error Handling

- Implement proper error handling for VAPI API calls
- Update call and service record status to "Failed" if the call cannot be initiated
- Return appropriate HTTP error codes and messages to the frontend

## Testing

1. Test creation of demo call records
2. Test initiation of demo calls with VAPI
3. Verify proper status updates in the database
4. Test error handling scenarios
