"use client"

import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IJobOrderHd } from "@/interfaces/checklist"
import { IJobOrderLookup } from "@/interfaces/lookup"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowRight,
  CalendarIcon,
  CheckCircle,
  Database,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobOrderCustomerAutocomplete } from "@/components/autocomplete"

interface TaskForwardSchemaType extends Record<string, unknown> {
  customerId: number
  jobOrderId: number
}

interface BulkUpdateData {
  jobOrderId: number
  moduleId: number
  transactionId: number
  field: string
  date: string
}

interface TaskForwardData {
  multipleId: string
  taskId: number
  previousJobOrderId: number
  targetJobOrderId: number
  targetJobOrderNo: string
}

interface CombinedFormsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  isConfirmed?: boolean
  taskId: number
  multipleId: string
  onTaskAdded?: () => void
  onClearSelection?: () => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function CombinedFormsDialog({
  open,
  onOpenChange,
  jobData,
  moduleId,
  transactionId,
  isConfirmed,
  taskId,
  multipleId,
  onTaskAdded,
  onClearSelection,
  onCancel,
  title = "Combined Services",
  description = "Manage bulk updates and task forwarding operations",
}: CombinedFormsDialogProps) {
  const queryClient = useQueryClient()

  console.log(isConfirmed, "isConfirmed combined forms")
  console.log(jobData, "jobData combined forms")
  console.log(taskId, "taskId combined forms")
  console.log(multipleId, "multipleId combined forms")

  // Bulk Update Form State
  const [selectedField, setSelectedField] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")

  // Task Forward Form State
  const [selectedJobOrder, setSelectedJobOrder] =
    useState<IJobOrderLookup | null>(null)

  const form = useForm<TaskForwardSchemaType>({
    defaultValues: {
      customerId: 0,
      jobOrderId: 0,
    },
  })

  // Helper function to safely invalidate queries and force refetch
  // This ensures tables refresh after task forwarding or bulk updates
  const safeInvalidateQueries = () => {
    const queryKeys = [
      "joborder",
      "agencyRemuneration",
      "consignmentExport",
      "consignmentImport",
      "crewMiscellaneous",
      "crewSignOff",
      "crewSignOn",
      "equipmentUsed",
      "freshWater",
      "landingItems",
      "launchServices",
      "medicalAssistance",
      "otherService",
      "portExpenses",
      "technicianSurveyor",
      "thirdParty",
      "taskCount",
    ]

    // Invalidate all queries that start with each query key
    // This matches queries with jobOrderId like ["portExpenses", "11171"]
    // Using refetchType: "active" ensures active queries (currently used by components) refetch immediately
    queryKeys.forEach((queryKey) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [queryKey], // Match all queries starting with this key, regardless of additional params
          refetchType: "active", // Refetch active queries to refresh tables immediately
        })
      } catch (error) {
        // Silently handle individual query invalidation errors
        console.warn(`Failed to invalidate query ${queryKey}:`, error)
      }
    })
  }

  // Bulk Update Hook
  const bulkUpdateMutation = usePersist<BulkUpdateData>(
    "/operations/bulkupdate"
  )

  // Task Forward Hook
  const taskForwardMutation = usePersist<TaskForwardData>(
    "/operations/savetaskforward"
  )

  // Bulk Update Handlers
  const handleBulkUpdate = async () => {
    if (selectedField && selectedDate && jobData) {
      try {
        const bulkUpdateData: BulkUpdateData = {
          jobOrderId: jobData.jobOrderId,
          moduleId,
          transactionId,
          field: selectedField,
          date: selectedDate,
        }

        const response = (await bulkUpdateMutation.mutateAsync(
          bulkUpdateData
        )) as ApiResponse<BulkUpdateData>

        // Check if the operation was successful (result=1)
        if (response && response.result === 1) {
          // Clear selections FIRST to prevent errors when accessing item.id on undefined items
          if (onClearSelection) {
            onClearSelection()
          }

          // Reset form
          setSelectedField("")
          setSelectedDate("")

          // Use requestAnimationFrame to ensure clear selection completes before invalidating
          // This prevents the table from trying to access item.id on undefined items
          requestAnimationFrame(() => {
            // Use setTimeout to allow React to process the state update from clear selection
            setTimeout(() => {
              safeInvalidateQueries()
            }, 50) // Small delay to allow clear selection state update to complete
          })

          toast.success("Bulk update completed successfully!")

          if (onTaskAdded) {
            onTaskAdded()
          }

          // Close the dialog on success
          if (onCancel) {
            onCancel()
          }
        } else {
          // Operation failed, keep dialog open
          const errorMessage = response?.message || "Bulk update failed"
          toast.error(errorMessage)
        }
      } catch (error) {
        console.error("Error in bulk update:", error)
        toast.error("Failed to perform bulk update")
        // Keep dialog open on error
      }
    }
  }

  // Task Forward Handlers
  const handleJobOrderChange = (jobOrder: IJobOrderLookup | null) => {
    setSelectedJobOrder(jobOrder)
    form.setValue("jobOrderId", jobOrder?.jobOrderId || 0)
  }

  const handleTaskForward = async () => {
    if (selectedJobOrder && jobData) {
      try {
        const taskForwardData: TaskForwardData = {
          multipleId: multipleId || "",
          taskId: taskId || 0,
          previousJobOrderId: jobData.jobOrderId,
          targetJobOrderId: selectedJobOrder.jobOrderId,
          targetJobOrderNo: selectedJobOrder.jobOrderNo || "",
        }

        const response = (await taskForwardMutation.mutateAsync(
          taskForwardData
        )) as ApiResponse<TaskForwardData>

        // Check if the operation was successful (result=1)
        if (response && response.result === 1) {
          console.log(response, "response task forward")
          console.log(taskForwardData, "taskForwardData task forward")

          // Save target job order ID before resetting
          const targetJobOrderId = selectedJobOrder?.jobOrderId

          // Clear selections FIRST to prevent errors when accessing item.id on undefined items
          // This ensures the table clears selectedRowIds before data refreshes
          if (onClearSelection) {
            onClearSelection()
          }

          // Reset form
          setSelectedJobOrder(null)
          form.reset()

          // Use requestAnimationFrame to ensure clear selection completes before invalidating
          // This prevents the table from trying to access item.id on undefined items
          requestAnimationFrame(() => {
            // Use setTimeout to allow React to process the state update from clear selection
            setTimeout(() => {
              // Invalidate queries for both source and target job orders
              // This ensures tables refresh on both the source (where items were removed)
              // and target (where items were added) job orders
              safeInvalidateQueries()
              
              // Also explicitly invalidate queries for the target job order
              // in case the user has it open in another tab/window
              if (targetJobOrderId) {
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    return (
                      Array.isArray(query.queryKey) &&
                      (query.queryKey[0] === "portExpenses" ||
                        query.queryKey[0] === "taskCount" ||
                        query.queryKey[0] === "joborder") &&
                      query.queryKey[1] === String(targetJobOrderId)
                    )
                  },
                  refetchType: "active",
                })
              }
            }, 50) // Small delay to allow clear selection state update to complete
          })

          // toast.success("Task forwarded successfully!")

          if (onTaskAdded) {
            onTaskAdded()
          }

          // Close the dialog on success
          if (onCancel) {
            onCancel()
          }
        } else {
          // Operation failed, keep dialog open
          const errorMessage = response?.message || "Task forward failed"
          toast.error(errorMessage)
        }
      } catch (error) {
        console.error("Error in task forward:", error)
        toast.error("Failed to forward task")
      }
    }
  }

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      deliveredDate: "Delivered Date",
      receivedDate: "Received Date",
      completionDate: "Completion Date",
    }
    return fieldMap[field] || field
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[90vw] max-w-6xl overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            {jobData && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  Job Order: {jobData.jobOrderNo}
                </Badge>
              </div>
            )}
          </div>

          <Tabs defaultValue="bulk-update" className="w-full">
            <TabsList className="flex gap-2">
              <TabsTrigger
                value="bulk-update"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Bulk Update
              </TabsTrigger>
              <TabsTrigger
                value="task-forward"
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Task Forward
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bulk-update" className="mt-6">
              <Card className="border-2 border-dashed border-blue-200 bg-transparent">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Bulk Update Operations
                      </CardTitle>
                      <CardDescription>
                        Update multiple records with a single operation
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="bulkField"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <FileText className="h-4 w-4" />
                        Select Field to Update
                      </Label>
                      <Select
                        value={selectedField}
                        onValueChange={setSelectedField}
                        disabled={isConfirmed}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Choose a field to update" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deliveredDate">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              Delivered Date
                            </div>
                          </SelectItem>
                          <SelectItem value="receivedDate">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              Received Date
                            </div>
                          </SelectItem>
                          <SelectItem value="completionDate">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              Completion Date
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="bulkDate"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Update Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="bulkDate"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="h-11 w-full pr-10"
                          disabled={isConfirmed}
                        />
                        <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedField && selectedDate && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Update Summary
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Will update{" "}
                        <strong>{getFieldDisplayName(selectedField)}</strong> to{" "}
                        <strong>
                          {new Date(selectedDate).toLocaleDateString()}
                        </strong>{" "}
                        for all selected records.
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex gap-3">
                    <Button
                      onClick={handleBulkUpdate}
                      disabled={
                        isConfirmed ||
                        !selectedField ||
                        !selectedDate ||
                        bulkUpdateMutation.isPending
                      }
                      className="h-10 min-w-[140px]"
                      size="default"
                    >
                      {bulkUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update All
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="task-forward" className="mt-6">
              <Card className="border-2 border-dashed border-green-200 bg-transparent">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Task Forward Operations
                      </CardTitle>
                      <CardDescription>
                        Forward tasks to different job orders or customers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Target Job Order
                      </Label>
                      <JobOrderCustomerAutocomplete
                        form={form}
                        name="jobOrderId"
                        label="JobOrder No"
                        isDisabled={isConfirmed}
                        isRequired={true}
                        onChangeEvent={handleJobOrderChange}
                        customerId={jobData?.customerId || 0}
                        jobOrderId={jobData?.jobOrderId || 0}
                      />
                    </div>

                    {/* Current Job Order Info */}
                    {jobData && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Current Job Order
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Forwarding from: <strong>{jobData.jobOrderNo}</strong>
                        </p>
                      </div>
                    )}

                    {/* Target Job Order Info */}
                    {selectedJobOrder && (
                      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            Target Job Order
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          Forwarding to:{" "}
                          <strong>{selectedJobOrder.jobOrderNo}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button
                      onClick={handleTaskForward}
                      disabled={
                        isConfirmed ||
                        !selectedJobOrder ||
                        taskForwardMutation.isPending
                      }
                      className="h-10 min-w-[140px]"
                      size="default"
                    >
                      {taskForwardMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Forwarding...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Forward Task
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CombinedFormsDialog
