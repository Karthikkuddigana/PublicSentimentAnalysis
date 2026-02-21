// src/components/Header.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left - Brand */}
        <div className="flex items-center gap-3">
          {/* Optional logo */}
          {/* <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">S</div> */}
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Enterprise AI Sentiment Dashboard
          </h1>
        </div>

        {/* Right - User + Actions */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username || 'User'}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}