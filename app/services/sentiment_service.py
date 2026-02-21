from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from typing import List

SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
EMOTION_MODEL = "j-hartmann/emotion-english-distilroberta-base"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load once
sentiment_tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL).to(device)

emotion_tokenizer = AutoTokenizer.from_pretrained(EMOTION_MODEL)
emotion_model = AutoModelForSequenceClassification.from_pretrained(EMOTION_MODEL).to(device)

sentiment_labels = ["negative", "neutral", "positive"]
emotion_labels = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]


# ============================
# BATCH SENTIMENT
# ============================

def batch_analyze_sentiment(texts: List[str], benchmark: int = 5):

    inputs = sentiment_tokenizer(
        texts,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = sentiment_model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)

    results = []

    for i in range(len(texts)):
        probabilities = probs[i].cpu().numpy()
        idx = probabilities.argmax()

        label = sentiment_labels[idx]

        numeric_map = {"negative": -1, "neutral": 0, "positive": 1}
        raw_score = numeric_map[label]
        normalized = (raw_score + 1) / 2
        scaled_score = round(normalized * benchmark, 2)

        results.append({
            "sentiment": label.capitalize(),
            "raw_score": raw_score,
            "scaled_score": scaled_score,
            "benchmark": benchmark,
            "sentiment_confidence": round(float(probabilities[idx]), 4)
        })

    return results


# ============================
# BATCH EMOTION
# ============================

def batch_analyze_emotion(texts: List[str]):

    inputs = emotion_tokenizer(
        texts,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = emotion_model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)

    results = []

    for i in range(len(texts)):
        probabilities = probs[i].cpu().numpy()
        idx = probabilities.argmax()

        label = emotion_labels[idx]

        results.append({
            "emotion": label.capitalize(),
            "emotion_confidence": round(float(probabilities[idx]), 4)
        })

    return results