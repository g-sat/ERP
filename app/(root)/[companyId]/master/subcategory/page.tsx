"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ISubCategory, ISubCategoryFilter } from "@/interfaces/subcategory"
import { SubCategoryFormValues } from "@/schemas/subcategory"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { SubCategory } from "@/lib/api-routes"
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
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { SubCategoryForm } from "./components/subcategory-form"
import { SubCategorysTable } from "./components/subcategory-table"

export default function SubCategoryPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.sub_category

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<ISubCategoryFilter>({})
  const {
    data: subcategorysResponse,
    refetch,
    isLoading,
    isRefetching,
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
  }, [filters])

  const saveMutation = usePersist<SubCategoryFormValues>(`${SubCategory.add}`)
  const updateMutation = usePersist<SubCategoryFormValues>(`${SubCategory.add}`)
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
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    subcategoryId: string | null
    subcategoryName: string | null
  }>({
    isOpen: false,
    subcategoryId: null,
    subcategoryName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ISubCategory>(
    `${SubCategory.getByCode}`,
    "subcategoryByCode",

    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
  )

  const queryClient = useQueryClient()

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

  const handleFormSubmit = async (data: SubCategoryFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<ISubCategory>
        if (response.result === 1) {
          toast.success("SubCategory created successfully")
          queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create subcategory")
        }
      } else if (modalMode === "edit" && selectedSubCategory) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<ISubCategory>
        if (response.result === 1) {
          toast.success("SubCategory updated successfully")
          queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update subcategory")
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

  const handleDeleteSubCategory = (subcategoryId: string) => {
    const subcategoryToDelete = subcategorysData?.find(
      (b) => b.subcategoryId.toString() === subcategoryId
    )
    if (!subcategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      subcategoryId,
      subcategoryName: subcategoryToDelete.subcategoryName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.subcategoryId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.subcategoryId),
        {
          loading: `Deleting ${deleteConfirmation.subcategoryName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["subcategorys"] })
            return `${deleteConfirmation.subcategoryName} has been deleted`
          },
          error: "Failed to delete subcategory",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        subcategoryId: null,
        subcategoryName: null,
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
        const subcategoryData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed subcategoryData:", subcategoryData)

        if (subcategoryData) {
          // Ensure all required fields are present
          const validSubCategoryData: ISubCategory = {
            subcategoryId: subcategoryData.subcategoryId,
            subcategoryCode: subcategoryData.subcategoryCode,
            subcategoryName: subcategoryData.subcategoryName,
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

          console.log("Setting existing subcategory:", validSubCategoryData)
          setExistingSubCategory(validSubCategoryData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing subcategory
  const handleLoadExistingSubCategory = () => {
    if (existingSubCategory) {
      // Log the data we're about to set
      console.log("About to load subcategory data:", {
        existingSubCategory,
        currentModalMode: modalMode,
        currentSelectedSubCategory: selectedSubCategory,
      })

      // Set the states
      setModalMode("edit")
      setSelectedSubCategory(existingSubCategory)
      setShowLoadDialog(false)
      setExistingSubCategory(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">SubCategorys</h1>
          <p className="text-muted-foreground text-sm">
            Manage subcategory information and settings
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
      ) : subcategorysResult ? (
        <SubCategorysTable
          data={subcategorysData || []}
          onSubCategorySelect={handleViewSubCategory}
          onDeleteSubCategory={canDelete ? handleDeleteSubCategory : undefined}
          onEditSubCategory={canEdit ? handleEditSubCategory : undefined}
          onCreateSubCategory={handleCreateSubCategory}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest subcategory data.")
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
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing SubCategory Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingSubCategory}
        onCancel={() => setExistingSubCategory(null)}
        code={existingSubCategory?.subcategoryCode}
        name={existingSubCategory?.subcategoryName}
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
            subcategoryId: null,
            subcategoryName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
