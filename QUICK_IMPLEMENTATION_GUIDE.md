# Quick Implementation Guide - Frontend Integration

## Analysis: API_INTEGRATION_GUIDE.md vs Current Database Schema

**Date:** February 22, 2026  
**Current Database:** `youtube_comments` + `manual_reviews` (denormalized)

---

## 🚀 Quick Wins (Can Implement in 1-2 Hours Each)

### **Priority 1: Dashboard Overview API** ⏱️ ~30 minutes
**Status:** 90% Complete - Just needs response formatting

**Frontend Needs:**
```javascript
GET /api/dashboard/overview?platform={platform}&period={period}

Response:
{
  "sentiments": { "positive": 60, "negative": 20, "neutral": 20 },
  "approval": 68,
  "platformSentiments": { ... }
}
```

**Current State:**
- ✅ Endpoint exists: `GET /api/dashboard/{organization_id}`
- ✅ Returns sentiment counts from `youtube_comments`
- ✅ Returns emotion data
- ❌ Missing: platform/period filters
- ❌ Missing: approval rating calculation
- ❌ Missing: platformSentiments breakdown

**Implementation Steps:**
1. Add query parameters to existing endpoint
2. Calculate approval = (positive / total) * 100
3. Add date filtering using `published_at` field
4. Group by `video_id` or `source` for platform breakdown

**SQL Query Needed:**
```sql
SELECT 
    sentiment,
    COUNT(*) as count
FROM youtube_comments
WHERE organization_id = $1
  AND published_at >= NOW() - INTERVAL '7 days'
GROUP BY sentiment
```

**Difficulty:** ⭐ Very Easy

---

### **Priority 2: Comments List API** ⏱️ ~45 minutes
**Status:** 0% - Needs New Endpoint

**Frontend Needs:**
```javascript
GET /api/comments?platform={platform}&period={period}&limit=20&page=1

Response:
{
  "comments": [
    {
      "id": "uuid",
      "platform": "YouTube",
      "sentiment": "positive",
      "text": "Great video!",
      "author": "@user123",
      "date": "2 days ago",
      "timestamp": "2024-02-20T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalComments": 200
  }
}
```

**Database Has:**
- ✅ `youtube_comments.text` → text
- ✅ `youtube_comments.author` → author
- ✅ `youtube_comments.published_at` → timestamp
- ✅ `youtube_comments.sentiment` → sentiment
- ✅ `youtube_comments.video_id` → can map to platform
- ✅ `youtube_comments.id` → id

**Implementation Steps:**
1. Create new endpoint `/api/comments`
2. Add pagination with LIMIT/OFFSET
3. Format `published_at` to relative time ("2 days ago")
4. Add filters for period and sentiment
5. Count total for pagination

**SQL Query:**
```sql
SELECT 
    id, text, author, sentiment, published_at, video_id as platform,
    COUNT(*) OVER() as total_count
FROM youtube_comments
WHERE organization_id = $1
  AND published_at >= $2
ORDER BY published_at DESC
LIMIT $3 OFFSET $4
```

**Difficulty:** ⭐⭐ Easy

---

### **Priority 3: Sentiment Details API** ⏱️ ~30 minutes
**Status:** 0% - Nearly Same as Comments API

**Frontend Needs:**
```javascript
GET /api/sentiment-details?category={category}&platform={platform}&period={period}

Response:
{
  "category": "Positive",
  "value": 65,
  "detailedComments": [ ... same as comments ... ],
  "metadata": {
    "totalCount": 156,
    "averageRating": 4.2
  }
}
```

**Implementation:** Almost identical to Comments API with sentiment filter

**SQL Query:**
```sql
SELECT 
    id, text, author, sentiment, published_at,
    COUNT(*) OVER() as total_count,
    AVG(scaled_score) OVER() as avg_score
FROM youtube_comments
WHERE organization_id = $1
  AND sentiment = $2  -- 'positive', 'negative', 'neutral'
  AND published_at >= $3
ORDER BY published_at DESC
LIMIT 20
```

**Difficulty:** ⭐ Very Easy (reuse comments code)

---

## 🔨 Medium Effort (2-4 Hours)

### **Priority 4: Trends API** ⏱️ ~2 hours
**Status:** 0% - Needs Aggregation Logic

**Frontend Needs:**
```javascript
GET /api/dashboard/trends?platform={platform}&period={period}

Response:
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "trends": {
    "positive": [55, 58, 62, 60, 65, 68, 70],
    "neutral": [30, 28, 25, 27, 23, 20, 18],
    "negative": [15, 14, 13, 13, 12, 12, 12]
  }
}
```

