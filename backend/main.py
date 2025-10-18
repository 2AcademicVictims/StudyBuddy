"""
Main FastAPI Application
Multi-LLM Voice Chat Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from app.routers import chat

# Create FastAPI app
app = FastAPI(
    title="Multi-LLM Study Buddy API",
    description="Backend for Multi-LLM Voice Chat with intelligent routing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, tags=["chat"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Multi-LLM Study Buddy API",
        "status": "running",
        "endpoints": {
            "websocket": "/ws",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.services.llm_router import llm_router
    
    # Check if API keys are configured (not just present)
    api_keys_configured = {
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")) and not os.getenv("ANTHROPIC_API_KEY").startswith("your_"),
        "openai": bool(os.getenv("OPENAI_API_KEY")) and not os.getenv("OPENAI_API_KEY").startswith("your_"),
        "google": bool(os.getenv("GOOGLE_API_KEY")) and not os.getenv("GOOGLE_API_KEY").startswith("your_"),
        "groq": bool(os.getenv("GROQ_API_KEY")) and not os.getenv("GROQ_API_KEY").startswith("your_")
    }
    
    # Get actual model availability from router
    available_models = llm_router.get_available_models() if hasattr(llm_router, 'get_available_models') else []
    model_status = llm_router.api_key_status if hasattr(llm_router, 'api_key_status') else {}
    
    return {
        "status": "healthy" if available_models else "degraded",
        "api_keys_configured": api_keys_configured,
        "available_models": available_models,
        "model_status": model_status,
        "total_models": len(available_models),
        "message": f"{len(available_models)}/4 AI models available" if available_models else "⚠️ No AI models configured. Please add API keys to .env file"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
