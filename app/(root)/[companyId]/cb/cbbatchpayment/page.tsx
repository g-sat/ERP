"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ICBBatchPaymentFilter } from "@/interfaces/cb-batchpayment"
import { format } from "date-fns"
import { CalendarIcon, Filter, Plus, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useGetCBBatchPayments } from "@/hooks/use-cb-batchpayment"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import CBBatchPaymentForm from "./components/cb-batchpayment-form"
import CBBatchPaymentTable from "./components/cb-batchpayment-table"
import CBBatchPaymentHistory from "./components/history"

export default function CBBatchPaymentPage() {
  const params = useParams()
  const companyId = Number(params.companyId)

  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const filters: ICBBatchPaymentFilter = {
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    search: searchTerm,
    sortOrder: "desc",
    sortBy: "trnDate",
  }

  const {
    data: paymentsData,
    isLoading,
    refetch,
  } = useGetCBBatchPayments(companyId, filters)

  const handleNewPayment = () => {
    setSelectedPayment(null)
    setShowForm(true)
  }

  const handleEditPayment = (paymentId: string) => {
    setSelectedPayment(paymentId)
    setShowForm(true)
  }

  const handleViewHistory = (paymentId: string) => {
    setSelectedPayment(paymentId)
    setShowHistory(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedPayment(null)
    refetch()
  }

  const handleHistoryClose = () => {
    setShowHistory(false)
    setSelectedPayment(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            CB Batch Payment
          </h1>
          <p className="text-muted-foreground">
            Manage cash book batch payments for suppliers
          </p>
        </div>
        <Button onClick={handleNewPayment} className="gap-2">
          <Plus className="h-4 w-4" />
          New Payment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  id="search"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStartDate(undefined)
                  setEndDate(undefined)
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <CBBatchPaymentTable
        data={paymentsData?.data || []}
        isLoading={isLoading}
        onEdit={handleEditPayment}
        onViewHistory={handleViewHistory}
        onRefresh={refetch}
      />

      {/* Form Modal */}
      {showForm && (
        <CBBatchPaymentForm
          companyId={companyId}
          paymentId={selectedPayment}
          onClose={handleFormClose}
        />
      )}

      {/* History Modal */}
      {showHistory && selectedPayment && (
        <CBBatchPaymentHistory
          companyId={companyId}
          paymentId={selectedPayment}
          onClose={handleHistoryClose}
        />
      )}
    </div>
  )
}
