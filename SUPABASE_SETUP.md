# Supabase Authentication Setup Guide

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: Public Sentiment Analysis
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (takes about 2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Enable Google OAuth (Optional)

If you want to use Google Sign-In:

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list and click to configure it
3. Follow Supabase's guide to set up Google OAuth:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (Supabase will show you the exact URL)
4. Enter your Google Client ID and Client Secret in Supabase
5. Save the configuration

## Step 5: Configure Email Settings (Optional)

For production, configure email settings:

1. Go to **Authentication** > **Email Templates**
2. Customize the confirmation, magic link, and password reset emails
3. Set up SMTP settings in **Project Settings** > **Auth** if you want custom email delivery

## Step 6: Test Your Authentication

1. Start your development server:
```bash
npm run dev
```

2. Try signing up with a new account:
   - By default, Supabase requires email confirmation
   - Check your email for the confirmation link
   - Click the link to verify your account

3. Test logging in with your verified account
4. Test Google sign-in if you configured it
5. Test logout functionality

## Important Notes

### Email Confirmation

By default, Supabase requires email confirmation for new signups. You can disable this in development:

1. Go to **Authentication** > **Settings**
2. Turn OFF "Enable email confirmations"
3. This allows users to sign in immediately after signing up

### Security Best Practices

- **Never commit** your `.env.local` file to version control
- The `.gitignore` file is already configured to exclude it
- Use different Supabase projects for development and production
- Rotate your API keys regularly in production
- Enable Row Level Security (RLS) on your database tables

### Password Requirements

Supabase enforces minimum password requirements:
- At least 6 characters long
- You can customize this in **Authentication** > **Settings**

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct anon/public key (not the service_role key)
- Ensure there are no extra spaces in your `.env.local` file

### Email not arriving
- Check your spam folder
- Verify the email address is correct
- Check Supabase logs in **Authentication** > **Logs**

### Google OAuth redirect error
- Ensure your redirect URIs in Google Cloud Console match exactly what Supabase shows
- Make sure Google OAuth is enabled in Supabase dashboard

### "Session not found" errors
- Clear your browser's local storage
- Try logging out and back in
- Check that cookies are enabled

## Additional Resources

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase OAuth Providers Guide](https://supabase.com/docs/guides/auth/social-login)

## Features Implemented

✅ Email/Password Authentication
✅ Google OAuth Sign-In
✅ User Session Management
✅ Protected Routes
✅ Automatic Token Refresh
✅ Password Reset (backend ready)
✅ Email Confirmation Support
✅ Loading States
✅ Error Handling

## Next Steps

Consider adding:
- Password reset flow UI
- Email verification reminder
- Profile management page
- Multi-factor authentication
- Social login with other providers (Facebook, Twitter, GitHub)
