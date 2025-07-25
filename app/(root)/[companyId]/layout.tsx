import { cookies } from "next/headers"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Footer } from "@/components/layout/footer"
import { HeaderUserInfo } from "@/components/layout/header-userinfo"
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
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-col">
        <header className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2 border-b">
          <div className="flex h-14 w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1.5" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <NavHeader />
            <div className="ml-auto flex items-center gap-2">
              <SearchForm className="w-fullsm:w-auto" />
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
        <main className="flex-1">{children}</main>
        <footer className="mt-auto">
          <Footer />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
