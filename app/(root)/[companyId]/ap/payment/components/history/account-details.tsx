"use client"

import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountDetailsProps {
  createBy: string
  createDate: string
  editBy: string | null
  editDate: string | null
  cancelBy: string | null
  cancelDate: string | null
}

export default function AccountDetails({
  createBy,
  createDate,
  editBy,
  editDate,
  cancelBy,
  cancelDate,
}: AccountDetailsProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const safeFormatDate = (
    dateValue: string | Date | null | undefined,
    formatStr = "yyyy-MM-dd HH:mm"
  ) => {
    if (!dateValue) return "" // if null, undefined, or empty
    const date = new Date(dateValue)
    return isNaN(date.getTime()) ? "" : format(date, formatStr)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-muted-foreground text-sm font-medium">
                Transaction History
              </h3>
              <div className="bg-card rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Created By
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {createBy}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {safeFormatDate(createDate, datetimeFormat)}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Last Edited By
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {editBy || "-"}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {safeFormatDate(editDate, datetimeFormat)}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Cancelled By
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {cancelBy || "-"}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {safeFormatDate(cancelDate, datetimeFormat)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-muted-foreground text-sm font-medium">
                Amount Details
              </h3>
              <div className="bg-card rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Balance Amount
                    </span>
                    <span className="font-medium tabular-nums"></span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Balance Base Amount
                    </span>
                    <span className="font-medium tabular-nums"></span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Amount
                    </span>
                    <span className="font-medium tabular-nums"></span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Base Amount
                    </span>
                    <span className="font-medium tabular-nums"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
