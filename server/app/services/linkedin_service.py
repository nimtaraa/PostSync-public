# FILE: app/services/linkedin_service.py

import requests
import json
from langchain.tools import tool
from typing import Optional, Dict

# ... (other imports) ...

# === THIS IS THE FIX ===
# The @tool decorator lets invoke() map a dictionary to these arguments.
# You MUST define all the arguments you are passing from the agent.
@tool("linkedin_post")
def post_to_linkedin(
    post_content: str,
    access_token: str,
    person_urn: str,
    image_urn: Optional[str] = None
) -> str:
    """
    Publishes a post to LinkedIn.
    """
    
    # --- 1. REMOVE ALL 'os.getenv' or global variable checks for tokens ---
    # OLD, (WRONG): 
    # access_token = os.getenv("LINKEDIN_ACCESS_TOKEN") 
    # person_urn = os.getenv("LINKEDIN_PERSON_URN")
    
    # --- 2. ADD checks for the passed-in arguments ---
    if not access_token or not person_urn:
        return "Error: Missing access_token or person_urn."
        
    post_url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    
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
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
            {
                "status": "READY",
                "media": image_urn
            }
        ]

    try:
        response = requests.post(post_url, headers=headers, data=json.dumps(post_data))
        response.raise_for_status() # This will raise an error for 4xx/5xx responses
        
        response_data = response.json()
        post_id = response_data.get("id")
        
        return f"Post successful with ID: {post_id}"
        
    except Exception as e:
        print(f"❌ LINKEDIN POST FAILED: {e}")
        # Return the error message so the agent knows it failed.
        return f"Error: {e}"