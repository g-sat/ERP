"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IProduct, IProductFilter } from "@/interfaces/product"
import { ProductSchemaType } from "@/schemas/product"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Product } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGetWithPagination, usePersist } from "@/hooks/use-common"
import { useUserSettingDefaults } from "@/hooks/use-settings"
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

import { ProductForm } from "./components/product-form"
import { ProductsTable } from "./components/product-table"

export default function ProductPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.product

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IProductFilter>({})
  const { defaults } = useUserSettingDefaults()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    defaults?.common?.masterGridTotalRecords || 50
  )

  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IProductFilter)
    },
    []
  )
  const {
    data: productsResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<IProduct>(
    `${Product.get}`,
    "products",
    filters.search,
    currentPage,
    pageSize
  )

  const {
    result: productsResult,
    data: productsData,
    totalRecords,
  } = (productsResponse as ApiResponse<IProduct>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  const saveMutation = usePersist<ProductSchemaType>(`${Product.add}`)
  const updateMutation = usePersist<ProductSchemaType>(`${Product.add}`)
  const deleteMutation = useDelete(`${Product.delete}`)

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingProduct, setExistingProduct] = useState<IProduct | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string | null
  }>({
    isOpen: false,
    productId: null,
    productName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: ProductSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const handleCreateProduct = () => {
    setModalMode("create")
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: IProduct) => {
    setModalMode("edit")
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleViewProduct = (product: IProduct | null) => {
    if (!product) return
    setModalMode("view")
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: ProductSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: ProductSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["products"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedProduct) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["products"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = productsData?.find(
      (p) => p.productId.toString() === productId
    )
    if (!productToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      productId,
      productName: productToDelete.productName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.productId) {
      deleteMutation.mutateAsync(deleteConfirmation.productId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["products"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        productId: null,
        productName: null,
      })
    }
  }

  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${Product.getByCode}/${trimmedCode}`)
        if (response?.result === 1 && response.data) {
          const productData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (productData) {
            const validProductData: IProduct = {
              productId: productData.productId,
              productCode: productData.productCode,
              productName: productData.productName,
              companyId: productData.companyId,
              remarks: productData.remarks || "",
              isActive: productData.isActive ?? true,
              createBy: productData.createBy,
              editBy: productData.editBy,
              createDate: productData.createDate,
              editDate: productData.editDate,
            }
            setExistingProduct(validProductData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  const handleLoadExistingProduct = () => {
    if (existingProduct) {
      setModalMode("edit")
      setSelectedProduct(existingProduct)
      setShowLoadDialog(false)
      setExistingProduct(null)
    }
  }

  useEffect(() => {}, [modalMode])

  useEffect(() => {
    if (selectedProduct) {
    }
  }, [selectedProduct])

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage product information and settings
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
      ) : productsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <ProductsTable
            data={[]}
            onSelect={() => {}}
            onDeleteAction={() => {}}
            onEditAction={() => {}}
            onCreateAction={() => {}}
            onRefreshAction={() => {}}
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
      ) : productsResult ? (
        <ProductsTable
          data={filters.search ? [] : productsData || []}
          onSelect={canView ? handleViewProduct : undefined}
          onDeleteAction={canDelete ? handleDeleteProduct : undefined}
          onEditAction={canEdit ? handleEditProduct : undefined}
          onCreateAction={canCreate ? handleCreateProduct : undefined}
          onRefreshAction={handleRefresh}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
          serverSidePagination={true}
          moduleId={moduleId}
          transactionId={transactionId}
          isLoading={isLoading}
          totalRecords={totalRecords}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {productsResult === 0 ? "No data available" : "Loading..."}
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
              {modalMode === "create" && "Create Product"}
              {modalMode === "edit" && "Update Product"}
              {modalMode === "view" && "View Product"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new product to the system database."
                : modalMode === "edit"
                  ? "Update product information in the system database."
                  : "View product details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ProductForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedProduct
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

      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingProduct}
        onCancelAction={() => setExistingProduct(null)}
        code={existingProduct?.productCode}
        name={existingProduct?.productName}
        typeLabel="Product"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Product"
        description="This action cannot be undone. This will permanently delete the product from our servers."
        itemName={deleteConfirmation.productName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({
            isOpen: false,
            productId: null,
            productName: null,
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
        title={modalMode === "create" ? "Create Product" : "Update Product"}
        itemName={saveConfirmation.data?.productName || ""}
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
        onCancelAction={() =>
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
