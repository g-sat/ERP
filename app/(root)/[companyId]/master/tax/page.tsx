"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ITax,
  ITaxCategory,
  ITaxCategoryFilter,
  ITaxDt,
  ITaxFilter,
} from "@/interfaces/tax"
import {
  TaxCategoryFormValues,
  TaxDtFormValues,
  TaxFormValues,
} from "@/schemas/tax"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { Tax, TaxCategory, TaxDt } from "@/lib/api-routes"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { TaxForm } from "./components/tax-form"
import { TaxTable } from "./components/tax-table"
import { TaxCategoryForm } from "./components/taxcategory-form"
import { TaxCategoryTable } from "./components/taxcategory-table"
import { TaxDtForm } from "./components/taxdt-form"
import { TaxDtTable } from "./components/taxdt-table"

export default function TaxPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.tax
  const transactionIdCategory = MasterTransactionId.tax_category
  const transactionIdDt = MasterTransactionId.tax_dt

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreateCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isCreate"
  )
  const canEditCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isEdit"
  )
  const canDeleteCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isDelete"
  )
  const canCreateDt = hasPermission(moduleId, transactionIdDt, "isCreate")
  const canEditDt = hasPermission(moduleId, transactionIdDt, "isEdit")
  const canDeleteDt = hasPermission(moduleId, transactionIdDt, "isDelete")

  // State for filters
  const [filters, setFilters] = useState<ITaxFilter>({})
  const [dtFilters, setDtFilters] = useState<ITaxFilter>({})
  const [categoryFilters, setCategoryFilters] = useState<ITaxCategoryFilter>({})

  // Data fetching
  const {
    data: taxsResponse,
    refetch: refetchTax,
    isLoading: isLoadingTax,
    isRefetching: isRefetchingTax,
  } = useGet<ITax>(`${Tax.get}`, "taxs", filters.search)

  const {
    data: taxsDtResponse,
    refetch: refetchTaxDt,
    isLoading: isLoadingTaxDt,
    isRefetching: isRefetchingTaxDt,
  } = useGet<ITaxDt>(`${TaxDt.get}`, "taxsdt", dtFilters.search)

  const {
    data: taxsCategoryResponse,
    refetch: refetchTaxCategory,
    isLoading: isLoadingTaxCategory,
    isRefetching: isRefetchingTaxCategory,
  } = useGet<ITaxCategory>(
    `${TaxCategory.get}`,
    "taxcategory",
    categoryFilters.search
  )

  // Extract data from responses
  const taxsData = (taxsResponse as ApiResponse<ITax>)?.data || []
  const taxsDtData = (taxsDtResponse as ApiResponse<ITaxDt>)?.data || []
  const taxsCategoryData =
    (taxsCategoryResponse as ApiResponse<ITaxCategory>)?.data || []

  // Mutations
  const saveMutation = usePersist<TaxFormValues>(`${Tax.add}`)
  const updateMutation = usePersist<TaxFormValues>(`${Tax.add}`)
  const deleteMutation = useDelete(`${Tax.delete}`)

  const saveDtMutation = usePersist<TaxDtFormValues>(`${TaxDt.add}`)
  const updateDtMutation = usePersist<TaxDtFormValues>(`${TaxDt.add}`)
  const deleteDtMutation = useDelete(`${TaxDt.delete}`)

  const saveCategoryMutation = usePersist<TaxCategoryFormValues>(
    `${TaxCategory.add}`
  )
  const updateCategoryMutation = usePersist<TaxCategoryFormValues>(
    `${TaxCategory.add}`
  )
  const deleteCategoryMutation = useDelete(`${TaxCategory.delete}`)

  // State management
  const [selectedTax, setSelectedTax] = useState<ITax | undefined>()
  const [selectedTaxDt, setSelectedTaxDt] = useState<ITaxDt | undefined>()
  const [selectedTaxCategory, setSelectedTaxCategory] = useState<
    ITaxCategory | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDtModalOpen, setIsDtModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "tax" as "tax" | "taxdt" | "taxcategory",
  })

  // Duplicate detection states
  const [showLoadDialogTax, setShowLoadDialogTax] = useState(false)
  const [existingTax, setExistingTax] = useState<ITax | null>(null)
  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingTaxCategory, setExistingTaxCategory] =
    useState<ITaxCategory | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchTax()
  }, [filters.search])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchTaxDt()
  }, [dtFilters.search])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchTaxCategory()
  }, [categoryFilters.search])

  // Action handlers
  const handleCreateTax = () => {
    setModalMode("create")
    setSelectedTax(undefined)
    setIsModalOpen(true)
  }

  const handleEditTax = (tax: ITax) => {
    setModalMode("edit")
    setSelectedTax(tax)
    setIsModalOpen(true)
  }

  const handleViewTax = (tax: ITax | null) => {
    if (!tax) return
    setModalMode("view")
    setSelectedTax(tax)
    setIsModalOpen(true)
  }

  const handleCreateTaxDt = () => {
    setModalMode("create")
    setSelectedTaxDt(undefined)
    setIsDtModalOpen(true)
  }

  const handleEditTaxDt = (taxDt: ITaxDt) => {
    setModalMode("edit")
    setSelectedTaxDt(taxDt)
    setIsDtModalOpen(true)
  }

  const handleViewTaxDt = (taxDt: ITaxDt | null) => {
    if (!taxDt) return
    setModalMode("view")
    setSelectedTaxDt(taxDt)
    setIsDtModalOpen(true)
  }

  const handleCreateTaxCategory = () => {
    setModalMode("create")
    setSelectedTaxCategory(undefined)
    setIsCategoryModalOpen(true)
  }

  const handleEditTaxCategory = (taxCategory: ITaxCategory) => {
    setModalMode("edit")
    setSelectedTaxCategory(taxCategory)
    setIsCategoryModalOpen(true)
  }

  const handleViewTaxCategory = (taxCategory: ITaxCategory | null) => {
    if (!taxCategory) return
    setModalMode("view")
    setSelectedTaxCategory(taxCategory)
    setIsCategoryModalOpen(true)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<any>,
    successMessage: string,
    errorPrefix: string
  ) => {
    if (response.result === 1) {
      toast.success(response.message || successMessage)
      return true
    } else {
      toast.error(response.message || `${errorPrefix} failed`)
      return false
    }
  }

  // Specialized form handlers
  const handleTaxSubmit = async (data: TaxFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ITax>
        if (
          handleApiResponse(response, "GST created successfully", "Create GST")
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxs"] })
        }
      } else if (modalMode === "edit" && selectedTax) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ITax>
        if (
          handleApiResponse(response, "GST updated successfully", "Update GST")
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxs"] })
        }
      }
    } catch (error) {
      console.error("GST form submission error:", error)
      toast.error("Failed to process GST request")
    }
  }

  const handleTaxDtSubmit = async (data: TaxDtFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxDt>
        if (
          handleApiResponse(
            response,
            "GST Details created successfully",
            "Create GST Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxsdt"] })
        }
      } else if (modalMode === "edit" && selectedTaxDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxDt>
        if (
          handleApiResponse(
            response,
            "GST Details updated successfully",
            "Update GST Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxsdt"] })
        }
      }
    } catch (error) {
      console.error("GST Details form submission error:", error)
      toast.error("Failed to process GST Details request")
    }
  }

  const handleTaxCategorySubmit = async (data: TaxCategoryFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxCategory>
        if (
          handleApiResponse(
            response,
            "GST Category created successfully",
            "Create GST Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxcategory"] })
        }
      } else if (modalMode === "edit" && selectedTaxCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxCategory>
        if (
          handleApiResponse(
            response,
            "GST Category updated successfully",
            "Update GST Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["taxcategory"] })
        }
      }
    } catch (error) {
      console.error("GST Category form submission error:", error)
      toast.error("Failed to process GST Category request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: TaxFormValues | TaxDtFormValues | TaxCategoryFormValues
  ) => {
    try {
      if (isDtModalOpen) {
        await handleTaxDtSubmit(data as TaxDtFormValues)
        setIsDtModalOpen(false)
      } else if (isCategoryModalOpen) {
        await handleTaxCategorySubmit(data as TaxCategoryFormValues)
        setIsCategoryModalOpen(false)
      } else {
        await handleTaxSubmit(data as TaxFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred during form submission")
    }
  }

  // Delete handlers
  const handleDeleteTax = (taxId: string) => {
    const taxToDelete = taxsData.find((c) => c.taxId.toString() === taxId)
    if (!taxToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: taxId,
      name: taxToDelete.taxName,
      type: "tax",
    })
  }

  const handleDeleteTaxDt = (taxId: string) => {
    const taxDtToDelete = taxsDtData.find((c) => c.taxId.toString() === taxId)
    if (!taxDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: taxId,
      name: taxDtToDelete.taxName,
      type: "taxdt",
    })
  }

  const handleDeleteTaxCategory = (taxCategoryId: string) => {
    const taxCategoryToDelete = taxsCategoryData.find(
      (c) => c.taxCategoryId.toString() === taxCategoryId
    )
    if (!taxCategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: taxCategoryId,
      name: taxCategoryToDelete.taxCategoryName,
      type: "taxcategory",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "tax":
        mutation = deleteMutation
        break
      case "taxdt":
        mutation = deleteDtMutation
        break
      case "taxcategory":
        mutation = deleteCategoryMutation
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.name}`,
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "tax",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      if (isModalOpen) {
        const response = await getData(`${Tax.getByCode}/${trimmedCode}`)

        if (response.data.result === 1 && response.data.data) {
          const countryData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (countryData) {
            setExistingTax(countryData as ITax)
            setShowLoadDialogTax(true)
          }
        }
      } else if (isCategoryModalOpen) {
        const response = await getData(
          `${TaxCategory.getByCode}/${trimmedCode}`
        )
        if (response.data.result === 1 && response.data.data) {
          const categoryData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (categoryData) {
            setExistingTaxCategory(categoryData as ITaxCategory)
            setShowLoadDialogCategory(true)
          }
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingTax = () => {
    if (existingTax) {
      setModalMode("edit")
      setSelectedTax(existingTax)
      setShowLoadDialogTax(false)
      setExistingTax(null)
    }
  }

  const handleLoadExistingTaxCategory = () => {
    if (existingTaxCategory) {
      setModalMode("edit")
      setSelectedTaxCategory(existingTaxCategory)
      setShowLoadDialogCategory(false)
      setExistingTaxCategory(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">GST</h1>
          <p className="text-muted-foreground text-sm">
            Manage GST information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="taxs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="taxs">Tax</TabsTrigger>
          <TabsTrigger value="taxsdt">Tax Details</TabsTrigger>
          <TabsTrigger value="taxscategory">Tax Category</TabsTrigger>
        </TabsList>

        <TabsContent value="taxs" className="space-y-4">
          {isLoadingTax || isRefetchingTax ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : (taxsResponse as ApiResponse<ITax>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <TaxTable
                data={taxsData}
                isLoading={isLoadingTax}
                onTaxSelect={handleViewTax}
                onDeleteTax={canDelete ? handleDeleteTax : undefined}
                onEditTax={canEdit ? handleEditTax : undefined}
                onCreateTax={canCreate ? handleCreateTax : undefined}
                onRefresh={refetchTax}
                onFilterChange={setFilters}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <TaxTable
              data={taxsData}
              isLoading={isLoadingTax}
              onTaxSelect={handleViewTax}
              onDeleteTax={canDelete ? handleDeleteTax : undefined}
              onEditTax={canEdit ? handleEditTax : undefined}
              onCreateTax={canCreate ? handleCreateTax : undefined}
              onRefresh={refetchTax}
              onFilterChange={setFilters}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="taxsdt" className="space-y-4">
          {isLoadingTaxDt || isRefetchingTaxDt ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : (taxsDtResponse as ApiResponse<ITaxDt>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <TaxDtTable
                data={taxsDtData}
                isLoading={isLoadingTaxDt}
                onTaxDtSelect={handleViewTaxDt}
                onDeleteTaxDt={canDeleteDt ? handleDeleteTaxDt : undefined}
                onEditTaxDt={canEditDt ? handleEditTaxDt : undefined}
                onCreateTaxDt={canCreateDt ? handleCreateTaxDt : undefined}
                onRefresh={refetchTaxDt}
                onFilterChange={setDtFilters}
                moduleId={moduleId}
                transactionId={transactionIdDt}
              />
            </LockSkeleton>
          ) : (
            <TaxDtTable
              data={taxsDtData}
              isLoading={isLoadingTaxDt}
              onTaxDtSelect={handleViewTaxDt}
              onDeleteTaxDt={canDeleteDt ? handleDeleteTaxDt : undefined}
              onEditTaxDt={canEditDt ? handleEditTaxDt : undefined}
              onCreateTaxDt={canCreateDt ? handleCreateTaxDt : undefined}
              onRefresh={refetchTaxDt}
              onFilterChange={setDtFilters}
              moduleId={moduleId}
              transactionId={transactionIdDt}
            />
          )}
        </TabsContent>

        <TabsContent value="taxscategory" className="space-y-4">
          {isLoadingTaxCategory || isRefetchingTaxCategory ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : (taxsCategoryResponse as ApiResponse<ITaxCategory>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <TaxCategoryTable
                data={taxsCategoryData}
                isLoading={isLoadingTaxCategory}
                onTaxCategorySelect={handleViewTaxCategory}
                onDeleteTaxCategory={
                  canDeleteCategory ? handleDeleteTaxCategory : undefined
                }
                onEditTaxCategory={
                  canEditCategory ? handleEditTaxCategory : undefined
                }
                onCreateTaxCategory={
                  canCreateCategory ? handleCreateTaxCategory : undefined
                }
                onRefresh={refetchTaxCategory}
                onFilterChange={setCategoryFilters}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
              />
            </LockSkeleton>
          ) : (
            <TaxCategoryTable
              data={taxsCategoryData}
              isLoading={isLoadingTaxCategory}
              onTaxCategorySelect={handleViewTaxCategory}
              onDeleteTaxCategory={
                canDeleteCategory ? handleDeleteTaxCategory : undefined
              }
              onEditTaxCategory={
                canEditCategory ? handleEditTaxCategory : undefined
              }
              onCreateTaxCategory={
                canCreateCategory ? handleCreateTaxCategory : undefined
              }
              onRefresh={refetchTaxCategory}
              onFilterChange={setCategoryFilters}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* GST Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Tax"}
              {modalMode === "edit" && "Update Tax"}
              {modalMode === "view" && "View Tax"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new tax to the system database."
                : modalMode === "edit"
                  ? "Update tax information in the system database."
                  : "View tax details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaxForm
            initialData={modalMode !== "create" ? selectedTax : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* GST Details Form Dialog */}
      <Dialog open={isDtModalOpen} onOpenChange={setIsDtModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Tax Details"}
              {modalMode === "edit" && "Update Tax Details"}
              {modalMode === "view" && "View Tax Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add new GST details to the system database."
                : modalMode === "edit"
                  ? "Update GST details information."
                  : "View GST details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaxDtForm
            initialData={modalMode !== "create" ? selectedTaxDt : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsDtModalOpen(false)}
            isSubmitting={
              saveDtMutation.isPending || updateDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* GST Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create GST Category"}
              {modalMode === "edit" && "Update GST Category"}
              {modalMode === "view" && "View GST Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new GST category to the system database."
                : modalMode === "edit"
                  ? "Update GST category information."
                  : "View GST category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaxCategoryForm
            initialData={
              modalMode !== "create" ? selectedTaxCategory : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsCategoryModalOpen(false)}
            isSubmitting={
              saveCategoryMutation.isPending || updateCategoryMutation.isPending
            }
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialogs */}
      <LoadExistingDialog
        open={showLoadDialogTax}
        onOpenChange={setShowLoadDialogTax}
        onLoad={handleLoadExistingTax}
        onCancel={() => setExistingTax(null)}
        code={existingTax?.taxCode}
        name={existingTax?.taxName}
        typeLabel="GST"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingTaxCategory}
        onCancel={() => setExistingTaxCategory(null)}
        code={existingTaxCategory?.taxCategoryCode}
        name={existingTaxCategory?.taxCategoryName}
        typeLabel="GST Category"
        isLoading={
          saveCategoryMutation.isPending || updateCategoryMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={`Delete ${deleteConfirmation.type.toUpperCase()}`}
        description={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type} from our servers.`}
        itemName={deleteConfirmation.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            id: null,
            name: null,
            type: "tax",
          })
        }
        isDeleting={
          deleteConfirmation.type === "tax"
            ? deleteMutation.isPending
            : deleteConfirmation.type === "taxdt"
              ? deleteDtMutation.isPending
              : deleteCategoryMutation.isPending
        }
      />
    </div>
  )
}
