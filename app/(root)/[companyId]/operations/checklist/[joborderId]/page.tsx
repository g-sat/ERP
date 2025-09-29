"use client"

import { useParams } from "next/navigation"
import { IJobOrderHd } from "@/interfaces/checklist"

import { useGetJobOrderByIdNo } from "@/hooks/use-checklist"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { JobOrderDetailsSkeleton } from "@/components/skeleton/job-order-details-skeleton"

import { ChecklistTabs } from "./components/checklist-tabs"

export default function JobOrderDetailsPage() {
  const params = useParams()
  const jobOrderId = params.joborderId as string // Note: using joborderId (lowercase) to match directory name

  console.log("JobOrderDetailsPage - params:", params)
  console.log("JobOrderDetailsPage - jobOrderId:", jobOrderId)

  // Fetch the job order data using the hook
  const { data: jobOrderResponse, isLoading } = useGetJobOrderByIdNo(jobOrderId)

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

  if (isLoading) {
    return <JobOrderDetailsSkeleton />
  }

  return (
    //<div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
    <div className="container mx-auto space-y-2 px-2 py-2">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                Job Order Details{" "}
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
                    {jobOrderResponse?.data?.jobOrderNo}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <div className="space-y-2">
                    <h4 className="mb-3 font-semibold text-blue-800">
                      Job Order Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Job Order No:
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
        isEdit={true}
        isNewRecord={false}
        onClone={() => {}}
        onSuccess={() => {}}
      />
    </div>
  )
}
