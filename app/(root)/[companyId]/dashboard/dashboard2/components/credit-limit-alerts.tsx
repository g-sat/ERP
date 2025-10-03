"use client"

import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CreditLimitAlertsProps {
  agingAsOfDate: Date
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function CreditLimitAlerts({
  agingAsOfDate,
  salesperson,
  customerSegments,
  includeCreditHold,
}: CreditLimitAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Credit Limit Alerts
        </CardTitle>
        <CardDescription>
          Customers approaching or exceeding credit limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-orange-50 p-2">
            <div>
              <p className="text-sm font-medium">ABC Corp</p>
              <p className="text-muted-foreground text-xs">
                Credit Limit: $50,000
              </p>
            </div>
            <Badge variant="destructive">95% Used</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-2">
            <div>
              <p className="text-sm font-medium">XYZ Ltd</p>
              <p className="text-muted-foreground text-xs">
                Credit Limit: $25,000
              </p>
            </div>
            <Badge variant="outline" className="text-yellow-600">
              80% Used
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-red-50 p-2">
            <div>
              <p className="text-sm font-medium">DEF Inc</p>
              <p className="text-muted-foreground text-xs">
                Credit Limit: $30,000
              </p>
            </div>
            <Badge variant="destructive">105% Used</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
