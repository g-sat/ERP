"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { META_THEME_COLORS, useMetaColor } from "@/hooks/use-meta-color"
import { Button } from "@/components/ui/button"

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const { setMetaColor } = useMetaColor()

  // Update meta color when theme changes
  React.useEffect(() => {
    if (resolvedTheme) {
      setMetaColor(
        resolvedTheme === "dark"
          ? META_THEME_COLORS.dark
          : META_THEME_COLORS.light
      )
    }
  }, [resolvedTheme, setMetaColor])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="outline"
      size="icon"
      className="group/toggle size-8"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
