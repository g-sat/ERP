"use client"

import { useCallback, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { ICharge, IChargeFilter } from "@/interfaces/charge"
import { ChargeSchemaType } from "@/schemas/charge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Charge } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"
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

import { ChargeForm } from "./components/charge-form"
import { ChargesTable } from "./components/charge-table"

export default function ChargePage() {
  const { companyId } = useParams()
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.charge

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<IChargeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IChargeFilter)
    },
    []
  )

  const {
    data: chargesResponse,
    refetch,
    isLoading,
  } = useGet<ICharge>(`${Charge.get}`, "charges", filters.search)

  const { result: chargesResult, data: chargesData } =
    (chargesResponse as ApiResponse<ICharge>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<ChargeSchemaType>(`${Charge.add}`)
  const updateMutation = usePersist<ChargeSchemaType>(`${Charge.add}`)
  const deleteMutation = useDelete(`${Charge.delete}`)

  const [selectedCharge, setSelectedCharge] = useState<ICharge | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCharge, setExistingCharge] = useState<ICharge | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    chargeId: string | null
    chargeName: string | null
    taskId: number | null
  }>({
    isOpen: false,
    chargeId: null,
    chargeName: null,
    taskId: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateCharge = () => {
    setModalMode("create")
    setSelectedCharge(null)
    setIsModalOpen(true)
  }

  const handleEditCharge = (charge: ICharge) => {
    setModalMode("edit")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  const handleViewCharge = (charge: ICharge | null) => {
    if (!charge) return
    setModalMode("view")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: ChargeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: ChargeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: ChargeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["charges"] })
        }
      } else if (modalMode === "edit" && selectedCharge) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["charges"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteCharge = (chargeId: string) => {
    const chargeToDelete = chargesData?.find(
      (b) => b.chargeId.toString() === chargeId
    )
    if (!chargeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      chargeId,
      chargeName: chargeToDelete.chargeName,
      taskId: chargeToDelete.taskId,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.chargeId && deleteConfirmation.taskId) {
      // Pass both chargeId and taskId for delete operation
      const deleteParams = `${deleteConfirmation.chargeId}/${deleteConfirmation.taskId}`
      deleteMutation.mutateAsync(deleteParams).then(() => {
        queryClient.invalidateQueries({ queryKey: ["charges"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        chargeId: null,
        chargeName: null,
        taskId: null,
      })
    }
  }

  const handleCodeBlur = useCallback(
    async (code: string, taskId?: number) => {
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode || !taskId) return

      try {
        const response = await getById(`${Charge.getByCode}/${trimmedCode}`)
        if (response?.result === 1 && response.data) {
          const chargeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (chargeData) {
            const validChargeData: ChargeSchemaType = {
              chargeId: chargeData.chargeId,
              chargeCode: chargeData.chargeCode,
              chargeName: chargeData.chargeName,
              taskId: chargeData.taskId,
              chargeOrder: chargeData.chargeOrder || 0,
              itemNo: chargeData.itemNo || 0,
              glId: chargeData.glId || 0,
              remarks: chargeData.remarks || "",
              isActive: chargeData.isActive ?? true,
            }
            setExistingCharge(validChargeData as ICharge)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  const handleLoadExistingCharge = () => {
    if (existingCharge) {
      setModalMode("edit")
      setSelectedCharge(existingCharge)
      setShowLoadDialog(false)
      setExistingCharge(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Charges
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage charge information and settings
          </p>
        </div>
      </div>

      {/* Charges Table */}
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
      ) : chargesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <ChargesTable
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
        <ChargesTable
          data={filters.search ? [] : chargesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewCharge : undefined}
          onDelete={canDelete ? handleDeleteCharge : undefined}
          onEdit={canEdit ? handleEditCharge : undefined}
          onCreate={canCreate ? handleCreateCharge : undefined}
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
              {modalMode === "create" && "Create Charge"}
              {modalMode === "edit" && "Update Charge"}
              {modalMode === "view" && "View Charge"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new charge to the system database."
                : modalMode === "edit"
                  ? "Update charge information in the system database."
                  : "View charge details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ChargeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedCharge || undefined
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
            companyId={companyId as string}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Charge Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCharge}
        onCancel={() => setExistingCharge(null)}
        code={existingCharge?.chargeCode}
        name={existingCharge?.chargeName}
        typeLabel="Charge"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Charge"
        description="This action cannot be undone. This will permanently delete the charge from our servers."
        itemName={deleteConfirmation.chargeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            chargeId: null,
            chargeName: null,
            taskId: null,
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
        title={modalMode === "create" ? "Create Charge" : "Update Charge"}
        itemName={saveConfirmation.data?.chargeName || ""}
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
