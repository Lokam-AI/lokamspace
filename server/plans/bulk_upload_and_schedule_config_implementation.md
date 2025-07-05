# Bulk Upload and Schedule Configuration Implementation Plan

## Overview

This document outlines the implementation plan for two features in the AutoPulse application:

1. **Bulk Upload for Calls**: Allow users to upload a CSV file with call data, create a campaign, and add calls to the database in Ready status
2. **Call Schedule Configuration**: Fix existing issues with saving and retrieving custom schedule configuration settings for each organization

## 1. Bulk Upload Feature

### Current Status

- Frontend components already exist (BulkUploadModal.tsx)
- API endpoints for CSV template and bulk upload are partially implemented
- Bug in campaign creation: campaign is created with null "created_by" field

### Implementation Plan

#### 1.1 Backend Fixes and Enhancements

##### 1.1.1 Fix Campaign Creation Bug

- Update the `bulk_upload_calls` method in `CallService` to include the user ID

```python
@staticmethod
async def bulk_upload_calls(
    organization_id: UUID,
    campaign_name: str,
    calls_data: List[Dict],
    db: AsyncSession,
    current_user_id: int = None  # Add user ID parameter
) -> Dict:
    # Create campaign with user ID
    campaign = Campaign(
        name=campaign_name,
        organization_id=organization_id,
        status="Active",
        created_by=current_user_id,  # Set created_by field
        modified_by=current_user_id  # Set modified_by field
    )
```

- Update the `/bulk-upload` endpoint to pass the user ID

```python
@router.post("/bulk-upload", status_code=status.HTTP_201_CREATED)
async def bulk_upload_calls(
    upload_data: BulkCallUpload,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    result = await CallService.bulk_upload_calls(
        organization_id=organization.id,
        campaign_name=upload_data.campaign_name,
        calls_data=upload_data.calls,
        db=db,
        current_user_id=current_user.id  # Pass user ID
    )
```

##### 1.1.2 Enhance CSV Template Endpoint

- Create a dedicated endpoint for CSV template if not already exists

```python
@router.get("/bulk-upload/template", response_model=CSVTemplateResponse)
async def get_csv_template() -> Any:
    """
    Get CSV template for bulk call upload.
    """
    return CallService.get_csv_template()
```

##### 1.1.3 Improve Call Creation in Bulk Upload

- Update the call creation logic to set status to "Ready" instead of "Scheduled"
- Add validation for required fields
- Handle Excel file format in addition to CSV
- Add error handling for invalid data

#### 1.2 Frontend Enhancements

##### 1.2.1 CSV Parsing Improvements

- Enhance the CSV parsing in `BulkUploadModal.tsx` to handle edge cases:
  - Empty cells
  - Extra columns
  - Different CSV formats (comma vs. semicolon)
  - UTF-8 encoding issues
- Add support for Excel files using a library like `xlsx`

##### 1.2.2 User Experience Improvements

- Add progress indicator during upload
- Improve error reporting to show specific row errors
- Add validation for CSV file format and size before upload
- Add drag and drop support for file upload

##### 1.2.3 UI Feedback

- Show summary of import results (successful vs. failed records)
- Allow users to download error report for failed records
- Add confirmation before submission

#### 1.3 Testing Plan

1. Unit tests for CSV parsing logic
2. Unit tests for the backend bulk upload service
3. Integration tests for the API endpoints
4. Manual testing scenarios:
   - Upload valid CSV
   - Upload CSV with missing required fields
   - Upload Excel file
   - Upload file with invalid data
   - Upload large file (performance test)
   - Test campaign creation with the uploaded data

#### 1.4 Implementation Sequence

1. Fix campaign creation bug (backend)
2. Enhance CSV template endpoint (backend)
3. Improve call creation logic (backend)
4. Implement improved CSV parsing (frontend)
5. Add UX improvements (frontend)
6. Add comprehensive error handling (both)
7. Testing and bug fixes

## 2. Call Schedule Configuration Feature

### Current Status

- Backend API endpoints for getting and updating schedule configurations exist
- Frontend component (ScheduleSettings.tsx) for managing configuration exists
- The configuration is not being saved correctly to the database
- New users get default values but changes don't persist

### Implementation Plan

#### 2.1 Backend Fixes

##### 2.1.1 Debug Schedule Configuration Saving

- Add detailed logging to the schedule config service
- Fix any issues with the JSON storage format
- Ensure config is correctly associated with organization

