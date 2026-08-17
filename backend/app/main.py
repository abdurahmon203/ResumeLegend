from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.github import router as github_router
from app.api.resume import router as resume_router
from app.api.mock_interview import router as mock_interview_router
from app.api.payment import router as payment_router

# Initialize database tables on startup (resilient auto-migration fallback)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Warning: Database auto-initialization failed (e.g., PostgreSQL connection issues): {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sovereign AI-powered Resume Builder backend for developers.",
    version="1.0.0",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(github_router)
app.include_router(resume_router)
app.include_router(mock_interview_router)
app.include_router(payment_router)


@app.get("/")
async def root_ping():
    """Simple ping-pong health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": str(engine.url)
    }
