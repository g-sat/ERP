"use client"

import React, { useState } from "react"
import { isStatusConfirmed } from "@/helpers/project"
import { IJobOrderHd } from "@/interfaces/checklist"
import {
  Copy,
  Edit3,
  FileText,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  X,
} from "lucide-react"

import { useGetJobOrderByIdNo } from "@/hooks/use-checklist"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ChecklistDetailsForm } from "./checklist-details-form"
import { ChecklistHistory } from "./checklist-history"
import { ChecklistMain } from "./checklist-main"

interface ChecklistTabsProps {
  jobData: IJobOrderHd
  onSuccess?: () => void
  isEdit?: boolean
  companyId: string
  isNewRecord?: boolean
  onClone?: (clonedData: IJobOrderHd) => void
}

export function ChecklistTabs({
  jobData,
  onSuccess,
  isEdit = false,
  companyId,
  isNewRecord = false,
  onClone,
}: ChecklistTabsProps) {
  const [activeTab, setActiveTab] = useState("main")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "reset" | "clone" | "cancel" | "update"
    title: string
    message: string
  } | null>(null)
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null)

  // Fetch detailed job order data when jobData is available
  const jobOrderId = jobData?.jobOrderId?.toString() || ""
  const jobOrderNo = jobData?.jobOrderNo || ""

  console.log("ChecklistTabs - jobOrderId:", jobOrderId)
  console.log("ChecklistTabs - jobOrderNo:", jobOrderNo)

  const {
    data: detailedJobData,
    isLoading,
    error,
    refetch,
  } = useGetJobOrderByIdNo(jobOrderId, companyId)

  // Force refetch when component mounts or jobData changes
  React.useEffect(() => {
    if (jobData?.jobOrderId && jobData?.jobOrderNo) {
      refetch()
    }
  }, [jobData?.jobOrderId, jobData?.jobOrderNo, refetch])

  // Check if detailed data is available and successful
  const isDetailedJobData = detailedJobData?.result === 1

  // Use detailed data if available and successful, otherwise fall back to original jobData
  const currentJobData = isDetailedJobData ? detailedJobData.data : jobData

  const isConfirmed = isStatusConfirmed(currentJobData.statusName)
    ? true
    : false

  console.log("Original jobData:", jobData)
  console.log("Detailed jobData:", detailedJobData)
  console.log("Current jobData:", currentJobData)
  console.log(isConfirmed, "isConfirmed checklist")

  // Handle loading and error states
  if (isLoading) {
    console.log("Loading detailed job order data...")
  }

  if (error) {
    console.error("Error fetching detailed job order:", error)
  }

  const handlePrint = () => {
    /* ... */
  }

  const handleClone = () => {
    // Create a new job order with the same data but reset certain fields
    const clonedData = {
      ...currentJobData,
      jobOrderId: 0, // Reset ID for new record
      jobOrderNo: "", // Reset job order number
      jobOrderDate: new Date().toISOString().split("T")[0], // Set to today
      editVersion: "", // Reset edit version
      // Add any other fields that should be reset for a new record
    }

    // Update the parent component to handle the clone
    if (onClone) {
      // Pass the cloned data back to parent
      console.log("Cloning job order:", clonedData)
      onClone(clonedData)
    }
  }

  const handleFormSubmit = () => {
    if (formRef) {
      formRef.requestSubmit()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="flex gap-2">
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger
              value="details"
              disabled={isNewRecord}
              className={isNewRecord ? "cursor-not-allowed opacity-50" : ""}
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="history"
              disabled={isNewRecord}
              className={isNewRecord ? "cursor-not-allowed opacity-50" : ""}
            >
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action Buttons - Right side */}
        <div className="ml-4 flex items-center gap-2">
          {/* Print button */}
          {isEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Printer className="mr-1 h-4 w-4" />
                  Print
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrint}>
                  Checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  Purchase List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  Account List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  Job Summary
                </DropdownMenuItem>
                {isConfirmed && (
                  <DropdownMenuItem onClick={handlePrint}>
                    Invoice Print
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Invoice Create button - only show when status is confirmed */}
          {isEdit && isConfirmed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Invoice Create triggered")
              }}
            >
              <FileText className="mr-1 h-4 w-4" />
              Invoice Create
            </Button>
          )}

          {/* Refresh button */}
          {isEdit && (
            <Button
              title="Refresh"
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Manual refresh triggered")
                refetch()
              }}
            >
              <RefreshCcw className="mr-1 h-4 w-4" />
            </Button>
          )}

          {/* Reset button - only show in create mode */}
          {!isEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmAction({
                  type: "reset",
                  title: "Reset Form",
                  message:
                    "Do you want to reset the form? All entered data will be lost.",
                })
                setShowConfirmDialog(true)
              }}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          )}

          {/* Clone button - only show in edit mode */}
          {isEdit && (
            <Button
              title="Clone"
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmAction({
                  type: "clone",
                  title: "Clone Record",
                  message:
                    "Do you want to clone this job order? A new record will be created.",
                })
                setShowConfirmDialog(true)
              }}
            >
              <Copy className="mr-1 h-4 w-4" />
            </Button>
          )}

          {/* Cancel button - only show in edit mode */}
          {isEdit && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmAction({
                  type: "cancel",
                  title: "Cancel Job Order",
                  message:
                    "Do you want to cancel this job order? This action cannot be undone.",
                })
                setShowConfirmDialog(true)
              }}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}

          {/* Submit/Update Button */}
          <Button
            size="sm"
            onClick={() => {
              if (isEdit) {
                setConfirmAction({
                  type: "update",
                  title: "Update Job Order",
                  message: "Do you want to update this job order?",
                })
                setShowConfirmDialog(true)
              } else {
                // Submit functionality - trigger form submission
                handleFormSubmit()
              }
            }}
          >
            {isEdit ? (
              <>
                <Edit3 className="mr-1 h-4 w-4" />
                Update
              </>
            ) : (
              <>
                <Save className="mr-1 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsContent value="main" className="mt-0">
          <ChecklistMain
            jobData={currentJobData}
            onSuccess={onSuccess}
            isEdit={isEdit}
            setFormRef={setFormRef}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <ChecklistDetailsForm
            jobData={currentJobData}
            isConfirmed={isConfirmed}
            companyId={companyId}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <ChecklistHistory
            jobData={currentJobData}
            isConfirmed={isConfirmed}
          />
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              No
            </Button>
            <Button
              onClick={() => {
                if (confirmAction) {
                  console.log(`${confirmAction.type} confirmed`)

                  switch (confirmAction.type) {
                    case "clone":
                      handleClone()
                      break
                    case "update":
                      handleFormSubmit()
                      break
                    case "reset":
                      // Reset form logic
                      console.log("Resetting form")
                      break
                    case "cancel":
                      // Cancel job order logic
                      console.log("Cancelling job order")
                      break
                  }
                }
                setShowConfirmDialog(false)
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
