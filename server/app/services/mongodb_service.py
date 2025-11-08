# FILE: app/services/mongodb_service.py

from pymongo import MongoClient
from typing import List, Optional, Dict, Any  # <-- THIS IS THE FIX
from app.utils.config import MONGO_URI, DB_NAME
from app.models.post import Post
from app.utils.constants import POST_SAVE_ERROR
from app.utils.logger import get_logger
from langchain.tools import tool
from datetime import datetime

logger = get_logger(__name__)

# === MongoDB Connection ===
def get_user_collection(linkedin_user_id: str, collection_type: str = "posts"):
    """
    Get a user-specific collection based on LinkedIn user ID.
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Sanitize user_id to create valid collection name
    safe_user_id = linkedin_user_id.replace("-", "_").replace(".", "_")
    
    # Create collection name: user_{linkedin_id}_{type}
    collection_name = f"user_{safe_user_id}_{collection_type}"
    
    return db[collection_name]

# --- NEW FUNCTION ---
def save_or_update_user_credentials(linkedin_user_id: str, access_token: str, person_urn: str):
    """
    Saves or updates a user's credentials in their 'summary' collection.
    """
    collection = get_user_collection(linkedin_user_id, "summary")
    try:
        collection.update_one(
            {"_id": "user_credentials"},  # Use a fixed ID for this special document
            {
                "$set": {
                    "linkedin_access_token": access_token,
                    "person_urn": person_urn,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True  # Create the document if it doesn't exist
        )
        logger.info(f"Successfully saved credentials for user {linkedin_user_id}")
    except Exception as e:
        logger.error(f"Failed to save credentials for user {linkedin_user_id}: {e}")

# --- NEW FUNCTION ---
def get_user_credentials(linkedin_user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a user's credentials from their 'summary' collection.
    """
    collection = get_user_collection(linkedin_user_id, "summary")
    try:
        credentials = collection.find_one({"_id": "user_credentials"})
        if credentials:
            logger.info(f"Successfully retrieved credentials for user {linkedin_user_id}")
            return credentials
        else:
            logger.warning(f"No credentials found for user {linkedin_user_id}")
            return None
    except Exception as e:
        logger.error(f"Failed to get credentials for user {linkedin_user_id}: {e}")
        return None

# --- UPDATED FUNCTION ---
@tool("save_post")
def save_post(linkedin_user_id: str, platform: str, content: str, niche: str, image_data: Optional[bytes] = None) -> Optional[str]:
    """
    Save a post to user-specific MongoDB collection.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        # Pass 'niche' to your Post model
        post = Post(platform=platform, content=content, niche=niche, image_data=image_data) 
        result = collection.insert_one(post.model_dump())
        logger.info(f"Post saved for user {linkedin_user_id} with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(POST_SAVE_ERROR.format(error=e))
        return None

def get_total_posts(linkedin_user_id: str) -> int:
    """
    Get the total number of posts for a specific user.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        count = collection.count_documents({})
        logger.info(f"Total posts for user {linkedin_user_id}: {count}")
        return count
    except Exception as e:
        logger.error(f"Failed to get total posts for user {linkedin_user_id}: {e}")
        return 0

def get_recent_posts(linkedin_user_id: str, limit: int = 10) -> List[dict]:
    """
    Get the most recent posts for a specific user.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        posts = list(collection.find().sort("_id", -1).limit(limit))
        
        for post in posts:
            post["_id"] = str(post["_id"])
        
        logger.info(f"Retrieved {len(posts)} recent posts for user {linkedin_user_id}")
        return posts
    except Exception as e:
        logger.error(f"Failed to get recent posts for user {linkedin_user_id}: {e}")
        return []

def get_posts_by_platform(linkedin_user_id: str, platform: str, limit: int = 10) -> List[dict]:
    """
    Get recent posts for a specific platform and user.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        posts = list(collection.find({"platform": platform}).sort("_id", -1).limit(limit))
        
        for post in posts:
            post["_id"] = str(post["_id"])
        
        logger.info(f"Retrieved {len(posts)} posts for user {linkedin_user_id}, platform: {platform}")
        return posts
    except Exception as e:
        logger.error(f"Failed to get posts for user {linkedin_user_id}, platform {platform}: {e}")
        return []

