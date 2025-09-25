import { cookies } from "next/headers"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { HeaderUserInfo } from "@/components/layout/header-userinfo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeSwitcher } from "@/components/layout/mode-switcher"
import { NavHeader } from "@/components/layout/nav-header"
import { Notifications } from "@/components/layout/notifications"
import { ScreenLock } from "@/components/layout/screen-lock"
import { SearchForm } from "@/components/layout/search-form"
import { ThemeSelector } from "@/components/layout/theme-selector"
import { SkipLink } from "@/components/ui/accessibility"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar className="hidden md:block" />
        <SidebarInset className="flex min-h-screen flex-col">
          <header
            id="navigation"
            className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2 border-b shadow-sm"
            role="banner"
          >
            <div className="flex h-14 w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
              {/* Mobile Navigation */}
              <MobileNav />

              {/* Desktop Sidebar Trigger */}
              <SidebarTrigger className="-ml-1.5 hidden md:flex" />

              <Separator
                orientation="vertical"
                className="mr-2 hidden h-6 data-[orientation=vertical]:h-6 md:block"
              />

              <NavHeader />

              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <SearchForm className="hidden w-auto sm:flex lg:w-80" />
                <Notifications />
                <ThemeSelector />
                <ModeSwitcher />
                <ScreenLock />
                <HeaderUserInfo />
              </div>
            </div>
          </header>
          <main id="main-content" className="bg-muted/20 flex-1" role="main">
            <div className="min-h-full">{children}</div>
          </main>
          
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
