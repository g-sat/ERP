// components/LockSkeleton.tsx

import { ReactNode, forwardRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Props for the LockSkeleton component
 * @interface LockSkeletonProps
 */
interface LockSkeletonProps {
  /** When true, show the lock overlay */
  locked: boolean
  /** The content to be displayed underneath the lock overlay */
  children: ReactNode
  /** Custom message to display with the lock icon */
  message?: string
  /** Additional CSS classes for the main container */
  className?: string
  /** Size of the lock icon in pixels */
  iconSize?: number
  /** Additional CSS classes for the children container */
  childrenClassName?: string
}

/**
 * A component that displays a lock overlay on top of its children when locked.
 * Includes animations, theme support, and accessibility features.
 */
export const LockSkeleton = forwardRef<HTMLDivElement, LockSkeletonProps>(
  (
    {
      locked,
      children,
      message = "This section is locked",
      className,
      iconSize = 40,
      childrenClassName,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("relative", className)}>
        {/* Main content container with blur effect when locked */}
        <div
          className={cn(
            "transition-all duration-300",
            locked ? "pointer-events-none opacity-60 blur-[0.5px]" : "",
            childrenClassName
          )}
        >
          {children}
        </div>

        {/* AnimatePresence handles the mounting/unmounting animations */}
        <AnimatePresence>
          {locked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              {/* 
                Overlay background with gradient
                Set to 40% opacity for better content visibility
                Dark mode has slightly higher opacity for better contrast
              */}
              <div className="from-background/40 to-background/35 dark:from-background/45 dark:to-background/40 absolute inset-0 bg-gradient-to-b backdrop-blur-[2px]" />

              {/* 
                Skeleton shimmer effect
                Reduced opacity to complement the 40% background
                Animated gradient for subtle visual feedback
              */}
              <Skeleton className="via-muted/15 dark:via-muted/10 absolute inset-0 animate-pulse bg-gradient-to-r from-transparent to-transparent" />

              {/* 
                Main content container for lock icon and message
                Uses spring animation for natural movement
                Includes proper spacing and padding
              */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="relative z-10 flex flex-col items-center gap-3 px-6 py-4 text-center"
              >
                {/* 
                  Lock icon container with glow effect
                  Adjusted glow opacity to match new background
                  Includes accessibility attributes
                */}
                <div className="relative">
                  <div className="bg-destructive/20 dark:bg-destructive/25 absolute inset-0 animate-pulse rounded-full blur-xl" />
                  <Lock
                    aria-hidden="true"
                    className="text-destructive dark:text-destructive/90 relative drop-shadow-lg"
                    style={{ width: iconSize, height: iconSize }}
                  />
                </div>

                {/* 
                  Message container with improved typography
                  Uses theme-aware text colors
                  Includes proper spacing and hierarchy
                */}
                <div className="space-y-1.5">
                  <p className="text-foreground text-lg font-semibold">
                    {message}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please contact your administrator for access
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

LockSkeleton.displayName = "LockSkeleton"
