# FILE: app/services/linkedin_service.py

import requests
import json
import os
from langchain.tools import tool
from typing import Optional, Dict, Any

from app.utils.logger import get_logger

logger = get_logger(__name__)

# === API URLs ===
POST_URL = "https://api.linkedin.com/v2/ugcPosts"
MEDIA_REGISTER_URL = "https://api.linkedin.com/v2/assets?action=registerUpload"
PROFILE_URL = "https://api.linkedin.com/v2/me"


@tool("linkedin_post")
def post_to_linkedin(
    post_content: str,
    access_token: str,
    person_urn: str,
    image_urn: Optional[str] = None
) -> str:
    """
    Publishes a post to LinkedIn, optionally with an image.
    """
    
    logger.info("=== LinkedIn Post Attempt ===")
    logger.info(f"Content Length: {len(post_content)}")
    logger.info(f"Person URN: {person_urn}")
    logger.info(f"Has Image: {bool(image_urn)}")
    logger.info(f"Token Prefix: {access_token[:10] if access_token else 'None'}...")
    
    if not access_token:
        error_msg = "Missing LinkedIn access token"
        logger.error(error_msg)
        return f"Error: {error_msg}"
        
    if not person_urn:
        error_msg = "Missing person URN"
        logger.error(error_msg)
        return f"Error: {error_msg}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    # Test the token first
    try:
        test_response = requests.get(PROFILE_URL, headers=headers)
        if test_response.status_code != 200:
            error_msg = f"LinkedIn token validation failed: {test_response.status_code}"
            logger.error(error_msg)
            return f"Error: {error_msg}"
    except Exception as e:
        error_msg = f"Token validation request failed: {str(e)}"
        logger.error(error_msg)
        return f"Error: {error_msg}"

    post_url = POST_URL
    
    post_data = {
        "author": f"urn:li:person:{person_urn}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": post_content
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    # Add image to post_data if image_urn is provided
    if image_urn:
        logger.info(f"Attaching image URN: {image_urn}")
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
            {
                "status": "READY",
                "media": image_urn
            }
        ]
    else:
        logger.info("No image URN provided, posting text-only.")

    try:
        response = requests.post(post_url, headers=headers, data=json.dumps(post_data))
        response.raise_for_status() # This will raise an error for 4xx/5xx responses
        
        response_data = response.json()
        post_id = response_data.get("id")
        
        logger.info(f"✅ Post successful with ID: {post_id}")
        return f"Post successful with ID: {post_id}"
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"❌ LINKEDIN POST FAILED: {e.response.status_code} {e.response.text}")
        return f"Error: {e.response.status_code} {e.response.text}"
    except Exception as e:
        logger.error(f"❌ LINKEDIN POST FAILED (Unknown): {e}")
        return f"Error: {e}"


# --- THIS IS THE NEW FUNCTION YOU WERE MISSING ---

def upload_media_to_linkedin(
    file_path: str,
    access_token: str,
    person_urn: str
) -> Optional[str]:
    """
    Uploads an image to LinkedIn and returns the asset URN.
    This is a 3-step process.
    """
    
    logger.info(f"Starting image upload for user {person_urn}...")

    # 1. Register the upload
    register_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    register_payload = {
        "registerUploadRequest": {
            "recipes": [
                "urn:li:digitalmediaRecipe:feedshare-image"
            ],
            "owner": f"urn:li:person:{person_urn}",
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }
            ]
        }
    }

    try:
        reg_response = requests.post(
            MEDIA_REGISTER_URL,
            headers=register_headers,
            data=json.dumps(register_payload)
        )
        reg_response.raise_for_status()
        reg_data = reg_response.json()
        
        upload_url = reg_data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
        asset_urn = reg_data["value"]["asset"]
        
        logger.info(f"Upload registered. Asset URN: {asset_urn}")

    except Exception as e:
        logger.error(f"❌ LinkedIn media registration failed: {e}")
        return None

    # 2. Upload the image bytes
    upload_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/octet-stream" # Send as raw bytes
    }
    
    try:
        with open(file_path, 'rb') as f:
            image_bytes = f.read()
            
        upload_response = requests.post(
            upload_url,
            headers=upload_headers,
            data=image_bytes
        )
        upload_response.raise_for_status()
        
        logger.info(f"✅ Image bytes successfully uploaded to {upload_url}")
        
        # 3. Verify the upload (optional but good practice)
        # You can add a check here to ensure the asset status is READY
        
        return asset_urn

    except Exception as e:
        logger.error(f"❌ LinkedIn media byte upload failed: {e}")
        return None