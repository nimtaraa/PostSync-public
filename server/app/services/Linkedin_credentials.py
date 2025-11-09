from typing import Optional, Tuple
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global variables to store credentials
_access_token: Optional[str] = None
_person_urn: Optional[str] = None

def set_credentials(access_token: str, person_urn: str) -> None:
    """Set LinkedIn credentials globally."""
    global _access_token, _person_urn
    
    if not access_token or not person_urn:
        logger.error("❌ Invalid credentials provided: token=%s, urn=%s", 
                    bool(access_token), bool(person_urn))
        return
        
    _access_token = access_token
    _person_urn = person_urn
    logger.info("✅ Credentials set successfully: urn=%s", person_urn)

def get_credentials() -> Tuple[Optional[str], Optional[str]]:
    """Get stored LinkedIn credentials."""
    if not _access_token or not _person_urn:
        logger.warning("⚠️ No credentials found")
        
    return _access_token, _person_urn
