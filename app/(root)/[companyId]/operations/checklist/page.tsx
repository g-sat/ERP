"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import type { IJobOrderHd } from "@/interfaces/checklist"
import {
  DownloadIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { JobOrder } from "@/lib/api-routes"
import { OperationsStatus } from "@/lib/operations-utils"
import { cn } from "@/lib/utils"
import {
  exportJobOrdersDirect,
  searchJobOrdersDirect,
} from "@/hooks/use-checklist"
import { useGetHeader } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ChecklistTable } from "./components/checklist-table"
import { ChecklistTabs } from "./components/checklist-tabs"

export default function ChecklistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedJobData, setSelectedJobData] = useState<IJobOrderHd | null>(
    null
  )
  const [isEditMode, setIsEditMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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
  } = useGetHeader<IJobOrderHd>(
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

  const handleEditJob = (jobData: IJobOrderHd) => {
    console.log("edit job", jobData)
    setSelectedJobData(jobData)
    setIsEditMode(true)
    setIsFormOpen(true)
  }

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

  // Enhanced export functionality using api-client.ts
  const handleExport = async (format: "pdf" | "excel") => {
    setIsExporting(true)
    try {
      const filters = {
        searchString: searchQuery,
        startDate: startDate,
        endDate: endDate,
      }

      const response = await exportJobOrdersDirect(format, filters)

      if (response?.result === 1) {
        toast.success(`${format.toUpperCase()} export completed successfully`)
        // Handle file download if needed
        if (response.data?.downloadUrl) {
          window.open(response.data.downloadUrl, "_blank")
        }
      } else {
        toast.error(response?.message || `Failed to export ${format}`)
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error(`Failed to export ${format}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
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
    <div className="@container flex flex-1 flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Check-List</h1>

      {/* Enhanced Search and Filter Section */}
      <div className="mb-4 space-y-4">
        {/* Basic Search Controls */}
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-[180px]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-[180px]"
            />
            <Input
              type="text"
              placeholder="Search Jobs..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-[180px]"
            />
            <Button onClick={handleSearchClick}>
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <XIcon className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Right side buttons */}
          <div className="ml-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcwIcon className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={handleStatusChange}
        className="mb-4"
      >
        <TabsList className="flex gap-2">
          {[
            { value: "All", count: statusCounts.All },
            { value: "Pending", count: statusCounts.Pending },
            { value: "Completed", count: statusCounts.Completed },
            { value: "Cancelled", count: statusCounts.Cancelled },
            {
              value: "Cancel With Service",
              count: statusCounts["Cancel With Service"],
            },
            { value: "Confirmed", count: statusCounts.Confirmed },
            { value: "Posted", count: statusCounts.Posted },
          ].map(({ value, count }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              {value}
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
                    "bg-red-100 text-black hover:bg-red-200",
                  value === "Cancel With Service" &&
                    count > 0 &&
                    "bg-purple-100 text-purple-800 hover:bg-purple-200",
                  value === "Posted" &&
                    count > 0 &&
                    "bg-cyan-100 text-cyan-800 hover:bg-cyan-800"
                )}
              >
                {count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading || isLoadingJobOrder ? (
            <DataTableSkeleton columnCount={13} />
          ) : jobOrderError ? (
            <div className="flex items-center justify-center p-8 text-red-600">
              <p>Error loading job orders. Please try refreshing the page.</p>
            </div>
          ) : (
            <ChecklistTable
              data={apiData}
              isLoading={isRefetchingJobOrder}
              selectedStatus={selectedStatus}
              onEditJob={handleEditJob}
            />
          )}
        </CardContent>
      </Card>

      {/* Job Order Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>
              {isEditMode ? "Edit Job Order" : "Add Job Order"}
            </DialogTitle>
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
