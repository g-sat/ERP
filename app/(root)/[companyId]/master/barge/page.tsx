"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IBarge, IBargeFilter } from "@/interfaces/barge"
import { BargeFormValues } from "@/schemas/barge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
  const [isLocked, setIsLocked] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)

  const {
    data: bargesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IBarge>(`${Barge.get}`, "barges", filters.search)

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
      setIsEmpty(true)
      setFilters({})
    } else if (bargesResponse.result === -2 && !isLocked) {
      setIsLocked(true)
      toast.error("This section is locked. Please contact administrator.")
    } else if (bargesResponse.result !== -2) {
      setIsLocked(false)
      setIsEmpty(false)
    }
  }, [bargesResponse])

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

  const handleFormSubmit = async (data: BargeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IBarge>
        if (response.result === 1) {
          toast.success("Barge created successfully")
          queryClient.invalidateQueries({ queryKey: ["barges"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create barge")
        }
      } else if (modalMode === "edit" && selectedBarge) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IBarge>
        if (response.result === 1) {
          toast.success("Barge updated successfully")
          queryClient.invalidateQueries({ queryKey: ["barges"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update barge")
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
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
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.bargeId), {
        loading: `Deleting ${deleteConfirmation.bargeName}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["barges"] })
          return `${deleteConfirmation.bargeName} has been deleted`
        },
        error: "Failed to delete barge",
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
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Barges</h1>
          <p className="text-muted-foreground text-sm">
            Manage barge information and settings
          </p>
        </div>
      </div>

      {isLoading || isRefetching ? (
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
            data={isEmpty ? [] : bargesData || []}
            onBargeSelect={canView ? handleViewBarge : undefined}
            onDeleteBarge={canDelete ? handleDeleteBarge : undefined}
            onEditBarge={canEdit ? handleEditBarge : undefined}
            onCreateBarge={canCreate ? handleCreateBarge : undefined}
            onRefresh={() => {
              handleRefresh()
              toast("Refreshing data...Fetching the latest barge data.")
            }}
            onFilterChange={setFilters}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </LockSkeleton>
      ) : bargesResult ? (
        <BargesTable
          data={isEmpty ? [] : bargesData || []}
          onBargeSelect={canView ? handleViewBarge : undefined}
          onDeleteBarge={canDelete ? handleDeleteBarge : undefined}
          onEditBarge={canEdit ? handleEditBarge : undefined}
          onCreateBarge={canCreate ? handleCreateBarge : undefined}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest barge data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div>No data available</div>
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
