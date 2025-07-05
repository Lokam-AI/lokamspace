# Configuration Settings Integration Plan

## Overview

This document outlines the plan for implementing the Configuration Tab settings in the Settings page. The plan includes database schema updates, backend API implementations, and frontend integration.

## Current State Analysis

### Frontend Components

The Configuration Tab in the frontend (`ConfigurationSettings.tsx`) includes the following key sections:

1. **Business Information**

   - Company Name (to be removed)
   - Service Center Name (to be removed)
   - Description of Company
   - Description of Service Center

2. **DMS Integration**

   - Server URL
   - Timeout Seconds
   - Authentication Headers

3. **Areas to Focus**

   - Configurable list of focus areas (min 5, max 10)
   - Currently using default values in frontend state

4. **Service Types**

   - Configurable list of service types (min 5, max 10)
   - Currently using default values in frontend state

5. **Inquiry Topics**

   - Configurable list of inquiry topics (min 5, max 10)
   - Currently using default values in frontend state

6. **Knowledge Source Files**

   - Upload documents for inquiry agent reference
   - Currently only managed in frontend state

7. **Compliance Settings**
   - HIPAA Enabled toggle
   - PCI Enabled toggle

### Backend Models and Schemas

The backend has several relevant models and schemas:

1. **Organization Model**

   - Already contains `service_types`, `focus_areas`, `hipaa_compliant`, and `pci_compliant` fields
   - Has `description` field but missing service center description

2. **DMS Integration Model**

   - Exists with basic structure
   - Missing specific fields for configuration

3. **Setting Model**

   - Generic key-value structure for organization settings
   - Can be used for additional configuration items

4. **Inquiry Model**

   - Missing topics field/relationship

5. **Knowledge Source Files**
   - No model exists for uploaded knowledge files

## Implementation Plan

### 1. Database Schema Updates

#### Update Organization Model

- No changes needed for existing fields
- Service Center Name and Company Name can be removed from frontend as requested

#### Create Knowledge File Model

```python
class KnowledgeFile(Base):
    """
    KnowledgeFile model for storing inquiry knowledge source files.
    """

    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)

    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )

    # File details
    name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_type = Column(String(50), nullable=False)
    description = Column(Text)

    # Metadata
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="knowledge_files")
    user = relationship("User", back_populates="uploaded_files")
```

#### Update Inquiry Model

- Add topic field to Inquiry model:

```python
topic = Column(String(100))
```

#### Update DMS Integration Model

- Add timeout field:

```python
timeout_seconds = Column(Integer, default=20)
```

### 2. Schema Updates

#### Create Knowledge File Schema

```python
class KnowledgeFileBase(BaseModel):
    """Base knowledge file schema."""

    name: str
    file_type: str
    file_size: int
    description: Optional[str] = None


class KnowledgeFileCreate(KnowledgeFileBase):
    """Knowledge file creation schema."""

    organization_id: UUID
    uploaded_by: UUID
    file_path: str


class KnowledgeFileUpdate(BaseModel):
    """Knowledge file update schema."""

    name: Optional[str] = None
    description: Optional[str] = None


class KnowledgeFileDB(KnowledgeFileBase):
    """Knowledge file database schema."""

    id: int
    organization_id: UUID
    uploaded_by: UUID
    file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KnowledgeFileResponse(KnowledgeFileDB):
    """Knowledge file response schema."""
    pass
```

#### Update Organization Schema

- No changes needed as fields already exist

#### Update Inquiry Schema

- Add topic field

#### Update DMS Integration Schema

- Add timeout_seconds field

### 3. Service Implementation

#### Create KnowledgeFileService

```python
class KnowledgeFileService:
    """Service for managing knowledge files."""

    @staticmethod
    async def list_knowledge_files(
        db: AsyncSession,
        organization_id: UUID) -> List[KnowledgeFile]:
        # Implementation

    @staticmethod
    async def get_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID) -> KnowledgeFile:
        # Implementation

    @staticmethod
    async def create_knowledge_file(
        db: AsyncSession,
        file_data: KnowledgeFileCreate) -> KnowledgeFile:
        # Implementation

    @staticmethod
    async def update_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID,
        file_data: KnowledgeFileUpdate) -> KnowledgeFile:
        # Implementation

    @staticmethod
    async def delete_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID) -> None:
        # Implementation
```

