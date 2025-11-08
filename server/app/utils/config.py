# FILE: app/utils/config.py

import os
from dotenv import load_dotenv
from app.utils.constants import MISSING_ENV_VARS_ERROR

# Load environment variables
load_dotenv(override=True)

# === API Keys for your Agent ===
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# === LinkedIn OAuth Credentials (from authRoute.py) ===
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")

# === Database (from mongodb_service.py) ===
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# === Security (from authRoute.py) ===
JWT_SECRET = os.getenv("JWT_SECRET")

# === Check for missing environment variables ===
# This list should only contain keys the *server* needs to boot.
# User-specific keys (like access_token) or request-specific
# data (like niche) are handled by your API routes.
required_vars = [
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "MONGO_URI",
    "DB_NAME",
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "JWT_SECRET",
]

missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    # Format the message from constant.py
    error_message = MISSING_ENV_VARS_ERROR.format(vars=", ".join(missing_vars))
    raise EnvironmentError(error_message)