import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"

import { getAuthHeaders, removeSession } from "./auth-helpers"

export const apiProxy = axios.create({
  baseURL: "/api/proxy",
})

// Create a base axios instance with common configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Flag to avoid multiple refresh token requests
let isRefreshing = false
// Queue of requests to retry after token refresh
let refreshQueue: {
  resolve: (token: string) => void
  reject: (error: Error | AxiosError | null) => void
}[] = []

// Process the queue of pending requests
const processRefreshQueue = (
  token: string | null,
  error: Error | AxiosError | null = null
) => {
  refreshQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token)
    } else {
      promise.reject(error)
    }
  })

  // Clear queue
  refreshQueue = []
}

// Request interceptor - add auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Apply auth headers to all requests
    const headers = getAuthHeaders()
    if (config.headers) {
      Object.assign(config.headers, headers)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle 401 Unauthorized errors that indicate token expiry
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Mark request as already tried to refresh
      originalRequest._retry = true

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              // Update the authorization header
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(axios(originalRequest))
            },
            reject: (err) => {
              reject(err)
            },
          })
        })
      }

      // Start refreshing process
      isRefreshing = true

      try {
        // Attempt to refresh the token
        // // const newToken = await refreshToken()

        // // if (newToken) {
        // If refresh successful, update headers and retry original request
        if (originalRequest.headers) {
          // Update other headers from current storage in case they changed
          const updatedHeaders = getAuthHeaders()
          Object.assign(originalRequest.headers, {
            companyId: updatedHeaders.companyId,
            regId: updatedHeaders.regId,
            userId: updatedHeaders.userId,
          })
          originalRequest.headers.regId = updatedHeaders.regId
          originalRequest.headers.userId = updatedHeaders.userId
        }

        // Process pending requests
        // processRefreshQueue(newToken)

        // Reset refreshing flag
        isRefreshing = false

        // Return the retry of the original request
        return axios(originalRequest)
        // // } else {
        // //
        // //   // If refresh fails, clear session and reject with original error
        // //   removeSession()
        // //   processRefreshQueue(null, error)
        // //   isRefreshing = false

        // //   // Navigate to login (handle this in the app)
        // //   if (typeof window !== "undefined") {
        // //     window.location.href = "/login"
        // //   }

        // //   return Promise.reject(error)
        // // }
      } catch (refreshError) {
        // If refresh throws error, clear session and reject with original error
        removeSession()
        processRefreshQueue(null, refreshError as Error)
        isRefreshing = false

        return Promise.reject(error)
      }
    }

    // For other errors, just reject
    return Promise.reject(error)
  }
)

export default axiosInstance
