import React, { useState } from "react"
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
import JobOrderCustomerAutocomplete from "@/components/ui-custom/autocomplete-joborder-customer"

interface TaskForwardFormValues extends Record<string, unknown> {
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

interface CombinedFormsProps {
  onCancel?: () => void
  jobData?: IJobOrderHd
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
  taskId?: number
  multipleId?: string
  onTaskAdded?: () => void
  onClearSelection?: () => void
  onClose?: () => void
}

const CombinedForms = ({
  onCancel,
  jobData,
  moduleId = 0,
  transactionId = 0,
  isConfirmed,
  taskId,
  multipleId,
  onTaskAdded,
  onClearSelection,
  onClose,
}: CombinedFormsProps) => {
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

  const form = useForm<TaskForwardFormValues>({
    defaultValues: {
      customerId: 0,
      jobOrderId: 0,
    },
  })

  // Bulk Update Hook
  const bulkUpdateMutation = usePersist<BulkUpdateData>("/project/bulkupdate")

  // Task Forward Hook
  const taskForwardMutation = usePersist<TaskForwardData>(
    "/project/savetaskforward"
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
        if (response?.result === 1) {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ["joborder"] })

          // Invalidate all service queries to refresh tables
          queryClient.invalidateQueries({ queryKey: ["agencyRemuneration"] })
          queryClient.invalidateQueries({ queryKey: ["consignmentExport"] })
          queryClient.invalidateQueries({ queryKey: ["consignmentImport"] })
          queryClient.invalidateQueries({ queryKey: ["crewMiscellaneous"] })
          queryClient.invalidateQueries({ queryKey: ["crewSignOff"] })
          queryClient.invalidateQueries({ queryKey: ["crewSignOn"] })
          queryClient.invalidateQueries({ queryKey: ["equipmentUsed"] })
          queryClient.invalidateQueries({ queryKey: ["freshWater"] })
          queryClient.invalidateQueries({ queryKey: ["landingItems"] })
          queryClient.invalidateQueries({ queryKey: ["launchServices"] })
          queryClient.invalidateQueries({ queryKey: ["medicalAssistance"] })
          queryClient.invalidateQueries({ queryKey: ["otherService"] })
          queryClient.invalidateQueries({ queryKey: ["portExpenses"] })
          queryClient.invalidateQueries({ queryKey: ["technicianSurveyor"] })
          queryClient.invalidateQueries({ queryKey: ["thirdParty"] })
          queryClient.invalidateQueries({ queryKey: ["taskCount"] })

          // Reset form
          setSelectedField("")
          setSelectedDate("")

          toast.success("Bulk update completed successfully!")

          if (onTaskAdded) {
            onTaskAdded()
          }

          if (onClearSelection) {
            onClearSelection()
          }

          // Close the dialog on success
          if (onClose) {
            onClose()
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
        if (response?.result === 1) {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ["joborder"] })

          // Invalidate all service queries to refresh tables
          queryClient.invalidateQueries({ queryKey: ["agencyRemuneration"] })
          queryClient.invalidateQueries({ queryKey: ["consignmentExport"] })
          queryClient.invalidateQueries({ queryKey: ["consignmentImport"] })
          queryClient.invalidateQueries({ queryKey: ["crewMiscellaneous"] })
          queryClient.invalidateQueries({ queryKey: ["crewSignOff"] })
          queryClient.invalidateQueries({ queryKey: ["crewSignOn"] })
          queryClient.invalidateQueries({ queryKey: ["equipmentUsed"] })
          queryClient.invalidateQueries({ queryKey: ["freshWater"] })
          queryClient.invalidateQueries({ queryKey: ["landingItems"] })
          queryClient.invalidateQueries({ queryKey: ["launchServices"] })
          queryClient.invalidateQueries({ queryKey: ["medicalAssistance"] })
          queryClient.invalidateQueries({ queryKey: ["otherService"] })
          queryClient.invalidateQueries({ queryKey: ["portExpenses"] })
          queryClient.invalidateQueries({ queryKey: ["technicianSurveyor"] })
          queryClient.invalidateQueries({ queryKey: ["thirdParty"] })
          queryClient.invalidateQueries({ queryKey: ["taskCount"] })

          // Reset form
          setSelectedJobOrder(null)
          form.reset()

          toast.success("Task forwarded successfully!")

          if (onTaskAdded) {
            onTaskAdded()
          }

          if (onClearSelection) {
            onClearSelection()
          }

          // Close the dialog on success
          if (onClose) {
            onClose()
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
          <TabsTrigger value="bulk-update" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Bulk Update
          </TabsTrigger>
          <TabsTrigger value="task-forward" className="flex items-center gap-2">
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
                <Button variant="outline" onClick={onCancel} className="h-10">
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
                <Button variant="outline" onClick={onCancel} className="h-10">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CombinedForms
