"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteHd,
  IJobOrderHd,
  IMedicalAssistance,
} from "@/interfaces/checklist"
import { MedicalAssistanceFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  JobOrder_DebitNote,
  JobOrder_MedicalAssistance,
} from "@/lib/api-routes"
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
import { MedicalAssistanceForm } from "../services-forms/medical-assistance-form"
import { MedicalAssistanceTable } from "../services-tables/medical-assistance-table"

interface MedicalAssistanceTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function MedicalAssistanceTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: MedicalAssistanceTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()
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
  const [debitNoteHd, setDebitNoteHd] = useState<IDebitNoteHd | undefined>()
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    medicalAssistanceId: string | null
    medicalAssistanceName: string | null
  }>({
    isOpen: false,
    medicalAssistanceId: null,
    medicalAssistanceName: null,
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
  const { data: response, refetch } = useGetById<IMedicalAssistance>(
    `${JobOrder_MedicalAssistance.get}`,
    "medicalAssistance",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IMedicalAssistance>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<MedicalAssistanceFormValues>(
    `${JobOrder_MedicalAssistance.add}`,
    "medicalAssistance",
    companyId
  )
  const updateMutation = useUpdate<MedicalAssistanceFormValues>(
    `${JobOrder_MedicalAssistance.add}`,
    "medicalAssistance",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_MedicalAssistance.delete}`,
    "medicalAssistance",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: IMedicalAssistance | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<IMedicalAssistance>>(
          `${JobOrder_MedicalAssistance.getById}/${jobOrderId}/${item.medicalAssistanceId}`
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
      (item) => item.medicalAssistanceId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      medicalAssistanceId: id,
      medicalAssistanceName: `Medical Assistance ${itemToDelete.crewName}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.medicalAssistanceId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.medicalAssistanceId),
        {
          loading: `Deleting ${deleteConfirmation.medicalAssistanceName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["medicalAssistance"] })
            onTaskAdded?.()
            return `${deleteConfirmation.medicalAssistanceName} has been deleted`
          },
          error: "Failed to delete medical assistance",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        medicalAssistanceId: null,
        medicalAssistanceName: null,
      })
    }
  }

  const handleEdit = useCallback(
    async (item: IMedicalAssistance) => {
      const response = await apiProxy.get<ApiResponse<IMedicalAssistance>>(
        `${JobOrder_MedicalAssistance.getById}/${jobOrderId}/${item.medicalAssistanceId}`
      )
      if (response.data.result === 1 && response.data.data) {
        const itemData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

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
    async (formData: Partial<IMedicalAssistance>) => {
      try {
        const processedData = {
          ...formData,
          admittedDate: formData.admittedDate
            ? typeof formData.admittedDate === "string"
              ? formData.admittedDate
              : formData.admittedDate.toISOString()
            : undefined,
          dischargedDate: formData.dischargedDate
            ? typeof formData.dischargedDate === "string"
              ? formData.dischargedDate
              : formData.dischargedDate.toISOString()
            : undefined,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            medicalAssistanceId: selectedItem.medicalAssistanceId,
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
    async (medicalAssistanceId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.medicalAssistanceId.toString() === medicalAssistanceId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.MedicalAssistance}/${foundItem.debitNoteId}`
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
        setDebitNoteHd(undefined)
      }
    },
    [data, jobData]
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
            companyId={companyId}
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
            taskId={Task.MedicalAssistance}
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
              Manage debit note details for this medical assistance.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.MedicalAssistance}
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
              Manage purchase details for this medical assistance.
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
        title="Delete Medical Assistance"
        description="This action cannot be undone. This will permanently delete the medical assistance from our servers."
        itemName={deleteConfirmation.medicalAssistanceName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            medicalAssistanceId: null,
            medicalAssistanceName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
