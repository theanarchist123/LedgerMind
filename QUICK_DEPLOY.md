# 🚀 Quick Deploy - Ollama Cloud Configuration

## Required Environment Variables (Production)

Copy these to your production environment (Vercel, AWS, etc.):

```bash
# === AI PROVIDER (REQUIRED) ===
LLM_PROVIDER=ollama
EMBEDDINGS_PROVIDER=ollama

# === OLLAMA CLOUD (REQUIRED) ===
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_API_KEY=your_ollama_cloud_api_key_here
OLLAMA_LLM_MODEL=gemma3:4b-cloud
OLLAMA_EMBED_MODEL=nomic-embed-text:latest

# === DATABASE (REQUIRED) ===
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=ledgermind

# === AUTH (REQUIRED) ===
BETTER_AUTH_SECRET=your_32_char_secret
NEXT_PUBLIC_APP_URL=https://your-app-url.com

# === OAUTH (OPTIONAL) ===
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GITHUB_CLIENT_ID=your_github_oauth_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret

# === OTHER (OPTIONAL) ===
USE_LOCAL_RECEIPT_PARSE=false
OCR_SPACE_API_KEY=your_ocr_space_key
```

## 🔑 Get Your Ollama Cloud API Key

1. Visit: https://ollama.com
2. Sign up / Log in
3. Go to: Account → API Keys
4. Click: "Generate New Key"
5. Copy your key: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxx`

## ⚡ One-Command Vercel Deploy

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Login to Vercel
vercel login

# Set all env vars at once
vercel env add LLM_PROVIDER production
# Enter: ollama

vercel env add EMBEDDINGS_PROVIDER production
# Enter: ollama

vercel env add OLLAMA_BASE_URL production
# Enter: https://ollama.com

vercel env add OLLAMA_API_KEY production
# Paste your actual API key

vercel env add OLLAMA_LLM_MODEL production
# Enter: gemma3:4b-cloud

vercel env add OLLAMA_EMBED_MODEL production
# Enter: nomic-embed-text:latest

# Deploy!
vercel --prod
```

## ✅ Post-Deploy Checklist

After deployment, verify:

- [ ] Visit your app URL
- [ ] Upload a test receipt
- [ ] Check Vercel logs for: "Using Ollama Cloud for generation..."
- [ ] Test spending insights
- [ ] Try natural language query: "Show me coffee purchases"
- [ ] No errors about "unable to connect to AI provider"

## 🐛 Quick Troubleshooting

### Error: "Unable to connect to AI provider"
→ **Fix**: Check `OLLAMA_API_KEY` is set in production env

### Error: "Ollama Cloud 401"
→ **Fix**: Regenerate API key at ollama.com and update env var

### Error: "Ollama model not found"
→ **Fix**: Verify `OLLAMA_LLM_MODEL=gemma3:4b-cloud`

### Features not generating insights
→ **Fix**: Ensure `LLM_PROVIDER=ollama` and `EMBEDDINGS_PROVIDER=ollama`

### Receipt parsing showing "mock response"
→ **Fix**: Check all Ollama env vars are set correctly

## 📊 Expected Log Output

When working correctly, you should see:

```
✅ Using Ollama Cloud for generation at https://ollama.com...
✅ Model: gemma3:4b-cloud, API Key: c0993e7894...
✅ Using Ollama for embeddings (5 texts) at https://ollama.com...
```

## 🔗 Documentation

- Full Setup Guide: `PRODUCTION_AI_SETUP.md`
- Migration Notes: `AI_PROVIDER_MIGRATION.md`
- Environment Template: `.env.example`

## 💡 Pro Tips

1. **Test locally first**: `npm run dev` with `.env.local` configured
2. **Monitor usage**: Check Ollama Cloud dashboard for API usage
3. **Rate limits**: Be aware of Ollama Cloud rate limits (check dashboard)
4. **Secrets**: Never commit API keys to git
5. **Backup provider**: Keep Gemini key as backup (optional)

---

**Last Updated**: December 14, 2025
