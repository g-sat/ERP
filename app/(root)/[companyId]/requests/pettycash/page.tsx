"use client"

import { useState } from "react"
import { IPettyCashRequest } from "@/interfaces/pettycash"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { CbPettyCash } from "@/lib/api-routes"
import { useGetById, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { PettyCashRequestForm } from "./components/petty-cash-request-form"
import { PettyCashTable } from "./components/petty-cash-table"

export default function PettyCashPage() {
  const queryClient = useQueryClient()
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Fetch petty cash data
  const { data: pettyCashData, isLoading: pettyCashLoading } = useGetById<
    IPettyCashRequest[]
  >(CbPettyCash.get, "petty-cash", "33")

  // Initialize mutation hook
  const savePettyCashRequestMutation = usePersist(CbPettyCash.add)

  // Extract data
  const pettyCashRequests = pettyCashData?.data || []

  // Calculate statistics for current year
  const currentYear = new Date().getFullYear()
  const currentYearRequests = pettyCashRequests.filter((request) => {
    const requestYear = new Date(request.requestDate).getFullYear()
    return requestYear === currentYear
  })

  const totalRequests = pettyCashRequests.length
  const totalAmount = currentYearRequests.reduce(
    (total, request) => total + request.amount,
    0
  )
  const totalPendingAmount = currentYearRequests
    .filter((request) => request.statusName === "Pending")
    .reduce((total, request) => total + request.amount, 0)

  const handleAddNewRequest = () => {
    setShowRequestForm(true)
  }

  const handlePettyCashSubmit = async (data: any) => {
    try {
      const pettyCashRequestData = {
        employeeId: "33",
        amount: data.amount,
        purpose: data.purpose,
        remarks: data.remarks,
        requestDate: new Date().toISOString().split("T")[0],
        statusId: 1, // Default to pending
        attachments: data.attachments,
      }

      await savePettyCashRequestMutation.mutateAsync(pettyCashRequestData)
      setShowRequestForm(false)
      toast.success("Petty cash request submitted successfully")
      queryClient.invalidateQueries({ queryKey: ["petty-cash"] })
    } catch (error) {
      console.error("Error submitting petty cash request:", error)
      toast.error("Failed to submit petty cash request")
    }
  }

  // Show loading state
  if (pettyCashLoading && pettyCashRequests.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-muted-foreground mt-2">
              Loading petty cash data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Petty Cash</h2>
        <Button onClick={handleAddNewRequest}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-muted-foreground text-xs">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyFormatter amount={totalAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">{currentYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyFormatter amount={totalPendingAmount} size="lg" />
            </div>
            <p className="text-muted-foreground text-xs">{currentYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* Petty Cash Requests Table */}
      <Card>
        <CardContent>
          <PettyCashTable
            pettyCashRequests={pettyCashRequests}
            onSave={() => {}}
            showActions={false}
          />
        </CardContent>
      </Card>

      {/* Petty Cash Request Form Dialog */}
      <PettyCashRequestForm
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
        onSubmit={handlePettyCashSubmit}
      />
    </div>
  )
}
