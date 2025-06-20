from enum import Enum
import os

# JWT Constants
class JWTConstants:
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

# User Roles
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

# Service Status
class ServiceStatus(str, Enum):
    READY_TO_DIAL = "READY_TO_DIAL"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# Call Status
class CallStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

    # NPS Score Constants
class NPSScoreConstants:
    DETRACTOR_MAX: int = 6  # Scores 0-6 are considered detractors

class ServiceRecordColumns:
    """Constants for service record column names"""
    # Required fields
    CUSTOMER_NAME = "customer_name"
    PHONE = "phone"
    SERVICE_DATE = "service_date"
    SERVICE_TYPE = "service_type"
    SERVICE_ADVISOR_NAME = "service_advisor_name"
    VEHICLE_NUMBER = "vehicle_number"
    
    # Optional fields
    EMAIL = "email"
    STATUS = "status"
    REVIEW_OPT_IN = "review_opt_in"
    
    # Audit fields
    CREATED_BY = "created_by"
    CREATED_AT = "created_at"
    MODIFIED_BY = "modified_by"
    MODIFIED_AT = "modified_at"
    
    # Organization field
    ORGANIZATION_ID = "organization_id"
    
    @classmethod
    def get_required_columns(cls) -> list[str]:
        """Get list of required columns for service records"""
        return [
            cls.CUSTOMER_NAME,
            cls.PHONE,
            cls.SERVICE_DATE,
            cls.SERVICE_TYPE,
            cls.SERVICE_ADVISOR_NAME
        ]
    
    @classmethod
    def get_optional_columns(cls) -> list[str]:
        """Get list of optional columns for service records"""
        return [
            cls.EMAIL,
            cls.STATUS,
            cls.REVIEW_OPT_IN
        ]
    
    @classmethod
    def get_all_columns(cls) -> list[str]:
        """Get list of all columns for service records"""
        return (
            cls.get_required_columns() +
            cls.get_optional_columns() +
            [cls.ORGANIZATION_ID, cls.CREATED_BY, cls.CREATED_AT, 
             cls.MODIFIED_BY, cls.MODIFIED_AT]
        )


