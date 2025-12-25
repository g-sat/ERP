"use client"

import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"

import { formatNumber } from "@/lib/format-utils"
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
  balanceAmt: number
  balanceBaseAmt: number
  paymentAmt: number
  paymentBaseAmt: number
}

export default function AccountDetails({
  createBy,
  createDate,
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

  console.log(createDate, editDate, cancelDate)
  console.log(format(createDate, datetimeFormat))

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
                        {format(createDate, datetimeFormat)}
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
                        {editDate ? format(editDate, datetimeFormat) : "-"}
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
                        {cancelDate ? format(cancelDate, datetimeFormat) : "-"}
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
                    <span className="text-right font-medium tabular-nums">
                      {formatNumber(balanceAmt, amtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Balance Base Amount
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {formatNumber(balanceBaseAmt, locAmtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Amount
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {formatNumber(paymentAmt, amtDec)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Payment Base Amount
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {formatNumber(paymentBaseAmt, locAmtDec)}
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
