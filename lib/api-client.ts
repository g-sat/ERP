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

  // Log API request
  console.log("🚀 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: {
      "X-Company-Id": headers["X-Company-Id"],
      "Content-Type": headers["Content-Type"],
    },
    params: config.params,
    data: config.data,
  })

  return config
})

// Response interceptor - logs API responses
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error("❌ API Error:", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)
/**
 * Helper function to get company ID from client-side session
 * @returns Company ID from Zustand store or sessionStorage
 */
export const getCompanyIdFromSession: () => string | null = () => {
  // console.log("🔍 Getting company ID from session...")
  if (typeof window === "undefined") {
    // console.log("❌ Window is undefined (SSR)")
    return null
  }
  try {
    // Try to get from Zustand store first
    const state = useAuthStore.getState()
    // console.log("📊 Auth store state:", {
    //   currentCompany: state.currentCompany,
    //   isAuthenticated: state.isAuthenticated,
    // })

    if (state.currentCompany?.companyId) {
      const companyId = state.currentCompany.companyId.toString()
      // console.log("✅ Found company ID in Zustand store:", companyId)

      // Also check sessionStorage to see if there's a mismatch
      const sessionStorageCompanyId = sessionStorage.getItem("tab_company_id")
      if (sessionStorageCompanyId && sessionStorageCompanyId !== companyId) {
        console.warn(
          "⚠️ MISMATCH: Zustand has",
          companyId,
          "but sessionStorage has",
          sessionStorageCompanyId
        )
        // console.log("🔍 This might cause API calls to use wrong company ID!")
      }

      return companyId
    }
    // Fallback to sessionStorage for multi-tab support
    const tabCompanyId = sessionStorage.getItem("tab_company_id")
    // console.log("💾 Checking sessionStorage for tab_company_id:", tabCompanyId)

    if (tabCompanyId) {
      // console.log("✅ Found company ID in sessionStorage:", tabCompanyId)
      console.warn(
        "⚠️ Using sessionStorage fallback - Zustand store might not be updated yet"
      )
      // console.log("🔍 This could cause API calls to use old company ID!")
      return tabCompanyId
    }
    // console.log("❌ No company ID found in any source")
    return null
  } catch (error) {
    console.warn("❌ Error getting company ID from session:", error)
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
    console.log("📡 GET Request:", { endpoint: url, params })
    const response = await apiClient.get(url)
    console.log("✅ GET Response:", { endpoint: url, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ GET request failed:", { endpoint, params, error })
    throw error
  }
}
export const getById = async (endpoint: string) => {
  try {
    console.log("📡 GET by ID Request:", { endpoint })
    const response = await apiClient.get(endpoint)
    console.log("✅ GET by ID Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ GET by ID request failed:", { endpoint, error })
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
    console.log("📡 GET by Params Request:", { endpoint: url, params })
    const response = await apiClient.get(url)
    console.log("✅ GET by Params Response:", {
      endpoint: url,
      data: response.data,
    })
    return response.data
  } catch (error) {
    console.error("❌ GET by params request failed:", {
      endpoint,
      params,
      error,
    })
    throw error
  }
}

export const getByBody = async (
  endpoint: string,
  data: Record<string, unknown>
) => {
  try {
    console.log("📡 GET by Body Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data) // body = data
    console.log("✅ GET by Body Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ GET by Body request failed:", { endpoint, data, error })
    throw error
  }
}

export const saveData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    console.log("💾 POST (Save) Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data)
    console.log("✅ POST (Save) Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ POST (Save) request failed:", { endpoint, data, error })
    throw error
  }
}
// Alias for backward compatibility
export const postData = saveData
export const updateData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    console.log("🔄 PUT (Update) Request:", { endpoint, data })
    const response = await apiClient.put(endpoint, data)
    console.log("✅ PUT (Update) Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ PUT (Update) request failed:", { endpoint, data, error })
    throw error
  }
}
export const deleteData = async (endpoint: string) => {
  try {
    console.log("🗑️ DELETE Request:", { endpoint })
    const response = await apiClient.delete(endpoint)
    console.log("✅ DELETE Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ DELETE request failed:", { endpoint, error })
    throw error
  }
}

export const deleteDataWithRemarks = async (
  endpoint: string,
  documentId: string,
  documentNo: string,
  cancelRemarks: string
) => {
  try {
    const data = {
      DocumentId: documentId,
      DocumentNo: documentNo,
      CancelRemarks: cancelRemarks,
    }
    console.log("🗑️ DELETE with Remarks Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data)
    console.log("✅ DELETE with Remarks Response:", {
      endpoint,
      data: response.data,
    })
    return response.data
  } catch (error) {
    console.error("❌ DELETE with remarks request failed:", { endpoint, error })
    throw error
  }
}
export const patchData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    console.log("🔧 PATCH Request:", { endpoint, data })
    const response = await apiClient.patch(endpoint, data)
    console.log("✅ PATCH Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ PATCH request failed:", { endpoint, data, error })
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
    console.log("📤 File Upload Request:", {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      additionalData,
    })
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    console.log("✅ File Upload Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    console.error("❌ File upload failed:", {
      endpoint,
      fileName: file.name,
      error,
    })
    throw error
  }
}
// Export for backward compatibility
export const apiProxy = apiClient
export { apiClient }
export default apiClient
