# Public Sentiment Analysis Dashboard

A React-based sentiment analysis platform that aggregates and analyzes public reviews from multiple sources with interactive visualizations.

## 🚀 Features

- Multi-source data integration (YouTube, manual CSV uploads)
- Real-time sentiment analysis with interactive charts (Pie, Line, Bar, Doughnut, Radar)
- 9 emotion tracking (Joy, Love, Surprise, Trust, Anger, Sadness, Fear, Disgust, Neutral)
- Platform-specific analytics with time filters (1d, 7d, 1m, 3m, 6m, 1y)
- CSV file upload with validation
- Supabase authentication (Email + Google OAuth)
- Organization-based multi-tenant architecture
- Dark mode support
- PDF export

## 🛠 Tech Stack

**Frontend:** React 18, Vite, React Router 6, Chart.js 4.4.1, Tailwind CSS 3.4.1  
**Backend:** REST API with organization-based endpoints  
**Auth:** Supabase  
**Storage:** localStorage for session persistence

## ⚡ Quick Start

### Installation

```bash
# Clone and install
git clone <repository-url>
cd PublicSentimentAnalysis
npm install

# Configure environment
# Create .env.local in project root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8002

# Start development server
npm run dev
# Open http://localhost:5173
```

### Supabase Setup

1. Create project at https://app.supabase.com
2. Get credentials from **Settings** > **API** (use **anon/public** key)
3. Add to `.env.local`
4. Optional: Enable Google OAuth in **Authentication** > **Providers**

**Note:** Restart dev server after changing `.env.local`

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx         # Main analytics (charts, metrics, filters)
│   ├── DataInput.jsx         # CSV upload with validation
│   ├── Header.jsx            # Navigation and user menu
│   ├── ProtectedRoute.jsx   # Auth wrapper for routes
│   └── ReportDownload.jsx   # PDF export
├── pages/
│   ├── Login.jsx            # Login page
│   └── Signup.jsx           # Registration page
├── context/
│   └── AuthContext.jsx      # Auth state management
├── lib/
│   └── supabase.js          # Supabase client
├── App.jsx                  # Routes
└── main.jsx                 # Entry point
```

## 🎯 UI Flow

### Authentication Flow
```
1. User visits app → Redirected to /login (if not authenticated)
2. Login/Signup → Supabase Auth → Success
3. Fetch organization_id from backend → Store in localStorage
4. Redirect to /dashboard
```

### Dashboard Flow
```
1. Mount Dashboard → Check localStorage for organization_id
2. Fetch data: GET /dashboard/{org_id}?platform={platform}&period={period}
3. Fetch comments: GET /insights/top-comments?organization_id={id}&platform={platform}
4. Transform data (counts → percentages for charts)
5. Render charts and metrics
6. User changes filters → Re-fetch data
```

### CSV Upload Flow
```
1. Drag/drop CSV or click to select
2. Client-side validation (file type + headers)
3. Visual feedback (green=valid, red=invalid)
4. Submit → POST /manual-reviews/upload?organization_id={id}
5. Show processing overlay
6. Success modal on 200 response
```

## 🧩 Component Details

### Dashboard.jsx (~2000 lines)
**Purpose:** Main analytics dashboard with charts, metrics, and filters

**Key Features:**
- Platform tabs (Consolidated, YouTube, Manual)
- Time period filters (1d, 7d, 1m, 3m, 6m, 1y)
- 6 chart types: Sentiment Pie, Approval Doughnut, Emotions Doughnut, Emotions Radar, Emotions Bar, Trend Line
- Top positive/negative comments
- Real-time data fetching with loading states

**Important Functions:**
- `getTransformedEmotions()`: Converts API emotion counts to percentages (0-100 scale)
- `getApprovalRate()`: Returns approval percentage from API
- `transformComment()`: Maps API response to UI format

**API Calls:**
```javascript
// Dashboard data (lines 71-108)
GET /dashboard/{organization_id}?platform={platform}&period={period}

// Top comments (lines 114-152)
GET /insights/top-comments?organization_id={id}&platform={platform}
```

### DataInput.jsx (~300 lines)
**Purpose:** CSV file upload with strict validation

**Required CSV Headers:**
1. S No
2. Organization name
3. Username
4. Review
5. Review submitted date

**Key Features:**
- react-dropzone integration
- Client-side FileReader validation
- Visual feedback (colored borders)
- Processing overlay with spinner
- Success modal on upload

**Validation Flow:**
```javascript
handleFileDrop() → validateCSVHeaders() → Parse first line → Check headers
→ Set file state or validation error → Visual feedback
```

### AuthContext.jsx (~256 lines)
**Purpose:** Centralized authentication state

**Provided Methods:**
- `login(email, password)`: Supabase auth + fetch organization_id
- `signup(orgName, username, email, password)`: POST /auth/signup
- `loginWithGoogle()`: OAuth flow
- `logout()`: Clear session + localStorage

**State:**
```javascript
{
  user: null | {...},           // Current user
  loading: true | false,        // Auth loading state
  organization_id: null | uuid  // Stored in localStorage
}
```

### ProtectedRoute.jsx
**Purpose:** Route guard for authenticated pages

**Behavior:**
- Shows loading spinner during auth check
- Redirects to `/login` if not authenticated
- Renders children if authenticated

### Header.jsx
**Purpose:** Navigation bar with user menu

**Features:**
- Logo and app title
- User email display
- Logout button
- Dark mode styling

### ReportDownload.jsx
**Purpose:** PDF export functionality

**Features:**
- Export dashboard data as PDF
- Format charts and metrics
- Download trigger

## 🔌 API Endpoints

### 1. Dashboard Data
```
GET /dashboard/{organization_id}?platform={platform}&period={period}
```
Returns: sentiments, emotions, approval, trends, platformSentiments

### 2. Top Comments
```
GET /insights/top-comments?organization_id={id}&platform={platform}
```
Returns: {positive: [...], negative: [...]}

### 3. Signup
```
POST /auth/signup
Body: {organization_name, username, email, password}
```

### 4. CSV Upload
```
POST /manual-reviews/upload?organization_id={id}
Body: multipart/form-data (CSV file)
```

## 📊 CSV Format Example

```csv
S No,Organization name,Username,Review,Review submitted date
1,Acme Corp,john_doe,Excellent product!,2024-02-20 10:30:00
2,Acme Corp,jane_smith,Fast shipping,2024-02-20 11:15:00
```

## 🐛 Common Issues

**Environment variables not loading?**  
→ Restart dev server after editing `.env.local`

**Supabase auth failing?**  
→ Use **anon/public** key (not service_role), check console for connection test

**Organization ID missing?**  
→ Logout and login again (fetched during login)

**CORS on file upload?**  
→ App uses native `fetch` API (not axios) to avoid CORS issues

## 📚 Resources

- [React](https://react.dev) | [Vite](https://vitejs.dev) | [Supabase](https://supabase.com/docs) | [Chart.js](https://www.chartjs.org/docs) | [Tailwind](https://tailwindcss.com/docs)

## 📝 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

**License:** MIT
