"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IBarge, IBargeFilter } from "@/interfaces/barge"
import { BargeFormValues } from "@/schemas/barge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Barge } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
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
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { BargeForm } from "./components/barge-form"
import { BargesTable } from "./components/barge-table"

export default function BargePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.barge

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")

  const [filters, setFilters] = useState<IBargeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IBargeFilter)
    },
    []
  )

  const {
    data: bargesResponse,
    refetch,
    isLoading,
  } = useGet<IBarge>(`${Barge.get}`, "barges", filters.search)

  const { result: bargesResult, data: bargesData } =
    (bargesResponse as ApiResponse<IBarge>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<BargeFormValues>(`${Barge.add}`)
  const updateMutation = usePersist<BargeFormValues>(`${Barge.add}`)
  const deleteMutation = useDelete(`${Barge.delete}`)

  const [selectedBarge, setSelectedBarge] = useState<IBarge | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingBarge, setExistingBarge] = useState<IBarge | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    bargeId: string | null
    bargeName: string | null
  }>({
    isOpen: false,
    bargeId: null,
    bargeName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IBarge>(
    `${Barge.getByCode}`,
    "bargeByCode",

    codeToCheck
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateBarge = () => {
    setModalMode("create")
    setSelectedBarge(null)
    setIsModalOpen(true)
  }

  const handleEditBarge = (barge: IBarge) => {
    setModalMode("edit")
    setSelectedBarge(barge)
    setIsModalOpen(true)
  }

  const handleViewBarge = (barge: IBarge | null) => {
    if (!barge) return
    setModalMode("view")
    setSelectedBarge(barge)
    setIsModalOpen(true)
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: BargeFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: BargeFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: BargeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["barges"] })
        }
      } else if (modalMode === "edit" && selectedBarge) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["barges"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteBarge = (bargeId: string) => {
    const bargeToDelete = bargesData?.find(
      (b) => b.bargeId.toString() === bargeId
    )
    if (!bargeToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      bargeId,
      bargeName: bargeToDelete.bargeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.bargeId) {
      deleteMutation.mutateAsync(deleteConfirmation.bargeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["barges"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        bargeId: null,
        bargeName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = async (code: string) => {
    if (!code.trim()) return

    setCodeToCheck(code)
    try {
      const response = await checkCodeAvailability()
      if (
        response &&
        response.data &&
        response.data.result === 1 &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setExistingBarge(response.data.data[0])
        setShowLoadDialog(true)
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  const handleLoadExistingBarge = () => {
    if (existingBarge) {
      setSelectedBarge(existingBarge)
      setModalMode("edit")
      setIsModalOpen(true)
    }
    setShowLoadDialog(false)
    setExistingBarge(null)
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
      ) : bargesResult === -2 ? (
        <LockSkeleton locked={true}>
          <BargesTable
            data={[]}
            isLoading={false}
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
        </LockSkeleton>
      ) : bargesResult === 1 ? (
        <BargesTable
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
      ) : (
        <BargesTable
          data={[]}
          isLoading={false}
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
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view" || !canEdit}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

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

      {/* Load Existing Barge Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingBarge}
        onCancel={() => setExistingBarge(null)}
        code={existingBarge?.bargeCode}
        name={existingBarge?.bargeName}
        typeLabel="Barge"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
