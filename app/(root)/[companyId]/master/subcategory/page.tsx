"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse, ISubCategory, ISubCategoryFilter } from "@/interfaces"
import { SubCategorySchemaType } from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { SubCategory } from "@/lib/api-routes"
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

import { SubCategoryForm } from "./components/subcategory-form"
import { SubCategoryTable } from "./components/subcategory-table"

export default function SubCategoryPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.subCategory

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch subCategory  from the API using useGet
  const [filters, setFilters] = useState<ISubCategoryFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ISubCategoryFilter)
    },
    []
  )

  const {
    data: subCategorysResponse,
    refetch,
    isLoading,
  } = useGet<ISubCategory>(`${SubCategory.get}`, "subCategorys", filters.search)

  // Destructure with fallback values
  const { result: subCategorysResult, data: subCategorysData } =
    (subCategorysResponse as ApiResponse<ISubCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!subCategorysResponse) return

    if (subCategorysResponse.result === -1) {
      setFilters({})
    } else if (subCategorysResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (subCategorysResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [subCategorysResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<SubCategorySchemaType>(`${SubCategory.add}`)
  const updateMutation = usePersist<SubCategorySchemaType>(`${SubCategory.add}`)
  const deleteMutation = useDelete(`${SubCategory.delete}`)

  // State for modal and selected subCategory group
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    ISubCategory | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingSubCategory, setExistingSubCategory] =
    useState<ISubCategory | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    subCategoryId: string | null
    subCategoryName: string | null
  }>({
    isOpen: false,
    subCategoryId: null,
    subCategoryName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: SubCategorySchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new subCategory group
  const handleCreateSubCategory = () => {
    setModalMode("create")
    setSelectedSubCategory(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an subCategory group
  const handleEditSubCategory = (subCategory: ISubCategory) => {
    setModalMode("edit")
    setSelectedSubCategory(subCategory)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an subCategory group
  const handleViewSubCategory = (subCategory: ISubCategory | null) => {
    if (!subCategory) return
    setModalMode("view")
    setSelectedSubCategory(subCategory)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: SubCategorySchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: SubCategorySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the subCategorys query
          queryClient.invalidateQueries({ queryKey: ["subCategorys"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedSubCategory) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the subCategorys query
          queryClient.invalidateQueries({ queryKey: ["subCategorys"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an subCategory group
  const handleDeleteSubCategory = (subCategoryId: string) => {
    const subCategoryToDelete = subCategorysData?.find(
      (ag) => ag.subCategoryId.toString() === subCategoryId
    )
    if (!subCategoryToDelete) return

    // Open delete confirmation dialog with subCategory group details
    setDeleteConfirmation({
      isOpen: true,
      subCategoryId,
      subCategoryName: subCategoryToDelete.subCategoryName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.subCategoryId) {
      deleteMutation.mutateAsync(deleteConfirmation.subCategoryId).then(() => {
        // Invalidate and refetch the subCategorys query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["subCategorys"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        subCategoryId: null,
        subCategoryName: null,
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
        const response = await getById(
          `${SubCategory.getByCode}/${trimmedCode}`
        )

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const subCategoryData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (subCategoryData) {
            // Ensure all required fields are present
            const validSubCategoryData: ISubCategory = {
              subCategoryId: subCategoryData.subCategoryId,
              companyId: subCategoryData.companyId,
              subCategoryCode: subCategoryData.subCategoryCode,
              subCategoryName: subCategoryData.subCategoryName,
              remarks: subCategoryData.remarks || "",
              isActive: subCategoryData.isActive ?? true,
              createBy: subCategoryData.createBy,
              editBy: subCategoryData.editBy,
              createDate: subCategoryData.createDate,
              editDate: subCategoryData.editDate,
              createById: subCategoryData.createById,
              editById: subCategoryData.editById,
            }

            setExistingSubCategory(validSubCategoryData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing subCategory group
  const handleLoadExistingSubCategory = () => {
    if (existingSubCategory) {
      setModalMode("edit")
      setSelectedSubCategory(existingSubCategory)
      setShowLoadDialog(false)
      setExistingSubCategory(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            SubCategory Groups
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage subCategory group information and settings
          </p>
        </div>
      </div>

      {/* SubCategory Groups Table */}
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
      ) : subCategorysResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <SubCategoryTable
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
        <SubCategoryTable
          data={filters.search ? [] : subCategorysData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewSubCategory : undefined}
          onDelete={canDelete ? handleDeleteSubCategory : undefined}
          onEdit={canEdit ? handleEditSubCategory : undefined}
          onCreate={canCreate ? handleCreateSubCategory : undefined}
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
              {modalMode === "create" && "Create SubCategory Group"}
              {modalMode === "edit" && "Update SubCategory Group"}
              {modalMode === "view" && "View SubCategory Group"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new subCategory group to the system database."
                : modalMode === "edit"
                  ? "Update subCategory group information in the system database."
                  : "View subCategory group details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <SubCategoryForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedSubCategory
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view" || !canEdit}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing SubCategory Group Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingSubCategory}
        onCancel={() => setExistingSubCategory(null)}
        code={existingSubCategory?.subCategoryCode}
        name={existingSubCategory?.subCategoryName}
        typeLabel="SubCategory Group"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete SubCategory Type"
        description="This action cannot be undone. This will permanently delete the subCategory type from our servers."
        itemName={deleteConfirmation.subCategoryName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            subCategoryId: null,
            subCategoryName: null,
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
          modalMode === "create"
            ? "Create SubCategory Group"
            : "Update SubCategory Group"
        }
        itemName={saveConfirmation.data?.subCategoryName || ""}
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
