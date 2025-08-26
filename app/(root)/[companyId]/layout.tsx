import { cookies } from "next/headers"

import { SkipLink } from "@/components/ui/accessibility"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Footer } from "@/components/layout/footer"
import { HeaderUserInfo } from "@/components/layout/header-userinfo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeSwitcher } from "@/components/layout/mode-switcher"
import { NavHeader } from "@/components/layout/nav-header"
import { Notifications } from "@/components/layout/notifications"
import { ScreenLock } from "@/components/layout/screen-lock"
import { SearchForm } from "@/components/layout/search-form"
import { ThemeSelector } from "@/components/layout/theme-selector"

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
            className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2 border-b"
            role="banner"
          >
            <div className="flex h-14 w-full items-center gap-2 px-4">
              {/* Mobile Navigation */}
              <MobileNav />

              {/* Desktop Sidebar Trigger */}
              <SidebarTrigger className="-ml-1.5 hidden md:flex" />

              <Separator
                orientation="vertical"
                className="mr-2 hidden data-[orientation=vertical]:h-4 md:block"
              />

              <NavHeader />

              <div className="ml-auto flex items-center gap-2">
                <SearchForm className="hidden w-auto sm:flex" />
                <Notifications />
                <ThemeSelector />
                <ModeSwitcher />
                <ScreenLock />
                <HeaderUserInfo />

                {/*Why comments because of the useauthstore not a async component*/}
                {/* <NavUser
                user={{
                  name: "shadcn",
                  email: "m@example.com",
                  avatar: "/uploads/avatars/shadcn.jpg",
                }}
              /> */}
              </div>
            </div>
          </header>
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
          <footer className="mt-auto" role="contentinfo">
            <Footer />
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
