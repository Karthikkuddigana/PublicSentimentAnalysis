# API Integration Guide for Dashboard

## Overview
This guide shows where to replace mock data with actual API calls in the Dashboard component. All dummy data has been consolidated into the `MOCK_DATA` object at the top of the file for easy replacement.

## Data Structure Location
**File:** `src/components/Dashboard.jsx`
**Lines:** ~25-200 (MOCK_DATA object)

---

## API Endpoints to Implement

### 1. **Get Dashboard Overview Data**
**Location in Code:** Replace `MOCK_DATA` object
**Endpoint:** `GET /api/dashboard/overview?platform={platform}&period={period}`

**Query Parameters:**
- `platform`: 'consolidated' | 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'reddit'
- `period`: '1d' | '7d' | '1m' | '3m' | '6m' | '1y'

**Expected Response:**
```javascript
{
  "sentiments": {
    "positive": 60,
    "negative": 20,
    "neutral": 20
  },
  "approval": 68,
  "platformSentiments": {
    "instagram": { "positive": 65, "negative": 15, "neutral": 20, "approval": 72 },
    "twitter": { "positive": 58, "negative": 17, "neutral": 25, "approval": 65 },
    // ... other platforms
  }
}
```

**Implementation:**
```javascript
// In Dashboard component, add useEffect
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/overview?platform=${activeTab}&period=${activePeriod}`
      );
      const data = await response.json();
      // Update state with fetched data
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };
  fetchDashboardData();
}, [activeTab, activePeriod]);
```

---

### 2. **Get Trend Data**
**Function to Replace:** `getTrendData()` (Line ~290)
**Endpoint:** `GET /api/dashboard/trends?platform={platform}&period={period}`

**Query Parameters:**
- `platform`: Active platform tab
- `period`: Active time period filter

**Expected Response:**
```javascript
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "trends": {
    "positive": [55, 58, 62, 60, 65, 68, 70],
    "neutral": [30, 28, 25, 27, 23, 20, 18],
    "negative": [15, 14, 13, 13, 12, 12, 12]
  }
}
```

**Implementation:**
```javascript
const getTrendData = async () => {
  try {
    const response = await fetch(
      `/api/dashboard/trends?platform=${activeTab}&period=${activePeriod}`
    );
    const data = await response.json();
    return data.trends;
  } catch (error) {
    console.error('Failed to fetch trend data:', error);
    // Return mock data as fallback
    return MOCK_DATA.trends;
  }
};
```

---

### 3. **Get Comments/Reviews**
**Function to Replace:** `getFilteredComments()` (Line ~280)
**Endpoint:** `GET /api/comments?platform={platform}&period={period}&sentiment={sentiment}`

**Query Parameters:**
- `platform`: Filter by platform (optional for consolidated view)
- `period`: Time period filter
- `sentiment`: 'positive' | 'negative' | 'neutral' (optional)
- `limit`: Number of comments to return (default: 20)
- `page`: Page number for pagination

**Expected Response:**
```javascript
{
  "comments": [
    {
      "id": 1,
      "platform": "Instagram",
      "sentiment": "positive",
      "rating": 5,
      "text": "Comment text...",
      "author": "@username",
      "date": "2 days ago",
      "timestamp": "2024-02-19T10:30:00Z"
    }
    // ... more comments
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalComments": 200
  }
}
```

**Implementation:**
```javascript
const getFilteredComments = async () => {
  try {
    const platformParam = activeTab === 'consolidated' ? '' : `&platform=${activeTab}`;
    const response = await fetch(
      `/api/comments?period=${activePeriod}${platformParam}&limit=20`
    );
    const data = await response.json();
    return data.comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return MOCK_DATA.comments;
  }
};
```

---

### 4. **Get Chart Details (On Click)**
**Function to Replace:** `handleChartClick()` (Line ~295)
**Endpoint:** `GET /api/sentiment-details?category={category}&platform={platform}&period={period}`

**Query Parameters:**
- `category`: Clicked category ('positive' | 'negative' | 'neutral')
- `platform`: Active platform
- `period`: Active time period

**Expected Response:**
```javascript
{
  "category": "Positive",
  "value": 65,
  "chartType": "pie",
  "detailedComments": [
    {
      "id": 1,
      "text": "Detailed comment...",
      "author": "User1",
      "timestamp": "2024-02-21T10:00:00Z"
    }
    // ... more comments
  ],
  "metadata": {
    "totalCount": 156,
    "averageRating": 4.2,
    "topKeywords": ["quality", "service", "value"]
  }
}
```

**Implementation:**
```javascript
const handleChartClick = async (event, elements, chartType) => {
  if (elements.length > 0) {
    // ... existing element extraction code ...
    
    setIsLoadingDetails(true);
    
    try {
      const response = await fetch(
        `/api/sentiment-details?category=${category}&platform=${activeTab}&period=${activePeriod}`
      );
      const detailData = await response.json();
      
      setClickedData(detailData);
      setIsLoadingDetails(false);
      
      document.getElementById('chart-details')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      setIsLoadingDetails(false);
    }
  }
};
```

---

### 5. **Get Positive/Improvement Areas**
**Variables to Replace:** `positiveAreas`, `improvementAreas` (Line ~283-284)
**Endpoint:** `GET /api/dashboard/insights?platform={platform}`

**Expected Response:**
```javascript
{
  "positiveAreas": [
    {
      "department": "Product Quality",
      "score": 92,
      "highlights": ["Highlight 1", "Highlight 2"],
      "trend": "up"
    }
    // ... more areas
  ],
  "improvementAreas": [
    {
      "department": "Shipping & Delivery",
      "score": 45,
      "issues": ["Issue 1", "Issue 2"],
      "priority": "high",
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
    // ... more areas
  ]
}
```

---

## Implementation Strategy

### Phase 1: Add State Management
```javascript
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Phase 2: Create API Service File
**Create:** `src/services/dashboardService.js`

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const dashboardService = {
  async getOverview(platform, period) {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/overview?platform=${platform}&period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch overview');
    return response.json();
  },

  async getTrends(platform, period) {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/trends?platform=${platform}&period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },

  async getComments(platform, period, limit = 20, page = 1) {
    const platformParam = platform === 'consolidated' ? '' : `&platform=${platform}`;
    const response = await fetch(
      `${BASE_URL}/api/comments?period=${period}${platformParam}&limit=${limit}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  async getSentimentDetails(category, platform, period) {
    const response = await fetch(
      `${BASE_URL}/api/sentiment-details?category=${category}&platform=${platform}&period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch sentiment details');
    return response.json();
  },

  async getInsights(platform) {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/insights?platform=${platform}`
    );
    if (!response.ok) throw new Error('Failed to fetch insights');
    return response.json();
  }
};
```

### Phase 3: Update Dashboard Component
```javascript
import { dashboardService } from '../services/dashboardService';

export default function Dashboard({ data }) {
  const [dashboardData, setDashboardData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overview, insights] = await Promise.all([
          dashboardService.getOverview(activeTab, activePeriod),
          dashboardService.getInsights(activeTab)
        ]);
        
        setDashboardData({
          ...MOCK_DATA,
          ...overview,
          positiveAreas: insights.positiveAreas,
          improvementAreas: insights.improvementAreas
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep using MOCK_DATA as fallback
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, activePeriod]);
  
  // ... rest of component
}
```

---

## Environment Variables

Add to `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

For production:
```env
VITE_API_BASE_URL=https://api.yourproduction.com
```

---

## Error Handling Best Practices

1. **Always provide fallback data**: Use MOCK_DATA when API fails
2. **Show loading states**: Display spinners/skeletons while fetching
3. **Display error messages**: Inform users when data can't be loaded
4. **Retry logic**: Implement automatic retries for failed requests
5. **Cache data**: Use React Query or SWR for better performance

Example with error handling:
```javascript
const [error, setError] = useState(null);

try {
  const data = await dashboardService.getOverview(activeTab, activePeriod);
  setDashboardData(data);
  setError(null);
} catch (err) {
  setError('Failed to load dashboard data. Showing cached data.');
  console.error(err);
  // Keep using existing data or MOCK_DATA
}
```

---

## Testing API Integration

1. **Start with mock API**: Use tools like JSON Server or MSW
2. **Test each endpoint individually**: Verify data structure matches
3. **Test error scenarios**: Network failures, 404s, 500s
4. **Test filter combinations**: All tab + period combinations
5. **Performance testing**: Ensure fast response times

---

## Next Steps

1. ✅ Implement backend API endpoints
2. ✅ Create `dashboardService.js`
3. ✅ Add state management to Dashboard
4. ✅ Replace `MOCK_DATA` references with API calls
5. ✅ Add loading states and error handling
6. ✅ Test all functionality
7. ✅ Deploy and monitor

---

## Quick Reference

| Feature | Current Code Location | API Endpoint | Priority |
|---------|----------------------|--------------|----------|
| Overview Data | MOCK_DATA object | GET /api/dashboard/overview | High |
| Trend Charts | getTrendData() | GET /api/dashboard/trends | High |
| Comments List | getFilteredComments() | GET /api/comments | High |
| Chart Details | handleChartClick() | GET /api/sentiment-details | Medium |
| Insights | positiveAreas/improvementAreas | GET /api/dashboard/insights | Medium |

---

For questions or issues, refer to the main API documentation or contact the backend team.
