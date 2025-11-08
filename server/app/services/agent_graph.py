# FILE: app/services/agent_graph.py

from __future__ import annotations
import os
from typing import Optional, Dict, TypedDict
from datetime import datetime, timezone

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, END

from app.services.linkedin_service import post_to_linkedin, upload_media_to_linkedin
from app.services.gemini_service import generate_gemini_image
from app.services.mongodb_service import save_post
from app.utils.logger import get_logger
from app.utils.config import OPENAI_API_KEY
from app.models.agent import AgentState  # This is your Pydantic BaseModel
from app.utils.constants import (
    TOPIC_GENERATOR_SYSTEM_PROMPT,
    TOPIC_GENERATOR_USER_PROMPT,
    CONTENT_CREATOR_SYSTEM_PROMPT,
    CONTENT_CREATOR_USER_PROMPT,
    REVIEWER_SYSTEM_PROMPT,
    POST_EXECUTOR_SUCCESS_MESSAGE,
    POST_EXECUTOR_FAILURE_MESSAGE,
)

# === Logger ===
logger = get_logger(__name__)

# === LLM Configuration ===
MAX_ITERATIONS = 1
llm = ChatOpenAI(model="gpt-4o", temperature=0.7, openai_api_key=OPENAI_API_KEY)

# === LangGraph Tools ===
posting_tools = [post_to_linkedin, generate_gemini_image, save_post]
posting_agent = create_react_agent(model=llm, tools=posting_tools)

# ------------------------------------------------------------
# 🧩 Node Implementations
# ------------------------------------------------------------

# LangGraph merges the returned dictionary into the state.
# We define what each node returns using TypedDict for clarity.
class TopicGeneratorOutput(TypedDict):
    topic: str

def topic_generator_node(state: AgentState) -> TopicGeneratorOutput:
    """Generate a topic for the given niche."""
    try:
        niche = state.niche # <-- FIX: Direct access
        prompt = ChatPromptTemplate.from_messages([
            ("system", TOPIC_GENERATOR_SYSTEM_PROMPT),
            ("user", TOPIC_GENERATOR_USER_PROMPT.format(niche=niche)),
        ])
        chain = prompt | llm
        result = chain.invoke({"niche": niche})
        topic = result.content.strip()
        logger.info("✅ Topic generated: %s", topic)
        return {"topic": topic}
    except Exception as e:
        logger.exception("❌ Topic generation failed: %s", e)
        fallback = f"{state.niche} insight {datetime.utcnow().isoformat()}"
        return {"topic": fallback}

class ContentCreatorOutput(TypedDict):
    post_draft: str

def content_creator_node(state: AgentState) -> ContentCreatorOutput:
    """Generate a LinkedIn post draft from the topic."""
    try:
        topic = state.topic # <-- FIX: Direct access
        prompt = ChatPromptTemplate.from_messages([
            ("system", CONTENT_CREATOR_SYSTEM_PROMPT),
            ("user", CONTENT_CREATOR_USER_PROMPT.format(topic=topic)),
        ])
        chain = prompt | llm
        result = chain.invoke({"topic": topic})
        post_draft = result.content.strip()
        logger.info("✍️ Post draft created successfully.")
        return {"post_draft": post_draft}
    except Exception as e:
        logger.exception("❌ Content creation failed: %s", e)
        return {"post_draft": f"{state.topic} — quick insight"}

class ReviewerOutput(TypedDict):
    is_approved: bool
    iteration_count: int
    final_post: Optional[str] # Only set if approved
    post_draft: Optional[str] # Only set if NOT approved

def reviewer_node(state: AgentState) -> ReviewerOutput:
    """Review and refine post drafts until approved or max iterations reached."""
    current_iter = state.iteration_count + 1 # <-- FIX: Direct access
    post_draft = state.post_draft           # <-- FIX: Direct access
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", REVIEWER_SYSTEM_PROMPT),
            ("user", f"Critique this draft:\n\n{post_draft}"),
        ])
        chain = prompt | llm
        result = chain.invoke({"post_draft": post_draft})
        content = result.content.strip()
    except Exception as e:
        logger.exception("⚠️ Review step failed: %s", e)
        content = "APPROVED" if current_iter >= MAX_ITERATIONS else "Minor rewrite suggested."

    if "APPROVED" in content.upper() or current_iter >= MAX_ITERATIONS:
        if current_iter >= MAX_ITERATIONS and "APPROVED" not in content.upper():
            logger.warning("⚠️ Max iterations reached, forcing approval.")
        logger.info("✅ Post approved.")
        return {
            "is_approved": True,
            "final_post": post_draft,
            "iteration_count": current_iter,
        }
    else:
        logger.info("🔁 Rework suggested (iteration %d): %s", current_iter, content[:80])
        return {
            "post_draft": content, # Return the critique as the new draft
            "is_approved": False,
            "iteration_count": current_iter,
        }

class ImageGenOutput(TypedDict):
    image_asset_urn: Optional[str]

