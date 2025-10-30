import { AuthResponse, ICompany, IDecimal, IUser } from "@/interfaces/auth"
import Cookies from "js-cookie"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { getData } from "@/lib/api-client"
import { Admin, DecimalSetting } from "@/lib/api-routes"

import { usePermissionStore } from "./permission-store"

// Constants and Configuration
// -------------------------
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL
const ENABLE_COMPANY_SWITCHING =
  process.env.NEXT_PUBLIC_ENABLE_COMPANY_SWITCH === "true"
const DEFAULT_REGISTRATION_ID = process.env
  .NEXT_PUBLIC_DEFAULT_REGISTRATION_ID as string

// Storage Keys
// ------------
const AUTH_TOKEN_COOKIE_NAME = "auth-token"
const SESSION_STORAGE_TAB_COMPANY_ID_KEY = "tab_company_id"

// Helper Functions
// ---------------
/**
 * Gets the company ID specific to the current browser tab
 * Used for multi-tab support where each tab can have a different company selected
 */
const getCurrentTabCompanyIdFromSession = () => {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(SESSION_STORAGE_TAB_COMPANY_ID_KEY)
}

/**
 * Sets the company ID for the current browser tab
 * @param companyId - The company ID to set
 */
const setCurrentTabCompanyIdInSession = (companyId: string) => {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_STORAGE_TAB_COMPANY_ID_KEY, companyId)
}

/**
 * Clears the company ID for the current browser tab
 */
const clearCurrentTabCompanyIdFromSession = () => {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_STORAGE_TAB_COMPANY_ID_KEY)
}

// Caching Functions
// -----------------
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>()

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Extracts user ID from JWT token
 * @param token - The JWT token to parse
 * @returns The user ID from the token or a default value
 */
const extractUserIdFromJwtToken = (token: string): string => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.userId
  } catch (error) {
    console.error("Error parsing token:", error)
    return "33"
  }
}

/**
 * Gets default decimal settings as fallback
 * @returns Default decimal settings object
 */
const getDefaultDecimalSettings = () => ({
  amtDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_AMT_DEC || "2", 10),
  locAmtDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_LOC_AMT_DEC || "2", 10),
  ctyAmtDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CTY_AMT_DEC || "2", 10),
  priceDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PRICE_DEC || "2", 10),
  qtyDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_QTY_DEC || "2", 10),
  exhRateDec: parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXH_RATE_DEC || "2", 10),
  dateFormat: process.env.NEXT_PUBLIC_DEFAULT_DATE_FORMAT || "yyyy-MM-dd",
  longDateFormat:
    process.env.NEXT_PUBLIC_DEFAULT_LONG_DATE_FORMAT || "yyyy-MM-dd HH:mm:ss",
})

// Store Interface
// --------------
interface AuthState {
  // Authentication State
  isAuthenticated: boolean
  isAppLocked: boolean
  isLoading: boolean
  user: IUser | null
  token: string | null
  refreshToken: string | null
  error: string | null

  // Enhanced Security State
  tokenExpiresAt?: number
  tokenStoredAt?: number
  refreshInProgress: boolean
  lastRefreshAttempt?: number
  isOnline: boolean
  pendingActions: Array<() => Promise<void>>
  sessionAnalytics: {
    loginTime: number
    sessionDuration: number
    pageViews: number
    actionsPerformed: number
    errorsEncountered: number
    companySwitches: number
    tabCount: number
  }

  // Company State
  companies: ICompany[]
  currentCompany: ICompany | null
  isCompanySwitchEnabled: boolean

  // Decimal Settings
  decimals: IDecimal[]

  // Authentication Actions
  logIn: (userName: string, userPassword: string) => Promise<AuthResponse>

  applocklogIn: (
    userName: string,
    userPassword: string
  ) => Promise<AuthResponse>

  logInSuccess: (user: IUser, token: string, refreshToken: string) => void
  logInFailed: (error: string) => void
  logInStatusCheck: () => Promise<void>
  logInStatusSuccess: (user: IUser) => void
  logInStatusFailed: (showError?: boolean) => void
  logOut: () => Promise<void>
  logOutSuccess: () => void
  setAppLocked: (locked: boolean) => void

