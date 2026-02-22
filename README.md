# Public Sentiment Analysis Platform

AI-powered platform that ingests customer reviews from multiple sources (YouTube, CSV uploads) and analyzes sentiment and emotions to provide actionable business insights.

## 🌟 Features

- **Multi-Source Ingestion**: YouTube comments + Manual CSV uploads
- **AI Analysis**: Sentiment (Positive/Negative/Neutral) + Emotion detection (7 types) using Groq API
- **Analytics Dashboard**: Real-time metrics with platform and time-period filtering
- **RESTful API**: FastAPI with Swagger documentation at `/docs`

## 🛠 Tech Stack

- **Backend**: FastAPI + Uvicorn + Python 3.8+
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (Llama-3.1-8b-instant)
- **External APIs**: YouTube Data API v3
- **Key Libraries**: pandas, supabase, groq, openpyxl

## 📁 Project Structure

```
app/
├── api/              # API endpoints (dashboard, youtube, manual_reviews, auth, insights)
├── core/             # Configuration (Supabase client)
├── models/           # Pydantic models
├── repositories/     # Database queries
└── services/         # Business logic (sentiment analysis, data processing)
```

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Supabase account
- YouTube Data API v3 key
- Groq API key

### Setup Steps

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd PublicSentimentAnalysis
   
   # Windows
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   
   Create `.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   YOUTUBE_API_KEY=your-youtube-api-key
   GROQ_API_KEY=your-groq-api-key
   ORGANIZATION_ID=your-org-uuid
   ```

4. **Run the application**
   ```bash
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8002
   ```

5. **Access the API**
   - API Server: http://localhost:8002
   - Swagger Docs: http://localhost:8002/docs
   - ReDoc: http://localhost:8002/redoc

## 📊 Database Schema

### Core Tables
- **organizations** - Company/organization accounts
- **youtube_comments** - YouTube comments with embedded sentiment/emotion (denormalized)
- **manual_reviews** - CSV uploaded reviews with embedded sentiment/emotion (denormalized)
- **users** - User accounts linked to organizations

*Note: Denormalized schema is used for performance. Sentiment and emotion data are embedded directly in comment/review records.*

## 🔄 Business Flow

### 1. YouTube Comment Ingestion Flow
```
User provides brand name → Search YouTube videos → Fetch comments → 
Analyze sentiment (Groq AI) → Analyze emotion (Groq AI) → 
Store in youtube_comments table → Return statistics
```

**Business Value**: Automatically monitor brand reputation on YouTube without manual work.

### 2. Manual Review Upload Flow
```
User uploads CSV file → Parse and validate data → 
Lookup organization → For each review: Analyze sentiment + emotion → 
Bulk insert into manual_reviews table → Return import summary
```

**Business Value**: Integrate existing review data (surveys, feedback forms) for unified analysis.

### 3. Dashboard Analytics Flow
```
Request dashboard data → Filter by platform (YouTube/Manual/Both) → 
Filter by time period (1d to 1y) → Aggregate sentiment counts → 
Calculate approval rating → Group emotions → Return metrics
```

**Business Value**: Real-time visibility into customer sentiment across all sources with flexible filtering.

### 4. Insights Generation Flow
```
Analyze historical sentiment trends → Identify patterns and anomalies → 
Generate AI summary using Groq → Provide recommendations → 
Return actionable insights
```

**Business Value**: Automated insight generation helps teams quickly understand "what's happening" and "what to do".

## 📡 Key API Endpoints

**Full documentation available at `/docs` (Swagger UI)**

- `POST /api/youtube/ingest` - Ingest YouTube comments for a brand
- `POST /manual-reviews/upload` - Upload CSV file with reviews
- `GET /api/dashboard` - Get sentiment metrics (supports platform & period filters)
- `GET /api/insights` - Get AI-generated insights and recommendations
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile

### Query Parameters (Dashboard)
- `organization_id` - Organization UUID (required)
- `platform` - Filter: `consolidated` | `youtube` | `manual` (default: consolidated)
- `period` - Time range: `1d` | `7d` | `1m` | `3m` | `6m` | `1y` (default: 7d)

## 💡 Quick Start Example

### Python
```python
import requests

# Ingest YouTube comments
response = requests.post("http://localhost:8002/api/youtube/ingest", json={
    "brand": "Ola Electric",
    "title_keyword": "review",
    "max_videos": 10
})

# Get dashboard data
dashboard = requests.get("http://localhost:8002/api/dashboard", params={
    "organization_id": "your-org-id",
    "platform": "consolidated",
    "period": "7d"
})
```

### Frontend (JavaScript)
```javascript
// Fetch dashboard
const data = await fetch(
  `http://localhost:8002/api/dashboard?organization_id=${orgId}&period=7d`
).then(r => r.json());

// Upload CSV
const formData = new FormData();
formData.append('file', file);
await fetch('http://localhost:8002/manual-reviews/upload', {
  method: 'POST',
  body: formData
});
```

## 🔒 Security Notes

- Store API keys in `.env` file (never commit to git)
- RLS (Row Level Security) enabled on sensitive tables
- CORS configured for `localhost:3000` and `localhost:5173` (update for production)
- Organization-level data isolation enforced

## 🛣 Roadmap

**✅ Completed**
- YouTube comments ingestion with AI analysis
- Manual CSV uploads with sentiment detection
- Dashboard API with platform & time filtering
- Emotion analysis (7 emotion types)
- Interactive API documentation (Swagger)

**🚧 Planned**
- Comments API with pagination
- Sentiment drill-down by category
- Time-series trends API
- Real-time websocket updates
- Automated daily metrics aggregation
- Export functionality (PDF, Excel)

## 📧 Support

For detailed API documentation, visit http://localhost:8002/docs after starting the server.

---

**Built with ❤️ for data-driven decision making**
