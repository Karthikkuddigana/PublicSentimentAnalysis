from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)
import torch
import torch.nn.functional as F

# =========================================================
# MODEL CONFIG
# =========================================================

SENTIMENT_MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
EMOTION_MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

# Load once (global cache)
sentiment_tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_NAME)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_NAME)

emotion_tokenizer = AutoTokenizer.from_pretrained(EMOTION_MODEL_NAME)
emotion_model = AutoModelForSequenceClassification.from_pretrained(EMOTION_MODEL_NAME)

sentiment_labels = ["negative", "neutral", "positive"]
emotion_labels = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]


# =========================================================
# SENTIMENT ANALYSIS
# =========================================================

def analyze_sentiment(text: str, benchmark: int = 5):

    inputs = sentiment_tokenizer(text, return_tensors="pt", truncation=True)
    outputs = sentiment_model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)
    probabilities = probs.detach().numpy()[0]

    sentiment_index = probabilities.argmax()
    sentiment_label = sentiment_labels[sentiment_index]

    numeric_map = {
        "negative": -1,
        "neutral": 0,
        "positive": 1
    }

    raw_score = numeric_map[sentiment_label]
    normalized = (raw_score + 1) / 2
    scaled_score = round(normalized * benchmark, 2)

    return {
        "sentiment": sentiment_label.capitalize(),
        "raw_score": raw_score,
        "scaled_score": scaled_score,
        "benchmark": benchmark,
        "confidence": round(float(probabilities[sentiment_index]), 4)
    }


# =========================================================
# EMOTION ANALYSIS
# =========================================================

def analyze_emotion(text: str):

    inputs = emotion_tokenizer(text, return_tensors="pt", truncation=True)
    outputs = emotion_model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)
    probabilities = probs.detach().numpy()[0]

    emotion_index = probabilities.argmax()
    emotion_label = emotion_labels[emotion_index]

    return {
        "emotion": emotion_label.capitalize(),
        "emotion_confidence": round(float(probabilities[emotion_index]), 4)
    }