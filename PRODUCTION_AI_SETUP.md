# Production AI Setup Guide - Ollama Cloud

This guide ensures your production deployment uses **Ollama Cloud exclusively** for all AI features.

## 🎯 Overview

All AI features in LedgerMind now use Ollama Cloud as the primary provider:
- ✅ Receipt parsing & OCR
- ✅ Embeddings for semantic search
- ✅ Spending insights & analytics
- ✅ Natural language queries
- ✅ Mood analysis
- ✅ Spending DNA
- ✅ Regret predictor
- ✅ Carbon tracker
- ✅ Auto-categorization

## 📋 Required Environment Variables

Add these to your production environment (Vercel/AWS/etc.):

```bash
# AI Provider Configuration
LLM_PROVIDER="ollama"
EMBEDDINGS_PROVIDER="ollama"

# Ollama Cloud Configuration
OLLAMA_BASE_URL="https://ollama.com"
OLLAMA_API_KEY="your_ollama_cloud_api_key"
OLLAMA_LLM_MODEL="gemma3:4b-cloud"
OLLAMA_EMBED_MODEL="nomic-embed-text:latest"

# Optional: Disable local parsing to force AI usage
USE_LOCAL_RECEIPT_PARSE="false"
```

## 🔑 Getting Your Ollama Cloud API Key

1. Go to [https://ollama.com](https://ollama.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the API key (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxx`)

## 🚀 Vercel Deployment

### Option 1: Using Vercel Dashboard

1. Go to your project settings on Vercel
2. Navigate to **Environment Variables**
3. Add each variable listed above
4. Redeploy your application

### Option 2: Using Vercel CLI

```bash
# Set environment variables
vercel env add LLM_PROVIDER production
# Enter: ollama

vercel env add EMBEDDINGS_PROVIDER production
# Enter: ollama

vercel env add OLLAMA_BASE_URL production
# Enter: https://ollama.com

vercel env add OLLAMA_API_KEY production
# Enter: your_actual_api_key_here

vercel env add OLLAMA_LLM_MODEL production
# Enter: gemma3:4b-cloud

vercel env add OLLAMA_EMBED_MODEL production
# Enter: nomic-embed-text:latest

vercel env add USE_LOCAL_RECEIPT_PARSE production
# Enter: false

# Redeploy
vercel --prod
```

## 🧪 Testing AI Features

After deployment, test these endpoints:

### 1. Receipt Upload & Parsing
```bash
# Upload a receipt - should use Ollama Cloud for parsing
POST /api/receipts/upload
```

### 2. Natural Language Query
```bash
# Test semantic search with embeddings
POST /api/rag/nl-query
Body: { "query": "Show me coffee purchases" }
```

### 3. Spending Insights
```bash
# Test AI-generated insights
GET /api/analytics/spending-insights
```

### 4. Check Logs
Look for these log messages in Vercel logs:
```
✅ Using Ollama Cloud for generation at https://ollama.com...
✅ Using Ollama for embeddings (X texts) at https://ollama.com...
```

## ❌ Troubleshooting

### Error: "Unable to connect to AI provider"

**Cause**: Environment variables not set or incorrect API key

**Solution**:
1. Verify `OLLAMA_API_KEY` is set correctly in production
2. Check `OLLAMA_BASE_URL` is `https://ollama.com` (not localhost)
3. Ensure `LLM_PROVIDER` and `EMBEDDINGS_PROVIDER` are both set to `"ollama"`

### Error: "Ollama model not found"

**Cause**: Model name incorrect or not available on Ollama Cloud

**Solution**:
1. Verify `OLLAMA_LLM_MODEL` is set to `gemma3:4b-cloud`
2. Verify `OLLAMA_EMBED_MODEL` is set to `nomic-embed-text:latest`
3. Check available models at [Ollama Cloud Models](https://ollama.com/models)

### Error: "Ollama embeddings/generation failed"

**Cause**: API key invalid or expired, or rate limit exceeded

**Solution**:
1. Regenerate API key from Ollama Cloud dashboard
2. Update `OLLAMA_API_KEY` in production environment
3. Check Ollama Cloud usage/quota limits
4. Verify Authorization header format: `Bearer {api_key}`

### Fallback to Mock/Gemini

**Cause**: Ollama Cloud configuration missing, causing fallback

**Solution**:
1. The app will throw an error instead of falling back when Ollama is configured
2. Check application logs for specific error messages
3. Ensure all required env vars are set (see above)

## 🔒 Security Best Practices

1. **Never commit** `.env.local` or API keys to git
2. Use **environment-specific** API keys (dev vs prod)
3. Set up **rate limiting** in Ollama Cloud dashboard
4. Monitor **API usage** regularly
5. Rotate API keys periodically

## 📊 Available Models

### LLM Models (Text Generation)
- `gemma3:4b-cloud` - ⭐ Recommended (fast, accurate)
- `llama3.2` - Alternative
- `mistral` - Alternative

### Embedding Models
- `nomic-embed-text:latest` - ⭐ Recommended (768 dimensions)
- `all-minilm` - Alternative (384 dimensions)

## 🔄 Switching Providers (Not Recommended)

If you need to switch back to Gemini:

```bash
LLM_PROVIDER="gemini"
EMBEDDINGS_PROVIDER="gemini"
GOOGLE_API_KEY="your_gemini_api_key"
```

**Note**: Not recommended for production as Ollama Cloud is optimized for this app.

## 📝 Configuration Summary

| Feature | Provider | Model |
|---------|----------|-------|
| Receipt Parsing | Ollama Cloud | gemma3:4b-cloud |
| Embeddings | Ollama Cloud | nomic-embed-text:latest |
| Insights | Ollama Cloud | gemma3:4b-cloud |
| NL Queries | Ollama Cloud | gemma3:4b-cloud |
| Analytics | Ollama Cloud | gemma3:4b-cloud |

## ✅ Verification Checklist

- [ ] `OLLAMA_API_KEY` set in production
- [ ] `OLLAMA_BASE_URL` is `https://ollama.com`
- [ ] `LLM_PROVIDER` is `ollama`
- [ ] `EMBEDDINGS_PROVIDER` is `ollama`
- [ ] `OLLAMA_LLM_MODEL` is `gemma3:4b-cloud`
- [ ] `OLLAMA_EMBED_MODEL` is `nomic-embed-text:latest`
- [ ] Application redeployed after env var changes
- [ ] Receipt upload works (check logs)
- [ ] Semantic search works
- [ ] Insights generate correctly
- [ ] No "unable to connect" errors

---

**Last Updated**: December 14, 2025
**Maintainer**: LedgerMind Team
