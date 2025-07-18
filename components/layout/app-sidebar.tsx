"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import {
  Anchor,
  ArrowLeftRight,
  Banknote,
  BarChart,
  Box,
  Building,
  ChartArea,
  ChevronRightIcon,
  ClipboardList,
  Coins,
  CreditCard,
  FileMinus,
  FilePlus,
  FileStack,
  FileText,
  FolderKanban,
  GalleryVerticalEnd,
  Globe,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  ListChecks,
  MapPin,
  PlusCircle,
  Receipt,
  Scale,
  Settings,
  Shield,
  Ship,
  Sliders,
  Undo2,
  User,
  Users,
  Wallet,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { CompanySwitcher } from "@/components/layout/company-switcher"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"

export const menuData = {
  mainNav: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    // {
    //   title: "Doc Expiry",
    //   url: "/doc-expiry",
    //   icon: FileText,
    // },
    // {
    //   title: "Chat",
    //   url: "/chat",
    //   icon: MessageCircle,
    // },
    // {
    //   title: "Todo",
    //   url: "/todo",
    //   icon: ClipboardList,
    // },
  ],
  masterNav: [
    {
      title: "Master",
      url: "/master",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "Account Group",
          url: "/master/account-group",
          icon: Landmark,
        },
        {
          title: "Account Setup",
          url: "/master/account-setup",
          icon: Settings,
        },
        { title: "Account Type", url: "/master/account-type", icon: FileText },
        { title: "Bank", url: "/master/bank", icon: Banknote },
        { title: "Barge", url: "/master/barge", icon: Ship },
        { title: "Category", url: "/master/category", icon: FolderKanban },
        {
          title: "Chart of Account & Category",
          url: "/master/chartofaccount",
          icon: ChartArea,
        },
        { title: "Country", url: "/master/country", icon: Globe },
        { title: "Task", url: "/master/task", icon: ListChecks },
        { title: "Charge", url: "/master/charge", icon: CreditCard },
        { title: "Credit Term", url: "/master/creditterm", icon: CreditCard },
        { title: "Currency", url: "/master/currency", icon: Coins },
        { title: "Customer", url: "/master/customer", icon: Users },
        { title: "Department", url: "/master/department", icon: Building },
        {
          title: "Designation",
          url: "/master/designation",
          icon: GraduationCap,
        },
        { title: "Employee", url: "/master/employee", icon: User },
        { title: "Gst", url: "/master/gst", icon: Receipt },
        { title: "Order Type", url: "/master/ordertype", icon: ClipboardList },
        {
          title: "Payment Type",
          url: "/master/payment-type",
          icon: Wallet,
        },
        { title: "Port", url: "/master/port", icon: Anchor },
        { title: "Port Region", url: "/master/portregion", icon: MapPin },
        { title: "Product", url: "/master/product", icon: Box },
        {
          title: "SubCategory",
          url: "/master/subcategory",
          icon: FolderKanban,
        },
        { title: "Supplier", url: "/master/supplier", icon: Building },
        {
          title: "Service Type",
          url: "/master/servicetype",
          icon: ClipboardList,
        },
        { title: "Tax", url: "/master/tax", icon: Receipt },
        { title: "Uom", url: "/master/uom", icon: Scale },
        { title: "Vessel", url: "/master/vessel", icon: Ship },
        { title: "Voyage", url: "/master/voyage", icon: ArrowLeftRight },
      ],
    },
  ],
  projectNav: [
    {
      title: "Project",
      url: "/project",
      icon: FolderKanban,
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
      icon: Receipt,
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
    // {
    //   title: "AP",
    //   url: "/ap",
    //   icon: CreditCard,
    //   items: [
    //     { title: "Invoice", url: "/ap/invoice", icon: Receipt },
    //     { title: "Debit Note", url: "/ap/debitnote", icon: FileMinus },
    //     { title: "Credit Note", url: "/ap/creditnote", icon: FilePlus },
    //     { title: "Payment", url: "/ap/payment", icon: MinusCircle },
    //     { title: "Refund", url: "/ap/refund", icon: Undo2 },
    //     { title: "Adjustment", url: "/ap/adjustment", icon: Sliders },
    //     { title: "Doc Setoff", url: "/ap/documentsetoff", icon: FileStack },
    //     { title: "Reports", url: "/ap/reports", icon: BarChart },
    //   ],
    // },
    // {
    //   title: "CB",
    //   url: "/cb",
    //   icon: Banknote,
    //   items: [
    //     { title: "General Payment", url: "/cb/payment", icon: MinusCircle },
    //     { title: "General Receipt", url: "/cb/receipt", icon: PlusCircle },
    //     { title: "Batch Payment", url: "/cb/batch-payment", icon: FileStack },
    //     { title: "Bank Transfer", url: "/cb/transfer", icon: ArrowLeftRight },
    //     {
    //       title: "Bank Reconciliation",
    //       url: "/cb/reconciliation",
    //       icon: Scale,
    //     },
    //     { title: "Report", url: "/cb/reports", icon: BarChart },
    //   ],
    // },
    // {
    //   title: "GL",
    //   url: "/gl",
    //   icon: BookOpenText,
    //   items: [
    //     {
    //       title: "Journal Entry",
    //       url: "/gl/journal-entry",
    //       icon: BookOpen,
    //     },
    //     { title: "AR/AP Contra", url: "/gl/arap-contra", icon: ArrowLeftRight },
    //     { title: "Year-End Process", url: "/gl/year-end", icon: CalendarCheck },
    //     { title: "GL Period Close", url: "/gl/period-close", icon: Lock },
    //     { title: "Opening Balance", url: "/gl/opening-balance", icon: Scale },
    //     { title: "Report", url: "/gl/reports", icon: BarChart },
    //   ],
    // },
  ],
  // hrmsNav: [
  //   {
  //     title: "HRMS",
  //     url: "/hrms",
  //     icon: Users,
  //     items: [
  //       { title: "Dashboard", url: "/hrms/dashboard", icon: LayoutDashboard },
  //       { title: "Leave & Attendance", url: "/hrms/leav", icon: CalendarCheck },
  //       { title: "Employee", url: "/hrms/employee", icon: User },
  //       { title: "Loan", url: "/hrms/loans", icon: Wallet },
  //       { title: "Services", url: "/hrms/services", icon: ListChecks },
  //     ],
  //   },
  // ],
  // documentNav: [
  //   {
  //     title: "Documentation",
  //     url: "/docs",
  //     icon: BookOpen,
  //     items: [
  //       { title: "Introduction", url: "/docs/introduction", icon: FileText },
  //       { title: "Get Started", url: "/docs/get-started", icon: PlayCircle },
  //       { title: "Tutorials", url: "/docs/tutorials", icon: GraduationCap },
  //       { title: "Changelog", url: "/docs/changelog", icon: ListChecks },
  //     ],
  //   },
  // ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { currentCompany } = useAuthStore()
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [selectedMenu, setSelectedMenu] = React.useState<string | null>(null)
  const [selectedSubMenu, setSelectedSubMenu] = React.useState<string | null>(
    null
  )
  const [hoveredMenu, setHoveredMenu] = React.useState<string | null>(null)
  const [hoveredSubMenu, setHoveredSubMenu] = React.useState<string | null>(
    null
  )
  const pathname = usePathname()

  const platformNavs = React.useMemo(
    () => [
      menuData.masterNav[0],
      menuData.projectNav[0],
      ...menuData.accountNav,
      //data.hrmsNav[0],
      //data.documentNav[0],
    ],
    []
  )

  const getUrlWithCompanyId = React.useCallback(
    (url: string) => {
      if (!currentCompany?.companyId) return url
      if (url === "#") return url
      return `/${currentCompany.companyId}${url}`
    },
    [currentCompany?.companyId]
  )

  React.useEffect(() => {
    const currentPath = pathname
    for (const menu of menuData.mainNav) {
      if (currentPath === getUrlWithCompanyId(menu.url)) {
        setSelectedMenu(menu.title)
        setOpenMenu(null)
        setSelectedSubMenu(null)
        return
      }
    }
    for (const group of platformNavs) {
      for (const subItem of group.items || []) {
        if (currentPath === getUrlWithCompanyId(subItem.url)) {
          setSelectedMenu(group.title)
          setOpenMenu(group.title)
          setSelectedSubMenu(subItem.title)
          return
        }
      }
    }
  }, [pathname, getUrlWithCompanyId, platformNavs])

  const handleMenuClick = (menuTitle: string) => {
    setOpenMenu(openMenu === menuTitle ? null : menuTitle)
    setSelectedMenu(menuTitle)
    setSelectedSubMenu(null)
  }

  const handleSubMenuClick = (menuTitle: string, subMenuTitle: string) => {
    setSelectedMenu(menuTitle)
    setSelectedSubMenu(subMenuTitle)
  }

  const isMenuActive = (menuTitle: string) => {
    return selectedMenu === menuTitle || openMenu === menuTitle
  }

  const isSubMenuActive = (subMenuTitle: string) => {
    return selectedSubMenu === subMenuTitle
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {menuData.mainNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                onMouseEnter={() => setHoveredMenu(item.title)}
                onMouseLeave={() => setHoveredMenu(null)}
                className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                  isMenuActive(item.title) || hoveredMenu === item.title
                    ? "bg-primary/20 text-primary"
                    : ""
                }`}
              >
                <Link href={getUrlWithCompanyId(item.url)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroup>
          <SidebarMenu>
            {platformNavs.map((group) => (
              <Collapsible
                key={group.title}
                asChild
                open={openMenu === group.title}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={group.title}
                      onClick={() => handleMenuClick(group.title)}
                      onMouseEnter={() => setHoveredMenu(group.title)}
                      onMouseLeave={() => setHoveredMenu(null)}
                      className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                        isMenuActive(group.title) || hoveredMenu === group.title
                          ? "bg-primary/20 text-primary"
                          : ""
                      }`}
                    >
                      {group.icon && <group.icon />}
                      <span>{group.title}</span>
                      {group.items && (
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {group.items && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              onMouseEnter={() =>
                                setHoveredSubMenu(subItem.title)
                              }
                              onMouseLeave={() => setHoveredSubMenu(null)}
                              className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                                isSubMenuActive(subItem.title) ||
                                hoveredSubMenu === subItem.title
                                  ? "bg-primary/20 text-primary"
                                  : ""
                              }`}
                            >
                              <Link
                                href={getUrlWithCompanyId(subItem.url)}
                                onClick={() =>
                                  handleSubMenuClick(group.title, subItem.title)
                                }
                              >
                                {subItem.icon && (
                                  <subItem.icon className="h-4 w-4" />
                                )}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <div className="mt-4 border-t pt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onMouseEnter={() => setHoveredMenu("Admin")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                    pathname === getUrlWithCompanyId("/admin") ||
                    hoveredMenu === "Admin"
                      ? "bg-primary/20 text-primary"
                      : ""
                  }`}
                >
                  <Link href={getUrlWithCompanyId("/admin")}>
                    <Shield />
                    <span>Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onMouseEnter={() => setHoveredMenu("SystemSettings")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                    pathname === getUrlWithCompanyId("/settings") ||
                    hoveredMenu === "SystemSettings"
                      ? "bg-primary/20 text-primary"
                      : ""
                  }`}
                >
                  <Link href={getUrlWithCompanyId("/settings")}>
                    <Settings />
                    <span>System Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/*
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onMouseEnter={() => setHoveredMenu("UserSettings")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors duration-200 ${
                    pathname === getUrlWithCompanyId("/settings") ||
                    hoveredMenu === "UserSettings"
                      ? "bg-primary/20 text-primary"
                      : ""
                  }`}
                >
                  <Link href={getUrlWithCompanyId("/settings")}>
                    <Settings />
                    <span>User Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               */}
            </SidebarMenu>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
