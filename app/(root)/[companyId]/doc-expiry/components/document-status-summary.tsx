"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DocumentStatusSummaryProps {
  validCount: number
  expiringSoonCount: number
  expiredCount: number
}

export function DocumentStatusSummary({
  validCount,
  expiringSoonCount,
  expiredCount,
}: DocumentStatusSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valid Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{validCount}</div>
          <p className="text-xs text-gray-500">Currently valid documents</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">
            {expiringSoonCount}
          </div>
          <p className="text-xs text-gray-500">
            Documents expiring within 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Expired Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
          <p className="text-xs text-gray-500">Documents that need renewal</p>
        </CardContent>
      </Card>
    </div>
  )
}
