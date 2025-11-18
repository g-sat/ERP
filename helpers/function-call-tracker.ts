/**
 * Function Call Tracker Utility
 * Use this to track which functions are called and which are skipped
 */

interface FunctionCall {
  functionName: string
  timestamp: number
  params?: unknown
  result?: unknown
  skipped?: boolean
  reason?: string
}

class FunctionCallTracker {
  private calls: FunctionCall[] = []
  private enabled: boolean = true

  /**
   * Enable or disable tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * Track a function call
   */
  track(
    functionName: string,
    params?: unknown,
    result?: unknown,
    skipped = false,
    reason?: string
  ) {
    if (!this.enabled) return

    this.calls.push({
      functionName,
      timestamp: Date.now(),
      params,
      result,
      skipped,
      reason,
    })

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const status = skipped ? "⏭️ SKIPPED" : "✅ CALLED"
      const reasonText = reason ? ` - ${reason}` : ""
      console.log(
        `[FunctionTracker] ${status}: ${functionName}${reasonText}`,
        params ? { params } : "",
        result ? { result } : ""
      )
    }
  }

  /**
   * Track a skipped function call
   */
  trackSkipped(functionName: string, reason: string, params?: unknown) {
    this.track(functionName, params, undefined, true, reason)
  }

  /**
   * Get all tracked calls
   */
  getCalls(): FunctionCall[] {
    return this.calls
  }

  /**
   * Get calls by function name
   */
  getCallsByName(functionName: string): FunctionCall[] {
    return this.calls.filter((call) => call.functionName === functionName)
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const total = this.calls.length
    const called = this.calls.filter((c) => !c.skipped).length
    const skipped = this.calls.filter((c) => c.skipped).length

    const byFunction = this.calls.reduce(
      (acc, call) => {
        if (!acc[call.functionName]) {
          acc[call.functionName] = { called: 0, skipped: 0 }
        }
        if (call.skipped) {
          acc[call.functionName].skipped++
        } else {
          acc[call.functionName].called++
        }
        return acc
      },
      {} as Record<string, { called: number; skipped: number }>
    )

    return {
      total,
      called,
      skipped,
      byFunction,
    }
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const summary = this.getSummary()
    console.group("📊 Function Call Summary")
    console.log(`Total: ${summary.total}`)
    console.log(`✅ Called: ${summary.called}`)
    console.log(`⏭️ Skipped: ${summary.skipped}`)
    console.group("By Function:")
    Object.entries(summary.byFunction).forEach(([name, stats]) => {
      console.log(`${name}: Called ${stats.called}x, Skipped ${stats.skipped}x`)
    })
    console.groupEnd()
    console.groupEnd()
  }

  /**
   * Clear all tracked calls
   */
  clear() {
    this.calls = []
  }

  /**
   * Export calls as JSON
   */
  export() {
    return JSON.stringify(
      {
        summary: this.getSummary(),
        calls: this.calls,
      },
      null,
      2
    )
  }
}

// Singleton instance
export const functionTracker = new FunctionCallTracker()

/**
 * Decorator/wrapper to automatically track function calls
 */
export function trackFunction<T extends (...args: unknown[]) => unknown>(
  functionName: string,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args)
      functionTracker.track(functionName, args, result, false)
      return result
    } catch (error) {
      functionTracker.track(functionName, args, error, false, "Error occurred")
      throw error
    }
  }) as T
}

/**
 * Track conditional execution
 */
export function trackConditional(
  functionName: string,
  condition: boolean,
  reason: string,
  params?: unknown
) {
  if (condition) {
    functionTracker.track(functionName, params, undefined, false)
  } else {
    functionTracker.trackSkipped(functionName, reason, params)
  }
  return condition
}
