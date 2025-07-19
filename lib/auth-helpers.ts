import { useAuthStore } from "@/stores/auth-store"
import { JwtPayload, jwtDecode as decodeJwt } from "jwt-decode"

/**
 * Get port number from environment variables or use the default
 */
export function getPortNumber(): number {
  // Try to get port from environment
  const envPort = process.env.NEXT_PUBLIC_PORT

  if (envPort) {
    const parsedPort = parseInt(envPort, 10)
    if (!isNaN(parsedPort)) {
      return parsedPort
    }
  }

  // Default port for Next.js
  return 5149
}

/**
 * Decode a JWT token and return its payload
 */
export function jwtDecode(token: string): JwtPayload | null {
  try {
    return decodeJwt<JwtPayload>(token)
  } catch (error) {
    console.error("Failed to decode JWT token:", error)
    return null
  }
}

/**
 * Attempts to refresh the authentication token
 * @returns A new token if refresh was successful, null otherwise
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const state = useAuthStore.getState()

    if (!state.token) {
      return null
    }

    // Use the existing token to request a new one
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Token refresh failed")
    }

    // Update the auth store with the new token
    if (data.token) {
      useAuthStore
        .getState()
        .logInSuccess(data.user, data.token, data.refreshToken)
      return data.token
    }

    return null
  } catch (error) {
    console.error("Failed to refresh token:", error)
    return null
  }
}

/**
 * Removes the current session data from the auth store
 */
export const removeSession = () => {
  useAuthStore.getState().logOutSuccess()
}
