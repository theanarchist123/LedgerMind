import { registerPlugin } from "@capacitor/core"

export interface SMSReaderPlugin {
  checkPermission(): Promise<{ granted: boolean; canRequest: boolean }>
  requestPermission(): Promise<{ granted: boolean }>
  readMessages(options: {
    startDate: number
    endDate: number
    limit: number
  }): Promise<{ messages: any[] }>
}

const SMSReader = registerPlugin<SMSReaderPlugin>("SMSReader")

export default SMSReader
