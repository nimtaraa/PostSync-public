from pymongo import MongoClient
from typing import List, Optional
from app.utils.config import MONGO_URI, DB_NAME
from app.models.post import Post
from app.utils.constants import POST_SAVE_ERROR
from app.utils.logger import get_logger
from langchain.tools import tool
from datetime import datetime

logger = get_logger(__name__)

# === MongoDB Connection ===
def get_collection():
    client = MongoClient(MONGO_URI)
    db = client["linkedin_automation"]
    return db["posts"]

def get_user_collection():
    """Get the user collection from MongoDB."""
    client = MongoClient(MONGO_URI)
    db = client["linkedin_automation"]
    return db["users"]


def get_or_create_user(user_id: str, email: str) -> dict:
    """
    Check if user exists by email. If not, create new user.
    
    Args:
        user_id (str): LinkedIn user ID
        email (str): User's email address
    
    Returns:
        dict: User information with post count
    """
    collection = get_user_collection()
    
    try:
        # Check if user already exists
        existing_user = collection.find_one({"email": email})
        
        if existing_user:
            logger.info(f"User already exists: {email}")
            
            # Get user's total post count
            total_posts = get_user_post_count(email)
            
            return {
                "email": email,
                "user_id": existing_user["user_id"],
                "total_posts": total_posts,
                "is_new_user": False
            }
        else:
            # Create new user
            new_user = {
                "user_id": user_id,
                "email": email
            }
            
            collection.insert_one(new_user)
            logger.info(f"New user created: {email}")
            
            return {
                "email": email,
                "user_id": user_id,
                "total_posts": 0,
                "is_new_user": True
            }
            
    except Exception as e:
        logger.error(f"Error in get_or_create_user: {e}")
        raise


def get_user_post_count(email: str) -> int:
    """
    Get total post count for a specific user.
    
    Args:
        email (str): User's email address
    
    Returns:
        int: Total number of posts
    """
    collection = get_collection()
    
    try:
        count = collection.count_documents({"user_email": email})
        logger.info(f"User {email} has {count} posts")
        return count
        
    except Exception as e:
        logger.error(f"Failed to get user post count for {email}: {e}")
        return 0
    


