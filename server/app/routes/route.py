# FILE: app/routes/route.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.models.agent import AgentState
from app.services.mongodb_service import (
    get_job_summary_from_summary_collection,
    get_total_posts,
    get_user_credentials  # <-- 1. IMPORT get_user_credentials
)
from app.utils.logger import get_logger
from app.services.agent_graph import app
from app.routes.authRoute import get_current_user  # <-- 2. IMPORT get_current_user

logger = get_logger(__name__)
router = APIRouter(prefix="/agent", tags=["Agent Workflow"])

class NicheRequest(BaseModel):
    niche: str

@router.post("/start")
def run_agent_workflow(
    req: NicheRequest,
    user_id: str = Depends(get_current_user)  # <-- 3. ADD dependency
):
    """
    Run the AI agent workflow for a given niche and user.
    """
    try:
        # --- 4. FETCH CREDENTIALS ---
        credentials = get_user_credentials(user_id)
        if not credentials:
            logger.error(f"No credentials found for user {user_id}. Login required.")
            raise HTTPException(status_code=401, detail="Could not find user credentials. Please log in again.")
        
        access_token = credentials.get("linkedin_access_token")
        person_urn = credentials.get("person_urn")
        
        if not access_token or not person_urn:
            logger.error(f"Incomplete credentials for user {user_id}. Login required.")
            raise HTTPException(status_code=401, detail="Incomplete credentials. Please log in again.")
        # --- END OF FETCH ---

        # --- 5. PASS CREDENTIALS to AgentState ---
        state = AgentState(
            niche=req.niche,
            user_id=user_id,
            linkedin_access_token=access_token,  # <-- PASS TOKEN
            person_urn=person_urn,              # <-- PASS URN
            topic=None,
            post_draft=None,
            final_post=None,
            image_asset_urn=None,
            is_approved=False,
            iteration_count=0,
        )
        # --- END OF PASS ---

        logger.info("🚀 Starting workflow for niche: %s, User: %s", req.niche, user_id)

        final_state = None
        for s in app.stream(state):
            node_name = list(s.keys())[0]
            logger.info("➡ Node executed: %s", node_name)
            final_state = s

        logger.info("🎯 Workflow finished successfully for niche: %s", req.niche)
        return {"status": "success", "message": "Workflow completed", "final_state": final_state}

    except Exception as e:
        logger.exception("❌ Workflow execution failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.get("/summary")
def get_jobs_summary(
    user_id: str = Depends(get_current_user)  # <-- 6. ADD dependency
):
    """
    ✅ Returns total completed and failed jobs for the logged-in user.
    """
    try:
        logger.info("Fetching job summary for user: %s", user_id)

        # --- 7. PASS user_id to functions ---
        job_summary = get_job_summary_from_summary_collection(user_id)  
        total_posts = get_total_posts(user_id)
        
        total_failed = job_summary.get("total_failed", 0)
        logger.info("Job summary fetched: completed=%d, failed=%d", total_posts, total_failed)
        
        return {
            "total_completed": total_posts,
            "total_failed": total_failed
        }

    except Exception as e:
        logger.exception("Failed to fetch job summary: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch job summary: {str(e)}")