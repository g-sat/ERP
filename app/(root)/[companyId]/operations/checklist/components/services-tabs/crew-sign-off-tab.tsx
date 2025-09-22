"use client"

import { useCallback, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICrewSignOff,
  IDebitNoteData,
  IDebitNoteHd,
  IJobOrderHd,
} from "@/interfaces/checklist"
import { CrewSignOffFormValues } from "@/schemas/checklist"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { JobOrder_CrewSignOff, JobOrder_DebitNote } from "@/lib/api-routes"
import { Task } from "@/lib/operations-utils"
import { useDelete, useGetById, usePersist } from "@/hooks/use-common"
import { useTaskServiceDefaults } from "@/hooks/use-task-service"
import { Button } from "@/components/ui/button"
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
import { CrewSignOffForm } from "../services-forms/crew-sign-off-form"
import { CrewSignOffTable } from "../services-tables/crew-sign-off-table"

interface CrewSignOffTabProps {
  jobData: IJobOrderHd
  moduleId: number
  transactionId: number
  onTaskAdded?: () => void
  isConfirmed: boolean
}

export function CrewSignOffTab({
  jobData,
  moduleId,
  transactionId,
  onTaskAdded,
  isConfirmed,
}: CrewSignOffTabProps) {
  const jobOrderId = jobData.jobOrderId
  const queryClient = useQueryClient()

  // Get default values for Crew Sign Off task
  const { defaults: taskDefaults } = useTaskServiceDefaults(Task.CrewSignOff)
  //states
  const [selectedItem, setSelectedItem] = useState<ICrewSignOff | undefined>(
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
  // State for selected items (for bulk operations)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    crewSignOffId: string | null
    crewSignOffName: string | null
  }>({
    isOpen: false,
    crewSignOffId: null,
    crewSignOffName: null,
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

  const jobDataProps = useMemo(
    () => ({
      jobOrderId: jobData?.jobOrderId,
      jobOrderNo: jobData?.jobOrderNo,
      createById: jobData?.createById,
    }),
    [jobData]
  )

  // Data fetching
  const { data: response, refetch } = useGetById<ICrewSignOff>(
    `${JobOrder_CrewSignOff.get}`,
    "crewSignOff",

    `${jobOrderId || ""}`
  )

  const { data } = (response as ApiResponse<ICrewSignOff>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<CrewSignOffFormValues>(
    `${JobOrder_CrewSignOff.add}`
  )
  const updateMutation = usePersist<CrewSignOffFormValues>(
    `${JobOrder_CrewSignOff.add}`
  )
  const deleteMutation = useDelete(`${JobOrder_CrewSignOff.delete}`)
  // Debit note mutation
  const debitNoteMutation = usePersist<IDebitNoteData>(
    `${JobOrder_DebitNote.add}`
  )

  // Debit note delete mutation
  const debitNoteDeleteMutation = useDelete(`${JobOrder_DebitNote.delete}`)

  // Handlers
  const handleSelect = useCallback(
    async (item: ICrewSignOff | undefined) => {
      if (!item) return

      try {
        const response = (await getData(
          `${JobOrder_CrewSignOff.getById}/${jobOrderId}/${item.crewSignOffId}`
        )) as ApiResponse<ICrewSignOff>
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
      (item) => item.crewSignOffId.toString() === id
    )
    if (!itemToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      crewSignOffId: id,
      crewSignOffName: `Crew Sign Off ${itemToDelete.crewName}`,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.crewSignOffId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.crewSignOffId),
        {
          loading: `Deleting ${deleteConfirmation.crewSignOffName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["crewSignOff"] })
            onTaskAdded?.()
            return `${deleteConfirmation.crewSignOffName} has been deleted`
          },
          error: "Failed to delete crew sign off",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        crewSignOffId: null,
        crewSignOffName: null,
      })
    }
  }

  const handleEdit = useCallback(
    async (item: ICrewSignOff) => {
      const response = (await getData(
        `${JobOrder_CrewSignOff.getById}/${jobOrderId}/${item.crewSignOffId}`
      )) as ApiResponse<ICrewSignOff>
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
    async (formData: Partial<ICrewSignOff>) => {
      try {
        const processedData = {
          ...formData,
        }
        const submitData = { ...processedData, ...jobDataProps }

        if (modalMode === "edit" && selectedItem) {
          await updateMutation.mutateAsync({
            ...submitData,
            crewSignOffId: selectedItem.crewSignOffId,
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
    async (crewSignOffId: string, debitNoteNo?: string) => {
      try {
        // Handle both single ID and comma-separated multiple IDs
        const selectedIds = crewSignOffId.includes(",")
          ? crewSignOffId.split(",").map((id) => id.trim())
          : [crewSignOffId]

        console.log("Selected IDs for debit note:", selectedIds)

        // Find all selected items
        const foundItems = data?.filter((item) =>
          selectedIds.includes(item.crewSignOffId.toString())
        )

        if (!foundItems || foundItems.length === 0) {
          toast.error("Crew sign off(s) not found")
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.CrewSignOff}/${firstItem.debitNoteId}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("Existing debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("Existing debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData as IDebitNoteHd)
          }

          toast.info("Opening existing debit note")
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
          taskId: Task.CrewSignOff,
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
            `${JobOrder_DebitNote.getById}/${jobData.jobOrderId}/${Task.CrewSignOff}/${response.result}`
          )) as ApiResponse<IDebitNoteHd>

          if (debitNoteResponse.result === 1 && debitNoteResponse.data) {
            console.log("New debit note data:", debitNoteResponse.data)
            const debitNoteData = Array.isArray(debitNoteResponse.data)
              ? debitNoteResponse.data[0]
              : debitNoteResponse.data

            console.log("New debitNoteData", debitNoteData)
            setDebitNoteHd(debitNoteData as IDebitNoteHd)
          }

          toast.success(
            `Debit note created successfully for ${foundItems.length} item(s)`
          )
        }
      } catch (error) {
        console.error("Error handling debit note:", error)
        toast.error("Failed to handle debit note")
      }
    },
    [debitNoteMutation, data, jobData]
  )

  const handlePurchase = useCallback(() => setShowPurchaseModal(true), [])
  const handleCreateCrewSignOff = useCallback(() => {
    setSelectedItem(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }, [])

  const handleRefreshCrewSignOff = useCallback(() => {
    refetch()
  }, [refetch])

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

  const handleConfirmDeleteDebitNote = useCallback(() => {
    if (debitNoteDeleteConfirmation.debitNoteId) {
      toast.promise(
        debitNoteDeleteMutation.mutateAsync(
          `${jobData.jobOrderId}/${Task.CrewSignOff}/${debitNoteDeleteConfirmation.debitNoteId}`
        ),
        {
          loading: `Deleting debit note ${debitNoteDeleteConfirmation.debitNoteNo}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["crewSignOff"] })
            queryClient.invalidateQueries({ queryKey: ["debitNote"] })
            onTaskAdded?.()
            setShowDebitNoteModal(false)
            setDebitNoteHd(null)
            return `Debit note ${debitNoteDeleteConfirmation.debitNoteNo} has been deleted`
          },
          error: "Failed to delete debit note",
        }
      )
      setDebitNoteDeleteConfirmation({
        isOpen: false,
        debitNoteId: null,
        debitNoteNo: null,
      })
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
          <CrewSignOffTable
            data={data || []}
            onCrewSignOffSelect={handleSelect}
            onDeleteCrewSignOff={handleDelete}
            onEditCrewSignOff={handleEdit}
            onCreateCrewSignOff={handleCreateCrewSignOff}
            onCombinedService={handleCombinedService}
            onDebitNote={handleDebitNote}
            onPurchase={handlePurchase}
            onRefresh={handleRefreshCrewSignOff}
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
            <DialogTitle>Crew Sign Off</DialogTitle>
            <DialogDescription>
              Add or edit crew sign off details for this job order.
            </DialogDescription>
          </DialogHeader>
          <CrewSignOffForm
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
            taskId={Task.CrewSignOff}
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
              Manage debit note details for this crew sign off.
            </DialogDescription>
          </DialogHeader>
          <DebitNote
            taskId={Task.CrewSignOff}
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
              Manage purchase details for this crew sign off.
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
        title="Delete Crew Sign Off"
        description="This action cannot be undone. This will permanently delete the crew sign off from our servers."
        itemName={deleteConfirmation.crewSignOffName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            crewSignOffId: null,
            crewSignOffName: null,
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
    </>
  )
}
