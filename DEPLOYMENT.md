# 🚀 Vercel Deployment Guide for LedgerMind

Complete guide to deploy LedgerMind to Vercel in minutes.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **GitHub Account** - For repository hosting
- ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- ✅ **MongoDB Atlas Account** - Free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- ✅ **Google AI API Key** - Get from [ai.google.dev](https://ai.google.dev/)

---

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Vercel"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/ledgermind.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your **ledgermind** repository
5. Click **"Import"**

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

#### Required Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=ledgermind
MONGODB_COLLECTION=ledger

# Auth (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
BETTER_AUTH_SECRET=your_32_character_secret_here

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# AI Provider
LLM_PROVIDER=gemini
EMBEDDINGS_PROVIDER=gemini

# Google AI
GOOGLE_API_KEY=your_google_gemini_api_key
```

#### Optional Variables

```env
# Groq (alternative AI provider)
GROQ_API_KEY=your_groq_api_key

# Local processing
USE_LOCAL_RECEIPT_PARSE=false
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app is live! 🎉

### Step 5: Update App URL

After deployment:

1. Copy your Vercel deployment URL (e.g., `https://ledgermind.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Click **"Redeploy"** to apply changes

---

## 🔧 Detailed Setup

### MongoDB Atlas Setup

1. **Create Account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select your preferred region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose username & password
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - This is your `MONGODB_URI`

### Google Gemini AI Setup

1. **Get API Key**
   - Visit [ai.google.dev](https://ai.google.dev/)
   - Click "Get API Key"
   - Create new project or use existing
   - Copy your API key

2. **Add to Vercel**
   - In Vercel, add `GOOGLE_API_KEY` environment variable
   - Paste your API key
   - Set `LLM_PROVIDER=gemini`

### Generate Auth Secret

Run this command locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `BETTER_AUTH_SECRET`.

---

## 🎨 Custom Domain (Optional)

### Add Your Domain

1. Go to **Settings → Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `ledgermind.app`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### Update Environment Variables

After adding custom domain:

```env
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

Click **"Redeploy"** to apply changes.

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! ✨
```

### Preview Deployments

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Automatic preview URLs

---

## 📊 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `MONGODB_DB` | Yes | Database name | `ledgermind` |
| `MONGODB_COLLECTION` | Yes | Collection name | `ledger` |
| `BETTER_AUTH_SECRET` | Yes | 32-char secret for auth | `abc123...` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL | `https://app.vercel.app` |
| `LLM_PROVIDER` | Yes | AI provider | `gemini` |
| `EMBEDDINGS_PROVIDER` | Yes | Embeddings provider | `gemini` |
| `GOOGLE_API_KEY` | Yes* | Google AI API key | `AIza...` |
| `GROQ_API_KEY` | No | Groq API key (optional) | `gsk_...` |
| `USE_LOCAL_RECEIPT_PARSE` | No | Skip LLM for parsing | `false` |

*Required if using Gemini as LLM provider

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build fails with dependency errors

**Solution:**
```bash
# Locally test the build
npm run build

# If it works locally, check Vercel logs
# Ensure all environment variables are set
```

### MongoDB Connection Fails

**Issue:** "MongooseServerSelectionError"

**Solutions:**
1. Check MongoDB URI is correct
2. Ensure IP whitelist includes `0.0.0.0/0`
3. Verify database user has correct permissions
4. Check username/password in connection string

### Auth Not Working

**Issue:** Users can't log in

**Solutions:**
1. Verify `BETTER_AUTH_SECRET` is set
2. Check `NEXT_PUBLIC_APP_URL` matches deployment URL
3. Ensure secret is 32+ characters
4. Redeploy after changing environment variables

### AI Features Not Working

**Issue:** Receipt processing fails

**Solutions:**
1. Verify `GOOGLE_API_KEY` is set correctly
2. Check API key has Gemini API enabled
3. Ensure `LLM_PROVIDER=gemini`
4. Check API quota in Google Cloud Console

---

## 📈 Performance Optimization

### Edge Functions

API routes are optimized for Edge runtime where possible.

### Image Optimization

Next.js Image component automatically optimizes images:
- Automatic WebP conversion
- Responsive images
- Lazy loading

### Caching

Vercel provides automatic caching:
- Static assets cached at edge
- API responses cached when appropriate
- CDN distribution worldwide

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use strong `BETTER_AUTH_SECRET` (32+ chars)
- ✅ Rotate API keys periodically
- ✅ Use different secrets for production/preview

### MongoDB

- ✅ Create separate database users per environment
- ✅ Use read-only users where appropriate
- ✅ Enable MongoDB Atlas encryption
- ✅ Regular backups (Atlas does this automatically)

### API Routes

- ✅ All routes protected with authentication
- ✅ Input validation on all endpoints
- ✅ Rate limiting enabled
- ✅ CORS configured properly

---

## 📱 Testing Deployment

After deployment, test these features:

- [ ] Landing page loads
- [ ] User can sign up/login
- [ ] Upload receipt works
- [ ] Receipt processing completes
- [ ] Dashboard shows data
- [ ] AI chat responds
- [ ] Reports export works
- [ ] Dark mode toggles

---

## 💡 Tips & Tricks

### Preview Deployments

Every push to a branch gets its own preview URL:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Check Vercel dashboard for preview URL
```

### Environment Variables per Branch

Set different variables for production vs preview:
1. Go to **Settings → Environment Variables**
2. Choose environment: Production, Preview, or Development
3. Set variable value
4. Save

### Logs & Analytics

Monitor your app:
- **Deployment logs** - Build output
- **Function logs** - API route logs
- **Analytics** - Page views, performance
- **Error tracking** - Runtime errors

---

## 🎓 Next Steps

After deployment:

1. **Monitor Performance**
   - Check Vercel Analytics
   - Review function execution times
   - Monitor error rates

2. **Set Up Alerts**
   - Configure Vercel Notifications
   - Set up MongoDB Atlas alerts
   - Add uptime monitoring

3. **Optimize Costs**
   - Review function execution times
   - Optimize database queries
   - Use caching effectively

4. **Scale Up**
   - Upgrade Vercel plan if needed
   - Upgrade MongoDB cluster
   - Add more regions

---

## 📞 Support

Need help?

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 🆘 [Vercel Support](https://vercel.com/support)
- 💬 [MongoDB Support](https://www.mongodb.com/support)
- 🐛 [GitHub Issues](https://github.com/yourusername/ledgermind/issues)

---

**Happy Deploying! 🚀**
