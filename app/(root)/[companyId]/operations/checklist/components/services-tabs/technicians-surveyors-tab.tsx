"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
  ITechnicianSurveyor,
} from "@/interfaces/checklist"
import { TechnicianSurveyorFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  JobOrder_DebitNote,
  JobOrder_TechnicianSurveyor,
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
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"

import CombinedFormsDialog from "../services-combined/combined-forms-dialog"
import DebitNoteDialog from "../services-combined/debit-note-dialog"
import PurchaseDialog from "../services-combined/purchase-dialog"
import { TechniciansSurveyorsForm } from "../services-forms/technicians-surveyors-form"
import { TechnicianSurveyorTable } from "../services-tables/technician-surveyor-table"

interface TechniciansSurveyorsTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function TechniciansSurveyorsTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: TechniciansSurveyorsTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Technicians Surveyors task
  const { defaults: taskDefaults } = useTaskServiceDefaults(
    Task.TechniciansSurveyors
  )
  //states
  const [selectedItem, setSelectedItem] = useState<
    ITechnicianSurveyor | undefined
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
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    technicianSurveyorId: string | null
    technicianSurveyorName: string | null
    jobOrderId: number | null
  }>({
    isOpen: false,
    technicianSurveyorId: null,
    technicianSurveyorName: null,
    jobOrderId: null,
  })
  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<ITechnicianSurveyor> | null
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
  const { data: response, refetch } = useGetById<ITechnicianSurveyor>(
    `${JobOrder_TechnicianSurveyor.get}`,
    "technicianSurveyor",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ITechnicianSurveyor>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<TechnicianSurveyorFormValues>(
    `${JobOrder_TechnicianSurveyor.add}`
  )
  const updateMutation = usePersist<TechnicianSurveyorFormValues>(
    `${JobOrder_TechnicianSurveyor.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_TechnicianSurveyor.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.add}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: ITechnicianSurveyor | null) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_TechnicianSurveyor.getById}/${jobOrderId}/${item.technicianSurveyorId}`
        )) as ApiResponse<ITechnicianSurveyor>
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
      (item) => item.technicianSurveyorId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      technicianSurveyorId: id,
      technicianSurveyorName: `Technician Surveyor ${itemToDelete.name}`,
      jobOrderId: jobData.jobOrderId,
    })
  }

  const handleConfirmDelete = async () => {
    if (
      deleteConfirmation.technicianSurveyorId &&
      deleteConfirmation.jobOrderId &&
      deleteConfirmation.technicianSurveyorId
    ) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.technicianSurveyorId}`
        )
        queryClient.invalidateQueries({ queryKey: ["technicianSurveyor"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete technician surveyor:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          technicianSurveyorId: null,
          jobOrderId: jobData.jobOrderId,
          technicianSurveyorName: null,
        })
      }
    }
  }

  const handleCreate = () => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEdit = useCallback(
    async (item: ITechnicianSurveyor) => {
      const response = (await getData(
        `${JobOrder_TechnicianSurveyor.getById}/${jobOrderId}/${item.technicianSurveyorId}`
      )) as ApiResponse<ITechnicianSurveyor>
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
    async (formData: Partial<ITechnicianSurveyor>) => {
      try {
        const processedData = {
          ...formData,
          embarked: formData.embarked
            ? typeof formData.embarked === "string"
              ? formData.embarked
              : formData.embarked.toISOString()
            : undefined,
          disembarked: formData.disembarked
            ? typeof formData.disembarked === "string"
              ? formData.disembarked
              : formData.disembarked.toISOString()
            : undefined,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            technicianSurveyorId: selectedItem.technicianSurveyorId,
          })
        } else {
          await saveMutation.mutateAsync(submitData)
        }

        setIsModalOpen(false)
        setSelectedItem(undefined)
        setModalMode("create")
        refetch()
        onTaskAdded?.()
      } catch (error) {
        console.error("Error submitting form:", error)
      }
    },
    [
      jobDataProps,
      modalMode,
      selectedItem,
      updateMutation,
      saveMutation,
      refetch,
      onTaskAdded,
    ]
  )

  const handleCombinedService = useCallback((selectedIds: string[]) => {
    setSelectedItems(selectedIds)
    setShowCombinedServiceModal(true)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (technicianSurveyorId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = technicianSurveyorId.includes(",")
          ? technicianSurveyorId.split(",").map((id) => id.trim())
          : [technicianSurveyorId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.technicianSurveyorId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Technician surveyor(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.TechniciansSurveyors}/${firstItem.debitNoteId}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("Existing debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("Existing debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData as IDebitNoteHd)
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
          taskId: Task.TechniciansSurveyors,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.TechniciansSurveyors}/${response.result}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("New debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("New debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData as IDebitNoteHd)
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

  const handleRefreshTechnicianSurveyor = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    async (debitNoteId: number) => {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.TechniciansSurveyors}/${debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["technicianSurveyor"] })
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
          <TechnicianSurveyorTable
            data={data || []}
            onTechnicianSurveyorSelect={handleSelect}
            onDeleteTechnicianSurveyor={handleDelete}
            onEditTechnicianSurveyor={handleEdit}
            onCreateTechnicianSurveyor={handleCreate}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshTechnicianSurveyor}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
          />
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Technicians Surveyors</DialogTitle>
            <DialogDescription>
              Add or edit technicians surveyors details for this job order.
            </DialogDescription>
          </DialogHeader>
          <TechniciansSurveyorsForm
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
        taskId={Task.PortExpenses}
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
        taskId={Task.PortExpenses}
        debitNoteHd={debitNoteHd ?? undefined}
        isConfirmed={isConfirmed}
        onDelete={handleDeleteDebitNote}
        title="Debit Note"
        description="Manage debit note details for this port expenses."
      />

      {/* Purchase Table Modal */}
      <PurchaseDialog
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        title="Purchase"
        description="Manage purchase details for this port expenses."
      />
      {/* Save Confirmation */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Confirm Save"
        itemName={
          saveConfirmation.operationType === "update"
            ? `Technicians Surveyors ${selectedItem?.name || ""}`
            : "New Technicians Surveyors"
        }
        operationType={saveConfirmation.operationType}
        onConfirm={handleConfirmDelete}
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
        title="Delete Port Expense"
        description="This action cannot be undone. This will permanently delete the port expense from our servers."
        itemName={deleteConfirmation.technicianSurveyorName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            technicianSurveyorId: null,
            jobOrderId: null,
            technicianSurveyorName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
