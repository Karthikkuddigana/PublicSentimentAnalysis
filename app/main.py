from fastapi import FastAPI
from app.api.youtube import router as youtube_router

app = FastAPI(title="YouTube Sentiment Ingestion API")

app.include_router(youtube_router, prefix="/api/youtube", tags=["YouTube"])
