# Organization Settings Integration Plan

## Overview

This document outlines the plan for integrating the organization settings page in the frontend with the backend services. The goal is to ensure all fields in the organization settings UI are properly connected to the backend, stored in the database, and can be retrieved and updated through appropriate API endpoints.

## 1. Frontend Organization Settings Fields Analysis

The current organization settings page (`client/src/components/settings/OrganizationSettings.tsx`) contains the following fields:

| Field                          | Input Type | Description                                   |
| ------------------------------ | ---------- | --------------------------------------------- |
| Organization Name              | Text       | Name of the organization                      |
| Organization Email             | Email      | Primary email for the organization            |
| Organization Location          | CitySearch | Location using city search component          |
| Customer Feedback Agent Number | Tel        | Phone number for customer feedback AI agent   |
| Booking Agent Number           | Tel        | Phone number for appointment booking AI agent |
| Inquiry Agent Number           | Tel        | Phone number for general inquiries AI agent   |
| Organization ID                | Text       | Read-only UUID for the organization           |
| Call Concurrency Limit         | Number     | Maximum concurrent outbound calls (read-only) |

## 2. Backend Model Analysis

### Current Organization Model Fields

The organization model (`server/app/models/organization.py`) has the following fields:

| Field                  | Type          | Notes                                       |
| ---------------------- | ------------- | ------------------------------------------- |
| id                     | UUID          | Primary key                                 |
| name                   | String        | Organization name                           |
| email                  | String        | Organization email                          |
| phone_feedback         | String        | Feedback agent phone number                 |
| phone_support          | String        | Support phone number                        |
| phone_service          | String        | Service phone number                        |
| description            | Text          | Organization description                    |
| location               | Text          | Organization location (currently just text) |
| call_concurrency_limit | Integer       | Maximum concurrent calls                    |
| service_types          | Array[String] | Types of services offered                   |
| focus_areas            | Array[String] | Business focus areas                        |
| hipaa_compliant        | Boolean       | HIPAA compliance flag                       |
| pci_compliant          | Boolean       | PCI compliance flag                         |
| plan_id                | Integer       | Subscription plan ID                        |
| credit_balance         | Numeric       | Available credit balance                    |

### Current Organization Schema

The organization schema (`server/app/schemas/organization.py`) includes:

- `OrganizationBase`: Basic fields
- `OrganizationCreate`: For creating organizations
- `OrganizationUpdate`: For updating organizations
- `OrganizationDB`: For database representation
- `OrganizationResponse`: For API responses

## 3. Gap Analysis

### Field Mapping

| Frontend Field                 | Backend Field          | Status                                     |
| ------------------------------ | ---------------------- | ------------------------------------------ |
| Organization Name              | name                   | ✅ Exists                                  |
| Organization Email             | email                  | ✅ Exists                                  |
| Organization Location          | location               | ⚠️ Exists but needs structure modification |
| Customer Feedback Agent Number | phone_feedback         | ✅ Exists                                  |
| Booking Agent Number           | phone_service          | ✅ Exists but naming mismatch              |
| Inquiry Agent Number           | phone_support          | ✅ Exists but naming mismatch              |
| Organization ID                | id                     | ✅ Exists                                  |
| Call Concurrency Limit         | call_concurrency_limit | ✅ Exists                                  |

### Required Changes

1. **Location Field Structure**:

   - Current: Simple text field in the database
   - Needed: Structure to store city value and label from CitySearch component

2. **Phone Number Field Naming**:

   - Align naming between frontend and backend for consistency
   - Clarify the purpose of each phone number field

3. **API Integration**:
   - Connect frontend form to the existing update organization endpoint
   - Add validation for phone numbers and other fields
   - Implement proper error handling

## 4. Implementation Plan

### 4.1 Backend Updates

#### 4.1.1 Update Organization Model

1. Modify the `location` field to store structured city data:

```python
# Update in server/app/models/organization.py
location_city = Column(String(255))  # City name (e.g., "New York, NY, USA")
location_value = Column(String(100))  # City value (e.g., "new-york")
```

2. Rename phone fields for clarity (optional, but recommended):

```python
# Update in server/app/models/organization.py
# Rename these fields for clarity
phone_feedback = Column(String(20))  # Keep as is
phone_booking = Column(String(20))   # Renamed from phone_service
phone_inquiry = Column(String(20))   # Renamed from phone_support
```

#### 4.1.2 Update Organization Schema

1. Update the schema to match the model changes:

```python
# Update in server/app/schemas/organization.py
class OrganizationBase(BaseModel):
    # Existing fields...
    location_city: Optional[str] = None
    location_value: Optional[str] = None
    phone_feedback: Optional[str] = None
    phone_booking: Optional[str] = None  # Renamed from phone_service
    phone_inquiry: Optional[str] = None  # Renamed from phone_support
```

2. Create a specialized schema for the organization settings page:

```python
# Add to server/app/schemas/organization.py
class OrganizationSettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    location_city: Optional[str] = None
    location_value: Optional[str] = None
    phone_feedback: Optional[str] = None
    phone_booking: Optional[str] = None
    phone_inquiry: Optional[str] = None
```

#### 4.1.3 Create Database Migration

Create an Alembic migration to add the new fields and rename existing ones:

```bash
# Command to generate migration
alembic revision --autogenerate -m "update_organization_location_and_phone_fields"
```

#### 4.1.4 Update Organization Service

Enhance the `update_organization` method in `organization_service.py` to handle the new fields:

