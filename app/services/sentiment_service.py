from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "llama-3.1-8b-instant"


# =========================================================
# SENTIMENT ANALYSIS USING GROQ
# =========================================================

def analyze_sentiment(text: str, benchmark: int = 5):
    prompt = f"""
    Analyze the sentiment of the following text.
    Respond strictly in JSON format like:
    {{
        "sentiment": "Negative/Neutral/Positive",
        "confidence": 0.95
    }}

    Text: "{text}"
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    content = response.choices[0].message.content
    result = json.loads(content)

    sentiment_label = result["sentiment"].lower()
    confidence = result["confidence"]

    numeric_map = {
        "negative": -1,
        "neutral": 0,
        "positive": 1
    }

    raw_score = numeric_map.get(sentiment_label, 0)
    normalized = (raw_score + 1) / 2
    scaled_score = round(normalized * benchmark, 2)

    return {
        "sentiment": sentiment_label.capitalize(),
        "raw_score": raw_score,
        "scaled_score": scaled_score,
        "benchmark": benchmark,
        "confidence": round(float(confidence), 4)
    }


# =========================================================
# EMOTION ANALYSIS USING GROQ
# =========================================================

def analyze_emotion(text: str):

    prompt = f"""
    Detect the primary emotion in the following text.
    Choose ONLY from:
    anger, disgust, fear, joy, neutral, sadness, surprise

    Respond strictly in JSON format like:
    {{
        "emotion": "Joy",
        "confidence": 0.93
    }}

    Text: "{text}"
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content
    result = json.loads(content)

    return {
        "emotion": result["emotion"],
        "emotion_confidence": round(float(result["confidence"]), 4)
    }