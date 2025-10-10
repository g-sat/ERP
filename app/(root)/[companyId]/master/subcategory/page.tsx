"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ISubCategory, ISubCategoryFilter } from "@/interfaces/subcategory"
import { SubCategorySchemaType } from "@/schemas/subcategory"
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
import { SubCategorysTable } from "./components/subcategory-table"

export default function SubCategoryPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.subCategory

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ISubCategoryFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ISubCategoryFilter)
    },
    []
  )
  const {
    data: subcategorysResponse,
    refetch,
    isLoading,
  } = useGet<ISubCategory>(`${SubCategory.get}`, "subcategorys", filters.search)

  const { result: subcategorysResult, data: subcategorysData } =
    (subcategorysResponse as ApiResponse<ISubCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (subcategorysData?.length > 0) {
      refetch()
    }
  }, [filters, refetch])

  const saveMutation = usePersist<SubCategorySchemaType>(`${SubCategory.add}`)
  const updateMutation = usePersist<SubCategorySchemaType>(`${SubCategory.add}`)
  const deleteMutation = useDelete(`${SubCategory.delete}`)

  const [selectedSubCategory, setSelectedSubCategory] =
    useState<ISubCategory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingSubCategory, setExistingSubCategory] =
    useState<ISubCategory | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    subCategoryId: string | null
    subcategoryName: string | null
  }>({
    isOpen: false,
    subCategoryId: null,
    subcategoryName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: SubCategorySchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateSubCategory = () => {
    setModalMode("create")
    setSelectedSubCategory(null)
    setIsModalOpen(true)
  }

  const handleEditSubCategory = (subcategory: ISubCategory) => {
    setModalMode("edit")
    setSelectedSubCategory(subcategory)
    setIsModalOpen(true)
  }

  const handleViewSubCategory = (subcategory: ISubCategory | null) => {
    if (!subcategory) return
    setModalMode("view")
    setSelectedSubCategory(subcategory)
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
          queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
        }
      } else if (modalMode === "edit" && selectedSubCategory) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteSubCategory = (subCategoryId: string) => {
    const subcategoryToDelete = subcategorysData?.find(
      (b) => b.subCategoryId.toString() === subCategoryId
    )
    if (!subcategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      subCategoryId,
      subcategoryName: subcategoryToDelete.subCategoryName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.subCategoryId) {
      deleteMutation.mutateAsync(deleteConfirmation.subCategoryId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        subCategoryId: null,
        subcategoryName: null,
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
        const response = await getById(
          `${SubCategory.getByCode}/${trimmedCode}`
        )

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const subcategoryData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (subcategoryData) {
            // Ensure all required fields are present
            const validSubCategoryData: ISubCategory = {
              subCategoryId: subcategoryData.subCategoryId,
              subCategoryCode: subcategoryData.subCategoryCode,
              subCategoryName: subcategoryData.subCategoryName,
              companyId: subcategoryData.companyId,
              remarks: subcategoryData.remarks || "",
              isActive: subcategoryData.isActive ?? true,
              createBy: subcategoryData.createBy,
              editBy: subcategoryData.editBy,
              createDate: subcategoryData.createDate,
              editDate: subcategoryData.editDate,
              createById: subcategoryData.createById,
              editById: subcategoryData.editById,
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

  // Handler for loading existing subcategory
  const handleLoadExistingSubCategory = () => {
    if (existingSubCategory) {
      // Set the states
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
            Sub Categories
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage subcategory information and settings
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
      ) : subcategorysResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <SubCategorysTable
            data={[]}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            isLoading={false}
            canEdit={false}
            canDelete={false}
            canView={false}
            canCreate={false}
          />
        </LockSkeleton>
      ) : subcategorysResult ? (
        <SubCategorysTable
          data={filters.search ? [] : subcategorysData || []}
          onSelect={canView ? handleViewSubCategory : undefined}
          onDelete={canDelete ? handleDeleteSubCategory : undefined}
          onEdit={canEdit ? handleEditSubCategory : undefined}
          onCreate={canCreate ? handleCreateSubCategory : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          isLoading={isLoading}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {subcategorysResult === 0 ? "No data available" : "Loading..."}
          </p>
        </div>
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
              {modalMode === "create" && "Create SubCategory"}
              {modalMode === "edit" && "Update SubCategory"}
              {modalMode === "view" && "View SubCategory"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new subcategory to the system database."
                : modalMode === "edit"
                  ? "Update subcategory information in the system database."
                  : "View subcategory details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <SubCategoryForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedSubCategory
                : null
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing SubCategory Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingSubCategory}
        onCancel={() => setExistingSubCategory(null)}
        code={existingSubCategory?.subCategoryCode}
        name={existingSubCategory?.subCategoryName}
        typeLabel="SubCategory"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete SubCategory"
        description="This action cannot be undone. This will permanently delete the subcategory from our servers."
        itemName={deleteConfirmation.subcategoryName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            subCategoryId: null,
            subcategoryName: null,
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
          modalMode === "create" ? "Create SubCategory" : "Update SubCategory"
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
