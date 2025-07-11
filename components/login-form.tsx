"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Login Form Component
 *
 * This component provides a user interface for authentication with the following features:
 * 1. Username and password input fields
 * 2. Form validation
 * 3. Error handling and display
 * 4. Loading state management
 * 5. Redirect after successful login
 * 6. Links to forgot password and registration
 */
export function LoginForm({
  className,
  imageUrl,
  ...props
}: React.ComponentProps<"div"> & {
  imageUrl?: string
}) {
  // State Management
  // ---------------
  const [userName, setUserName] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [message, setMessage] = useState("")
  const { logIn, isLoading } = useAuthStore()
  const router = useRouter()

  /**
   * Handles form submission
   * Flow:
   * 1. Prevent default form submission
   * 2. Call login API through auth store
   * 3. Handle response
   * 4. Redirect on success
   * 5. Display message on failure
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const loginResponse = await logIn(userName, userPassword)

      // If login is successful (no error), redirect to company selection page
      if (!useAuthStore.getState().error) {
        router.push("/company-select")
      }

      if (loginResponse.user.isLocked === true) {
        setMessage(loginResponse.message)
      }
    } catch (error) {
      // Error is handled by the auth store
      console.error("Login failed:", error)
    }
  }

  // Render
  // ------
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>

              {/* Status Message */}
              {message && (
                <div className="text-center font-medium text-red-500">
                  {message}
                </div>
              )}

              {/* Username Field */}
              <div className="grid gap-3">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  tabIndex={1}
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="userPassword">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="userPassword"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                  tabIndex={2}
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
                tabIndex={3}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>

              {/* Registration Link */}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>

          {/* Background Image */}
          <div className="bg-primary/50 relative hidden md:block">
            {imageUrl && (
              <Image
                fill
                src={imageUrl}
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover"
                priority={true}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
