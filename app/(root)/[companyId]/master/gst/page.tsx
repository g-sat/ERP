"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IGst,
  IGstCategory,
  IGstCategoryFilter,
  IGstDt,
  IGstFilter,
} from "@/interfaces/gst"
import {
  GstCategoryFormValues,
  GstDtFormValues,
  GstFormValues,
} from "@/schemas/gst"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { Gst, GstCategory, GstDt } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common"
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

import { GstForm } from "./components/gst-form"
import { GstTable } from "./components/gst-table"
import { GstCategoryForm } from "./components/gstcategory-form"
import { GstCategoryTable } from "./components/gstcategory-table"
import { GstDtForm } from "./components/gstdt-form"
import { GstDtTable } from "./components/gstdt-table"

export default function GstPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.gst
  const transactionIdCategory = MasterTransactionId.gst_category
  const transactionIdDt = MasterTransactionId.gst_dt

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
  const [filters, setFilters] = useState<IGstFilter>({})
  const [dtFilters, setDtFilters] = useState<IGstFilter>({})
  const [categoryFilters, setCategoryFilters] = useState<IGstCategoryFilter>({})

  // Data fetching
  const {
    data: gstsResponse,
    refetch: refetchGst,
    isLoading: isLoadingGst,
    isRefetching: isRefetchingGst,
  } = useGet<IGst>(`${Gst.get}`, "gsts", filters.search)

  const {
    data: gstsDtResponse,
    refetch: refetchGstDt,
    isLoading: isLoadingGstDt,
    isRefetching: isRefetchingGstDt,
  } = useGet<IGstDt>(`${GstDt.get}`, "gstsdt", dtFilters.search)

  const {
    data: gstsCategoryResponse,
    refetch: refetchGstCategory,
    isLoading: isLoadingGstCategory,
    isRefetching: isRefetchingGstCategory,
  } = useGet<IGstCategory>(
    `${GstCategory.get}`,
    "gstcategory",
    categoryFilters.search
  )

  // Extract data from responses
  const gstsData = (gstsResponse as ApiResponse<IGst>)?.data || []
  const gstsDtData = (gstsDtResponse as ApiResponse<IGstDt>)?.data || []
  const gstsCategoryData =
    (gstsCategoryResponse as ApiResponse<IGstCategory>)?.data || []

  // Mutations
  const saveMutation = useSave<GstFormValues>(`${Gst.add}`)
  const updateMutation = useUpdate<GstFormValues>(`${Gst.add}`)
  const deleteMutation = useDelete(`${Gst.delete}`)

  const saveDtMutation = useSave<GstDtFormValues>(`${GstDt.add}`)
  const updateDtMutation = useUpdate<GstDtFormValues>(`${GstDt.add}`)
  const deleteDtMutation = useDelete(`${GstDt.delete}`)

  const saveCategoryMutation = useSave<GstCategoryFormValues>(
    `${GstCategory.add}`
  )
  const updateCategoryMutation = useUpdate<GstCategoryFormValues>(
    `${GstCategory.add}`
  )
  const deleteCategoryMutation = useDelete(`${GstCategory.delete}`)

  // State management
  const [selectedGst, setSelectedGst] = useState<IGst | undefined>()
  const [selectedGstDt, setSelectedGstDt] = useState<IGstDt | undefined>()
  const [selectedGstCategory, setSelectedGstCategory] = useState<
    IGstCategory | undefined
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
    type: "gst" as "gst" | "gstdt" | "gstcategory",
  })

  // Duplicate detection states
  const [showLoadDialogGst, setShowLoadDialogGst] = useState(false)
  const [existingGst, setExistingGst] = useState<IGst | null>(null)
  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingGstCategory, setExistingGstCategory] =
    useState<IGstCategory | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchGst()
  }, [filters.search])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchGstDt()
  }, [dtFilters.search])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchGstCategory()
  }, [categoryFilters.search])

  // Action handlers
  const handleCreateGst = () => {
    setModalMode("create")
    setSelectedGst(undefined)
    setIsModalOpen(true)
  }

  const handleEditGst = (gst: IGst) => {
    setModalMode("edit")
    setSelectedGst(gst)
    setIsModalOpen(true)
  }

  const handleViewGst = (gst: IGst | null) => {
    if (!gst) return
    setModalMode("view")
    setSelectedGst(gst)
    setIsModalOpen(true)
  }

  const handleCreateGstDt = () => {
    setModalMode("create")
    setSelectedGstDt(undefined)
    setIsDtModalOpen(true)
  }

  const handleEditGstDt = (gstDt: IGstDt) => {
    setModalMode("edit")
    setSelectedGstDt(gstDt)
    setIsDtModalOpen(true)
  }

  const handleViewGstDt = (gstDt: IGstDt | null) => {
    if (!gstDt) return
    setModalMode("view")
    setSelectedGstDt(gstDt)
    setIsDtModalOpen(true)
  }

  const handleCreateGstCategory = () => {
    setModalMode("create")
    setSelectedGstCategory(undefined)
    setIsCategoryModalOpen(true)
  }

  const handleEditGstCategory = (gstCategory: IGstCategory) => {
    setModalMode("edit")
    setSelectedGstCategory(gstCategory)
    setIsCategoryModalOpen(true)
  }

  const handleViewGstCategory = (gstCategory: IGstCategory | null) => {
    if (!gstCategory) return
    setModalMode("view")
    setSelectedGstCategory(gstCategory)
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
  const handleGstSubmit = async (data: GstFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IGst>
        if (
          handleApiResponse(response, "GST created successfully", "Create GST")
        ) {
          queryClient.invalidateQueries({ queryKey: ["gsts"] })
        }
      } else if (modalMode === "edit" && selectedGst) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IGst>
        if (
          handleApiResponse(response, "GST updated successfully", "Update GST")
        ) {
          queryClient.invalidateQueries({ queryKey: ["gsts"] })
        }
      }
    } catch (error) {
      console.error("GST form submission error:", error)
      toast.error("Failed to process GST request")
    }
  }

  const handleGstDtSubmit = async (data: GstDtFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<IGstDt>
        if (
          handleApiResponse(
            response,
            "GST Details created successfully",
            "Create GST Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["gstsdt"] })
        }
      } else if (modalMode === "edit" && selectedGstDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<IGstDt>
        if (
          handleApiResponse(
            response,
            "GST Details updated successfully",
            "Update GST Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["gstsdt"] })
        }
      }
    } catch (error) {
      console.error("GST Details form submission error:", error)
      toast.error("Failed to process GST Details request")
    }
  }

  const handleGstCategorySubmit = async (data: GstCategoryFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IGstCategory>
        if (
          handleApiResponse(
            response,
            "GST Category created successfully",
            "Create GST Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["gstcategory"] })
        }
      } else if (modalMode === "edit" && selectedGstCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IGstCategory>
        if (
          handleApiResponse(
            response,
            "GST Category updated successfully",
            "Update GST Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["gstcategory"] })
        }
      }
    } catch (error) {
      console.error("GST Category form submission error:", error)
      toast.error("Failed to process GST Category request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: GstFormValues | GstDtFormValues | GstCategoryFormValues
  ) => {
    try {
      if (isDtModalOpen) {
        await handleGstDtSubmit(data as GstDtFormValues)
        setIsDtModalOpen(false)
      } else if (isCategoryModalOpen) {
        await handleGstCategorySubmit(data as GstCategoryFormValues)
        setIsCategoryModalOpen(false)
      } else {
        await handleGstSubmit(data as GstFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred during form submission")
    }
  }

  // Delete handlers
  const handleDeleteGst = (gstId: string) => {
    const gstToDelete = gstsData.find((c) => c.gstId.toString() === gstId)
    if (!gstToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: gstId,
      name: gstToDelete.gstName,
      type: "gst",
    })
  }

  const handleDeleteGstDt = (gstId: string) => {
    const gstDtToDelete = gstsDtData.find((c) => c.gstId.toString() === gstId)
    if (!gstDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: gstId,
      name: gstDtToDelete.gstName,
      type: "gstdt",
    })
  }

  const handleDeleteGstCategory = (gstCategoryId: string) => {
    const gstCategoryToDelete = gstsCategoryData.find(
      (c) => c.gstCategoryId.toString() === gstCategoryId
    )
    if (!gstCategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: gstCategoryId,
      name: gstCategoryToDelete.gstCategoryName,
      type: "gstcategory",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "gst":
        mutation = deleteMutation
        break
      case "gstdt":
        mutation = deleteDtMutation
        break
      case "gstcategory":
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
      type: "gst",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      if (isModalOpen) {
        const response = await getData(`${Gst.getByCode}/${trimmedCode}`)

        if (response.data.result === 1 && response.data.data) {
          const countryData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (countryData) {
            setExistingGst(countryData as IGst)
            setShowLoadDialogGst(true)
          }
        }
      } else if (isCategoryModalOpen) {
        const response = await getData(
          `${GstCategory.getByCode}/${trimmedCode}`
        )
        if (response.data.result === 1 && response.data.data) {
          const categoryData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (categoryData) {
            setExistingGstCategory(categoryData as IGstCategory)
            setShowLoadDialogCategory(true)
          }
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingGst = () => {
    if (existingGst) {
      setModalMode("edit")
      setSelectedGst(existingGst)
      setShowLoadDialogGst(false)
      setExistingGst(null)
    }
  }

  const handleLoadExistingGstCategory = () => {
    if (existingGstCategory) {
      setModalMode("edit")
      setSelectedGstCategory(existingGstCategory)
      setShowLoadDialogCategory(false)
      setExistingGstCategory(null)
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

      <Tabs defaultValue="gsts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gsts">Gst</TabsTrigger>
          <TabsTrigger value="gstsdt">Gst Details</TabsTrigger>
          <TabsTrigger value="gstscategory">Gst Category</TabsTrigger>
        </TabsList>

        <TabsContent value="gsts" className="space-y-4">
          {isLoadingGst || isRefetchingGst ? (
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
          ) : (gstsResponse as ApiResponse<IGst>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <GstTable
                data={gstsData}
                isLoading={isLoadingGst}
                onGstSelect={handleViewGst}
                onDeleteGst={canDelete ? handleDeleteGst : undefined}
                onEditGst={canEdit ? handleEditGst : undefined}
                onCreateGst={canCreate ? handleCreateGst : undefined}
                onRefresh={refetchGst}
                onFilterChange={setFilters}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <GstTable
              data={gstsData}
              isLoading={isLoadingGst}
              onGstSelect={handleViewGst}
              onDeleteGst={canDelete ? handleDeleteGst : undefined}
              onEditGst={canEdit ? handleEditGst : undefined}
              onCreateGst={canCreate ? handleCreateGst : undefined}
              onRefresh={refetchGst}
              onFilterChange={setFilters}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="gstsdt" className="space-y-4">
          {isLoadingGstDt || isRefetchingGstDt ? (
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
          ) : (gstsDtResponse as ApiResponse<IGstDt>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <GstDtTable
                data={gstsDtData}
                isLoading={isLoadingGstDt}
                onGstDtSelect={handleViewGstDt}
                onDeleteGstDt={canDeleteDt ? handleDeleteGstDt : undefined}
                onEditGstDt={canEditDt ? handleEditGstDt : undefined}
                onCreateGstDt={canCreateDt ? handleCreateGstDt : undefined}
                onRefresh={refetchGstDt}
                onFilterChange={setDtFilters}
                moduleId={moduleId}
                transactionId={transactionIdDt}
              />
            </LockSkeleton>
          ) : (
            <GstDtTable
              data={gstsDtData}
              isLoading={isLoadingGstDt}
              onGstDtSelect={handleViewGstDt}
              onDeleteGstDt={canDeleteDt ? handleDeleteGstDt : undefined}
              onEditGstDt={canEditDt ? handleEditGstDt : undefined}
              onCreateGstDt={canCreateDt ? handleCreateGstDt : undefined}
              onRefresh={refetchGstDt}
              onFilterChange={setDtFilters}
              moduleId={moduleId}
              transactionId={transactionIdDt}
            />
          )}
        </TabsContent>

        <TabsContent value="gstscategory" className="space-y-4">
          {isLoadingGstCategory || isRefetchingGstCategory ? (
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
          ) : (gstsCategoryResponse as ApiResponse<IGstCategory>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <GstCategoryTable
                data={gstsCategoryData}
                isLoading={isLoadingGstCategory}
                onGstCategorySelect={handleViewGstCategory}
                onDeleteGstCategory={
                  canDeleteCategory ? handleDeleteGstCategory : undefined
                }
                onEditGstCategory={
                  canEditCategory ? handleEditGstCategory : undefined
                }
                onCreateGstCategory={
                  canCreateCategory ? handleCreateGstCategory : undefined
                }
                onRefresh={refetchGstCategory}
                onFilterChange={setCategoryFilters}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
              />
            </LockSkeleton>
          ) : (
            <GstCategoryTable
              data={gstsCategoryData}
              isLoading={isLoadingGstCategory}
              onGstCategorySelect={handleViewGstCategory}
              onDeleteGstCategory={
                canDeleteCategory ? handleDeleteGstCategory : undefined
              }
              onEditGstCategory={
                canEditCategory ? handleEditGstCategory : undefined
              }
              onCreateGstCategory={
                canCreateCategory ? handleCreateGstCategory : undefined
              }
              onRefresh={refetchGstCategory}
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
              {modalMode === "create" && "Create Gst"}
              {modalMode === "edit" && "Update Gst"}
              {modalMode === "view" && "View Gst"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new gst to the system database."
                : modalMode === "edit"
                  ? "Update gst information in the system database."
                  : "View gst details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <GstForm
            initialData={modalMode !== "create" ? selectedGst : undefined}
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
              {modalMode === "create" && "Create Gst Details"}
              {modalMode === "edit" && "Update Gst Details"}
              {modalMode === "view" && "View Gst Details"}
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
          <GstDtForm
            initialData={modalMode !== "create" ? selectedGstDt : undefined}
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
          <GstCategoryForm
            initialData={
              modalMode !== "create" ? selectedGstCategory : undefined
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
        open={showLoadDialogGst}
        onOpenChange={setShowLoadDialogGst}
        onLoad={handleLoadExistingGst}
        onCancel={() => setExistingGst(null)}
        code={existingGst?.gstCode}
        name={existingGst?.gstName}
        typeLabel="GST"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingGstCategory}
        onCancel={() => setExistingGstCategory(null)}
        code={existingGstCategory?.gstCategoryCode}
        name={existingGstCategory?.gstCategoryName}
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
            type: "gst",
          })
        }
        isDeleting={
          deleteConfirmation.type === "gst"
            ? deleteMutation.isPending
            : deleteConfirmation.type === "gstdt"
              ? deleteDtMutation.isPending
              : deleteCategoryMutation.isPending
        }
      />
    </div>
  )
}
