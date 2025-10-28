"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ILeaveType, ILeaveTypeFilter } from "@/interfaces/leavetype"
import { LeaveTypeSchemaType } from "@/schemas/leavetype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { LeaveType } from "@/lib/api-routes"
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

import { LeaveTypeForm } from "./components/leave-type-form"
import { LeaveTypesTable } from "./components/leave-type-table"

export default function LeaveTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.leaveType

  const queryClient = useQueryClient()
  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch leave types from the API using useGetWithPagination
  const [filters, setFilters] = useState<ILeaveTypeFilter>({})
  const { defaults } = useUserSettingDefaults()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    defaults?.common?.masterGridTotalRecords || 50
  )

  // Update page size when user settings change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ILeaveTypeFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Page size change handler
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  const {
    data: leaveTypesResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<ILeaveType>(
    `${LeaveType.get}`,
    "leaveTypes",
    filters.search,
    currentPage,
    pageSize
  )

  // Destructure with fallback values
  const {
    result: leaveTypesResult,
    data: leaveTypesData,
    totalRecords,
  } = (leaveTypesResponse as ApiResponse<ILeaveType>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<LeaveTypeSchemaType>(`${LeaveType.add}`)
  const updateMutation = usePersist<LeaveTypeSchemaType>(`${LeaveType.add}`)
  const deleteMutation = useDelete(`${LeaveType.delete}`)

  // State for modal and selected leave type
  const [selectedLeaveType, setSelectedLeaveType] = useState<ILeaveType | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingLeaveType, setExistingLeaveType] = useState<ILeaveType | null>(
    null
  )

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    leaveTypeId: string | null
    leaveTypeName: string | null
  }>({
    isOpen: false,
    leaveTypeId: null,
    leaveTypeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: LeaveTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new leave type
  const handleCreateLeaveType = () => {
    setModalMode("create")
    setSelectedLeaveType(null)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an leave type
  const handleEditLeaveType = (leaveType: ILeaveType) => {
    setModalMode("edit")
    setSelectedLeaveType(leaveType)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an leave type
  const handleViewLeaveType = (leaveType: ILeaveType | null) => {
    if (!leaveType) return
    setModalMode("view")
    setSelectedLeaveType(leaveType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: LeaveTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: LeaveTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["leaveTypes"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedLeaveType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["leaveTypes"] })
          setIsModalOpen(false)
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an leave type
  const handleDeleteLeaveType = (leaveTypeId: string) => {
    const leaveTypeToDelete = leaveTypesData?.find(
      (at) => at.leaveTypeId.toString() === leaveTypeId
    )
    if (!leaveTypeToDelete) return

    // Open delete confirmation dialog with leave type details
    setDeleteConfirmation({
      isOpen: true,
      leaveTypeId,
      leaveTypeName: leaveTypeToDelete.leaveTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.leaveTypeId) {
      deleteMutation.mutateAsync(deleteConfirmation.leaveTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["leaveTypes"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        leaveTypeId: null,
        leaveTypeName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${LeaveType.getByCode}/${trimmedCode}`)
        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const leaveTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (leaveTypeData) {
            // Ensure all required fields are present
            const validLeaveTypeData: ILeaveType = {
              leaveTypeId: leaveTypeData.leaveTypeId,
              leaveTypeCode: leaveTypeData.leaveTypeCode,
              leaveTypeName: leaveTypeData.leaveTypeName,
              remarks: leaveTypeData.remarks || "",
              isActive: leaveTypeData.isActive ?? true,
              companyId: leaveTypeData.companyId,
              createBy: leaveTypeData.createBy,
              editBy: leaveTypeData.editBy,
              createDate: leaveTypeData.createDate,
              editDate: leaveTypeData.editDate,
            }
            setExistingLeaveType(validLeaveTypeData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing leave type
  const handleLoadExistingLeaveType = () => {
    if (existingLeaveType) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedLeaveType(existingLeaveType)
      setShowLoadDialog(false)
      setExistingLeaveType(null)
    }
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Leave Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage leave type information and settings
          </p>
        </div>
      </div>

      {/* Leave Types Table */}
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
      ) : leaveTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <LeaveTypesTable
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
            canEdit={false}
            canDelete={false}
            canView={false}
            canCreate={false}
          />
        </LockSkeleton>
      ) : (
        <LeaveTypesTable
          data={leaveTypesData || []}
          isLoading={isLoading}
          totalRecords={totalRecords}
          onSelect={canView ? handleViewLeaveType : undefined}
          onDelete={canDelete ? handleDeleteLeaveType : undefined}
          onEdit={canEdit ? handleEditLeaveType : undefined}
          onCreate={canCreate ? handleCreateLeaveType : undefined}
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
              {modalMode === "create" && "Create Leave Type"}
              {modalMode === "edit" && "Update Leave Type"}
              {modalMode === "view" && "View Leave Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new leave type to the system database."
                : modalMode === "edit"
                  ? "Update leave type information in the system database."
                  : "View leave type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <LeaveTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedLeaveType || undefined
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Leave Type Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingLeaveType}
        onCancel={() => setExistingLeaveType(null)}
        code={existingLeaveType?.leaveTypeCode}
        name={existingLeaveType?.leaveTypeName}
        typeLabel="Leave Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Leave Type"
        description="This action cannot be undone. This will permanently delete the leave type from our servers."
        itemName={deleteConfirmation.leaveTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            leaveTypeId: null,
            leaveTypeName: null,
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
        title={
          modalMode === "create" ? "Create Leave Type" : "Update Leave Type"
        }
        itemName={saveConfirmation.data?.leaveTypeName || ""}
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
