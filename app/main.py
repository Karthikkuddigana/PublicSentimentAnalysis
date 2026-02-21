from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.youtube import router as youtube_router
from app.api.data_source import router as data_source_router
from app.api.review import router as review_router
from app.api import dashboard
from app.api import manual_reviews
from app.api import insights

app = FastAPI(title="YouTube Sentiment Ingestion API")

# ✅ Add CORS middleware here
origins = [
    "http://localhost:3000",      # React dev
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # Vite
    "https://yourdomain.com",     # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Or ["*"] for testing only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER middleware setup
app.include_router(youtube_router, prefix="/api/youtube", tags=["YouTube"])
app.include_router(data_source_router)
app.include_router(review_router)
app.include_router(dashboard.router)
app.include_router(manual_reviews.router)
app.include_router(insights.router)