import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Analytics } from "@/components/layout/analytics"
import { CompanyProvider } from "@/components/layout/company-provider"
import { QueryProviders } from "@/components/layout/queryproviders"

import "./globals.css"

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

const siteConfig = {
  name: "AHHA ERP System",
  url: "https://ahha-erp.com",
  ogImage: "https://ahha-erp.com/og.jpg",
  description:
    "Comprehensive Enterprise Resource Planning system for shipping, logistics, and maritime operations. Streamline your business processes with integrated modules for accounting, project management, and document control.",
  links: {
    twitter: "https://twitter.com/ahha_erp",
    github: "https://github.com/ahha-erp",
  },
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "ERP",
    "Enterprise Resource Planning",
    "Shipping Management",
    "Logistics",
    "Maritime Operations",
    "Accounting",
    "Project Management",
    "Document Control",
    "Business Management",
    "Supply Chain",
  ],
  authors: [
    {
      name: "AHHA Technologies",
      url: "https://ahha-erp.com",
    },
  ],
  creator: "AHHA Technologies",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@ahha_erp",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const activeThemeValue = (await cookieStore).get("active_theme")?.value
  const isScaled = activeThemeValue?.endsWith("-scaled")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
          fontVariables,
          inter.className
        )}
      >
        <QueryProviders theme={activeThemeValue}>
          <CompanyProvider>
            {children}
            <Analytics />
          </CompanyProvider>
        </QueryProviders>
      </body>
    </html>
  )
}
