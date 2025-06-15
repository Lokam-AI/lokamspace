from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from passlib.context import CryptContext
import os

from .config import settings

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # First try with passlib context
        if pwd_context.verify(plain_password, hashed_password):
            # Check if password needs rehashing
            if pwd_context.needs_update(hashed_password):
                return False
            return True
    except Exception:
        # Fallback to direct bcrypt verification if needed
        try:
            return bcrypt.checkpw(
                plain_password.encode(),
                hashed_password.encode()
            )
        except Exception:
            return False
    return False

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

def generate_salt() -> str:
    """Generate a random salt."""
    return os.urandom(32).hex()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.JWTError:
        raise ValueError("Invalid token") 