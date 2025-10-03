import { Metadata } from "next"
import {
  DownloadIcon,
  FilterIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AccountDashboard } from "./components/account-dashboard"
import { AnalyticsDatePicker } from "./components/analytics-date-picker"
import { BankDashboard } from "./components/bank-dashboard"
import { ChartRevenue } from "./components/chart-revenue"
import { ChartVisitors } from "./components/chart-visitors"
import { ChecklistDataProvider } from "./components/checklist-data-provider"
import { DataTable } from "./components/data-table"
import { PayableDashboard } from "./components/payable-dashboard"
import { ProductsTable } from "./components/products-table"
import { ReceivableDashboard } from "./components/receivable-dashboard"
import data from "./data.json"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An example dashboard to test the new components.",
}

// Load from database.
const products = [
  {
    id: "1",
    name: "BJÖRKSNÄS Dining Table",
    price: 599.99,
    stock: 12,
    dateAdded: "2023-06-15",
    status: "In Stock",
  },
  {
    id: "2",
    name: "POÄNG Armchair",
    price: 249.99,
    stock: 28,
    dateAdded: "2023-07-22",
    status: "In Stock",
  },
  {
    id: "3",
    name: "MALM Bed Frame",
    price: 399.99,
    stock: 15,
    dateAdded: "2023-08-05",
    status: "In Stock",
  },
  {
    id: "4",
    name: "KALLAX Shelf Unit",
    price: 179.99,
    stock: 32,
    dateAdded: "2023-09-12",
    status: "In Stock",
  },
  {
    id: "5",
    name: "STOCKHOLM Rug",
    price: 299.99,
    stock: 8,
    dateAdded: "2023-10-18",
    status: "Low Stock",
  },
  {
    id: "6",
    name: "KIVIK Sofa",
    price: 899.99,
    stock: 6,
    dateAdded: "2023-11-02",
    status: "Low Stock",
  },
  {
    id: "7",
    name: "LISABO Coffee Table",
    price: 149.99,
    stock: 22,
    dateAdded: "2023-11-29",
    status: "In Stock",
  },
  {
    id: "8",
    name: "HEMNES Bookcase",
    price: 249.99,
    stock: 17,
    dateAdded: "2023-12-10",
    status: "In Stock",
  },
  {
    id: "9",
    name: "EKEDALEN Dining Chairs (Set of 2)",
    price: 199.99,
    stock: 14,
    dateAdded: "2024-01-05",
    status: "In Stock",
  },
  {
    id: "10",
    name: "FRIHETEN Sleeper Sofa",
    price: 799.99,
    stock: 9,
    dateAdded: "2024-01-18",
    status: "Low Stock",
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <div
          data-slot="dashboard-header"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-7">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="exports"
              disabled
              className="text-xs sm:text-sm"
            >
              Exports
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <AnalyticsDatePicker />
            <Button variant="outline" className="w-full sm:w-auto">
              <FilterIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              <span className="sm:hidden">Filter</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <DownloadIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  Total Revenue
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  $1,250.00 in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline" className="text-xs">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +12.5%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  New Customers
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  -12 customers from last month
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline" className="text-xs">
                  <TrendingDownIcon className="mr-1 h-3 w-3" />
                  -20%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  Active Accounts
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  +2,345 users from last month
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline" className="text-xs">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +12.5%
                </Badge>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  Growth Rate
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  +12.5% increase per month
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="outline" className="text-xs">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +4.5%
                </Badge>
              </CardFooter>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <ChartRevenue />
            <ChartVisitors />
          </div>
          <ProductsTable products={products} />
          <DataTable data={data} />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Tabs defaultValue="checklist" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              <TabsTrigger value="checklist" className="text-xs sm:text-sm">
                Checklist
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm">
                Account
              </TabsTrigger>
              <TabsTrigger value="receivable" className="text-xs sm:text-sm">
                Receivable
              </TabsTrigger>
              <TabsTrigger value="payable" className="text-xs sm:text-sm">
                Payable
              </TabsTrigger>
              <TabsTrigger value="bank" className="text-xs sm:text-sm">
                Bank
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="space-y-4">
              <ChecklistDataProvider />
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <AccountDashboard data={[]} isLoading={false} />
            </TabsContent>

            <TabsContent value="receivable" className="space-y-4">
              <ReceivableDashboard data={[]} isLoading={false} />
            </TabsContent>

            <TabsContent value="payable" className="space-y-4">
              <PayableDashboard data={[]} isLoading={false} />
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <BankDashboard data={[]} isLoading={false} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
