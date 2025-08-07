"""
API Key service for managing API keys.
"""

import secrets
import hashlib
import json
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import ApiKey, User
from app.schemas import ApiKeyCreate, ApiKeyUpdate, ApiKeyResponse, ApiKeySecret
from fastapi import HTTPException, status


class ApiKeyService:
    """Service for managing API keys."""
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a new API key."""
        return f"sk-{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash an API key for storage."""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def mask_api_key(api_key: str) -> str:
        """Mask an API key for display."""
        if len(api_key) <= 8:
            return api_key
        return f"{api_key[:4]}...{api_key[-4:]}"
    
    @staticmethod
    async def create_api_key(
        api_key_data: ApiKeyCreate,
        organization_id: UUID,
        created_by_id: int,
        db: AsyncSession
    ) -> ApiKeySecret:
        """Create a new API key."""
        
        # Generate the API key
        raw_key = ApiKeyService.generate_api_key()
        hashed_key = ApiKeyService.hash_api_key(raw_key)
        key_preview = ApiKeyService.mask_api_key(raw_key)
        
        # Prepare webhook headers as JSON
        webhook_headers_json = None
        if api_key_data.webhook_headers:
            webhook_headers_json = json.dumps(api_key_data.webhook_headers)
        
        # Create the API key record
        api_key = ApiKey(
            name=api_key_data.name,
            secret_hash=hashed_key,
            secret_key_preview=key_preview,
            organization_id=organization_id,
            created_by_id=created_by_id,
            rate_limit_per_minute=api_key_data.rate_limit_per_minute,
            webhook_url=api_key_data.webhook_url,
            webhook_secret=api_key_data.webhook_secret,
            webhook_timeout=api_key_data.webhook_timeout,
            webhook_headers=webhook_headers_json,
        )
        
        db.add(api_key)
        await db.commit()
        await db.refresh(api_key)
        
        return ApiKeySecret(
            id=api_key.id,
            name=api_key.name,
            secret_key=raw_key
        )
    
    @staticmethod
    async def list_api_keys(
        organization_id: UUID,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[ApiKeyResponse]:
        """List API keys for an organization."""
        
        result = await db.execute(
            select(ApiKey, User.name.label("created_by_name"))
            .join(User, ApiKey.created_by_id == User.id)
            .where(ApiKey.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
            .order_by(ApiKey.created_at.desc())
        )
        
        api_keys_data = result.all()
        
        return [
            ApiKeyResponse(
                id=api_key.id,
                name=api_key.name,
                organization_id=api_key.organization_id,
                is_active=api_key.is_active,
                created_at=api_key.created_at,
                updated_at=api_key.updated_at,
                last_used_at=api_key.last_used_at,
                usage_count=api_key.usage_count,
                rate_limit_per_minute=api_key.rate_limit_per_minute,
                webhook_url=api_key.webhook_url,
                webhook_secret=api_key.webhook_secret,
                webhook_timeout=api_key.webhook_timeout,
                webhook_headers=json.loads(api_key.webhook_headers) if api_key.webhook_headers else None,
                secret_key_preview=api_key.secret_key_preview,
                created_by_name=created_by_name
            )
            for api_key, created_by_name in api_keys_data
        ]
    
    @staticmethod
    async def get_api_key(
        api_key_id: UUID,
        organization_id: UUID,
        db: AsyncSession
    ) -> Optional[ApiKeyResponse]:
        """Get a specific API key."""
        
        result = await db.execute(
            select(ApiKey, User.name.label("created_by_name"))
            .join(User, ApiKey.created_by_id == User.id)
            .where(
                and_(
                    ApiKey.id == api_key_id,
                    ApiKey.organization_id == organization_id
                )
            )
        )
        
        api_key_data = result.first()
        
        if not api_key_data:
            return None
        
        api_key, created_by_name = api_key_data
        
        return ApiKeyResponse(
            id=api_key.id,
            name=api_key.name,
            organization_id=api_key.organization_id,
            is_active=api_key.is_active,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            last_used_at=api_key.last_used_at,
            usage_count=api_key.usage_count,
            rate_limit_per_minute=api_key.rate_limit_per_minute,
            webhook_url=api_key.webhook_url,
            webhook_secret=api_key.webhook_secret,
            webhook_timeout=api_key.webhook_timeout,
            webhook_headers=json.loads(api_key.webhook_headers) if api_key.webhook_headers else None,
            secret_key_preview=api_key.secret_key_preview,
            created_by_name=created_by_name
        )
    
    @staticmethod
    async def update_api_key(
        api_key_id: UUID,
        api_key_data: ApiKeyUpdate,
        organization_id: UUID,
        db: AsyncSession
    ) -> Optional[ApiKeyResponse]:
        """Update an API key."""
        
        result = await db.execute(
            select(ApiKey).where(
                and_(
                    ApiKey.id == api_key_id,
                    ApiKey.organization_id == organization_id
                )
            )
        )
        
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            return None
        
        # Update fields
        update_data = api_key_data.model_dump(exclude_unset=True)
        
        # Handle webhook headers JSON conversion
        if "webhook_headers" in update_data:
            if update_data["webhook_headers"]:
                update_data["webhook_headers"] = json.dumps(update_data["webhook_headers"])
            else:
                update_data["webhook_headers"] = None
        
        for field, value in update_data.items():
            setattr(api_key, field, value)
        
        await db.commit()
        await db.refresh(api_key)
        
        return await ApiKeyService.get_api_key(api_key_id, organization_id, db)
    
    @staticmethod
    async def delete_api_key(
        api_key_id: UUID,
        organization_id: UUID,
        db: AsyncSession
    ) -> bool:
        """Delete an API key."""
        
        result = await db.execute(
            select(ApiKey).where(
                and_(
                    ApiKey.id == api_key_id,
                    ApiKey.organization_id == organization_id
                )
            )
        )
        
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            return False
        
        await db.delete(api_key)
        await db.commit()
        
        return True
    
    @staticmethod
    async def verify_api_key(
        raw_key: str,
        db: AsyncSession
    ) -> Optional[ApiKey]:
        """Verify an API key and return the associated record."""
        
        hashed_key = ApiKeyService.hash_api_key(raw_key)
        
        result = await db.execute(
            select(ApiKey)
            .options(selectinload(ApiKey.organization))
            .where(
                and_(
                    ApiKey.secret_hash == hashed_key,
                    ApiKey.is_active == True
                )
            )
        )
        
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_usage(
        api_key: ApiKey,
        db: AsyncSession
    ) -> None:
        """Update API key usage statistics."""
        
        api_key.last_used_at = datetime.utcnow()
        api_key.usage_count += 1
        
        await db.commit()