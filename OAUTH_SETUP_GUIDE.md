# OAuth Setup Guide for LedgerMind

This guide will help you set up Google and GitHub OAuth authentication for LedgerMind.

## 🔐 Features Implemented

- ✅ Email/Password authentication
- ✅ Google OAuth login
- ✅ GitHub OAuth login
- ✅ Password reset functionality
- ✅ Secure session management

---

## 📝 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `LedgerMind` (or your preferred name)
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (or Internal if G Suite)
3. Fill in the required fields:
   - **App name**: `LedgerMind`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. Skip "Scopes" (or add `email` and `profile`)
6. Add test users if using External
7. Click **"Save and Continue"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: `LedgerMind Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click **"Create"**
6. Copy the **Client ID** and **Client Secret**

### Step 5: Update Environment Variables

Add to your `.env.local`:

```env
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

---

## 🐙 GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**

### Step 2: Configure OAuth App

**⚠️ IMPORTANT: GitHub only allows ONE callback URL per OAuth App**

You need to create **TWO separate OAuth Apps**:

#### Development OAuth App:
- **Application name**: `LedgerMind Dev`
- **Homepage URL**: `http://localhost:3000`
- **Application description**: `AI-powered receipt tracking (Development)`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

#### Production OAuth App:
- **Application name**: `LedgerMind`
- **Homepage URL**: `https://yourdomain.com`
- **Application description**: `AI-powered receipt tracking and management`
- **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

**OR** use only production URL and test OAuth in production (not recommended)

### Step 3: Get Credentials

**For Development App:**
1. Click **"Register application"**
2. Copy the **Client ID** (Development)
3. Click **"Generate a new client secret"**
4. Copy the **Client Secret** (Development) - save it now!

**For Production App:**
1. Create another OAuth App (repeat Step 2 with production URL)
2. Copy the **Client ID** (Production)
3. Click **"Generate a new client secret"**
4. Copy the **Client Secret** (Production) - save it now!

### Step 4: Update Environment Variables

**Local development** (`.env.local`):
```env
GITHUB_CLIENT_ID="your-dev-github-client-id"
GITHUB_CLIENT_SECRET="your-dev-github-client-secret"
```

**Production** (Vercel Environment Variables):
```env
GITHUB_CLIENT_ID="your-production-github-client-id"
GITHUB_CLIENT_SECRET="your-production-github-client-secret"
```

---

## 🚀 Deployment Setup (Vercel)

### Step 1: Update Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **"Settings"** → **"Environment Variables"**
3. Add the following variables:

```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=ledgermind
BETTER_AUTH_SECRET=your-32-char-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app

# OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Step 2: Update OAuth Redirect URIs

**For Google:**
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add production redirect URI:
   - `https://yourdomain.vercel.app/api/auth/callback/google`

**For GitHub:**
1. Use your **Production OAuth App** credentials in Vercel
2. The callback URL should already be set to:
   - `https://yourdomain.vercel.app/api/auth/callback/github`
3. **Remember**: Dev and Production use different GitHub OAuth Apps

### Step 3: Redeploy

```bash
git add .
git commit -m "Add OAuth authentication"
git push origin main
```

Vercel will automatically redeploy with the new environment variables.

---

## 🧪 Testing Authentication

### Test Email/Password
1. Go to `/auth/signup`
2. Create an account with email and password
3. Login at `/auth/login`

### Test Google OAuth
1. Go to `/auth/login`
2. Click the **"Google"** button
3. Authorize the app
4. You'll be redirected to `/app/dashboard`

### Test GitHub OAuth
1. Go to `/auth/login`
2. Click the **"GitHub"** button
3. Authorize the app
4. You'll be redirected to `/app/dashboard`

### Test Password Reset
1. Go to `/auth/login`
2. Click **"Forgot password?"**
3. Enter your email
4. Check console logs for reset link (until email service is configured)
5. Visit the reset link
6. Enter new password

---

## 📧 Email Service Setup (Optional)

The password reset functionality currently logs the reset link to the console. To send actual emails:

### Option 1: Resend (Recommended)

```bash
npm install resend
```

Update `lib/better-auth.ts`:

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

sendResetPassword: async ({ user, url }) => {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: user.email,
    subject: 'Reset Your Password',
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`
  });
}
```

### Option 2: SendGrid

```bash
npm install @sendgrid/mail
```

### Option 3: Nodemailer

```bash
npm install nodemailer
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use strong secrets** - Generate with: `openssl rand -hex 32`
3. **Use HTTPS in production** - Required for OAuth
4. **Rotate secrets regularly** - Especially if compromised
5. **Limit OAuth scopes** - Only request what you need
6. **Enable 2FA** - On your Google/GitHub accounts

---

## 🐛 Troubleshooting

### "Failed to authenticate" error
- Check that environment variables are set correctly
- Verify redirect URIs match exactly (including `/api/auth/callback/[provider]`)
- Ensure `NEXT_PUBLIC_APP_URL` matches your domain

### Google OAuth not working
- Make sure Google+ API is enabled
- Check OAuth consent screen is published
- Verify authorized domains are added

### GitHub OAuth not working
- Verify callback URL matches exactly
- Check client secret hasn't expired
- Ensure app is not suspended
- **Important**: Make sure you're using the correct OAuth App:
  - Development: Use Dev OAuth App credentials
  - Production: Use Production OAuth App credentials
- GitHub only allows ONE callback URL per app - you need separate apps for dev/prod

### Password reset not working
- Check console logs for reset link
- Verify email is registered in database
- Test with a real email service integration

---

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps Guide](https://docs.github.com/en/apps/oauth-apps)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✅ Checklist

- [ ] Google OAuth configured (supports multiple redirect URIs)
- [ ] GitHub OAuth **Development** App created
- [ ] GitHub OAuth **Production** App created (separate app required!)
- [ ] Environment variables set locally (with Dev GitHub credentials)
- [ ] Environment variables set in Vercel (with Production GitHub credentials)
- [ ] Redirect URIs updated for production
- [ ] Tested email/password signup
- [ ] Tested Google OAuth
- [ ] Tested GitHub OAuth
- [ ] Tested password reset
- [ ] (Optional) Email service configured

---

**Need help?** Check the Better Auth documentation or create an issue on GitHub.
