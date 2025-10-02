"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import {
  AlertTriangle,
  Anchor,
  ArrowLeftRight,
  Banknote,
  BarChart,
  BookOpen,
  BookOpenText,
  Box,
  Briefcase,
  Building,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChartArea,
  ChevronRightIcon,
  CircleUserRound,
  ClipboardList,
  Clock,
  Coins,
  CreditCard,
  FileCheck,
  FileMinus,
  FilePlus,
  FileStack,
  FileText,
  FileX,
  FolderKanban,
  GalleryVerticalEnd,
  Globe,
  GraduationCap,
  Grid,
  HandCoins,
  History,
  Landmark,
  LayoutDashboard,
  ListCheck,
  Lock,
  MapPin,
  MinusCircle,
  PlusCircle,
  Receipt,
  Scale,
  Search,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  Ship,
  Sliders,
  Undo2,
  UserCheck,
  UserRoundPen,
  Users,
  Wallet,
} from "lucide-react"

// Removed unused imports
import { useApprovalCounts } from "@/hooks/use-approval"
import {
  Sidebar,
  SidebarContent,
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

// Interface for user transaction data
interface IUserTransaction {
  moduleId: number
  moduleCode: string
  moduleName: string
  transactionId: number
  transactionCode: string
  transactionName: string
  transCategoryId: number
  transCategoryCode: string
  transCategoryName: string
  seqNo: number
  transCatSeqNo: number
  isRead: boolean
  isCreate: boolean
  isEdit: boolean
  isDelete: boolean
  isExport: boolean
  isPrint: boolean
  isVisible: boolean
}

// Icon mapping for modules (main categories)
const getModuleIcon = (moduleCode: string) => {
  const moduleIconMap: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    // Main Modules
    master: GalleryVerticalEnd,
    operations: FolderKanban,
    hr: Users,
    ar: Receipt,
    ap: CreditCard,
    cb: Banknote,
    gl: BookOpenText,
    admin: Landmark,
    settings: Settings,
    requests: ClipboardList,
    approvals: FileCheck,
    document: FileText,
    dashboard: LayoutDashboard,
  }
  return moduleIconMap[moduleCode.toLowerCase()] || FolderKanban
}

// Icon mapping for transactions
const getTransactionIcon = (transactionCode: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Master Data
    accountgroup: Landmark,
    accountsetup: Sliders,
    accounttype: Landmark,
    bank: Banknote,
    barge: Ship,
    category: FolderKanban,
    chartofaccount: ChartArea,
    charge: Coins,
    country: Globe,
    creditterm: Calendar,
    currency: Coins,
    customer: Users,
    department: Building,
    designation: GraduationCap,
    documenttype: FileX,
    entitytypes: Building,
    gst: FileText,
    leavetype: CalendarDays,
    loantype: Wallet,
    ordertype: FileStack,
    paymenttype: Wallet,
    port: Anchor,
    portregion: MapPin,
    product: Box,
    servicetype: Briefcase,
    subcategory: FolderKanban,
    supplier: Building,
    task: FileCheck,
    tax: FileText,
    uom: Scale,
    vessel: Ship,
    voyage: ArrowLeftRight,
    worklocation: MapPin,

    // Operations
    new: ListCheck,
    checklist: ClipboardList,
    tariff: Coins,

    // HR
    employees: Users,
    loan: Wallet,
    leave: CalendarDays,
    attendance: Clock,
    payruns: Calendar,
    setting: Settings,
    hrreports: BarChart,

    // AR (Accounts Receivable)
    invoice: Receipt,
    debitnote: FileMinus,
    creditnote: FilePlus,
    receipt: Receipt,
    refund: Undo2,
    adjustment: Sliders,
    documentsetoff: FileStack,
    arreports: BarChart,

    // AP (Accounts Payable)
    payment: MinusCircle,
    batchpayment: FileStack,
    transfer: ArrowLeftRight,
    reconciliation: Scale,

    // CB (Cash Book)
    generalpayment: MinusCircle,
    generalreceipt: PlusCircle,
    banktransfer: ArrowLeftRight,

    // GL (General Ledger)
    journalentry: BookOpen,
    arapcontra: ArrowLeftRight,
    yearend: CalendarCheck,
    periodclose: Lock,
    openingbalance: Scale,

    // Admin
    users: Users,
    userroles: UserCheck,
    usergroup: Users,
    userrights: ShieldCheck,
    usergrouprights: Shield,
    sharedata: Share,
    profile: UserRoundPen,
    auditlog: History,
    errorlog: AlertTriangle,
    userlog: CircleUserRound,

    // Settings
    grid: Grid,
    document: FileText,
    decimal: Scale,
    finance: Wallet,
    lookup: Search,
    account: Briefcase,
    mandatory: FileMinus,
    visible: FilePlus,
  }

  return iconMap[transactionCode.toLowerCase()] || FileText
}

// Hook to fetch user transactions
const useUserTransactions = () => {
  const [transactions, setTransactions] = React.useState<IUserTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { currentCompany, user, getUserTransactions } = useAuthStore()

  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentCompany || !user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await getUserTransactions()

        console.log("Transactions data:", data)

        if (Array.isArray(data)) {
          setTransactions(data as IUserTransaction[])
        } else {
          console.warn("Transactions data is not an array:", data)
          setTransactions([])
        }
      } catch (err) {
        console.error("Error fetching user transactions:", err)
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions"
        )
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [currentCompany, user, getUserTransactions])

  return { transactions, isLoading, error }
}

// Function to build dynamic menu from transactions
interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permissions?: {
    read: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    print: boolean
  }
}

// Removed unused SettingNavItem interface

