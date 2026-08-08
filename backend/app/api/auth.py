import uuid
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.user import User
from app.services.github import GitHubService
from app.schemas.all_schemas import UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth sign-in flow."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GITHUB_CLIENT_ID environment variable not set."
        )
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_CALLBACK_URL}"
        f"&scope=read:user,repo"
    )
    return RedirectResponse(url=github_auth_url)

@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """Callback receiver that exchanges OAuth code for user profiles and logs in."""
    # 1. Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_CALLBACK_URL
            }
        )
        if res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve GitHub authorization access token.")
        
        token_data = res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail=f"Invalid authorization token response: {token_data}")

    # 2. Query GitHub API for user details
    try:
        profile = await GitHubService.get_user_profile(access_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    github_id = str(profile.get("id"))
    username = profile.get("login")
    email = profile.get("email")
    avatar_url = profile.get("avatar_url")

    # 3. Query existing user or create a new user profile
    user = db.query(User).filter(User.github_id == github_id).first()
    if not user:
        # Check if username conflicts
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            username = f"{username}_{uuid.uuid4().hex[:4]}"
            
        user = User(
            github_id=github_id,
            username=username,
            email=email,
            avatar_url=avatar_url,
            github_access_token=access_token
        )
        db.add(user)
    else:
        user.github_access_token = access_token
        user.email = email or user.email
        user.avatar_url = avatar_url or user.avatar_url

    db.commit()
    db.refresh(user)

    # 4. Create JWT access token and redirect to frontend callback
    jwt_token = create_access_token(data={"sub": user.username})
    
    redirect_url = (
        f"{settings.FRONTEND_URL}/callback"
        f"?token={jwt_token}"
        f"&user_id={user.id}"
        f"&username={user.username}"
        f"&plan={user.plan}"
    )
    if user.email:
        redirect_url += f"&email={user.email}"
    if user.avatar_url:
        import urllib.parse
        redirect_url += f"&avatar_url={urllib.parse.quote(user.avatar_url)}"
        
    return RedirectResponse(url=redirect_url)

@router.post("/register", response_model=Token)
async def email_register(payload: dict, db: Session = Depends(get_db)):
    """Simple credentials registration fallback for offline demonstration mockups."""
    username = payload.get("username", "").strip()
    email = payload.get("email", "").strip()
    
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
        
    # Check duplicate
    existing = db.query(User).filter((User.username == username) | (User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists.")
        
    user = User(
        username=username,
        email=email,
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    jwt_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "plan": user.plan
    }

@router.post("/login", response_model=Token)
async def email_login(payload: dict, db: Session = Depends(get_db)):
    """Simple credentials login fallback for offline testing."""
    username = payload.get("username", "").strip()
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Create a mock user on the fly to avoid blockages
        user = User(
            username=username,
            email=f"{username}@example.com",
            avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    jwt_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "plan": user.plan
    }

@router.get("/me", response_model=UserResponse)
async def read_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the currently logged in user profile."""
    return current_user

class UpgradeRequest(BaseModel):
    plan: str

@router.post("/upgrade", response_model=UserResponse)
async def upgrade_user_plan(
    payload: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upgrade user subscription plan (simulation)."""
    if payload.plan not in ["free", "pro", "ultra"]:
        raise HTTPException(status_code=400, detail="Invalid plan identifier.")
    current_user.plan = payload.plan
    db.commit()
    db.refresh(current_user)
    return current_user
