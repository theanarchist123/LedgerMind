import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getSpendingPredictor } from "@/lib/neural-network"

/**
 * POST /api/neural/predict
 * Get AI spending predictions powered by custom neural network
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, context } = body

    // Fetch user's receipts
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ledgermind")
    const receiptsCollection = db.collection(process.env.MONGODB_COLLECTION || "ledger")

    const query = userId ? { userId } : {}
    const receipts = await receiptsCollection
      .find(query)
      .sort({ date: -1 })
      .limit(100)
      .toArray()

    if (receipts.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No receipts found for training",
        prediction: null
      })
    }

    // Initialize and train predictor
    const predictor = getSpendingPredictor()
    await predictor.initialize(receipts.map(r => ({
      _id: r._id?.toString(),
      merchant: r.merchant || "Unknown",
      total: r.total || 0,
      date: r.date,
      category: r.category || "Other",
      userId: r.userId
    })))

    // Get prediction
    const prediction = predictor.predict(context)
    const modelInfo = predictor.getModelInfo()

    return NextResponse.json({
      success: true,
      prediction,
      model: modelInfo,
      receiptsUsed: receipts.length
    })
  } catch (error) {
    console.error("Neural prediction error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate prediction",
      prediction: null
    }, { status: 500 })
  }
}

/**
 * GET /api/neural/predict
 * Get prediction with default context
 */
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ledgermind")
    const receiptsCollection = db.collection(process.env.MONGODB_COLLECTION || "ledger")

    const receipts = await receiptsCollection
      .find({})
      .sort({ date: -1 })
      .limit(100)
      .toArray()

    if (receipts.length === 0) {
      return NextResponse.json({
        success: true,
        prediction: {
          predictedAmount: 0,
          predictedCategory: "Other",
          confidence: 0,
          trend: "stable",
          nextWeekEstimate: 0,
          insights: ["Upload receipts to get AI predictions"],
          riskLevel: "low",
          savingsOpportunity: 0
        },
        model: { trained: false, samples: 0, accuracy: 0 },
        receiptsUsed: 0
      })
    }

    const predictor = getSpendingPredictor()
    await predictor.initialize(receipts.map(r => ({
      _id: r._id?.toString(),
      merchant: r.merchant || "Unknown",
      total: r.total || 0,
      date: r.date,
      category: r.category || "Other",
      userId: r.userId
    })))

    const prediction = predictor.predict()
    const modelInfo = predictor.getModelInfo()

    return NextResponse.json({
      success: true,
      prediction,
      model: modelInfo,
      receiptsUsed: receipts.length
    })
  } catch (error) {
    console.error("Neural prediction error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate prediction"
    }, { status: 500 })
  }
}