**Database Has:**
- ✅ `youtube_comments.published_at` → can group by date
- ✅ `youtube_comments.sentiment` → for grouping

**Implementation:**
1. Group comments by `DATE(published_at)`
2. Count sentiments per day
3. Generate labels based on period
4. Fill missing dates with zeros

**SQL Query:**
```sql
SELECT 
    DATE(published_at) as date,
    sentiment,
    COUNT(*) as count
FROM youtube_comments
WHERE organization_id = $1
  AND published_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(published_at), sentiment
ORDER BY date
```

**Python Processing:**
```python
# Fill missing dates and format
dates = generate_date_range(period)
trends = {"positive": [], "negative": [], "neutral": []}
for date in dates:
    trends["positive"].append(data.get((date, "positive"), 0))
    # ... repeat for negative, neutral
```

**Difficulty:** ⭐⭐⭐ Medium

---

## ❌ Not Quick (Require New Features)

### **Priority 5: Platform Sentiments Breakdown** ⏱️ ~3 hours
**Problem:** Current schema doesn't have clear "platform" concept

**Options:**
1. Use `video_id` as platform identifier
2. Use `source` field if populated
3. Add platform logic to frontend (treat all as "YouTube")

**Recommendation:** For MVP, return empty `platformSentiments: {}` and handle on frontend

---

### **Priority 6: Insights/Areas API** ⏱️ ~1 week
**Problem:** No department/area data exists

**Frontend Needs:**
```javascript
{
  "positiveAreas": [{"department": "Quality", "score": 92}],
  "improvementAreas": [{"department": "Shipping", "score": 45}]
}
```

**Database Has:** ❌ Nothing

**Would Need:**
- NLP to extract topics/categories from comments
- Mapping of topics to departments
- Complex aggregation and scoring

**Recommendation:** Skip for MVP, use mock data on frontend

---

## 📋 Implementation Roadmap

### **Phase 1: Core APIs (3-4 hours total)** 🎯 DO THIS FIRST

1. ✅ **Dashboard Overview with Filters** (30 min)
   - File: `app/api/dashboard.py`
   - Add query params: platform, period
   - Add approval calculation
   - Add date filtering

2. ✅ **Comments List API** (45 min)
   - File: `app/api/comments.py` (NEW)
   - Paginated list of comments
   - Filter by sentiment, period
   - Format timestamps

3. ✅ **Sentiment Details API** (30 min)
   - File: `app/api/sentiment_details.py` (NEW)
   - Filtered comments by sentiment
   - Metadata calculations

4. ✅ **Update Response Formats** (15 min)
   - Match frontend expectations exactly
   - Add CORS if needed

**Total:** ~2 hours of coding + 1 hour testing = **3 hours**

---

### **Phase 2: Trends (2-3 hours)**

5. ✅ **Trends API** (2 hours)
   - File: `app/api/trends.py` (NEW)
   - Time-series aggregation
   - Date range generation
   - Fill missing dates

---

### **Phase 3: Polish (1-2 hours)**

6. ✅ **Error Handling** (30 min)
7. ✅ **API Documentation** (30 min)
8. ✅ **Frontend Testing** (1 hour)

---

## 🎯 Recommended Immediate Action Plan

### **Step 1: Update Dashboard Overview** (START HERE)

**File:** `app/api/dashboard.py`

Add this endpoint:
```python
@router.get("/overview")
def dashboard_overview(
    organization_id: str = Query(...),
    platform: str = Query("consolidated"),
    period: str = Query("7d")
):
    # Get sentiment counts with filters
    # Calculate approval rating
    # Return formatted response
```

**File:** `app/repositories/dashboard_repository.py`

Update to accept filters:
```python
def get_sentiment_counts_with_filters(org_id, period):
    days_map = {"1d": 1, "7d": 7, "1m": 30, "3m": 90, "6m": 180, "1y": 365}
    days_ago = datetime.now() - timedelta(days=days_map.get(period, 7))
    
    response = supabase.table("youtube_comments") \
        .select("sentiment") \
        .eq("organization_id", org_id) \
        .gte("published_at", days_ago.isoformat()) \
        .execute()
    
    # ... count positive/negative/neutral
```

---

### **Step 2: Create Comments API**

**File:** `app/api/comments.py` (NEW)

