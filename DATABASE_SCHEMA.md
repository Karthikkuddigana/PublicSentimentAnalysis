# Database Schema & API Reference

## Overview
This document describes the Supabase PostgreSQL database schema for the Public Sentiment Analysis platform and serves as a reference for building APIs.

---

## Database Schema

### Table: `organizations`
**Purpose**: Stores organization/company information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `name` | text | NOT NULL | Organization name |
| `email` | text | UNIQUE, NOT NULL | Organization email |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

---

### Table: `users`
**Purpose**: Stores user accounts linked to organizations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, FK → auth.users | User ID from Supabase Auth |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `name` | text | NOT NULL | User's full name |
| `role` | text | DEFAULT 'admin' | User role |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

---

### Table: `data_sources`
**Purpose**: Tracks different data sources for reviews (YouTube, CSV uploads, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `source_type` | text | CHECK ('file','api','database','manual') | Type of data source |
| `source_name` | text | NOT NULL | Descriptive name |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes**: `idx_datasource_org`

---

### Table: `reviews`
**Purpose**: Stores all customer reviews/comments from various sources

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `data_source_id` | uuid | NOT NULL, FK → data_sources | Source reference |
| `category` | text | NULLABLE | Review category/product |
| `review_text` | text | NOT NULL | The actual review content |
| `language` | text | NULLABLE | Language code |
| `review_date` | timestamptz | NULLABLE | When review was posted |
| `created_at` | timestamptz | DEFAULT now() | When ingested |

**Indexes**: `idx_reviews_org`, `idx_reviews_date`, `idx_reviews_category`

---

### Table: `sentiment_results`
**Purpose**: Stores AI-analyzed sentiment for each review

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `review_id` | uuid | NOT NULL, FK → reviews | Review reference |
| `sentiment_label` | text | CHECK ('positive','negative','neutral') | Sentiment classification |
| `sentiment_score` | numeric(5,4) | NULLABLE | Confidence score (0-1) |
| `model_name` | text | NULLABLE | AI model used |
| `analyzed_at` | timestamptz | DEFAULT now() | Analysis timestamp |

**Indexes**: `idx_sentiment_review`, `idx_sentiment_label`

---

### Table: `aggregated_metrics`
**Purpose**: Pre-computed daily/category-wise sentiment counts for dashboards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `category` | text | NULLABLE | Product/category |
| `metric_date` | date | NULLABLE | Aggregation date |
| `positive_count` | integer | DEFAULT 0 | Number of positive reviews |
| `negative_count` | integer | DEFAULT 0 | Number of negative reviews |
| `neutral_count` | integer | DEFAULT 0 | Number of neutral reviews |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

---

### Table: `youtube_comments`
**Purpose**: Stores YouTube comments with embedded sentiment and emotion analysis (denormalized structure for performance)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `source` | text | NULLABLE | Source identifier |
| `video_id` | text | NOT NULL | YouTube video identifier |
| `author` | text | NULLABLE | Comment author |
| `text` | text | NOT NULL | Comment text |
| `published_at` | timestamptz | NULLABLE | When comment was published |
| `like_count` | integer | NULLABLE | Number of likes |
| `sentiment` | text | NULLABLE | Sentiment label (positive/negative/neutral) |
| `raw_score` | double precision | NULLABLE | Raw sentiment score (-1 to 1) |
| `scaled_score` | double precision | NULLABLE | Scaled score based on benchmark |
| `benchmark` | integer | NULLABLE | Scoring scale (e.g., 5, 10, 100) |
| `sentiment_confidence` | double precision | NULLABLE | Confidence score (0-1) |
| `emotion` | text | NULLABLE | Detected emotion |
| `emotion_confidence` | double precision | NULLABLE | Emotion confidence (0-1) |
| `fetched_at` | timestamptz | DEFAULT now() | When data was fetched |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

**Note**: This is a denormalized table for backwards compatibility and performance. New implementations should use `reviews` + `sentiment_results` schema.

---

### Table: `manual_reviews`
**Purpose**: Stores manually uploaded reviews (e.g., from CSV files) with embedded sentiment analysis

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `organization_id` | uuid | NOT NULL, FK → organizations | Organization reference |
| `source` | text | DEFAULT 'manual' | Source identifier |
| `username` | text | NULLABLE | Username/author |
| `review_text` | text | NOT NULL | Review content |
| `review_submitted_date` | timestamptz | NULLABLE | When review was submitted |
| `sentiment` | text | NULLABLE | Sentiment label |
| `raw_score` | numeric | NULLABLE | Raw sentiment score |
| `scaled_score` | numeric | NULLABLE | Scaled score |
| `benchmark` | integer | NULLABLE | Scoring benchmark |
| `sentiment_confidence` | numeric | NULLABLE | Sentiment confidence |
| `emotion` | text | NULLABLE | Detected emotion |
| `emotion_confidence` | numeric | NULLABLE | Emotion confidence |
| `created_at` | timestamptz | DEFAULT now() | Creation timestamp |

---

## Entity Relationships

```
organizations
    ├── users (1:N)
    ├── data_sources (1:N)
    ├── reviews (1:N)
    ├── aggregated_metrics (1:N)
    ├── youtube_comments (1:N)
    └── manual_reviews (1:N)

data_sources
    └── reviews (1:N)

reviews
    └── sentiment_results (1:N)
```

---

## Row Level Security (RLS)

### **Tables with RLS ENABLED:**
- ✅ `organizations` - User can only view their own organization
- ✅ `sentiment_results` - Access through review ownership
- ✅ `aggregated_metrics` - Organization-level access
- ✅ `youtube_comments` - **Open policy** (allows all insert/select)

### **Tables with RLS DISABLED:**
- ❌ `users` - Direct access allowed
- ❌ `data_sources` - Direct access allowed
- ❌ `reviews` - Direct access allowed

### **RLS Policies:**

**Organizations:**
- Users can only access data from their own organization
- Access is controlled via `auth.uid()` matching the `users` table

---

## API Endpoints to Implement

### 1. Organizations API

#### `POST /api/organizations`
Create a new organization
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com"
}
```

#### `GET /api/organizations/{organization_id}`
Get organization details

---

### 2. Data Sources API

#### `POST /api/data-sources`
Register a new data source
```json
{
  "organization_id": "uuid",
  "source_type": "api",
  "source_name": "YouTube - Brand Monitor"
}
```

#### `GET /api/data-sources?organization_id={uuid}`
List all data sources for an organization

#### `GET /api/data-sources/{id}`
Get data source details

---

### 3. Reviews API

#### `POST /api/reviews`
Create a single review
```json
{
  "organization_id": "uuid",
  "data_source_id": "uuid",
  "category": "Product A",
  "review_text": "Great product!",
  "language": "en",
  "review_date": "2026-02-22T10:30:00Z"
}
```

#### `POST /api/reviews/bulk`
Bulk import reviews (for CSV uploads, YouTube ingestion)
```json
{
  "organization_id": "uuid",
  "data_source_id": "uuid",
  "reviews": [
    {
      "category": "Product A",
      "review_text": "Great product!",
      "review_date": "2026-02-22T10:30:00Z"
    }
  ]
}
```

#### `GET /api/reviews?organization_id={uuid}&limit=50&offset=0`
List reviews with pagination

#### `GET /api/reviews?organization_id={uuid}&date_from={date}&date_to={date}`
Filter reviews by date range

#### `GET /api/reviews?organization_id={uuid}&category={category}`
Filter reviews by category

#### `GET /api/reviews/{id}`
Get single review with sentiment

---

### 4. Sentiment Analysis API

#### `POST /api/sentiment/analyze`
Analyze sentiment for a single text
```json
{
  "text": "This product is amazing!",
  "benchmark": 5
}
```

**Response:**
```json
{
  "sentiment": "Positive",
  "raw_score": 1,
  "scaled_score": 5.0,
  "confidence": 0.95,
  "emotion": "Joy",
  "emotion_confidence": 0.89
}
```

#### `POST /api/sentiment/analyze-review/{review_id}`
Analyze and store sentiment for an existing review

---

### 5. Dashboard / Analytics API

#### `GET /api/dashboard/{organization_id}`
Get sentiment summary dashboard
```json
{
  "positiveCount": 150,
  "negativeCount": 30,
  "neutralCount": 20,
  "emotions": {
    "joy": 120,
    "anger": 15,
    "sadness": 10,
    "neutral": 55
  }
}
```

#### `GET /api/dashboard/{organization_id}/trends?days=30`
Get sentiment trends over time

#### `GET /api/dashboard/{organization_id}/by-category`
Get sentiment breakdown by category

---

### 6. Aggregated Metrics API

#### `POST /api/metrics/aggregate`
Trigger daily aggregation job
```json
{
  "organization_id": "uuid",
  "date": "2026-02-22"
}
```

#### `GET /api/metrics?organization_id={uuid}&date_from={date}&date_to={date}`
Get aggregated metrics for date range

---

## Currently Working APIs

### 7. YouTube Ingestion API ✅

#### `POST /api/youtube/ingest`
Ingest YouTube comments with sentiment analysis

**Request:**
```json
{
  "brand": "Product Name",
  "title_keyword": "review",
  "storage": "supabase",
  "benchmark": 5,
  "max_videos": 5,
  "max_comments_per_video": 100
}
```

**Response:**
```json
{
  "status": "success",
  "records": 250,
  "videos_processed": 5,
  "benchmark": 5
}
```

**Table Used:** `youtube_comments` (denormalized with sentiment/emotion)

---

### 8. Manual Reviews Upload API ✅

#### `POST /api/manual-reviews/upload`
Upload CSV file with manual reviews

**Request:** multipart/form-data with CSV file

**CSV Format:**
```csv
S No,Organization name,Username,Review,Review submitted date
1,Acme Corp,john_doe,Great service!,2026-02-20 10:30:00
```

**Response:**
```json
{
  "status": "success",
  "records_imported": 100,
  "organization_id": "uuid"
}
```

**Table Used:** `manual_reviews` (denormalized with sentiment/emotion)

---

## Data Flow Examples

### YouTube Ingestion Flow (Current Implementation)
1. **POST** `/api/youtube/ingest` → Fetches YouTube comments via YouTube Data API
2. **For each comment**: Analyzes sentiment + emotion via Groq API
3. **Bulk inserts** into `youtube_comments` table (with embedded sentiment data)
4. **Returns** summary statistics

### Manual CSV Upload Flow (Current Implementation)
1. **POST** `/api/manual-reviews/upload` → Receives CSV file upload
2. **Parses CSV** and extracts review data
3. **For each review**: Analyzes sentiment + emotion via Groq API
4. **Bulk inserts** into `manual_reviews` table (with embedded sentiment data)
5. **Returns** import summary with record count

### Dashboard Query Flow (Current Implementation)
1. **GET** `/api/dashboard/{organization_id}` → Request dashboard data
2. **Queries** `youtube_comments` table for sentiment counts
3. **Aggregates** positive/negative/neutral counts
4. **Queries** emotion data from same table
5. **Returns** combined sentiment + emotion summary

---

## Current Implementation vs Normalized Schema

### **Active Tables (Currently Used):**
- ✅ `youtube_comments` - Denormalized table with embedded sentiment/emotion data
- ✅ `manual_reviews` - Denormalized table for CSV uploads
- ✅ `organizations` - Organization management
- ✅ `users` - User management

### **Normalized Schema (For Future Migration):**
- `reviews` - Generic review storage
- `sentiment_results` - Separate sentiment analysis results
- `data_sources` - Track data sources
- `aggregated_metrics` - Pre-computed metrics

### **Why Two Approaches?**
The schema supports both **denormalized** (youtube_comments, manual_reviews) and **normalized** (reviews + sentiment_results) approaches:

**Denormalized Benefits:**
- ✅ Faster queries (no joins needed)
- ✅ Simpler API implementation
- ✅ Better for high-volume insert operations
- ✅ Current working implementation

**Normalized Benefits:**
- ✅ Better data integrity
- ✅ Flexible for multiple data sources
- ✅ Easier to add new analysis types
- ✅ Standard database design

### **Recommendation:**
Continue using `youtube_comments` and `manual_reviews` for current operations. Migrate to normalized schema when:
1. Adding multiple platforms beyond YouTube
2. Need complex cross-platform analytics
3. Require additional analysis types beyond sentiment/emotion

### Migration Steps (When Ready)
```sql
-- 1. Create data source for existing YouTube data
INSERT INTO data_sources (organization_id, source_type, source_name)
VALUES ('org-uuid', 'api', 'YouTube Comments');

