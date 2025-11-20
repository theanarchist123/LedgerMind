# Vercel Environment Variables Setup

## Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

### 1. Database
```
MONGODB_URI=mongodb+srv://converso-user:goodies987@cluster0.angswxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=ledgermind
MONGODB_COLLECTION=ledger
```

### 2. Better Auth
```
BETTER_AUTH_SECRET=5f8c7d6e4a3b2c1d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6
NEXT_PUBLIC_APP_URL=https://ledger-mind.vercel.app
```

⚠️ **Important:** Replace `https://ledger-mind.vercel.app` with your actual Vercel deployment URL

### 3. OAuth Providers

#### Google OAuth
```
GOOGLE_CLIENT_ID=1017369686816-ub4jhdde95fid64k6aakhqgpq70ocup9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### GitHub OAuth
```
GITHUB_CLIENT_ID=Ov23lid9XSm1Yyb8AxY4
GITHUB_CLIENT_SECRET=4b4c2ea7a885567ca6402494f620954bf657c8ff
```

### 4. AI/ML Configuration
```
LLM_PROVIDER=ollama
EMBEDDINGS_PROVIDER=ollama
OLLAMA_LLM_MODEL=tinyllama
USE_LOCAL_RECEIPT_PARSE=false
GROQ_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
GOOGLE_API_KEY=AIzaSyBz7ekYqFCZ4Nio90DRLGFMhpbRIZ5huzE
TESSERACT_PATH=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

## Update OAuth Redirect URIs

### Google Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add BOTH of these to **Authorized redirect URIs**:
   ```
   https://ledger-mind.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
   ⚠️ **Important:** Add both production and localhost for testing

### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://ledger-mind.vercel.app/api/auth/callback/github
   ```
   
   Note: GitHub only allows ONE callback URL. For development, create a separate OAuth app with:
   ```
   http://localhost:3000/api/auth/callback/github
   ```

## After Deployment

1. Redeploy your Vercel app after adding all environment variables
2. Test OAuth login on your production URL
3. Check Vercel logs if issues persist: `vercel logs <deployment-url>`

## Common Issues

### "Redirect URI mismatch"
- Make sure the redirect URI in Google/GitHub matches exactly
- Format: `https://your-domain.vercel.app/api/auth/callback/[provider]`

### Session not persisting
- Verify `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL
- Check that `BETTER_AUTH_SECRET` is set correctly

### OAuth stays on same page
- This was fixed by using absolute URLs in callbacks
- Ensure `NEXT_PUBLIC_APP_URL` is correct
- Clear browser cache and cookies, then try again
