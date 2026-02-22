import os
import json
import requests
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from app.services.sentiment_service import analyze_sentiment, analyze_emotion
from app.repositories.review_repository import save_reviews_to_supabase
from app.repositories.youtube_repository import save_youtube_comments


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

YOUTUBE_API_KEY: Optional[str] = os.getenv("YOUTUBE_API_KEY")
SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

if not YOUTUBE_API_KEY:
    raise RuntimeError("YOUTUBE_API_KEY not configured")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_COMMENTS_URL = "https://www.googleapis.com/youtube/v3/commentThreads"


# =========================================================
# VIDEO SEARCH
# =========================================================

def search_videos(brand: str, title_keyword: str, max_results: int = 5) -> List[str]:
    """
    Search YouTube videos using brand + keyword.
    Returns list of video IDs.
    """
    query = f"{brand} {title_keyword}"

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }

    response = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()
    return [item["id"]["videoId"] for item in data.get("items", [])]


# =========================================================
# COMMENT FETCHING WITH PAGINATION + SENTIMENT
# =========================================================

def fetch_comments(
    video_id: str,
    benchmark: int = 5,
    max_comments: int = 100
) -> List[Dict]:
    """
    Fetch comments for a video with sentiment scoring.
    Supports pagination up to max_comments.
    """
    comments: List[Dict] = []
    next_page_token = None

    while len(comments) < max_comments:
        params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": min(100, max_comments - len(comments)),
            "textFormat": "plainText",
            "key": YOUTUBE_API_KEY,
        }

        if next_page_token:
            params["pageToken"] = next_page_token

        response = requests.get(YOUTUBE_COMMENTS_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        for item in data.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            text = snippet["textDisplay"]

            sentiment_data = analyze_sentiment(text, benchmark)
            emotion_data = analyze_emotion(text)

            comments.append({
                "source": "youtube",
                "video_id": video_id,
                "author": snippet.get("authorDisplayName"),
                "text": text,
                "published_at": snippet.get("publishedAt"),
                "like_count": snippet.get("likeCount", 0),

                # Sentiment
                "sentiment": sentiment_data["sentiment"],
                "raw_score": sentiment_data["raw_score"],
                "scaled_score": sentiment_data["scaled_score"],
                "benchmark": sentiment_data["benchmark"],
                "sentiment_confidence": sentiment_data["confidence"],

                # Emotion
                "emotion": emotion_data["emotion"],
                "emotion_confidence": emotion_data["emotion_confidence"],

                "fetched_at": datetime.utcnow().isoformat(),
            })

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break
    return comments


# =========================================================
# STORAGE HELPERS
# =========================================================

def _generate_storage_path(brand: str) -> Path:
    now = datetime.utcnow()
    date_str = now.strftime("%Y-%m-%d")

    base_path = (
        Path("data")
        / "youtube"
        / brand.lower().replace(" ", "_")
        / date_str
    )

    base_path.mkdir(parents=True, exist_ok=True)
    return base_path


def save_to_csv(data: List[Dict], brand: str, keyword: str) -> Optional[str]:
    if not data:
        return None

    base_path = _generate_storage_path(brand)
    timestamp = datetime.utcnow().strftime("%H%M%S")

    filename = base_path / f"run_{timestamp}_{keyword.replace(' ', '_')}.csv"

    pd.DataFrame(data).to_csv(filename, index=False)
    _write_metadata(base_path, brand, keyword, len(data), str(filename))

    return str(filename)


def save_to_excel(data: List[Dict], brand: str, keyword: str) -> Optional[str]:
    if not data:
        return None

    base_path = _generate_storage_path(brand)
    timestamp = datetime.utcnow().strftime("%H%M%S")

    filename = base_path / f"run_{timestamp}_{keyword.replace(' ', '_')}.xlsx"

    pd.DataFrame(data).to_excel(filename, index=False)

    return str(filename)


def save_to_supabase(data: List[Dict]) -> str:
    if not supabase:
        raise RuntimeError("Supabase not configured")

    supabase.table("youtube_comments").insert(data).execute()
    return "Inserted into Supabase"


def _write_metadata(
    base_path: Path,
    brand: str,
    keyword: str,
    record_count: int,
    file_path: str
):
    metadata = {
        "brand": brand,
        "keyword": keyword,
        "records": record_count,
        "timestamp": datetime.utcnow().isoformat(),
        "file": file_path,
    }

    with open(base_path / "metadata.json", "a") as f:
        f.write(json.dumps(metadata) + "\n")


# =========================================================
# INGESTION ORCHESTRATOR
# =========================================================

def run_ingestion(
    brand: str,
    title_keyword: str,
    organization_id: str,
    storage: str = "csv",
    benchmark: int = 5,
    max_videos: int = 5,
    max_comments_per_video: int = 100,
) -> Dict:
    """
    Orchestrates full ingestion flow:
    - Search videos
    - Fetch comments
    - Apply sentiment scoring
    - Persist data
    """
    print(organization_id)
    all_comments: List[Dict] = []
    youtube_records: List[Dict] = []

    video_ids = search_videos(brand, title_keyword, max_results=max_videos)
    print(video_ids)
    for video_id in video_ids:

        comments = fetch_comments(
            video_id=video_id,
            benchmark=benchmark,
            max_comments=max_comments_per_video
        )

        for comment in comments:

            # Build record for youtube_comments table
            youtube_records.append({
                "organization_id": organization_id,
                "source": "youtube",
                "video_id": video_id,
                "author": comment.get("author"),
                "text": comment.get("text"),
                "published_at": comment.get("published_at"),
                "like_count": comment.get("like_count"),
                "sentiment": comment.get("sentiment"),
                "raw_score": comment.get("raw_score"),
                "scaled_score": comment.get("scaled_score"),
                "benchmark": benchmark,
                "sentiment_confidence": comment.get("sentiment_confidence"),
                "emotion": comment.get("emotion"),
                "emotion_confidence": comment.get("emotion_confidence"),
                "fetched_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            })

        all_comments.extend(comments)

    # ✅ Insert into youtube_comments table
    save_youtube_comments(youtube_records)

    file_path = None

    if storage == "csv":
        file_path = save_to_csv(all_comments, brand, title_keyword)

    elif storage == "excel":
        file_path = save_to_excel(all_comments, brand, title_keyword)

    elif storage == "supabase":
        pass  # already inserted into youtube_comments

    else:
        raise ValueError("Invalid storage type. Use: csv | excel | supabase")

    return {
        "records": len(all_comments),
        "videos_processed": len(video_ids),
        "file": file_path,
        "benchmark": benchmark
    }

# def run_ingestion(
#     brand: str,
#     title_keyword: str,
#     storage: str = "csv",
#     benchmark: int = 5,
#     max_videos: int = 5,
#     max_comments_per_video: int = 100,
# ) -> Dict:
    """
    Orchestrates full ingestion flow:
    - Search videos
    - Fetch comments
    - Apply sentiment scoring
    - Persist data
    """

    all_comments: List[Dict] = []
    data = {
        "organization_id": [],
        "data_source_id": [],
        "review_text": [],
        "review_date": [],
        "created_at": []
    }
    video_ids = search_videos(brand, title_keyword, max_results=max_videos)
    for video_id in video_ids:
        comments = fetch_comments(
            video_id=video_id,
            benchmark=benchmark,
            max_comments=max_comments_per_video
        )
        for comment in comments:
            data["organization_id"].append("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
            data["data_source_id"].append("a796930e-a39a-412a-8480-5eb1d50b753e")
            data["review_text"].append(comment["text"])
            data["review_date"].append(comment["published_at"])
            data["created_at"].append(datetime.utcnow())
        all_comments.extend(comments)
    save_reviews_to_supabase(data)
    file_path = None

    if storage == "csv":
        file_path = save_to_csv(all_comments, brand, title_keyword)

    elif storage == "excel":
        file_path = save_to_excel(all_comments, brand, title_keyword)

    elif storage == "supabase":
        save_to_supabase(all_comments)

    else:
        raise ValueError("Invalid storage type. Use: csv | excel | supabase")

    return {
        "records": len(all_comments),
        "file": file_path,
        "videos_processed": len(video_ids),
        "benchmark": benchmark
    }