```python
# Update in server/app/services/organization_service.py
@staticmethod
async def update_organization_settings(
    db: AsyncSession,
    organization_id: UUID,
    settings_data: OrganizationSettingsUpdate
) -> Organization:
    """
    Update organization settings.

    Args:
        organization_id: Organization ID
        settings_data: Updated organization settings
        db: Database session

    Returns:
        Organization: Updated organization
    """
    # Get organization
    organization = await OrganizationService.get_organization(
        db=db,
        organization_id=organization_id
    )

    # Update organization fields
    update_data = settings_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(organization, field, value)

    # Save changes
    await db.commit()
    await db.refresh(organization)

    return organization
```

#### 4.1.5 Update or Create API Endpoint

Create a dedicated endpoint for organization settings in `organizations.py`:

```python
# Add to server/app/api/v1/endpoints/organizations.py
@router.put("/settings", response_model=OrganizationResponse)
async def update_organization_settings(
    settings_update: OrganizationSettingsUpdate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update organization settings.

    Args:
        settings_update: Updated organization settings
        organization: Current organization
        current_user: Current authenticated user
        db: Database session

    Returns:
        OrganizationResponse: Updated organization
    """
    return await OrganizationService.update_organization_settings(
        db=db,
        organization_id=organization.id,
        settings_data=settings_update
    )
```

### 4.2 Frontend Updates

#### 4.2.1 Create API Client for Organization Settings

Create or update the API client for organization settings:

```typescript
// Add to client/src/api/endpoints/organizations.ts
import { api } from "../config";

export interface OrganizationSettings {
  name?: string;
  email?: string;
  location_city?: string;
  location_value?: string;
  phone_feedback?: string;
  phone_booking?: string;
  phone_inquiry?: string;
}

export const getOrganizationSettings = async () => {
  const response = await api.get("/api/v1/organizations");
  return response.data;
};

export const updateOrganizationSettings = async (
  settings: OrganizationSettings
) => {
  const response = await api.put("/api/v1/organizations/settings", settings);
  return response.data;
};
```

#### 4.2.2 Update Organization Settings Component

Update the OrganizationSettings component to use the API:

```typescript
// Update in client/src/components/settings/OrganizationSettings.tsx
import { useState, useEffect } from "react";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/api/endpoints/organizations";

export function OrganizationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    phone_feedback: "",
    phone_booking: "",
    phone_inquiry: "",
    id: "",
    call_concurrency_limit: 1,
  });
  const [selectedCity, setSelectedCity] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // Load organization data
  useEffect(() => {
    const loadOrgData = async () => {
      try {
        setLoading(true);
        const data = await getOrganizationSettings();
        setOrgData({
          name: data.name || "",
          email: data.email || "",
          phone_feedback: data.phone_feedback || "",
          phone_booking: data.phone_booking || "",
          phone_inquiry: data.phone_inquiry || "",
          id: data.id || "",
          call_concurrency_limit: data.call_concurrency_limit || 1,
        });

        // Set city if available
        if (data.location_value && data.location_city) {
          setSelectedCity({
            value: data.location_value,
            label: data.location_city,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadOrgData();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setOrgData((prev) => ({
      ...prev,
      [id.replace("org-", "")]: value,
    }));
  };

  // Handle save
  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);

      await updateOrganizationSettings({
        name: orgData.name,
        email: orgData.email,
        location_city: selectedCity?.label,
        location_value: selectedCity?.value,
        phone_feedback: orgData.phone_feedback,
        phone_booking: orgData.phone_booking,
        phone_inquiry: orgData.phone_inquiry,
      });

      toast({
        title: "Configuration Saved",
        description: "Organization settings have been saved successfully.",
      });

      setSaving(false);
    } catch (error) {
      console.error("Failed to save organization settings:", error);
      toast({
        title: "Error",
        description: "Failed to save organization settings. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  // Rest of the component...
}
```

## 5. Testing Plan

### 5.1 Backend Testing

1. **Unit Tests**:

   - Test organization model with new fields
   - Test organization service methods
   - Test API endpoints

2. **Integration Tests**:
   - Test database migrations
   - Test API endpoints with real database

### 5.2 Frontend Testing

1. **Component Testing**:

   - Test OrganizationSettings component rendering
   - Test form validation
   - Test API integration with mocks

2. **End-to-End Testing**:
   - Test complete flow from UI to database and back
   - Test error handling and edge cases

## 6. Implementation Sequence

1. **Backend Changes**:

   - Update organization model
   - Create database migration
   - Update organization schema
   - Update/create API endpoints
   - Write tests

2. **Frontend Changes**:

   - Create/update API client
   - Update OrganizationSettings component
   - Add loading states and error handling
   - Write tests

3. **Integration and Testing**:
   - Test end-to-end flow
   - Fix any issues
   - Document changes

## 7. Rollout Plan

1. **Development**:

   - Implement changes in a feature branch
   - Run tests locally

2. **Testing**:

   - Deploy to staging environment
   - Perform manual testing
   - Fix any issues

3. **Production**:
   - Deploy backend changes first
   - Deploy frontend changes
   - Monitor for any issues

## 8. Conclusion

This plan outlines the steps needed to fully integrate the organization settings page with the backend. By following this plan, we'll ensure that all fields in the UI are properly connected to the database and can be updated through the API.

The key challenges are:

1. Structuring the location data to work with the CitySearch component
2. Ensuring consistent naming between frontend and backend
3. Proper validation and error handling

By addressing these challenges, we'll create a seamless experience for users managing their organization settings.
