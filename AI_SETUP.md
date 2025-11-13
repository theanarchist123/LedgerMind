# AI Provider Setup Guide

LedgerMind now supports multiple AI providers with automatic fallback for reliability and performance.

## Provider Options

### 1. **Groq** (Recommended - Fast & Free)
- **Speed**: Fastest option (10-50x faster than Gemini)
- **Cost**: Free tier with generous limits
- **Setup**:
  1. Go to https://console.groq.com
  2. Sign up for a free account
  3. Create an API key
  4. Add to `.env.local`: `GROQ_API_KEY="your-key-here"`
  5. Set `LLM_PROVIDER="groq"`

### 2. **Ollama** (Recommended - Local & Free)
- **Privacy**: 100% local, no data sent to cloud
- **Cost**: Free (runs on your computer)
- **Setup**:
  1. Install Ollama:
     - **Windows**: Download installer from https://ollama.com/download/windows
       - Run `OllamaSetup.exe`
       - After install, restart your terminal/PowerShell
       - Verify: Open new terminal and run `ollama --version`
     - **Mac**: `brew install ollama`
     - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
  2. Pull models (in a NEW terminal after restart):
     ```bash
     ollama pull nomic-embed-text
     ollama pull llama3.2
     ```
  3. Verify running: `ollama list`
  4. Set in `.env.local`:
     ```
     LLM_PROVIDER="ollama"
     EMBEDDINGS_PROVIDER="ollama"
     OLLAMA_BASE_URL="http://localhost:11434"
     ```

**IMPORTANT**: After installing Ollama, you MUST restart your terminal/command prompt for the `ollama` command to work!

### 3. **Gemini** (Fallback - Cloud)
- **Reliability**: Google's service, but can have 503 errors
- **Cost**: Free tier available
- **Setup**:
  1. Already configured with your key
  2. Used as automatic fallback if Groq/Ollama fail
  3. Set `LLM_PROVIDER="gemini"` to use as primary

## Recommended Configuration

**Best Performance & Reliability:**
```env
LLM_PROVIDER="groq"          # Fast cloud generation
EMBEDDINGS_PROVIDER="ollama" # Local embeddings
GROQ_API_KEY="your-groq-key"
OLLAMA_BASE_URL="http://localhost:11434"
GOOGLE_API_KEY="your-gemini-key" # Fallback
```

**100% Local & Private:**
```env
LLM_PROVIDER="ollama"
EMBEDDINGS_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
```

**Cloud Only (No Local Install):**
```env
LLM_PROVIDER="groq"
EMBEDDINGS_PROVIDER="gemini"
GROQ_API_KEY="your-groq-key"
GOOGLE_API_KEY="your-gemini-key"
```

## How Fallback Works

The system automatically tries providers in order:

**For Text Generation:**
1. Groq (if configured and LLM_PROVIDER="groq")
2. Ollama (if Groq fails or LLM_PROVIDER="ollama")
3. Gemini (if both fail)
4. Mock response (if all fail)

**For Embeddings:**
1. Ollama (if EMBEDDINGS_PROVIDER="ollama")
2. Gemini (if Ollama fails)
3. Mock embeddings (if all fail)

Each provider is tried with 3 retry attempts and exponential backoff.

## Testing Your Setup

After configuring, restart the dev server:
```bash
npm run dev
```

Upload a receipt and watch the console logs:
- `Using Groq for generation...` - Success with Groq
- `Using Ollama for embeddings...` - Success with Ollama
- `Groq generation failed, falling back to Ollama...` - Automatic fallback

## Troubleshooting

**Ollama Connection Failed:**
- Verify Ollama is running: `ollama list`
- Check the URL: `http://localhost:11434`
- Make sure models are pulled: `ollama pull llama3.1:8b`

**Groq API Errors:**
- Check your API key is valid
- Verify rate limits haven't been exceeded
- Check https://console.groq.com for status

**All Providers Failing:**
- The app will still work with mock responses
- Check console logs for specific error messages
- Verify `.env.local` has correct keys

## Performance Comparison

| Provider | Generation Speed | Embedding Speed | Cost | Privacy |
|----------|-----------------|-----------------|------|---------|
| Groq | ⚡⚡⚡ Very Fast | N/A | Free | Cloud |
| Ollama | ⚡⚡ Fast | ⚡⚡⚡ Very Fast | Free | 100% Local |
| Gemini | ⚡ Moderate | ⚡⚡ Fast | Free tier | Cloud |

## Next Steps

1. Get a free Groq API key: https://console.groq.com
2. Install Ollama for local AI: https://ollama.com
3. Update your `.env.local` with the keys
4. Restart the server: `npm run dev`
5. Upload a receipt and see the magic! ✨
