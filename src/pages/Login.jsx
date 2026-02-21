import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated delay for realistic feel
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen p-8 bg-slate-50 dark:bg-slate-950 relative">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-[440px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl mb-6">
            <span className="text-2xl font-black text-white">PS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Public Sentiment Analysis
          </h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
        </div>

        {/* Login Card */}
        <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label 
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="admin_user"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 mt-8 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Verifying...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}