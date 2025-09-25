"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface CurrencyIconProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

function CurrencyIcon({ className = "", size = "md" }: CurrencyIconProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  // CSS filter to invert colors for dark theme
  const filterClass =
    mounted && resolvedTheme === "dark" ? "invert brightness-0" : ""

  return (
    <img
      src="/currency/DirhamBlack.svg"
      alt="AED"
      className={`${sizeClasses[size]} ${filterClass} ${className}`}
      data-mounted={mounted}
    />
  )
}

interface CurrencyFormatterProps {
  amount: number
  size?: "sm" | "md" | "lg"
  className?: string
  showIcon?: boolean
}

export function CurrencyFormatter({
  amount,
  size = "md",
  className = "",
  showIcon = true,
}: CurrencyFormatterProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
  })
    .format(amount)
    .replace("AED", "")
    .trim()

  if (!showIcon) {
    return <span className={className}>{formattedAmount}</span>
  }

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <CurrencyIcon size={size} />
      {formattedAmount}
    </span>
  )
}