  // Enhanced Security Actions
  refreshTokenAutomatically: () => Promise<string | null>
  setupTokenRefresh: () => void
  validateTokenExpiration: (token: string) => boolean
  trackUserAction: (action: string, metadata?: Record<string, unknown>) => void
  setOnline: (isOnline: boolean) => void
  addPendingAction: (action: () => Promise<void>) => void
  processPendingActions: () => Promise<void>
  initializeAuth: () => void
  forceLogout: () => void

  // Company Actions
  getCompanies: () => Promise<void>
  setCompanies: (companies: ICompany[]) => void
  switchCompany: (
    companyId: string,
    fetchDecimals?: boolean
  ) => Promise<ICompany | undefined>

  // Decimal Actions
  getDecimals: () => Promise<void>
  setDecimals: (decimals: IDecimal[]) => void

  // Tab Company ID Actions
  getCurrentTabCompanyId: () => string | null
  setCurrentTabCompanyId: (companyId: string) => void
  clearCurrentTabCompanyId: () => void

  // Permission Actions
  getPermissions: (retryCount?: number) => Promise<void>

  // User Transactions Actions
  getUserTransactions: () => Promise<unknown[]>
}

// Store Implementation
// -------------------
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        isAuthenticated: false,
        isAppLocked: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
        companies: [],
        currentCompany: null,
        isCompanySwitchEnabled: ENABLE_COMPANY_SWITCHING,
        decimals: [],

        // Enhanced Security Initial State
        tokenExpiresAt: undefined,
        tokenStoredAt: undefined,
        refreshInProgress: false,
        lastRefreshAttempt: undefined,
        isOnline: true,
        pendingActions: [],
        sessionAnalytics: {
          loginTime: 0,
          sessionDuration: 0,
          pageViews: 0,
          actionsPerformed: 0,
          errorsEncountered: 0,
          companySwitches: 0,
          tabCount: 1,
        },

        // Authentication Actions
        setAppLocked: (locked: boolean) => {
          set({ isAppLocked: locked })
        },

        /**
         * Handles user login
         * Flow:
         * 1. Set loading state
         * 2. Make login API request
         * 3. Handle response
         * 4. Update store state
         * 5. Fetch companies if login successful
         * @returns Login response data including user info and tokens
         */
        logIn: async (userName: string, userPassword: string) => {
          set({ isLoading: true, error: null })

          try {
            const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Reg-Id": DEFAULT_REGISTRATION_ID,
              },
              body: JSON.stringify({ userName, userPassword }),
            })

            if (response.status === 401) {
              get().setAppLocked(true)
            }

            const data: AuthResponse = await response.json()

            if (!response.ok) {
              throw new Error(data.message || "Login failed")
            }

            if (data.result === 1) {
              get().logInSuccess(data.user, data.token, data.refreshToken)

              if (!get().isAppLocked) {
                await get().getCompanies()
              }
            } else {
              set({ isLoading: false })
            }

            return {
              result: data.result,
              message: data.message,
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
            }
          } catch (error) {
            set({ isLoading: false })
            get().logInFailed(
              error instanceof Error
                ? error.message
                : "An unknown error occurred"
            )
            throw error
          }
        },

        /**
         * Handles app lock login
         * Similar to regular login but with additional security checks
         * @returns Login response data including user info and tokens
         */
        applocklogIn: async (userName: string, userPassword: string) => {
          set({ isLoading: true, error: null })

          try {
            const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Reg-Id": DEFAULT_REGISTRATION_ID,
              },
              body: JSON.stringify({ userName, userPassword }),
            })

            if (response.status === 401) {
              get().setAppLocked(true)
            }

            const data: AuthResponse = await response.json()

            if (!response.ok) {
              throw new Error(data.message || "Login failed")
            }

            if (data.result !== 1) {
              get().setAppLocked(true)
              if (data.user.isLocked === true) {
                Cookies.remove(AUTH_TOKEN_COOKIE_NAME)
                Cookies.remove("auth-token")

                set({
                  isAuthenticated: false,
                  isAppLocked: false,
                  isLoading: false,
                  user: null,
                  token: null,
                  refreshToken: null,
                  error: data.message,
                })
              }
            } else {
              get().logInSuccess(data.user, data.token, data.refreshToken)
            }

            return {
              result: data.result,
              message: data.message,
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
            }
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        /**
         * Updates store state after successful login
         * Sets authentication state and stores tokens with enhanced security tracking
         */
        logInSuccess: (user: IUser, token: string, refreshToken: string) => {
          // Decode token to get expiration time
          let tokenExpiresAt: number | undefined
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]))
            tokenExpiresAt = decoded.exp ? decoded.exp * 1000 : undefined
          } catch (error) {
            console.warn("Could not decode token expiration:", error)
          }

          Cookies.set(AUTH_TOKEN_COOKIE_NAME, token, { expires: 7 })

          set({
            isAuthenticated: true,
            isAppLocked: false,
            isLoading: false,
            user,
            token,
            refreshToken,
            error: null,
            // Enhanced security tracking
            tokenExpiresAt,
            tokenStoredAt: Date.now(),
            refreshInProgress: false,
            sessionAnalytics: {
              loginTime: Date.now(),
              sessionDuration: 0,
              pageViews: 0,
              actionsPerformed: 0,
              errorsEncountered: 0,
              companySwitches: 0,
              tabCount: 1,
            },
          })

          // Setup automatic token refresh
          get().setupTokenRefresh()
        },

        /**
         * Updates store state after failed login
         * Clears authentication state and tokens
         */
        logInFailed: (error: string) => {
          Cookies.remove(AUTH_TOKEN_COOKIE_NAME)
          Cookies.remove("auth-token")

          set({
            isAuthenticated: false,
            isAppLocked: false,
            isLoading: false,
            user: null,
            token: null,
            refreshToken: null,
            error,
          })
        },

        /**
         * Checks login status
         * Validates if user has a valid token and is authenticated
         */
        logInStatusCheck: async () => {
          set({ isLoading: true })
          try {
            const token = get().token
            if (!token) {
              // No token found - this is normal for new users, don't show error
              get().logInStatusFailed(false)
              return
            }

            // If we have a token, validate it
            const isValid = get().validateTokenExpiration(token)
            if (!isValid) {
              // Token exists but is expired - show error
              get().logInStatusFailed(true)
              return
            }

            // Token is valid, user is authenticated
            set({ isLoading: false })
          } catch (_error) {
            // Other errors - show error
            get().logInStatusFailed(true)
          }
        },

        logInStatusSuccess: (user: IUser) => {
          set({
            isAuthenticated: true,
            isAppLocked: false,
            isLoading: false,
            user,
            error: null,
          })
        },

        logInStatusFailed: (showError = false) => {
          set({
            isAuthenticated: false,
            isAppLocked: false,
            isLoading: false,
            user: null,
            token: null,
            refreshToken: null,
            error: showError ? "Session expired or invalid" : null,
          })
        },

        /**
         * Handles user logout
         * Flow:
         * 1. Call logout API
         * 2. Clear local state
         * 3. Clear cookies
         */
        logOut: async () => {
          set({ isLoading: true })

          try {
            const token = get().token
            if (token) {
              await fetch(`${BACKEND_API_URL}/auth/revoke`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                },
                body: JSON.stringify({ refreshToken: get().refreshToken }),
              })
            }
            get().logOutSuccess()
          } catch {
            get().logOutSuccess()
          }
        },

        logOutSuccess: () => {
          Cookies.remove(AUTH_TOKEN_COOKIE_NAME)
          Cookies.remove("auth-token")
          get().clearCurrentTabCompanyId()

          // Clear both storages from localStorage
          localStorage.removeItem("auth-storage")
          localStorage.removeItem("permission-storage")

          set({
            isAuthenticated: false,
            isAppLocked: false,
            isLoading: false,
            user: null,
            token: null,
            refreshToken: null,
            error: null,
            companies: [],
            currentCompany: null,
            decimals: [],
          })
        },

        /**
         * Fetches companies for the current user
         * Flow:
         * 1. Check if company switching is enabled
         * 2. Make API request to get companies
         * 3. Handle response and update store
         * 4. Set default company if needed
         */
        getCompanies: async () => {
          const { token } = get()
          if (!token) return

          try {
            const response = await fetch(
              `${BACKEND_API_URL}${Admin.getCompanies}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                  "X-User-Id": extractUserIdFromJwtToken(token),
                },
              }
            )

            const data = await response.json()

            if (!response.ok) {
              throw new Error(`Failed to fetch companies: ${response.status}`)
            }

            const companiesdata = data.data || data || []
            if (companiesdata.length === 0) {
              throw new Error(
                "Unauthorized: No companies available for your account. Please contact your administrator for access."
              )
            }

            const companies = companiesdata.map((company: ICompany) => ({
              ...company,
              companyId: company.companyId.toString(),
            }))

            get().setCompanies(companies)

            if (!get().currentCompany && companies.length > 0) {
              await get().switchCompany(companies[0].companyId, false)
            }
          } catch {}
        },

        setCompanies: (companies: ICompany[]) => {
          set({ companies })
        },

        /**
         * Switches the current company with optimistic updates and parallel API calls
         * IMPROVED: Optimistic UI updates + Parallel API calls + Better error handling
         * Flow:
         * 1. Validate company ID
         * 2. Optimistic UI update (immediate)
         * 3. Parallel API calls (non-blocking)
         * 4. Graceful error recovery
         */
        switchCompany: async (companyId: string, fetchDecimals = true) => {
          const { companies, currentCompany } = get()

          try {
            if (!companyId) {
              throw new Error("Company ID is required")
            }

            if (currentCompany?.companyId === companyId) {
              return currentCompany
            }

            const company = companies.find(
              (c) => c.companyId.toString() === companyId
            )

            if (!company) {
              throw new Error(
                `Company with ID ${companyId} not found. Please select a valid company.`
              )
            }

            // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
            get().setCurrentTabCompanyId(companyId)
            set({ currentCompany: company })

            // PARALLEL API CALLS: Execute in background without blocking
            const apiPromises = [get().getPermissions()]

            if (fetchDecimals) {
              apiPromises.push(get().getDecimals())
            }

            // Add user transactions to background loading
            apiPromises.push(
              get()
                .getUserTransactions()
                .then(() => {})
            )

            // Execute all API calls in parallel, don't block the return
            Promise.allSettled(apiPromises).then((results) => {
              results.forEach((result, index) => {
                if (result.status === "rejected") {
                  console.warn(
                    `Background API call ${index} failed:`,
                    result.reason
                  )
                  // Don't crash the app - just log the error
                }
              })
            })

            // Return immediately for fast navigation
            return company
          } catch (error) {
            // Rollback optimistic update on validation error
            if (currentCompany) {
              set({ currentCompany })
            }
            throw new Error(
              error instanceof Error
                ? error.message
                : "Failed to switch company"
            )
          }
        },

        /**
         * Fetches user permissions for the current company
         * IMPROVED: Uses proxy route + retry mechanism + graceful error handling
         */
        getPermissions: async (retryCount = 0) => {
          const { currentCompany, user } = get()
          const MAX_RETRIES = 2

          if (!currentCompany || !user) return

          try {
            // Use proxy route for consistent error handling and security
            const response = await getData(Admin.getUserRights)

            // Handle different response structures
            const permissions = response?.data || response || []

            if (Array.isArray(permissions)) {
              usePermissionStore.getState().setPermissions(permissions)
            } else {
              console.warn("Permissions data is not an array:", permissions)
              usePermissionStore.getState().setPermissions([])
            }
          } catch (error) {
            console.error("Error fetching user permissions:", error)

            // Retry mechanism for network errors
            if (retryCount < MAX_RETRIES) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (retryCount + 1))
              ) // Exponential backoff
              return get().getPermissions(retryCount + 1)
            }

            // Graceful degradation - set empty permissions to prevent app crashes
            usePermissionStore.getState().setPermissions([])
          }
        },

        /**
         * Fetches decimal settings for the current company
         * IMPROVED: Better error handling with fallback defaults
         */
        getDecimals: async () => {
          const { currentCompany, user } = get()

          if (!currentCompany || !user) return

          try {
            const response = await getData(DecimalSetting.get)

            const data = response.data
            const decimaldata = data.data || data || []

            if (Array.isArray(decimaldata) && decimaldata.length > 0) {
              get().setDecimals(decimaldata)
            } else {
              // Use fallback defaults if no data received
              get().setDecimals([getDefaultDecimalSettings()])
            }
          } catch (error) {
            console.error("Error fetching decimal settings:", error)
            // Graceful fallback to default settings
            get().setDecimals([getDefaultDecimalSettings()])
          }
        },

        setDecimals: (decimals: IDecimal[]) => {
          set({ decimals })
        },

        /**
         * Fetches user transactions for the current company
         * IMPROVED: Caching + graceful error handling
         */
        getUserTransactions: async () => {
          const { currentCompany, user } = get()

          if (!currentCompany || !user) return []

          const cacheKey = `user_transactions_${currentCompany.companyId}_${user.userId}`

          // Check cache first
          const cached = getCachedData<unknown[]>(cacheKey)
          if (cached) {
            return cached
          }

          try {
            const response = await getData(Admin.getUserTransactionsAll)
            const data = response?.data || response || []

            if (Array.isArray(data)) {
              // Convert PascalCase to camelCase
              interface ApiTransactionResponse {
                moduleId: number
                moduleCode: string
                moduleName: string
                transactionId: number
                transactionCode: string
                transactionName: string
                transCategoryId: number
                transCategoryCode: string
                transCategoryName: string
                seqNo: number
                transCatSeqNo: number
                isRead: boolean
                isCreate: boolean
                isEdit: boolean
                isDelete: boolean
                isExport: boolean
                isPrint: boolean
                isPost: boolean
                isVisible: boolean
              }

              const convertedData = data.map(
                (item: ApiTransactionResponse) => ({
                  moduleId: item.moduleId,
                  moduleCode: item.moduleCode,
                  moduleName: item.moduleName,
                  transactionId: item.transactionId,
                  transactionCode: item.transactionCode,
                  transactionName: item.transactionName,
                  transCategoryId: item.transCategoryId,
                  transCategoryCode: item.transCategoryCode,
                  transCategoryName: item.transCategoryName,
                  seqNo: item.seqNo,
                  transCatSeqNo: item.transCatSeqNo,
                  isRead: item.isRead,
                  isCreate: item.isCreate,
                  isEdit: item.isEdit,
                  isDelete: item.isDelete,
                  isExport: item.isExport,
                  isPrint: item.isPrint,
                  isPost: item.isPost,
                  isVisible: item.isVisible,
                })
              )

              setCachedData(cacheKey, convertedData)
              return convertedData
            } else {
              console.warn("User transactions data is not an array:", data)
              return []
            }
          } catch (error) {
            console.error("Error fetching user transactions:", error)
            return []
          }
        },

        // Tab Company ID Actions
        getCurrentTabCompanyId: () => getCurrentTabCompanyIdFromSession(),
        setCurrentTabCompanyId: (companyId: string) =>
          setCurrentTabCompanyIdInSession(companyId),
        clearCurrentTabCompanyId: () => clearCurrentTabCompanyIdFromSession(),

        // Enhanced Security Actions
        /**
         * Validates if a token is expired
         */
        validateTokenExpiration: (token: string) => {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]))
            if (!decoded || !decoded.exp) return false

            const isExpired = Date.now() >= decoded.exp * 1000
            return !isExpired
          } catch (error) {
            console.error("Error validating token expiration:", error)
            return false
          }
        },

        /**
         * Sets up automatic token refresh
         */
        setupTokenRefresh: () => {
          const { tokenExpiresAt, refreshInProgress } = get()

          if (!tokenExpiresAt || refreshInProgress) return

          const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes before expiry
          const timeUntilExpiry = tokenExpiresAt - Date.now()
          const refreshTime = Math.max(
            timeUntilExpiry - TOKEN_REFRESH_BUFFER,
            60000
          )

          setTimeout(() => {
            get().refreshTokenAutomatically().catch(console.error)
          }, refreshTime)
        },

        /**
         * Automatically refreshes the token
         */
        refreshTokenAutomatically: async () => {
          const { token, refreshToken, refreshInProgress, lastRefreshAttempt } =
            get()

          if (!token || !refreshToken || refreshInProgress) {
            return null
          }

          // Prevent multiple simultaneous refresh attempts
          if (lastRefreshAttempt && Date.now() - lastRefreshAttempt < 30000) {
            return null
          }

          set({ refreshInProgress: true, lastRefreshAttempt: Date.now() })

          try {
            const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Reg-Id": DEFAULT_REGISTRATION_ID,
              },
              body: JSON.stringify({ refreshToken }),
            })

            const data: AuthResponse = await response.json()

            if (!response.ok) {
              throw new Error(data.message || "Token refresh failed")
            }

            if (data.token) {
              get().logInSuccess(
                data.user || get().user,
                data.token,
                data.refreshToken || refreshToken
              )
              return data.token
            }

            return null
          } catch (error) {
            console.error("❌ [AuthStore] Token refresh failed:", error)
            set({ refreshInProgress: false })
            return null
          }
        },

        /**
         * Tracks user actions for analytics
         */
        trackUserAction: (
          action: string,
          metadata?: Record<string, unknown>
        ) => {
          const analytics = get().sessionAnalytics
          analytics.actionsPerformed++

          // Send to analytics service if available
          if (
            typeof window !== "undefined" &&
            (window as unknown as { gtag?: unknown }).gtag
          ) {
            ;(
              window as unknown as {
                gtag: (
                  event: string,
                  action: string,
                  metadata?: Record<string, unknown>
                ) => void
              }
            ).gtag("event", action, metadata)
          }
        },

        /**
         * Sets online/offline state
         */
        setOnline: (isOnline: boolean) => {
          set({ isOnline })

          if (isOnline) {
            // Process pending actions when coming back online
            get().processPendingActions()
          }
        },

        /**
         * Adds action to pending queue when offline
         */
        addPendingAction: (action: () => Promise<void>) => {
          const { pendingActions, isOnline } = get()

          if (isOnline) {
            return action()
          } else {
            set({ pendingActions: [...pendingActions, action] })
          }
        },

        /**
         * Processes pending actions when back online
         */
        processPendingActions: async () => {
          const { pendingActions, isOnline } = get()

          if (!isOnline || pendingActions.length === 0) return

          set({ pendingActions: [] })

          for (const action of pendingActions) {
            try {
              await action()
            } catch (error) {
              console.error("Error processing pending action:", error)
            }
          }
        },

        /**
         * Initializes authentication state on app start
         */
        initializeAuth: () => {
          const { token, isAuthenticated } = get()

          if (isAuthenticated && token) {
            const isValid = get().validateTokenExpiration(token)

            if (!isValid) {
              get().logOutSuccess()
            } else {
              get().setupTokenRefresh()
            }
          }

          // Setup online/offline detection
          if (typeof window !== "undefined") {
            const handleOnline = () => get().setOnline(true)
            const handleOffline = () => get().setOnline(false)

            window.addEventListener("online", handleOnline)
            window.addEventListener("offline", handleOffline)

            // Set initial online state
            get().setOnline(navigator.onLine)
          }
        },

        /**
         * Forces logout and clears all authentication state
         * Useful for clearing stuck authentication states
         */
        forceLogout: () => {
          get().logOutSuccess()
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          isAppLocked: state.isAppLocked,
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
          companies: state.companies,
          // Enhanced security fields
          tokenExpiresAt: state.tokenExpiresAt,
          tokenStoredAt: state.tokenStoredAt,
          sessionAnalytics: state.sessionAnalytics,
        }),
      }
    )
  )
)
