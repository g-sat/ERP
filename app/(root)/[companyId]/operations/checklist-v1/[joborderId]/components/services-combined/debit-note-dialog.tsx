"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { calculateDebitNoteSummary } from "@/helpers/debit-note-calculations"
import { IDebitNoteDt, IDebitNoteHd } from "@/interfaces/checklist"
import {
  DebitNoteDtFormValues,
  DebitNoteHdFormValues,
} from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import {
  DollarSign,
  ListChecks,
  Printer,
  Receipt,
  Save,
  Trash,
  TrendingUp,
} from "lucide-react"

import { JobOrder_DebitNote } from "@/lib/api-routes"
import { TaskIdToName } from "@/lib/operations-utils"
import { usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"

import DebitNoteForm from "./debit-note-form"
import DebitNoteTable from "./debit-note-table"

interface DebitNoteDialogProps {
  open: boolean
  taskId: number
  debitNoteHd?: IDebitNoteHd
  isConfirmed?: boolean
  title?: string
  description?: string
  onOpenChange: (open: boolean) => void
  onDelete?: (debitNoteId: number) => void
  onUpdateHeader?: (updatedHeader: IDebitNoteHd) => void
}

export default function DebitNoteDialog({
  open,
  taskId,
  debitNoteHd,
  isConfirmed,
  title = "Debit Note",
  description = "Manage debit note details for this service.",
  onOpenChange,
  onDelete,
  onUpdateHeader,
}: DebitNoteDialogProps) {
  const [debitNoteHdState, setDebitNoteHdState] = useState<IDebitNoteHd>(
    debitNoteHd ?? ({} as IDebitNoteHd)
  )

  const [details, setDetails] = useState<IDebitNoteDt[]>(
    debitNoteHd?.data_details ?? []
  )

  const detailsRef = useRef(details)

  // State for modal and selected debit note detail
  const [selectedDebitNoteDetail, setSelectedDebitNoteDetail] = useState<
    IDebitNoteDt | undefined
  >(undefined)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const queryClient = useQueryClient()

  // Update details when debitNoteHd changes
  useEffect(() => {
    setDetails(debitNoteHd?.data_details ?? [])
  }, [debitNoteHd])

  // Update ref when details change
  useEffect(() => {
    detailsRef.current = details
  }, [details])

  // State for delete confirmation (for debit note details)
  const [detailsDeleteConfirmation, setDetailsDeleteConfirmation] = useState<{
    isOpen: boolean
    debitNoteId: number | null
    debitNoteNo: string | null
  }>({
    isOpen: false,
    debitNoteId: null,
    debitNoteNo: null,
  })

  // State for main debit note delete confirmation
  const [mainDeleteConfirmation, setMainDeleteConfirmation] = useState<{
    isOpen: boolean
    debitNoteId: number | null
    debitNoteNo: string | null
  }>({
    isOpen: false,
    debitNoteId: null,
    debitNoteNo: null,
  })

  // State to trigger form reset
  const [shouldResetForm, setShouldResetForm] = useState<boolean>(false)

  // Reset the shouldResetForm flag after it's been used
  useEffect(() => {
    if (shouldResetForm) {
      setShouldResetForm(false)
    }
  }, [shouldResetForm])

  // State for bulk delete confirmation
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<{
    isOpen: boolean
    selectedIds: string[]
    count: number
    itemsList?: string
  }>({
    isOpen: false,
    selectedIds: [],
    count: 0,
    itemsList: "",
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
  }>({
    isOpen: false,
  })

  const saveMutation = usePersist<DebitNoteHdFormValues>(
    `${JobOrder_DebitNote.add}`
  )

  // Handler to open modal for creating a new debit note detail
  const handleCreateDebitNoteDetail = useCallback(() => {
    setModalMode("create")
    setSelectedDebitNoteDetail(undefined)
  }, [])

  // Handler to open modal for editing a debit note detail
  const handleEditDebitNoteDetail = useCallback(
    (debitNoteDetail: IDebitNoteDt) => {
      setModalMode("edit")
      setSelectedDebitNoteDetail(debitNoteDetail)
    },
    []
  )

  // Handler to open modal for viewing a debit note detail
  const handleViewDebitNoteDetail = useCallback(
    (debitNoteDetail: IDebitNoteDt | null) => {
      if (!debitNoteDetail) return
      setModalMode("view")
      setSelectedDebitNoteDetail(debitNoteDetail)
    },
    []
  )

  // Handler for form submission (create or edit) - add to table directly
  const handleFormSubmit = useCallback(
    (data: DebitNoteDtFormValues) => {
      // Add new item to local state directly (no confirmation needed for add)
      const newItem: IDebitNoteDt = {
        debitNoteId: debitNoteHd?.debitNoteId || 0,
        debitNoteNo: debitNoteHd?.debitNoteNo || "",
        itemNo: detailsRef.current.length + 1,
        taskId: data.taskId,
        chargeId: data.chargeId,
        glId: data.glId,
        qty: data.qty,
        unitPrice: data.unitPrice,
        totLocalAmt: data.totLocalAmt,
        totAmt: data.totAmt,
        gstId: data.gstId,
        gstPercentage: data.gstPercentage,
        gstAmt: data.gstAmt,
        totAftGstAmt: data.totAftGstAmt,
        remarks: data.remarks,
        editVersion: data.editVersion,
        isServiceCharge: data.isServiceCharge,
        serviceCharge: data.serviceCharge,
      }

      setDetails((prev) => [...prev, newItem])

      // Reset form after successful addition
      setSelectedDebitNoteDetail(undefined)
      setShouldResetForm(true)
    },
    [debitNoteHd]
  )

  // Handler for deleting a debit note detail
  const handleDeleteDebitNoteDetail = useCallback((itemNo: string) => {
    const detailToDelete = detailsRef.current.find(
      (detail) => detail.itemNo.toString() === itemNo
    )

    if (!detailToDelete) return

    // Open delete confirmation dialog with detail information
    setDetailsDeleteConfirmation({
      isOpen: true,
      debitNoteId: detailToDelete.itemNo,
      debitNoteNo: `Item ${detailToDelete.itemNo}${detailToDelete.remarks ? ` - ${detailToDelete.remarks}` : ""}`,
    })
  }, [])

  const handleConfirmDeleteDetails = useCallback(() => {
    if (detailsDeleteConfirmation.debitNoteId) {
      // Remove from local state and rearrange itemNo
      setDetails((prev) => {
        const filtered = prev.filter(
          (item) => item.itemNo !== detailsDeleteConfirmation.debitNoteId
        )
        // Rearrange itemNo to maintain sequential order (1, 2, 3, 4...)
        return filtered.map((item, index) => ({
          ...item,
          itemNo: index + 1,
        }))
      })
      setDetailsDeleteConfirmation({
        isOpen: false,
        debitNoteId: null,
        debitNoteNo: null,
      })
    }
  }, [detailsDeleteConfirmation])

  // Handler for saving the debit note
  const handleSaveDebitNote = useCallback(async () => {
    try {
      if (!debitNoteHdState?.debitNoteId) {
        console.error("Debit note header not found")
        return
      }

      // Calculate totals from details
      const totalAmount = details.reduce(
        (sum, detail) => sum + (detail.totAmt || 0),
        0
      )
      const totalGstAmount = details.reduce(
        (sum, detail) => sum + (detail.gstAmt || 0),
        0
      )
      const totalAfterGst = details.reduce(
        (sum, detail) => sum + (detail.totAftGstAmt || 0),
        0
      )

      // Create the complete debit note header with details
      const newDebitNoteHd: DebitNoteHdFormValues = {
        debitNoteId: debitNoteHdState.debitNoteId,
        debitNoteNo: debitNoteHdState.debitNoteNo,
        jobOrderId: debitNoteHdState.jobOrderId,
        debitNoteDate: debitNoteHdState.debitNoteDate,
        itemNo: debitNoteHdState.itemNo,
        taskId: debitNoteHdState.taskId,
        serviceId: debitNoteHdState.serviceId,
        chargeId: debitNoteHdState.chargeId,
        currencyId: debitNoteHdState.currencyId,
        exhRate: debitNoteHdState.exhRate,
        glId: debitNoteHdState.glId,
        taxableAmt: debitNoteHdState.taxableAmt,
        nonTaxableAmt: debitNoteHdState.nonTaxableAmt,
        editVersion: debitNoteHdState.editVersion,
        totAmt: totalAmount,
        gstAmt: totalGstAmount,
        totAftGstAmt: totalAfterGst,
        isLocked: debitNoteHdState.isLocked,
        data_details: details, // Include all details
      }

      // Save the complete debit note (header + details) using the new API
      const response = await saveMutation.mutateAsync(newDebitNoteHd)

      if (response.result > 0) {
        // Close the save confirmation dialog
        setSaveConfirmation({ isOpen: false })

        // Update local state with response data if available
        if (response.data && "data_details" in response.data) {
          const responseData = response.data as unknown as {
            data_details: IDebitNoteDt[]
          } & IDebitNoteHd

          setDebitNoteHdState(responseData)

          // Update details
          setDetails(responseData.data_details)

          // Update header if callback is provided
          if (onUpdateHeader) {
            onUpdateHeader(responseData)
          }
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [
            JobOrder_DebitNote.getDetails,
            debitNoteHdState.jobOrderId,
            taskId,
            debitNoteHdState.debitNoteId,
          ],
        })
        queryClient.invalidateQueries({ queryKey: ["debit-note-details"] })
      }
    } catch (error) {
      console.error("Error saving debit note:", error)
      alert("Error saving debit note. Please try again.")
    }
  }, [
    debitNoteHdState,
    details,
    saveMutation,
    queryClient,
    taskId,
    onUpdateHeader,
  ])

  // Handler for deleting the entire debit note - shows confirmation first
  const handleDeleteDebitNote = useCallback(() => {
    if (debitNoteHdState?.debitNoteId) {
      setMainDeleteConfirmation({
        isOpen: true,
        debitNoteId: debitNoteHdState.debitNoteId,
        debitNoteNo: debitNoteHdState.debitNoteNo,
      })
    }
  }, [debitNoteHdState])

  // Handler for confirmed main debit note deletion
  const handleConfirmMainDeleteMain = useCallback(() => {
    if (mainDeleteConfirmation.debitNoteId && onDelete) {
      onDelete(mainDeleteConfirmation.debitNoteId)
      setMainDeleteConfirmation({
        isOpen: false,
        debitNoteId: null,
        debitNoteNo: null,
      })
    }
  }, [mainDeleteConfirmation, onDelete])

  // Handler for bulk delete of debit note details
  const handleBulkDeleteDebitNoteDetails = useCallback(
    (selectedIds: string[]) => {
      // Get details for selected items
      const selectedDetails = detailsRef.current.filter((detail) =>
        selectedIds.includes(detail.itemNo.toString())
      )

      // Create numbered list of items with remarks
      const itemsList = selectedDetails
        .map((detail, index) => {
          const itemInfo = `Item ${detail.itemNo}`
          const remarks = detail.remarks?.trim()
          return `${index + 1}. ${itemInfo}${remarks ? ` - ${remarks}` : ""}`
        })
        .join("<br/>")

      setBulkDeleteConfirmation({
        isOpen: true,
        selectedIds,
        count: selectedIds.length,
        itemsList, // Add the formatted list
      })
    },
    []
  )

  // Handler for confirmed bulk delete
  const handleConfirmBulkDeleteBulk = useCallback(() => {
    if (!bulkDeleteConfirmation.selectedIds.length) {
      return
    }

    // Remove deleted items from local state and rearrange itemNo
    setDetails((prev) => {
      const filtered = prev.filter(
        (item) =>
          !bulkDeleteConfirmation.selectedIds.includes(item.itemNo.toString())
      )
      // Rearrange itemNo to maintain sequential order (1, 2, 3, 4...)
      return filtered.map((item, index) => ({
        ...item,
        itemNo: index + 1,
      }))
    })

    setBulkDeleteConfirmation({
      isOpen: false,
      selectedIds: [],
      count: 0,
    })
  }, [bulkDeleteConfirmation])

  // Handler for refreshing the table data
  const handleRefresh = useCallback(() => {
    // Reset the form state
    setSelectedDebitNoteDetail(undefined)
    setShouldResetForm(true)
  }, [])

  // Handler for data reordering
  const handleDataReorder = useCallback((newData: IDebitNoteDt[]) => {
    // Update itemNo to reflect the new order (1, 2, 3, 4, 5, 6...)
    const updatedData = newData.map((item, index) => ({
      ...item,
      itemNo: index + 1,
    }))

    setDetails(updatedData)
  }, [])

  // Get task name by task ID from the debit note header
  const taskName =
    TaskIdToName[debitNoteHdState?.taskId || taskId] || "Unknown Task"

  // Calculate summary totals using helper function
  const summaryTotals = calculateDebitNoteSummary(details, { amtDec: 2 })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
            <div className="mr-10 flex flex-nowrap gap-2 overflow-x-auto">
              <Badge
                variant="secondary"
                className="bg-green-100 px-3 py-1 whitespace-nowrap text-green-800 hover:bg-green-200"
              >
                {debitNoteHdState?.debitNoteNo || "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-100 px-3 py-1 whitespace-nowrap text-blue-800 hover:bg-blue-200"
              >
                {debitNoteHdState?.debitNoteDate
                  ? new Date(
                      debitNoteHdState.debitNoteDate
                    ).toLocaleDateString()
                  : "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 px-3 py-1 whitespace-nowrap text-purple-800 hover:bg-purple-200"
              >
                {debitNoteHdState?.chargeName || "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 px-3 py-1 whitespace-nowrap text-orange-800 hover:bg-orange-200"
              >
                {debitNoteHdState?.taskName || "N/A"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="@container">
          {/* Summary Section */}
          <div className="bg-card mb-2 rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col space-y-5 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Financial Summary */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Total Amount</p>
                    <p className="text-lg font-bold">
                      ${summaryTotals.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">VAT Amount</p>
                    <p className="text-lg font-bold">
                      ${summaryTotals.vatAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Total After VAT</p>
                    <p className="text-lg font-bold">
                      ${summaryTotals.totalAfterVat.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="sm" variant="outline">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Bulk Charges
                </Button>

                <Button size="sm" variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isConfirmed || !debitNoteHdState?.debitNoteId}
                  onClick={handleDeleteDebitNote}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={isConfirmed || !debitNoteHdState?.debitNoteId}
                  onClick={() => setSaveConfirmation({ isOpen: true })}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* form Section */}
          <div className="bg-card mb-2 rounded-lg border p-4 shadow-sm">
            <DebitNoteForm
              debitNoteHd={debitNoteHdState}
              initialData={
                modalMode === "edit" || modalMode === "view"
                  ? selectedDebitNoteDetail
                  : undefined
              }
              submitAction={handleFormSubmit}
              onCancel={() => setSelectedDebitNoteDetail(undefined)}
              isSubmitting={false}
              isConfirmed={isConfirmed}
              taskId={taskId}
              exchangeRate={debitNoteHdState?.exhRate || 1}
              companyId={debitNoteHdState?.companyId || 0}
              onChargeChange={() => {}}
              shouldReset={shouldResetForm}
            />
          </div>

          {/* Table Section */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4">
              <DebitNoteTable
                data={details}
                onSelect={handleViewDebitNoteDetail}
                onEdit={handleEditDebitNoteDetail}
                onDelete={handleDeleteDebitNoteDetail}
                onBulkDelete={handleBulkDeleteDebitNoteDetails}
                onCreate={handleCreateDebitNoteDetail}
                onRefresh={handleRefresh}
                onFilterChange={() => {}}
                onDataReorder={handleDataReorder}
                moduleId={taskId}
                transactionId={taskId}
                isConfirmed={isConfirmed}
              />
            </div>
          </div>

          {/* Delete Confirmation Dialog for Main Debit Note */}
          <DeleteConfirmation
            open={mainDeleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setMainDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Debit Note"
            description="This action cannot be undone. This will permanently delete the entire debit note and all its details from our servers."
            itemName={mainDeleteConfirmation.debitNoteNo || ""}
            onConfirm={handleConfirmMainDeleteMain}
            onCancel={() =>
              setMainDeleteConfirmation({
                isOpen: false,
                debitNoteId: null,
                debitNoteNo: null,
              })
            }
            isDeleting={false}
          />

          {/* Delete Confirmation Dialog for Debit Note Detail */}
          <DeleteConfirmation
            open={detailsDeleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setDetailsDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Debit Note Detail"
            description="This action cannot be undone. This will permanently delete the debit note detail from our servers."
            itemName={detailsDeleteConfirmation.debitNoteNo || ""}
            onConfirm={handleConfirmDeleteDetails}
            onCancel={() =>
              setDetailsDeleteConfirmation({
                isOpen: false,
                debitNoteId: null,
                debitNoteNo: null,
              })
            }
            isDeleting={false}
          />

          {/* Bulk Delete Confirmation Dialog */}
          <DeleteConfirmation
            open={bulkDeleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setBulkDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Selected Items"
            description="This action cannot be undone. This will permanently delete the selected debit note details from our servers."
            itemName={
              bulkDeleteConfirmation.itemsList ||
              `${bulkDeleteConfirmation.count} selected item${bulkDeleteConfirmation.count !== 1 ? "s" : ""}`
            }
            onConfirm={handleConfirmBulkDeleteBulk}
            onCancel={() =>
              setBulkDeleteConfirmation({
                isOpen: false,
                selectedIds: [],
                count: 0,
                itemsList: "",
              })
            }
            isDeleting={false}
          />

          {/* Save Confirmation Dialog */}
          <SaveConfirmation
            open={saveConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setSaveConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Save Debit Note"
            operationType={"update"}
            itemName={`Debit Note ${debitNoteHd?.debitNoteNo || ""}`}
            onConfirm={handleSaveDebitNote}
            onCancel={() =>
              setSaveConfirmation({
                isOpen: false,
              })
            }
            isSaving={saveMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