const buildDynamicMenu = (transactions: IUserTransaction[]) => {
  const menuMap = new Map<
    string,
    {
      title: string
      url: string
      icon: React.ComponentType<{ className?: string }>
      items: MenuItem[]
    }
  >()

  // Filter transactions by isVisible=true first
  const visibleTransactions = transactions.filter(
    (transaction) => transaction.isVisible === true
  )

  // Group visible transactions by module
  visibleTransactions.forEach((transaction) => {
    const moduleKey = `${transaction.moduleId}_${transaction.moduleName}`

    if (!menuMap.has(moduleKey)) {
      menuMap.set(moduleKey, {
        title: transaction.moduleName,
        url: `/${transaction.moduleCode.toLowerCase()}`,
        icon: getModuleIcon(transaction.moduleCode.toLowerCase()),
        items: [],
      })
    }

    const moduleData = menuMap.get(moduleKey)
    if (moduleData) {
      moduleData.items.push({
        title: transaction.transactionName,
        url: `/${transaction.moduleCode.toLowerCase()}/${transaction.transactionCode.toLowerCase()}`,
        icon: getTransactionIcon(transaction.transactionCode.toLowerCase()),
        permissions: {
          read: transaction.isRead,
          create: transaction.isCreate,
          edit: transaction.isEdit,
          delete: transaction.isDelete,
          export: transaction.isExport,
          print: transaction.isPrint,
        },
      })
    }
  })

  // Filter out modules that have no visible items
  const filteredMenu = Array.from(menuMap.values()).filter(
    (module) => module.items.length > 0
  )

  return filteredMenu
}

export const menuData = {
  mainNav: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Approvals",
      url: "/approvals",
      icon: FileCheck,
    },
    {
      title: "Document",
      url: "/document",
      icon: FileText,
    },
    {
      title: "Requests",
      url: "/requests",
      icon: ClipboardList,
      items: [
        { title: "Loan", url: "/requests/loan", icon: Wallet },
        { title: "Leave", url: "/requests/leave", icon: CalendarDays },
        {
          title: "Petty Cash",
          url: "/requests/pettycash",
          icon: HandCoins,
        },
      ],
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { currentCompany } = useAuthStore()
  const { pendingCount: approvalCount, refreshCounts } = useApprovalCounts()
  const { transactions, isLoading: transactionsLoading } = useUserTransactions()
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

  // Build dynamic menu from user transactions
  const dynamicMenu = React.useMemo(() => {
    return buildDynamicMenu(transactions)
  }, [transactions])

  // Removed unused platformNavs and settingNavs as we use dynamicMenu instead

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

    for (const group of dynamicMenu) {
      for (const subItem of group.items || []) {
        if (currentPath === getUrlWithCompanyId(subItem.url)) {
          setSelectedMenu(group.title)
          setOpenMenu(group.title)
          setSelectedSubMenu(subItem.title)
          return
        }
      }
    }
  }, [pathname, getUrlWithCompanyId, dynamicMenu])

  // Refresh approval counts when component mounts
  React.useEffect(() => {
    refreshCounts()
  }, [refreshCounts])

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
    <Sidebar collapsible="icon" className={props.className} {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-1">
          <div className="flex flex-col gap-0.5">
            {menuData.mainNav.map((item) => (
              <SidebarMenuItem key={item.url}>
                {item.items ? (
                  // Collapsible menu item with sub-items
                  <Collapsible
                    asChild
                    open={openMenu === item.title}
                    className="group/collapsible"
                  >
                    <div>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          onClick={() => handleMenuClick(item.title)}
                          onMouseEnter={() => setHoveredMenu(item.title)}
                          onMouseLeave={() => setHoveredMenu(null)}
                          className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary relative transition-colors duration-200 ${
                            isMenuActive(item.title) ||
                            hoveredMenu === item.title
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          <div className="relative">
                            {item.icon && <item.icon className="h-4 w-4" />}
                          </div>
                          <span>{item.title}</span>
                          {item.title === "Approvals" && approvalCount > 0 && (
                            <span className="ml-2 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm group-data-[collapsed=false]:block group-data-[collapsed=true]:hidden">
                              {approvalCount}
                            </span>
                          )}
                          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
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
                                    handleSubMenuClick(
                                      item.title,
                                      subItem.title
                                    )
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
                    </div>
                  </Collapsible>
                ) : (
                  // Simple menu item without sub-items (direct link)
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    onMouseEnter={() => setHoveredMenu(item.title)}
                    onMouseLeave={() => setHoveredMenu(null)}
                    className={`hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary relative transition-colors duration-200 ${
                      isMenuActive(item.title) || hoveredMenu === item.title
                        ? "bg-primary/20 text-primary"
                        : ""
                    }`}
                  >
                    <Link href={getUrlWithCompanyId(item.url)}>
                      <div className="relative">
                        {item.icon && <item.icon className="h-4 w-4" />}
                      </div>
                      <span>{item.title}</span>
                      {item.title === "Approvals" && approvalCount > 0 && (
                        <span className="ml-2 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm group-data-[collapsed=false]:block group-data-[collapsed=true]:hidden">
                          {approvalCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroup className="p-1">
          <SidebarMenu className="gap-0.5">
            {transactionsLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-muted-foreground text-sm">
                  Loading menu...
                </div>
              </div>
            ) : (
              dynamicMenu.map((group) => (
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
                          isMenuActive(group.title) ||
                          hoveredMenu === group.title
                            ? "bg-primary/20 text-primary"
                            : ""
                        }`}
                      >
                        {group.icon && <group.icon className="h-4 w-4" />}
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
                                    handleSubMenuClick(
                                      group.title,
                                      subItem.title
                                    )
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
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
