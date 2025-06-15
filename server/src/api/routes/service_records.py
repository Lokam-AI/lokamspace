from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import func
import pandas as pd
import io
import csv
from fastapi.responses import StreamingResponse
import logging
import re
from datetime import datetime
from typing import Dict, Any
import phonenumbers

from ...db.session import get_db
from ...db.base import ServiceRecord, User, Organization, OrganizationMetric, CallMetricScore, Call
from ..dependencies import get_current_user
from src.core.constants import ServiceStatus, NPSScoreConstants, ServiceRecordColumns
from src.core.response import ResponseBuilder
from src.schemas.standard_response import StandardResponse

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()
class ServiceRecordCreate(BaseModel):
    """Model for creating a new service record"""
    customer_name: str
    email: Optional[EmailStr] = None
    vehicle_number: str
    service_type: str
    service_date: datetime
    status: str = ServiceStatus.PENDING.value


class ServiceRecordResponse(BaseModel):
    """Model for service record response"""
    id: int
    organization_id: int
    created_by: int
    created_at: datetime
    modified_by: Optional[int] = None
    modified_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class CallRecordResponse(BaseModel):
    name: str
    email: Optional[str]
    vehicle_number: Optional[str] = None
    service_detail: str
    service_date: datetime
    call_date: Optional[datetime]
    call_duration: Optional[int]
    overall_feedback: Optional[str]
    average_nps_score: Optional[float]

    class Config:
        from_attributes = True

class PaginatedCallResponse(BaseModel):
    total: int
    page: int
    limit: int
    callRecord: List[CallRecordResponse]

class AreaOfImprovement(BaseModel):
    title: str
    description: str
    sum_metric_score: Optional[int] = None

class ServiceOverviewResponse(BaseModel):
    total_service_records: int
    total_service_records_completed: int
    average_nps_score: Optional[float]
    areas_of_improvement: List[AreaOfImprovement]

    class Config:
        from_attributes = True

class BatchServiceRecordCreate(BaseModel):
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle_number: str
    service_date: datetime
    service_type: str
    service_advisor_name: str
    status: str = "PENDING"
    review_opt_in: bool = True

class BatchServiceRecordResponse(BaseModel):
    pass

class UploadResponse(BaseModel):
    success: bool
    message: str
    records_processed: int
    records_succeeded: int
    records_failed: int
    errors: Optional[List[dict]] = None
    file_type: str

def add_area_of_improvement(title: str, desc: str, organization_id: int, db: Session, result_list: list):
    if not (title and desc):
        return
    
    is_metric_available = db.query(OrganizationMetric).filter(
        OrganizationMetric.organization_id == organization_id,
        OrganizationMetric.name == title
    ).first()

    area_info = {
        "title": title,
        "description": desc
    }

    if is_metric_available:
        sum_metric_score = (
            db.query(func.sum(CallMetricScore.score))
              .filter(
                  CallMetricScore.metric_id == is_metric_available.id,
                  CallMetricScore.organization_id == organization_id
              )
              .scalar() or 0
        )
        area_info["sum_metric_score"] = sum_metric_score
    
    result_list.append(area_info)

def validate_phone_number(phone: str) -> tuple[bool, str]:
    """
    Validate phone number format.
    Returns (is_valid, error_message)
    """
    if not phone:
        return False, "Phone number is required"
    return phonenumbers.is_valid_number(phonenumbers.parse(f"+{phone}")), f"Invalid phone number: {phone}"

def validate_date(date_str: Any) -> tuple[bool, str]:
    """
    Validate date format.
    Returns (is_valid, error_message)
    """
    if pd.isna(date_str):
        return False, "Date is required"
    
    try:
        if isinstance(date_str, str):
            # Try parsing with pandas
            pd.to_datetime(date_str)
        elif isinstance(date_str, datetime):
            # Already a datetime object
            pass
        else:
            return False, f"Invalid date format: {date_str}"
        return True, ""
    except:
        return False, f"Invalid date format: {date_str}"

def validate_email(email: str) -> tuple[bool, str]:
    """
    Validate email format.
    Returns (is_valid, error_message)
    """
    if pd.isna(email):
        return True, ""  # Email is optional
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, str(email)):
        return False, f"Invalid email format: {email}"
    
    return True, ""