-- 2. Migrate youtube_comments → reviews
INSERT INTO reviews (organization_id, data_source_id, review_text, category, review_date)
SELECT 
    organization_id,
    'data-source-uuid',
    text,
    video_id,
    published_at
FROM youtube_comments;

-- 3. Migrate sentiment data → sentiment_results
INSERT INTO sentiment_results (review_id, sentiment_label, sentiment_score, model_name)
SELECT 
    r.id,
    yc.sentiment,
    yc.sentiment_confidence,
    'llama-3.1-8b-instant'
FROM youtube_comments yc
JOIN reviews r ON yc.text = r.review_text 
    AND yc.organization_id = r.organization_id;
```

---

## Security Considerations

### Authentication
- Use Supabase Auth for user authentication
- Store JWT tokens securely
- Validate `auth.uid()` in all API calls

### Authorization
- RLS policies enforce organization-level isolation
- API should validate `organization_id` matches authenticated user's org
- Never expose data across organizations

### API Keys
- Store `YOUTUBE_API_KEY`, `GROQ_API_KEY` in environment variables
- Never expose in client-side code
- Rotate keys regularly

---

## Environment Variables Required

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# APIs
YOUTUBE_API_KEY=your-youtube-key
GROQ_API_KEY=your-groq-key

# App Config
ORGANIZATION_ID=default-org-uuid
```

