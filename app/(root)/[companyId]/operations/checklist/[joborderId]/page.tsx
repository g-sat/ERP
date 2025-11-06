"use client"

import { useParams, useRouter } from "next/navigation"
import { IJobOrderHd } from "@/interfaces/checklist"

import { useGetJobOrderByIdNo } from "@/hooks/use-checklist"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { JobOrderNotFound } from "@/components/errors"
import { JobOrderDetailsSkeleton } from "@/components/skeleton/job-order-details-skeleton"

import { ChecklistTabs } from "./components/checklist-tabs"

export default function JobOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobOrderId = params.joborderId as string // Note: using joborderId (lowercase) to match directory name

  // Validate jobOrderId format (should be numeric string)
  const isValidJobOrderId = jobOrderId && /^\d+$/.test(jobOrderId)

  // Fetch the job order data using the hook
  const {
    data: jobOrderResponse,
    isLoading,
    isError,
    refetch: refetchJobOrder,
  } = useGetJobOrderByIdNo(isValidJobOrderId ? jobOrderId : "")

  // Debug logging
  // console.log("JobOrderDetailsPage - API Response:", {
  //   isLoading,
  //   isError,
  //   hasData: !!jobOrderResponse?.data,
  //   error: error?.message,
  //   jobOrderId,
  //   companyId: params.companyId,
  // })

  const statusColors: Record<string, string> = {
    Pending:
      "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 hover:from-amber-100 hover:to-yellow-200",
    Completed:
      "border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 hover:from-emerald-100 hover:to-green-200",
    Cancelled:
      "border-red-300 bg-gradient-to-r from-red-50 to-rose-100 text-red-800 hover:from-red-100 hover:to-rose-200",
    "Cancel with Service":
      "border-orange-300 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 hover:from-orange-100 hover:to-amber-200",
    Confirmed:
      "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 hover:from-blue-100 hover:to-indigo-200",
    Posted:
      "border-purple-300 bg-gradient-to-r from-purple-50 to-violet-100 text-purple-800 hover:from-purple-100 hover:to-violet-200",
    Delivered:
      "border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-100 text-teal-800 hover:from-teal-100 hover:to-cyan-200",
    Approved:
      "border-green-300 bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 hover:from-green-100 hover:to-emerald-200",
  }

  // Handle clone functionality
  const handleClone = (clonedData: IJobOrderHd) => {
    try {
      // Store cloned data in sessionStorage for the new page to use
      // This avoids URL length limits and preserves complex objects
      const clonedDataForStorage = {
        ...clonedData,
        jobOrderId: 0, // Reset ID for new record
        jobOrderNo: "", // Reset job order number
        jobOrderDate: new Date().toISOString().split("T")[0], // Set to today
        editVersion: 0, // Reset edit version
      }
      sessionStorage.setItem(
        "clonedJobOrder",
        JSON.stringify(clonedDataForStorage)
      )
      // Navigate to the new checklist page
      router.push(`/${params.companyId}/operations/checklist/new`)
    } catch (error) {
      console.error("Error cloning job order:", error)
    }
  }

  // Handle loading state
  if (isLoading) {
    return <JobOrderDetailsSkeleton />
  }

  // Handle invalid jobOrderId format
  if (!isValidJobOrderId) {
    return (
      <JobOrderNotFound
        jobOrderId={jobOrderId}
        companyId={params.companyId as string}
      />
    )
  }

  // Handle error state - Job order not found in current company
  if (isError || !jobOrderResponse?.data) {
    return (
      <JobOrderNotFound
        jobOrderId={jobOrderId}
        companyId={params.companyId as string}
      />
    )
  }

  return (
    //<div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
    <div className="@container mx-auto space-y-2 px-2 py-2">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                Checklist Details{" "}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          {jobOrderResponse?.data?.jobOrderNo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="flex h-8 items-center border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 text-sm font-semibold text-blue-800 shadow-sm transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:shadow-md dark:border-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700"
                  >
                    <span className="mr-1 text-blue-600">📋</span>
                    {`${jobOrderResponse?.data?.jobOrderNo} : v[${jobOrderResponse?.data?.editVersion}]`}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm border border-gray-200 bg-white p-4 shadow-lg">
                  <div className="space-y-2">
                    <h4 className="mb-3 font-semibold text-blue-800">
                      Checklist Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          JobOrderNo:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.jobOrderNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Customer:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.customerName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Port:</span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.portName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Currency:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.currencyName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Job Date:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.jobOrderDate
                            ? new Date(
                                jobOrderResponse.data.jobOrderDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Vessel:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.vesselName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Last Port:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.lastPortName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Next Port:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.nextPortName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Status:
                        </span>
                        <span className="text-gray-800">
                          {jobOrderResponse?.data?.statusName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {jobOrderResponse?.data?.statusName && (
            <Badge
              className={`flex h-8 items-center border-2 px-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${statusColors[jobOrderResponse.data.statusName as keyof typeof statusColors] || "border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"}`}
            >
              <span className="mr-1">⚡</span>
              {jobOrderResponse.data.statusName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={jobOrderResponse?.data ? "default" : "secondary"}
            className="text-xs"
          >
            {jobOrderResponse?.data ? "Edit Mode" : "Create Mode"}
          </Badge>
        </div>
      </div>

      {/* ChecklistTabs Component */}
      <ChecklistTabs
        jobData={jobOrderResponse?.data as IJobOrderHd}
        onClone={handleClone}
        onUpdateSuccess={refetchJobOrder}
      />
    </div>
  )
}