def image_generation_node(state: AgentState) -> ImageGenOutput:
    """Generate image using Gemini and upload to LinkedIn."""
    final_post = state.final_post # <-- FIX: Direct access
    if not final_post:
        logger.warning("⚠️ No final_post available, skipping image generation.")
        return {"image_asset_urn": None}

    TEMP_IMAGE_PATH = "temp_dummy_image.png" 

    try:
        # --- GET CREDENTIALS FROM STATE ---
        access_token = state.linkedin_access_token # <-- FIX: Direct access
        person_urn = state.person_urn             # <-- FIX: Direct access

        if not access_token or not person_urn:
            logger.error("❌ Missing credentials in image_generation_node.")
            return {"image_asset_urn": None}
        
        # 1️⃣ Generate dummy image bytes
        image_bytes = generate_gemini_image.invoke(final_post)

        if not image_bytes:
            logger.warning("⚠️ Image generation returned no data. Skipping image.")
            return {"image_asset_urn": None}

        # 2️⃣ Save bytes temporarily to disk
        with open(TEMP_IMAGE_PATH, "wb") as f:
            f.write(image_bytes)
        logger.info(f"✅ Dummy image saved at {TEMP_IMAGE_PATH}")

        # 3️⃣ Upload to LinkedIn
        asset_urn = upload_media_to_linkedin(
            file_path=TEMP_IMAGE_PATH,
            access_token=access_token,
            person_urn=person_urn
        )

        # 4️⃣ Clean up temp file
        if os.path.exists(TEMP_IMAGE_PATH):
            os.remove(TEMP_IMAGE_PATH)
            logger.info("🧹 Temporary image file removed.")

        # 5️⃣ Return result
        if asset_urn and asset_urn.startswith("urn:li:asset:"):
            logger.info("🖼️ Image asset URN generated: %s", asset_urn)
            return {"image_asset_urn": asset_urn}
        else:
            logger.warning("⚠️ Image upload failed, post will be text-only.")
            return {"image_asset_urn": None}

    except Exception as e:
        logger.exception("❌ Image generation error: %s", e)
        return {"image_asset_urn": None}

class PostExecutorOutput(TypedDict):
    messages: list[dict[str, str]]

def post_executor_node(state: AgentState) -> PostExecutorOutput:
    """Post content to LinkedIn and save record in MongoDB."""
    
    # --- GET ALL DATA FROM STATE (using direct access) ---
    final_post = state.final_post
    access_token = state.linkedin_access_token
    person_urn = state.person_urn
    user_id = state.user_id
    niche = state.niche
    image_asset_urn = state.image_asset_urn

    # Add detailed logging
    logger.info("Starting post_executor_node with state:")
    logger.info(f"- User ID: {user_id}")
    logger.info(f"- Has Access Token: {bool(access_token)}")
    logger.info(f"- Has Person URN: {bool(person_urn)}")
    logger.info(f"- Post Length: {len(final_post) if final_post else 0}")
    logger.info(f"- Has Image URN: {bool(image_asset_urn)}")

    if not all([final_post, access_token, person_urn, user_id, niche]):
        missing = []
        if not final_post: missing.append("final_post")
        if not access_token: missing.append("access_token")
        if not person_urn: missing.append("person_urn")
        if not user_id: missing.append("user_id")
        if not niche: missing.append("niche")
        
        error_msg = f"Missing critical data: {', '.join(missing)}"
        logger.error(f"❌ {error_msg}")
        return {"messages": [{"role": "system", "content": f"post_failed: {error_msg}"}]}

    try:
        # 1️⃣ Post to LinkedIn with explicit parameters
        linkedin_post_params = {
            "post_content": final_post,
            "access_token": access_token,
            "person_urn": person_urn,
            "image_urn": image_asset_urn
        }
        logger.info("Calling LinkedIn API with params:")
        logger.info(f"- Content Length: {len(linkedin_post_params['post_content'])}")
        logger.info(f"- Token Prefix: {access_token[:10]}...")
        logger.info(f"- Person URN: {person_urn}")
        
        linkedin_response = post_to_linkedin.invoke(linkedin_post_params)
        
        if "Error:" in str(linkedin_response):
            raise Exception(f"LinkedIn API error: {linkedin_response}")
            
        logger.info("✅ LinkedIn post successful: %s", linkedin_response)

        # 2️⃣ Save post to MongoDB
        mongo_response = save_post.invoke({
            "linkedin_user_id": user_id,
            "platform": "LinkedIn",
            "content": final_post,
            "niche": niche
        })
        
        if not mongo_response:
            logger.warning("⚠️ MongoDB save returned None")
            
        logger.info("✅ Post saved to MongoDB with ID: %s", mongo_response)

        return {"messages": [{"role": "system", "content": "post_success"}]}
        
    except Exception as e:
        error_msg = str(e)
        logger.exception(f"❌ Post execution failed: {error_msg}")
        return {"messages": [{"role": "system", "content": f"post_failed: {error_msg}"}]}


# ------------------------------------------------------------
# 🧭 Decision Function
# ------------------------------------------------------------
def decide_to_rework(state: AgentState) -> str:
    return "image_generation" if state.is_approved else "content_creator" # <-- FIX: Direct access


# ------------------------------------------------------------
# ⚙️ Graph Builder
# ------------------------------------------------------------
builder = StateGraph(AgentState)
builder.add_node("topic_generator", topic_generator_node)
builder.add_node("content_creator", content_creator_node)
builder.add_node("reviewer", reviewer_node)
builder.add_node("image_generation", image_generation_node)
builder.add_node("post_executor", post_executor_node)

builder.set_entry_point("topic_generator")
builder.add_edge("topic_generator", "content_creator")
builder.add_edge("content_creator", "reviewer")
builder.add_conditional_edges("reviewer", decide_to_rework, {
    "image_generation": "image_generation",
    "content_creator": "content_creator",
})
builder.add_edge("image_generation", "post_executor")
builder.add_edge("post_executor", END)

# === Compile the Agent ===
app = builder.compile()
logger.info("✅ Agent graph compiled successfully.")