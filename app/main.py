from fastapi import FastAPI
from app.api.youtube import router as youtube_router
from app.api.ingestion import router as ingestion_router

app = FastAPI(title="YouTube Sentiment Ingestion API")
app = FastAPI(title="Unified Sentiment Intelligence API")

app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])
# app.include_router(youtube_router, prefix="/api/youtube", tags=["YouTube"])
