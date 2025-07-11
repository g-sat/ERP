import { useAuthStore } from "@/stores/auth-store"
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios"

// API Configuration
export const API_CONFIG = {
  baseUrl: "/api/proxy", // Use the proxy endpoint
  defaultRegistrationId:
    process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID || "Astar@123",
}

// Get secure headers for API requests
export const getSecureHeaders = () => {
  const state = useAuthStore.getState()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    RegId: API_CONFIG.defaultRegistrationId,
  }

  // Add authentication token if available
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`
  }

  // Add company ID if available
  if (state.currentCompany?.companyId) {
    headers.CompanyId = state.currentCompany.companyId
  }

  // Add user ID if available
  if (state.user?.userId) {
    headers.UserId = state.user.userId.toString()
  }

  return headers
}

// Create an axios instance with default configuration
export const createApiClient = () => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Add request interceptor to update headers before each request
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const headers = new AxiosHeaders(config.headers)
    Object.entries(getSecureHeaders()).forEach(([key, value]) => {
      headers.set(key, value)
    })
    config.headers = headers
    return config
  })

  return instance
}
