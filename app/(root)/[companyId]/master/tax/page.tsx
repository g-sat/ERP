"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ITax,
  ITaxCategory,
  ITaxCategoryFilter,
  ITaxDt,
  ITaxFilter,
} from "@/interfaces/tax"
import {
  TaxCategorySchemaType,
  TaxDtSchemaType,
  TaxSchemaType,
} from "@/schemas/tax"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { TaxForm } from "./components/tax-form"
import { TaxTable } from "./components/tax-table"
import { TaxCategoryForm } from "./components/taxcategory-form"
import { TaxCategoryTable } from "./components/taxcategory-table"
import { TaxDtForm } from "./components/taxdt-form"
import { TaxDtTable } from "./components/taxdt-table"

export default function TaxPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.tax
  const transactionIdCategory = MasterTransactionId.taxCategory
  const transactionIdDt = MasterTransactionId.taxDt

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
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreateDt = hasPermission(moduleId, transactionIdDt, "isCreate")
  const canEditDt = hasPermission(moduleId, transactionIdDt, "isEdit")
  const canDeleteDt = hasPermission(moduleId, transactionIdDt, "isDelete")
  const canViewDt = hasPermission(moduleId, transactionIdDt, "isRead")
  const canViewCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isRead"
  )

  // State for filters
  const [filters, setFilters] = useState<ITaxFilter>({})

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Tax filter change called with:", newFilters)
      setFilters(newFilters as ITaxFilter)
    },
    []
  )

  const handleDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Tax Dt filter change called with:", newFilters)
      setDtFilters(newFilters as ITaxFilter)
    },
    []
  )

  const handleCategoryFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Tax Category filter change called with:", newFilters)
      setCategoryFilters(newFilters as ITaxCategoryFilter)
    },
    []
  )

  const [dtFilters, setDtFilters] = useState<ITaxFilter>({})
  const [categoryFilters, setCategoryFilters] = useState<ITaxCategoryFilter>({})

  // Data fetching
  const {
    data: taxsResponse,
    refetch: refetchTax,
    isLoading: isLoadingTax,
  } = useGet<ITax>(`${Tax.get}`, "taxs", filters.search)

  const {
    data: taxsDtResponse,
    refetch: refetchTaxDt,
    isLoading: isLoadingTaxDt,
  } = useGet<ITaxDt>(`${TaxDt.get}`, "taxsdt", dtFilters.search)

  const {
    data: taxsCategoryResponse,
    refetch: refetchTaxCategory,
    isLoading: isLoadingTaxCategory,
  } = useGet<ITaxCategory>(
    `${TaxCategory.get}`,
    "taxcategory",
    categoryFilters.search
  )

  // Extract data from responses with fallback values
  const { result: taxsResult, data: taxsData } =
    (taxsResponse as ApiResponse<ITax>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: taxsDtResult, data: taxsDtData } =
    (taxsDtResponse as ApiResponse<ITaxDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: taxsCategoryResult, data: taxsCategoryData } =
    (taxsCategoryResponse as ApiResponse<ITaxCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<TaxSchemaType>(`${Tax.add}`)
  const updateMutation = usePersist<TaxSchemaType>(`${Tax.add}`)
  const deleteMutation = useDelete(`${Tax.delete}`)

  const saveDtMutation = usePersist<TaxDtSchemaType>(`${TaxDt.add}`)
  const updateDtMutation = usePersist<TaxDtSchemaType>(`${TaxDt.add}`)
  const deleteDtMutation = useDelete(`${TaxDt.delete}`)

  const saveCategoryMutation = usePersist<TaxCategorySchemaType>(
    `${TaxCategory.add}`
  )
  const updateCategoryMutation = usePersist<TaxCategorySchemaType>(
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
  }, [filters.search, refetchTax])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchTaxDt()
  }, [dtFilters.search, refetchTaxDt])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchTaxCategory()
  }, [categoryFilters.search, refetchTaxCategory])

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
    response: ApiResponse<ITax | ITaxDt | ITaxCategory>
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleTaxSubmit = async (data: TaxSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ITax>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxs"] })
        }
      } else if (modalMode === "edit" && selectedTax) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ITax>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxs"] })
        }
      }
    } catch (error) {
      console.error("Tax form submission error:", error)
    }
  }

  const handleTaxDtSubmit = async (data: TaxDtSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxsdt"] })
        }
      } else if (modalMode === "edit" && selectedTaxDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxsdt"] })
        }
      }
    } catch (error) {
      console.error("Tax Details form submission error:", error)
    }
  }

  const handleTaxCategorySubmit = async (data: TaxCategorySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxcategory"] })
        }
      } else if (modalMode === "edit" && selectedTaxCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<ITaxCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["taxcategory"] })
        }
      }
    } catch (error) {
      console.error("Tax Category form submission error:", error)
    }
  }

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: TaxSchemaType | TaxDtSchemaType | TaxCategorySchemaType | null
    type: "tax" | "taxdt" | "taxcategory"
  }>({
    isOpen: false,
    data: null,
    type: "tax",
  })

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data: TaxSchemaType | TaxDtSchemaType | TaxCategorySchemaType
  ) => {
    let type: "tax" | "taxdt" | "taxcategory" = "tax"
    if (isDtModalOpen) type = "taxdt"
    else if (isCategoryModalOpen) type = "taxcategory"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: TaxSchemaType | TaxDtSchemaType | TaxCategorySchemaType
  ) => {
    try {
      if (saveConfirmation.type === "taxdt") {
        await handleTaxDtSubmit(data as TaxDtSchemaType)
        setIsDtModalOpen(false)
      } else if (saveConfirmation.type === "taxcategory") {
        await handleTaxCategorySubmit(data as TaxCategorySchemaType)
        setIsCategoryModalOpen(false)
      } else {
        await handleTaxSubmit(data as TaxSchemaType)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
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

    mutation.mutateAsync(deleteConfirmation.id).then(() => {
      queryClient.invalidateQueries({ queryKey: [deleteConfirmation.type] })
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: deleteConfirmation.type,
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
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Tax</h1>
          <p className="text-muted-foreground text-sm">
            Manage Tax information and settings
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
          {isLoadingTax ? (
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
          ) : taxsResult === -2 ||
            (!canView && !canEdit && !canDelete && !canCreate) ? (
            <LockSkeleton locked={true}>
              <TaxTable
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
          ) : taxsResult ? (
            <TaxTable
              data={filters.search ? [] : taxsData || []}
              isLoading={isLoadingTax}
              onSelect={canView ? handleViewTax : undefined}
              onDelete={canDelete ? handleDeleteTax : undefined}
              onEdit={canEdit ? handleEditTax : undefined}
              onCreate={canCreate ? handleCreateTax : undefined}
              onRefresh={refetchTax}
              onFilterChange={handleFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canEdit={canEdit}
              canDelete={canDelete}
              canView={canView}
              canCreate={canCreate}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {taxsResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="taxsdt" className="space-y-4">
          {isLoadingTaxDt ? (
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
          ) : taxsDtResult === -2 ||
            (!canViewDt && !canEditDt && !canDeleteDt && !canCreateDt) ? (
            <LockSkeleton locked={true}>
              <TaxDtTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionIdDt}
                canEdit={false}
                canDelete={false}
                canView={false}
                canCreate={false}
              />
            </LockSkeleton>
          ) : taxsDtResult ? (
            <TaxDtTable
              data={dtFilters.search ? [] : taxsDtData || []}
              isLoading={isLoadingTaxDt}
              onSelect={canViewDt ? handleViewTaxDt : undefined}
              onDelete={canDeleteDt ? handleDeleteTaxDt : undefined}
              onEdit={canEditDt ? handleEditTaxDt : undefined}
              onCreate={canCreateDt ? handleCreateTaxDt : undefined}
              onRefresh={refetchTaxDt}
              onFilterChange={handleDtFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdDt}
              canEdit={canEditDt}
              canDelete={canDeleteDt}
              canView={canViewDt}
              canCreate={canCreateDt}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {taxsDtResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="taxscategory" className="space-y-4">
          {isLoadingTaxCategory ? (
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
          ) : taxsCategoryResult === -2 ||
            (!canViewCategory &&
              !canEditCategory &&
              !canDeleteCategory &&
              !canCreateCategory) ? (
            <LockSkeleton locked={true}>
              <TaxCategoryTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
                canEdit={false}
                canDelete={false}
                canView={false}
                canCreate={canCreateCategory}
              />
            </LockSkeleton>
          ) : taxsCategoryResult ? (
            <TaxCategoryTable
              data={categoryFilters.search ? [] : taxsCategoryData || []}
              isLoading={isLoadingTaxCategory}
              onSelect={canViewCategory ? handleViewTaxCategory : undefined}
              onDelete={canDeleteCategory ? handleDeleteTaxCategory : undefined}
              onEdit={canEditCategory ? handleEditTaxCategory : undefined}
              onCreate={canCreateCategory ? handleCreateTaxCategory : undefined}
              onRefresh={refetchTaxCategory}
              onFilterChange={handleCategoryFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
              canEdit={canEditCategory}
              canDelete={canDeleteCategory}
              canView={canViewCategory}
              canCreate={canCreateCategory}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {taxsCategoryResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tax Form Dialog */}
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
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Tax Details Form Dialog */}
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
                ? "Add new Tax details to the system database."
                : modalMode === "edit"
                  ? "Update Tax details information."
                  : "View Tax details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaxDtForm
            initialData={modalMode !== "create" ? selectedTaxDt : undefined}
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsDtModalOpen(false)}
            isSubmitting={
              saveDtMutation.isPending || updateDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Tax Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Tax Category"}
              {modalMode === "edit" && "Update Tax Category"}
              {modalMode === "view" && "View Tax Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new Tax category to the system database."
                : modalMode === "edit"
                  ? "Update Tax category information."
                  : "View Tax category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaxCategoryForm
            initialData={
              modalMode !== "create" ? selectedTaxCategory : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsCategoryModalOpen(false)}
            isSubmitting={
              saveCategoryMutation.isPending || updateCategoryMutation.isPending
            }
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialogs */}
      <LoadConfirmation
        open={showLoadDialogTax}
        onOpenChange={setShowLoadDialogTax}
        onLoad={handleLoadExistingTax}
        onCancel={() => setExistingTax(null)}
        code={existingTax?.taxCode}
        name={existingTax?.taxName}
        typeLabel="Tax"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadConfirmation
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingTaxCategory}
        onCancel={() => setExistingTaxCategory(null)}
        code={existingTaxCategory?.taxCategoryCode}
        name={existingTaxCategory?.taxCategoryName}
        typeLabel="Tax Category"
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

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create"
            ? `Create ${saveConfirmation.type.toUpperCase()}`
            : `Update ${saveConfirmation.type.toUpperCase()}`
        }
        itemName={
          saveConfirmation.type === "tax"
            ? (saveConfirmation.data as TaxSchemaType)?.taxName || ""
            : saveConfirmation.type === "taxdt"
              ? (
                  saveConfirmation.data as TaxDtSchemaType
                )?.taxPercentage?.toString() || ""
              : (saveConfirmation.data as TaxCategorySchemaType)
                  ?.taxCategoryName || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "tax",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "tax",
          })
        }
        isSaving={
          saveConfirmation.type === "tax"
            ? saveMutation.isPending || updateMutation.isPending
            : saveConfirmation.type === "taxdt"
              ? saveDtMutation.isPending || updateDtMutation.isPending
              : saveCategoryMutation.isPending ||
                updateCategoryMutation.isPending
        }
      />
    </div>
  )
}
