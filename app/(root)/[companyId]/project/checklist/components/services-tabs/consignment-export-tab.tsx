"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IConsignmentExport,
  IDebitNoteHd,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { ConsignmentExportFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  JobOrder_ConsignmentExport,
  JobOrder_DebitNote,
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
import { ConsignmentExportForm } from "../services-forms/consignment-export-form"
import { ConsignmentExportTable } from "../services-tables/consignment-export-table"

interface ConsignmentExportTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function ConsignmentExportTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: ConsignmentExportTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()
  //states
  const [selectedItem, setSelectedItem] = useState<
    IConsignmentExport | undefined
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
    consignmentExportId: string | null
    consignmentExportName: string | null
  }>({
    isOpen: false,
    consignmentExportId: null,
    consignmentExportName: null,
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
  const { data: response, refetch } = useGetById<IConsignmentExport>(
    `${JobOrder_ConsignmentExport.get}`,
    "consignmentExport",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IConsignmentExport>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<ConsignmentExportFormValues>(
    `${JobOrder_ConsignmentExport.add}`,
    "consignmentExport",
    companyId
  )
  const updateMutation = useUpdate<ConsignmentExportFormValues>(
    `${JobOrder_ConsignmentExport.add}`,
    "consignmentExport",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_ConsignmentExport.delete}`,
    "consignmentExport",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: IConsignmentExport | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<IConsignmentExport>>(
          `${JobOrder_ConsignmentExport.getById}/${jobOrderId}/${item.consignmentExportId}`
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
      (item) => item.consignmentExportId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      consignmentExportId: id,
      consignmentExportName: `Consignment Export ${itemToDelete.awbNo}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.consignmentExportId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.consignmentExportId),
        {
          loading: `Deleting ${deleteConfirmation.consignmentExportName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["consignmentExport"] })
            onTaskAdded?.()
            return `${deleteConfirmation.consignmentExportName} has been deleted`
          },
          error: "Failed to delete consignment export",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        consignmentExportId: null,
        consignmentExportName: null,
      })
    }
  }

  const handleEdit = useCallback(
    async (item: IConsignmentExport) => {
      const response = await apiProxy.get<ApiResponse<IConsignmentExport>>(
        `${JobOrder_ConsignmentExport.getById}/${jobOrderId}/${item.consignmentExportId}`
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
    async (formData: Partial<IConsignmentExport>) => {
      try {
        const processedData = {
          ...formData,
          receiveDate: formData.receiveDate
            ? typeof formData.receiveDate === "string"
              ? formData.receiveDate
              : formData.receiveDate.toISOString()
            : undefined,
          deliverDate: formData.deliverDate
            ? typeof formData.deliverDate === "string"
              ? formData.deliverDate
              : formData.deliverDate.toISOString()
            : undefined,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            consignmentExportId: selectedItem.consignmentExportId,
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

  // Function to clear selection after operations
  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const handleDebitNote = useCallback(
    async (consignmentExportId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.consignmentExportId.toString() === consignmentExportId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.ConsignmentExport}/${foundItem.debitNoteId}`
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
  const handleCreateConsignmentExport = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshConsignmentExport = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <ConsignmentExportTable
            data={data || []}
            onConsignmentExportSelect={handleSelect}
            onDeleteConsignmentExport={handleDelete}
            onEditConsignmentExport={handleEdit}
            onCreateConsignmentExport={handleCreateConsignmentExport}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshConsignmentExport}
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
            <DialogTitle>Consignment Export</DialogTitle>
            <DialogDescription>
              Add or edit consignment export details for this job order.
            </DialogDescription>
          </DialogHeader>
          <ConsignmentExportForm
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
            taskId={Task.ConsignmentExport}
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
              Manage debit note details for this consignment export.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.ConsignmentExport}
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
              Manage purchase details for this consignment export.
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
        title="Delete Consignment Export"
        description="This action cannot be undone. This will permanently delete the consignment export from our servers."
        itemName={deleteConfirmation.consignmentExportName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            consignmentExportId: null,
            consignmentExportName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
