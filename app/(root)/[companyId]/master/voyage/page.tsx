"use client"

import { useCallback, useEffect, useState } from "react"
import { IVoyage, IVoyageFilter } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { VoyageSchemaType } from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Voyage } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { VoyageForm } from "./components/voyage-form"
import { VoyageTable } from "./components/voyage-table"

export default function VoyagePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.voyage

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch account groups from the API using useGet
  const [filters, setFilters] = useState<IVoyageFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IVoyageFilter)
    },
    []
  )

  const {
    data: voyagesResponse,
    refetch,
    isLoading,
  } = useGet<IVoyage>(`${Voyage.get}`, "voyages", filters.search)

  // Destructure with fallback values
  const { result: voyagesResult, data: voyagesData } =
    (voyagesResponse as ApiResponse<IVoyage>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!voyagesResponse) return

    if (voyagesResponse.result === -1) {
      setFilters({})
    } else if (voyagesResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (voyagesResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [voyagesResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<VoyageSchemaType>(`${Voyage.add}`)
  const updateMutation = usePersist<VoyageSchemaType>(`${Voyage.add}`)
  const deleteMutation = useDelete(`${Voyage.delete}`)

  // State for modal and selected account group
  const [selectedVoyage, setSelectedVoyage] = useState<IVoyage | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingVoyage, setExistingVoyage] = useState<IVoyage | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    voyageId: string | null
    voyageName: string | null
  }>({
    isOpen: false,
    voyageId: null,
    voyageName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: VoyageSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account group
  const handleCreateVoyage = () => {
    setModalMode("create")
    setSelectedVoyage(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account group
  const handleEditVoyage = (voyage: IVoyage) => {
    setModalMode("edit")
    setSelectedVoyage(voyage)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account group
  const handleViewVoyage = (voyage: IVoyage | null) => {
    if (!voyage) return
    setModalMode("view")
    setSelectedVoyage(voyage)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: VoyageSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: VoyageSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the voyages query
          queryClient.invalidateQueries({ queryKey: ["voyages"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedVoyage) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the voyages query
          queryClient.invalidateQueries({ queryKey: ["voyages"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an account group
  const handleDeleteVoyage = (voyageId: string) => {
    const voyageToDelete = voyagesData?.find(
      (ag) => ag.voyageId.toString() === voyageId
    )
    if (!voyageToDelete) return

    // Open delete confirmation dialog with account group details
    setDeleteConfirmation({
      isOpen: true,
      voyageId,
      voyageName: voyageToDelete.voyageNo,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.voyageId) {
      deleteMutation.mutateAsync(deleteConfirmation.voyageId).then(() => {
        // Invalidate and refetch the voyages query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["voyages"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        voyageId: null,
        voyageName: null,
      })
    }
  }

  // Handler for code availability check (memoized to prevent unnecessary re-renders)
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) {
        return
      }

      try {
        const response = await getById(`${Voyage.getByCode}/${trimmedCode}`)

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const voyageData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (voyageData) {
            // Ensure all required fields are present
            const validVoyageData: IVoyage = {
              voyageId: voyageData.voyageId,
              voyageNo: voyageData.voyageNo,
              referenceNo: voyageData.referenceNo,
              vesselId: voyageData.vesselId,
              bargeId: voyageData.bargeId,
              isActive: voyageData.isActive,
              remarks: voyageData.remarks,
              createBy: voyageData.createBy,
              editBy: voyageData.editBy,
              createDate: voyageData.createDate,
              editDate: voyageData.editDate,
            }

            setExistingVoyage(validVoyageData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing account group
  const handleLoadExistingVoyage = () => {
    if (existingVoyage) {
      setModalMode("edit")
      setSelectedVoyage(existingVoyage)
      setShowLoadDialog(false)
      setExistingVoyage(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Voyages
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage voyage information and settings
          </p>
        </div>
      </div>

      {/* Voyages Table */}
      {isLoading ? (
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : voyagesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <VoyageTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            canView={false}
            canCreate={false}
            canEdit={false}
            canDelete={false}
          />
        </LockSkeleton>
      ) : (
        <VoyageTable
          data={filters.search ? [] : voyagesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewVoyage : undefined}
          onDelete={canDelete ? handleDeleteVoyage : undefined}
          onEdit={canEdit ? handleEditVoyage : undefined}
          onCreate={canCreate ? handleCreateVoyage : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      )}

      {/* Modal for Create, Edit, and View */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Voyage"}
              {modalMode === "edit" && "Update Voyage"}
              {modalMode === "view" && "View Voyage"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new voyage to the system database."
                : modalMode === "edit"
                  ? "Update voyage information in the system database."
                  : "View voyage details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <VoyageForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedVoyage
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={
              modalMode === "view" ||
              (modalMode === "create" && !canCreate) ||
              (modalMode === "edit" && !canEdit)
            }
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Account Group Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingVoyage}
        onCancel={() => setExistingVoyage(null)}
        code={existingVoyage?.voyageNo}
        name={existingVoyage?.voyageNo}
        typeLabel="Voyage"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Voyage"
        description="This action cannot be undone. This will permanently delete the voyage from our servers."
        itemName={deleteConfirmation.voyageName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            voyageId: null,
            voyageName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={modalMode === "create" ? "Create Voyage" : "Update Voyage"}
        itemName={saveConfirmation.data?.voyageNo || ""}
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
