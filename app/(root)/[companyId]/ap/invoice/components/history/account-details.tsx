"use client"

import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountDetailsProps {
  createdBy: string
  createdDate: string
  editBy: string | null
  editDate: string | null
  cancelBy: string | null
  cancelDate: string | null
  balanceAmt: number
  balanceBaseAmt: number
  paymentAmt: number
  paymentBaseAmt: number
}

export default function AccountDetails({
  createdBy,
  createdDate,
  editBy,
  editDate,
  cancelBy,
  cancelDate,
  balanceAmt,
  balanceBaseAmt,
  paymentAmt,
  paymentBaseAmt,
}: AccountDetailsProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    try {
      return format(new Date(date), datetimeFormat)
    } catch {
      return date
    }
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
                        {createdBy}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(createdDate)}
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
                        {formatDate(editDate)}
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
                        {formatDate(cancelDate)}
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
                    <span className="font-medium tabular-nums">
                      {balanceAmt.toFixed(amtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Balance Base Amount
                    </span>
                    <span className="font-medium tabular-nums">
                      {balanceBaseAmt.toFixed(locAmtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Amount
                    </span>
                    <span className="font-medium tabular-nums">
                      {paymentAmt.toFixed(amtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Base Amount
                    </span>
                    <span className="font-medium tabular-nums">
                      {paymentBaseAmt.toFixed(locAmtDec)}
                    </span>
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
