"""
Database models package.
Import all models here so Alembic can discover them.
"""

from .base import Base
from .organization import Organization
from .user import User
from .campaign import Campaign
from .service_record import ServiceRecord
from .call import Call
from .transcript import Transcript
from .audio_file import AudioFile
from .kpi import KPI
from .booking import Booking
from .inquiry import Inquiry
from .tag import Tag
from .schedule_config import ScheduleConfig
from .payment_history import PaymentHistory
from .plan import Plan
from .dms_integration import DMSIntegration
from .setting import Setting
from .audit_log import AuditLog
from .role import Role

# For Alembic discovery
__all__ = [
    "Base",
    "Organization",
    "User",
    "Campaign",
    "ServiceRecord",
    "Call",
    "Transcript",
    "AudioFile",
    "KPI",
    "Booking",
    "Inquiry",
    "Tag",
    "ScheduleConfig",
    "PaymentHistory",
    "Plan",
    "DMSIntegration",
    "Setting",
    "AuditLog",
    "Role",
]
