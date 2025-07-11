"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IDebitNoteHd,
  IJobOrderHd,
  ITechnicianSurveyor,
} from "@/interfaces/checklist"
import { TechnicianSurveyorFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  JobOrder_DebitNote,
  JobOrder_TechnicianSurveyor,
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
import { TechniciansSurveyorsForm } from "../services-forms/technicians-surveyors-form"
import { TechnicianSurveyorTable } from "../services-tables/technician-surveyor-table"

interface TechniciansSurveyorsTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function TechniciansSurveyorsTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: TechniciansSurveyorsTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()
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
  const [debitNoteHd, setDebitNoteHd] = useState<IDebitNoteHd | undefined>()
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    technicianSurveyorId: string | null
    technicianSurveyorName: string | null
  }>({
    isOpen: false,
    technicianSurveyorId: null,
    technicianSurveyorName: null,
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
  const { data: response, refetch } = useGetById<ITechnicianSurveyor>(
    `${JobOrder_TechnicianSurveyor.get}`,
    "technicianSurveyor",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ITechnicianSurveyor>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<TechnicianSurveyorFormValues>(
    `${JobOrder_TechnicianSurveyor.add}`,
    "technicianSurveyor",
    companyId
  )
  const updateMutation = useUpdate<TechnicianSurveyorFormValues>(
    `${JobOrder_TechnicianSurveyor.add}`,
    "technicianSurveyor",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_TechnicianSurveyor.delete}`,
    "technicianSurveyor",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: ITechnicianSurveyor | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<ITechnicianSurveyor>>(
          `${JobOrder_TechnicianSurveyor.getById}/${jobOrderId}/${item.technicianSurveyorId}`
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
      (item) => item.technicianSurveyorId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      technicianSurveyorId: id,
      technicianSurveyorName: `Technician Surveyor ${itemToDelete.name}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.technicianSurveyorId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.technicianSurveyorId),
        {
          loading: `Deleting ${deleteConfirmation.technicianSurveyorName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["technicianSurveyor"] })
            onTaskAdded?.()
            return `${deleteConfirmation.technicianSurveyorName} has been deleted`
          },
          error: "Failed to delete technician surveyor",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        technicianSurveyorId: null,
        technicianSurveyorName: null,
      })
    }
  }

  const handleCreate = () => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEdit = useCallback(
    async (item: ITechnicianSurveyor) => {
      const response = await apiProxy.get<ApiResponse<ITechnicianSurveyor>>(
        `${JobOrder_TechnicianSurveyor.getById}/${jobOrderId}/${item.technicianSurveyorId}`
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
    async (technicianSurveyorId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.technicianSurveyorId.toString() === technicianSurveyorId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.TechniciansSurveyors}/${foundItem.debitNoteId}`
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

  const handleRefreshTechnicianSurveyor = useCallback(() => {
    refetch()
  }, [refetch])

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
            taskId={Task.TechniciansSurveyors}
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
              Manage debit note details for this technicians surveyors.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.TechniciansSurveyors}
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
              Manage purchase details for this technicians surveyors.
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
        title="Delete Technician Surveyor"
        description="This action cannot be undone. This will permanently delete the technician surveyor from our servers."
        itemName={deleteConfirmation.technicianSurveyorName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            technicianSurveyorId: null,
            technicianSurveyorName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
