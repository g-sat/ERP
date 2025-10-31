"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICrewSignOn,
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { CrewSignOnSchemaType } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { JobOrder_CrewSignOn, JobOrder_DebitNote } from "@/lib/api-routes"
import { Task } from "@/lib/operations-utils"
import { useDelete, useGetById, usePersist } from "@/hooks/use-common"
import { useTaskServiceDefaults } from "@/hooks/use-task-service"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"

import { CombinedFormsDialog } from "../services-combined/combined-forms-dialog"
import DebitNoteDialog from "../services-combined/debit-note-dialog"
import { PurchaseDialog } from "../services-combined/purchase-dialog"
import { CrewSignOnForm } from "../services-forms/crew-sign-on-form"
import { CrewSignOnTable } from "../services-tables/crew-sign-on-table"

interface CrewSignOnTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function CrewSignOnTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: CrewSignOnTabProps) {
  // Get default values for Crew Sign On task
  const { defaults: taskDefaults } = useTaskServiceDefaults(Task.CrewSignOn)

  const jobOrderId = jobData.jobOrderId

  const queryClient = useQueryClient()
  //states
  const [selectedItem, setSelectedItem] = useState<ICrewSignOn | undefined>(
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
  // State for selected items (for bulk operations)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    crewSignOnId: string | null
    jobOrderId: number | null
    crewSignOnName: string | null
  }>({
    isOpen: false,
    crewSignOnId: null,
    jobOrderId: null,
    crewSignOnName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<ICrewSignOn> | null
    operationType: "create" | "update"
  }>({
    isOpen: false,
    formData: null,
    operationType: "create",
  })

  const jobDataProps = useMemo(
    () => ({
      jobOrderId: jobData?.jobOrderId,
      jobOrderNo: jobData?.jobOrderNo,
      createById: jobData?.createById,
    }),
    [jobData]
  )

  // Data fetching
  const { data: response, refetch } = useGetById<ICrewSignOn>(
    `${JobOrder_CrewSignOn.get}`,
    "crewSignOn",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ICrewSignOn>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<CrewSignOnSchemaType>(
    `${JobOrder_CrewSignOn.add}`
  )
  const updateMutation = usePersist<CrewSignOnSchemaType>(
    `${JobOrder_CrewSignOn.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_CrewSignOn.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.generate}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: ICrewSignOn | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_CrewSignOn.getById}/${jobOrderId}/${item.crewSignOnId}`
        )) as ApiResponse<ICrewSignOn>
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
      (item) => item.crewSignOnId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      crewSignOnId: id,
      jobOrderId: jobData.jobOrderId,
      crewSignOnName: `Crew Sign On ${itemToDelete.crewName}`,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.crewSignOnId && deleteConfirmation.jobOrderId) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.crewSignOnId}`
        )
        queryClient.invalidateQueries({ queryKey: ["crewSignOn"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete crew sign on:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          crewSignOnId: null,
          jobOrderId: null,
          crewSignOnName: null,
        })
      }
    }
  }

  const handleEdit = useCallback(
    async (item: ICrewSignOn) => {
      const response = (await getData(
        `${JobOrder_CrewSignOn.getById}/${jobOrderId}/${item.crewSignOnId}`
      )) as ApiResponse<ICrewSignOn>
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
    (formData: Partial<ICrewSignOn>) => {
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
      }
      const submitData = { ...processedData, ...jobDataProps }

      let response
      if (saveConfirmation.operationType === "update" && selectedItem) {
        response = await updateMutation.mutateAsync({
          ...submitData,
          crewSignOnId: selectedItem.crewSignOnId,
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

  // Function to clear selection after operations
  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (crewSignOnId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = crewSignOnId.includes(",")
          ? crewSignOnId.split(",").map((id) => id.trim())
          : [crewSignOnId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.crewSignOnId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Crew sign on(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.CrewSignOn}/${firstItem.debitNoteId}`
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
          taskId: Task.CrewSignOn,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.CrewSignOn}/${response.result}`
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
  const handleCreate = () => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleRefreshCrewSignOn = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    async (debitNoteId: number) => {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.CrewSignOn}/${debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["crewSignOn"] })
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
          <CrewSignOnTable
            data={data || []}
            onCrewSignOnSelect={handleSelect}
            onDeleteCrewSignOn={handleDelete}
            onEditCrewSignOn={handleEdit}
            onCreateCrewSignOn={handleCreate}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshCrewSignOn}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
          />
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[80vh] w-[60vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle>Crew Sign On</DialogTitle>
              <Badge
                variant={
                  modalMode === "create"
                    ? "default"
                    : modalMode === "edit"
                      ? "secondary"
                      : "outline"
                }
                className={
                  modalMode === "create"
                    ? "border-green-200 bg-green-100 text-green-800"
                    : modalMode === "edit"
                      ? "border-orange-200 bg-orange-100 text-orange-800"
                      : "border-blue-200 bg-blue-100 text-blue-800"
                }
              >
                {modalMode === "create"
                  ? "New"
                  : modalMode === "edit"
                    ? "Edit"
                    : "View"}
              </Badge>
            </div>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new crew sign on to this job order."
                : modalMode === "edit"
                  ? "Update the crew sign on details."
                  : "View crew sign on details (read-only)."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CrewSignOnForm
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
      {showCombinedServiceModal && (
        <CombinedFormsDialog
          open={showCombinedServiceModal}
          onOpenChange={setShowCombinedServiceModal}
          jobData={jobData}
          moduleId={moduleId}
          transactionId={transactionId}
          isConfirmed={isConfirmed}
          taskId={Task.CrewSignOn}
          multipleId={selectedItems.join(",")}
          onTaskAdded={onTaskAdded}
          onClearSelection={handleClearSelection}
          onCancel={() => setShowCombinedServiceModal(false)}
          title="Combined Services"
          description="Manage bulk updates and task forwarding operations"
        />
      )}

      {/* Debit Note Modal */}
      {showDebitNoteModal && (
        <DebitNoteDialog
          open={showDebitNoteModal}
          onOpenChange={setShowDebitNoteModal}
          taskId={Task.CrewSignOn}
          debitNoteHd={debitNoteHd ?? undefined}
          isConfirmed={isConfirmed}
          onDelete={handleDeleteDebitNote}
          title="Debit Note"
          description="Manage debit note details for this crew sign on."
          jobOrder={jobData}
        />
      )}

      {/* Purchase Table Modal */}
      {showPurchaseModal && (
        <PurchaseDialog
          open={showPurchaseModal}
          onOpenChangeAction={setShowPurchaseModal}
          title="Purchase"
          description="Manage purchase details for this crew sign on."
          jobOrderId={jobData.jobOrderId}
          taskId={Task.CrewSignOn}
          serviceId={selectedItem?.crewSignOnId ?? 0}
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
            ? `Crew Sign On ${selectedItem?.crewName || ""}`
            : "New Crew Sign On"
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
        title="Delete Crew Sign On"
        description="This action cannot be undone. This will permanently delete the crew sign on from our servers."
        itemName={deleteConfirmation.crewSignOnName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            crewSignOnId: null,
            jobOrderId: null,
            crewSignOnName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
