import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReviewForm from './pages/ReviewForm';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import ReportDownload from './components/ReportDownload';
import Header from './components/Header';

function DashboardPage() {
  const dummyData = {
    sentiments: {
      positive: 60,
      negative: 20,
      neutral: 20,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="space-y-6">
          <Dashboard data={dummyData} />
          <ReportDownload data={dummyData} />
        </div>
      </main>
    </div>
  );
}

function AnalyzePage() {
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysis = (data) => {
    setAnalysisData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <DataInput onSubmit={handleAnalysis} />
        {analysisData && (
          <div className="mt-6 space-y-6">
            <Dashboard data={analysisData} />
            <ReportDownload data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}

function ReviewFormPage() {
  return (
    <>
      <Header />
      <ReviewForm />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              {/* <Route path="/review" element={<ReviewFormPage />} /> */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch-all → redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;