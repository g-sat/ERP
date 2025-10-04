"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IOrderType,
  IOrderTypeCategory,
  IOrderTypeCategoryFilter,
  IOrderTypeFilter,
} from "@/interfaces/ordertype"
import {
  OrderTypeCategorySchemaType,
  OrderTypeSchemaType,
} from "@/schemas/ordertype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { OrderTypeForm } from "./components/ordertype-form"
import { OrderTypeTable } from "./components/ordertype-table"
import { OrderTypeCategoryForm } from "./components/ordertypecategory-form"
import { OrderTypeCategoryTable } from "./components/ordertypecategory-table"

export default function OrderTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.orderType
  const transactionIdCategory = MasterTransactionId.orderTypeCategory

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreateCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isCreate"
  )
  const canViewCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isRead"
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

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("OrderType filter change called with:", newFilters)
      setFilters(newFilters as IOrderTypeFilter)
    },
    []
  )

  const handleCategoryFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("OrderType Category filter change called with:", newFilters)
      setCategoryFilters(newFilters as IOrderTypeCategoryFilter)
    },
    []
  )

  // Data fetching
  const {
    data: ordertypesResponse,
    refetch: refetchOrderType,
    isLoading: isLoadingOrderType,
  } = useGet<IOrderType>(`${OrderType.get}`, "ordertypes", filters.search)

  const {
    data: ordertypesCategoryResponse,
    refetch: refetchOrderTypeCategory,
    isLoading: isLoadingOrderTypeCategory,
  } = useGet<IOrderTypeCategory>(
    `${OrderTypeCategory.get}`,
    "ordertypecategory",
    categoryFilters.search
  )

  // Extract data from responses with fallback values
  const { result: ordertypesResult, data: ordertypesData } =
    (ordertypesResponse as ApiResponse<IOrderType>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: ordertypesCategoryResult, data: ordertypesCategoryData } =
    (ordertypesCategoryResponse as ApiResponse<IOrderTypeCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<OrderTypeSchemaType>(`${OrderType.add}`)
  const updateMutation = usePersist<OrderTypeSchemaType>(`${OrderType.add}`)
  const deleteMutation = useDelete(`${OrderType.delete}`)

  const saveCategoryMutation = usePersist<OrderTypeCategorySchemaType>(
    `${OrderTypeCategory.add}`
  )
  const updateCategoryMutation = usePersist<OrderTypeCategorySchemaType>(
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
  }, [filters.search, refetchOrderType])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchOrderTypeCategory()
  }, [categoryFilters.search, refetchOrderTypeCategory])

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

  const handleViewOrderType = (ordertype: IOrderType | null) => {
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
    ordertypeCategory: IOrderTypeCategory | null
  ) => {
    if (!ordertypeCategory) return
    setModalMode("view")
    setSelectedOrderTypeCategory(ordertypeCategory)
    setIsCategoryModalOpen(true)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IOrderType | IOrderTypeCategory>
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleOrderTypeSubmit = async (data: OrderTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderType>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["ordertypes"] })
        }
      } else if (modalMode === "edit" && selectedOrderType) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderType>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["ordertypes"] })
        }
      }
    } catch (error) {
      console.error("OrderType form submission error:", error)
    }
  }

  const handleOrderTypeCategorySubmit = async (
    data: OrderTypeCategorySchemaType
  ) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderTypeCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["ordertypecategory"] })
        }
      } else if (modalMode === "edit" && selectedOrderTypeCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IOrderTypeCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["ordertypecategory"] })
        }
      }
    } catch (error) {
      console.error("OrderType Category form submission error:", error)
    }
  }

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: OrderTypeSchemaType | OrderTypeCategorySchemaType | null
    type: "ordertype" | "ordertypecategory"
  }>({
    isOpen: false,
    data: null,
    type: "ordertype",
  })

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: OrderTypeSchemaType | OrderTypeCategorySchemaType
  ) => {
    try {
      if (saveConfirmation.type === "ordertypecategory") {
        await handleOrderTypeCategorySubmit(data as OrderTypeCategorySchemaType)
        setIsCategoryModalOpen(false)
      } else {
        await handleOrderTypeSubmit(data as OrderTypeSchemaType)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
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

    mutation.mutateAsync(deleteConfirmation.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["ordertypes"] })
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

  // Loading state removed - individual tables handle their own loading states

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Order Type
          </h1>
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
          {isLoadingOrderType ? (
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
          ) : ordertypesResult === -2 ||
            (!canView && !canEdit && !canDelete && !canCreate) ? (
            <LockSkeleton locked={true}>
              <OrderTypeTable
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
            <OrderTypeTable
              data={filters.search ? [] : ordertypesData || []}
              onSelect={canView ? handleViewOrderType : undefined}
              onDelete={canDelete ? handleDeleteOrderType : undefined}
              onEdit={canEdit ? handleEditOrderType : undefined}
              onCreate={canCreate ? handleCreateOrderType : undefined}
              onRefresh={refetchOrderType}
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

        <TabsContent value="ordertypecategory" className="space-y-4">
          {isLoadingOrderTypeCategory ? (
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
          ) : ordertypesCategoryResult === -2 ||
            (!canViewCategory &&
              !canEditCategory &&
              !canDeleteCategory &&
              !canCreateCategory) ? (
            <LockSkeleton locked={true}>
              <OrderTypeCategoryTable
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
                canView={canViewCategory}
                canCreate={canCreateCategory}
              />
            </LockSkeleton>
          ) : (
            <OrderTypeCategoryTable
              data={categoryFilters.search ? [] : ordertypesCategoryData || []}
              onSelect={
                canViewCategory ? handleViewOrderTypeCategory : undefined
              }
              onDelete={
                canDeleteCategory ? handleDeleteOrderTypeCategory : undefined
              }
              onEdit={canEditCategory ? handleEditOrderTypeCategory : undefined}
              onCreate={
                canCreateCategory ? handleCreateOrderTypeCategory : undefined
              }
              onRefresh={refetchOrderTypeCategory}
              onFilterChange={handleCategoryFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
              canEdit={canEditCategory}
              canDelete={canDeleteCategory}
              canView={canViewCategory}
              canCreate={canCreateCategory}
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
            submitAction={handleOrderTypeSubmit}
            onCancelAction={() => setIsModalOpen(false)}
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
            submitAction={handleOrderTypeCategorySubmit}
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
        open={showLoadDialogOrderType}
        onOpenChange={setShowLoadDialogOrderType}
        onLoad={handleLoadExistingOrderType}
        onCancel={() => setExistingOrderType(null)}
        code={existingOrderType?.orderTypeCode}
        name={existingOrderType?.orderTypeName}
        typeLabel="Order Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadConfirmation
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
          saveConfirmation.type === "ordertype"
            ? (saveConfirmation.data as OrderTypeSchemaType)?.orderTypeName ||
              ""
            : (saveConfirmation.data as OrderTypeCategorySchemaType)
                ?.orderTypeCategoryName || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "ordertype",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "ordertype",
          })
        }
        isSaving={
          saveConfirmation.type === "ordertype"
            ? saveMutation.isPending || updateMutation.isPending
            : saveCategoryMutation.isPending || updateCategoryMutation.isPending
        }
      />
    </div>
  )
}
