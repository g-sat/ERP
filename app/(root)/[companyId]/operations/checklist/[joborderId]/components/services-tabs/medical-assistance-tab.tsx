"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
  IMedicalAssistance,
} from "@/interfaces/checklist"
import { MedicalAssistanceSchemaType } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  JobOrder_DebitNote,
  JobOrder_MedicalAssistance,
} from "@/lib/api-routes"
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
import { MedicalAssistanceForm } from "../services-forms/medical-assistance-form"
import { MedicalAssistanceTable } from "../services-tables/medical-assistance-table"

interface MedicalAssistanceTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function MedicalAssistanceTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: MedicalAssistanceTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Medical Assistance task
  const { defaults: taskDefaults } = useTaskServiceDefaults(
    Task.MedicalAssistance
  )
  //states
  const [selectedItem, setSelectedItem] = useState<
    IMedicalAssistance | undefined
  >(undefined)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCombinedServiceModal, setShowCombinedServiceModal] =
    useState(false)
  const [showDebitNoteModal, setShowDebitNoteModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [debitNoteHd, setDebitNoteHd] = useState<IDebitNoteHd | null>(null)

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<IMedicalAssistance> | null
    operationType: "create" | "update"
  }>({
    isOpen: false,
    formData: null,
    operationType: "create",
  })
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    medicalAssistanceId: string | null
    medicalAssistanceName: string | null
    jobOrderId: number | null
  }>({
    isOpen: false,
    medicalAssistanceId: null,
    medicalAssistanceName: null,
    jobOrderId: null,
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
  const { data: response, refetch } = useGetById<IMedicalAssistance>(
    `${JobOrder_MedicalAssistance.get}`,
    "medicalAssistance",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IMedicalAssistance>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<MedicalAssistanceSchemaType>(
    `${JobOrder_MedicalAssistance.add}`
  )
  const updateMutation = usePersist<MedicalAssistanceSchemaType>(
    `${JobOrder_MedicalAssistance.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_MedicalAssistance.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.generate}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: IMedicalAssistance | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_MedicalAssistance.getById}/${jobOrderId}/${item.medicalAssistanceId}`
        )) as ApiResponse<IMedicalAssistance>
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
      (item) => item.medicalAssistanceId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      medicalAssistanceId: id,
      medicalAssistanceName: `Medical Assistance ${itemToDelete.crewName}`,
      jobOrderId: jobData.jobOrderId,
    })
  }

  const handleConfirmDelete = async () => {
    if (
      deleteConfirmation.medicalAssistanceId &&
      deleteConfirmation.jobOrderId
    ) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.medicalAssistanceId}`
        )
        queryClient.invalidateQueries({ queryKey: ["medicalAssistance"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete medical assistance:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          medicalAssistanceId: null,
          jobOrderId: null,
          medicalAssistanceName: null,
        })
      }
    }
  }

  const handleEdit = useCallback(
    async (item: IMedicalAssistance) => {
      const response = (await getData(
        `${JobOrder_MedicalAssistance.getById}/${jobOrderId}/${item.medicalAssistanceId}`
      )) as ApiResponse<IMedicalAssistance>
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
    (formData: Partial<IMedicalAssistance>) => {
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
        admittedDate: saveConfirmation.formData.admittedDate
          ? typeof saveConfirmation.formData.admittedDate === "string"
            ? saveConfirmation.formData.admittedDate
            : saveConfirmation.formData.admittedDate.toISOString()
          : undefined,
        dischargedDate: saveConfirmation.formData.dischargedDate
          ? typeof saveConfirmation.formData.dischargedDate === "string"
            ? saveConfirmation.formData.dischargedDate
            : saveConfirmation.formData.dischargedDate.toISOString()
          : undefined,
      }
      const submitData = { ...processedData, ...jobDataProps }

      let response
      if (saveConfirmation.operationType === "update" && selectedItem) {
        response = await updateMutation.mutateAsync({
          ...submitData,
          medicalAssistanceId: selectedItem.medicalAssistanceId,
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
    async (medicalAssistanceId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = medicalAssistanceId.includes(",")
          ? medicalAssistanceId.split(",").map((id) => id.trim())
          : [medicalAssistanceId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.medicalAssistanceId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Medical assistance(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.MedicalAssistance}/${firstItem.debitNoteId}`
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
          taskId: Task.MedicalAssistance,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.MedicalAssistance}/${response.totalRecords}`
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
  const handleCreateMedicalAssistance = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshMedicalAssistance = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    async (debitNoteId: number) => {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.MedicalAssistance}/${debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["medicalAssistance"] })
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
          <MedicalAssistanceTable
            data={data || []}
            onMedicalAssistanceSelect={handleSelect}
            onDeleteMedicalAssistance={handleDelete}
            onEditMedicalAssistance={handleEdit}
            onCreateMedicalAssistance={handleCreateMedicalAssistance}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshMedicalAssistance}
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
            <DialogTitle>Medical Assistance</DialogTitle>
            <DialogDescription>
              Add or edit medical assistance details for this job order.
            </DialogDescription>
          </DialogHeader>
          <MedicalAssistanceForm
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
          taskId={Task.MedicalAssistance}
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
          taskId={Task.MedicalAssistance}
          debitNoteHd={debitNoteHd ?? undefined}
          isConfirmed={isConfirmed}
          onDelete={handleDeleteDebitNote}
          title="Debit Note"
          description="Manage debit note details for this medical assistance."
          jobOrder={jobData}
        />
      )}

      {/* Purchase Table Modal */}
      {showPurchaseModal && (
        <PurchaseDialog
          open={showPurchaseModal}
          onOpenChangeAction={setShowPurchaseModal}
          title="Purchase"
          description="Manage purchase details for this medical assistance."
          jobOrderId={jobData.jobOrderId}
          taskId={Task.MedicalAssistance}
          serviceId={selectedItem?.medicalAssistanceId ?? 0}
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
            ? `Medical Assistance ${selectedItem?.crewName || ""}`
            : "New Medical Assistance"
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
        title="Delete Medical Assistance"
        description="This action cannot be undone. This will permanently delete the medical assistance from our servers."
        itemName={deleteConfirmation.medicalAssistanceName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            medicalAssistanceId: null,
            jobOrderId: null,
            medicalAssistanceName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
