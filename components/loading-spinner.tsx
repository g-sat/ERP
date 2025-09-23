"use client"

import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  variant?: "default" | "minimal" | "card" | "overlay"
  showProgress?: boolean
  progress?: number
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  variant = "default",
  showProgress = false,
  progress = 0,
}: LoadingSpinnerProps) {
  const spinnerSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn("text-primary animate-spin", spinnerSize)} />
        {text && (
          <span className={cn("text-muted-foreground", textSize)}>{text}</span>
        )}
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "bg-card flex flex-col items-center justify-center rounded-lg border p-8",
          className
        )}
      >
        <div className="relative">
          <Loader2 className={cn("text-primary animate-spin", spinnerSize)} />
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary text-xs font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        {text && (
          <p className={cn("text-muted-foreground mt-3 text-center", textSize)}>
            {text}
          </p>
        )}
        {showProgress && (
          <div className="bg-muted mt-3 h-1 w-32 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          className
        )}
      >
        <div className="bg-card flex flex-col items-center gap-4 rounded-lg border p-6 shadow-lg">
          <div className="relative">
            <Loader2 className={cn("text-primary animate-spin", spinnerSize)} />
            {showProgress && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary text-xs font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
          {text && (
            <p className={cn("text-muted-foreground text-center", textSize)}>
              {text}
            </p>
          )}
          {showProgress && (
            <div className="bg-muted h-2 w-40 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <div className="relative mb-4">
        <Loader2 className={cn("text-primary animate-spin", spinnerSize)} />
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary text-xs font-medium">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {text && (
        <p className={cn("text-muted-foreground text-center", textSize)}>
          {text}
        </p>
      )}
      {showProgress && (
        <div className="bg-muted mt-3 h-1 w-32 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Specialized loading components for common use cases
export function FormLoadingSpinner({
  text = "Loading form data...",
}: {
  text?: string
}) {
  return (
    <LoadingSpinner
      variant="card"
      size="lg"
      text={text}
      className="min-h-[200px]"
    />
  )
}

export function TableLoadingSpinner({
  text = "Loading data...",
}: {
  text?: string
}) {
  return (
    <LoadingSpinner
      variant="card"
      size="md"
      text={text}
      className="min-h-[150px]"
    />
  )
}

export function PageLoadingSpinner({
  text = "Loading page...",
}: {
  text?: string
}) {
  return <LoadingSpinner variant="overlay" size="xl" text={text} />
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return <LoadingSpinner variant="minimal" size="sm" text={text} />
}
