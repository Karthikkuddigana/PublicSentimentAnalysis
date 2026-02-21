import { supabase } from './supabase';

// Test Supabase connection
export async function testSupabaseConnection() {
  console.group('🧪 Supabase Connection Test');
  
  console.log('1. Environment Variables:');
  console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  console.log('2. Supabase Client:');
  console.log('   Client exists:', !!supabase);
  console.log('   Auth exists:', !!supabase?.auth);
  
  try {
    console.log('3. Testing Auth API:');
    const { data, error } = await supabase.auth.getSession();
    console.log('   Session check result:', { data, error });
    
    if (error) {
      console.error('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Connection successful!');
      console.log('   Current session:', data.session ? 'Logged in' : 'Not logged in');
    }
  } catch (err) {
    console.error('   ❌ Failed to connect:', err);
  }
  
  console.groupEnd();
}

// Auto-run test on import (only in development)
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
