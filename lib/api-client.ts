import { useAuthStore } from "@/stores/auth-store"
import axios, { InternalAxiosRequestConfig } from "axios"

// Create Axios instance for proxy API
// SECURITY: Session-based company ID is passed via header
// All other secure headers (auth tokens, user IDs) are handled server-side
const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - adds session company ID header
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = config.headers || {}

  // Ensure Content-Type is set
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  // Add session-based company ID header
  const sessionCompanyId = getCompanyIdFromSession()
  if (sessionCompanyId) {
    headers["X-Company-Id"] = sessionCompanyId
  }

  config.headers = headers
  return config
})

/**
 * Helper function to get company ID from client-side session
 * @returns Company ID from Zustand store or sessionStorage
 */
export const getCompanyIdFromSession: () => string | null = () => {
  if (typeof window === "undefined") return null

  try {
    // Try to get from Zustand store first
    const state = useAuthStore.getState()
    if (state.currentCompany?.companyId) {
      return state.currentCompany.companyId.toString()
    }

    // Fallback to sessionStorage for multi-tab support
    const tabCompanyId = sessionStorage.getItem("tab_company_id")
    if (tabCompanyId) {
      return tabCompanyId
    }

    return null
  } catch (error) {
    console.warn("Error getting company ID from session:", error)
    return null
  }
}

/**
 * API Client Functions
 *
 * SECURITY MODEL:
 * - Session-based company ID passed as X-Company-Id header
 * - All other secure headers handled server-side
 * - Client only passes non-sensitive parameters
 */

export const getData = async (
  endpoint: string,
  params: Record<string, string> = {}
) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value)
      }
    })

    const url = queryParams.toString()
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint
    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error("GET request failed:", error)
    throw error
  }
}

export const getById = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint)
    return response.data
  } catch (error) {
    console.error("GET by ID request failed:", error)
    throw error
  }
}

export const getByParams = async (
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
) => {
  try {
    // For GET requests with parameters, we'll use query strings
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const url = queryParams.toString()
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint
    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error("GET by params request failed:", error)
    throw error
  }
}

export const saveData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    const response = await apiClient.post(endpoint, data)
    return response.data
  } catch (error) {
    console.error("POST request failed:", error)
    throw error
  }
}

export const updateData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    const response = await apiClient.put(endpoint, data)
    return response.data
  } catch (error) {
    console.error("PUT request failed:", error)
    throw error
  }
}

export const deleteData = async (endpoint: string) => {
  try {
    const response = await apiClient.delete(endpoint)
    return response.data
  } catch (error) {
    console.error("DELETE request failed:", error)
    throw error
  }
}

export const patchData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    const response = await apiClient.patch(endpoint, data)
    return response.data
  } catch (error) {
    console.error("PATCH request failed:", error)
    throw error
  }
}

export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("File upload failed:", error)
    throw error
  }
}

// Export for backward compatibility
export const apiProxy = apiClient
export { apiClient }
export default apiClient
