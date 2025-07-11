"use client"

import { useEffect } from "react"
import {
  Manrope as FontManrope,
  Lexend as FontSans,
  Newsreader as FontSerif,
} from "next/font/google"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

import { cn } from "@/lib/utils"
import { LoginForm } from "@/components/login-form"

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })
const fontSerif = FontSerif({ subsets: ["latin"], variable: "--font-serif" })
const fontManrope = FontManrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export default function LoginPage() {
  const { isAuthenticated, logInStatusCheck } = useAuthStore()
  const router = useRouter()

  // Check if user is already logged in when the page loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      await logInStatusCheck()

      // If user is authenticated, redirect to company select page
      if (isAuthenticated) {
        router.push("/company-select")
      }
    }

    checkAuthStatus()
  }, [isAuthenticated, logInStatusCheck, router])

  return (
    <div
      className={cn(
        "bg-muted dark:bg-background flex flex-1 flex-col items-center justify-center gap-16 p-6 md:p-50",
        fontSans.variable,
        fontSerif.variable,
        fontManrope.variable
      )}
    >
      <div className="theme-login-one w-full max-w-sm md:max-w-3xl">
        <LoginForm imageUrl="https://images.unsplash.com/photo-1482872376051-5ce74ebf0908?q=80&w=3050&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </div>
    </div>
  )
}