##### 2.1.2 Enhance Schedule Config Service

- Improve the `get_organization_schedule_config` method to ensure it's correctly retrieving organization-specific settings

```python
@staticmethod
async def get_organization_schedule_config(
    organization_id: UUID,
    campaign_id: Optional[int] = None,
    db: AsyncSession = None
) -> Optional[ScheduleConfig]:
    """
    Get schedule configuration for an organization.

    Args:
        organization_id: Organization ID
        campaign_id: Optional campaign ID filter
        db: Database session

    Returns:
        Optional[ScheduleConfig]: Schedule configuration if found
    """
    query = select(ScheduleConfig).where(
        ScheduleConfig.organization_id == organization_id
    )

    if campaign_id:
        query = query.where(ScheduleConfig.campaign_id == campaign_id)
    else:
        # For org-wide config, campaign_id should be NULL
        query = query.where(ScheduleConfig.campaign_id.is_(None))

    result = await db.execute(query)
    config = result.scalar_one_or_none()

    logger.info(f"Found config for org {organization_id}: {config}")
    return config
```

##### 2.1.3 Database Migration Check

- Ensure the ScheduleConfig table is properly migrated in the database
- Check for any constraints that might be preventing saves

#### 2.2 Frontend Fixes

##### 2.2.1 Fix API Integration

- Debug and fix the API calls in the frontend
- Ensure that error handling is properly implemented
- Add retry logic for failed API calls

##### 2.2.2 Fix State Management

- Fix any issues with state management in the ScheduleSettings component
- Ensure deep copies of objects are made to avoid reference issues
- Fix the save functionality to correctly update the configuration

##### 2.2.3 Implement Save Function

- Fix the save function to properly send updates to the backend

```typescript
const handleSave = async () => {
  setIsSaving(true);
  setError(null);
  try {
    // Prepare data for API
    const configToSave = {
      start_time: scheduleConfig.start_time,
      end_time: scheduleConfig.end_time,
      timezone: scheduleConfig.timezone,
      active_days: scheduleConfig.active_days,
      auto_call_enabled: scheduleConfig.auto_call_enabled,
    };

    // Call API to update config
    const updatedConfig = await updateScheduleConfig(configToSave);

    // Update local state with server response
    setScheduleConfig({
      start_time: updatedConfig.start_time,
      end_time: updatedConfig.end_time,
      timezone: updatedConfig.timezone,
      active_days: updatedConfig.active_days,
      auto_call_enabled: updatedConfig.auto_call_enabled,
    });

    // Update original config to match current (for change detection)
    setOriginalConfig({ ...scheduleConfig });
    setHasChanges(false);

    toast({
      title: "Settings Saved",
      description: "Your call schedule settings have been updated.",
    });
  } catch (err) {
    console.error("Failed to save schedule config:", err);
    setError("Failed to save settings. Please try again.");
    toast({
      title: "Error Saving Settings",
      description: "Could not save your schedule configuration.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};
```

#### 2.3 Testing Plan

1. Unit tests for schedule config service
2. Integration tests for API endpoints
3. Manual testing scenarios:
   - Create new configuration for new organization
   - Update existing configuration
   - Verify persistence after logout/login
   - Test default values for new users

#### 2.4 Implementation Sequence

1. Add detailed logging to identify the issue
2. Fix backend service methods
3. Check and fix database schema/migration if needed
4. Fix frontend API integration
5. Fix frontend state management
6. Implement enhanced save function
7. Test and fix any remaining bugs

## Development Timeline

### Week 1: Investigation and Backend Fixes

- Day 1-2: Investigate and fix campaign creation bug in bulk upload
- Day 3-4: Debug and fix schedule configuration saving issues
- Day 5: Add detailed logging and tests for backend services

### Week 2: Frontend Improvements

- Day 1-2: Fix CSV parsing and improve BulkUploadModal
- Day 3-4: Fix state management in ScheduleSettings
- Day 5: Implement enhanced UI feedback and error handling

### Week 3: Testing and Refinement

- Day 1-2: Integration testing of both features
- Day 3-4: Fix any bugs found during testing
- Day 5: Final polishing and documentation

## Conclusion

This implementation plan addresses both the Bulk Upload feature and the Call Schedule Configuration issues. By following this plan, we will create a robust solution that allows users to easily upload call data in bulk and configure call schedules according to their needs.
