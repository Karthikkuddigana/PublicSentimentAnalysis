import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }} className="bg-slate-50 dark:bg-slate-950">
    
    <div className="w-full max-w-[440px] mx-auto">
      
      {/* Header - Generous bottom margin */}
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl mb-6">
          <span className="text-2xl font-black text-white">AI</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h2>
      </div>

      {/* The Card - Forced Padding with style tag */}
      <div 
        style={{ padding: '3rem', borderRadius: '2rem' }} 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '1rem 1.25rem' }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="admin_user"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '1rem 1.25rem' }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ padding: '1rem' }}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Verifying...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>

    </div>
  </div>
);
}