import { Capacitor } from "@capacitor/core"
import { isTransactionSMS, parseTransactionSMS, getBankSenderIds } from "./transaction-parser"
import type { SMSTransaction } from "./transaction-parser"

export interface SMSMessage {
  id: string
  address: string // Phone number/Sender ID
  body: string
  date: number // Timestamp in milliseconds
}

export interface SMSPermissionStatus {
  granted: boolean
  canRequest: boolean
}

/**
 * SMS Manager for reading transaction messages
 * Works with Capacitor on Android (iOS doesn't allow SMS reading)
 */
export class SMSManager {
  /**
   * Check if app is running on native platform
   */
  static isNative(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
  }

  /**
   * Check if SMS permission is granted
   */
  static async checkPermission(): Promise<SMSPermissionStatus> {
    if (!this.isNative()) {
      return { granted: false, canRequest: false }
    }

    try {
      // Call custom plugin
      const result = await Capacitor.Plugins.SMSReader.checkPermission()
      return {
        granted: result.granted || false,
        canRequest: result.canRequest !== false,
      }
    } catch (error) {
      console.error("[SMS] Permission check failed:", error)
      return { granted: false, canRequest: true }
    }
  }

  /**
   * Request SMS permission from user
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isNative()) {
      console.warn("[SMS] Not running on native platform")
      return false
    }

    try {
      const result = await Capacitor.Plugins.SMSReader.requestPermission()
      return result.granted || false
    } catch (error) {
      console.error("[SMS] Permission request failed:", error)
      return false
    }
  }

  /**
   * Fetch SMS messages from inbox (HISTORICAL DATA!)
   * @param startDate - Start date for filtering (default: 6 months ago)
   * @param endDate - End date for filtering (default: now)
   * @param limit - Maximum number of messages (default: 1000)
   */
  static async fetchMessages(options?: {
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<SMSMessage[]> {
    if (!this.isNative()) {
      console.warn("[SMS] Not running on native platform")
      return []
    }

    const defaultStartDate = new Date()
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 6) // 6 months ago

    const startDate = options?.startDate || defaultStartDate
    const endDate = options?.endDate || new Date()
    const limit = options?.limit || 1000

    try {
      const result = await Capacitor.Plugins.SMSReader.readMessages({
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        limit,
      })

      return result.messages || []
    } catch (error) {
      console.error("[SMS] Fetch failed:", error)
      return []
    }
  }

  /**
   * Filter messages for transaction keywords
   */
  static filterTransactionMessages(messages: SMSMessage[]): SMSMessage[] {
    return messages.filter((msg) => isTransactionSMS(msg.body))
  }

  /**
   * Parse SMS messages into transactions
   */
  static parseMessages(messages: SMSMessage[]): SMSTransaction[] {
    const transactions: SMSTransaction[] = []

    for (const msg of messages) {
      const transaction = parseTransactionSMS(msg.body, new Date(msg.date))
      if (transaction) {
        transactions.push(transaction)
      }
    }

    return transactions
  }

  /**
   * Fetch and parse transaction messages in one go
   */
  static async fetchTransactions(options?: {
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<SMSTransaction[]> {
    const messages = await this.fetchMessages(options)
    const transactionMessages = this.filterTransactionMessages(messages)
    return this.parseMessages(transactionMessages)
  }

  /**
   * Get permission status and request if needed
   */
  static async ensurePermission(): Promise<boolean> {
    const status = await this.checkPermission()

    if (status.granted) {
      return true
    }

    if (status.canRequest) {
      return await this.requestPermission()
    }

    return false
  }
}