def get_posts_stats(linkedin_user_id: str) -> dict:
    """
    Get statistics about posts for a specific user.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        total_posts = collection.count_documents({})
        
        pipeline = [
            {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
        ]
        platform_counts = list(collection.aggregate(pipeline))
        
        platforms = {item["_id"]: item["count"] for item in platform_counts}
        
        stats = {
            "total_posts": total_posts,
            "posts_by_platform": platforms
        }
        
        logger.info(f"Posts statistics for user {linkedin_user_id}: {stats}")
        return stats
    except Exception as e:
        logger.error(f"Failed to get posts stats for user {linkedin_user_id}: {e}")
        return {"total_posts": 0, "posts_by_platform": {}}

def get_job_summary_from_summary_collection(linkedin_user_id: str) -> dict:
    """
    Fetch total completed and failed counts for a specific user.
    """
    collection = get_user_collection(linkedin_user_id, "summary")

    try:
        summary = collection.find_one({"_id": "user_credentials"}, {"_id": 0, "total_completed": 1, "total_failed": 1})
        if summary:
            total_completed = summary.get("total_completed", 0)
            total_failed = summary.get("total_failed", 0)
        else:
            # Check for old summary format (if not using 'user_credentials' doc)
            summary_old = collection.find_one()
            if summary_old:
                total_completed = summary_old.get("total_completed", 0)
                total_failed = summary_old.get("total_failed", 0)
            else:
                total_completed = 0
                total_failed = 0

        logger.info(f"Fetched summary for user {linkedin_user_id}: completed={total_completed}, failed={total_failed}")
        return {"total_completed": total_completed, "total_failed": total_failed}

    except Exception as e:
        logger.error(f"Failed to fetch summary for user {linkedin_user_id}: {e}")
        return {"total_completed": 0, "total_failed": 0}

def update_job_summary(linkedin_user_id: str, field: str, increment: int = 1) -> str:
    """
    Increment or decrement 'total_completed' or 'total_failed' for a specific user.
    """
    if field not in ["total_completed", "total_failed"]:
        msg = f"❌ Invalid field name: {field}. Must be 'total_completed' or 'total_failed'."
        logger.error(msg)
        return msg

    collection = get_user_collection(linkedin_user_id, "summary")

    try:
        # We store summary stats in the *same* doc as credentials for simplicity
        result = collection.find_one_and_update(
            {"_id": "user_credentials"}, 
            {"$inc": {field: increment}},
            upsert=True,
            return_document=True
        )

        new_value = result.get(field, 0)
        msg = f"✅ Successfully updated '{field}' for user {linkedin_user_id} by {increment}. New value: {new_value}."
        logger.info(msg)
        return msg

    except Exception as e:
        msg = f"❌ Failed to update '{field}' for user {linkedin_user_id}: {e}"
        logger.error(msg)
        return msg

def get_all_users() -> List[dict]:
    """
    Get a list of all users who have collections in the database.
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    try:
        collections = db.list_collection_names()
        
        users = {}
        for coll in collections:
            if coll.startswith("user_") and ("_posts" in coll or "_summary" in coll):
                parts = coll.split("_")
                if len(parts) >= 3:
                    if coll.endswith("_posts"):
                        user_id = "_".join(parts[1:-1])
                    elif coll.endswith("_summary"):
                        user_id = "_".join(parts[1:-1])
                    else:
                        continue
                    
                    if user_id not in users:
                        users[user_id] = {"user_id": user_id, "post_count": 0, "has_summary": False}
                    
                    if coll.endswith("_posts"):
                        users[user_id]["post_count"] = db[coll].count_documents({})
                    elif coll.endswith("_summary"):
                        users[user_id]["has_summary"] = True
        
        logger.info(f"Found {len(users)} users")
        return list(users.values())
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return []