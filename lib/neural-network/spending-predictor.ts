/**
 * Spending Predictor - Uses custom neural network to predict spending patterns
 * Trained on user's receipt history
 */

import { NeuralNetwork, TrainingData } from "./neural-network"

export interface Receipt {
  _id?: string
  merchant: string
  total: number
  totalINR?: number // INR-normalized amount (used for training if available)
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

    // Category averages (use INR-normalized amounts if available)
    const categoryTotals: Map<string, { sum: number; count: number }> = new Map()
    for (const receipt of this.receipts) {
      const category = receipt.category || "Other"
      const amount = receipt.totalINR ?? receipt.total // Prefer INR, fallback to original
      const existing = categoryTotals.get(category) || { sum: 0, count: 0 }
      categoryTotals.set(category, {
        sum: existing.sum + amount,
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

    // Use INR-normalized amounts for training
    const amounts = sortedReceipts.map(r => r.totalINR ?? r.total)
    const maxAmount = Math.max(...amounts, 1)
    const avgSpend = amounts.reduce((sum, a) => sum + a, 0) / amounts.length

    for (let i = 1; i < sortedReceipts.length; i++) {
      const current = sortedReceipts[i]
      const prev = sortedReceipts[i - 1]
      const date = new Date(current.date)
      
      const currAmount = current.totalINR ?? current.total
      const prevAmount = prev.totalINR ?? prev.total

      // Calculate trend (comparing to previous 3 receipts)
      let trend = 0
      if (i >= 3) {
        const recentAmounts = [amounts[i-1], amounts[i-2], amounts[i-3]]
        const recentAvg = recentAmounts.reduce((a, b) => a + b, 0) / 3
        const olderAvg = i >= 6 
          ? [amounts[i-4], amounts[i-5], amounts[i-6]].reduce((a, b) => a + b, 0) / 3
          : recentAvg
        trend = (recentAvg - olderAvg) / Math.max(olderAvg, 1)
      }

      // Input features (normalized 0-1)
      const inputs = [
        date.getDay() / 6,                                                    // Day of week
        date.getHours() / 23,                                                 // Hour of day
        CATEGORIES.indexOf(current.category || "Other") / (CATEGORIES.length - 1), // Category encoded
        prevAmount / maxAmount,                                               // Previous amount
        avgSpend / maxAmount,                                                 // Average spending
        (this.merchantFrequency.get(current.merchant.toLowerCase()) || 1) / this.receipts.length, // Merchant frequency
        (trend + 1) / 2                                                       // Trend (-1 to 1 → 0 to 1)
      ]

      // Target outputs (normalized 0-1)
      const targets = [
        currAmount / maxAmount,                                               // Predicted amount
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

    // Use INR-normalized amounts for prediction
    const amounts = this.receipts.map(r => r.totalINR ?? r.total)
    const maxAmount = Math.max(...amounts, 1)
    const avgSpend = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const lastReceipt = this.receipts[this.receipts.length - 1]
    const lastAmount = lastReceipt.totalINR ?? lastReceipt.total

    // Calculate current trend using INR amounts
    const recentAmounts = amounts.slice(-5)
    const recentAvg = recentAmounts.reduce((sum, a) => sum + a, 0) / recentAmounts.length
    const olderAmounts = amounts.slice(-10, -5)
    const olderAvg = olderAmounts.length > 0
      ? olderAmounts.reduce((sum, a) => sum + a, 0) / olderAmounts.length
      : recentAvg
    const trend = (recentAvg - olderAvg) / Math.max(olderAvg, 1)

    // Prepare input
    const now = new Date()
    const inputs = [
      (context?.dayOfWeek ?? now.getDay()) / 6,
      (context?.hourOfDay ?? now.getHours()) / 23,
      CATEGORIES.indexOf(context?.category || lastReceipt.category || "Other") / (CATEGORIES.length - 1),
      lastAmount / maxAmount,
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

    // Calculate next week estimate using INR amounts
    const weeklySpendRate = this.receipts.length > 7
      ? amounts.slice(-7).reduce((sum, a) => sum + a, 0)
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
    // Use INR-normalized amounts for fallback as well
    const amounts = this.receipts.map(r => r.totalINR ?? r.total)
    const avg = amounts.length > 0
      ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length
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
  getModelInfo(): { trained: boolean; dataPoints: number; accuracy: string } {
    const lossHistory = this.network.getLossHistory()
    const lastLoss = lossHistory[lossHistory.length - 1] || 1
    const accuracy = Math.max(0, Math.min(100, (1 - lastLoss) * 100))

    return {
      trained: this.isInitialized,
      dataPoints: this.receipts.length,
      accuracy: `${Math.round(accuracy)}%`
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
