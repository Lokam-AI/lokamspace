from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from ...core.security import verify_password, get_password_hash, create_access_token
from ...db.base import User, Organization
from ...db.session import get_db
from pydantic import BaseModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    organization_name: str
    organization_address: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create new user and organization."""
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create organization
    org = Organization(
        name=user_data.organization_name,
        address=user_data.organization_address
    )
    db.add(org)
    db.flush()
    
    # Create user
    password_hash, salt = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash,
        salt=salt,
        organization_id=org.id,
        is_admin=True  # First user of organization is admin
    )
    
    db.add(user)
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "org": org.id}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return token."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "org": user.organization_id}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
