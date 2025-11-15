# Vapi AI Assistant Integration

## Overview
Integrated Vapi.ai voice and chat assistant (SOPHIA) to replace the previous chat widget. The assistant has full access to your receipt database and can answer questions naturally.

## What's Implemented

### 1. Vapi Widget Component (`components/vapi-widget.tsx`)
- Embedded chat/voice widget at bottom-right
- Dark theme with green accent (#3ee128)
- Custom branding: "SOPHIA"
- Voice transcript display
- Consent management

### 2. Receipt Query Tool (`app/api/vapi/tools/query-receipts/route.ts`)
Vapi assistant can call this tool to:
- Query receipts using natural language
- Get spending insights
- Retrieve recent receipts list
- Access all receipt data (merchant, date, total, category, line items)

### 3. Assistant Management API (`app/api/vapi/assistant/route.ts`)
- Programmatically create/update assistant
- Configure system prompt with receipt knowledge
- Register tools and webhooks
- Manage voice settings

### 4. SafeText Component (`components/safe-text.tsx`)
- Prevents "Objects are not valid as a React child" errors
- Safely renders any data type
- Special handling for receipt objects

## Setup Instructions

### 1. Add Vapi Private Key
Edit `.env.local` and add your Vapi private key:
```bash
VAPI_PRIVATE_KEY="your_actual_vapi_private_key"
VAPI_SERVER_SECRET="generate_a_random_secret"
```

Get your private key from: https://dashboard.vapi.ai/account/keys

### 2. Configure the Assistant Programmatically
Run this to update your assistant with receipt tools:

```bash
curl -X POST http://localhost:3000/api/vapi/assistant \ -H "Content-Type: application/json" \
  -d '{"action": "update"}'
```

Or use the browser:
```
http://localhost:3000/api/vapi/assistant (POST with {"action": "update"})
```

### 3. Restart Dev Server
```bash
npm run dev
```

## How It Works

### User Interaction Flow
1. User clicks SOPHIA widget (bottom-right)
2. User asks: "How much did I spend on food last month?"
3. Vapi sends request to `/api/vapi/tools/query-receipts`
4. Tool calls `queryReceipts()` from your NL query system
5. Returns natural language answer + receipt details
6. SOPHIA speaks/displays the response

### Available Queries
Examples the assistant can handle:
- "How much did I spend on food last month?"
- "Show me all Uber receipts"
- "What's my biggest purchase this year?"
- "Give me spending insights"
- "What are my recent receipts?"
- "How much have I spent in total?"
- "Which category costs me the most?"

### Tool Actions
The `query_receipts` tool supports three actions:

1. **query** (default)
   - Natural language search
   - Returns answer + relevant receipts

2. **get_insights**
   - Spending analysis
   - Trends, top categories, review status

3. **get_receipts**
   - Last 10 receipts
   - Summary format

## Configuration

### Assistant Personality
Edit `app/api/vapi/assistant/route.ts` to customize:
- System prompt
- Voice model (currently 11labs Rachel)
- First message
- Temperature/creativity

### Widget Appearance
Edit `components/vapi-widget.tsx` to change:
- Colors (accent-color, bg-color)
- Position (bottom-right, bottom-left, etc.)
- Size (full, compact)
- Title and messages

## Local Development with ngrok

Since Vapi requires publicly accessible https:// URLs for webhook endpoints, you need to use a tunneling service for local testing:

### Option 1: ngrok (Recommended)

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or use chocolatey on Windows:
   choco install ngrok
   ```

2. **Start your Next.js dev server** (port 3000):
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the https:// URL** from ngrok output (e.g., `https://abc123.ngrok.io`)

5. **Update your .env.local**:
   ```
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

6. **Configure the Vapi assistant** with the ngrok URL:
   ```bash
   curl -X POST https://abc123.ngrok.io/api/vapi/assistant \
     -H "Content-Type: application/json" \
     -d "{\"action\":\"update\"}"
   ```

### Option 2: localtunnel

1. **Install**:
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel**:
   ```bash
   lt --port 3000
   ```

3. Follow steps 4-6 from ngrok instructions above

### Important Notes

- ngrok URLs change every time you restart (unless you have a paid account)
- You'll need to reconfigure the Vapi assistant each time the URL changes
- For production, deploy to Vercel/similar and use the permanent https:// URL

## Testing

### 1. Check Widget Loads
Visit dashboard and look for SOPHIA widget in bottom-right corner.

### 2. Test Natural Language Query
Click widget and ask: "How much did I spend on food?"

### 3. Test Insights
Ask: "Give me spending insights"

### 4. Check Console Logs
Open browser DevTools and look for:
- `[Vapi Tool] Received request:` (shows tool calls)
- `[NLQuery]` logs (shows query processing)

### 5. Verify Assistant Config
```bash
curl http://localhost:3000/api/vapi/assistant
```

## Troubleshooting

### Widget Not Appearing
- Check console for script loading errors
- Verify `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set
- Ensure Vapi SDK script loads from unpkg

### Tool Not Being Called
- Check assistant has `query_receipts` tool registered
- Verify serverUrl is correct (must be publicly accessible for production)
- Check `VAPI_SERVER_SECRET` matches in assistant config and tool endpoint

### "Objects are not valid as React child" Error
- Ensure SafeText component is imported
- Replace any `{value}` with `<SafeText value={value} />`
- Check console for which component is throwing

### No Receipt Data Returned
- Verify userId is being passed correctly
- Check MongoDB connection
- Test `/api/rag/chat` endpoint directly

## Production Deployment

### 1. Set Public URL
Update `.env.local`:
```bash
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 2. Update Assistant
After deploying, update assistant with production URL:
```bash
curl -X POST https://yourdomain.com/api/vapi/assistant \
  -H "Content-Type: application/json" \
  -d '{"action": "update"}'
```

### 3. Webhook Security
Generate a strong secret for `VAPI_SERVER_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

### Tool Endpoint
**POST** `/api/vapi/tools/query-receipts`

Request from Vapi:
```json
{
  "message": {
    "toolCallId": "call_abc123",
    "toolCallList": [{
      "function": {
        "arguments": {
          "query": "How much on food?",
          "action": "query"
        }
      }
    }]
  }
}
```

Response:
```json
{
  "results": [{
    "toolCallId": "call_abc123",
    "result": "You spent $234.56 on food last month.\n\nRelevant receipts:\n• Subway - $12.50 on 2024-10-15..."
  }]
}
```

### Assistant Management
**POST** `/api/vapi/assistant` - Create/update assistant
**GET** `/api/vapi/assistant` - Get current config

## Next Steps

1. **Add More Tools**: Create tools for:
   - Receipt upload
   - Category editing
   - Duplicate merging
   - Export to CSV

2. **Voice Customization**: Try different voices from 11labs

3. **Analytics Integration**: Add tool to fetch dashboard metrics

4. **Multi-language**: Configure assistant for different languages

5. **Calendar Integration**: "Remind me to submit receipts"

## Resources
- Vapi Dashboard: https://dashboard.vapi.ai
- Vapi Docs: https://docs.vapi.ai
- Voice Library: https://elevenlabs.io/voice-library
