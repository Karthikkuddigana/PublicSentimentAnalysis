import { Pie, Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale,
  Filler
);

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('consolidated');
  const [clickedData, setClickedData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activePeriod, setActivePeriod] = useState('7d');
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsData, setCommentsData] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Fetch dashboard data from API
  // API Endpoint: {VITE_API_BASE_URL}/dashboard/{organization_id}
  // Query Parameters: platform={activeTab}, period={activePeriod}
  // 
  // ===== CURRENT API RESPONSE =====
  // {
  //   positiveCount: number,
  //   negativeCount: number,
  //   neurtralCount: number,
  //   emotions: {
  //     Anger: number,
  //     Neutral: number,
  //     Joy: number,
  //     Surprise: number,
  //     Sadness: number
  //   },
  //   approval: number (percentage),
  //   platformSentiments: {
  //     youtube: { positive, negative, neutral, approval, counts: { positive, negative, neutral, total } },
  //     manual: { positive, negative, neutral, approval, counts: { positive, negative, neutral, total } }
  //   }
  // }
  //
  // ===== ADDITIONAL FIELDS NEEDED (TODO: Add to API) =====
  // - comments: array of comment objects with { id, text, sentiment, platform, timestamp, user }
  // - trends: time-based trend data for line charts
  // - positiveAreas: array of positive feedback areas
  // - improvementAreas: array of areas needing improvement
  //
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get organization_id from localStorage
        const organizationId = localStorage.getItem('organization_id');
        if (!organizationId) {
          throw new Error('Organization ID not found. Please log in again.');
        }
        
        const platformName = activeTab === 'consolidated' ? 'All Platforms' : activeTab === 'youtube' ? 'YouTube' : 'Manual Reviews';
        console.log(`\n=== Fetching ${platformName} Data ===`);
        console.log('Platform:', activeTab);
        console.log('Period:', activePeriod);
        console.log('Organization ID:', organizationId);
        
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
        const apiUrl = `${apiBaseUrl}/dashboard/${organizationId}?platform=${activeTab}&period=${activePeriod}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const apiResponse = await response.json();
        console.log(`${platformName} API Response:`, apiResponse);
        console.log('=== Data Loaded Successfully ===\n');
        
        // Use API data directly without mock enrichment
        setApiData(apiResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
        alert(`Failed to load ${activeTab === 'consolidated' ? 'consolidated' : activeTab.toUpperCase()} dashboard data. Please check if the API server is running at ${apiBaseUrl}`);
        setApiData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activePeriod, activeTab]);

  // Fetch top comments from insights API
  useEffect(() => {
    const fetchTopComments = async () => {
      setIsLoadingComments(true);
      try {
        // Get organization_id from localStorage
        const organizationId = localStorage.getItem('organization_id');
        if (!organizationId) {
          throw new Error('Organization ID not found. Please log in again.');
        }
        
        // Map platform: consolidated -> all, youtube -> youtube, manual -> manual
        const platformParam = activeTab === 'consolidated' ? 'all' : activeTab;
        const platformName = activeTab === 'consolidated' ? 'All Platforms' : activeTab === 'youtube' ? 'YouTube' : 'Manual Reviews';
        
        console.log(`\n=== Fetching Top Comments for ${platformName} ===`);
        console.log('Platform:', platformParam);
        console.log('Organization ID:', organizationId);
        
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
        const apiUrl = `${apiBaseUrl}/insights/top-comments?organization_id=${organizationId}&platform=${platformParam}`;
        console.log('Comments API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const apiResponse = await response.json();
        console.log(`${platformName} Comments Response:`, apiResponse);
        console.log('=== Comments Loaded Successfully ===\n');
        
        setCommentsData(apiResponse);
      } catch (error) {
        console.error('Error fetching top comments:', error);
        setCommentsData(null);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchTopComments();
  }, [activeTab]);

  // Transform API data to percentages
  const getTransformedSentiments = () => {
    if (!apiData) return { positive: 0, negative: 0, neutral: 0 };
    
    const total = apiData.positiveCount + apiData.negativeCount + apiData.neurtralCount;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0 };
    
    return {
      positive: Math.round((apiData.positiveCount / total) * 100),
      negative: Math.round((apiData.negativeCount / total) * 100),
      neutral: Math.round((apiData.neurtralCount / total) * 100)
    };
  };

  // Transform API emotions to match dashboard structure
  const getTransformedEmotions = () => {
    if (!apiData || !apiData.emotions) {
      return {
        joy: 0,
        love: 0,
        surprise: 0,
        trust: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        disgust: 0,
        neutral: 0
      };
    }

    // Convert emotion counts to percentages
    const emotions = apiData.emotions;
    const total = (emotions.Joy || 0) + 
                 (emotions.Love || 0) + 
                 (emotions.Surprise || 0) + 
                 (emotions.Trust || 0) + 
                 (emotions.Anger || 0) + 
                 (emotions.Sadness || 0) + 
                 (emotions.Fear || 0) + 
                 (emotions.Disgust || 0) + 
                 (emotions.Neutral || 0);

    if (total === 0) {
      return {
        joy: 0,
        love: 0,
        surprise: 0,
        trust: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        disgust: 0,
        neutral: 0
      };
    }

    return {
      joy: Math.round(((emotions.Joy || 0) / total) * 100),
      love: Math.round(((emotions.Love || 0) / total) * 100),
      surprise: Math.round(((emotions.Surprise || 0) / total) * 100),
      trust: Math.round(((emotions.Trust || 0) / total) * 100),
      anger: Math.round(((emotions.Anger || 0) / total) * 100),
      sadness: Math.round(((emotions.Sadness || 0) / total) * 100),
      fear: Math.round(((emotions.Fear || 0) / total) * 100),
      disgust: Math.round(((emotions.Disgust || 0) / total) * 100),
      neutral: Math.round(((emotions.Neutral || 0) / total) * 100)
    };
  };
  
  // Tab configuration
  const tabs = [
    { id: 'consolidated', name: 'All Platforms' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'manual', name: 'Manual Reviews' }
  ];

  // Period filter configuration
  const periods = [
    { id: '1d', name: '1 Day', label: '1D' },
    { id: '7d', name: '7 Days', label: '7D' },
    { id: '1m', name: '1 Month', label: '1M' },
    { id: '3m', name: '3 Months', label: '3M' },
    { id: '6m', name: '6 Months', label: '6M' },
    { id: '1y', name: '1 Year', label: '1Y' }
  ];

  // ==================== DATA FILTERING FUNCTIONS ====================
  // These functions will be replaced with API calls
  
  // Get sentiment data based on active tab
  const getCurrentSentiments = () => {
    if (!apiData) return { positive: 0, negative: 0, neutral: 0 };
    
    // For all tabs (consolidated, youtube, manual), API returns data at root level
    // The platform parameter in the URL determines what data is returned
    return getTransformedSentiments();
  };
  
  // Get approval rating based on active tab
  const getApprovalRate = () => {
    if (!apiData) return 0;
    
    // Approval is always at root level regardless of platform
    return apiData.approval !== undefined ? apiData.approval : 0;
  };
  
  // Get filtered comments based on active tab
  const getFilteredComments = () => {
    if (!apiData || !apiData.comments) return [];
    
    // API returns filtered comments based on platform parameter
    // No need to filter here - API already did it
    return apiData.comments;
  };
  
  // Get platform comparison data
  const getPlatformComparisonData = () => {
    if (!apiData || !apiData.platformSentiments) return [];
    
    const platforms = ['youtube', 'manual'];
    return platforms.map(platform => {
      const data = apiData.platformSentiments[platform];
      return data ? {
        positive: data.positive,
        negative: data.negative,
        neutral: data.neutral
      } : { positive: 0, negative: 0, neutral: 0 };
    });
  };
  
  // Get emotion data based on active tab
  const getCurrentEmotions = () => {
    if (!apiData) return { joy: 0, love: 0, surprise: 0, trust: 0, anger: 0, sadness: 0, fear: 0, disgust: 0, neutral: 0 };
    
    // API returns emotions at root level based on platform parameter
    return getTransformedEmotions();
  };

  // Get trend labels based on selected period
  const getTrendLabels = () => {
    switch (activePeriod) {
      case '1d':
        return ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'];
      case '7d':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '1m':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case '3m':
        return ['Month 1', 'Month 2', 'Month 3'];
      case '6m':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      case '1y':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
  };
  
  // Generate trend data based on period and platform
  // TODO: Replace with API call - GET /api/dashboard/trends?period={activePeriod}&platform={activeTab}
  const getTrendData = () => {
    const dataPoints = getTrendLabels().length;
    const currentSentiments = getCurrentSentiments();
    
    // Generate realistic trend data based on current sentiments
    return {
      positive: Array.from({ length: dataPoints }, (_, i) => 
        currentSentiments.positive + Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 3
      ).map(v => Math.max(0, Math.min(100, Math.round(v)))),
      neutral: Array.from({ length: dataPoints }, (_, i) => 
        currentSentiments.neutral + Math.cos(i * 0.3) * 4 + (Math.random() - 0.5) * 2
      ).map(v => Math.max(0, Math.min(100, Math.round(v)))),
      negative: Array.from({ length: dataPoints }, (_, i) => 
        currentSentiments.negative + Math.sin(i * 0.4) * 2 + (Math.random() - 0.5) * 1
      ).map(v => Math.max(0, Math.min(100, Math.round(v))))
    };
  };
  // ==================== END DATA FILTERING FUNCTIONS ====================

  // Handler for chart clicks
  const handleChartClick = async (event, elements, chartType) => {
    if (elements.length > 0) {
      const clickedElement = elements[0];
      const datasetIndex = clickedElement.datasetIndex;
      const index = clickedElement.index;
      
      // Get the clicked label and value
      let label, value, category;
      
      if (chartType === 'pie' || chartType === 'doughnut') {
        label = sentimentData.labels[index];
        value = sentimentData.datasets[0].data[index];
        category = label.toLowerCase();
      } else if (chartType === 'bar') {
        label = platformComparisonData.labels[index];
        value = platformComparisonData.datasets[datasetIndex].data[index];
        category = `${platformComparisonData.datasets[datasetIndex].label}-${label}`;
      } else if (chartType === 'line') {
        label = trendData.labels[index];
        value = trendData.datasets[datasetIndex].data[index];
        category = `trend-${label}`;
      }

      console.log('Chart clicked:', { chartType, label, value, category, datasetIndex, index });

      // Set loading state
      setIsLoadingDetails(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/sentiment-details?category=${category}&platform=${activeTab}&period=${activePeriod}`);
      // const detailData = await response.json();
      
      try {
        // Simulated API response
        setTimeout(() => {
          const mockDetailData = {
            category: label,
            value: value,
            chartType: chartType,
            detailedComments: [
              { id: 1, text: `Detailed comment for ${label} - Sample 1`, author: 'User1', timestamp: new Date().toISOString() },
              { id: 2, text: `Detailed comment for ${label} - Sample 2`, author: 'User2', timestamp: new Date().toISOString() },
              { id: 3, text: `Detailed comment for ${label} - Sample 3`, author: 'User3', timestamp: new Date().toISOString() },
            ],
            metadata: {
              totalCount: 156,
              averageRating: 4.2,
              topKeywords: ['quality', 'service', 'value']
            }
          };
          
          setClickedData(mockDetailData);
          setIsLoadingDetails(false);
          
          // Scroll to the details section
          document.getElementById('chart-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 800);

      } catch (error) {
        console.error('Error fetching detailed data:', error);
        setIsLoadingDetails(false);
      }
    }
  };

  // Transform API comments data to UI format
  const transformComment = (comment, index, sentiment) => {
    const text = comment.text || comment.review_text || '';
    const date = new Date(comment.created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return {
      id: index,
      platform: activeTab === 'consolidated' ? 'All' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
      rating: comment.scaled_score || 0,
      date: date,
      text: text,
      author: 'Anonymous',
      sentiment: sentiment
    };
  };

  const positiveComments = commentsData?.positiveComments?.map((c, i) => transformComment(c, i, 'positive')).slice(0, 4) || [];
  const negativeComments = commentsData?.negativeComments?.map((c, i) => transformComment(c, i, 'negative')).slice(0, 4) || [];

  // Use API data for insights
  const positiveAreas = apiData?.positiveAreas || [];
  const improvementAreas = apiData?.improvementAreas || [];

  // Chart data - uses filtering functions
  
  // Overall Sentiment Distribution (Pie Chart)
  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          getCurrentSentiments().positive,
          getCurrentSentiments().negative,
          getCurrentSentiments().neutral,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        hoverBackgroundColor: ['#059669', '#dc2626', '#d97706'],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        hoverOffset: 15,
      },
    ],
  };

  // Public Approval Rating (Doughnut Chart)
  const approvalData = {
    labels: ['Approved', 'Disapproved'],
    datasets: [
      {
        data: [getApprovalRate(), 100 - getApprovalRate()],
        backgroundColor: ['#3b82f6', '#94a3b8'],
        hoverBackgroundColor: ['#2563eb', '#64748b'],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        hoverOffset: 20,
      },
    ],
  };

  // Platform Comparison - Overall Sentiment (Bar Chart)
  const platformComparison = getPlatformComparisonData();
  const platformLabels = ['YouTube', 'Manual'];
  const platformComparisonData = {
    labels: platformLabels,
    datasets: [
      {
        label: 'Positive',
        data: platformComparison.map(p => p.positive),
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#059669',
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#047857',
      },
      {
        label: 'Neutral',
        data: platformComparison.map(p => p.neutral),
        backgroundColor: '#f59e0b',
        hoverBackgroundColor: '#d97706',
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#b45309',
      },
      {
        label: 'Negative',
        data: platformComparison.map(p => p.negative),
        backgroundColor: '#ef4444',
        hoverBackgroundColor: '#dc2626',
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#b91c1c',
      },
    ],
  };

  // Positive Reviews by Platform (Bar Chart)
  const positiveByPlatformData = {
    labels: platformLabels,
    datasets: [
      {
        label: '% of Positive Reviews',
        data: platformComparison.map(p => p.positive),
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#059669',
        borderRadius: 8,
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#047857',
      },
    ],
  };

  // Neutral Reviews by Platform (Bar Chart)
  const neutralByPlatformData = {
    labels: platformLabels,
    datasets: [
      {
        label: '% of Neutral Reviews',
        data: platformComparison.map(p => p.neutral),
        backgroundColor: '#f59e0b',
        hoverBackgroundColor: '#d97706',
        borderRadius: 8,
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#b45309',
      },
    ],
  };

  // Negative Reviews by Platform (Bar Chart)
  const negativeByPlatformData = {
    labels: platformLabels,
    datasets: [
      {
        label: '% of Negative Reviews',
        data: platformComparison.map(p => p.negative),
        backgroundColor: '#ef4444',
        hoverBackgroundColor: '#dc2626',
        borderRadius: 8,
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#b91c1c',
      },
    ],
  };

  // Sentiment Trend Over Time (Line Chart)
  const trends = getTrendData();
  const trendData = {
    labels: getTrendLabels(),
    datasets: [
      {
        label: 'Positive',
        data: trends.positive,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10b981',
        pointHoverBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hoverBorderWidth: 3,
      },
      {
        label: 'Neutral',
        data: trends.neutral,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#f59e0b',
        pointHoverBackgroundColor: '#d97706',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hoverBorderWidth: 3,
      },
      {
        label: 'Negative',
        data: trends.negative,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ef4444',
        pointHoverBackgroundColor: '#dc2626',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hoverBorderWidth: 3,
      },
    ],
  };

  // Emotion Analysis - Radar Chart
  const emotions = getCurrentEmotions();
  const emotionRadarData = {
    labels: ['Joy 😊', 'Love ❤️', 'Surprise 😲', 'Trust 🤝', 'Anger 😠', 'Sadness 😢', 'Fear 😨', 'Disgust 🤢'],
    datasets: [
      {
        label: 'Emotion Intensity',
        data: [
          emotions.joy,
          emotions.love,
          emotions.surprise,
          emotions.trust,
          emotions.anger,
          emotions.sadness,
          emotions.fear,
          emotions.disgust,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Emotion Distribution - Horizontal Bar Chart
  const emotionBarData = {
    labels: ['Joy 😊', 'Love ❤️', 'Trust 🤝', 'Surprise 😲', 'Sadness 😢', 'Anger 😠', 'Fear 😨', 'Disgust 🤢'],
    datasets: [
      {
        label: 'Percentage',
        data: [
          emotions.joy,
          emotions.love,
          emotions.trust,
          emotions.surprise,
          emotions.sadness,
          emotions.anger,
          emotions.fear,
          emotions.disgust,
        ],
        backgroundColor: [
          '#fbbf24', // Joy - yellow
          '#ec4899', // Love - pink
          '#10b981', // Trust - green
          '#8b5cf6', // Surprise - purple
          '#3b82f6', // Sadness - blue
          '#ef4444', // Anger - red
          '#f97316', // Fear - orange
          '#6366f1', // Disgust - indigo
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  // Emotion Doughnut Chart
  const emotionDoughnutData = {
    labels: ['Joy 😊', 'Love ❤️', 'Surprise 😲', 'Trust 🤝', 'Anger 😠', 'Sadness 😢', 'Fear 😨', 'Disgust 🤢'],
    datasets: [
      {
        data: [
          emotions.joy,
          emotions.love,
          emotions.surprise,
          emotions.trust,
          emotions.anger,
          emotions.sadness,
          emotions.fear,
          emotions.disgust,
        ],
        backgroundColor: [
          '#fbbf24',  // Joy - yellow
          '#ec4899',  // Love - pink
          '#8b5cf6',  // Surprise - purple
          '#10b981',  // Trust - green
          '#ef4444',  // Anger - red
          '#3b82f6',  // Sadness - blue
          '#f97316',  // Fear - orange
          '#6366f1',  // Disgust - indigo
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 15,
        hoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          afterLabel: function() {
            return '(Click for details)';
          }
        }
      }
    },
    onClick: (event, elements) => handleChartClick(event, elements, 'pie'),
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          afterLabel: function() {
            return '(Click for details)';
          }
        }
      }
    },
    onClick: (event, elements) => handleChartClick(event, elements, 'doughnut'),
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          afterLabel: function() {
            return '(Click for details)';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: '#94a3b8',
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          display: false,
        },
      },
    },
    onClick: (event, elements) => handleChartClick(event, elements, 'bar'),
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  const stackedBarOptions = {
    ...barChartOptions,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    scales: {
      ...barChartOptions.scales,
      x: {
        ...barChartOptions.scales.x,
        stacked: true,
      },
      y: {
        ...barChartOptions.scales.y,
        stacked: true,
      },
    },
    onClick: (event, elements) => handleChartClick(event, elements, 'bar'),
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 700,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          afterLabel: function() {
            return '(Click for details)';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: '#94a3b8',
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          display: false,
        },
      },
    },
    onClick: (event, elements) => handleChartClick(event, elements, 'line'),
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  // Emotion Radar Chart Options
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.r + '%';
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#94a3b8',
          backdropColor: 'transparent',
        },
        grid: {
          color: '#e2e8f0',
        },
        pointLabels: {
          font: {
            size: 11,
          },
          color: '#475569',
        },
      },
    },
  };

  // Emotion Horizontal Bar Chart Options
  const emotionBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.parsed.x + '%';
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: '#94a3b8',
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      y: {
        ticks: {
          color: '#475569',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Emotion Doughnut Chart Options
  const emotionDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 700,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          font: {
            size: 11,
          },
          color: '#64748b',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 14,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return label + ': ' + value + '% (' + percentage + '% of total)';
          }
        }
      }
    },
    cutout: '60%',
  };

  // Show loading state
  if (isLoading) {
    const platformName = activeTab === 'consolidated' ? 'All Platforms' : activeTab === 'youtube' ? 'YouTube' : 'Manual Reviews';
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600"></div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Loading {platformName} Data</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Fetching sentiment analysis from API...</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Platform: <span className="font-semibold">{platformName}</span> • Period: <span className="font-semibold">{periods.find(p => p.id === activePeriod)?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!apiData) {
    const platformName = activeTab === 'consolidated' ? 'All Platforms' : activeTab === 'youtube' ? 'YouTube' : 'Manual Reviews';
    return (
      <div className="space-y-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">Unable to Load {platformName} Dashboard</div>
              <div className="text-sm text-red-700 dark:text-red-400 mb-4">Failed to fetch data from the API server</div>
              <div className="text-xs text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/40 rounded-lg p-3 mb-4 font-mono">
                Platform: {activeTab} • Period: {activePeriod}<br/>
                {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'}/dashboard/...?platform={activeTab}&period={activePeriod}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sentiment Analysis Dashboard
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'consolidated' 
                ? 'Analysis across YouTube and Manual review platforms' 
                : activeTab === 'youtube' 
                ? 'YouTube Platform Analytics' 
                : 'Manual Reviews Analytics'
              } • Period: {periods.find(p => p.id === activePeriod)?.name}
            </p>
          </div>
          {apiData && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Reviews</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {apiData.positiveCount + apiData.negativeCount + apiData.neurtralCount}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              💡 Tip: Click on any chart element to view detailed analysis
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              🌐 {activeTab === 'consolidated' ? 'All Platforms' : activeTab === 'youtube' ? 'YouTube' : 'Manual'} Data
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Period Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        {/* Platform Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Period:</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setActivePeriod(period.id)}
                  className={`px-4 py-2 rounded-md font-medium text-xs transition-all ${
                    activePeriod === period.id
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={period.name}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Sentiment Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Overall Sentiment Distribution
          </h3>
          <div className="max-w-xs mx-auto">
            <Pie data={sentimentData} options={chartOptions} />
          </div>
        </div>

        {/* Public Approval Rating */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Public Approval Rating
          </h3>
          <div className="max-w-xs mx-auto mb-4">
            <Doughnut data={approvalData} options={doughnutChartOptions} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{getApprovalRate()}%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Approval Rate</div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Positive:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {getCurrentSentiments().positive}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Neutral:</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {getCurrentSentiments().neutral}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Negative:</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {getCurrentSentiments().negative}%
              </span>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Overall Sentiment:
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {getCurrentSentiments().positive > 50
                  ? '😊 Positive'
                  : getCurrentSentiments().negative > 50
                  ? '😟 Negative'
                  : '😐 Neutral'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Analysis Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-900 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Emotion Analysis
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Deep dive into emotional responses expressed in reviews
            </p>
          </div>
        </div>

        {/* Emotion Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emotion Radar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Emotion Intensity Map
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-md font-medium">
                Radar
              </span>
            </div>
            <div className="max-w-sm mx-auto">
              <Radar data={emotionRadarData} options={radarChartOptions} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                💡 Shows the balance of emotions across all dimensions
              </p>
            </div>
          </div>

          {/* Emotion Horizontal Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Emotion Distribution
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md font-medium">
                Bar
              </span>
            </div>
            <div className="h-80">
              <Bar data={emotionBarData} options={emotionBarOptions} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                📊 Comparative view of emotion percentages
              </p>
            </div>
          </div>

          {/* Emotion Doughnut Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Emotion Breakdown
              </span>
              <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs rounded-md font-medium">
                Doughnut
              </span>
            </div>
            <div className="max-w-sm mx-auto">
              <Doughnut data={emotionDoughnutData} options={emotionDoughnutOptions} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                🎯 Proportional view of emotion composition
              </p>
            </div>
          </div>
        </div>

        {/* Emotion Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Positive Emotions Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">😊</span>
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-300">
                Positive Emotions
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-400">Joy:</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-300">{emotions.joy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-400">Love:</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-300">{emotions.love}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-400">Trust:</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-300">{emotions.trust}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-400">Surprise:</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-300">{emotions.surprise}%</span>
              </div>
              <div className="pt-3 mt-3 border-t border-green-200 dark:border-green-800">
                <div className="text-sm text-green-800 dark:text-green-400">Total Positive:</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {emotions.joy + emotions.love + emotions.trust + emotions.surprise}%
                </div>
              </div>
            </div>
          </div>

          {/* Negative Emotions Summary */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">😟</span>
              <h4 className="text-lg font-semibold text-red-900 dark:text-red-300">
                Negative Emotions
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800 dark:text-red-400">Anger:</span>
                <span className="text-lg font-bold text-red-900 dark:text-red-300">{emotions.anger}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800 dark:text-red-400">Sadness:</span>
                <span className="text-lg font-bold text-red-900 dark:text-red-300">{emotions.sadness}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800 dark:text-red-400">Fear:</span>
                <span className="text-lg font-bold text-red-900 dark:text-red-300">{emotions.fear}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-800 dark:text-red-400">Disgust:</span>
                <span className="text-lg font-bold text-red-900 dark:text-red-300">{emotions.disgust}%</span>
              </div>
              <div className="pt-3 mt-3 border-t border-red-200 dark:border-red-800">
                <div className="text-sm text-red-800 dark:text-red-400">Total Negative:</div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {emotions.anger + emotions.sadness + emotions.fear + emotions.disgust}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Analysis - Only show in consolidated view */}
      {activeTab === 'consolidated' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Comparison - Stacked */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Platform Comparison (Stacked)
              </h3>
              <Bar data={platformComparisonData} options={stackedBarOptions} />
            </div>

            {/* Sentiment Trend Over Time */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Sentiment Trend Over Time
              </h3>
              <Line data={trendData} options={lineChartOptions} />
            </div>
          </div>

          {/* Detailed Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Positive Reviews by Platform */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Positive Reviews by Platform
              </h3>
              <Bar data={positiveByPlatformData} options={barChartOptions} />
            </div>

            {/* Neutral Reviews by Platform */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Neutral Reviews by Platform
              </h3>
              <Bar data={neutralByPlatformData} options={barChartOptions} />
            </div>

            {/* Negative Reviews by Platform */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Negative Reviews by Platform
              </h3>
              <Bar data={negativeByPlatformData} options={barChartOptions} />
            </div>
          </div>
        </>
      )}

      {/* Individual Platform Trend - Only show in platform-specific views */}
      {activeTab !== 'consolidated' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sentiment Trend Over Time
          </h3>
          <Line data={trendData} options={lineChartOptions} />
        </div>
      )}

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Positive Comments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Most Positive Comments
            </h3>
          </div>
          
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : positiveComments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No positive comments available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positiveComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-md">
                        {comment.platform}
                      </span>
                      {comment.rating > 0 && (
                        <div className="flex gap-0.5">
                          {[...Array(comment.rating)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {comment.date}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                    "{comment.text}"
                  </p>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    — {comment.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Negative Comments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Most Negative Comments
            </h3>
          </div>
          
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : negativeComments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No negative comments available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {negativeComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-md">
                        {comment.platform}
                      </span>
                      {comment.rating > 0 && (
                        <div className="flex gap-0.5">
                          {[...Array(comment.rating)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {comment.date}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                    "{comment.text}"
                  </p>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    — {comment.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary Sections */}
      {/* Temporarily commented out - Areas of Excellence and Areas for Improvement
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Areas - What's Working Well *\/}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Areas of Excellence
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Departments performing exceptionally well
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {positiveAreas.map((area, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {area.department}
                    </h4>
                    {area.trend === 'up' && (
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {area.score}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${area.score}%` }}
                  ></div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Key Strengths:
                  </p>
                  <ul className="space-y-1">
                    {area.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Overall Performance
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  These departments are driving customer satisfaction. Continue current strategies and share best practices across teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Areas Needing Improvement *\/}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Areas for Improvement
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Departments requiring attention and action
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {improvementAreas.map((area, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {area.department}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      area.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {area.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {area.score}%
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${area.score}%` }}
                  ></div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Common Issues:
                    </p>
                    <ul className="space-y-1">
                      {area.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                      Recommendations:
                    </p>
                    <ul className="space-y-1">
                      {area.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                  Action Required
                </p>
                <p className="text-xs text-red-800 dark:text-red-400">
                  These areas are impacting customer satisfaction negatively. Immediate action and resource allocation recommended for high-priority items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Interactive Chart Details Section */}
      {(clickedData || isLoadingDetails) && (
        <div id="chart-details" className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Detailed Analysis
                {clickedData && ` - ${clickedData.category}`}
              </h3>
            </div>
            <button
              onClick={() => setClickedData(null)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading detailed data...</p>
            </div>
          ) : clickedData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Data Points</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {clickedData.metadata.totalCount}
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Average Rating</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {clickedData.metadata.averageRating} / 5
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Percentage</div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    {clickedData.value}%
                  </div>
                </div>
              </div>

              {/* Top Keywords */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Top Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {clickedData.metadata.topKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Comments */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Sample Comments
                </h4>
                <div className="space-y-4">
                  {clickedData.detailedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Information Banner */}
              <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      Demo Mode
                    </p>
                    <p className="text-xs text-indigo-800 dark:text-indigo-400">
                      This is simulated data. In production, clicking on chart elements will trigger an API call to fetch real detailed data for the selected category.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}