"use client"

import React from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChecklistHistoryFormProps {
  jobData?: IJobOrderHd | null
  isConfirmed?: boolean
}

export function ChecklistHistory({
  jobData,
  isConfirmed = false,
}: ChecklistHistoryFormProps) {
  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "-"
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
      return format(date, "dd/MM/yyyy HH:mm")
    } catch {
      return "-"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Record History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Creation Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-semibold">
                Creation Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Created By:</span>
                  <span className="text-sm">
                    {jobData?.createBy || "System"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Created Date:</span>
                  <span className="text-sm">
                    {formatDate(jobData?.createDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-semibold">
                Last Modified
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modified By:</span>
                  <span className="text-sm">
                    {jobData?.editBy || "Not modified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modified Date:</span>
                  <span className="text-sm">
                    {formatDate(jobData?.editDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Version */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Edit Version:</span>
              <Badge variant="secondary" className="text-xs">
                {jobData?.editVersion || "0"}
              </Badge>
            </div>
          </div>

          {/* Status Information */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge
                variant={isConfirmed ? "default" : "secondary"}
                className="text-xs"
              >
                {jobData?.statusName || "Unknown"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
