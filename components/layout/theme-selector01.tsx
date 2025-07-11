"use client"

import React from "react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useThemeConfig } from "@/components/layout/active-theme"

const SCALED_THEMES = [
  {
    name: "Default",
    value: "default-scaled",
  },
  {
    name: "Blue",
    value: "blue-scaled",
  },
  {
    name: "Green",
    value: "green-scaled",
  },
  {
    name: "Amber",
    value: "amber-scaled",
  },
  {
    name: "Mono",
    value: "mono-scaled",
  },
]

const NEXT_PUBLIC_DEFAULT_THEME = "default-scaled"

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  // Set default theme if none is selected
  React.useEffect(() => {
    if (!activeTheme) {
      setActiveTheme(NEXT_PUBLIC_DEFAULT_THEME)
    }
  }, [activeTheme, setActiveTheme])

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select
        value={activeTheme || NEXT_PUBLIC_DEFAULT_THEME}
        onValueChange={setActiveTheme}
      >
        <SelectTrigger
          id="theme-selector"
          size="sm"
          className="justify-start *:data-[slot=select-value]:w-12"
        >
          <span className="text-muted-foreground block sm:hidden">Theme</span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            <SelectLabel>Scaled</SelectLabel>
            {SCALED_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
