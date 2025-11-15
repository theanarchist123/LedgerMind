import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * POST /api/vapi/assistant
 * Create or update Vapi assistant programmatically with receipt knowledge
 */
export async function POST(req: NextRequest) {
  try {
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID

    if (!vapiPrivateKey) {
      return NextResponse.json(
        { error: "VAPI_PRIVATE_KEY not configured" },
        { status: 500 }
      )
    }

    let body: any = {}
    try {
      const text = await req.text()
      if (text && text.trim()) {
        body = JSON.parse(text)
      }
    } catch (e) {
      console.log('[Vapi] No body or invalid JSON, using defaults')
    }
    const { action = "update" } = body

    // Define assistant configuration with receipt tools
    const assistantConfig = {
      name: "SOPHIA - Receipt Assistant",
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        systemPrompt: `You are SOPHIA, an AI assistant for LedgerMind receipt tracking application.

Your capabilities:
- Answer questions about receipts, spending, and financial data
- Query receipt database using natural language
- Provide spending insights and analytics
- Help users understand their expenses and patterns

Guidelines:
- Be friendly, concise, and helpful
- Use the query_receipts tool to access receipt data
- Format monetary amounts clearly (e.g., $123.45)
- Provide actionable insights when discussing spending patterns
- If you don't have access to data, be honest about limitations

Available data:
- All user receipts with merchant, date, total, category, line items
- Spending trends and patterns
- Category breakdowns
- Quality assurance scores
- Duplicate detection results`
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice, you can change this
      },
      firstMessage: "Hey! How can I help you with your receipts today?",
      endCallFunctionEnabled: true,
      dialKeypadFunctionEnabled: false,
      recordingEnabled: false,
      hipaaEnabled: false,
      clientMessages: [
        "transcript",
        "function-call",
        "hang",
        "speech-update",
        "metadata",
        "conversation-update"
      ],
      serverMessages: [
        "end-of-call-report",
        "function-call",
        "hang",
        "speech-update",
        "status-update",
        "transcript",
        "conversation-update"
      ]
    }

    let response
    let url
    let method

    if (action === "create") {
      // Create new assistant
      url = "https://api.vapi.ai/assistant"
      method = "POST"
    } else {
      // Update existing assistant
      if (!vapiAssistantId) {
        return NextResponse.json(
          { error: "VAPI_ASSISTANT_ID not configured for update" },
          { status: 400 }
        )
      }
      url = `https://api.vapi.ai/assistant/${vapiAssistantId}`
      method = "PATCH"
    }

    response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${vapiPrivateKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(assistantConfig)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Vapi] API error:", data)
      return NextResponse.json(
        { error: "Failed to configure assistant", details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      action,
      assistant: data,
      message: `Assistant ${action === "create" ? "created" : "updated"} successfully`
    })

  } catch (error: any) {
    console.error("[Vapi] Error:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/vapi/assistant
 * Get current assistant configuration
 */
export async function GET(req: NextRequest) {
  try {
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID

    if (!vapiPrivateKey || !vapiAssistantId) {
      return NextResponse.json(
        { error: "Vapi credentials not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.vapi.ai/assistant/${vapiAssistantId}`,
      {
        headers: {
          "Authorization": `Bearer ${vapiPrivateKey}`
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch assistant", details: data },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error: any) {
    console.error("[Vapi] Error:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}