@tool("save_post")
def save_post(user_email: str, niche: str, description: str) -> Optional[str]:
    """
    Save a post to MongoDB.

    Args:
        user_email (str): Email of the user creating the post.
        niche (str): Post niche/category.
        description (str): Post description/content.

    Returns:
        Optional[str]: MongoDB inserted post ID if successful.
    """
    collection = get_collection()
    try:
        post_data = {
            "user_email": user_email,
            "niche": niche,
            "description": description,
            "posted_date": datetime.utcnow()
        }
        
        result = collection.insert_one(post_data)
        logger.info(f"Post saved successfully with ID: {result.inserted_id} for user: {user_email}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(POST_SAVE_ERROR.format(error=e))
        return None


def get_user_posts(email: str, limit: int = 10) -> List[dict]:
    """
    Get posts for a specific user.

    Args:
        email (str): User's email address.
        limit (int): Number of posts to retrieve. Default is 10.

    Returns:
        List[dict]: List of user's posts, sorted by newest first.
    """
    collection = get_collection()
    try:
        posts = list(collection.find({"user_email": email}).sort("posted_date", -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            post["_id"] = str(post["_id"])
            # Convert datetime to string
            if "posted_date" in post:
                post["posted_date"] = post["posted_date"].isoformat()
        
        logger.info(f"Retrieved {len(posts)} posts for user: {email}")
        return posts
    except Exception as e:
        logger.error(f"Failed to get posts for user {email}: {e}")
        return []

def get_total_posts() -> int:
    """
    Get the total number of posts in the database.

    Returns:
        int: Total count of posts.
    """
    collection = get_collection()
    try:
        count = collection.count_documents({})
        logger.info(f"Total posts in database: {count}")
        return count
    except Exception as e:
        logger.error(f"Failed to get total posts: {e}")
        return 0

def get_recent_posts(limit: int = 10) -> List[dict]:
    """
    Get the most recent posts from the database.

    Args:
        limit (int): Number of recent posts to retrieve. Default is 10.

    Returns:
        List[dict]: List of recent posts, sorted by newest first.
    """
    collection = get_collection()
    try:
        posts = list(collection.find().sort("_id", -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            post["_id"] = str(post["_id"])
        
        logger.info(f"Retrieved {len(posts)} recent posts")
        return posts
    except Exception as e:
        logger.error(f"Failed to get recent posts: {e}")
        return []

def get_posts_by_platform(platform: str, limit: int = 10) -> List[dict]:
    """
    Get recent posts for a specific platform.

    Args:
        platform (str): Platform name (e.g., "LinkedIn").
        limit (int): Number of posts to retrieve. Default is 10.

    Returns:
        List[dict]: List of posts for the specified platform.
    """
    collection = get_collection()
    try:
        posts = list(collection.find({"platform": platform}).sort("_id", -1).limit(limit))
        
        # Convert ObjectId to string
        for post in posts:
            post["_id"] = str(post["_id"])
        
        logger.info(f"Retrieved {len(posts)} posts for platform: {platform}")
        return posts
    except Exception as e:
        logger.error(f"Failed to get posts for platform {platform}: {e}")
        return []

def get_posts_stats() -> dict:
    """
    Get statistics about posts in the database.

    Returns:
        dict: Statistics including total posts, posts by platform, etc.
    """
    collection = get_collection()
    try:
        total_posts = collection.count_documents({})
        
        # Count posts by platform
        pipeline = [
            {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
        ]
        platform_counts = list(collection.aggregate(pipeline))
        
        # Format the results
        platforms = {item["_id"]: item["count"] for item in platform_counts}
        
        stats = {
            "total_posts": total_posts,
            "posts_by_platform": platforms
        }
        
        logger.info(f"Posts statistics: {stats}")
        return stats
    except Exception as e:
        logger.error(f"Failed to get posts stats: {e}")
        return {"total_posts": 0, "posts_by_platform": {}}

def get_job_summary_from_summary_collection() -> dict:
    """
    Fetch total completed and failed counts from the summary_collection.

    Returns:
        dict: { "total_completed": int, "total_failed": int }
    """
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db["summary_collection"]

    try:
        summary = collection.find_one()
        if summary:
            total_completed = summary.get("total_completed", 0)
            total_failed = summary.get("total_failed", 0)
        else:
            total_completed = 0
            total_failed = 0

        logger.info("Fetched summary: completed=%d, failed=%d", total_completed, total_failed)
        return {"total_completed": total_completed, "total_failed": total_failed}

    except Exception as e:
        logger.error("Failed to fetch summary: %s", e)
        return {"total_completed": 0, "total_failed": 0}

def update_job_summary(field: str, increment: int = 1) -> str:
    """
    Increment or decrement 'total_completed' or 'total_failed' by 1 
    and return a log message.

    Args:
        field (str): Either 'total_completed' or 'total_failed'.
        increment (int): +1 to increase or -1 to decrease.

    Returns:
        str: Log message indicating success or failure.
    """
    if field not in ["total_completed", "total_failed"]:
        msg = f"❌ Invalid field name: {field}. Must be 'total_completed' or 'total_failed'."
        logger.error(msg)
        return msg

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db["summary_collection"]

    try:
        result = collection.find_one_and_update(
            {},
            {"$inc": {field: increment}},
            upsert=True,
            return_document=True
        )

        new_value = result.get(field, 0)
        msg = f"✅ Successfully updated '{field}' by {increment}. New value: {new_value}."
        logger.info(msg)
        return msg

    except Exception as e:
        msg = f"❌ Failed to update '{field}': {e}"
        logger.error(msg)
        return msg

__all__ = [
    'get_or_create_user',
    'save_post',
    'get_user_posts',
    'get_total_posts',
    'get_recent_posts',
    'get_posts_stats',
    'get_job_summary_from_summary_collection',
    'update_job_summary'
]