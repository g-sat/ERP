"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DSOTrendAnalysisProps {
  dateRange: { from: Date; to: Date }
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function DSOTrendAnalysis({
  dateRange,
  salesperson,
  customerSegments,
  includeCreditHold,
}: DSOTrendAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DSO Trend Analysis</CardTitle>
        <CardDescription>
          Days Sales Outstanding trend for {dateRange.from.toLocaleDateString()}{" "}
          - {dateRange.to.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">32</div>
              <div className="text-muted-foreground text-sm">Current DSO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">-3</div>
              <div className="text-muted-foreground text-sm">vs Last Month</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Industry Average</span>
              <span className="text-sm">35 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Target DSO</span>
              <span className="text-sm">30 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Performance</span>
              <Badge variant="outline" className="text-green-600">
                Above Target
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
