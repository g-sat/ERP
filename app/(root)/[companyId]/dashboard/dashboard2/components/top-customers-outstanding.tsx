"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TopCustomersByOutstandingProps {
  agingAsOfDate: Date
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function TopCustomersByOutstanding({
  agingAsOfDate,
  salesperson,
  customerSegments,
  includeCreditHold,
}: TopCustomersByOutstandingProps) {
  const topCustomers = [
    {
      name: "ABC Corp",
      outstanding: 45000,
      creditLimit: 50000,
      utilization: 90,
    },
    {
      name: "XYZ Ltd",
      outstanding: 32000,
      creditLimit: 40000,
      utilization: 80,
    },
    {
      name: "DEF Inc",
      outstanding: 28000,
      creditLimit: 35000,
      utilization: 80,
    },
    { name: "GHI Co", outstanding: 22000, creditLimit: 30000, utilization: 73 },
    {
      name: "JKL Ltd",
      outstanding: 18000,
      creditLimit: 25000,
      utilization: 72,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers by Outstanding</CardTitle>
        <CardDescription>
          Highest outstanding balances as of{" "}
          {agingAsOfDate.toLocaleDateString()}
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
                    Credit Limit: ${customer.creditLimit.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${customer.outstanding.toLocaleString()}
                </p>
                <Badge
                  variant={
                    customer.utilization > 85 ? "destructive" : "outline"
                  }
                >
                  {customer.utilization}% used
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