#### Update Organization Service

- Add methods to update service types, focus areas, and inquiry topics together
- Add method to update compliance settings

#### Update DMS Integration Service

- Add or update methods to handle timeout setting

### 4. API Endpoints Implementation

#### Create Knowledge Files Endpoints

- GET /knowledge-files/ - List all knowledge files
- POST /knowledge-files/ - Upload and create a new knowledge file
- GET /knowledge-files/{file_id} - Get a specific knowledge file
- PUT /knowledge-files/{file_id} - Update a knowledge file
- DELETE /knowledge-files/{file_id} - Delete a knowledge file

#### Update Organization Endpoints

- Add PUT /organizations/configuration - Update organization configuration

#### Update Settings Endpoints

- Implement batch update for multiple settings at once

### 5. Frontend Integration

#### Update Configuration Settings Component

1. Fetch configuration data on component mount:

```typescript
useEffect(() => {
  // Fetch organization data for existing fields
  fetchOrganizationData();

  // Fetch DMS integration data
  fetchDMSIntegration();

  // Fetch knowledge files
  fetchKnowledgeFiles();
}, []);
```

2. Implement save functionality:

```typescript
const handleSaveConfiguration = async () => {
  try {
    // Update organization data
    await updateOrganizationConfig({
      description: companyDescription,
      service_center_description: serviceCenterDescription,
      focus_areas: focusAreas,
      service_types: serviceTypes,
      hipaa_compliant: hipaaEnabled,
      pci_compliant: pciEnabled,
    });

    // Update inquiry topics via settings
    await updateSettings({
      category: "inquiries",
      key: "inquiry_topics",
      value: inquiryTopics,
    });

    // Update DMS integration
    if (dmsIntegrationId) {
      await updateDMSIntegration(dmsIntegrationId, {
        server_url: serverUrl,
        timeout_seconds: timeoutSeconds,
        config: {
          auth_header: authHeader,
          api_key: apiKey,
        },
      });
    }

    // Show success toast
    toast({
      title: "Configuration Saved",
      description: "Configuration settings have been saved successfully.",
    });
  } catch (error) {
    toast({
      title: "Error Saving Configuration",
      description: "An error occurred while saving the configuration.",
      variant: "destructive",
    });
  }
};
```

3. Implement file upload functionality with backend integration:

```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  // Upload each file to the backend
  for (const file of Array.from(files)) {
    // Validate file type and size
    // ... (existing validation)

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload to backend
      const response = await uploadKnowledgeFile(formData);

      // Add to state
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: response.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
        },
      ]);

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}.`,
        variant: "destructive",
      });
    }
  }

  // Reset the input
  event.target.value = "";
};
```

### 6. API Integration Points

Connect frontend components to backend APIs:

1. Organization settings:

   - GET /api/v1/organizations/{org_id} - Fetch organization data
   - PUT /api/v1/organizations/{org_id} - Update organization settings

2. DMS Integration:

   - GET /api/v1/organizations/{org_id}/dms - Fetch DMS integration
   - POST /api/v1/organizations/{org_id}/dms - Create DMS integration
   - PUT /api/v1/organizations/{org_id}/dms/{dms_id} - Update DMS integration

3. Settings:

   - GET /api/v1/settings/by-category - Get all settings by category
   - PUT /api/v1/settings/by-key/{key} - Update setting by key

4. Knowledge Files:
   - GET /api/v1/knowledge-files - List knowledge files
   - POST /api/v1/knowledge-files - Upload file
   - DELETE /api/v1/knowledge-files/{id} - Delete file

## Implementation Order

1. Database Schema Updates

   - Create migrations for all model changes
   - Update existing models

2. Backend API Implementation

   - Create/update schemas
   - Implement services
   - Create API endpoints

3. Frontend Integration

   - Create API client functions
   - Update ConfigurationSettings component
   - Connect to backend APIs

4. Testing
   - Unit test backend services
   - Integration test APIs
   - End-to-end test with frontend

## Notes

- As requested, Company Name and Service Center Name fields will be removed from the frontend but can remain in the database for compatibility.
- The Settings model provides flexibility for adding configuration items that don't warrant their own tables.
- File upload will require proper storage configuration (local or cloud storage like S3).
- Consider implementing validation rules for the minimum and maximum number of items in configuration lists.
