"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CollectionEffectivenessIndexProps {
  dateRange: { from: Date; to: Date }
  salesperson: string
  customerSegments: string[]
}

export function CollectionEffectivenessIndex({
  dateRange,
  salesperson,
  customerSegments,
}: CollectionEffectivenessIndexProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Effectiveness</CardTitle>
        <CardDescription>
          Performance metrics for {dateRange.from.toLocaleDateString()} -{" "}
          {dateRange.to.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Collection Rate</span>
              <Badge variant="outline" className="text-green-600">
                85.2%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average DSO</span>
              <span className="font-medium">32 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cash Collected</span>
              <span className="font-medium">$180,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Outstanding Reduction</span>
              <Badge variant="outline" className="text-blue-600">
                -12.5%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
