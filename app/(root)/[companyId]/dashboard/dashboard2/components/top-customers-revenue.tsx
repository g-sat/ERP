"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TopCustomersByRevenueProps {
  dateRange: { from: Date; to: Date }
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function TopCustomersByRevenue({
  dateRange,
  salesperson,
  customerSegments,
  includeCreditHold,
}: TopCustomersByRevenueProps) {
  const topCustomers = [
    { name: "ABC Corp", revenue: 125000, growth: 15.2, status: "Growing" },
    { name: "XYZ Ltd", revenue: 98000, growth: 8.5, status: "Stable" },
    { name: "DEF Inc", revenue: 87000, growth: -5.2, status: "Declining" },
    { name: "GHI Co", revenue: 72000, growth: 22.1, status: "Growing" },
    { name: "JKL Ltd", revenue: 65000, growth: 12.3, status: "Growing" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers by Revenue</CardTitle>
        <CardDescription>
          Highest revenue for {dateRange.from.toLocaleDateString()} -{" "}
          {dateRange.to.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCustomers.map((customer, index) => (
            <div
              key={customer.name}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {customer.growth > 0 ? "+" : ""}
                    {customer.growth}% growth
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${customer.revenue.toLocaleString()}
                </p>
                <Badge
                  variant={
                    customer.status === "Growing"
                      ? "default"
                      : customer.status === "Declining"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {customer.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
