import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              PS
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Public Sentiment Analysis
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analyze"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/analyze')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Analyze Data
            </Link>
            <Link
              to="/review"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/review')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Submit Review
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                {user.username || 'User'}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}