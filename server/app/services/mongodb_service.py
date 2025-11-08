from pymongo import MongoClient
from typing import List, Optional
from app.utils.config import MONGO_URI, DB_NAME
from app.models.post import Post
from app.utils.constants import POST_SAVE_ERROR
from app.utils.logger import get_logger
from langchain.tools import tool

logger = get_logger(__name__)

# === MongoDB Connection ===
def get_user_collection(linkedin_user_id: str, collection_type: str = "posts"):
    """
    Get a user-specific collection based on LinkedIn user ID.
    
    Args:
        linkedin_user_id (str): LinkedIn user ID from JWT/auth (data.get("sub"))
        collection_type (str): Type of collection ("posts" or "summary")
    
    Returns:
        MongoDB collection object
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Sanitize user_id to create valid collection name
    # Replace any invalid characters with underscore
    safe_user_id = linkedin_user_id.replace("-", "_").replace(".", "_")
    
    # Create collection name: user_{linkedin_id}_{type}
    # Example: "user_abc123_posts", "user_abc123_summary"
    collection_name = f"user_{safe_user_id}_{collection_type}"
    
    return db[collection_name]

@tool("save_post")
def save_post(linkedin_user_id: str, platform: str, content: str, image_data: Optional[bytes] = None) -> Optional[str]:
    """
    Save a post to user-specific MongoDB collection.

    Args:
        linkedin_user_id (str): LinkedIn user ID from authentication
        platform (str): Platform name (e.g., "LinkedIn").
        content (str): Post text.
        image_data (Optional[bytes]): Optional image binary data.

    Returns:
        Optional[str]: MongoDB inserted post ID if successful.
    """
    collection = get_user_collection(linkedin_user_id, "posts")
    try:
        post = Post(platform=platform, content=content, image_data=image_data)
        result = collection.insert_one(post.model_dump())
        logger.info(f"Post saved for user {linkedin_user_id} with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(POST_SAVE_ERROR.format(error=e))
        return None

def get_total_posts(linkedin_user_id: str) -> int:
    """
    Get the total number of posts for a specific user.

    Args:
        linkedin_user_id (str): LinkedIn user ID

    Returns:
        int: Total count of posts for the user.
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

    Args:
        linkedin_user_id (str): LinkedIn user ID
        limit (int): Number of recent posts to retrieve. Default is 10.

    Returns:
        List[dict]: List of recent posts, sorted by newest first.
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

    Args:
        linkedin_user_id (str): LinkedIn user ID
        platform (str): Platform name (e.g., "LinkedIn").
        limit (int): Number of posts to retrieve. Default is 10.

    Returns:
        List[dict]: List of posts for the specified platform.
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

    Args:
        linkedin_user_id (str): LinkedIn user ID

    Returns:
        dict: Statistics including total posts, posts by platform, etc.
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

    Args:
        linkedin_user_id (str): LinkedIn user ID

    Returns:
        dict: { "total_completed": int, "total_failed": int }
    """
    collection = get_user_collection(linkedin_user_id, "summary")

    try:
        summary = collection.find_one()
        if summary:
            total_completed = summary.get("total_completed", 0)
            total_failed = summary.get("total_failed", 0)
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

    Args:
        linkedin_user_id (str): LinkedIn user ID
        field (str): Either 'total_completed' or 'total_failed'.
        increment (int): +1 to increase or -1 to decrease.

    Returns:
        str: Log message indicating success or failure.
    """
    if field not in ["total_completed", "total_failed"]:
        msg = f"❌ Invalid field name: {field}. Must be 'total_completed' or 'total_failed'."
        logger.error(msg)
        return msg

    collection = get_user_collection(linkedin_user_id, "summary")

    try:
        result = collection.find_one_and_update(
            {},
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
    
    Returns:
        List[dict]: List of user info with their collection counts
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    try:
        collections = db.list_collection_names()
        
        # Extract unique user IDs from collection names
        users = {}
        for coll in collections:
            if coll.startswith("user_") and ("_posts" in coll or "_summary" in coll):
                # Extract user_id from collection name
                parts = coll.split("_")
                if len(parts) >= 3:
                    # Reconstruct user_id (might contain underscores)
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