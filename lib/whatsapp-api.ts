import fs from "fs"
import axios from "axios"
import FormData from "form-data"

interface WhatsAppMessageData {
  messaging_product: string
  to: string
  type: string
  text?: {
    body: string
  }
  document?: {
    id: string
    caption?: string
    filename?: string
  }
}
export interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}
export class WhatsAppAPI {
  private accessToken: string
  private phoneNumberId: string
  private businessAccountId: string
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ""
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ""
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""
    if (!this.accessToken || !this.phoneNumberId || !this.businessAccountId) {
      console.warn("WhatsApp API credentials not fully configured")
    }
  }
  async sendTextMessage(
    phoneNumber: string,
    message: string
  ): Promise<WhatsAppResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("WhatsApp API not configured")
    }
    const data: WhatsAppMessageData = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: message,
      },
    }
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    return response.data
  }
  // Step 1: Upload PDF to WhatsApp Media API
  async uploadPDF(filePath: string): Promise<string> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("WhatsApp API not configured")
    }
    const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/media`
    const formData = new FormData()
    formData.append("file", fs.createReadStream(filePath))
    formData.append("type", "application/pdf")
    formData.append("messaging_product", "whatsapp")
    try {
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...formData.getHeaders(),
        },
      })
      return response.data.id // media_id
    } catch (error) {
      console.error("Upload PDF error:", error)
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data)
        console.error("Response status:", error.response?.status)
        console.error("Response headers:", error.response?.headers)
      }
      throw error
    }
  }
  // Step 2: Send PDF as WhatsApp Message using media_id
  async sendDocumentMessage(
    phoneNumber: string,
    mediaId: string,
    caption?: string,
    filename?: string
  ): Promise<WhatsAppResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("WhatsApp API not configured")
    }
    const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`
    const data: WhatsAppMessageData = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "document",
      document: {
        id: mediaId,
        caption: caption,
        filename: filename,
      },
    }
    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error("Send document message error:", error)
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data)
        console.error("Response status:", error.response?.status)
        console.error("Response headers:", error.response?.headers)
      }
      throw error
    }
  }
  // Combined method: Upload PDF and send message
  async sendPDFDocument(
    phoneNumber: string,
    filePath: string,
    caption?: string,
    filename?: string
  ): Promise<WhatsAppResponse> {
    // Step 1: Upload PDF to get media_id
    const mediaId = await this.uploadPDF(filePath)
    // Step 2: Send message with media_id
    return await this.sendDocumentMessage(
      phoneNumber,
      mediaId,
      caption,
      filename
    )
  }
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters (including +, spaces, dashes, etc.)
    let cleaned = phoneNumber.replace(/\D/g, "")
    // If number starts with 0, remove the leading 0
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1)
    }
    // WhatsApp API expects phone number without + symbol
    // Return the cleaned number as-is without adding any country code
    return cleaned
  }
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId && this.businessAccountId)
  }
}
export const whatsappAPI = new WhatsAppAPI()
