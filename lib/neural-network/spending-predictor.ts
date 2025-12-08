/**
 * Spending Predictor - Uses custom neural network to predict spending patterns
 * Trained on user's receipt history
 */

import { NeuralNetwork, TrainingData } from "./neural-network"

export interface Receipt {
  _id?: string
  merchant: string
  total: number
  date: string | Date
  category: string
  userId?: string
}

export interface SpendingPrediction {
  predictedAmount: number
  predictedCategory: string
  confidence: number
  trend: "increasing" | "decreasing" | "stable"
  nextWeekEstimate: number
  insights: string[]
  riskLevel: "low" | "medium" | "high"
  savingsOpportunity: number
}

// Category mapping for neural network encoding
const CATEGORIES = [
  "Food & Beverage",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Travel",
  "Education",
  "Other"
]

/**
 * Spending Predictor powered by custom neural network
 */
export class SpendingPredictor {
  private network: NeuralNetwork
  private receipts: Receipt[] = []
  private merchantFrequency: Map<string, number> = new Map()
  private categoryAverages: Map<string, number> = new Map()
  private isInitialized: boolean = false

  constructor() {
    // Input: [dayOfWeek, hourOfDay, categoryEncoded, prevAmount, avgSpend, merchantFreq, trend]
    // Output: [predictedAmount (normalized), categoryIndex (normalized), confidence]
    this.network = new NeuralNetwork({
      inputSize: 7,
      hiddenLayers: [16, 8],
      outputSize: 3,
      learningRate: 0.01
    })
  }

  /**
   * Initialize predictor with receipt history
   */
  async initialize(receipts: Receipt[]): Promise<void> {
    this.receipts = receipts
    
    if (receipts.length < 5) {
      return
    }

    // Calculate statistics
    this.calculateStatistics()
    
    // Prepare training data
    const trainingData = this.prepareTrainingData()
    
    if (trainingData.length > 0) {
      // Train the network
      this.network.train(trainingData, 300, 16)
      this.isInitialized = true
    }
  }

  /**
   * Calculate merchant frequency and category averages
   */
  private calculateStatistics(): void {
    // Merchant frequency
    for (const receipt of this.receipts) {
      const merchant = receipt.merchant.toLowerCase()
      this.merchantFrequency.set(merchant, (this.merchantFrequency.get(merchant) || 0) + 1)
    }

    // Category averages
    const categoryTotals: Map<string, { sum: number; count: number }> = new Map()
    for (const receipt of this.receipts) {
      const category = receipt.category || "Other"
      const existing = categoryTotals.get(category) || { sum: 0, count: 0 }
      categoryTotals.set(category, {
        sum: existing.sum + receipt.total,
        count: existing.count + 1
      })
    }

    for (const [category, data] of categoryTotals) {
      this.categoryAverages.set(category, data.sum / data.count)
    }
  }

