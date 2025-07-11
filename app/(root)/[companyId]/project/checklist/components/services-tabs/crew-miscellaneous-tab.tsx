"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICrewMiscellaneous,
  IDebitNoteHd,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { CrewMiscellaneousFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  JobOrder_CrewMiscellaneous,
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
import { CrewMiscellaneousForm } from "../services-forms/crew-miscellaneous-form"
import { CrewMiscellaneousTable } from "../services-tables/crew-miscellaneous-table"

interface CrewMiscellaneousTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
  companyId: string
}

export function CrewMiscellaneousTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
  companyId,
}: CrewMiscellaneousTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()
  //states
  const [selectedItem, setSelectedItem] = useState<
    ICrewMiscellaneous | undefined
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
    crewMiscellaneousId: string | null
    crewMiscellaneousName: string | null
  }>({
    isOpen: false,
    crewMiscellaneousId: null,
    crewMiscellaneousName: null,
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
  const { data: response, refetch } = useGetById<ICrewMiscellaneous>(
    `${JobOrder_CrewMiscellaneous.get}`,
    "crewMiscellaneous",
    companyId,
    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ICrewMiscellaneous>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = useSave<CrewMiscellaneousFormValues>(
    `${JobOrder_CrewMiscellaneous.add}`,
    "crewMiscellaneous",
    companyId
  )
  const updateMutation = useUpdate<CrewMiscellaneousFormValues>(
    `${JobOrder_CrewMiscellaneous.add}`,
    "crewMiscellaneous",
    companyId
  )
  const deleteMutation = useDelete(
    `${JobOrder_CrewMiscellaneous.delete}`,
    "crewMiscellaneous",
    companyId
  )

  // Handlers
  const handleSelect = useCallback(
    async (item: ICrewMiscellaneous | undefined) => {
      if (!item) return

      try {
        const response = await apiProxy.get<ApiResponse<ICrewMiscellaneous>>(
          `${JobOrder_CrewMiscellaneous.getById}/${jobOrderId}/${item.crewMiscellaneousId}`
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
      (item) => item.crewMiscellaneousId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      crewMiscellaneousId: id,
      crewMiscellaneousName: `Crew Miscellaneous ${itemToDelete.description}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.crewMiscellaneousId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.crewMiscellaneousId),
        {
          loading: `Deleting ${deleteConfirmation.crewMiscellaneousName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["crewMiscellaneous"] })
            onTaskAdded?.()
            return `${deleteConfirmation.crewMiscellaneousName} has been deleted`
          },
          error: "Failed to delete crew miscellaneous",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        crewMiscellaneousId: null,
        crewMiscellaneousName: null,
      })
    }
  }

  const handleEdit = useCallback(
    async (item: ICrewMiscellaneous) => {
      const response = await apiProxy.get<ApiResponse<ICrewMiscellaneous>>(
        `${JobOrder_CrewMiscellaneous.getById}/${jobOrderId}/${item.crewMiscellaneousId}`
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
    async (formData: Partial<ICrewMiscellaneous>) => {
      try {
        const processedData = {
          ...formData,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            crewMiscellaneousId: selectedItem.crewMiscellaneousId,
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

  const handleDebitNote = useCallback(
    async (crewMiscellaneousId: string) => {
      // First, find and set the selected item
      const foundItem = data?.find(
        (item) => item.crewMiscellaneousId.toString() === crewMiscellaneousId
      )
      setSelectedItem(foundItem)

      // Open the debit note modal
      setShowDebitNoteModal(true)

      // Now make the API call with the correct debitNoteId
      if (foundItem?.debitNoteId) {
        const debitNoteResponse = await apiProxy.get<ApiResponse<IDebitNoteHd>>(
          `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.CrewMiscellaneous}/${foundItem.debitNoteId}`
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
  const handleCreateCrewMiscellaneous = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshCrewMiscellaneous = useCallback(() => {
    refetch()
  }, [refetch])

  // Function to clear selection after operations
  const handleClearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <CrewMiscellaneousTable
            data={data || []}
            onCrewMiscellaneousSelect={handleSelect}
            onDeleteCrewMiscellaneous={handleDelete}
            onEditCrewMiscellaneous={handleEdit}
            onCreateCrewMiscellaneous={handleCreateCrewMiscellaneous}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshCrewMiscellaneous}
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
            <DialogTitle>Crew Miscellaneous</DialogTitle>
            <DialogDescription>
              Add or edit crew miscellaneous details for this job order.
            </DialogDescription>
          </DialogHeader>
          <CrewMiscellaneousForm
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
            taskId={Task.CrewMiscellaneous}
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
              Manage debit note details for this crew miscellaneous.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            jobData={jobData}
            taskId={Task.CrewMiscellaneous}
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
              Manage purchase details for this crew miscellaneous.
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
        title="Delete Crew Miscellaneous"
        description="This action cannot be undone. This will permanently delete the crew miscellaneous from our servers."
        itemName={deleteConfirmation.crewMiscellaneousName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            crewMiscellaneousId: null,
            crewMiscellaneousName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
