"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IServiceType,
  IServiceTypeCategory,
  IServiceTypeCategoryFilter,
  IServiceTypeFilter,
} from "@/interfaces/servicetype"
import {
  ServiceTypeCategorySchemaType,
  ServiceTypeSchemaType,
} from "@/schemas/servicetype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { ServiceTypeForm } from "./components/servicetype-form"
import { ServiceTypeTable } from "./components/servicetype-table"
import { ServiceTypeCategoryForm } from "./components/servicetypecategory-form"
import { ServiceTypeCategoryTable } from "./components/servicetypecategory-table"

export default function ServiceTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.serviceType
  const transactionIdCategory = MasterTransactionId.serviceTypeCategory

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")

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
  const canViewCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isRead"
  )

  // State for filters
  const [filters, setFilters] = useState<IServiceTypeFilter>({})
  const [categoryFilters, setCategoryFilters] =
    useState<IServiceTypeCategoryFilter>({})

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IServiceTypeFilter)
    },
    []
  )

  const handleCategoryFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setCategoryFilters(newFilters as IServiceTypeCategoryFilter)
    },
    []
  )

  // Data fetching
  const {
    data: servicetypesResponse,
    refetch: refetchServiceType,
    isLoading: isLoadingServiceType,
  } = useGet<IServiceType>(`${ServiceType.get}`, "servicetypes", filters.search)

  const {
    data: servicetypesCategoryResponse,
    refetch: refetchServiceTypeCategory,
    isLoading: isLoadingServiceTypeCategory,
  } = useGet<IServiceTypeCategory>(
    `${ServiceTypeCategory.get}`,
    "servicetypecategory",
    categoryFilters.search
  )

  // Extract data from responses with fallback values
  const {
    result: servicetypesResult,
    data: servicetypesData,
    totalRecords: servicetypesTotalRecords,
  } = (servicetypesResponse as ApiResponse<IServiceType>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }
  const {
    result: servicetypesCategoryResult,
    data: servicetypesCategoryData,
    totalRecords: servicetypesCategoryTotalRecords,
  } = (servicetypesCategoryResponse as ApiResponse<IServiceTypeCategory>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  // Mutations
  const saveMutation = usePersist<ServiceTypeSchemaType>(`${ServiceType.add}`)
  const updateMutation = usePersist<ServiceTypeSchemaType>(`${ServiceType.add}`)
  const deleteMutation = useDelete(`${ServiceType.delete}`)

  const saveCategoryMutation = usePersist<ServiceTypeCategorySchemaType>(
    `${ServiceTypeCategory.add}`
  )
  const updateCategoryMutation = usePersist<ServiceTypeCategorySchemaType>(
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
  }, [filters.search, refetchServiceType])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchServiceTypeCategory()
  }, [categoryFilters.search, refetchServiceTypeCategory])

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

  const handleViewServiceType = (servicetype: IServiceType | null) => {
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
    servicetypeCategory: IServiceTypeCategory | null
  ) => {
    if (!servicetypeCategory) return
    setModalMode("view")
    setSelectedServiceTypeCategory(servicetypeCategory)
    setIsCategoryModalOpen(true)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IServiceType | IServiceTypeCategory>
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleServiceTypeSubmit = async (data: ServiceTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceType>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["servicetypes"] })
        }
      } else if (modalMode === "edit" && selectedServiceType) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceType>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["servicetypes"] })
        }
      }
    } catch (error) {
      console.error("ServiceType form submission error:", error)
    }
  }

  const handleServiceTypeCategorySubmit = async (
    data: ServiceTypeCategorySchemaType
  ) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceTypeCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["servicetypecategory"] })
        }
      } else if (modalMode === "edit" && selectedServiceTypeCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IServiceTypeCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["servicetypecategory"] })
        }
      }
    } catch (error) {
      console.error("ServiceType Category form submission error:", error)
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: ServiceTypeSchemaType | ServiceTypeCategorySchemaType
  ) => {
    try {
      if (isCategoryModalOpen) {
        await handleServiceTypeCategorySubmit(
          data as ServiceTypeCategorySchemaType
        )
        setIsCategoryModalOpen(false)
      } else {
        await handleServiceTypeSubmit(data as ServiceTypeSchemaType)
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

  // Individual deletion executors for each entity type
  const executeDeleteServiceType = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["servicetypes"] })
  }

  const executeDeleteServiceTypeCategory = async (id: string) => {
    await deleteCategoryMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["servicetypecategory"] })
  }

  // Mapping of deletion types to their executor functions
  const deletionExecutors = {
    servicetype: executeDeleteServiceType,
    servicetypecategory: executeDeleteServiceTypeCategory,
  } as const

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return

    const executor = deletionExecutors[deleteConfirmation.type]
    if (!executor) return

    await executor(deleteConfirmation.id)

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "servicetype",
    })
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
          `${ServiceType.getByCode}/${trimmedCode}`
        )

        if (response?.result === 1 && response.data) {
          const servicetypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (servicetypeData) {
            setExistingServiceType(servicetypeData as IServiceType)
            setShowLoadDialogServiceType(true)
          }
        }

        const responseCategory = await getById(
          `${ServiceTypeCategory.getByCode}/${trimmedCode}`
        )

        if (responseCategory?.result === 1 && responseCategory.data) {
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
    },
    [modalMode]
  )

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

  // Loading state removed - individual tables handle their own loading states

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Service Type
          </h1>
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
          {isLoadingServiceType ? (
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
          ) : servicetypesResult === -2 ||
            (!canView && !canEdit && !canDelete && !canCreate) ? (
            <LockSkeleton locked={true}>
              <ServiceTypeTable
                data={[]}
                isLoading={false}
                totalRecords={servicetypesTotalRecords}
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
            <ServiceTypeTable
              data={filters.search ? [] : servicetypesData || []}
              totalRecords={servicetypesTotalRecords}
              onSelect={canView ? handleViewServiceType : undefined}
              onDelete={canDelete ? handleDeleteServiceType : undefined}
              onEdit={canEdit ? handleEditServiceType : undefined}
              onCreate={canCreate ? handleCreateServiceType : undefined}
              onRefresh={refetchServiceType}
              onFilterChange={handleFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canEdit={canEdit}
              canDelete={canDelete}
              canView={canView}
              canCreate={canCreate}
            />
          )}
        </TabsContent>

        <TabsContent value="servicetypecategory" className="space-y-4">
          {isLoadingServiceTypeCategory ? (
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
          ) : servicetypesCategoryResult === -2 ||
            (!canViewCategory &&
              !canEditCategory &&
              !canDeleteCategory &&
              !canCreateCategory) ? (
            <LockSkeleton locked={true}>
              <ServiceTypeCategoryTable
                data={[]}
                isLoading={false}
                totalRecords={servicetypesCategoryTotalRecords}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={refetchServiceTypeCategory}
                onFilterChange={handleCategoryFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                canEdit={canEditCategory}
                canDelete={canDeleteCategory}
                canView={canViewCategory}
                canCreate={canCreateCategory}
              />
            </LockSkeleton>
          ) : (
            <ServiceTypeCategoryTable
              data={
                categoryFilters.search ? [] : servicetypesCategoryData || []
              }
              totalRecords={servicetypesCategoryTotalRecords}
              onSelect={
                canViewCategory ? handleViewServiceTypeCategory : undefined
              }
              onDelete={
                canDeleteCategory ? handleDeleteServiceTypeCategory : undefined
              }
              onEdit={
                canEditCategory ? handleEditServiceTypeCategory : undefined
              }
              onCreate={
                canCreateCategory ? handleCreateServiceTypeCategory : undefined
              }
              onRefresh={refetchServiceTypeCategory}
              onFilterChange={handleCategoryFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canEdit={canEditCategory}
              canDelete={canDeleteCategory}
              canView={canViewCategory}
              canCreate={canCreateCategory}
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
            onCancelAction={() => setIsModalOpen(false)}
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
        open={showLoadDialogServiceType}
        onOpenChange={setShowLoadDialogServiceType}
        onLoad={handleLoadExistingServiceType}
        onCancel={() => setExistingServiceType(null)}
        code={existingServiceType?.serviceTypeCode}
        name={existingServiceType?.serviceTypeName}
        typeLabel="Service Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadConfirmation
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