```python
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/comments", tags=["Comments"])

@router.get("")
def get_comments(
    organization_id: str = Query(...),
    platform: Optional[str] = Query("consolidated"),
    period: Optional[str] = Query("7d"),
    sentiment: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    page: int = Query(1, ge=1)
):
    # Query youtube_comments with filters
    # Add pagination
    # Format response
    pass
```

---

### **Step 3: Create Sentiment Details API**

**File:** `app/api/sentiment_details.py` (NEW)

Similar to comments but with:
- Required sentiment filter
- Metadata (total count, avg score)
- Limited to 20 results

---

## 📊 Data Availability Matrix

| Frontend Need | Database Field | Status | Notes |
|--------------|----------------|--------|-------|
| Comment text | `youtube_comments.text` | ✅ | Direct mapping |
| Author | `youtube_comments.author` | ✅ | Direct mapping |
| Timestamp | `youtube_comments.published_at` | ✅ | Format needed |
| Sentiment | `youtube_comments.sentiment` | ✅ | Direct mapping |
| Emotion | `youtube_comments.emotion` | ✅ | Already analyzed |
| Platform | `youtube_comments.video_id` | ⚠️ | Can map to YouTube |
| Rating | `youtube_comments.scaled_score` | ✅ | 0-5 or 0-10 scale |
| Like count | `youtube_comments.like_count` | ✅ | Available |
| Approval % | Calculated | ✅ | positive/(total) |
| Trends | Aggregated | ⚠️ | Needs GROUP BY date |
| Departments | None | ❌ | Not available |

---

## 🚦 Traffic Light Summary

### ✅ **GREEN - Ready to Implement** (Do Today)
- Dashboard overview with filters
- Comments list with pagination
- Sentiment details by category
- Basic time period filtering

### 🟡 **YELLOW - Moderate Effort** (Do This Week)
- Trends over time (time-series)
- Platform breakdown (if needed)
- Advanced filtering

### 🔴 **RED - Complex/Skip for MVP** (Do Later)
- Multi-platform support (Instagram, Twitter, etc.)
- Insights/positive areas (needs NLP)
- Improvement recommendations
- Department scoring

---

## 💡 Quick Frontend Integration Tips

### **1. Use Relative Dates**
Frontend expects: `"2 days ago"`  
Database has: `"2024-02-20T10:30:00Z"`

**Solution:** Return both in API response:
```json
{
  "timestamp": "2024-02-20T10:30:00Z",
  "date": "2 days ago"
}
```

### **2. Platform Mapping**
Frontend expects: `"Instagram"`, `"YouTube"`, etc.  
Database has: `video_id` or `source`

**Solution:** For MVP, hardcode:
```python
"platform": "YouTube"  # All data is YouTube currently
```

### **3. Pagination Math**
```python
offset = (page - 1) * limit
total_pages = math.ceil(total_count / limit)
```

### **4. Sentiment Mapping**
Database: `"positive"`, `"negative"`, `"neutral"`  
Frontend: Capitalized versions

**Solution:**
```python
sentiment = row["sentiment"].capitalize()
```

---

## 🎯 Success Metrics

After implementing Priority 1-3 (3 hours work):
- ✅ Frontend can fetch real sentiment data
- ✅ Frontend can display actual comments
- ✅ Frontend filters work (period selection)
- ✅ Dashboard shows accurate counts
- ✅ Sentiment drill-down works

**This is enough for a working MVP!**

---

## 🔥 Hot Start Commands

```bash
# 1. Create new API files
touch app/api/comments.py
touch app/api/sentiment_details.py

# 2. Create new repository functions
# Update app/repositories/dashboard_repository.py

# 3. Register new routers in main.py
# Add: from app.api import comments, sentiment_details
# Add: app.include_router(comments.router)

# 4. Test endpoints
curl "http://localhost:8000/api/dashboard/overview?organization_id=xxx&period=7d"
curl "http://localhost:8000/api/comments?organization_id=xxx&limit=10&page=1"
```

---

## Questions to Answer Before Starting

1. **Organization ID:** What's the default organization UUID to use? ✍️
2. **Date Format:** Should dates be ISO 8601 or human-readable? ✍️
3. **Platform:** Keep hardcoded as "YouTube" or use video_id? ✍️
4. **Pagination:** Default 20 items per page OK? ✍️
5. **CORS:** Do we need CORS enabled for frontend domain? ✍️

---

**TL;DR: You can have 3 working APIs integrated with frontend in ~3 hours by building on existing database structure!** 🚀
