"""
Schema package.
Import all schemas here for convenient imports.
"""

from app.schemas.auth import Token, TokenPayload, UserLogin, PasswordReset, PasswordChange, UserRegistration, UserInfo
from app.schemas.call import (
    CallBase,
    CallCreate,
    CallUpdate,
    CallDB,
    CallResponse,
    TranscriptSnippet,
    BulkCallUpload,
    CSVTemplateResponse,
)
from app.schemas.call_feedback import (
    CallFeedbackBase,
    CallFeedbackCreate,
    CallFeedbackUpdate,
    CallFeedbackInDB,
    CallFeedbackResponse,
)
from app.schemas.campaign import (
    CampaignBase,
    CampaignCreate,
    CampaignUpdate,
    CampaignDB,
    CampaignResponse,
)
from app.schemas.dms_integration import (
    DMSIntegrationBase,
    DMSIntegrationCreate,
    DMSIntegrationUpdate,
    DMSIntegrationResponse,
)
from app.schemas.knowledge_file import (
    KnowledgeFileBase,
    KnowledgeFileCreate,
    KnowledgeFileUpdate,
    KnowledgeFileResponse,
)
from app.schemas.organization import (
    OrganizationBase,
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationDB,
    OrganizationResponse,
    OrganizationSettingsUpdate,
)
from app.schemas.activity import (
    ActivityBase,
    ActivityResponse,
    RecentActivitiesResponse,
)
from app.schemas.service_record import (
    ServiceRecordBase,
    ServiceRecordCreate,
    ServiceRecordUpdate,
    ServiceRecordDB,
    ServiceRecordResponse,
)
from app.schemas.setting import (
    SettingBase,
    SettingCreate,
    SettingUpdate,
    SettingDB,
    SettingResponse,
    OrganizationSettingsResponse,
)
from app.schemas.tag import (
    TagBase,
    TagCreate,
    TagUpdate,
    TagInDB,
    TagResponse,
    TagsCheckResponse,
)
from app.schemas.transcript import (
    TranscriptBase,
    TranscriptCreate,
    TranscriptUpdate,
    TranscriptDB,
    TranscriptResponse,
    TranscriptSegment,
)
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserDB, UserResponse

__all__ = [
    # Auth schemas
    "Token", 
    "TokenPayload", 
    "UserLogin", 
    "PasswordReset", 
    "PasswordChange",
    "UserRegistration",
    "UserInfo",
    
    # User schemas
    "UserBase", 
    "UserCreate", 
    "UserUpdate", 
    "UserDB", 
    "UserResponse",
    
    # Organization schemas
    "OrganizationBase",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationDB",
    "OrganizationResponse",
    "OrganizationSettingsUpdate",
    
    # Campaign schemas
    "CampaignBase",
    "CampaignCreate",
    "CampaignUpdate",
    "CampaignDB",
    "CampaignResponse",
    
    # Service record schemas
    "ServiceRecordBase",
    "ServiceRecordCreate",
    "ServiceRecordUpdate",
    "ServiceRecordDB",
    "ServiceRecordResponse",
    
    # Call schemas
    "CallBase",
    "CallCreate",
    "CallUpdate",
    "CallDB",
    "CallResponse",
    "TranscriptSnippet",
    "BulkCallUpload",
    "CSVTemplateResponse",

    # Call feedback schemas
    "CallFeedbackBase",
    "CallFeedbackCreate",
    "CallFeedbackUpdate",
    "CallFeedbackInDB",
    "CallFeedbackResponse",
    
    # Tag schemas
    "TagBase",
    "TagCreate",
    "TagUpdate",
    "TagInDB",
    "TagResponse",
    "TagsCheckResponse",
    
    # Transcript schemas
    "TranscriptBase",
    "TranscriptCreate",
    "TranscriptUpdate",
    "TranscriptDB",
    "TranscriptResponse",
    "TranscriptSegment",
    
    # Setting schemas
    "SettingBase",
    "SettingCreate",
    "SettingUpdate",
    "SettingDB",
    "SettingResponse",
    "OrganizationSettingsResponse",
    
    # DMS integration schemas
    "DMSIntegrationBase",
    "DMSIntegrationCreate",
    "DMSIntegrationUpdate",
    "DMSIntegrationResponse",
    
    # Knowledge file schemas
    "KnowledgeFileBase",
    "KnowledgeFileCreate",
    "KnowledgeFileUpdate",
    "KnowledgeFileResponse",
    # Activity schemas
    "ActivityBase",
    "ActivityResponse",
    "RecentActivitiesResponse",
]
