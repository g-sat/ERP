"use client"

import React, { useCallback, useEffect, useState } from "react"
import { isStatusConfirmed } from "@/helpers/project"
import {
  IDebitNoteItem,
  IJobOrderHd,
  ISaveDebitNoteItem,
} from "@/interfaces/checklist"
import {
  Copy,
  Edit3,
  FileText,
  Printer,
  Receipt,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
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
import { ChecklistDocuments } from "./checklist-documents"
import { ChecklistHistory } from "./checklist-history"
import { ChecklistMain } from "./checklist-main"
import { DebitNoteItemsTable } from "./debit-note-items-table"

interface ChecklistTabsProps {
  jobData: IJobOrderHd
  onClone?: (clonedData: IJobOrderHd) => void
  onUpdateSuccess?: () => void
}

export function ChecklistTabs({
  jobData,
  onClone,
  onUpdateSuccess,
}: ChecklistTabsProps) {
  const [activeTab, setActiveTab] = useState("main")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "clone" | "cancel" | "update"
    title: string
    message: string
  } | null>(null)
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null)

  // Debit Note Dialog State
  const [showDebitNoteDialog, setShowDebitNoteDialog] = useState(false)
  const [debitNoteData, setDebitNoteData] = useState<IDebitNoteItem[]>([])
  const [debitNoteLoading, setDebitNoteLoading] = useState(false)
  const [debitNoteSaving, setDebitNoteSaving] = useState(false)
  const [_debitNoteError, setDebitNoteError] = useState<string | null>(null)

  // Fetch detailed job order data when jobData is available
  const jobOrderId = jobData?.jobOrderId?.toString() || ""

  const {
    data: detailedJobData,
    isLoading,
    error,
    refetch,
  } = useGetJobOrderByIdNo(jobOrderId)

  // Force refetch when component mounts or jobData changes
  // Removed refetch from dependencies to prevent infinite loops
  React.useEffect(() => {
    if (jobData?.jobOrderId && jobData?.jobOrderNo && !isLoading) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobData?.jobOrderId, jobData?.jobOrderNo])

  // Check if detailed data is available and successful
  const isDetailedJobData = detailedJobData?.result === 1

  // Use detailed data if available and successful, otherwise fall back to original jobData
  const currentJobData = isDetailedJobData ? detailedJobData.data : jobData

  // ✅ SAFE: Check if currentJobData exists before accessing statusName
  const isConfirmed = currentJobData?.statusName
    ? isStatusConfirmed(currentJobData.statusName)
    : false

  // console.log("Original jobData:", jobData)
  // console.log("Detailed jobData:", detailedJobData)
  // console.log("Current jobData:", currentJobData)
  // console.log(isConfirmed, "isConfirmed checklist")

  // Handle loading and error states
  if (isLoading) {
    // console.log("Loading detailed job order data...")
  }

  if (error) {
    // console.error("Error fetching detailed job order:", error)
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
      editVersion: 0, // Reset edit version
      // Add any other fields that should be reset for a new record
    }

    // Update the parent component to handle the clone
    if (onClone) {
      // Pass the cloned data back to parent
      // console.log("Cloning job order:", clonedData)
      onClone(clonedData)
    }
  }

  const handleFormSubmit = () => {
    // console.log("handleFormSubmit called, formRef:", formRef)
    if (formRef) {
      // console.log("Calling formRef.requestSubmit()")
      formRef.requestSubmit()
    } else {
      // console.error("formRef is null, cannot submit form")
    }
  }

  // Debit Note Functions
  const fetchDebitNoteData = useCallback(async () => {
    if (!jobOrderId) return

    setDebitNoteLoading(true)
    setDebitNoteError(null)

    try {
      const response = await apiClient.get(
        `/operations/GetDebitNote/${jobOrderId}`
      )
      if (response.data.result === 1) {
        const data = response.data.data || []
        setDebitNoteData(data)
      } else {
        setDebitNoteError("Failed to fetch debit note data")
      }
    } catch (_err) {
      // console.error("Error fetching debit note data:", _err)
      setDebitNoteError("Error fetching debit note data")
    } finally {
      setDebitNoteLoading(false)
    }
  }, [jobOrderId])

  const saveDebitNoteData = async () => {
    if (!debitNoteData.length) return

    setDebitNoteSaving(true)
    setDebitNoteError(null)

    try {
      const saveData: ISaveDebitNoteItem[] = debitNoteData.map((item) => ({
        debitNoteId: item.debitNoteId,
        debitNoteNo: item.debitNoteNo,
        itemNo: item.itemNo,
        updatedItemNo: item.updatedItemNo,
        updatedDebitNoteNo: item.updatedDebitNoteNo,
      }))

      const response = await apiClient.post(
        "/operations/SaveDebitNoteItemNo",
        saveData
      )
      if (response.data.result > 0) {
        // console.log("Debit note data saved successfully")
        toast.success("Debit note data saved successfully")
        setShowDebitNoteDialog(false)
        // Refresh the details tab and main data
        refetch()
      } else {
        setDebitNoteError("Failed to save debit note data")
        toast.error("Failed to save debit note data")
        // Refresh even on error to show current state
        refetch()
      }
    } catch (_err) {
      // console.error("Error saving debit note data:", _err)
      setDebitNoteError("Error saving debit note data")
      toast.error("Error saving debit note data")
      // Refresh even on error to show current state
      refetch()
    } finally {
      setDebitNoteSaving(false)
    }
  }

  // Load data when dialog opens
  useEffect(() => {
    if (showDebitNoteDialog && jobOrderId) {
      fetchDebitNoteData()
    }
  }, [showDebitNoteDialog, jobOrderId, fetchDebitNoteData])

  // Debit Note Table Handlers
  const handleDebitNoteRefresh = useCallback(() => {
    if (jobOrderId) {
      fetchDebitNoteData()
    }
  }, [jobOrderId, fetchDebitNoteData])

  const handleDebitNoteFilterChange = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteSelect = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteCreate = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteEdit = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteDelete = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteBulkDelete = useCallback(() => {
    // No-op for this table
  }, [])

  const handleDebitNoteDataReorder = useCallback(
    (newData: IDebitNoteItem[]) => {
      // Update the local state with the reordered data
      setDebitNoteData(newData)
    },
    []
  )

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="flex gap-2">
            <TabsTrigger value="main">
              <div className="flex items-center gap-1">
                <span className="text-xs">📋</span>
                <span className="text-xs sm:text-sm">Main</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="details">
              <div className="flex items-center gap-1">
                <span className="text-xs">📊</span>
                <span className="text-xs sm:text-sm">Details</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="history">
              <div className="flex items-center gap-1">
                <span className="text-xs">🕒</span>
                <span className="text-xs sm:text-sm">History</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <div className="flex items-center gap-1">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Documents</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action Buttons - Right side */}
        <div className="ml-4 flex items-center gap-2">
          {/* Print button */}

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
                Job Summary
              </DropdownMenuItem>
              {isConfirmed && (
                <DropdownMenuItem onClick={handlePrint}>
                  Invoice Print
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Debit Note No. Button */}
          <Button
            variant="outline"
            size="sm"
            title="Re-Arrange Debit Note No."
            disabled={isConfirmed}
            onClick={() => {
              setShowDebitNoteDialog(true)
            }}
          >
            <Receipt className="mr-1 h-4 w-4" />
          </Button>

          {/* Invoice Create button - only show when status is confirmed */}
          {isConfirmed && (
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(
                currentJobData?.invoiceId &&
                  currentJobData.invoiceId &&
                  parseInt(currentJobData.invoiceId) > 0
              )}
              onClick={() => {
                // console.log("Invoice Create triggered")
              }}
            >
              <FileText className="mr-1 h-4 w-4" />
              Invoice Create
            </Button>
          )}

          {/* Refresh button */}
          {isConfirmed && (
            <Button
              title="Refresh"
              variant="outline"
              size="sm"
              onClick={() => {
                // console.log("Manual refresh triggered")
                refetch()
              }}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Clone button - only show in edit mode */}
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
            <Copy className="h-4 w-4" />
          </Button>

          {/* Cancel button - only show in edit mode */}
          {isConfirmed && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isConfirmed}
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
            disabled={isConfirmed}
            onClick={() => {
              setConfirmAction({
                type: "update",
                title: "Update Job Order",
                message: "Do you want to update this job order?",
              })
              setShowConfirmDialog(true)
            }}
          >
            <Edit3 className="mr-1 h-4 w-4" />
            Update
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsContent value="main" className="mt-0">
          <ChecklistMain
            jobData={currentJobData}
            setFormRef={setFormRef}
            isConfirmed={isConfirmed}
            onUpdateSuccess={() => {
              // Refetch data in ChecklistTabs
              refetch()
              // Refetch data in page.tsx (parent component)
              if (onUpdateSuccess) {
                onUpdateSuccess()
              }
            }}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <ChecklistDetailsForm
            jobData={currentJobData}
            isConfirmed={isConfirmed}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <ChecklistHistory
            jobData={currentJobData}
            isConfirmed={isConfirmed}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <ChecklistDocuments
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
                  // console.log(`${confirmAction.type} confirmed`)

                  switch (confirmAction.type) {
                    case "clone":
                      handleClone()
                      break
                    case "update":
                      handleFormSubmit()
                      break
                    case "cancel":
                      // Cancel job order logic
                      // console.log("Cancelling job order")
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

      {/* Debit Note Dialog */}
      <Dialog open={showDebitNoteDialog} onOpenChange={setShowDebitNoteDialog}>
        <DialogContent className="max-h-[90vh] w-[60vw] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Debit Note Details</DialogTitle>
            <DialogDescription>
              Manage debit note number and item number for this job order.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <DebitNoteItemsTable
              data={debitNoteData}
              isLoading={debitNoteLoading}
              onRefreshAction={handleDebitNoteRefresh}
              onFilterChange={handleDebitNoteFilterChange}
              onSelect={handleDebitNoteSelect}
              onCreateAction={handleDebitNoteCreate}
              onEditAction={handleDebitNoteEdit}
              onDeleteAction={handleDebitNoteDelete}
              onBulkDeleteAction={handleDebitNoteBulkDelete}
              onDataReorder={handleDebitNoteDataReorder}
              moduleId={parseInt(jobOrderId) || 0}
              transactionId={parseInt(jobOrderId) || 0}
              isConfirmed={isConfirmed}
            />
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowDebitNoteDialog(false)}
              >
                Close
              </Button>
              <Button
                onClick={saveDebitNoteData}
                disabled={
                  debitNoteSaving ||
                  debitNoteLoading ||
                  debitNoteData.length === 0
                }
              >
                {debitNoteSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