@router.post("/", response_model=StandardResponse[ServiceRecordResponse])
async def create_service_record(
    service_data: ServiceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        # Create service record
        service_record = ServiceRecord(
            customer_name=service_data.name,
            email=service_data.email,
            vehicle_number=service_data.vehicle_number,
            service_type=service_data.service_type,
            service_date=service_data.service_date,
            status=service_data.status,
            organization_id=current_user.organization_id,
            created_by=current_user.id
        )
        
        db.add(service_record)
        db.commit()
        db.refresh(service_record)
        
        return ResponseBuilder.success(data=service_record, message="Service record created successfully")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating service record: {str(e)}")
        return ResponseBuilder.error(message=f"Error creating service record: {str(e)}")

@router.get("/", response_model=StandardResponse[List[ServiceRecordResponse]])
async def list_service_records(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    vehicle_number: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List service records with optional filtering.
    """
    try:
        query = db.query(ServiceRecord).filter(
            ServiceRecord.organization_id == current_user.organization_id
        )
        
        # Apply filters
        if status:
            query = query.filter(ServiceRecord.status == status)
        if start_date:
            query = query.filter(ServiceRecord.service_date >= start_date)
        if end_date:
            query = query.filter(ServiceRecord.service_date <= end_date)
        if vehicle_number:
            query = query.filter(ServiceRecord.vehicle_number.ilike(f"%{vehicle_number}%"))
        
        # Apply pagination
        records = query.order_by(ServiceRecord.service_date.desc()).offset(skip).limit(limit).all()
        response_data = [ServiceRecordResponse.model_validate(r) for r in records]

        return ResponseBuilder.success(data=response_data, message="Records fetched successfully")
        
    except Exception as e:
        logger.error(f"Error listing service records: {str(e)}")
        return ResponseBuilder.error(message=f"Error listing service records: {str(e)}")

@router.get("/overview", response_model=StandardResponse[ServiceOverviewResponse])
async def get_service_record_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview of service records for the organization"""
    organization_id = current_user.organization_id
    total_service_records = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id
    ).count()
    total_service_records_completed = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED
    ).count()
    average_nps_score = db.query(func.avg(ServiceRecord.nps_score)).filter(
        ServiceRecord.organization_id == current_user.organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED
    ).scalar() or 0
    total_detractors = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED,
        ServiceRecord.nps_score <= NPSScoreConstants.DETRACTOR_MAX
    ).count()
    areas_of_improvement = db.query(Organization).filter(
        Organization.id == organization_id
    ).all()
    areas_of_improvement_list = []
    for area in areas_of_improvement:
        add_area_of_improvement(area.area_of_imp_1_title, area.area_of_imp_1_desc, organization_id, db, areas_of_improvement_list)
        add_area_of_improvement(area.area_of_imp_2_title, area.area_of_imp_2_desc, organization_id, db, areas_of_improvement_list)
        add_area_of_improvement(area.area_of_imp_3_title, area.area_of_imp_3_desc, organization_id, db, areas_of_improvement_list)

    response_data = {
        "total_service_records": total_service_records,
        "total_service_records_completed": total_service_records_completed,
        "average_nps_score": average_nps_score,
        "total_detractors": total_detractors,
        "areas_of_improvement": areas_of_improvement_list
    }

    return ResponseBuilder.success(data=response_data, message="Overview fetched successfully")

