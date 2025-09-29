"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ILoanType, ILoanTypeFilter } from "@/interfaces/loantype"
import { LoanTypeSchemaType } from "@/schemas/loantype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { LoanType } from "@/lib/api-routes"
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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { LoanTypeForm } from "./components/loan-type-form"
import { LoanTypesTable } from "./components/loan-type-table"

export default function LoanTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.loanType

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch loan types from the API using useGet
  const [filters, setFilters] = useState<ILoanTypeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as ILoanTypeFilter)
    },
    []
  )

  const {
    data: loanTypesResponse,
    refetch,
    isLoading,
  } = useGet<ILoanType>(`${LoanType.get}`, "loanTypes", filters.search)

  // Destructure with fallback values
  const { result: loanTypesResult, data: loanTypesData } =
    (loanTypesResponse as ApiResponse<ILoanType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<LoanTypeSchemaType>(`${LoanType.add}`)
  const updateMutation = usePersist<LoanTypeSchemaType>(`${LoanType.add}`)
  const deleteMutation = useDelete(`${LoanType.delete}`)

  // State for modal and selected loan type
  const [selectedLoanType, setSelectedLoanType] = useState<ILoanType | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingLoanType, setExistingLoanType] = useState<ILoanType | null>(
    null
  )
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    loanTypeId: string | null
    loanTypeName: string | null
  }>({
    isOpen: false,
    loanTypeId: null,
    loanTypeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: LoanTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ILoanType>(
    `${LoanType.getByCode}`,
    "loanTypeByCode",
    codeToCheck
  )

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new loan type
  const handleCreateLoanType = () => {
    setModalMode("create")
    setSelectedLoanType(null)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an loan type
  const handleEditLoanType = (loanType: ILoanType) => {
    console.log("Edit Loan Type:", loanType)
    setModalMode("edit")
    setSelectedLoanType(loanType)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an loan type
  const handleViewLoanType = (loanType: ILoanType | null) => {
    if (!loanType) return
    setModalMode("view")
    setSelectedLoanType(loanType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: LoanTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: LoanTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["loanTypes"] })
        }
      } else if (modalMode === "edit" && selectedLoanType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["loanTypes"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an loan type
  const handleDeleteLoanType = (loanTypeId: string) => {
    const loanTypeToDelete = loanTypesData?.find(
      (at) => at.loanTypeId.toString() === loanTypeId
    )
    if (!loanTypeToDelete) return

    // Open delete confirmation dialog with loan type details
    setDeleteConfirmation({
      isOpen: true,
      loanTypeId,
      loanTypeName: loanTypeToDelete.loanTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.loanTypeId) {
      deleteMutation.mutateAsync(deleteConfirmation.loanTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["loanTypes"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        loanTypeId: null,
        loanTypeName: null,
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
        const loanTypeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed loanTypeData:", loanTypeData)

        if (loanTypeData) {
          // Ensure all required fields are present
          const validLoanTypeData: ILoanType = {
            loanTypeId: loanTypeData.loanTypeId,
            loanTypeCode: loanTypeData.loanTypeCode,
            loanTypeName: loanTypeData.loanTypeName,
            interestRatePct: loanTypeData.interestRatePct,
            maxTermMonths: loanTypeData.maxTermMonths,
            minTermMonths: loanTypeData.minTermMonths,
            createBy: loanTypeData.createBy,
            editBy: loanTypeData.editBy,
            createDate: loanTypeData.createDate,
            editDate: loanTypeData.editDate,
          }

          console.log("Setting existing loan type:", validLoanTypeData)
          setExistingLoanType(validLoanTypeData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing loan type
  const handleLoadExistingLoanType = () => {
    if (existingLoanType) {
      // Log the data we're about to set
      console.log("About to load loan type data:", {
        existingLoanType,
        currentModalMode: modalMode,
        currentSelectedLoanType: selectedLoanType,
      })

      // Set the states
      setModalMode("edit")
      setSelectedLoanType(existingLoanType)
      setShowLoadDialog(false)
      setExistingLoanType(null)
    }
  }

  const queryClient = useQueryClient()

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Loan Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage loan type information and settings
          </p>
        </div>
      </div>

      {/* Loan Types Table */}
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
      ) : loanTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <LoanTypesTable
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
        <LoanTypesTable
          data={filters.search ? [] : loanTypesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewLoanType : undefined}
          onDelete={canDelete ? handleDeleteLoanType : undefined}
          onEdit={canEdit ? handleEditLoanType : undefined}
          onCreate={canCreate ? handleCreateLoanType : undefined}
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
              {modalMode === "create" && "Create Loan Type"}
              {modalMode === "edit" && "Update Loan Type"}
              {modalMode === "view" && "View Loan Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new loan type to the system database."
                : modalMode === "edit"
                  ? "Update loan type information in the system database."
                  : "View loan type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <LoanTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedLoanType || undefined
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

      {/* Load Existing Loan Type Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingLoanType}
        onCancel={() => setExistingLoanType(null)}
        code={existingLoanType?.loanTypeCode}
        name={existingLoanType?.loanTypeName}
        typeLabel="Loan Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Loan Type"
        description="This action cannot be undone. This will permanently delete the loan type from our servers."
        itemName={deleteConfirmation.loanTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            loanTypeId: null,
            loanTypeName: null,
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
        title={modalMode === "create" ? "Create Loan Type" : "Update Loan Type"}
        itemName={saveConfirmation.data?.loanTypeName || ""}
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
