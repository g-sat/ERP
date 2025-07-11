"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUp, Clock, Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"

export function Footer({ className, ...props }: FooterProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>("")

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const formattedDateTime = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
      setCurrentDateTime(formattedDateTime.replace(/,/g, " ·"))
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer
      className={cn(
        "bg-background/95 border-t backdrop-blur-lg",
        "shadow-foreground/5 shadow-lg",
        className
      )}
      {...props}
    >
      <div className="@container flex flex-1 flex-col gap-2 p-2">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{currentDateTime}</span>
              <span className="sm:hidden">{currentDateTime.slice(0, 16)}</span>
            </div>

            <div className="text-muted-foreground hidden items-center gap-2 md:flex">
              <Mail className="h-4 w-4" />
              <Link
                href="mailto:support@company.com"
                className="hover:text-primary transition-colors"
              >
                support@company.com
              </Link>
            </div>
            {/* Copyright */}
            <div className="text-muted-foreground text-center text-xs">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-xs">v{APP_VERSION}</div>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Back to top</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
