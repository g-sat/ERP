"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IServiceType,
  IServiceTypeCategory,
  IServiceTypeCategoryFilter,
  IServiceTypeFilter,
} from "@/interfaces/servicetype"
import {
  ServiceTypeCategoryFormValues,
  ServiceTypeFormValues,
} from "@/schemas/servicetype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { ServiceType, ServiceTypeCategory } from "@/lib/api-routes"
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
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { ServiceTypeForm } from "./components/servicetype-form"
import { ServiceTypeTable } from "./components/servicetype-table"
import { ServiceTypeCategoryForm } from "./components/servicetypecategory-form"
import { ServiceTypeCategoryTable } from "./components/servicetypecategory-table"

// Skeleton configuration for consistent loading states
const tableSkeletonProps = {
  columnCount: 8,
  filterCount: 2,
  cellWidths: [
    "10rem",
    "30rem",
    "10rem",
    "10rem",
    "10rem",
    "10rem",
    "6rem",
    "6rem",
  ],
  shrinkZero: true,
}

export default function ServiceTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.service_type
  const transactionIdCategory = MasterTransactionId.service_type_category

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

  // State for filters
  const [filters, setFilters] = useState<IServiceTypeFilter>({})
  const [categoryFilters, setCategoryFilters] =
    useState<IServiceTypeCategoryFilter>({})

  // Data fetching
  const {
    data: servicetypesResponse,
    refetch: refetchServiceType,
    isLoading: isLoadingServiceType,
    isRefetching: isRefetchingServiceType,
  } = useGet<IServiceType>(`${ServiceType.get}`, "servicetypes", filters.search)

  const {
    data: servicetypesCategoryResponse,
    refetch: refetchServiceTypeCategory,
    isLoading: isLoadingServiceTypeCategory,
    isRefetching: isRefetchingServiceTypeCategory,
  } = useGet<IServiceTypeCategory>(
    `${ServiceTypeCategory.get}`,
    "servicetypecategory",
    categoryFilters.search
  )

  // Extract data from responses
  const servicetypesData =
    (servicetypesResponse as ApiResponse<IServiceType>)?.data || []
  const servicetypesCategoryData =
    (servicetypesCategoryResponse as ApiResponse<IServiceTypeCategory>)?.data ||
    []

  // Mutations
  const saveMutation = usePersist<ServiceTypeFormValues>(`${ServiceType.add}`)
  const updateMutation = usePersist<ServiceTypeFormValues>(`${ServiceType.add}`)
  const deleteMutation = useDelete(`${ServiceType.delete}`)

  const saveCategoryMutation = usePersist<ServiceTypeCategoryFormValues>(
    `${ServiceTypeCategory.add}`
  )
  const updateCategoryMutation = usePersist<ServiceTypeCategoryFormValues>(
    `${ServiceTypeCategory.add}`
  )
  const deleteCategoryMutation = useDelete(`${ServiceTypeCategory.delete}`)

  // State management
  const [selectedServiceType, setSelectedServiceType] = useState<
    IServiceType | undefined
  >()
  const [selectedServiceTypeCategory, setSelectedServiceTypeCategory] =
    useState<IServiceTypeCategory | undefined>()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "servicetype" as "servicetype" | "servicetypecategory",
  })

  // Duplicate detection states
  const [showLoadDialogServiceType, setShowLoadDialogServiceType] =
    useState(false)
  const [existingServiceType, setExistingServiceType] =
    useState<IServiceType | null>(null)

  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingServiceTypeCategory, setExistingServiceTypeCategory] =
    useState<IServiceTypeCategory | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchServiceType()
  }, [filters.search])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchServiceTypeCategory()
  }, [categoryFilters.search])

  // Action handlers
  const handleCreateServiceType = () => {
    setModalMode("create")
    setSelectedServiceType(undefined)
    setIsModalOpen(true)
  }

  const handleEditServiceType = (servicetype: IServiceType) => {
    setModalMode("edit")
    setSelectedServiceType(servicetype)
    setIsModalOpen(true)
  }

  const handleViewServiceType = (servicetype: IServiceType | undefined) => {
    if (!servicetype) return
    setModalMode("view")
    setSelectedServiceType(servicetype)
    setIsModalOpen(true)
  }

  const handleCreateServiceTypeCategory = () => {
    setModalMode("create")
    setSelectedServiceTypeCategory(undefined)
    setIsCategoryModalOpen(true)
  }

  const handleEditServiceTypeCategory = (
    servicetypeCategory: IServiceTypeCategory
  ) => {
    setModalMode("edit")
    setSelectedServiceTypeCategory(servicetypeCategory)
    setIsCategoryModalOpen(true)
  }

  const handleViewServiceTypeCategory = (
    servicetypeCategory: IServiceTypeCategory | undefined
  ) => {
    if (!servicetypeCategory) return
    setModalMode("view")
    setSelectedServiceTypeCategory(servicetypeCategory)
    setIsCategoryModalOpen(true)
  }

  // Filter handlers
  const handleServiceTypeFilterChange = (filters: IServiceTypeFilter) => {
    setFilters(filters)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IServiceType | IServiceTypeCategory>,
    successMessage: string,
    errorPrefix: string
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleServiceTypeSubmit = async (data: ServiceTypeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceType>
        if (
          handleApiResponse(
            response,
            "ServiceType created successfully",
            "Create ServiceType"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["servicetypes"] })
        }
      } else if (modalMode === "edit" && selectedServiceType) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceType>
        if (
          handleApiResponse(
            response,
            "ServiceType updated successfully",
            "Update ServiceType"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["servicetypes"] })
        }
      }
    } catch (error) {
      console.error("ServiceType form submission error:", error)
    }
  }

  const handleServiceTypeCategorySubmit = async (
    data: ServiceTypeCategoryFormValues
  ) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceTypeCategory>
        if (
          handleApiResponse(
            response,
            "ServiceType Category created successfully",
            "Create ServiceType Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["servicetypecategory"] })
        }
      } else if (modalMode === "edit" && selectedServiceTypeCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceTypeCategory>
        if (
          handleApiResponse(
            response,
            "ServiceType Category updated successfully",
            "Update ServiceType Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["servicetypecategory"] })
        }
      }
    } catch (error) {
      console.error("ServiceType Category form submission error:", error)
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: ServiceTypeFormValues | ServiceTypeCategoryFormValues
  ) => {
    try {
      if (isCategoryModalOpen) {
        await handleServiceTypeCategorySubmit(
          data as ServiceTypeCategoryFormValues
        )
        setIsCategoryModalOpen(false)
      } else {
        await handleServiceTypeSubmit(data as ServiceTypeFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDeleteServiceType = (serviceTypeId: string) => {
    const servicetypeToDelete = servicetypesData.find(
      (c) => c.serviceTypeId.toString() === serviceTypeId
    )
    if (!servicetypeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: serviceTypeId,
      name: servicetypeToDelete.serviceTypeName,
      type: "servicetype",
    })
  }

  const handleDeleteServiceTypeCategory = (serviceTypeCategoryId: string) => {
    const servicetypeCategoryToDelete = servicetypesCategoryData.find(
      (c) => c.serviceTypeCategoryId.toString() === serviceTypeCategoryId
    )
    if (!servicetypeCategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: serviceTypeCategoryId,
      name: servicetypeCategoryToDelete.serviceTypeCategoryName,
      type: "servicetypecategory",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "servicetype":
        mutation = deleteMutation
        break
      case "servicetypecategory":
        mutation = deleteCategoryMutation
        break
      default:
        return
    }

    mutation.mutateAsync(deleteConfirmation.id).then(() => {
      queryClient.invalidateQueries({ queryKey: [deleteConfirmation.queryKey] })
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "servicetype",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${ServiceType.getByCode}/${trimmedCode}`
      )) as ApiResponse<IServiceType>

      if (response.result === 1 && response.data) {
        const servicetypeData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (servicetypeData) {
          setExistingServiceType(servicetypeData as IServiceType)
          setShowLoadDialogServiceType(true)
        }
      }

      const responseCategory = (await getData(
        `${ServiceTypeCategory.getByCode}/${trimmedCode}`
      )) as ApiResponse<IServiceTypeCategory>

      if (responseCategory.result === 1 && responseCategory.data) {
        const servicetypeCategoryData = Array.isArray(responseCategory.data)
          ? responseCategory.data[0]
          : responseCategory.data

        if (servicetypeCategoryData) {
          setExistingServiceTypeCategory(
            servicetypeCategoryData as IServiceTypeCategory
          )
          setShowLoadDialogCategory(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingServiceType = () => {
    if (existingServiceType) {
      setModalMode("edit")
      setSelectedServiceType(existingServiceType)
      setShowLoadDialogServiceType(false)
      setExistingServiceType(null)
    }
  }

  const handleLoadExistingCategory = () => {
    if (existingServiceTypeCategory) {
      setModalMode("edit")
      setSelectedServiceTypeCategory(existingServiceTypeCategory)
      setShowLoadDialogCategory(false)
      setExistingServiceTypeCategory(null)
    }
  }

  // Loading state
  if (
    isLoadingServiceType ||
    isRefetchingServiceType ||
    isLoadingServiceTypeCategory ||
    isRefetchingServiceTypeCategory
  ) {
    return <DataTableSkeleton {...tableSkeletonProps} />
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Service Type</h1>
          <p className="text-muted-foreground text-sm">
            Manage service type information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="servicetype" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servicetype">Service Type</TabsTrigger>
          <TabsTrigger value="servicetypecategory">
            Service Type Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicetype" className="space-y-4">
          {isLoadingServiceType || isRefetchingServiceType ? (
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
          ) : (servicetypesResponse as ApiResponse<IServiceType>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <ServiceTypeTable
                data={servicetypesData}
                isLoading={isLoadingServiceType}
                onServiceTypeSelect={handleViewServiceType}
                onDeleteServiceType={
                  canDelete ? handleDeleteServiceType : undefined
                }
                onEditServiceType={canEdit ? handleEditServiceType : undefined}
                onCreateServiceType={
                  canCreate ? handleCreateServiceType : undefined
                }
                onRefresh={refetchServiceType}
                onFilterChange={handleServiceTypeFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <ServiceTypeTable
              data={servicetypesData}
              isLoading={isLoadingServiceType}
              onServiceTypeSelect={handleViewServiceType}
              onDeleteServiceType={
                canDelete ? handleDeleteServiceType : undefined
              }
              onEditServiceType={canEdit ? handleEditServiceType : undefined}
              onCreateServiceType={
                canCreate ? handleCreateServiceType : undefined
              }
              onRefresh={refetchServiceType}
              onFilterChange={handleServiceTypeFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="servicetypecategory" className="space-y-4">
          {isLoadingServiceTypeCategory || isRefetchingServiceTypeCategory ? (
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
          ) : (
              servicetypesCategoryResponse as ApiResponse<IServiceTypeCategory>
            )?.result === -2 ? (
            <LockSkeleton locked={true}>
              <ServiceTypeCategoryTable
                data={servicetypesCategoryData}
                isLoading={isLoadingServiceTypeCategory}
                onServiceTypeCategorySelect={handleViewServiceTypeCategory}
                onDeleteServiceTypeCategory={
                  canDeleteCategory
                    ? handleDeleteServiceTypeCategory
                    : undefined
                }
                onEditServiceTypeCategory={
                  canEditCategory ? handleEditServiceTypeCategory : undefined
                }
                onCreateServiceTypeCategory={
                  canCreateCategory
                    ? handleCreateServiceTypeCategory
                    : undefined
                }
                onRefresh={refetchServiceTypeCategory}
                onFilterChange={setCategoryFilters}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <ServiceTypeCategoryTable
              data={servicetypesCategoryData}
              isLoading={isLoadingServiceTypeCategory}
              onServiceTypeCategorySelect={handleViewServiceTypeCategory}
              onDeleteServiceTypeCategory={
                canDeleteCategory ? handleDeleteServiceTypeCategory : undefined
              }
              onEditServiceTypeCategory={
                canEditCategory ? handleEditServiceTypeCategory : undefined
              }
              onCreateServiceTypeCategory={
                canCreateCategory ? handleCreateServiceTypeCategory : undefined
              }
              onRefresh={refetchServiceTypeCategory}
              onFilterChange={setCategoryFilters}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Service Type Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Service Type"}
              {modalMode === "edit" && "Update Service Type"}
              {modalMode === "view" && "View Service Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new service type to the system database."
                : modalMode === "edit"
                  ? "Update service type information in the system database."
                  : "View service type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ServiceTypeForm
            initialData={
              modalMode !== "create" ? selectedServiceType : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Service Type Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Service Type Category"}
              {modalMode === "edit" && "Update Service Type Category"}
              {modalMode === "view" && "View Service Type Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new service type category to the system database."
                : modalMode === "edit"
                  ? "Update service type category information."
                  : "View service type category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ServiceTypeCategoryForm
            initialData={
              modalMode !== "create" ? selectedServiceTypeCategory : undefined
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
        open={showLoadDialogServiceType}
        onOpenChange={setShowLoadDialogServiceType}
        onLoad={handleLoadExistingServiceType}
        onCancel={() => setExistingServiceType(null)}
        code={existingServiceType?.serviceTypeCode}
        name={existingServiceType?.serviceTypeName}
        typeLabel="Service Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingCategory}
        onCancel={() => setExistingServiceTypeCategory(null)}
        code={existingServiceTypeCategory?.serviceTypeCategoryCode}
        name={existingServiceTypeCategory?.serviceTypeCategoryName}
        typeLabel="Service Type Category"
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
            type: "servicetype",
          })
        }
        isDeleting={
          deleteConfirmation.type === "servicetype"
            ? deleteMutation.isPending
            : deleteCategoryMutation.isPending
        }
      />
    </div>
  )
}
