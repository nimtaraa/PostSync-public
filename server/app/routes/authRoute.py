import json
import os
import requests
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta

from app.services.Linkedin_credentials import set_credentials
from app.services.mongodb_service import (
    save_post,
    get_total_posts,
    get_recent_posts,
    get_posts_by_platform,
    get_posts_stats,
    get_job_summary_from_summary_collection,
    update_job_summary,
    get_all_users
)

# === LinkedIn OAuth Router ===
auth_router = APIRouter(prefix="/auth/linkedin", tags=["LinkedIn OAuth"])

LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI = "https://post-sync-public-7uqj.vercel.app/auth/callback"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# === Helper Functions ===
def create_jwt_token(user_data: dict) -> str:
    """Create JWT token with user data."""
    payload = {
        "user_id": user_data["id"],
        "name": user_data["name"],
        "email": user_data.get("email"),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str = Header(...)) -> str:
    """
    Extract LinkedIn user_id from JWT token in Authorization header.
    
    Args:
        authorization: Bearer token from header
    
    Returns:
        str: LinkedIn user ID
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    payload = verify_jwt_token(token)
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    return user_id

# === LinkedIn OAuth Endpoints ===

@auth_router.post("/token")
def get_access_token(data: dict):
    """Exchange authorization code for access token."""
    code = data.get("code")
    redirect_uri = data.get("redirect_uri") or REDIRECT_URI

    print("\n=================== LINKEDIN TOKEN DEBUG ===================")
    print(f"Received code: {code}")
    print(f"Received redirect_uri: {redirect_uri}")
    print("============================================================\n")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": LINKEDIN_CLIENT_ID,
        "client_secret": LINKEDIN_CLIENT_SECRET,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    print("➡️ Sending POST to LinkedIn token endpoint:")
    print(json.dumps(payload, indent=2))
    print("============================================================\n")

    res = requests.post(TOKEN_URL, data=payload, headers=headers)
    print(f"⬅️ LinkedIn token response status: {res.status_code}")
    print(f"Response body:\n{res.text}\n")

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    token_data = res.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in response")

    print("✅ Access Token received successfully!")
    return token_data


@auth_router.get("/me")
def get_user_info(authorization: str = Header(...)):
    """
    Retrieve LinkedIn user info and create JWT token for app authentication.
    This endpoint now returns both user info and a JWT token.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    access_token = authorization.replace("Bearer ", "")
    headers = {"Authorization": f"Bearer {access_token}"}

    print("\n=================== LINKEDIN USER DEBUG ===================")
    print(f"Authorization header: {authorization}")
    print("============================================================\n")

    res = requests.get(USERINFO_URL, headers=headers)
    print(f"⬅️ LinkedIn /userinfo status: {res.status_code}")
    print(f"Response:\n{res.text}\n")

    if res.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token invalid or revoked")
    elif res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    data = res.json()

    user_id = data.get("sub")
    person_urn = f"urn:li:person:{user_id}"
    
    # Store LinkedIn credentials for posting
    set_credentials(access_token, person_urn)
    
    # Prepare user data
    user_data = {
        "id": user_id,
        "name": data.get("name"),
        "email": data.get("email"),
        "picture": data.get("picture"),
        "locale": data.get("locale"),
    }
    
    # Create JWT token for subsequent API calls
    jwt_token = create_jwt_token(user_data)
    
    # Return user data with JWT token
    return {
        **user_data,
        "jwt_token": jwt_token,  # Frontend should use this for API calls
        "linkedin_access_token": access_token  # Keep for LinkedIn API operations
    }


# === Posts API Router ===
posts_router = APIRouter(prefix="/api", tags=["posts"])

# === Request/Response Models ===
class PostCreate(BaseModel):
    platform: str
    content: str
    image_data: Optional[bytes] = None

class PostStats(BaseModel):
    total_posts: int
    posts_by_platform: dict

class JobSummary(BaseModel):
    total_completed: int
    total_failed: int

# === Posts Endpoints ===

@posts_router.post("/posts")
async def create_post(
    post: PostCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new post for the authenticated user."""
    post_id = save_post(
        linkedin_user_id=user_id,
        platform=post.platform,
        content=post.content,
        image_data=post.image_data
    )
    
    if post_id:
        return {
            "success": True,
            "post_id": post_id,
            "message": f"Post saved successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to save post")

@posts_router.get("/posts/count")
async def count_posts(user_id: str = Depends(get_current_user)):
    """Get total number of posts for the authenticated user."""
    count = get_total_posts(user_id)
    return {"total_posts": count}

@posts_router.get("/posts/recent")
async def recent_posts(
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get recent posts for the authenticated user."""
    posts = get_recent_posts(user_id, limit)
    return {"posts": posts, "count": len(posts)}

@posts_router.get("/posts/platform/{platform}")
async def posts_by_platform(
    platform: str,
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get posts by platform for the authenticated user."""
    posts = get_posts_by_platform(user_id, platform, limit)
    return {"platform": platform, "posts": posts, "count": len(posts)}

@posts_router.get("/posts/stats")
async def posts_statistics(user_id: str = Depends(get_current_user)):
    """Get post statistics for the authenticated user."""
    stats = get_posts_stats(user_id)
    return stats

@posts_router.get("/summary")
async def get_summary(user_id: str = Depends(get_current_user)):
    """Get job summary for the authenticated user."""
    summary = get_job_summary_from_summary_collection(user_id)
    return summary

@posts_router.put("/summary/{field}")
async def update_summary(
    field: str,
    increment: int = 1,
    user_id: str = Depends(get_current_user)
):
    """Update job summary field for the authenticated user."""
    if field not in ["total_completed", "total_failed"]:
        raise HTTPException(
            status_code=400,
            detail="Field must be 'total_completed' or 'total_failed'"
        )
    
    message = update_job_summary(user_id, field, increment)
    return {"message": message}

@posts_router.get("/users")
async def list_users():
    """Get list of all users (admin endpoint - consider adding auth here)."""
    users = get_all_users()
    return {"users": users, "count": len(users)}

@posts_router.get("/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    """Get current authenticated user's ID."""
    return {"user_id": user_id}


# === Main Application Setup ===
# In your main.py, include both routers:
# app.include_router(auth_router)
# app.include_router(posts_router)