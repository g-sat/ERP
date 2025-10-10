"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ICategory, ICategoryFilter } from "@/interfaces/category"
import { CategorySchemaType } from "@/schemas/category"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Category } from "@/lib/api-routes"
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

import { CategoryForm } from "./components/category-form"
import { CategorysTable } from "./components/category-table"

export default function CategoryPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.category

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")

  const [filters, setFilters] = useState<ICategoryFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ICategoryFilter)
    },
    []
  )

  const {
    data: categorysResponse,
    refetch,
    isLoading,
  } = useGet<ICategory>(`${Category.get}`, "categorys", filters.search)

  const { result: categorysResult, data: categorysData } =
    (categorysResponse as ApiResponse<ICategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!categorysResponse) return

    if (categorysResponse.result === -1) {
      setFilters({})
    } else if (categorysResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (categorysResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [categorysResponse, isLocked])

  const saveMutation = usePersist<CategorySchemaType>(`${Category.add}`)
  const updateMutation = usePersist<CategorySchemaType>(`${Category.add}`)
  const deleteMutation = useDelete(`${Category.delete}`)

  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCategory, setExistingCategory] = useState<ICategory | null>(
    null
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string | null
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: CategorySchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateCategory = () => {
    setModalMode("create")
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: ICategory) => {
    setModalMode("edit")
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleViewCategory = (category: ICategory | null) => {
    if (!category) return
    setModalMode("view")
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: CategorySchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: CategorySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["categorys"] })
        }
      } else if (modalMode === "edit" && selectedCategory) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["categorys"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categorysData?.find(
      (b) => b.categoryId.toString() === categoryId
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      categoryId,
      categoryName: categoryToDelete.categoryName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.categoryId) {
      deleteMutation.mutateAsync(deleteConfirmation.categoryId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["categorys"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        categoryId: null,
        categoryName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${Category.getByCode}/${trimmedCode}`)

        if (response?.result === 1 && response.data) {
          const categoryData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (categoryData) {
            setExistingCategory(categoryData as ICategory)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  const handleLoadExistingCategory = () => {
    if (existingCategory) {
      setSelectedCategory(existingCategory)
      setModalMode("edit")
      setIsModalOpen(true)
    }
    setShowLoadDialog(false)
    setExistingCategory(null)
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage category information and settings
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
      ) : categorysResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <CategorysTable
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
        <CategorysTable
          data={filters.search ? [] : categorysData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewCategory : undefined}
          onDelete={canDelete ? handleDeleteCategory : undefined}
          onEdit={canEdit ? handleEditCategory : undefined}
          onCreate={canCreate ? handleCreateCategory : undefined}
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
              {modalMode === "create" && "Create Category"}
              {modalMode === "edit" && "Update Category"}
              {modalMode === "view" && "View Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new category to the system database."
                : modalMode === "edit"
                  ? "Update category information in the system database."
                  : "View category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CategoryForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedCategory
                : null
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
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
        title="Delete Category"
        description="This action cannot be undone. This will permanently delete the category from our servers."
        itemName={deleteConfirmation.categoryName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            categoryId: null,
            categoryName: null,
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
        title={modalMode === "create" ? "Create Category" : "Update Category"}
        itemName={saveConfirmation.data?.categoryName || ""}
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

      {/* Load Existing Category Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCategory}
        onCancel={() => setExistingCategory(null)}
        code={existingCategory?.categoryCode}
        name={existingCategory?.categoryName}
        typeLabel="Category"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
