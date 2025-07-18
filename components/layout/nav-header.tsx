"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import {
  ArrowLeftRight,
  BarChart,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Coins,
  FileMinus,
  FilePlus,
  FileStack,
  Lock,
  MinusCircle,
  PlusCircle,
  Receipt,
  Scale,
  Sliders,
  Undo2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const data = {
  projectNav: [
    {
      title: "Project",
      url: "/project",
      items: [
        { title: "CheckList", url: "/project/checklist", icon: ClipboardList },
        { title: "Tariff", url: "/project/tariff", icon: Coins },
      ],
    },
  ],
  accountNav: [
    {
      title: "AR",
      url: "/ar",
      items: [
        { title: "Invoice", url: "/ar/invoice", icon: Receipt },
        { title: "Debit Note", url: "/ar/debitnote", icon: FileMinus },
        { title: "Credit Note", url: "/ar/creditnote", icon: FilePlus },
        { title: "Receipt", url: "/ar/receipt", icon: PlusCircle },
        { title: "Refund", url: "/ar/refund", icon: Undo2 },
        { title: "Adjustment", url: "/ar/adjustment", icon: Sliders },
        { title: "Doc Setoff", url: "/ar/documentsetoff", icon: FileStack },
        { title: "Reports", url: "/ar/reports", icon: BarChart },
      ],
    },
    {
      title: "AP",
      url: "/ap",
      items: [
        { title: "Invoice", url: "/ap/invoice", icon: Receipt },
        { title: "Debit Note", url: "/ap/debitnote", icon: FileMinus },
        { title: "Credit Note", url: "/ap/creditnote", icon: FilePlus },
        { title: "Payment", url: "/ap/payment", icon: MinusCircle },
        { title: "Refund", url: "/ap/refund", icon: Undo2 },
        { title: "Adjustment", url: "/ap/adjustment", icon: Sliders },
        { title: "Doc Setoff", url: "/ap/documentsetoff", icon: FileStack },
        { title: "Reports", url: "/ap/reports", icon: BarChart },
      ],
    },
    {
      title: "CB",
      url: "/cb",
      items: [
        { title: "General Payment", url: "/cb/payment", icon: MinusCircle },
        { title: "General Receipt", url: "/cb/receipt", icon: PlusCircle },
        { title: "Batch Payment", url: "/cb/batch-payment", icon: FileStack },
        { title: "Bank Transfer", url: "/cb/transfer", icon: ArrowLeftRight },
        {
          title: "Bank Reconciliation",
          url: "/cb/reconciliation",
          icon: Scale,
        },
        { title: "Report", url: "/cb/reports", icon: BarChart },
      ],
    },
    {
      title: "GL",
      url: "/gl",
      items: [
        {
          title: "Journal Entry",
          url: "/gl/journal-entry",
          icon: BookOpen,
        },
        { title: "AR/AP Contra", url: "/gl/arap-contra", icon: ArrowLeftRight },
        { title: "Year-End Process", url: "/gl/year-end", icon: CalendarCheck },
        { title: "GL Period Close", url: "/gl/period-close", icon: Lock },
        { title: "Opening Balance", url: "/gl/opening-balance", icon: Scale },
        { title: "Report", url: "/gl/reports", icon: BarChart },
      ],
    },
  ],
}

export function NavHeader() {
  const pathname = usePathname()
  const { currentCompany } = useAuthStore()

  // Function to add company ID to URL
  const getUrlWithCompanyId = (url: string) => {
    if (!currentCompany?.companyId) return url
    if (url === "#") return url
    return `/${currentCompany.companyId}${url}`
  }

  return (
    <NavigationMenu className="hidden sm:flex">
      <NavigationMenuList className="ga">
        {/* Top-level Navigation (Unchanged) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={getUrlWithCompanyId("/home")}
              className={cn(
                "text-sm leading-none font-medium",
                pathname === getUrlWithCompanyId("/home") && "text-primary"
              )}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Project Navigation */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              pathname.startsWith(getUrlWithCompanyId(data.projectNav[0].url))
                ? "text-primary"
                : ""
            }
          >
            Project
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] md:w-[400px] md:grid-cols-3 lg:w-[500px]">
              {data.projectNav[0].items.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={getUrlWithCompanyId(item.url)}
                      className={cn(
                        "hover:bg-primary/20 hover:text-primary rounded-md text-sm leading-none font-medium transition duration-300 ease-in-out",
                        pathname === getUrlWithCompanyId(item.url) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* AR Navigation */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              pathname.startsWith(getUrlWithCompanyId(data.accountNav[0].url))
                ? "text-primary"
                : ""
            }
          >
            AR
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] md:w-[400px] md:grid-cols-3 lg:w-[500px]">
              {data.accountNav[0].items.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={getUrlWithCompanyId(item.url)}
                      className={cn(
                        "hover:bg-primary/20 hover:text-primary rounded-md text-sm leading-none font-medium transition duration-300 ease-in-out",
                        pathname === getUrlWithCompanyId(item.url) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* AP Navigation */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              pathname.startsWith(getUrlWithCompanyId(data.accountNav[1].url))
                ? "text-primary"
                : ""
            }
          >
            AP
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] md:w-[400px] md:grid-cols-3 lg:w-[500px]">
              {data.accountNav[1].items.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={getUrlWithCompanyId(item.url)}
                      className={cn(
                        "hover:bg-primary/20 hover:text-primary rounded-md text-sm leading-none font-medium transition duration-300 ease-in-out",
                        pathname === getUrlWithCompanyId(item.url) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* CB Navigation */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              pathname.startsWith(getUrlWithCompanyId(data.accountNav[2].url))
                ? "text-primary"
                : ""
            }
          >
            CB
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] md:w-[400px] md:grid-cols-3 lg:w-[500px]">
              {data.accountNav[2].items.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={getUrlWithCompanyId(item.url)}
                      className={cn(
                        "hover:bg-primary/20 hover:text-primary rounded-md text-sm leading-none font-medium transition duration-300 ease-in-out",
                        pathname === getUrlWithCompanyId(item.url) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* GL Navigation */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              pathname.startsWith(getUrlWithCompanyId(data.accountNav[3].url))
                ? "text-primary"
                : ""
            }
          >
            GL
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] md:w-[400px] md:grid-cols-3 lg:w-[500px]">
              {data.accountNav[3].items.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={getUrlWithCompanyId(item.url)}
                      className={cn(
                        "hover:bg-primary/20 hover:text-primary rounded-md text-sm leading-none font-medium transition duration-300 ease-in-out",
                        pathname === getUrlWithCompanyId(item.url) &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
