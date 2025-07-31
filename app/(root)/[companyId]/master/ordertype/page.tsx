"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IOrderType,
  IOrderTypeCategory,
  IOrderTypeCategoryFilter,
  IOrderTypeFilter,
} from "@/interfaces/ordertype"
import {
  OrderTypeCategoryFormValues,
  OrderTypeFormValues,
} from "@/schemas/ordertype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { OrderType, OrderTypeCategory } from "@/lib/api-routes"
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

import { OrderTypeForm } from "./components/ordertype-form"
import { OrderTypeTable } from "./components/ordertype-table"
import { OrderTypeCategoryForm } from "./components/ordertypecategory-form"
import { OrderTypeCategoryTable } from "./components/ordertypecategory-table"

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

export default function OrderTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.order_type
  const transactionIdCategory = MasterTransactionId.order_type_category

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
  const [filters, setFilters] = useState<IOrderTypeFilter>({})
  const [categoryFilters, setCategoryFilters] =
    useState<IOrderTypeCategoryFilter>({})

  // Data fetching
  const {
    data: ordertypesResponse,
    refetch: refetchOrderType,
    isLoading: isLoadingOrderType,
    isRefetching: isRefetchingOrderType,
  } = useGet<IOrderType>(`${OrderType.get}`, "ordertypes", filters.search)

  const {
    data: ordertypesCategoryResponse,
    refetch: refetchOrderTypeCategory,
    isLoading: isLoadingOrderTypeCategory,
    isRefetching: isRefetchingOrderTypeCategory,
  } = useGet<IOrderTypeCategory>(
    `${OrderTypeCategory.get}`,
    "ordertypecategory",
    categoryFilters.search
  )

  // Extract data from responses
  const ordertypesData =
    (ordertypesResponse as ApiResponse<IOrderType>)?.data || []
  const ordertypesCategoryData =
    (ordertypesCategoryResponse as ApiResponse<IOrderTypeCategory>)?.data || []

  // Mutations
  const saveMutation = usePersist<OrderTypeFormValues>(`${OrderType.add}`)
  const updateMutation = usePersist<OrderTypeFormValues>(`${OrderType.add}`)
  const deleteMutation = useDelete(`${OrderType.delete}`)

  const saveCategoryMutation = usePersist<OrderTypeCategoryFormValues>(
    `${OrderTypeCategory.add}`
  )
  const updateCategoryMutation = usePersist<OrderTypeCategoryFormValues>(
    `${OrderTypeCategory.add}`
  )
  const deleteCategoryMutation = useDelete(`${OrderTypeCategory.delete}`)

  // State management
  const [selectedOrderType, setSelectedOrderType] = useState<
    IOrderType | undefined
  >()
  const [selectedOrderTypeCategory, setSelectedOrderTypeCategory] = useState<
    IOrderTypeCategory | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "ordertype" as "ordertype" | "ordertypecategory",
  })

  // Duplicate detection states
  const [showLoadDialogOrderType, setShowLoadDialogOrderType] = useState(false)
  const [existingOrderType, setExistingOrderType] = useState<IOrderType | null>(
    null
  )

  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingOrderTypeCategory, setExistingOrderTypeCategory] =
    useState<IOrderTypeCategory | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchOrderType()
  }, [filters.search])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchOrderTypeCategory()
  }, [categoryFilters.search])

  // Action handlers
  const handleCreateOrderType = () => {
    setModalMode("create")
    setSelectedOrderType(undefined)
    setIsModalOpen(true)
  }

  const handleEditOrderType = (ordertype: IOrderType) => {
    setModalMode("edit")
    setSelectedOrderType(ordertype)
    setIsModalOpen(true)
  }

  const handleViewOrderType = (ordertype: IOrderType | undefined) => {
    if (!ordertype) return
    setModalMode("view")
    setSelectedOrderType(ordertype)
    setIsModalOpen(true)
  }

  const handleCreateOrderTypeCategory = () => {
    setModalMode("create")
    setSelectedOrderTypeCategory(undefined)
    setIsCategoryModalOpen(true)
  }

  const handleEditOrderTypeCategory = (
    ordertypeCategory: IOrderTypeCategory
  ) => {
    setModalMode("edit")
    setSelectedOrderTypeCategory(ordertypeCategory)
    setIsCategoryModalOpen(true)
  }

  const handleViewOrderTypeCategory = (
    ordertypeCategory: IOrderTypeCategory | undefined
  ) => {
    if (!ordertypeCategory) return
    setModalMode("view")
    setSelectedOrderTypeCategory(ordertypeCategory)
    setIsCategoryModalOpen(true)
  }

  // Filter handlers
  const handleOrderTypeFilterChange = (filters: IOrderTypeFilter) => {
    setFilters(filters)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IOrderType | IOrderTypeCategory>,
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
  const handleOrderTypeSubmit = async (data: OrderTypeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderType>
        if (
          handleApiResponse(
            response,
            "OrderType created successfully",
            "Create OrderType"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["ordertypes"] })
        }
      } else if (modalMode === "edit" && selectedOrderType) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderType>
        if (
          handleApiResponse(
            response,
            "OrderType updated successfully",
            "Update OrderType"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["ordertypes"] })
        }
      }
    } catch (error) {
      console.error("OrderType form submission error:", error)
      toast.error("Failed to process order type request")
    }
  }

  const handleOrderTypeCategorySubmit = async (
    data: OrderTypeCategoryFormValues
  ) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderTypeCategory>
        if (
          handleApiResponse(
            response,
            "OrderType Category created successfully",
            "Create OrderType Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["ordertypecategory"] })
        }
      } else if (modalMode === "edit" && selectedOrderTypeCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderTypeCategory>
        if (
          handleApiResponse(
            response,
            "OrderType Category updated successfully",
            "Update OrderType Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["ordertypecategory"] })
        }
      }
    } catch (error) {
      console.error("OrderType Category form submission error:", error)
      toast.error("Failed to process order type category request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: OrderTypeFormValues | OrderTypeCategoryFormValues
  ) => {
    try {
      if (isCategoryModalOpen) {
        await handleOrderTypeCategorySubmit(data as OrderTypeCategoryFormValues)
        setIsCategoryModalOpen(false)
      } else {
        await handleOrderTypeSubmit(data as OrderTypeFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred during form submission")
    }
  }

  // Delete handlers
  const handleDeleteOrderType = (orderTypeId: string) => {
    const ordertypeToDelete = ordertypesData.find(
      (c) => c.orderTypeId.toString() === orderTypeId
    )
    if (!ordertypeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: orderTypeId,
      name: ordertypeToDelete.orderTypeName,
      type: "ordertype",
    })
  }

  const handleDeleteOrderTypeCategory = (orderTypeCategoryId: string) => {
    const ordertypeCategoryToDelete = ordertypesCategoryData.find(
      (c) => c.orderTypeCategoryId.toString() === orderTypeCategoryId
    )
    if (!ordertypeCategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: orderTypeCategoryId,
      name: ordertypeCategoryToDelete.orderTypeCategoryName,
      type: "ordertypecategory",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "ordertype":
        mutation = deleteMutation
        break
      case "ordertypecategory":
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
      type: "ordertype",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = await getData(`${OrderType.getByCode}/${trimmedCode}`)

      if (response.data.result === 1 && response.data.data) {
        const ordertypeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        if (ordertypeData) {
          setExistingOrderType(ordertypeData as IOrderType)
          setShowLoadDialogOrderType(true)
        }
      }

      const responseCategory = await getData(
        `${OrderTypeCategory.getByCode}/${trimmedCode}`
      )

      if (responseCategory.data.result === 1 && responseCategory.data.data) {
        const ordertypeCategoryData = Array.isArray(responseCategory.data.data)
          ? responseCategory.data.data[0]
          : responseCategory.data.data

        if (ordertypeCategoryData) {
          setExistingOrderTypeCategory(
            ordertypeCategoryData as IOrderTypeCategory
          )
          setShowLoadDialogCategory(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingOrderType = () => {
    if (existingOrderType) {
      setModalMode("edit")
      setSelectedOrderType(existingOrderType)
      setShowLoadDialogOrderType(false)
      setExistingOrderType(null)
    }
  }

  const handleLoadExistingCategory = () => {
    if (existingOrderTypeCategory) {
      setModalMode("edit")
      setSelectedOrderTypeCategory(existingOrderTypeCategory)
      setShowLoadDialogCategory(false)
      setExistingOrderTypeCategory(null)
    }
  }

  // Loading state
  if (
    isLoadingOrderType ||
    isRefetchingOrderType ||
    isLoadingOrderTypeCategory ||
    isRefetchingOrderTypeCategory
  ) {
    return <DataTableSkeleton {...tableSkeletonProps} />
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Order Type</h1>
          <p className="text-muted-foreground text-sm">
            Manage order type information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="ordertype" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ordertype">Order Type</TabsTrigger>
          <TabsTrigger value="ordertypecategory">
            Order Type Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ordertype" className="space-y-4">
          {isLoadingOrderType || isRefetchingOrderType ? (
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
          ) : (ordertypesResponse as ApiResponse<IOrderType>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <OrderTypeTable
                data={ordertypesData}
                isLoading={isLoadingOrderType}
                onOrderTypeSelect={handleViewOrderType}
                onDeleteOrderType={
                  canDelete ? handleDeleteOrderType : undefined
                }
                onEditOrderType={canEdit ? handleEditOrderType : undefined}
                onCreateOrderType={
                  canCreate ? handleCreateOrderType : undefined
                }
                onRefresh={refetchOrderType}
                onFilterChange={handleOrderTypeFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <OrderTypeTable
              data={ordertypesData}
              isLoading={isLoadingOrderType}
              onOrderTypeSelect={handleViewOrderType}
              onDeleteOrderType={canDelete ? handleDeleteOrderType : undefined}
              onEditOrderType={canEdit ? handleEditOrderType : undefined}
              onCreateOrderType={canCreate ? handleCreateOrderType : undefined}
              onRefresh={refetchOrderType}
              onFilterChange={handleOrderTypeFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="ordertypecategory" className="space-y-4">
          {isLoadingOrderTypeCategory || isRefetchingOrderTypeCategory ? (
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
          ) : (ordertypesCategoryResponse as ApiResponse<IOrderTypeCategory>)
              ?.result === -2 ? (
            <LockSkeleton locked={true}>
              <OrderTypeCategoryTable
                data={ordertypesCategoryData}
                isLoading={isLoadingOrderTypeCategory}
                onOrderTypeCategorySelect={handleViewOrderTypeCategory}
                onDeleteOrderTypeCategory={
                  canDeleteCategory ? handleDeleteOrderTypeCategory : undefined
                }
                onEditOrderTypeCategory={
                  canEditCategory ? handleEditOrderTypeCategory : undefined
                }
                onCreateOrderTypeCategory={
                  canCreateCategory ? handleCreateOrderTypeCategory : undefined
                }
                onRefresh={refetchOrderTypeCategory}
                onFilterChange={setCategoryFilters}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <OrderTypeCategoryTable
              data={ordertypesCategoryData}
              isLoading={isLoadingOrderTypeCategory}
              onOrderTypeCategorySelect={handleViewOrderTypeCategory}
              onDeleteOrderTypeCategory={
                canDeleteCategory ? handleDeleteOrderTypeCategory : undefined
              }
              onEditOrderTypeCategory={
                canEditCategory ? handleEditOrderTypeCategory : undefined
              }
              onCreateOrderTypeCategory={
                canCreateCategory ? handleCreateOrderTypeCategory : undefined
              }
              onRefresh={refetchOrderTypeCategory}
              onFilterChange={setCategoryFilters}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Order Type Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Order Type"}
              {modalMode === "edit" && "Update Order Type"}
              {modalMode === "view" && "View Order Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new order type to the system database."
                : modalMode === "edit"
                  ? "Update order type information in the system database."
                  : "View order type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <OrderTypeForm
            initialData={modalMode !== "create" ? selectedOrderType : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Order Type Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Order Type Category"}
              {modalMode === "edit" && "Update Order Type Category"}
              {modalMode === "view" && "View Order Type Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new order type category to the system database."
                : modalMode === "edit"
                  ? "Update order type category information."
                  : "View order type category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <OrderTypeCategoryForm
            initialData={
              modalMode !== "create" ? selectedOrderTypeCategory : undefined
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
        open={showLoadDialogOrderType}
        onOpenChange={setShowLoadDialogOrderType}
        onLoad={handleLoadExistingOrderType}
        onCancel={() => setExistingOrderType(null)}
        code={existingOrderType?.orderTypeCode}
        name={existingOrderType?.orderTypeName}
        typeLabel="Order Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingCategory}
        onCancel={() => setExistingOrderTypeCategory(null)}
        code={existingOrderTypeCategory?.orderTypeCategoryCode}
        name={existingOrderTypeCategory?.orderTypeCategoryName}
        typeLabel="Order Type Category"
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
            type: "ordertype",
          })
        }
        isDeleting={
          deleteConfirmation.type === "ordertype"
            ? deleteMutation.isPending
            : deleteCategoryMutation.isPending
        }
      />
    </div>
  )
}