---

## Next Steps

1. ✅ Create schema in Supabase (SQL provided)
2. ✅ YouTube comments ingestion working (uses `youtube_comments` table)
3. ✅ Manual reviews upload working (uses `manual_reviews` table)
4. ✅ Dashboard API for sentiment counts
5. ⏳ Implement API filters (platform, time period)
6. ⏳ Add pagination to comments endpoints
7. ⏳ Build aggregation cron jobs for metrics
8. ⏳ Add trends API with time-series data
9. ⏳ (Optional) Migrate to normalized schema when scaling

---

## Testing Checklist

### **Currently Working:**
- [x] YouTube comment ingestion via `/api/youtube/ingest`
- [x] Manual review CSV upload via `/api/manual-reviews/upload`
- [x] Basic dashboard sentiment counts via `/api/dashboard/{org_id}`
- [x] Emotion analysis (stored in youtube_comments/manual_reviews)

### **To Implement:**
- [ ] Dashboard with platform filters
- [ ] Dashboard with time period filters
- [ ] Comments API with pagination
- [ ] Sentiment details API (drill-down by category)
- [ ] Trends API (time-series data)
- [ ] Aggregated metrics population
- [ ] Test RLS policies (cross-org access)
- [ ] Test date range filters
- [ ] Test category filters
- [ ] Organization management endpoints (if multi-tenant)

### **Database Tables Status:**
- [x] `organizations` - Active
- [x] `users` - Active (RLS disabled for direct access)
- [x] `youtube_comments` - **Active (primary use)**
- [x] `manual_reviews` - **Active (primary use)**
- [ ] `data_sources` - Created but not actively used
- [ ] `reviews` - Created but not actively used
- [ ] `sentiment_results` - Created but not actively used
- [ ] `aggregated_metrics` - Created awaiting aggregation job
