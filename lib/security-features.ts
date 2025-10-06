/**
 * Enhanced Security Features
 *
 * This module provides advanced security features including device fingerprinting,
 * session validation, and security monitoring.
 */
export interface SecurityContext {
  sessionFingerprint: string
  deviceId: string
  lastActivity: number
  suspiciousActivity: boolean
  failedLoginAttempts: number
  securityLevel: "low" | "medium" | "high" | "critical"
}
export interface DeviceFingerprint {
  userAgent: string
  language: string
  timezone: string
  screen: string
  canvas: string
  webgl: string
  plugins: string[]
  fonts: string[]
  audio: string
  hardware: string
}
/**
 * Generate device fingerprint for security validation
 */
export const generateDeviceFingerprint =
  async (): Promise<DeviceFingerprint> => {
    const fingerprint: Partial<DeviceFingerprint> = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      plugins: Array.from(navigator.plugins).map((p) => p.name),
      fonts: await detectFonts(),
    }
    // Canvas fingerprint
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillText("Device fingerprint security check", 10, 10)
        fingerprint.canvas = canvas.toDataURL()
      }
    } catch (error) {
      console.warn("Canvas fingerprint failed:", error)
      fingerprint.canvas = "unavailable"
    }
    // WebGL fingerprint
    try {
      const canvas = document.createElement("canvas")
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      if (gl) {
        const webglGl = gl as WebGLRenderingContext
        const renderer = webglGl.getParameter(webglGl.RENDERER)
        const vendor = webglGl.getParameter(webglGl.VENDOR)
        fingerprint.webgl = `${vendor} - ${renderer}`
      }
    } catch (error) {
      console.warn("WebGL fingerprint failed:", error)
      fingerprint.webgl = "unavailable"
    }
    // Audio fingerprint
    try {
      fingerprint.audio = await generateAudioFingerprint()
    } catch (error) {
      console.warn("Audio fingerprint failed:", error)
      fingerprint.audio = "unavailable"
    }
    // Hardware fingerprint
    fingerprint.hardware = await generateHardwareFingerprint()
    return fingerprint as DeviceFingerprint
  }
/**
 * Generate unique device ID from fingerprint
 */
export const generateDeviceId = (fingerprint: DeviceFingerprint): string => {
  const data = [
    fingerprint.userAgent,
    fingerprint.screen,
    fingerprint.timezone,
    fingerprint.canvas,
    fingerprint.webgl,
  ].join("|")
  // Simple hash function
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
/**
 * Generate session fingerprint
 */
export const generateSessionFingerprint = (): string => {
  const sessionData = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
  ].join("|")
  return btoa(sessionData)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 16)
}
/**
 * Detect available fonts
 */
const detectFonts = async (): Promise<string[]> => {
  const baseFonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "Tahoma",
    "Calibri",
  ]
  const availableFonts: string[] = []
  // Create a test element
  const testElement = document.createElement("span")
  testElement.style.fontSize = "72px"
  testElement.style.position = "absolute"
  testElement.style.left = "-9999px"
  testElement.innerHTML = "abcdefghijklmnopqrstuvwxyz0123456789"
  // Get baseline measurements
  const baselineWidths: number[] = []
  const baselineHeight = 0
  for (const font of baseFonts) {
    testElement.style.fontFamily = font
    document.body.appendChild(testElement)
    const width = testElement.offsetWidth
    const height = testElement.offsetHeight
    // If width is different from baseline, font is available
    if (width !== baselineWidths[0] || height !== baselineHeight) {
      availableFonts.push(font)
    }
    baselineWidths.push(width)
    document.body.removeChild(testElement)
  }
  return availableFonts
}
/**
 * Generate audio fingerprint
 */
const generateAudioFingerprint = async (): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const gainNode = audioContext.createGain()
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
      oscillator.type = "triangle"
      oscillator.frequency.value = 10000
      gainNode.gain.value = 0
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gainNode)
      gainNode.connect(audioContext.destination)
      scriptProcessor.onaudioprocess = (event) => {
        const samples = event.inputBuffer.getChannelData(0)
        let fingerprint = ""
        for (let i = 0; i < samples.length; i += 100) {
          fingerprint += samples[i].toString().substring(0, 3)
        }
        audioContext.close()
        resolve(fingerprint.substring(0, 10))
      }
      oscillator.start(0)
      setTimeout(() => oscillator.stop(), 100)
    } catch (_error) {
      resolve("unavailable")
    }
  })
}
/**
 * Generate hardware fingerprint
 */
const generateHardwareFingerprint = async (): Promise<string> => {
  const hardwareInfo = [
    navigator.hardwareConcurrency || "unknown",
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ||
      "unknown",
    navigator.maxTouchPoints || "0",
    screen.availWidth,
    screen.availHeight,
    window.devicePixelRatio || 1,
  ].join("|")
  return btoa(hardwareInfo).substring(0, 20)
}
/**
 * Security monitoring and validation
 */
