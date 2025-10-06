/**
 * Enhanced Error Handling with Retry Logic
 *
 * This module provides comprehensive error handling with exponential backoff,
 * circuit breaker pattern, and intelligent retry mechanisms.
 */
export interface ErrorRecovery {
  retryCount: number
  lastError?: string
  errorHistory: Array<{ error: string; timestamp: number }>
}
export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}
/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
}
/**
 * Exponential backoff retry with jitter
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error
  for (let i = 0; i <= config.maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      // Don't retry on the last attempt
      if (i === config.maxRetries) {
        throw lastError
      }
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, i),
        config.maxDelay
      )
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay
      const finalDelay = delay + jitter
      await new Promise((resolve) => setTimeout(resolve, finalDelay))
    }
  }
  throw lastError!
}
/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED"
  private readonly failureThreshold = 5
  private readonly timeout = 60000 // 1 minute
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN"
      } else {
        throw new Error("Circuit breaker is OPEN - too many failures")
      }
    }
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  private onSuccess() {
    this.failures = 0
    this.state = "CLOSED"
  }
  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN"
    }
  }
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }
}
/**
 * Global circuit breaker instances for different services
 */
export const circuitBreakers = {
  auth: new CircuitBreaker(),
  api: new CircuitBreaker(),
  proxy: new CircuitBreaker(),
}
/**
 * Enhanced fetch with retry and circuit breaker
 */
export const enhancedFetch = async (
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> => {
  const service = url.includes("/auth/")
    ? "auth"
    : url.includes("/api/")
      ? "api"
      : "proxy"
  const breaker = circuitBreakers[service as keyof typeof circuitBreakers]
  return breaker.call(async () => {
    return retryWithBackoff(async () => {
      const response = await fetch(url, options)
      // Treat 5xx errors as retryable
      if (response.status >= 500) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        )
      }
      // Treat network errors as retryable
      if (!response.ok && response.status !== 401 && response.status !== 403) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
      }
      return response
    }, retryOptions)
  })
}
/**
 * Safe JSON parsing with error handling
 */
export const safeJsonParse = <T>(text: string, fallback: T): T => {
  try {
    if (!text || text.trim() === "") {
      console.warn("⚠️ [ErrorHandler] Empty response, using fallback")
      return fallback
    }
    return JSON.parse(text)
  } catch (error) {
    console.error("❌ [ErrorHandler] JSON parse error:", error)
    console.error(
      "Response text:",
      text.substring(0, 200) + (text.length > 200 ? "..." : "")
    )
    return fallback
  }
}
/**
 * Enhanced API response handler
 */
export const handleApiResponse = async <T>(
  response: Response,
  fallback: T
): Promise<T> => {
  try {
    const text = await response.text()
    if (!response.ok) {
      console.error(
        `❌ [ErrorHandler] API error: ${response.status} ${response.statusText}`
      )
      return fallback
    }
    return safeJsonParse(text, fallback)
  } catch (error) {
    console.error("❌ [ErrorHandler] Response handling error:", error)
    return fallback
  }
}
/**
 * Error classification for intelligent handling
 */
export const classifyError = (
  error: Error
): {
  isRetryable: boolean
  category: "network" | "auth" | "server" | "client" | "unknown"
  severity: "low" | "medium" | "high" | "critical"
} => {
  const message = error.message.toLowerCase()
  // Network errors - retryable
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return { isRetryable: true, category: "network", severity: "medium" }
  }
  // Server errors - retryable
  if (
    message.includes("server error") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503")
  ) {
    return { isRetryable: true, category: "server", severity: "high" }
  }
  // Auth errors - not retryable
  if (
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return { isRetryable: false, category: "auth", severity: "critical" }
  }
  // Client errors - not retryable
  if (
    message.includes("400") ||
    message.includes("404") ||
    message.includes("validation")
  ) {
    return { isRetryable: false, category: "client", severity: "medium" }
  }
  // Default classification
  return { isRetryable: false, category: "unknown", severity: "low" }
}
/**
 * Log error with context
 */
export const logError = (
  error: Error,
  context: string,
  metadata?: Record<string, unknown>
) => {
  const classification = classifyError(error)
  console.error(`❌ [${context}] ${error.message}`, {
    classification,
    metadata,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
  // Send to error tracking service if available
  if (
    typeof window !== "undefined" &&
    (window as unknown as { gtag?: unknown }).gtag
  ) {
    ;(
      window as unknown as {
        gtag: (
          action: string,
          target: string,
          data?: Record<string, unknown>
        ) => void
      }
    ).gtag("event", "exception", {
      description: error.message,
      fatal: classification.severity === "critical",
    })
  }
}
