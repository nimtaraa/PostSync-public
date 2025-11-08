# FILE: app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import all your routers
from app.routes.route import router as agent_router
from app.routes.authRoute import auth_router, posts_router  # <-- FIX: Import both
import uvicorn

app = FastAPI(title="LinkedIn AI Posting Agent")

# Your origins list is correct
origins = [
    "https://post-sync-public-7uqj.vercel.app",  # Your Vercel frontend URL
    "http://localhost:5173",                     # For your local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # <-- FIX: Use 'origins' variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all your routers
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(agent_router)  # <-- Make sure this is included

@app.get("/")
def root():
    return {"message": "Welcome to the LinkedIn AI Agent API 🚀"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)