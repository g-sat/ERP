"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IBarge, IBargeFilter } from "@/interfaces/barge"
import { BargeSchemaType } from "@/schemas/barge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Barge } from "@/lib/api-routes"
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

import { BargeForm } from "./components/barge-form"
import { BargeTable } from "./components/barge-table"

export default function BargePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.barge

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch account groups from the API using useGet
  const [filters, setFilters] = useState<IBargeFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IBargeFilter)
    },
    []
  )

  const {
    data: bargesResponse,
    refetch,
    isLoading,
  } = useGet<IBarge>(`${Barge.get}`, "barges", filters.search)

  // Destructure with fallback values
  const { result: bargesResult, data: bargesData } =
    (bargesResponse as ApiResponse<IBarge>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!bargesResponse) return

    if (bargesResponse.result === -1) {
      setFilters({})
    } else if (bargesResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (bargesResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [bargesResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<BargeSchemaType>(`${Barge.add}`)
  const updateMutation = usePersist<BargeSchemaType>(`${Barge.add}`)
  const deleteMutation = useDelete(`${Barge.delete}`)

  // State for modal and selected account group
  const [selectedBarge, setSelectedBarge] = useState<IBarge | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingBarge, setExistingBarge] = useState<IBarge | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    bargeId: string | null
    bargeName: string | null
  }>({
    isOpen: false,
    bargeId: null,
    bargeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: BargeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account group
  const handleCreateBarge = () => {
    setModalMode("create")
    setSelectedBarge(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account group
  const handleEditBarge = (barge: IBarge) => {
    setModalMode("edit")
    setSelectedBarge(barge)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account group
  const handleViewBarge = (barge: IBarge | null) => {
    if (!barge) return
    setModalMode("view")
    setSelectedBarge(barge)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: BargeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: BargeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the barges query
          queryClient.invalidateQueries({ queryKey: ["barges"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedBarge) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the barges query
          queryClient.invalidateQueries({ queryKey: ["barges"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an account group
  const handleDeleteBarge = (bargeId: string) => {
    const bargeToDelete = bargesData?.find(
      (ag) => ag.bargeId.toString() === bargeId
    )
    if (!bargeToDelete) return

    // Open delete confirmation dialog with account group details
    setDeleteConfirmation({
      isOpen: true,
      bargeId,
      bargeName: bargeToDelete.bargeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.bargeId) {
      deleteMutation.mutateAsync(deleteConfirmation.bargeId).then(() => {
        // Invalidate and refetch the barges query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["barges"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        bargeId: null,
        bargeName: null,
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
        const response = await getById(`${Barge.getByCode}/${trimmedCode}`)

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const bargeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (bargeData) {
            // Ensure all required fields are present
            const validBargeData: IBarge = {
              bargeId: bargeData.bargeId,
              bargeName: bargeData.bargeName,
              bargeCode: bargeData.bargeCode,
              callSign: bargeData.callSign,
              imoCode: bargeData.imoCode,
              grt: bargeData.grt,
              licenseNo: bargeData.licenseNo,
              bargeType: bargeData.bargeType,
              flag: bargeData.flag,
              remarks: bargeData.remarks || "",
              isActive: bargeData.isActive ?? true,
              isOwn: bargeData.isOwn ?? true,
              companyId: bargeData.companyId,
              createBy: bargeData.createBy,
              editBy: bargeData.editBy,
              createDate: bargeData.createDate,
              editDate: bargeData.editDate,
            }

            setExistingBarge(validBargeData)
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
  const handleLoadExistingBarge = () => {
    if (existingBarge) {
      setModalMode("edit")
      setSelectedBarge(existingBarge)
      setShowLoadDialog(false)
      setExistingBarge(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Barges
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage barge information and settings
          </p>
        </div>
      </div>

      {/* Barges Table */}
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
      ) : bargesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <BargeTable
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
        <BargeTable
          data={filters.search ? [] : bargesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewBarge : undefined}
          onDelete={canDelete ? handleDeleteBarge : undefined}
          onEdit={canEdit ? handleEditBarge : undefined}
          onCreate={canCreate ? handleCreateBarge : undefined}
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
              {modalMode === "create" && "Create Barge"}
              {modalMode === "edit" && "Update Barge"}
              {modalMode === "view" && "View Barge"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new barge to the system database."
                : modalMode === "edit"
                  ? "Update barge information in the system database."
                  : "View barge details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <BargeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedBarge
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
        onLoad={handleLoadExistingBarge}
        onCancel={() => setExistingBarge(null)}
        code={existingBarge?.bargeCode}
        name={existingBarge?.bargeName}
        typeLabel="Barge"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Barge"
        description="This action cannot be undone. This will permanently delete the barge from our servers."
        itemName={deleteConfirmation.bargeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            bargeId: null,
            bargeName: null,
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
        title={modalMode === "create" ? "Create Barge" : "Update Barge"}
        itemName={saveConfirmation.data?.bargeName || ""}
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
