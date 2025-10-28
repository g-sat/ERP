"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse, ICharge, IChargeFilter } from "@/interfaces"
import { ChargeSchemaType } from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Charge } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGetWithPagination, usePersist } from "@/hooks/use-common"
import { useUserSettingDefaults } from "@/hooks/use-settings"
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
import { ChargeTable } from "./components/charge-table"

export default function ChargePage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.charge

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch account groups from the API using useGet
  const [filters, setFilters] = useState<IChargeFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Get user setting defaults
  const { defaults } = useUserSettingDefaults()

  // Update page size when defaults change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IChargeFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const {
    data: chargesResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<ICharge>(
    `${Charge.get}`,
    "charges",
    filters.search,
    currentPage,
    pageSize
  )

  // Destructure with fallback values
  const {
    result: chargesResult,
    data: chargesData,
    totalRecords,
  } = (chargesResponse as ApiResponse<ICharge>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!chargesResponse) return

    if (chargesResponse.result === -1) {
      setFilters({})
    } else if (chargesResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (chargesResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [chargesResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<ChargeSchemaType>(`${Charge.add}`)
  const updateMutation = usePersist<ChargeSchemaType>(`${Charge.add}`)
  const deleteMutation = useDelete(`${Charge.delete}`)

  // State for modal and selected account group
  const [selectedCharge, setSelectedCharge] = useState<ICharge | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCharge, setExistingCharge] = useState<ICharge | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    chargeId: string | null
    chargeName: string | null
  }>({
    isOpen: false,
    chargeId: null,
    chargeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: ChargeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account group
  const handleCreateCharge = () => {
    setModalMode("create")
    setSelectedCharge(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account group
  const handleEditCharge = (charge: ICharge) => {
    setModalMode("edit")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account group
  const handleViewCharge = (charge: ICharge | null) => {
    if (!charge) return
    setModalMode("view")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

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
          // Invalidate and refetch the charges query
          queryClient.invalidateQueries({ queryKey: ["charges"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedCharge) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the charges query
          queryClient.invalidateQueries({ queryKey: ["charges"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an account group
  const handleDeleteCharge = (chargeId: string) => {
    const chargeToDelete = chargesData?.find(
      (ag) => ag.chargeId.toString() === chargeId
    )
    if (!chargeToDelete) return

    // Open delete confirmation dialog with account group details
    setDeleteConfirmation({
      isOpen: true,
      chargeId,
      chargeName: chargeToDelete.chargeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.chargeId) {
      deleteMutation.mutateAsync(deleteConfirmation.chargeId).then(() => {
        // Invalidate and refetch the charges query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["charges"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        chargeId: null,
        chargeName: null,
      })
    }
  }

  // Handler for code availability check (memoized to prevent unnecessary re-renders)
  const handleCodeBlur = useCallback(
    async (code: string, taskId: number) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) {
        return
      }

      try {
        const response = await getById(
          `${Charge.getByCode}/${trimmedCode}/${taskId}`
        )

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const chargeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (chargeData) {
            // Ensure all required fields are present
            const validChargeData: ICharge = {
              chargeId: chargeData.chargeId,
              chargeCode: chargeData.chargeCode,
              chargeName: chargeData.chargeName,
              taskId: chargeData.taskId,
              chargeOrder: chargeData.chargeOrder,
              itemNo: chargeData.itemNo,
              glId: chargeData.glId,
              isActive: chargeData.isActive,
              remarks: chargeData.remarks || "",
              createBy: chargeData.createBy,
              editBy: chargeData.editBy,
              createDate: chargeData.createDate,
              editDate: chargeData.editDate,
              createById: chargeData.createById,
              editById: chargeData.editById,
              companyId: chargeData.companyId,
              taskName: chargeData.taskName,
              glName: chargeData.glName,
            }

            setExistingCharge(validChargeData)
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
  const handleLoadExistingCharge = () => {
    if (existingCharge) {
      setModalMode("edit")
      setSelectedCharge(existingCharge)
      setShowLoadDialog(false)
      setExistingCharge(null)
    }
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
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

      {/* Account Groups Table */}
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
          <ChargeTable
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
        <ChargeTable
          data={chargesData || []}
          isLoading={isLoading}
          totalRecords={totalRecords}
          onSelect={canView ? handleViewCharge : undefined}
          onDelete={canDelete ? handleDeleteCharge : undefined}
          onEdit={canEdit ? handleEditCharge : undefined}
          onCreate={canCreate ? handleCreateCharge : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
          serverSidePagination={true}
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
                ? selectedCharge
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view" || !canEdit}
            onCodeBlur={handleCodeBlur}
            companyId={companyId}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Account Group Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCharge}
        onCancel={() => setExistingCharge(null)}
        code={existingCharge?.chargeCode}
        name={existingCharge?.chargeName}
        typeLabel="Account Group"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Account Type"
        description="This action cannot be undone. This will permanently delete the account type from our servers."
        itemName={deleteConfirmation.chargeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            chargeId: null,
            chargeName: null,
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
