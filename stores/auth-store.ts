import { ICompany, IDecimal, IUser } from "@/interfaces/auth"
import Cookies from "js-cookie"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { usePermissionStore } from "./permission-store"

// Constants and Configuration
// -------------------------
const API_URL = process.env.NEXT_PUBLIC_API_URL
const ENABLE_COMPANY_SWITCH =
  process.env.NEXT_PUBLIC_ENABLE_COMPANY_SWITCH === "true"
const DEFAULT_REGISTRATION_ID = process.env
  .NEXT_PUBLIC_DEFAULT_REGISTRATION_ID as string

// Storage Keys
// ------------
const AUTH_TOKEN_COOKIE = "auth-token"
const COMPANY_ID_COOKIE = "company_id"
const TAB_COMPANY_ID_KEY = "tab_company_id"

// Helper Functions
// ---------------
/**
 * Gets the company ID specific to the current browser tab
 * Used for multi-tab support where each tab can have a different company selected
 */
const getTabCompanyId = () => {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TAB_COMPANY_ID_KEY)
}

/**
 * Sets the company ID for the current browser tab
 * @param companyId - The company ID to set
 */
const setTabCompanyId = (companyId: string) => {
  if (typeof window === "undefined") return
  sessionStorage.setItem(TAB_COMPANY_ID_KEY, companyId)
}

/**
 * Clears the company ID for the current browser tab
 */
const clearTabCompanyId = () => {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(TAB_COMPANY_ID_KEY)
}

/**
 * Extracts user ID from JWT token
 * @param token - The JWT token to parse
 * @returns The user ID from the token or a default value
 */
