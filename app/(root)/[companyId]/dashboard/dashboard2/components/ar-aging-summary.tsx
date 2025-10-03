"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ARAgingSummaryProps {
  agingAsOfDate: Date
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function ARAgingSummary({
  agingAsOfDate,
  salesperson,
  customerSegments,
  includeCreditHold,
}: ARAgingSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AR Aging Summary</CardTitle>
        <CardDescription>
          Outstanding receivables as of {agingAsOfDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Current (0-30 days)
                </span>
                <span className="font-medium">$125,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  31-60 days
                </span>
                <span className="font-medium">$45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  61-90 days
                </span>
                <span className="font-medium">$25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Over 90 days
                </span>
                <span className="font-medium">$15,000</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Outstanding
                </span>
                <span className="text-lg font-bold">$210,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Overdue Amount
                </span>
                <Badge variant="destructive">$40,000</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
