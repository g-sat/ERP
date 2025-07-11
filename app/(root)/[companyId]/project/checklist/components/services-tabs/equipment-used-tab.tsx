"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteHd,
  IEquipmentUsed,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { EquipmentUsedFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { JobOrder_DebitNote, JobOrder_EquipmentUsed } from "@/lib/api-routes"
import { apiProxy } from "@/lib/axios-config"
import { Task } from "@/lib/project-utils"
import {
  useDelete,
  useGetById,
  useSave,
  useUpdate,
} from "@/hooks/use-common-v1"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/delete-confirmation"

import CombinedForms from "../services-combined/combined-forms"
import DebitNote from "../services-combined/debit-note"
import PurchaseTable from "../services-combined/purchase-table"
import { EquipmentUsedForm } from "../services-forms/equipment-used-form"
import { EquipmentUsedTable } from "../services-tables/equipment-used-table"

interface EquipmentUsedTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function EquipmentUsedTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: EquipmentUsedTabProps) {
  const jobOrderId = jobData.jobOrderId

  const queryClient = useQueryClient()
  //states
  const [selectedItem, setSelectedItem] = useState<IEquipmentUsed | undefined>(
    undefined
  )
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDebitNoteModal, setShowDebitNoteModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showCombinedServiceModal, setShowCombinedServiceModal] =
    useState(false)
  const [debitNoteHd, setDebitNoteHd] = useState<IDebitNoteHd | null>(null)
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    equipmentUsedId: string | null
    equipmentUsedName: string | null
  }>({
    isOpen: false,
    equipmentUsedId: null,
    equipmentUsedName: null,
  })
  // State for selected items (for bulk operations)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const jobDataProps = useMemo(
    () => ({
      companyId: jobData?.companyId,
      jobOrderId: jobData?.jobOrderId,
      jobOrderNo: jobData?.jobOrderNo,
      createById: jobData?.createById,
    }),
    [jobData]
  )

  // Data fetching
  const { data: response, refetch } = useGetById<IEquipmentUsed>(
    `${JobOrder_EquipmentUsed.get}`,
    "equipmentUsed",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IEquipmentUsed>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<EquipmentUsedFormValues>(
    `${JobOrder_EquipmentUsed.add}`,
    "equipmentUsed",
    companyId
  )
  const updateMutation = useUpdate<EquipmentUsedFormValues>(
    `${JobOrder_EquipmentUsed.add}`,
    "equipmentUsed",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_EquipmentUsed.delete}`,
    "equipmentUsed",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: IEquipmentUsed | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<IEquipmentUsed>>(
          `${JobOrder_EquipmentUsed.getById}/${jobOrderId}/${item.equipmentUsedId}`
        )
        if (response.data.result === 1 && response.data.data) {
          const itemData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (itemData) {
            setSelectedItem(itemData)
            setModalMode("view")
            setIsModalOpen(true)
          }
        } else {
          toast.error("Failed to load details")
        }
      } catch (error) {
        toast.error("An error occurred while fetching details")
        console.error("Error fetching item:", error)
      }
    },
    [jobOrderId]
  )

  const handleDelete = (id: string) => {
    const itemToDelete = data?.find(
      (item) => item.equipmentUsedId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      equipmentUsedId: id,
      equipmentUsedName: `Equipment Used ${itemToDelete.chargeName}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.equipmentUsedId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.equipmentUsedId),
        {
          loading: `Deleting ${deleteConfirmation.equipmentUsedName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["equipmentUsed"] })
            onTaskAdded?.()
            return `${deleteConfirmation.equipmentUsedName} has been deleted`
          },
          error: "Failed to delete equipment used",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        equipmentUsedId: null,
        equipmentUsedName: null,
      })
    }
  }

  const handleCreate = () => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEdit = useCallback(
    async (item: IEquipmentUsed) => {
      console.log("Handling edit for item:", item)
      const response = await apiProxy.get<ApiResponse<IEquipmentUsed>>(
        `${JobOrder_EquipmentUsed.getById}/${jobOrderId}/${item.equipmentUsedId}`
      )
      if (response.data.result === 1 && response.data.data) {
        const itemData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        if (itemData) {
          console.log("Setting selected item for edit:", itemData)
          console.log("isConfirmed value when editing:", isConfirmed)
          setSelectedItem(itemData)
          setModalMode("edit")
          setIsModalOpen(true)
        }
      }
    },
    [jobOrderId, isConfirmed]
  )

  const handleSubmit = useCallback(
    async (formData: Partial<IEquipmentUsed>) => {
      try {
        console.log("Handling form submission:", formData)
        console.log("Current modal mode:", modalMode)
        console.log("Selected item:", selectedItem)

        const processedData = {
          ...formData,
          date: formData.date
            ? typeof formData.date === "string"
              ? formData.date
              : formData.date.toISOString()
            : undefined,
        }
        const submitData = { ...processedData, ...jobDataProps }
        console.log("Final data to submit:", submitData)

        if (modalMode === "edit" && selectedItem) {
          console.log(
            "Updating existing item with ID:",
            selectedItem.equipmentUsedId
          )
          await updateMutation.mutateAsync({
            ...submitData,
            equipmentUsedId: selectedItem.equipmentUsedId,
          })
        } else {
          console.log("Creating new item")
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

  // Function to clear selection after operations
  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (equipmentUsedId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.equipmentUsedId.toString() === equipmentUsedId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.EquipmentUsed}/${foundItem.debitNoteId}`
        )
        if (
          debitNoteResponse.data.result === 1 &&
          debitNoteResponse.data.data
        ) {
          console.log(debitNoteResponse.data.data)
          // Handle both array and single object responses
          const debitNoteData = Array.isArray(debitNoteResponse.data.data)
            ? debitNoteResponse.data.data[0]
            : debitNoteResponse.data.data

          console.log("debitNoteData", debitNoteData)
          setDebitNoteHd(debitNoteData)
        }
      } else {
        // If no debitNoteId, clear the state
        setDebitNoteHd(null)
      }
    },
    [data, jobData]
  )

  const handlePurchase = useCallback(() => {
    setShowPurchaseModal(true)
  }, [])

  const handleRefreshEquipmentUsed = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <EquipmentUsedTable
            data={data || []}
            onEquipmentUsedSelect={handleSelect}
            onDeleteEquipmentUsed={handleDelete}
            onEditEquipmentUsed={handleEdit}
            onCreateEquipmentUsed={handleCreate}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshEquipmentUsed}
            moduleId={moduleId}
            transactionId={transactionId}
            isConfirmed={isConfirmed}
            companyId={companyId}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          //className="w-[80vw] !max-w-none"
          className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Equipment Used</DialogTitle>
            <DialogDescription>
              Add or edit equipment used details for this job order.
            </DialogDescription>
          </DialogHeader>
          <EquipmentUsedForm
            jobData={jobData}
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedItem
                : undefined
            }
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
            taskId={Task.EquipmentUsed}
            multipleId={selectedItems.join(",")}
            onTaskAdded={onTaskAdded}
            onClearSelection={handleClearSelection}
            onClose={() => setShowCombinedServiceModal(false)}
            companyId={companyId}
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
              Manage debit note details for this equipment used.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.EquipmentUsed}
            debitNoteHd={debitNoteHd ?? undefined}
            isConfirmed={isConfirmed}
            companyId={companyId}
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
              Manage purchase details for this equipment used.
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
        title="Delete Equipment Used"
        description="This action cannot be undone. This will permanently delete the equipment used from our servers."
        itemName={deleteConfirmation.equipmentUsedName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            equipmentUsedId: null,
            equipmentUsedName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
