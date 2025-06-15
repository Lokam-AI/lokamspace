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
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


# Call Status
class CallStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

    # NPS Score Constants
class NPSScoreConstants:
    DETRACTOR_MAX: int = 6  # Scores 0-6 are considered detractors


