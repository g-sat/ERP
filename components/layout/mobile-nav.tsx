"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { AppSidebar } from "./app-sidebar"

interface MobileNavProps {
  className?: string
}

export function MobileNav({}: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close mobile nav when route changes
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="touch-target md:hidden"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle mobile navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-r p-0 sm:w-[320px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <AppSidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
