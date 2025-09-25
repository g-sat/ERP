"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import type { IJobOrderHd } from "@/interfaces/checklist"
import { toast } from "sonner"

import { JobOrder } from "@/lib/api-routes"
import { OperationsStatus } from "@/lib/operations-utils"
import { ModuleId, OperationsTransactionId, cn } from "@/lib/utils"
import { searchJobOrdersDirect } from "@/hooks/use-checklist"
import { useGetWithDates } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { ChecklistTable } from "./components/checklist-table"
import { ChecklistTabs } from "./components/checklist-tabs"

export default function ChecklistPage() {
  const moduleId = ModuleId.operations
  const transactionId = OperationsTransactionId.checklist

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedJobData, setSelectedJobData] = useState<IJobOrderHd | null>(
    null
  )
  const [isEditMode, setIsEditMode] = useState(false)

  // Add this at the top of your component
  const today = new Date()
  const defaultStartDate = new Date(today)
  defaultStartDate.setMonth(today.getMonth() - 7) // Go back 7 months

  // Format dates to YYYY-MM-DD for input fields
  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  // Inside your component state
  const [startDate, setStartDate] = useState(formatDate(defaultStartDate))
  const [endDate, setEndDate] = useState(formatDate(today))

  // API hooks for job order using api-client.ts through useGetHeader
  const {
    data: jobOrderResponse,
    refetch: refetchJobOrder,
    isLoading: isLoadingJobOrder,
    isRefetching: isRefetchingJobOrder,
    error: jobOrderError,
  } = useGetWithDates<IJobOrderHd>(
    JobOrder.get,
    "jobOrderHd",
    searchQuery,
    startDate,
    endDate
  )

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle API errors
  useEffect(() => {
    if (jobOrderError) {
      console.error("Error fetching job orders:", jobOrderError)
      toast.error("Failed to load job orders. Please try refreshing the page.")
    }
  }, [jobOrderError])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
  }

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  const handleClear = () => {
    setStartDate(formatDate(defaultStartDate))
    setEndDate(formatDate(today))
    setSearchQuery("")
    setSelectedStatus("All")
  }

  const handleSearchClick = async () => {
    try {
      // Use enhanced search function from api-client.ts
      const searchParams = {
        searchString: searchQuery,
        startDate: startDate,
        endDate: endDate,
      }

      await searchJobOrdersDirect(searchParams)
      refetchJobOrder()
      toast.success("Search completed successfully")
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Search failed. Please try again.")
    }
  }

  const handleRefresh = () => {
    refetchJobOrder()
    toast.success("Data refreshed successfully")
  }

  const handleAddNew = () => {
    console.log("add new")
    setSelectedJobData(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  //const handleEditJob = (jobData: IJobOrderHd) => {
  //console.log("edit job", jobData)
  //setSelectedJobData(jobData)
  //setIsEditMode(true)
  //setIsFormOpen(true)
  //}

  const handleFormSuccess = () => {
    // Don't close the dialog after successful save
    // setIsFormOpen(false)
    // setSelectedJobData(null)
    // setIsEditMode(false)
    refetchJobOrder() // Refresh the data after successful save/update
  }

  const handleCloneJob = (clonedData: IJobOrderHd) => {
    console.log("Cloning job order:", clonedData)
    setSelectedJobData(clonedData)
    setIsEditMode(false) // Set to create mode for cloned data
    setIsFormOpen(true)
  }

  // Use API data with proper error handling
  const apiData = jobOrderResponse?.data || []

  // Get status counts from the API data
  const getStatusCounts = useMemo(() => {
    const counts = {
      All: apiData.length,
      Pending: apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.Pending.toString()
      ).length,
      Confirmed: apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.Confirmed.toString()
      ).length,
      Completed: apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.Completed.toString()
      ).length,
      Cancelled: apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.Cancelled.toString()
      ).length,
      "Cancel With Service": apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.CancelWithService.toString()
      ).length,
      Posted: apiData.filter(
        (job: IJobOrderHd) =>
          job.statusName === OperationsStatus.Post.toString()
      ).length,
    }
    return counts
  }, [apiData])

  const statusCounts = getStatusCounts
  console.log("statusCounts", statusCounts)

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                Checklist Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage job orders and checklists efficiently
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Total: {statusCounts.All}
          </Badge>
          {isRefetchingJobOrder && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></div>
              Updating...
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">📅</span>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full sm:w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">📅</span>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full sm:w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">🔎</span>
              <Input
                type="text"
                placeholder="Search Jobs..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full sm:w-[180px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSearchClick}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <span>🗑️</span>
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div>
        <Tabs
          value={selectedStatus}
          onValueChange={handleStatusChange}
          className="space-y-4"
        >
          <TabsList className="w-full">
            {[
              { value: "All", count: statusCounts.All, icon: "📋" },
              { value: "Pending", count: statusCounts.Pending, icon: "⏳" },
              { value: "Completed", count: statusCounts.Completed, icon: "✅" },
              { value: "Cancelled", count: statusCounts.Cancelled, icon: "❌" },
              {
                value: "Cancel With Service",
                count: statusCounts["Cancel With Service"],
                icon: "⚠️",
              },
              { value: "Confirmed", count: statusCounts.Confirmed, icon: "✔️" },
              { value: "Posted", count: statusCounts.Posted, icon: "📤" },
            ].map(({ value, count, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative flex flex-col items-center space-y-1 px-2 py-3 text-xs sm:flex-row sm:space-y-0 sm:space-x-2 sm:px-4 sm:text-sm"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs">{icon}</span>
                  <span className="hidden sm:inline">{value}</span>
                  <span className="sm:hidden">{value.split(" ")[0]}</span>
                </div>
                <Badge
                  variant={
                    count > 0
                      ? value === "All"
                        ? "default"
                        : value === "Pending"
                          ? "secondary"
                          : value === "Confirmed"
                            ? "default"
                            : value === "Completed"
                              ? "default"
                              : value === "Cancelled"
                                ? "destructive"
                                : value === "Cancel With Service"
                                  ? "secondary"
                                  : "default"
                      : "outline"
                  }
                  className={cn(
                    "text-xs font-medium",
                    // Custom colors for different statuses
                    value === "Pending" &&
                      count > 0 &&
                      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    value === "Confirmed" &&
                      count > 0 &&
                      "bg-green-100 text-green-800 hover:bg-green-200",
                    value === "Completed" &&
                      count > 0 &&
                      "bg-blue-100 text-blue-800 hover:bg-blue-200",
                    value === "Cancelled" &&
                      count > 0 &&
                      "bg-red-100 text-red-800 hover:bg-red-200",
                    value === "Cancel With Service" &&
                      count > 0 &&
                      "bg-purple-100 text-purple-800 hover:bg-purple-200",
                    value === "Posted" &&
                      count > 0 &&
                      "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                  )}
                >
                  {count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        {isLoading || isLoadingJobOrder ? (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm">⏳</span>
              <span className="text-sm font-medium">Loading Data</span>
            </div>
            <DataTableSkeleton columnCount={13} />
          </div>
        ) : jobOrderError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-600">
              Loading Failed
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Unable to load job orders. Please check your connection and try
              again.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh Page
              </Button>
              <Button
                variant="destructive"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <span>🔄</span>
                Reload Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ChecklistTable
              data={apiData}
              isLoading={isRefetchingJobOrder}
              selectedStatus={selectedStatus}
              moduleId={moduleId}
              transactionId={transactionId}
              onCreate={handleAddNew}
              onRefresh={handleRefresh}
              //onEditJob={handleEditJob}
            />
          </div>
        )}
      </div>

      {/* Job Order Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-sm">{isEditMode ? "✏️" : "➕"}</span>
              </div>
              <DialogTitle className="text-lg font-semibold">
                {"Job Order Details"}{" "}
                <Badge variant="outline" className="text-xs">
                  {selectedJobData ? "Edit Mode" : "Create Mode"}
                </Badge>
              </DialogTitle>
            </div>
          </DialogHeader>
          {selectedJobData ? (
            <ChecklistTabs
              key={`${selectedJobData.jobOrderId}-${selectedJobData.jobOrderNo}-${Date.now()}`}
              jobData={selectedJobData}
              onSuccess={handleFormSuccess}
              isEdit={isEditMode}
              isNewRecord={false}
              onClone={handleCloneJob}
            />
          ) : (
            <ChecklistTabs
              key={`new-record-${Date.now()}`}
              jobData={{} as IJobOrderHd}
              onSuccess={handleFormSuccess}
              isEdit={false}
              isNewRecord={true}
              onClone={handleCloneJob}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
