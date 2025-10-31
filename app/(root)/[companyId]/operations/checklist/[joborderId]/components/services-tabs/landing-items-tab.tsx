"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
  ILandingItems,
} from "@/interfaces/checklist"
import { LandingItemsSchemaType } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { JobOrder_DebitNote, JobOrder_LandingItems } from "@/lib/api-routes"
import { Task } from "@/lib/operations-utils"
import { useDelete, useGetById, usePersist } from "@/hooks/use-common"
import { useTaskServiceDefaults } from "@/hooks/use-task-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"

import { CombinedFormsDialog } from "../services-combined/combined-forms-dialog"
import DebitNoteDialog from "../services-combined/debit-note-dialog"
import { PurchaseDialog } from "../services-combined/purchase-dialog"
import { LandingItemsForm } from "../services-forms/landing-items-form"
import { LandingItemsTable } from "../services-tables/landing-items-table"

interface LandingItemsTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function LandingItemsTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: LandingItemsTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Landing Items task
  const { defaults: taskDefaults } = useTaskServiceDefaults(Task.LandingItems)
  //states
  const [selectedItem, setSelectedItem] = useState<ILandingItems | undefined>(
    undefined
  )
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCombinedServiceModal, setShowCombinedServiceModal] =
    useState(false)
  const [showDebitNoteModal, setShowDebitNoteModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [debitNoteHd, setDebitNoteHd] = useState<IDebitNoteHd | null>(null)
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    landingItemId: string | null
    jobOrderId: number | null
    landingItemName: string | null
  }>({
    isOpen: false,
    landingItemId: null,
    jobOrderId: null,
    landingItemName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<ILandingItems> | null
    operationType: "create" | "update"
  }>({
    isOpen: false,
    formData: null,
    operationType: "create",
  })

  // State for selected items (for bulk operations)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const jobDataProps = useMemo(
    () => ({
      jobOrderId: jobData?.jobOrderId,
      jobOrderNo: jobData?.jobOrderNo,
      createById: jobData?.createById,
    }),
    [jobData]
  )

  // Data fetching
  const { data: response, refetch } = useGetById<ILandingItems>(
    `${JobOrder_LandingItems.get}`,
    "landingItems",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ILandingItems>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<LandingItemsSchemaType>(
    `${JobOrder_LandingItems.add}`
  )
  const updateMutation = usePersist<LandingItemsSchemaType>(
    `${JobOrder_LandingItems.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_LandingItems.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.generate}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: ILandingItems | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_LandingItems.getById}/${jobOrderId}/${item.landingItemId}`
        )) as ApiResponse<ILandingItems>
        if (response.result === 1 && response.data) {
          const itemData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (itemData) {
            setSelectedItem(itemData)
            setModalMode("view")
            setIsModalOpen(true)
          }
        } else {
          console.error("Failed to load details")
        }
      } catch (error) {
        console.error("An error occurred while fetching details")
        console.error("Error fetching item:", error)
      }
    },
    [jobOrderId]
  )

  const handleDelete = (id: string) => {
    const itemToDelete = data?.find(
      (item) => item.landingItemId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      landingItemId: id,
      jobOrderId: jobData.jobOrderId,
      landingItemName: `Landing Item ${itemToDelete.name}`,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.landingItemId && deleteConfirmation.jobOrderId) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.landingItemId}`
        )
        queryClient.invalidateQueries({ queryKey: ["landingItems"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete landing item:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          landingItemId: null,
          jobOrderId: jobData.jobOrderId,
          landingItemName: null,
        })
      }
    }
  }

  const handleEdit = useCallback(
    async (item: ILandingItems) => {
      const response = (await getData(
        `${JobOrder_LandingItems.getById}/${jobOrderId}/${item.landingItemId}`
      )) as ApiResponse<ILandingItems>
      if (response.result === 1 && response.data) {
        const itemData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (itemData) {
          setSelectedItem(itemData)
          setModalMode("edit")
          setIsModalOpen(true)
        }
      }
    },
    [jobOrderId]
  )

  const handleSubmit = useCallback(
    (formData: Partial<ILandingItems>) => {
      // Show save confirmation instead of directly submitting
      setSaveConfirmation({
        isOpen: true,
        formData,
        operationType: modalMode === "edit" ? "update" : "create",
      })
    },
    [modalMode]
  )

  // Actual save function that gets called after confirmation
  const handleConfirmSave = useCallback(async () => {
    if (!saveConfirmation.formData) return

    try {
      const processedData = {
        ...saveConfirmation.formData,
        date: saveConfirmation.formData.date
          ? typeof saveConfirmation.formData.date === "string"
            ? saveConfirmation.formData.date
            : saveConfirmation.formData.date.toISOString()
          : undefined,
        returnDate: saveConfirmation.formData.returnDate
          ? typeof saveConfirmation.formData.returnDate === "string"
            ? saveConfirmation.formData.returnDate
            : saveConfirmation.formData.returnDate.toISOString()
          : undefined,
      }
      const submitData = { ...processedData, ...jobDataProps }

      let response
      if (saveConfirmation.operationType === "update" && selectedItem) {
        response = await updateMutation.mutateAsync({
          ...submitData,
          landingItemId: selectedItem.landingItemId,
        })
      } else {
        response = await saveMutation.mutateAsync(submitData)
      }

      // Check if API response indicates success (result=1)
      if (response && response.result === 1) {
        // Only close modal and reset state on successful submission
        setIsModalOpen(false)
        setSelectedItem(undefined)
        setModalMode("create")
        refetch()
        onTaskAdded?.()
      } else {
        // If result !== 1, don't close the modal - let user see the error
        console.error(
          "API returned error result:",
          response?.result,
          response?.message
        )
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      // Don't close the modal on error - let user fix the issue and retry
    } finally {
      // Close the save confirmation dialog
      setSaveConfirmation({
        isOpen: false,
        formData: null,
        operationType: "create",
      })
    }
  }, [
    saveConfirmation.formData,
    saveConfirmation.operationType,
    jobDataProps,
    selectedItem,
    updateMutation,
    saveMutation,
    refetch,
    onTaskAdded,
  ])

  const handleCombinedService = useCallback((selectedIds: string[]) => {
    setSelectedItems(selectedIds)
    setShowCombinedServiceModal(true)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (landingItemId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = landingItemId.includes(",")
          ? landingItemId.split(",").map((id) => id.trim())
          : [landingItemId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.landingItemId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Landing item(s) not found")
          return
        }

        // Check if any selected items have existing debit notes
        const itemsWithExistingDebitNotes = foundItems.filter(
          (item) => item.debitNoteId && item.debitNoteId > 0
        )

        // If all selected items have existing debit notes
        if (itemsWithExistingDebitNotes.length === foundItems.length) {
          console.log("All selected items have existing debit notes")

          // For now, open the first item's debit note
          // In the future, you might want to handle multiple debit notes differently
          const firstItem = itemsWithExistingDebitNotes[0]
          setSelectedItem(firstItem)
          setShowDebitNoteModal(true)

          // Fetch the existing debit note data
          const debitNoteResponse = (await getData(
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.LandingItems}/${firstItem.debitNoteId}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("Existing debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("Existing debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData)
          }

          console.log("Opening existing debit note")
          return
        }

        // If some or all items don't have debit notes, create new ones
        console.log(
          "Creating new debit note(s) for selected items:",
          selectedIds
        )

        // Prepare the data for the debit note mutation with comma-separated IDs
        const debitNoteData: IDebitNoteData = {
          multipleId: selectedIds.join(","), // Comma-separated string of all selected IDs
          taskId: Task.LandingItems,
          jobOrderId: jobData.jobOrderId,
          debitNoteNo: debitNoteNo || "",
        }

        console.log("Debit note data to be sent:", debitNoteData)

        // Call the mutation
        const response = await debitNoteMutation.mutateAsync(debitNoteData)

        // Check if the mutation was successful
        if (response.result > 0) {
          // Set the first selected item and open the debit note modal
          setSelectedItem(foundItems[0])
          setShowDebitNoteModal(true)

          // Fetch the debit note data using the returned ID
          const debitNoteResponse = (await getData(
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.LandingItems}/${response.result}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("New debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("New debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData)
          }

          console.log(
            `Debit note created successfully for ${foundItems.length} item(s)`
          )
        }
      } catch (error) {
        console.error("Error handling debit note:", error)
      }
    },
    [debitNoteMutation, data, jobData]
  )
  const handlePurchase = useCallback(() => setShowPurchaseModal(true), [])
  const handleCreateLandingItems = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshLandingItems = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    async (debitNoteId: number) => {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.LandingItems}/${debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["landingItems"] })
        queryClient.invalidateQueries({ queryKey: ["debitNote"] })
        onTaskAdded?.()
        setShowDebitNoteModal(false)
        setDebitNoteHd(null)
      } catch (error) {
        console.error("Failed to delete debit note:", error)
      }
    },
    [debitNoteDeleteMutation, jobData.jobOrderId, queryClient, onTaskAdded]
  )

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <LandingItemsTable
            data={data || []}
            onLandingItemsSelect={handleSelect}
            onDeleteLandingItems={handleDelete}
            onEditLandingItems={handleEdit}
            onCreateLandingItems={handleCreateLandingItems}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshLandingItems}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
          />
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[90vh] w-[60vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Landing Items</DialogTitle>
            <DialogDescription>
              Add or edit landing items details for this job order.
            </DialogDescription>
          </DialogHeader>
          <LandingItemsForm
            jobData={jobData}
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedItem
                : undefined
            }
            taskDefaults={taskDefaults} // Pass defaults to form
            submitAction={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isConfirmed={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>
      {/* Combined Services Modal */}
      <CombinedFormsDialog
        open={showCombinedServiceModal}
        onOpenChange={setShowCombinedServiceModal}
        jobData={jobData}
        moduleId={moduleId}
        transactionId={transactionId}
        isConfirmed={isConfirmed}
        taskId={Task.LandingItems}
        multipleId={selectedItems.join(",")}
        onTaskAdded={onTaskAdded}
        onClearSelection={handleClearSelection}
        onCancel={() => setShowCombinedServiceModal(false)}
        title="Combined Services"
        description="Manage bulk updates and task forwarding operations"
      />

      {/* Debit Note Modal */}
      <DebitNoteDialog
        open={showDebitNoteModal}
        onOpenChange={setShowDebitNoteModal}
        taskId={Task.LandingItems}
        debitNoteHd={debitNoteHd ?? undefined}
        isConfirmed={isConfirmed}
        onDelete={handleDeleteDebitNote}
        title="Debit Note"
        description="Manage debit note details for this landing items."
      />

      {/* Purchase Table Modal */}
      {showPurchaseModal && (
        <PurchaseDialog
          open={showPurchaseModal}
          onOpenChangeAction={setShowPurchaseModal}
          title="Purchase"
          description="Manage purchase details for this landing items."
          jobOrderId={jobData.jobOrderId}
          taskId={Task.LandingItems}
          serviceId={selectedItem?.landingItemId ?? 0}
          isConfirmed={isConfirmed}
        />
      )}

      {/* Save Confirmation */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Confirm Save"
        itemName={
          saveConfirmation.operationType === "update"
            ? `Landing Items ${selectedItem?.name || ""}`
            : "New Landing Items"
        }
        operationType={saveConfirmation.operationType}
        onConfirm={handleConfirmSave}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            formData: null,
            operationType: "create",
          })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Landing Item"
        description="This action cannot be undone. This will permanently delete the landing item from our servers."
        itemName={deleteConfirmation.landingItemName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            landingItemId: null,
            jobOrderId: null,
            landingItemName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
