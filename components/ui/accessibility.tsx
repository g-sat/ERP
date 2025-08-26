"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "focus:bg-background focus:text-foreground focus:border-border sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:px-4 focus:py-2",
        className
      )}
    >
      {children}
    </a>
  )
}

interface FocusTrapProps {
  children: React.ReactNode
  className?: string
}

export function FocusTrap({ children, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface LiveRegionProps {
  children: React.ReactNode
  className?: string
  "aria-live"?: "polite" | "assertive" | "off"
  "aria-atomic"?: boolean
}

export function LiveRegion({
  children,
  className,
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
}: LiveRegionProps) {
  return (
    <div
      className={cn("sr-only", className)}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
    >
      {children}
    </div>
  )
}

interface KeyboardShortcutProps {
  children: React.ReactNode
  shortcut: string
  className?: string
}

export function KeyboardShortcut({
  children,
  shortcut,
  className,
}: KeyboardShortcutProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {children}
      <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
        {shortcut}
      </kbd>
    </span>
  )
}

interface ScreenReaderTextProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderText({
  children,
  className,
}: ScreenReaderTextProps) {
  return <span className={cn("sr-only", className)}>{children}</span>
}

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap",
        className
      )}
    >
      {children}
    </span>
  )
}

interface AnnouncementProps {
  message: string
  priority?: "polite" | "assertive"
}

export function Announcement({
  message,
  priority = "polite",
}: AnnouncementProps) {
  const [announcements, setAnnouncements] = React.useState<string[]>([])

  React.useEffect(() => {
    if (message) {
      setAnnouncements((prev) => [...prev, message])
    }
  }, [message])

  return (
    <LiveRegion aria-live={priority} aria-atomic={true}>
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </LiveRegion>
  )
}

interface FocusIndicatorProps {
  children: React.ReactNode
  className?: string
}

export function FocusIndicator({ children, className }: FocusIndicatorProps) {
  return (
    <div
      className={cn(
        "focus-within:ring-ring focus-within:ring-offset-background focus-within:ring-2 focus-within:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}
