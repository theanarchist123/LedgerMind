# Manual Vapi Assistant Configuration

Since the API configuration is encountering issues, configure your assistant manually through the Vapi dashboard:

## Step 1: Go to Vapi Dashboard
Visit: https://dashboard.vapi.ai/assistants

## Step 2: Find Your Assistant
Look for Assistant ID: `7861adfd-bc03-4f7b-9fac-e5622e65a209`

## Step 3: Add Custom Tool

Click "+ Create Tool" button and select **"Custom Tool"**

### Tool Configuration

**Name:** `query_receipts`

**Description:**
```
Query receipt database using natural language. Use this to answer questions about spending, receipts, merchants, categories, dates, and amounts.
```

### Server Configuration

**URL:**
```
https://b5c3de2db80c.ngrok-free.app/api/vapi/tools/query-receipts
```

**Method:** POST

**Headers:** (if there's a headers section)
```json
{
  "Content-Type": "application/json"
}
```

### Function Schema

**Input Schema/Parameters:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "The natural language query about receipts. Examples: 'How much did I spend on food last month?', 'Show me all Uber receipts', 'What's my biggest purchase?'"
    },
    "action": {
      "type": "string",
      "enum": ["query", "get_insights", "get_receipts"],
      "description": "Type of action: 'query' for NL search, 'get_insights' for analytics, 'get_receipts' to list recent receipts"
    }
  },
  "required": ["query"]
}
```

### Security

**Server Secret/API Key:** (if available in the tool config)
```
5abba79403c7f8641a3ebc21d63be7791276613ed414794051d9da8d85d03954
```

**Timeout:** `20 seconds` (or default)

## Step 4: Update System Prompt

Make sure the assistant's system prompt includes:

```
You are SOPHIA, an AI assistant for LedgerMind receipt tracking application.

You help users:
- Search and query their receipt database using natural language
- Get spending insights and analytics
- Answer questions about expenses, merchants, categories, and totals

When users ask about their receipts or spending, use the query_receipts tool with:
- action: "query" for natural language questions
- action: "get_insights" for spending analysis
- action: "get_receipts" to list recent receipts

Always be helpful, concise, and accurate with financial information.
```

## Step 5: Save and Test

1. Save the assistant configuration
2. Open your app at: https://b5c3de2db80c.ngrok-free.app
3. Click the SOPHIA widget (bottom-right)
4. Ask: "How much did I spend on food last month?"

## Important Notes

- **ngrok URL changes** every time you restart ngrok (unless you have a paid account)
- When you restart ngrok, you'll need to update the Server URL in the Vapi dashboard
- For production, deploy to Vercel and use your permanent domain instead

## Alternative: Update via Vapi API Directly

If you prefer using the Vapi API directly (not through your Next.js app), use this curl command:

```bash
curl -X PATCH https://api.vapi.ai/assistant/7861adfd-bc03-4f7b-9fac-e5622e65a209 \
  -H "Authorization: Bearer f7212782-3f79-4df2-a5e4-3fc0253ff039" \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "systemPrompt": "You are SOPHIA, an AI assistant for LedgerMind receipt tracking. Help users query receipts, get spending insights, and answer financial questions. Use the query_receipts tool for all receipt-related queries."
    }
  }'
```

Note: Tool configuration via API might require a different endpoint or structure depending on Vapi's current API version.
