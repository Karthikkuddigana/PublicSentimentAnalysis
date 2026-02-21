# app/services/ingestion_orchestrator.py

from typing import Dict
from app.services.youtube_service import run_ingestion as run_youtube_ingestion# later:
# from app.services.twitter_service import run_twitter_ingestion
# from app.services.reddit_service import run_reddit_ingestion


def run_ingestion(source: str, **kwargs) -> Dict:

    if source == "youtube":
        return run_youtube_ingestion(**kwargs)

    # elif source == "twitter":
    #     return run_twitter_ingestion(**kwargs)

    # elif source == "reddit":
    #     return run_reddit_ingestion(**kwargs)

    else:
        raise ValueError("Unsupported source")