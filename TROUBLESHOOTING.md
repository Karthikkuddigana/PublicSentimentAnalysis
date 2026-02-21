# 🚨 TROUBLESHOOTING SUPABASE LOGIN

## The Problem
You're not seeing API calls in the Network tab when trying to login.

## Most Common Cause
**Environment variables are not loaded.** You need to RESTART your dev server after creating/editing `.env.local`

## Quick Fix

1. **Stop your current dev server** (Press Ctrl+C in the terminal)

2. **Verify your `.env.local` file exists** in the project root with:
   ```
   VITE_SUPABASE_URL=https://rqmmvxpzkrkynfoavkax.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

4. **Open the browser console** and look for:
   - "🧪 Supabase Connection Test" log group
   - "✅ Supabase configured with URL: https://rqmmvxpzkrkynfoavkax.supabase.co"
   
5. **Try logging in again** and watch the Network tab for calls to `supabase.co`

## What to Check in Console

After restarting, you should see:
- ✅ Supabase configured with URL: https://rqmmvxpzkrkynfoavkax.supabase.co
- 🧪 Supabase Connection Test
- Environment variables showing the correct values

If you DON'T see these, the .env.local file isn't being read.

## Alternative: Hardcode for Testing (NOT for production!)

If env variables still don't work, temporarily edit `src/lib/supabase.js`:

```javascript
const supabaseUrl = 'https://rqmmvxpzkrkynfoavkax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbW12eHB6a3JreW5mb2F2a2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTk4MzQsImV4cCI6MjA4NzIzNTgzNH0.7eZn8oUYeJkNHUDkWS-9-67b1rnC79yhezPwuTOCV5A';
```

## Create Test Account

If connection works but login fails:

1. Go to http://localhost:5173/signup
2. Create a new account with:
   - Email: karthik@gmail.com
   - Password: password123
3. Check if email confirmation is required in Supabase dashboard:
   - Authentication > Settings
   - "Enable email confirmations" toggle
4. If enabled, check your email for confirmation link
5. Try logging in again

## Network Tab

Once working, you should see:
- POST call to `https://rqmmvxpzkrkynfoavkax.supabase.co/auth/v1/token?grant_type=password`
- Response with user data and session token

## Still Not Working?

Check:
1. Is `.env.local` in the project ROOT directory (not in src/)
2. Variable names start with `VITE_` (required for Vite)
3. No quotes around the values in .env.local
4. No spaces before/after the = sign
5. Dev server was restarted AFTER creating .env.local
