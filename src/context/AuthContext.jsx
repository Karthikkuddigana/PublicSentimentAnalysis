import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../lib/supabaseTest'; // Run connection test in development

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug: Check if supabase is initialized
  useEffect(() => {
    console.log('🔍 Supabase client:', supabase);
    console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔍 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log('🔄 Checking existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📦 Session:', session);
        
        // If session exists, fetch and store organization_id if not in localStorage
        if (session?.user && !localStorage.getItem('organization_id')) {
          console.log('📦 Fetching organization_id for existing session...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error('⚠️ Error fetching organization_id:', userError);
          } else if (userData?.organization_id) {
            console.log('✅ Organization ID fetched:', userData.organization_id);
            localStorage.setItem('organization_id', userData.organization_id);
          }
        }
        
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('❌ Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔔 Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting Supabase login...');
      console.log('� Email:', email);
      console.log('🔍 Supabase object exists:', !!supabase);
      console.log('🔍 Supabase.auth exists:', !!supabase?.auth);
      console.log('🌐 ENV URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 ENV KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      if (!supabase || !supabase.auth) {
        throw new Error('Supabase client is not properly initialized. Did you restart the dev server?');
      }

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Environment variables not loaded. Please restart dev server with: npm run dev');
      }

      console.log('🚀 Making API call to Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📡 API Response - data:', data);
      console.log('📡 API Response - error:', error);

      if (error) {
        console.error('❌ Login error:', error.message);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Login succeeded but no user data returned');
      }
      
      console.log('✅ Login successful!', data.user.email);
      
      // Fetch organization_id from users table
      console.log('📦 Fetching organization_id...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.error('⚠️ Error fetching organization_id:', userError);
      } else if (userData?.organization_id) {
        console.log('✅ Organization ID fetched:', userData.organization_id);
        localStorage.setItem('organization_id', userData.organization_id);
      } else {
        console.warn('⚠️ No organization_id found for user');
      }
      
      setUser(data.user);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (email, password, metadata = {}) => {
    try {
      console.log('📝 Attempting signup...');
      console.log('📍 Email:', email);
      console.log('📋 Metadata:', metadata);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      const signupUrl = `${apiBaseUrl}/auth/signup`;
      
      console.log('🚀 Making API call to signup endpoint:', signupUrl);
      
      const requestBody = {
        organization_name: metadata.organizationName || '',
        username: metadata.username || '',
        email: email,
        password: password
      };
      
      console.log('📤 Request body:', { ...requestBody, password: '***' });
      
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('📡 Signup API Response:', data);

      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'Signup failed';
        console.error('❌ Signup error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Signup successful!', email);

      // Don't set user or fetch organization_id during signup
      // User will login after signup to get organization_id
      return { success: true, error: null, needsEmailConfirmation: false };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear organization_id from localStorage
      localStorage.removeItem('organization_id');
      console.log('🗑️ Organization ID cleared from localStorage');
      
      setUser(null);
      return { success: true, error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      loginWithGoogle, 
      logout,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);