"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteData,
  IDebitNoteHd,
  IFreshWater,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { FreshWaterFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { JobOrder_DebitNote, JobOrder_FreshWater } from "@/lib/api-routes"
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
import { FreshWaterForm } from "../services-forms/fresh-water-form"
import { FreshWaterTable } from "../services-tables/fresh-water-table"

interface FreshWaterTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function FreshWaterTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: FreshWaterTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Fresh Water task
  const { defaults: taskDefaults } = useTaskServiceDefaults(Task.FreshWater)
  //states
  const [selectedItem, setSelectedItem] = useState<IFreshWater | undefined>(
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
    freshWaterId: string | null
    freshWaterName: string | null
    jobOrderId: number | null
  }>({
    isOpen: false,
    freshWaterId: null,
    freshWaterName: null,
    jobOrderId: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<IFreshWater> | null
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
  const { data: response, refetch } = useGetById<IFreshWater>(
    `${JobOrder_FreshWater.get}`,
    "freshWater",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IFreshWater>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<FreshWaterFormValues>(
    `${JobOrder_FreshWater.add}`
  )
  const updateMutation = usePersist<FreshWaterFormValues>(
    `${JobOrder_FreshWater.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_FreshWater.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.add}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: IFreshWater | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_FreshWater.getById}/${jobOrderId}/${item.freshWaterId}`
        )) as ApiResponse<IFreshWater>
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
      (item) => item.freshWaterId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      freshWaterId: id,
      freshWaterName: `Fresh Water ${itemToDelete.chargeName}`,
      jobOrderId: jobData.jobOrderId,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.freshWaterId && deleteConfirmation.jobOrderId) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.freshWaterId}`
        )
        queryClient.invalidateQueries({ queryKey: ["freshWater"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete fresh water:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          freshWaterId: null,
          jobOrderId: jobData.jobOrderId,
          freshWaterName: null,
        })
      }
    }
  }

  const handleEdit = useCallback(
    async (item: IFreshWater) => {
      const response = (await getData(
        `${JobOrder_FreshWater.getById}/${jobOrderId}/${item.freshWaterId}`
      )) as ApiResponse<IFreshWater>
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
    async (formData: Partial<IFreshWater>) => {
      try {
        const processedData = {
          ...formData,
          date: formData.date
            ? typeof formData.date === "string"
              ? formData.date
              : formData.date.toISOString()
            : undefined,
          // Handle null values for string fields
          operatorName: formData.operatorName || "",
          supplyBarge: formData.supplyBarge || "",
          taskName: formData.taskName || "",
          glName: formData.glName || "",
          chargeName: formData.chargeName || "",
          bargeName: formData.bargeName || "",
          uomName: formData.uomName || "",
          statusName: formData.statusName || "",
          remarks: formData.remarks || "",
          debitNoteNo: formData.debitNoteNo || "",
          createBy: formData.createBy || "",
          editBy: formData.editBy || "",
          // Handle null values for numeric fields
          debitNoteId: formData.debitNoteId || 0,
          editById: formData.editById || undefined,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            freshWaterId: selectedItem.freshWaterId,
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
    async (freshWaterId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = freshWaterId.includes(",")
          ? freshWaterId.split(",").map((id) => id.trim())
          : [freshWaterId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.freshWaterId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Fresh water(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.FreshWater}/${firstItem.debitNoteId}`
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
          taskId: Task.FreshWater,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.FreshWater}/${response.result}`
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
  const handleCreateFreshWater = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshFreshWater = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    async (debitNoteId: number) => {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.FreshWater}/${debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["freshWater"] })
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
          <FreshWaterTable
            data={data || []}
            onFreshWaterSelect={handleSelect}
            onDeleteFreshWater={handleDelete}
            onEditFreshWater={handleEdit}
            onCreateFreshWater={handleCreateFreshWater}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshFreshWater}
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
            <DialogTitle>Fresh Water</DialogTitle>
            <DialogDescription>
              Add or edit fresh water details for this job order.
            </DialogDescription>
          </DialogHeader>
          <FreshWaterForm
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
            ? `Fresh Water ${selectedItem?.chargeName || ""}`
            : "New Fresh Water"
        }
        operationType={saveConfirmation.operationType}
        onConfirm={() => {
          if (saveConfirmation.formData) {
            handleSubmit(saveConfirmation.formData)
          }
        }}
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
        title="Delete Fresh Water"
        description="This action cannot be undone. This will permanently delete the fresh water from our servers."
        itemName={deleteConfirmation.freshWaterName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            freshWaterId: null,
            jobOrderId: jobData.jobOrderId,
            freshWaterName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
