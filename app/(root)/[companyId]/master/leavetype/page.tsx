"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ILeaveType, ILeaveTypeFilter } from "@/interfaces/leavetype"
import { LeaveTypeFormValues } from "@/schemas/leavetype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { LeaveType } from "@/lib/api-routes"
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
import { LoadConfirmation } from "@/components/load-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { LeaveTypeForm } from "./components/leave-type-form"
import { LeaveTypesTable } from "./components/leave-type-table"

export default function LeaveTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.leaveType

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch leave types from the API using useGet
  const [filters, setFilters] = useState<ILeaveTypeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as ILeaveTypeFilter)
    },
    []
  )

  const {
    data: leaveTypesResponse,
    refetch,
    isLoading,
  } = useGet<ILeaveType>(`${LeaveType.get}`, "leaveTypes", filters.search)

  // Destructure with fallback values
  const { result: leaveTypesResult, data: leaveTypesData } =
    (leaveTypesResponse as ApiResponse<ILeaveType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<LeaveTypeFormValues>(`${LeaveType.add}`)
  const updateMutation = usePersist<LeaveTypeFormValues>(`${LeaveType.add}`)
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
  const [codeToCheck, setCodeToCheck] = useState<string>("")

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
    data: LeaveTypeFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ILeaveType>(
    `${LeaveType.getByCode}`,
    "leaveTypeByCode",
    codeToCheck
  )

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
    console.log("Edit Leave Type:", leaveType)
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
  const handleFormSubmit = (data: LeaveTypeFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: LeaveTypeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["leaveTypes"] })
        }
      } else if (modalMode === "edit" && selectedLeaveType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["leaveTypes"] })
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
  const handleCodeBlur = async (code: string) => {
    // Skip if:
    // 1. In edit mode
    // 2. In read-only mode
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    setCodeToCheck(trimmedCode)
    try {
      const response = await checkCodeAvailability()
      console.log("Full API Response:", response)

      // Check if response has data and it's not empty
      if (response?.data?.result === 1 && response.data.data) {
        console.log("Response data:", response.data.data)

        // Handle both array and single object responses
        const leaveTypeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed leaveTypeData:", leaveTypeData)

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

          console.log("Setting existing leave type:", validLeaveTypeData)
          setExistingLeaveType(validLeaveTypeData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing leave type
  const handleLoadExistingLeaveType = () => {
    if (existingLeaveType) {
      // Log the data we're about to set
      console.log("About to load leave type data:", {
        existingLeaveType,
        currentModalMode: modalMode,
        currentSelectedLeaveType: selectedLeaveType,
      })

      // Set the states
      setModalMode("edit")
      setSelectedLeaveType(existingLeaveType)
      setShowLoadDialog(false)
      setExistingLeaveType(null)
    }
  }

  const queryClient = useQueryClient()

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
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
          data={filters.search ? [] : leaveTypesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewLeaveType : undefined}
          onDelete={canDelete ? handleDeleteLeaveType : undefined}
          onEdit={canEdit ? handleEditLeaveType : undefined}
          onCreate={canCreate ? handleCreateLeaveType : undefined}
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
            onCancel={() => setIsModalOpen(false)}
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
