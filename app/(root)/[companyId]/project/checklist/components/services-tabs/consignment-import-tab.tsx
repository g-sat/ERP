"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IConsignmentImport,
  IDebitNoteHd,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { ConsignmentImportFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  JobOrder_ConsignmentImport,
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
import { ConsignmentImportForm } from "../services-forms/consignment-import-form"
import { ConsignmentImportTable } from "../services-tables/consignment-import-table"

interface ConsignmentImportTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function ConsignmentImportTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: ConsignmentImportTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()
  //states
  const [selectedItem, setSelectedItem] = useState<
    IConsignmentImport | undefined
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
    consignmentImportId: string | null
    consignmentImportName: string | null
  }>({
    isOpen: false,
    consignmentImportId: null,
    consignmentImportName: null,
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
  const { data: response, refetch } = useGetById<IConsignmentImport>(
    `${JobOrder_ConsignmentImport.get}`,
    "consignmentImport",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<IConsignmentImport>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<ConsignmentImportFormValues>(
    `${JobOrder_ConsignmentImport.add}`,
    "consignmentImport",
    companyId
  )
  const updateMutation = useUpdate<ConsignmentImportFormValues>(
    `${JobOrder_ConsignmentImport.add}`,
    "consignmentImport",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_ConsignmentImport.delete}`,
    "consignmentImport",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: IConsignmentImport | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<IConsignmentImport>>(
          `${JobOrder_ConsignmentImport.getById}/${jobOrderId}/${item.consignmentImportId}`
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
      (item) => item.consignmentImportId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      consignmentImportId: id,
      consignmentImportName: `Consignment Import ${itemToDelete.awbNo}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.consignmentImportId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.consignmentImportId),
        {
          loading: `Deleting ${deleteConfirmation.consignmentImportName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["consignmentImport"] })
            onTaskAdded?.()
            return `${deleteConfirmation.consignmentImportName} has been deleted`
          },
          error: "Failed to delete consignment import",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        consignmentImportId: null,
        consignmentImportName: null,
      })
    }
  }

  const handleEdit = useCallback(
    async (item: IConsignmentImport) => {
      const response = await apiProxy.get<ApiResponse<IConsignmentImport>>(
        `${JobOrder_ConsignmentImport.getById}/${jobOrderId}/${item.consignmentImportId}`
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
    async (formData: Partial<IConsignmentImport>) => {
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
            consignmentImportId: selectedItem.consignmentImportId,
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
    async (consignmentImportId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.consignmentImportId.toString() === consignmentImportId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.ConsignmentImport}/${foundItem.debitNoteId}`
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
  const handleCreateConsignmentImport = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshConsignmentImport = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <ConsignmentImportTable
            data={data || []}
            onConsignmentImportSelect={handleSelect}
            onDeleteConsignmentImport={handleDelete}
            onEditConsignmentImport={handleEdit}
            onCreateConsignmentImport={handleCreateConsignmentImport}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshConsignmentImport}
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
            <DialogTitle>Consignment Import</DialogTitle>
            <DialogDescription>
              Add or edit consignment import details for this job order.
            </DialogDescription>
          </DialogHeader>
          <ConsignmentImportForm
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
            taskId={Task.ConsignmentImport}
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
              Manage debit note details for this consignment import.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.ConsignmentImport}
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
              Manage purchase details for this consignment import.
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
        title="Delete Consignment Import"
        description="This action cannot be undone. This will permanently delete the consignment import from our servers."
        itemName={deleteConfirmation.consignmentImportName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            consignmentImportId: null,
            consignmentImportName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
