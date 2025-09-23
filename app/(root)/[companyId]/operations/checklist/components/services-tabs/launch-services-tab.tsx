"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
  ILaunchService,
} from "@/interfaces/checklist"
import { LaunchServiceFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { getData } from "@/lib/api-client"
import { JobOrder_DebitNote, JobOrder_LaunchServices } from "@/lib/api-routes"
import { Task } from "@/lib/operations-utils"
import { useDelete, useGetById, usePersist } from "@/hooks/use-common"
import { useTaskServiceDefaults } from "@/hooks/use-task-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"

import CombinedForms from "../services-combined/combined-forms"
import DebitNote from "../services-combined/debit-note"
import PurchaseTable from "../services-combined/purchase-table"
import { LaunchServiceForm } from "../services-forms/launch-service-form"
import { LaunchServiceTable } from "../services-tables/launch-service-table"

interface LaunchServicesTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function LaunchServicesTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: LaunchServicesTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Launch Services task
  const { defaults: taskDefaults } = useTaskServiceDefaults(Task.LaunchServices)
  //states
  const [selectedItem, setSelectedItem] = useState<ILaunchService | undefined>(
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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    formData: Partial<ILaunchService> | null
    operationType: "create" | "update"
  }>({
    isOpen: false,
    formData: null,
    operationType: "create",
  })
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    launchServiceId: string | null
    jobOrderId: number | null
    launchServiceName: string | null
  }>({
    isOpen: false,
    launchServiceId: null,
    jobOrderId: null,
    launchServiceName: null,
  })

  // State for debit note delete confirmation
  const [debitNoteDeleteConfirmation, setDebitNoteDeleteConfirmation] =
    useState<{
      isOpen: boolean
      debitNoteId: number | null
      debitNoteNo: string | null
    }>({
      isOpen: false,
      debitNoteId: null,
      debitNoteNo: null,
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
  const { data: response, refetch } = useGetById<ILaunchService>(
    `${JobOrder_LaunchServices.get}`,
    "launchServices",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ILaunchService>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<LaunchServiceFormValues>(
    `${JobOrder_LaunchServices.add}`
  )
  const updateMutation = usePersist<LaunchServiceFormValues>(
    `${JobOrder_LaunchServices.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_LaunchServices.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.add}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: ILaunchService | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_LaunchServices.getById}/${jobOrderId}/${item.launchServiceId}`
        )) as ApiResponse<ILaunchService>
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
      (item) => item.launchServiceId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      launchServiceId: id,
      jobOrderId: jobData.jobOrderId,
      launchServiceName: `Launch Service ${itemToDelete.chargeName}`,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.launchServiceId && deleteConfirmation.jobOrderId) {
      try {
        await deleteMutation.mutateAsync(
          `${deleteConfirmation.jobOrderId}/${deleteConfirmation.launchServiceId}`
        )
        queryClient.invalidateQueries({ queryKey: ["launchServices"] })
        onTaskAdded?.()
      } catch (error) {
        console.error("Failed to delete launch service:", error)
      } finally {
        setDeleteConfirmation({
          isOpen: false,
          launchServiceId: null,
          jobOrderId: null,
          launchServiceName: null,
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
    async (item: ILaunchService) => {
      const response = (await getData(
        `${JobOrder_LaunchServices.getById}/${jobOrderId}/${item.launchServiceId}`
      )) as ApiResponse<ILaunchService>
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
    async (formData: LaunchServiceFormValues) => {
      try {
        const submitData = { ...formData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            launchServiceId: selectedItem.launchServiceId,
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

  const handleRefreshLaunchServices = useCallback(() => {
    refetch()
  }, [refetch])

  const handleCombinedService = useCallback((selectedIds: string[]) => {
    setSelectedItems(selectedIds)
    setShowCombinedServiceModal(true)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (launchServiceId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = launchServiceId.includes(",")
          ? launchServiceId.split(",").map((id) => id.trim())
          : [launchServiceId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.launchServiceId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          console.error("Launch service(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.LaunchServices}/${firstItem.debitNoteId}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("New debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("New debitNoteData", debitNoteData)
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
          taskId: Task.LaunchServices,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.LaunchServices}/${response.result}`
          )) as ApiResponse<IDebitNoteHd>
          console.log("debitNoteResponse", debitNoteResponse)
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

  // Handle debit note delete
  const handleDeleteDebitNote = useCallback(
    (debitNoteId: number, debitNoteNo: string) => {
      setDebitNoteDeleteConfirmation({
        isOpen: true,
        debitNoteId,
        debitNoteNo,
      })
    },
    []
  )

  const handleConfirmDeleteDebitNote = useCallback(async () => {
    if (debitNoteDeleteConfirmation.debitNoteId) {
      try {
        await debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.LaunchServices}/${debitNoteDeleteConfirmation.debitNoteId}`
        )
        queryClient.invalidateQueries({ queryKey: ["launchServices"] })
        queryClient.invalidateQueries({ queryKey: ["debitNote"] })
        onTaskAdded?.()
        setShowDebitNoteModal(false)
        setDebitNoteHd(null)
      } catch (error) {
        console.error("Failed to delete debit note:", error)
      } finally {
        setDebitNoteDeleteConfirmation({
          isOpen: false,
          debitNoteId: null,
          debitNoteNo: null,
        })
      }
    }
  }, [
    debitNoteDeleteConfirmation,
    debitNoteDeleteMutation,
    jobData.jobOrderId,
    queryClient,
    onTaskAdded,
  ])

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <LaunchServiceTable
            data={data || []}
            onLaunchServiceSelect={handleSelect}
            onDeleteLaunchService={handleDelete}
            onEditLaunchService={handleEdit}
            onCreateLaunchService={handleCreate}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshLaunchServices}
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
            <div className="flex items-center gap-3">
              <DialogTitle>Launch Services</DialogTitle>
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
                ? "Add a new launch service to this job order."
                : modalMode === "edit"
                  ? "Update the launch service details."
                  : "View launch service details (read-only)."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <LaunchServiceForm
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

      <Dialog
        open={showCombinedServiceModal}
        onOpenChange={setShowCombinedServiceModal}
      >
        <DialogContent
          className="max-h-[90vh] w-[90vw] max-w-6xl overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Combined Services</DialogTitle>
            <DialogDescription>
              Manage bulk updates and task forwarding operations
            </DialogDescription>
          </DialogHeader>
          <CombinedForms
            onCancel={() => setShowCombinedServiceModal(false)}
            jobData={jobData}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
            taskId={Task.LaunchServices}
            multipleId={selectedItems.join(",")}
            onTaskAdded={onTaskAdded}
            onClearSelection={handleClearSelection}
            onClose={() => setShowCombinedServiceModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Debit Note Modal */}
      <Dialog open={showDebitNoteModal} onOpenChange={setShowDebitNoteModal}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Debit Note</DialogTitle>
            <DialogDescription>
              Manage debit note details for this launch services.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            taskId={Task.LaunchServices}
            debitNoteHd={debitNoteHd ?? undefined}
            isConfirmed={isConfirmed}
            onDeleteDebitNote={handleDeleteDebitNote}
          />
        </DialogContent>
      </Dialog>

      {/* Purchase Table Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Purchase</DialogTitle>
            <DialogDescription>
              Manage purchase details for this launch services.
            </DialogDescription>
          </DialogHeader>
          <PurchaseTable />
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Launch Service"
        description="This action cannot be undone. This will permanently delete the launch service from our servers."
        itemName={deleteConfirmation.launchServiceName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            launchServiceId: null,
            launchServiceName: null,
            jobOrderId: jobData.jobOrderId,
          })
        }
        isDeleting={deleteMutation.isPending}
      />

      {/* Debit Note Delete Confirmation */}
      <Dialog
        open={debitNoteDeleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDebitNoteDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete debit note{" "}
              <strong>{debitNoteDeleteConfirmation.debitNoteNo}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setDebitNoteDeleteConfirmation({
                  isOpen: false,
                  debitNoteId: null,
                  debitNoteNo: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteDebitNote}
              disabled={debitNoteDeleteMutation.isPending}
            >
              {debitNoteDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Confirm Save"
        itemName={
          saveConfirmation.operationType === "update"
            ? `Launch Service ${selectedItem?.chargeName || ""}`
            : "New Launch Service"
        }
        operationType={saveConfirmation.operationType}
        onConfirm={() => {
          if (saveConfirmation.formData) {
            handleSubmit(saveConfirmation.formData as LaunchServiceFormValues)
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
        title="Delete Launch Service"
        description="This action cannot be undone. This will permanently delete the launch service from our servers."
        itemName={deleteConfirmation.launchServiceName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            launchServiceId: null,
            jobOrderId: null,
            launchServiceName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
