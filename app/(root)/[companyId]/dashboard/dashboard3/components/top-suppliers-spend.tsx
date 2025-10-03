"use client"

import { BarChart3, ExternalLink, PieChart, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface SupplierSpend {
  id: string
  name: string
  category: string
  ytdSpend: number
  pctOfTotal: number
  invoiceCount: number
  avgInvoiceValue: number
  growthRate: number
}

interface TopSuppliersSpendProps {
  filters: Dashboard3Filters
}

export default function TopSuppliersSpend({ filters }: TopSuppliersSpendProps) {
  // Mock data - replace with actual API call
  const suppliersData: SupplierSpend[] = [
    {
      id: "1",
      name: "Acme Manufacturing Ltd.",
      category: "Raw Materials",
      ytdSpend: 2847500,
      pctOfTotal: 18.5,
      invoiceCount: 45,
      avgInvoiceValue: 63278,
      growthRate: 12.3,
    },
    {
      id: "2",
      name: "Global Logistics Inc.",
      category: "Logistics",
      ytdSpend: 1923400,
      pctOfTotal: 12.5,
      invoiceCount: 32,
      avgInvoiceValue: 60106,
      growthRate: 8.7,
    },
    {
      id: "3",
      name: "Tech Solutions Corp.",
      category: "IT Services",
      ytdSpend: 1567800,
      pctOfTotal: 10.2,
      invoiceCount: 28,
      avgInvoiceValue: 55993,
      growthRate: 15.2,
    },
    {
      id: "4",
      name: "Premier Office Supplies",
      category: "Office Supplies",
      ytdSpend: 987650,
      pctOfTotal: 6.4,
      invoiceCount: 67,
      avgInvoiceValue: 14741,
      growthRate: -2.1,
    },
    {
      id: "5",
      name: "Industrial Equipment Co.",
      category: "Equipment",
      ytdSpend: 876400,
      pctOfTotal: 5.7,
      invoiceCount: 12,
      avgInvoiceValue: 73033,
      growthRate: 22.8,
    },
    {
      id: "6",
      name: "Marketing Partners LLC",
      category: "Marketing",
      ytdSpend: 654300,
      pctOfTotal: 4.3,
      invoiceCount: 18,
      avgInvoiceValue: 36350,
      growthRate: 18.9,
    },
    {
      id: "7",
      name: "Utility Services Group",
      category: "Utilities",
      ytdSpend: 543200,
      pctOfTotal: 3.5,
      invoiceCount: 15,
      avgInvoiceValue: 36213,
      growthRate: 5.4,
    },
    {
      id: "8",
      name: "Professional Consulting",
      category: "Professional Services",
      ytdSpend: 432100,
      pctOfTotal: 2.8,
      invoiceCount: 25,
      avgInvoiceValue: 17284,
      growthRate: 9.6,
    },
    {
      id: "9",
      name: "Construction Materials Ltd.",
      category: "Raw Materials",
      ytdSpend: 387650,
      pctOfTotal: 2.5,
      invoiceCount: 14,
      avgInvoiceValue: 27689,
      growthRate: 11.2,
    },
    {
      id: "10",
      name: "IT Infrastructure Inc.",
      category: "IT Services",
      ytdSpend: 321400,
      pctOfTotal: 2.1,
      invoiceCount: 22,
      avgInvoiceValue: 14609,
      growthRate: 7.8,
    },
  ]

  const totalYTDSpend = suppliersData.reduce(
    (sum, supplier) => sum + supplier.ytdSpend,
    0
  )
  const top10Percentage = suppliersData.reduce(
    (sum, supplier) => sum + supplier.pctOfTotal,
    0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Raw Materials": "#3b82f6",
      Logistics: "#10b981",
      "IT Services": "#8b5cf6",
      "Office Supplies": "#f59e0b",
      Equipment: "#ef4444",
      Marketing: "#ec4899",
      Utilities: "#06b6d4",
      "Professional Services": "#84cc16",
    }
    return colors[category] || "#6b7280"
  }

  const handleSupplierClick = (supplier: SupplierSpend) => {
    console.log(`Opening spend analysis for: ${supplier.name}`)
  }

  // Create treemap-style visualization data
  const treemapData = suppliersData.map((supplier) => ({
    ...supplier,
    color: getCategoryColor(supplier.category),
    size: supplier.ytdSpend / totalYTDSpend,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top 10 Suppliers by Spend (YTD)</span>
          <Badge variant="outline" className="text-xs">
            {top10Percentage.toFixed(1)}% of total spend
          </Badge>
        </CardTitle>
        <CardDescription>
          Procurement concentration analysis and strategic supplier
          identification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metric */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {top10Percentage.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-sm">
                Spend Concentration: Top 10 Suppliers represent{" "}
                {top10Percentage.toFixed(1)}% of Total YTD Spend
              </div>
            </div>
          </div>

          {/* Treemap Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Spend Distribution</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Bar
                </Button>
                <Button variant="default" size="sm">
                  <PieChart className="mr-1 h-4 w-4" />
                  Treemap
                </Button>
              </div>
            </div>

            {/* Treemap Grid */}
            <div className="grid h-48 grid-cols-2 gap-2">
              {treemapData.slice(0, 8).map((supplier, index) => (
                <div
                  key={supplier.id}
                  className="border-border group relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: supplier.color + "20",
                    borderColor: supplier.color,
                    gridColumn: index < 4 ? "span 1" : "span 1",
                    gridRow: index < 4 ? "span 1" : "span 1",
                  }}
                  onClick={() => handleSupplierClick(supplier)}
                >
                  <div className="flex h-full flex-col justify-between p-3">
                    <div>
                      <div
                        className="truncate text-sm font-semibold"
                        style={{ color: supplier.color }}
                      >
                        {supplier.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {supplier.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: supplier.color }}
                      >
                        {formatCurrency(supplier.ytdSpend)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {supplier.pctOfTotal.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <ExternalLink
                      className="h-3 w-3"
                      style={{ color: supplier.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier List */}
          <div className="space-y-2">
            <h4 className="font-semibold">Supplier Details</h4>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {suppliersData.map((supplier, index) => (
                <div
                  key={supplier.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2"
                  onClick={() => handleSupplierClick(supplier)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor: getCategoryColor(supplier.category),
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{supplier.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {supplier.category} • {supplier.invoiceCount} invoices
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(supplier.ytdSpend)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          supplier.growthRate >= 0 ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {supplier.growthRate >= 0 ? "+" : ""}
                        {supplier.growthRate.toFixed(1)}%
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {supplier.pctOfTotal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Legend */}
          <div className="border-t pt-4">
            <h4 className="mb-2 font-semibold">Spend Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Array.from(new Set(suppliersData.map((s) => s.category))).map(
                (category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span>{category}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total YTD Spend:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(totalYTDSpend)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg. Growth Rate:</span>
                <span className="ml-2 font-semibold">
                  +
                  {(
                    suppliersData.reduce((sum, s) => sum + s.growthRate, 0) /
                    suppliersData.length
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
