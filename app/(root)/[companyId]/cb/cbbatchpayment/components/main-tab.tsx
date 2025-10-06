"use client"

import { useState } from "react"
import {
  ICBBatchPaymentDt,
  ICBBatchPaymentHd,
} from "@/interfaces/cb-batchpayment"
import { Calculator, FileText, List, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import CBBatchPaymentDetailsTable from "./cb-batchpayment-details-table"

interface MainTabProps {
  payment: ICBBatchPaymentHd
  details: ICBBatchPaymentDt[]
  onDetailsChange: (details: ICBBatchPaymentDt[]) => void
  onAddDetail: () => void
  onRemoveDetail: (index: number) => void
  onUpdateDetail: (
    index: number,
    field: keyof ICBBatchPaymentDt,
    value: unknown
  ) => void
}

export default function MainTab({
  payment,
  details,
  onDetailsChange,
  onAddDetail,
  onRemoveDetail,
  onUpdateDetail,
}: MainTabProps) {
  const [activeTab, setActiveTab] = useState("details")

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const calculateTotals = () => {
    const totalAmt = details.reduce(
      (sum, detail) => sum + (detail.totAmt || 0),
      0
    )
    const totalLocalAmt = details.reduce(
      (sum, detail) => sum + (detail.totLocalAmt || 0),
      0
    )
    const totalCtyAmt = details.reduce(
      (sum, detail) => sum + (detail.totCtyAmt || 0),
      0
    )
    const totalGstAmt = details.reduce(
      (sum, detail) => sum + (detail.gstAmt || 0),
      0
    )

    return {
      totalAmt,
      totalLocalAmt,
      totalCtyAmt,
      totalGstAmt,
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.totalAmt, payment.currencyCode)}
                </p>
              </div>
              <Calculator className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Local Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.totalLocalAmt, payment.currencyCode)}
                </p>
              </div>
              <Calculator className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  GST Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.totalGstAmt, payment.currencyCode)}
                </p>
              </div>
              <Calculator className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Items Count
                </p>
                <p className="text-2xl font-bold">{details.length}</p>
              </div>
              <List className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Payment Details
            <Badge variant="secondary">{details.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Details</CardTitle>
                <Button onClick={onAddDetail} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Detail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CBBatchPaymentDetailsTable
                details={details}
                onRemoveDetail={onRemoveDetail}
                onUpdateDetail={onUpdateDetail}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Payment No:
                        </span>
                        <span>{payment.paymentNo || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span>{payment.supplierName || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span>{payment.bankName || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span>{payment.currencyName || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Amount Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Amount:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            totals.totalAmt,
                            payment.currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Local Amount:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            totals.totalLocalAmt,
                            payment.currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          GST Amount:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            totals.totalGstAmt,
                            payment.currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Exchange Rate:
                        </span>
                        <span className="font-medium">{payment.exhRate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {payment.remarks && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Remarks</h4>
                    <p className="text-muted-foreground text-sm">
                      {payment.remarks}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
