"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { calculateDebitNoteSummary } from "@/helpers/debit-note-calculations"
import { IDebitNoteDt, IDebitNoteHd } from "@/interfaces/checklist"
import { DebitNoteDtFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { JobOrder_DebitNote } from "@/lib/api-routes"
import { TaskIdToName } from "@/lib/operations-utils"
import { useDelete, usePersist } from "@/hooks/use-common"
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
}

export function DebitNoteDialog({
  open,
  taskId,
  debitNoteHd,
  isConfirmed,
  title = "Debit Note",
  description = "Manage debit note details for this service.",
  onOpenChange,
  onDelete,
}: DebitNoteDialogProps) {
  const [details, setDetails] = useState<IDebitNoteDt[]>(
    debitNoteHd?.debitNoteDetails ?? []
  )
  const detailsRef = useRef(details)
  console.log(isConfirmed, "isConfirmed debit note")
  console.log("debitNoteHd from debit note", debitNoteHd)
  console.log("details from debit note", debitNoteHd?.debitNoteDetails)

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
    setDetails(debitNoteHd?.debitNoteDetails ?? [])
  }, [debitNoteHd])

  // Update ref when details change
  useEffect(() => {
    detailsRef.current = details
  }, [details])

  // State for delete confirmation (for debit note details)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: DebitNoteDtFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // State to track the selected charge name
  const [selectedChargeName, setSelectedChargeName] = useState<string>("")

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
  }>({
    isOpen: false,
    selectedIds: [],
    count: 0,
  })

  // Define mutations for CRUD operations
  const saveMutation = usePersist<IDebitNoteDt>(
    `${JobOrder_DebitNote.saveDetails}`
  )
  const updateMutation = usePersist<IDebitNoteDt>(
    `${JobOrder_DebitNote.saveDetails}`
  )
  const bulkDeleteMutation = useDelete(`${JobOrder_DebitNote.deleteDetails}`)

  // Handler to open modal for creating a new debit note detail
  const handleCreateDebitNoteDetail = useCallback(() => {
    setModalMode("create")
    setSelectedDebitNoteDetail(undefined)
    setSelectedChargeName("")
  }, [])

  // Handler to open modal for editing a debit note detail
  const handleEditDebitNoteDetail = useCallback(
    (debitNoteDetail: IDebitNoteDt) => {
      console.log("Edit Debit Note Detail:", debitNoteDetail)
      setModalMode("edit")
      setSelectedDebitNoteDetail(debitNoteDetail)
      setSelectedChargeName(debitNoteDetail.chargeName || "")
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

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = useCallback((data: DebitNoteDtFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }, [])

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = useCallback(
    async (data: DebitNoteDtFormValues) => {
      try {
        if (!debitNoteHd?.debitNoteId) {
          console.error("Debit note header not found")
          return
        }

        // Prepare the data for the API call
        const debitNoteDetailData: IDebitNoteDt = {
          debitNoteId: debitNoteHd.debitNoteId,
          debitNoteNo: debitNoteHd.debitNoteNo,
          itemNo: selectedDebitNoteDetail
            ? selectedDebitNoteDetail.itemNo
            : detailsRef.current.length + 1,
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

        if (modalMode === "create") {
          const response = await saveMutation.mutateAsync(debitNoteDetailData)
          if (response.result > 0) {
            // Add new item to local state
            const newItem: IDebitNoteDt = {
              ...debitNoteDetailData,
              itemNo: detailsRef.current.length + 1,
            }
            setDetails((prev) => [...prev, newItem])

            queryClient.invalidateQueries({
              queryKey: [
                JobOrder_DebitNote.getDetails,
                debitNoteHd.jobOrderId,
                taskId,
                debitNoteHd.debitNoteId,
              ],
            })
            queryClient.invalidateQueries({ queryKey: ["debit-note-details"] })
            // Reset form after successful creation
            setSelectedDebitNoteDetail(undefined)
            setSelectedChargeName("")
            setShouldResetForm(true)
          }
        } else if (modalMode === "edit" && selectedDebitNoteDetail) {
          const response = await updateMutation.mutateAsync(debitNoteDetailData)
          if (response.result > 0) {
            // Update existing item in local state
            setDetails((prev) =>
              prev.map((item) =>
                item.itemNo === selectedDebitNoteDetail.itemNo
                  ? { ...item, ...data }
                  : item
              )
            )
            // Reset form after successful update
            queryClient.invalidateQueries({ queryKey: ["debit-note-details"] })
            setSelectedDebitNoteDetail(undefined)
            setSelectedChargeName("")
            setShouldResetForm(true)
          }
        }
      } catch (error) {
        console.error("Error in form submission:", error)
      }
    },
    [
      modalMode,
      selectedDebitNoteDetail,
      debitNoteHd,
      saveMutation,
      updateMutation,
    ]
  )

  // Handler for deleting a debit note detail
  const handleDeleteDebitNoteDetail = useCallback((itemNo: string) => {
    const detailToDelete = detailsRef.current.find(
      (detail) => detail.itemNo.toString() === itemNo
    )
    if (!detailToDelete) return

    // Open delete confirmation dialog with detail information
    setDeleteConfirmation({
      isOpen: true,
      debitNoteId: detailToDelete.itemNo,
      debitNoteNo: `Item ${detailToDelete.itemNo}`,
    })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmation.debitNoteId) {
      // Remove from local state
      setDetails((prev) =>
        prev.filter((item) => item.itemNo !== deleteConfirmation.debitNoteId)
      )
      setDeleteConfirmation({
        isOpen: false,
        debitNoteId: null,
        debitNoteNo: null,
      })
    }
  }, [deleteConfirmation])

  // Handler for deleting the entire debit note - shows confirmation first
  const handleDeleteDebitNote = useCallback(() => {
    if (debitNoteHd?.debitNoteId) {
      setMainDeleteConfirmation({
        isOpen: true,
        debitNoteId: debitNoteHd.debitNoteId,
        debitNoteNo: debitNoteHd.debitNoteNo,
      })
    }
  }, [debitNoteHd])

  // Handler for confirmed main debit note deletion
  const handleConfirmMainDelete = useCallback(() => {
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
      setBulkDeleteConfirmation({
        isOpen: true,
        selectedIds,
        count: selectedIds.length,
      })
    },
    []
  )

  // Handler for confirmed bulk delete
  const handleConfirmBulkDelete = useCallback(async () => {
    if (
      !bulkDeleteConfirmation.selectedIds.length ||
      !debitNoteHd?.debitNoteId
    ) {
      return
    }

    try {
      const multipleId = bulkDeleteConfirmation.selectedIds.join(",")
      const deleteUrl = `${JobOrder_DebitNote.deleteDetails}/${debitNoteHd.jobOrderId}/${taskId}/${debitNoteHd.debitNoteId}/${multipleId}`

      await bulkDeleteMutation.mutateAsync(deleteUrl)

      // Remove deleted items from local state
      setDetails((prev) =>
        prev.filter(
          (item) =>
            !bulkDeleteConfirmation.selectedIds.includes(item.itemNo.toString())
        )
      )

      setBulkDeleteConfirmation({
        isOpen: false,
        selectedIds: [],
        count: 0,
      })
    } catch (error) {
      console.error("Error deleting debit note details:", error)
    }
  }, [bulkDeleteConfirmation, debitNoteHd, taskId, bulkDeleteMutation])

  // Handler for refreshing the table data
  const handleRefresh = useCallback(() => {
    // Reset the form state
    setSelectedDebitNoteDetail(undefined)
    setSelectedChargeName("")
    setShouldResetForm(true)

    // You can add additional refresh logic here if needed
    // For example, refetch data from API, etc.
  }, [])

  // Get task name by task ID from the debit note header
  const taskName = TaskIdToName[taskId] || "Unknown Task"

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
                {debitNoteHd?.debitNoteNo || "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-100 px-3 py-1 whitespace-nowrap text-blue-800 hover:bg-blue-200"
              >
                {debitNoteHd?.debitNoteDate
                  ? new Date(debitNoteHd.debitNoteDate).toLocaleDateString()
                  : "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 px-3 py-1 whitespace-nowrap text-purple-800 hover:bg-purple-200"
              >
                {debitNoteHd?.chargeName || "N/A"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 px-3 py-1 whitespace-nowrap text-orange-800 hover:bg-orange-200"
              >
                {taskName}
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
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
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
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
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
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
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
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 transition-colors hover:bg-red-700"
                  disabled={isConfirmed || !debitNoteHd?.debitNoteId}
                  onClick={handleDeleteDebitNote}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* form Section */}
          <div className="bg-card mb-2 rounded-lg border p-4 shadow-sm">
            <DebitNoteForm
              debitNoteHd={debitNoteHd}
              initialData={
                modalMode === "edit" || modalMode === "view"
                  ? selectedDebitNoteDetail
                  : undefined
              }
              submitAction={handleFormSubmit}
              onCancel={() => setSelectedDebitNoteDetail(undefined)}
              isSubmitting={saveMutation.isPending || updateMutation.isPending}
              isConfirmed={isConfirmed}
              taskId={taskId}
              exchangeRate={debitNoteHd?.exhRate || 1}
              companyId={debitNoteHd?.companyId || 0}
              onChargeChange={setSelectedChargeName}
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
                moduleId={taskId}
                transactionId={taskId}
                isConfirmed={isConfirmed}
              />
            </div>
          </div>

          {/* Delete Confirmation Dialog for Debit Note Detail */}
          <DeleteConfirmation
            open={deleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Debit Note Detail"
            description="This action cannot be undone. This will permanently delete the debit note detail from our servers."
            itemName={deleteConfirmation.debitNoteNo || ""}
            onConfirm={handleConfirmDelete}
            onCancel={() =>
              setDeleteConfirmation({
                isOpen: false,
                debitNoteId: null,
                debitNoteNo: null,
              })
            }
            isDeleting={false}
          />

          {/* Delete Confirmation Dialog for Main Debit Note */}
          <DeleteConfirmation
            open={mainDeleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setMainDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Debit Note"
            description="This action cannot be undone. This will permanently delete the entire debit note and all its details from our servers."
            itemName={mainDeleteConfirmation.debitNoteNo || ""}
            onConfirm={handleConfirmMainDelete}
            onCancel={() =>
              setMainDeleteConfirmation({
                isOpen: false,
                debitNoteId: null,
                debitNoteNo: null,
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
            title={
              modalMode === "create"
                ? "Create Debit Note Detail"
                : "Update Debit Note Detail"
            }
            itemName={
              selectedChargeName ||
              selectedDebitNoteDetail?.chargeName ||
              `Item ${selectedDebitNoteDetail?.itemNo || details.length + 1}`
            }
            operationType={modalMode === "create" ? "create" : "update"}
            onConfirm={() => {
              if (saveConfirmation.data) {
                handleConfirmedFormSubmit(saveConfirmation.data)
              }
              setSaveConfirmation({
                isOpen: false,
                data: null,
              })
            }}
            onCancel={() =>
              setSaveConfirmation({
                isOpen: false,
                data: null,
              })
            }
            isSaving={saveMutation.isPending || updateMutation.isPending}
          />

          {/* Bulk Delete Confirmation Dialog */}
          <DeleteConfirmation
            open={bulkDeleteConfirmation.isOpen}
            onOpenChange={(isOpen) =>
              setBulkDeleteConfirmation((prev) => ({ ...prev, isOpen }))
            }
            title="Delete Selected Items"
            description="This action cannot be undone. This will permanently delete the selected debit note details from our servers."
            itemName={`${bulkDeleteConfirmation.count} selected item${bulkDeleteConfirmation.count !== 1 ? "s" : ""}`}
            onConfirm={handleConfirmBulkDelete}
            onCancel={() =>
              setBulkDeleteConfirmation({
                isOpen: false,
                selectedIds: [],
                count: 0,
              })
            }
            isDeleting={bulkDeleteMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DebitNoteDialog
