# ✅ Pre-Deployment Checklist

Use this checklist before deploying to Vercel.

---

## 📋 Environment Setup

### MongoDB Atlas
- [ ] Created MongoDB Atlas account
- [ ] Created new cluster (Free M0 tier)
- [ ] Created database user with read/write permissions
- [ ] Whitelisted IP address: `0.0.0.0/0` (Allow from anywhere)
- [ ] Copied connection string (replaced `<password>` with actual password)
- [ ] Tested connection locally

### Google Gemini AI
- [ ] Visited [ai.google.dev](https://ai.google.dev/)
- [ ] Created or selected project
- [ ] Enabled Gemini API
- [ ] Generated API key
- [ ] Tested API key locally

### Better Auth Secret
- [ ] Generated secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Copied generated secret (32+ characters)
- [ ] Stored securely

---

## 🔧 Local Testing

### Build & Run
- [ ] Installed dependencies: `npm install`
- [ ] Created `.env.local` with all required variables
- [ ] Ran development server: `npm run dev`
- [ ] Tested all pages load correctly
- [ ] Tested user authentication (login/signup)
- [ ] Uploaded test receipt
- [ ] Verified receipt processing works
- [ ] Checked dashboard displays data
- [ ] Tested AI chat widget
- [ ] Tested report exports (PDF/CSV)
- [ ] Verified dark mode works
- [ ] Checked responsive design on mobile

### Production Build
- [ ] Ran: `npm run build`
- [ ] Build completed successfully (no errors)
- [ ] Ran: `npm start`
- [ ] Tested production build locally
- [ ] All features work in production mode

---

## 📝 Documentation Review

### Files Updated
- [ ] README.md has correct repository URL
- [ ] package.json has correct author/repository info
- [ ] .env.example is up to date
- [ ] All documentation reflects current features

### Sensitive Data
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] `.env.local` is in `.gitignore`
- [ ] No sensitive data committed to Git

---

## 🌐 Git & GitHub

### Repository Setup
- [ ] Created GitHub repository
- [ ] Repository is public (or private if preferred)
- [ ] Added descriptive README.md
- [ ] Added LICENSE file
- [ ] Added .gitignore

### Code Commit
```bash
# Run these commands:
git init                          # ✓ Initialize Git
git add .                         # ✓ Stage all files
git commit -m "Initial commit"    # ✓ Commit changes
git branch -M main                # ✓ Rename branch to main
git remote add origin <YOUR_URL>  # ✓ Add remote
git push -u origin main           # ✓ Push to GitHub
```

- [ ] All code committed to Git
- [ ] Pushed to GitHub
- [ ] Repository is accessible

---

## 🚀 Vercel Setup

### Import Project
- [ ] Logged into [vercel.com](https://vercel.com)
- [ ] Clicked "Add New" → "Project"
- [ ] Imported GitHub repository
- [ ] Selected correct repository

### Configure Build Settings
- [ ] Framework preset: **Next.js** (auto-detected)
- [ ] Build command: `next build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Install command: `npm install` (default)

### Environment Variables
Add these in Vercel dashboard:

**Required:**
- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `MONGODB_DB` - Database name: `ledgermind`
- [ ] `MONGODB_COLLECTION` - Collection name: `ledger`
- [ ] `BETTER_AUTH_SECRET` - Your generated 32-char secret
- [ ] `NEXT_PUBLIC_APP_URL` - Will update after first deploy
- [ ] `LLM_PROVIDER` - Set to: `gemini`
- [ ] `EMBEDDINGS_PROVIDER` - Set to: `gemini`
- [ ] `GOOGLE_API_KEY` - Your Google AI API key

**Optional:**
- [ ] `GROQ_API_KEY` - If using Groq as fallback
- [ ] `USE_LOCAL_RECEIPT_PARSE` - Set to `false`

---

## 🎯 First Deployment

### Deploy
- [ ] Clicked "Deploy" button in Vercel
- [ ] Wait 2-3 minutes for build
- [ ] Build completed successfully
- [ ] No build errors in logs

### Post-Deploy
- [ ] Copied deployment URL from Vercel
- [ ] Updated `NEXT_PUBLIC_APP_URL` in environment variables with actual URL
- [ ] Triggered redeploy (or changed env var scope to Production + redeploy)

---

## ✅ Production Testing

### Basic Functionality
- [ ] Visited production URL
- [ ] Landing page loads correctly
- [ ] All images and styles load
- [ ] No console errors in browser

### Authentication
- [ ] Signup page works
- [ ] Can create new account
- [ ] Login page works
- [ ] Can log in successfully
- [ ] Session persists on refresh

### Core Features
- [ ] Dashboard loads with data
- [ ] Can navigate to all pages
- [ ] Receipt upload works
- [ ] File upload processes successfully
- [ ] Receipt appears in list
- [ ] Can view receipt details
- [ ] Can update receipt information
- [ ] AI categorization works

### Advanced Features
- [ ] AI chat widget responds
- [ ] Natural language queries work
- [ ] Analytics display correctly
- [ ] Charts render properly
- [ ] Reports page loads
- [ ] PDF export works
- [ ] CSV export works

### UI/UX
- [ ] Dark mode toggle works
- [ ] Theme persists on refresh
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Animations are smooth
- [ ] No layout shifts

---

## 🔐 Security Check

### Headers
- [ ] Open browser DevTools → Network
- [ ] Check response headers include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (if HTTPS)

### Authentication
- [ ] Can't access `/app/*` routes without login
- [ ] Redirects to login when not authenticated
- [ ] Session expires appropriately
- [ ] Logout works correctly

### API Security
- [ ] API routes require authentication
- [ ] Invalid requests return proper errors
- [ ] No sensitive data in client-side code

---

## 📊 Performance Check

### Lighthouse Audit
- [ ] Run Lighthouse in Chrome DevTools
- [ ] Performance score: 80+ (target: 90+)
- [ ] Accessibility score: 90+ (target: 95+)
- [ ] Best Practices: 90+ (target: 100)
- [ ] SEO score: 90+ (target: 100)

### Load Times
- [ ] Page loads in <3 seconds
- [ ] Images load quickly
- [ ] No render-blocking resources
- [ ] Bundle size is optimized

---

## 🐛 Error Monitoring

### Vercel Logs
- [ ] Check Vercel function logs for errors
- [ ] No critical errors in logs
- [ ] API routes responding correctly
- [ ] Build logs are clean

### Browser Console
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No failed network requests
- [ ] No CORS errors

---

## 📱 Cross-Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on Mac)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design works
- [ ] Touch interactions work

---

## 🎉 Launch Checklist

### Final Steps
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Security headers configured
- [ ] Monitoring in place

### Optional (Recommended)
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Create status page
- [ ] Prepare announcement

### Share
- [ ] Update README with live demo link
- [ ] Share on social media
- [ ] Post on relevant communities
- [ ] Gather user feedback

---

## 🎊 Congratulations!

If all items are checked, your app is **LIVE** and ready for users! 🚀

### Next Steps:
1. Monitor usage and errors
2. Gather user feedback
3. Plan feature updates
4. Optimize based on metrics
5. Scale as needed

---

## 📞 Need Help?

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 💬 [GitHub Issues](https://github.com/yourusername/ledgermind/issues)
- 📧 [Contact Support](mailto:support@ledgermind.app)

---

**Happy Deploying! 🎉**