@router.get("/calls", response_model=StandardResponse[PaginatedCallResponse])
async def get_service_calls(
    status: Optional[str] = Query(None, description="Filter by call status (completed, pending, failed) (default: all)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of records per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of service calls with optional status filtering.
    Returns call records with service details and metrics.
    """
    try:
        # Base query with joins
        query = (
            db.query(
                ServiceRecord,
                Call,
                func.avg(CallMetricScore.score).label('average_nps_score')
            )
            .join(Call, ServiceRecord.id == Call.service_record_id)
            .outerjoin(CallMetricScore, Call.id == CallMetricScore.call_id)
            .filter(ServiceRecord.organization_id == current_user.organization_id)
            .group_by(ServiceRecord.id, Call.id)
        )

        # Apply status filter if provided
        if status:
            status = status.upper()
            if status not in [s.value for s in ServiceStatus]:
                return ResponseBuilder.error(message=f"Invalid status. Must be one of: {', '.join([s.value.lower() for s in ServiceStatus])}")
            query = query.filter(Call.status == status)

        # Calculate total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        records = query.offset(offset).limit(limit).all()

        # Transform records to response format
        call_records = []
        for service_record, call, avg_score in records:
            call_records.append(
                CallRecordResponse(
                    name=service_record.customer_name,
                    email=service_record.email,
                    vehicle_number=None,  # Not in current schema
                    service_detail=service_record.service_type,
                    service_date=service_record.service_date,
                    call_date=call.call_started_at,
                    call_duration=call.duration_sec,
                    overall_feedback=service_record.overall_feedback,
                    average_nps_score=float(avg_score) if avg_score else None
                )
            )

        return ResponseBuilder.success(data=PaginatedCallResponse(
            total=total,
            page=page,
            limit=limit,
            callRecord=call_records
        ), message="Service calls fetched successfully")

    except Exception as e:
        return ResponseBuilder.error(message=f"Error fetching service calls: {str(e)}")

@router.get("/batch/template")
async def get_service_record_template(
    format: str = Query("csv", description="Template format (csv or excel)"),
    current_user: User = Depends(get_current_user)
):
    """
    Download a template for batch service record creation.
    Supports both CSV and Excel formats.
    """
    try:
        # Create template data
        template_data = {
            ServiceRecordColumns.CUSTOMER_NAME: ["John Doe"],
            ServiceRecordColumns.PHONE: ["+1234567890"],
            ServiceRecordColumns.EMAIL: ["john@example.com"],
            ServiceRecordColumns.VEHICLE_NUMBER: ["1234567890"],
            ServiceRecordColumns.SERVICE_DATE: ["2024-03-15 10:00:00"],
            ServiceRecordColumns.SERVICE_TYPE: ["Oil Change"],
            ServiceRecordColumns.SERVICE_ADVISOR_NAME: ["Jane Smith"],
            ServiceRecordColumns.STATUS: ["PENDING"],
            ServiceRecordColumns.REVIEW_OPT_IN: ["true"]
        }
        
        df = pd.DataFrame(template_data)
        
        if format.lower() == "excel":
            # Create Excel file
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Template')
            
            output.seek(0)
            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": "attachment; filename=service_records_template.xlsx"
                }
            )
        else:
            # Create CSV file
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": "attachment; filename=service_records_template.csv"
                }
            )
            
    except Exception as e:
        return ResponseBuilder.error(message=f"Error generating template: {str(e)}")

@router.post("/upload", response_model=StandardResponse[UploadResponse])
async def upload_service_records(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a CSV or Excel file containing service records.
    Validates all records and provides detailed feedback.
    """
    try:
        # Read file content
        content = await file.read()
        
        # Determine file type and read into DataFrame
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(content))
            file_type = "excel"
        elif file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
            file_type = "csv"
        else:
            return ResponseBuilder.error(message="Unsupported file format. Please upload a CSV or Excel file.")
        
        # Validate required columns
        required_columns = ServiceRecordColumns.get_required_columns()
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return ResponseBuilder.error(message=f"Missing required columns: {', '.join(missing_columns)}")
        
        # Initialize counters and error list
        records_processed = len(df)
        records_succeeded = 0
        records_failed = 0
        errors = []
        
        # Process each record
        for index, row in df.iterrows():
            row_errors = []
            record_dict = {k: v if pd.notna(v) else None for k, v in row.items()}
            # Validate required fields
            if not record_dict.get(ServiceRecordColumns.CUSTOMER_NAME):
                row_errors.append("Customer name is required")
            
            if not record_dict.get(ServiceRecordColumns.PHONE):
                row_errors.append("Phone number is required")
            else:
                is_valid_phone, phone_error = validate_phone_number(str(record_dict[ServiceRecordColumns.PHONE]))
                if not is_valid_phone:
                    row_errors.append(phone_error)
            
            if not record_dict.get(ServiceRecordColumns.VEHICLE_NUMBER):
                row_errors.append("Vehicle number is required")
            else:
                vehicle_number = str(record_dict[ServiceRecordColumns.VEHICLE_NUMBER]).replace(" ", "").upper()
                if len(vehicle_number) < 4:
                    row_errors.append("Vehicle number must be at least 4 characters")
                record_dict[ServiceRecordColumns.VEHICLE_NUMBER] = vehicle_number
            
            # Validate date
            is_valid_date, date_error = validate_date(record_dict[ServiceRecordColumns.SERVICE_DATE])
            if not is_valid_date:
                row_errors.append(date_error)
            
            # Validate email if provided
            if record_dict.get(ServiceRecordColumns.EMAIL):
                is_valid_email, email_error = validate_email(str(record_dict[ServiceRecordColumns.EMAIL]))
                if not is_valid_email:
                    row_errors.append(email_error)
            
            # Validate status if provided
            if record_dict.get(ServiceRecordColumns.STATUS):
                if record_dict[ServiceRecordColumns.STATUS] not in [s.value for s in ServiceStatus]:
                    row_errors.append(f"Invalid status: {record_dict[ServiceRecordColumns.STATUS]}")
            
            if row_errors:
                records_failed += 1
                errors.append({
                    "row": index + 2,  # +2 because Excel/CSV is 1-based and has header
                    "data": record_dict,
                    "errors": row_errors
                })
                logger.error(f"Validation errors in row {index + 2}: {row_errors}")
                continue
            
            try:
                # Convert service_date to datetime if it's a string
                if isinstance(record_dict[ServiceRecordColumns.SERVICE_DATE], str):
                    record_dict[ServiceRecordColumns.SERVICE_DATE] = pd.to_datetime(record_dict[ServiceRecordColumns.SERVICE_DATE])
                
                # Create service record
                service_record = ServiceRecord(
                    organization_id=current_user.organization_id,
                    customer_name=record_dict[ServiceRecordColumns.CUSTOMER_NAME],
                    phone=record_dict[ServiceRecordColumns.PHONE],
                    email=record_dict.get(ServiceRecordColumns.EMAIL),
                    vehicle_number=record_dict[ServiceRecordColumns.VEHICLE_NUMBER],
                    service_date=record_dict[ServiceRecordColumns.SERVICE_DATE],
                    service_type=record_dict[ServiceRecordColumns.SERVICE_TYPE],
                    service_advisor_name=record_dict[ServiceRecordColumns.SERVICE_ADVISOR_NAME],
                    status=record_dict.get(ServiceRecordColumns.STATUS, ServiceStatus.PENDING.value),
                    review_opt_in=record_dict.get(ServiceRecordColumns.REVIEW_OPT_IN, True),
                    created_by=current_user.id
                )
                
                db.add(service_record)
                records_succeeded += 1
                
            except Exception as e:
                records_failed += 1
                errors.append({
                    "row": index + 2,
                    "data": record_dict,
                    "errors": [str(e)]
                })
                logger.error(f"Error processing row {index + 2}: {str(e)}")
        
        # Commit all successful records
        db.commit()
        
        return UploadResponse(
            success=records_failed == 0,
            message=f"Processed {records_processed} records. {records_succeeded} succeeded, {records_failed} failed.",
            records_processed=records_processed,
            records_succeeded=records_succeeded,
            records_failed=records_failed,
            errors=errors if errors else None,
            file_type=file_type
        )
        
    except pd.errors.EmptyDataError:
        return ResponseBuilder.error(message="The uploaded file is empty.")
    except pd.errors.ParserError:
        return ResponseBuilder.error(message="Error parsing the file. Please ensure it's a valid CSV or Excel file.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing upload: {str(e)}")
        return ResponseBuilder.error(message=f"Error processing upload: {str(e)}")


@router.get("/{service_id}", response_model=StandardResponse[ServiceRecordResponse])
async def get_service_record(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        return ResponseBuilder.error(message="Service record not found")
    
    return ResponseBuilder.success(data=service_record, message="Service record fetched successfully")

@router.put("/{service_id}", response_model=StandardResponse[ServiceRecordResponse])
async def update_service_record(
    service_id: int,
    service_data: ServiceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        return ResponseBuilder.error(message="Service record not found")
    
    # Update fields
    for field, value in service_data.model_dump().items():
        old_val = getattr(service_record, field, None)
        print(f"Updating {field}: {old_val} -> {value}")
        setattr(service_record, field, value)
    
    

    service_record.modified_by = current_user.id
    service_record.modified_at = datetime.utcnow()
    
    db.commit()
    db.refresh(service_record)
    updated = db.query(ServiceRecord).filter(ServiceRecord.id == service_id).first()
    print(updated.customer_name, updated.email, updated.service_type)  # etc.
    
    return ResponseBuilder.success(data=service_record, message="Service record updated successfully")

@router.delete("/{service_id}")
async def delete_service_record(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        return ResponseBuilder.error(message="Service record not found")
    
    db.delete(service_record)
    db.commit()
    
    return ResponseBuilder.success(message="Service record deleted successfully")

