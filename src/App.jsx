import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import ReportDownload from './components/ReportDownload';
import Header from './components/Header';

function MainApp() {
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
          <div className="space-y-6">
            <Dashboard data={analysisData} />
            <ReportDownload data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainApp />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch-all → redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;