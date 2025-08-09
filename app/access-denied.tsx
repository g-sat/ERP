"use client"

import {
  Manrope as FontManrope,
  Lexend as FontSans,
  Newsreader as FontSerif,
} from "next/font/google"
import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })
const fontSerif = FontSerif({ subsets: ["latin"], variable: "--font-serif" })
const fontManrope = FontManrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export default function AccessDenied() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div
      className={cn(
        "bg-muted dark:bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center",
        fontSans.variable,
        fontSerif.variable,
        fontManrope.variable
      )}
    >
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <ShieldAlert className="text-destructive h-24 w-24" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Access Denied
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Sorry, you do not have permission to access this page.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button asChild>
            <Link href="/">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Login with a different account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