export class SecurityMonitor {
  private securityContext: SecurityContext
  private deviceFingerprint!: DeviceFingerprint
  private deviceId!: string
  private sessionFingerprint!: string
  constructor() {
    this.securityContext = {
      sessionFingerprint: "",
      deviceId: "",
      lastActivity: Date.now(),
      suspiciousActivity: false,
      failedLoginAttempts: 0,
      securityLevel: "medium",
    }
  }
  /**
   * Initialize security monitoring
   */
  async initialize(): Promise<void> {
    try {
      this.deviceFingerprint = await generateDeviceFingerprint()
      this.deviceId = generateDeviceId(this.deviceFingerprint)
      this.sessionFingerprint = generateSessionFingerprint()
      this.securityContext = {
        sessionFingerprint: this.sessionFingerprint,
        deviceId: this.deviceId,
        lastActivity: Date.now(),
        suspiciousActivity: false,
        failedLoginAttempts: 0,
        securityLevel: "medium",
      }
      this.startActivityMonitoring()
    } catch (error) {
      console.error("❌ [SecurityMonitor] Initialization failed:", error)
    }
  }
  /**
   * Validate session security
   */
  validateSession(): boolean {
    const now = Date.now()
    const timeSinceLastActivity = now - this.securityContext.lastActivity
    // Check for suspicious activity
    if (timeSinceLastActivity > 24 * 60 * 60 * 1000) {
      // 24 hours
      this.securityContext.suspiciousActivity = true
      this.securityContext.securityLevel = "high"
      console.warn(
        "⚠️ [SecurityMonitor] Suspicious activity detected: long inactivity"
      )
      return false
    }
    // Check for device changes (simplified)
    const currentSessionFingerprint = generateSessionFingerprint()
    if (currentSessionFingerprint !== this.sessionFingerprint) {
      this.securityContext.suspiciousActivity = true
      this.securityContext.securityLevel = "critical"
      console.warn("🚨 [SecurityMonitor] Device fingerprint mismatch detected")
      return false
    }
    this.updateActivity()
    return true
  }
  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.securityContext.lastActivity = Date.now()
  }
  /**
   * Record failed login attempt
   */
  recordFailedLogin(): void {
    this.securityContext.failedLoginAttempts++
    if (this.securityContext.failedLoginAttempts >= 5) {
      this.securityContext.securityLevel = "critical"
      this.securityContext.suspiciousActivity = true
      console.warn(
        "🚨 [SecurityMonitor] Multiple failed login attempts detected"
      )
    } else if (this.securityContext.failedLoginAttempts >= 3) {
      this.securityContext.securityLevel = "high"
      console.warn("⚠️ [SecurityMonitor] Failed login attempts detected")
    }
  }
  /**
   * Reset failed login attempts on successful login
   */
  resetFailedLogins(): void {
    this.securityContext.failedLoginAttempts = 0
    this.securityContext.suspiciousActivity = false
    this.securityContext.securityLevel = "medium"
    }
  /**
   * Start activity monitoring
   */
  private startActivityMonitoring(): void {
    // Monitor user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ]
    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity()
        },
        { passive: true }
      )
    })
    // Monitor for suspicious patterns
    setInterval(() => {
      this.checkForSuspiciousActivity()
    }, 60000) // Check every minute
  }
  /**
   * Check for suspicious activity patterns
   */
  private checkForSuspiciousActivity(): void {
    const now = Date.now()
    const timeSinceLastActivity = now - this.securityContext.lastActivity
    // Alert if no activity for 30 minutes (but still authenticated)
    if (
      timeSinceLastActivity > 30 * 60 * 1000 &&
      this.securityContext.sessionFingerprint
    ) {
      console.warn("⚠️ [SecurityMonitor] Long inactivity period detected")
    }
    // Check for rapid repeated actions (simplified)
    // In a real implementation, you'd track specific action patterns
  }
  /**
   * Get current security context
   */
  getSecurityContext(): SecurityContext {
    return { ...this.securityContext }
  }
  /**
   * Get device fingerprint
   */
  getDeviceFingerprint(): DeviceFingerprint {
    return { ...this.deviceFingerprint }
  }
  /**
   * Get device ID
   */
  getDeviceId(): string {
    return this.deviceId
  }
  /**
   * Check if current activity is suspicious
   */
  isSuspiciousActivity(): boolean {
    return this.securityContext.suspiciousActivity
  }
  /**
   * Get security level
   */
  getSecurityLevel(): "low" | "medium" | "high" | "critical" {
    return this.securityContext.securityLevel
  }
}
/**
 * Global security monitor instance
 */
export const securityMonitor = new SecurityMonitor()
/**
 * Security utilities
 */
export const securityUtils = {
  /**
   * Sanitize user input
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
  },
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  /**
   * Check password strength
   */
  checkPasswordStrength: (
    password: string
  ): {
    score: number
    feedback: string[]
  } => {
    const feedback: string[] = []
    let score = 0
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("Password should be at least 8 characters long")
    }
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Password should contain lowercase letters")
    }
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Password should contain uppercase letters")
    }
    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("Password should contain numbers")
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("Password should contain special characters")
    }
    return { score, feedback }
  },
  /**
   * Generate secure random string
   */
  generateSecureRandom: (length: number = 32): string => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.getRandomValues
    ) {
      const array = new Uint8Array(length)
      window.crypto.getRandomValues(array)
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
    }
    return result
  },
}