const getUserIdFromToken = (token: string): string => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.userId
  } catch (error) {
    console.error("Error parsing token:", error)
    return "33"
  }
}

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

  // Company State
  companies: ICompany[]
  currentCompany: ICompany | null
  isCompanySwitchEnabled: boolean

  // Decimal Settings
  decimals: IDecimal[]

  // Authentication Actions
  logIn: (
    userName: string,
    userPassword: string
  ) => Promise<{
    result: number
    message: string
    user: IUser
    token: string
    refreshToken: string
  }>
  applocklogIn: (
    userName: string,
    userPassword: string
  ) => Promise<{
    result: number
    message: string
    user: IUser
    token: string
    refreshToken: string
  }>
  logInSuccess: (user: IUser, token: string, refreshToken: string) => void
  logInFailed: (error: string) => void
  logInStatusCheck: () => Promise<void>
  logInStatusSuccess: (user: IUser) => void
  logInStatusFailed: () => void
  logOut: () => Promise<void>
  logOutSuccess: () => void
  setAppLocked: (locked: boolean) => void

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
  getPermissions: () => Promise<void>
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
        isCompanySwitchEnabled: ENABLE_COMPANY_SWITCH,
        decimals: [],

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
            const response = await fetch(`${API_URL}/auth/login`, {
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

            const data = await response.json()

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
            const response = await fetch(`${API_URL}/auth/login`, {
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

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.message || "Login failed")
            }

            if (data.result !== 1) {
              get().setAppLocked(true)
              if (data.user.isLocked === true) {
                Cookies.remove(AUTH_TOKEN_COOKIE)
                Cookies.remove(COMPANY_ID_COOKIE)
                Cookies.remove("auth-token")
                Cookies.remove("selectedCompanyId")

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
         * Sets authentication state and stores tokens
         */
        logInSuccess: (user: IUser, token: string, refreshToken: string) => {
          Cookies.set(AUTH_TOKEN_COOKIE, token, { expires: 7 })

          set({
            isAuthenticated: true,
            isAppLocked: false,
            isLoading: false,
            user,
            token,
            refreshToken,
            error: null,
          })
        },

        /**
         * Updates store state after failed login
         * Clears authentication state and tokens
         */
        logInFailed: (error: string) => {
          Cookies.remove(AUTH_TOKEN_COOKIE)
          Cookies.remove(COMPANY_ID_COOKIE)
          Cookies.remove("auth-token")
          Cookies.remove("selectedCompanyId")

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
         * Currently disabled - can be implemented for session validation
         */
        logInStatusCheck: async () => {
          set({ isLoading: true })
          try {
            const token = get().token
            if (!token) {
              throw new Error("No token found")
            }
          } catch {
            get().logInStatusFailed()
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

        logInStatusFailed: () => {
          set({
            isAuthenticated: false,
            isAppLocked: false,
            isLoading: false,
            user: null,
            token: null,
            refreshToken: null,
            error: "Session expired or invalid",
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
              await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                },
              })
            }
            get().logOutSuccess()
          } catch {
            get().logOutSuccess()
          }
        },

        logOutSuccess: () => {
          Cookies.remove(AUTH_TOKEN_COOKIE)
          Cookies.remove(COMPANY_ID_COOKIE)
          Cookies.remove("auth-token")
          Cookies.remove("selectedCompanyId")
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
            const response = await fetch(`${API_URL}/admin/GetUserCompany`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                "X-User-Id": getUserIdFromToken(token),
              },
            })

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
         * Switches the current company
         * Flow:
         * 1. Validate company ID
         * 2. Find company in available companies
         * 3. Update store state
         * 4. Set cookies
         * 5. Fetch decimals if requested
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

            get().setCurrentTabCompanyId(companyId)
            set({ currentCompany: company })
            Cookies.set(COMPANY_ID_COOKIE, companyId, { expires: 1 })

            // Fetch permissions and decimals after switching company
            await get().getPermissions()
            if (fetchDecimals) {
              await get().getDecimals()
            }

            return company
          } catch (error) {
            throw new Error(
              error instanceof Error
                ? error.message
                : "Failed to switch company"
            )
          }
        },

        /**
         * Fetches user permissions for the current company
         */
        getPermissions: async () => {
          const { token, currentCompany, user } = get()

          if (!token || !currentCompany || !user) return

          try {
            const response = await fetch(
              `${API_URL}/admin/GetUserRightsbyUser`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                  "X-Company-Id": currentCompany.companyId,
                  "X-User-Id": user.userId,
                },
              }
            )

            // Defensive: check content-type before parsing
            const contentType = response.headers.get("content-type")
            let data
            if (!contentType || !contentType.includes("application/json")) {
              const text = await response.text()
              console.error("Expected JSON, got:", text)
              throw new Error("Server did not return JSON. Raw response: " + text)
            } else {
              try {
                data = await response.json()
              } catch (jsonError) {
                const text = await response.text()
                console.error("Error parsing JSON. Raw response:", text)
                throw new Error("Error parsing JSON: " + (jsonError instanceof Error ? jsonError.message : String(jsonError)) + ". Raw response: " + text)
              }
            }

            if (!response.ok) {
              throw new Error(`Failed to fetch permissions: ${response.status}`)
            }

            if (data.result === 1 && data.data) {
              usePermissionStore.getState().setPermissions(data.data)
            }
          } catch (error) {
            console.error("Error fetching user permissions:", error)
          }
        },

        /**
         * Fetches decimal settings for the current company
         */
        getDecimals: async () => {
          const { token, currentCompany, user } = get()

          if (!token || !currentCompany || !user) return

          try {
            const response = await fetch(`${API_URL}/setting/getdecsetting`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Reg-Id": DEFAULT_REGISTRATION_ID,
                "X-Company-Id": currentCompany.companyId,
                "X-User-Id": user.userId,
              },
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(
                `Failed to fetch decimal settings: ${response.status}`
              )
            }

            const decimaldata = data.data || data || []
            get().setDecimals(decimaldata)
          } catch {
            get().setDecimals([
              {
                amtDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_AMT_DEC || "2",
                  10
                ),
                locAmtDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_LOC_AMT_DEC || "2",
                  10
                ),
                ctyAmtDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_CTY_AMT_DEC || "2",
                  10
                ),
                priceDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_PRICE_DEC || "2",
                  10
                ),
                qtyDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_QTY_DEC || "2",
                  10
                ),
                exhRateDec: parseInt(
                  process.env.NEXT_PUBLIC_DEFAULT_EXH_RATE_DEC || "2",
                  10
                ),
                dateFormat:
                  process.env.NEXT_PUBLIC_DEFAULT_DATE_FORMAT || "yyyy-MM-dd",
                longDateFormat:
                  process.env.NEXT_PUBLIC_DEFAULT_LONG_DATE_FORMAT ||
                  "yyyy-MM-dd HH:mm:ss",
              },
            ])
          }
        },

        setDecimals: (decimals: IDecimal[]) => {
          set({ decimals })
        },

        // Tab Company ID Actions
        getCurrentTabCompanyId: () => getTabCompanyId(),
        setCurrentTabCompanyId: (companyId: string) =>
          setTabCompanyId(companyId),
        clearCurrentTabCompanyId: () => clearTabCompanyId(),
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
        }),
      }
    )
  )
)