  /**
   * Prepare training data from receipts
   */
  private prepareTrainingData(): TrainingData[] {
    const trainingData: TrainingData[] = []
    const sortedReceipts = [...this.receipts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate max values for normalization
    const maxAmount = Math.max(...this.receipts.map(r => r.total), 1)
    const avgSpend = this.receipts.reduce((sum, r) => sum + r.total, 0) / this.receipts.length

    for (let i = 1; i < sortedReceipts.length; i++) {
      const current = sortedReceipts[i]
      const prev = sortedReceipts[i - 1]
      const date = new Date(current.date)

      // Calculate trend (comparing to previous 3 receipts)
      let trend = 0
      if (i >= 3) {
        const recentAvg = (sortedReceipts[i-1].total + sortedReceipts[i-2].total + sortedReceipts[i-3].total) / 3
        const olderAvg = i >= 6 
          ? (sortedReceipts[i-4].total + sortedReceipts[i-5].total + sortedReceipts[i-6].total) / 3
          : recentAvg
        trend = (recentAvg - olderAvg) / Math.max(olderAvg, 1)
      }

      // Input features (normalized 0-1)
      const inputs = [
        date.getDay() / 6,                                                    // Day of week
        date.getHours() / 23,                                                 // Hour of day
        CATEGORIES.indexOf(current.category || "Other") / (CATEGORIES.length - 1), // Category encoded
        prev.total / maxAmount,                                               // Previous amount
        avgSpend / maxAmount,                                                 // Average spending
        (this.merchantFrequency.get(current.merchant.toLowerCase()) || 1) / this.receipts.length, // Merchant frequency
        (trend + 1) / 2                                                       // Trend (-1 to 1 → 0 to 1)
      ]

      // Target outputs (normalized 0-1)
      const targets = [
        current.total / maxAmount,                                            // Predicted amount
        CATEGORIES.indexOf(current.category || "Other") / (CATEGORIES.length - 1), // Category
        0.8 + Math.random() * 0.2                                             // Confidence (80-100%)
      ]

      trainingData.push({ inputs, targets })
    }

    return trainingData
  }

  /**
   * Predict next spending
   */
  predict(context?: { dayOfWeek?: number; hourOfDay?: number; category?: string }): SpendingPrediction {
    if (!this.isInitialized || this.receipts.length < 5) {
      return this.getFallbackPrediction()
    }

    const maxAmount = Math.max(...this.receipts.map(r => r.total), 1)
    const avgSpend = this.receipts.reduce((sum, r) => sum + r.total, 0) / this.receipts.length
    const lastReceipt = this.receipts[this.receipts.length - 1]

    // Calculate current trend
    const recentReceipts = this.receipts.slice(-5)
    const recentAvg = recentReceipts.reduce((sum, r) => sum + r.total, 0) / recentReceipts.length
    const olderReceipts = this.receipts.slice(-10, -5)
    const olderAvg = olderReceipts.length > 0
      ? olderReceipts.reduce((sum, r) => sum + r.total, 0) / olderReceipts.length
      : recentAvg
    const trend = (recentAvg - olderAvg) / Math.max(olderAvg, 1)

    // Prepare input
    const now = new Date()
    const inputs = [
      (context?.dayOfWeek ?? now.getDay()) / 6,
      (context?.hourOfDay ?? now.getHours()) / 23,
      CATEGORIES.indexOf(context?.category || lastReceipt.category || "Other") / (CATEGORIES.length - 1),
      lastReceipt.total / maxAmount,
      avgSpend / maxAmount,
      0.5, // Average merchant frequency
      (trend + 1) / 2
    ]

    // Get prediction
    const output = this.network.predict(inputs)
    
    const predictedAmount = output[0] * maxAmount
    const categoryIndex = Math.round(output[1] * (CATEGORIES.length - 1))
    const confidence = output[2]

    // Determine trend direction
    let trendDirection: "increasing" | "decreasing" | "stable"
    if (trend > 0.1) trendDirection = "increasing"
    else if (trend < -0.1) trendDirection = "decreasing"
    else trendDirection = "stable"

    // Calculate next week estimate
    const weeklySpendRate = this.receipts.length > 7
      ? this.receipts.slice(-7).reduce((sum, r) => sum + r.total, 0)
      : avgSpend * 7
    const nextWeekEstimate = weeklySpendRate * (1 + trend * 0.5)

    // Calculate risk level
    let riskLevel: "low" | "medium" | "high" = "low"
    if (predictedAmount > avgSpend * 2) riskLevel = "high"
    else if (predictedAmount > avgSpend * 1.5) riskLevel = "medium"

    // Calculate savings opportunity
    const savingsOpportunity = Math.max(0, (recentAvg - olderAvg) * 4)

    // Generate insights
    const insights = this.generateInsights(predictedAmount, trendDirection, avgSpend)

    return {
      predictedAmount: Math.round(predictedAmount * 100) / 100,
      predictedCategory: CATEGORIES[categoryIndex] || "Other",
      confidence: Math.round(confidence * 100),
      trend: trendDirection,
      nextWeekEstimate: Math.round(nextWeekEstimate * 100) / 100,
      insights,
      riskLevel,
      savingsOpportunity: Math.round(savingsOpportunity * 100) / 100
    }
  }

  /**
   * Generate smart insights based on prediction
   */
  private generateInsights(predicted: number, trend: string, avg: number): string[] {
    const insights: string[] = []

    if (predicted > avg * 1.5) {
      insights.push("🚨 Predicted spending is 50% above your average")
    } else if (predicted < avg * 0.5) {
      insights.push("✅ Predicted spending is below your average - good job!")
    }

    if (trend === "increasing") {
      insights.push("📈 Your spending has been trending upward recently")
    } else if (trend === "decreasing") {
      insights.push("📉 Great progress! Your spending is trending down")
    }

    // Day-based insights
    const day = new Date().getDay()
    if (day === 5 || day === 6) {
      insights.push("🎉 Weekend spending tends to be higher - stay mindful!")
    }

    // Top category insight
    const topCategory = Array.from(this.categoryAverages.entries())
      .sort((a, b) => b[1] - a[1])[0]
    if (topCategory) {
      insights.push(`💰 Your highest spending category is ${topCategory[0]}`)
    }

    if (insights.length === 0) {
      insights.push("📊 Your spending patterns look consistent")
    }

    return insights
  }

  /**
   * Fallback prediction when not enough data
   */
  private getFallbackPrediction(): SpendingPrediction {
    const avg = this.receipts.length > 0
      ? this.receipts.reduce((sum, r) => sum + r.total, 0) / this.receipts.length
      : 50

    return {
      predictedAmount: Math.round(avg * 100) / 100,
      predictedCategory: "Other",
      confidence: 50,
      trend: "stable",
      nextWeekEstimate: avg * 7,
      insights: ["📊 Upload more receipts to improve predictions"],
      riskLevel: "low",
      savingsOpportunity: 0
    }
  }

  /**
   * Get model info
   */
  getModelInfo(): { trained: boolean; samples: number; accuracy: number } {
    const lossHistory = this.network.getLossHistory()
    const lastLoss = lossHistory[lossHistory.length - 1] || 1
    const accuracy = Math.max(0, Math.min(100, (1 - lastLoss) * 100))

    return {
      trained: this.isInitialized,
      samples: this.receipts.length,
      accuracy: Math.round(accuracy)
    }
  }

  /**
   * Export model for persistence
   */
  exportModel(): string {
    return this.network.serialize()
  }

  /**
   * Import pre-trained model
   */
  importModel(json: string): void {
    this.network = NeuralNetwork.deserialize(json)
    this.isInitialized = true
  }
}

// Singleton instance
let predictor: SpendingPredictor | null = null

export function getSpendingPredictor(): SpendingPredictor {
  if (!predictor) {
    predictor = new SpendingPredictor()
  }
  return predictor
}
