"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IGst,
  IGstCategory,
  IGstCategoryFilter,
  IGstDt,
  IGstFilter,
} from "@/interfaces/gst"
import {
  GstCategorySchemaType,
  GstDtSchemaType,
  GstSchemaType,
} from "@/schemas/gst"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { Gst, GstCategory, GstDt } from "@/lib/api-routes"
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

import { GstForm } from "./components/gst-form"
import { GstTable } from "./components/gst-table"
import { GstCategoryForm } from "./components/gstcategory-form"
import { GstCategoryTable } from "./components/gstcategory-table"
import { GstDtForm } from "./components/gstdt-form"
import { GstDtTable } from "./components/gstdt-table"

export default function GstPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.gst
  const transactionIdCategory = MasterTransactionId.gstCategory
  const transactionIdDt = MasterTransactionId.gstDt

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
  const [filters, setFilters] = useState<IGstFilter>({})

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Gst filter change called with:", newFilters)
      setFilters(newFilters as IGstFilter)
    },
    []
  )

  const handleDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Gst Dt filter change called with:", newFilters)
      setDtFilters(newFilters as IGstFilter)
    },
    []
  )

  const handleCategoryFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Gst Category filter change called with:", newFilters)
      setCategoryFilters(newFilters as IGstCategoryFilter)
    },
    []
  )

  const [dtFilters, setDtFilters] = useState<IGstFilter>({})
  const [categoryFilters, setCategoryFilters] = useState<IGstCategoryFilter>({})

  // Data fetching
  const {
    data: gstsResponse,
    refetch: refetchGst,
    isLoading: isLoadingGst,
  } = useGet<IGst>(`${Gst.get}`, "gsts", filters.search)

  const {
    data: gstsDtResponse,
    refetch: refetchGstDt,
    isLoading: isLoadingGstDt,
  } = useGet<IGstDt>(`${GstDt.get}`, "gstsdt", dtFilters.search)

  const {
    data: gstsCategoryResponse,
    refetch: refetchGstCategory,
    isLoading: isLoadingGstCategory,
  } = useGet<IGstCategory>(
    `${GstCategory.get}`,
    "gstcategory",
    categoryFilters.search
  )

  // Extract data from responses with fallback values
  const { result: gstsResult, data: gstsData } =
    (gstsResponse as ApiResponse<IGst>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: gstsDtResult, data: gstsDtData } =
    (gstsDtResponse as ApiResponse<IGstDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: gstsCategoryResult, data: gstsCategoryData } =
    (gstsCategoryResponse as ApiResponse<IGstCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<GstSchemaType>(`${Gst.add}`)
  const updateMutation = usePersist<GstSchemaType>(`${Gst.add}`)
  const deleteMutation = useDelete(`${Gst.delete}`)

  const saveDtMutation = usePersist<GstDtSchemaType>(`${GstDt.add}`)
  const updateDtMutation = usePersist<GstDtSchemaType>(`${GstDt.add}`)
  const deleteDtMutation = useDelete(`${GstDt.delete}`)

  const saveCategoryMutation = usePersist<GstCategorySchemaType>(
    `${GstCategory.add}`
  )
  const updateCategoryMutation = usePersist<GstCategorySchemaType>(
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
    response: ApiResponse<IGst | IGstDt | IGstCategory>
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleGstSubmit = async (data: GstSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IGst>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gsts"] })
        }
      } else if (modalMode === "edit" && selectedGst) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IGst>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gsts"] })
        }
      }
    } catch (error) {
      console.error("Gst form submission error:", error)
    }
  }

  const handleGstDtSubmit = async (data: GstDtSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<IGstDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gstsdt"] })
        }
      } else if (modalMode === "edit" && selectedGstDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<IGstDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gstsdt"] })
        }
      }
    } catch (error) {
      console.error("Gst Details form submission error:", error)
    }
  }

  const handleGstCategorySubmit = async (data: GstCategorySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IGstCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gstcategory"] })
        }
      } else if (modalMode === "edit" && selectedGstCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IGstCategory>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["gstcategory"] })
        }
      }
    } catch (error) {
      console.error("Gst Category form submission error:", error)
    }
  }

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: GstSchemaType | GstDtSchemaType | GstCategorySchemaType | null
    type: "gst" | "gstdt" | "gstcategory"
  }>({
    isOpen: false,
    data: null,
    type: "gst",
  })

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data: GstSchemaType | GstDtSchemaType | GstCategorySchemaType
  ) => {
    let type: "gst" | "gstdt" | "gstcategory" = "gst"
    if (isDtModalOpen) type = "gstdt"
    else if (isCategoryModalOpen) type = "gstcategory"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: GstSchemaType | GstDtSchemaType | GstCategorySchemaType
  ) => {
    try {
      if (saveConfirmation.type === "gstdt") {
        await handleGstDtSubmit(data as GstDtSchemaType)
        setIsDtModalOpen(false)
      } else if (saveConfirmation.type === "gstcategory") {
        await handleGstCategorySubmit(data as GstCategorySchemaType)
        setIsCategoryModalOpen(false)
      } else {
        await handleGstSubmit(data as GstSchemaType)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
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
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Gst</h1>
          <p className="text-muted-foreground text-sm">
            Manage Gst information and settings
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
          {isLoadingGst ? (
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
          ) : gstsResult === -2 ||
            (!canView && !canEdit && !canDelete && !canCreate) ? (
            <LockSkeleton locked={true}>
              <GstTable
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
          ) : gstsResult ? (
            <GstTable
              data={filters.search ? [] : gstsData || []}
              isLoading={isLoadingGst}
              onSelect={canView ? handleViewGst : undefined}
              onDelete={canDelete ? handleDeleteGst : undefined}
              onEdit={canEdit ? handleEditGst : undefined}
              onCreate={canCreate ? handleCreateGst : undefined}
              onRefresh={refetchGst}
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
                {gstsResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gstsdt" className="space-y-4">
          {isLoadingGstDt ? (
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
          ) : gstsDtResult === -2 ||
            (!canViewDt && !canEditDt && !canDeleteDt && !canCreateDt) ? (
            <LockSkeleton locked={true}>
              <GstDtTable
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
          ) : gstsDtResult ? (
            <GstDtTable
              data={dtFilters.search ? [] : gstsDtData || []}
              isLoading={isLoadingGstDt}
              onSelect={canViewDt ? handleViewGstDt : undefined}
              onDelete={canDeleteDt ? handleDeleteGstDt : undefined}
              onEdit={canEditDt ? handleEditGstDt : undefined}
              onCreate={canCreateDt ? handleCreateGstDt : undefined}
              onRefresh={refetchGstDt}
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
                {gstsDtResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gstscategory" className="space-y-4">
          {isLoadingGstCategory ? (
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
          ) : gstsCategoryResult === -2 ||
            (!canViewCategory &&
              !canEditCategory &&
              !canDeleteCategory &&
              !canCreateCategory) ? (
            <LockSkeleton locked={true}>
              <GstCategoryTable
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
          ) : gstsCategoryResult ? (
            <GstCategoryTable
              data={categoryFilters.search ? [] : gstsCategoryData || []}
              isLoading={isLoadingGstCategory}
              onSelect={canViewCategory ? handleViewGstCategory : undefined}
              onDelete={canDeleteCategory ? handleDeleteGstCategory : undefined}
              onEdit={canEditCategory ? handleEditGstCategory : undefined}
              onCreate={canCreateCategory ? handleCreateGstCategory : undefined}
              onRefresh={refetchGstCategory}
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
                {gstsCategoryResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Gst Form Dialog */}
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
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Gst Details Form Dialog */}
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
                ? "Add new Gst details to the system database."
                : modalMode === "edit"
                  ? "Update Gst details information."
                  : "View Gst details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <GstDtForm
            initialData={modalMode !== "create" ? selectedGstDt : undefined}
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsDtModalOpen(false)}
            isSubmitting={
              saveDtMutation.isPending || updateDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Gst Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Gst Category"}
              {modalMode === "edit" && "Update Gst Category"}
              {modalMode === "view" && "View Gst Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new Gst category to the system database."
                : modalMode === "edit"
                  ? "Update Gst category information."
                  : "View Gst category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <GstCategoryForm
            initialData={
              modalMode !== "create" ? selectedGstCategory : undefined
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
        open={showLoadDialogGst}
        onOpenChange={setShowLoadDialogGst}
        onLoad={handleLoadExistingGst}
        onCancel={() => setExistingGst(null)}
        code={existingGst?.gstCode}
        name={existingGst?.gstName}
        typeLabel="Gst"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadConfirmation
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingGstCategory}
        onCancel={() => setExistingGstCategory(null)}
        code={existingGstCategory?.gstCategoryCode}
        name={existingGstCategory?.gstCategoryName}
        typeLabel="Gst Category"
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
          saveConfirmation.type === "gst"
            ? (saveConfirmation.data as GstSchemaType)?.gstName || ""
            : saveConfirmation.type === "gstdt"
              ? (
                  saveConfirmation.data as GstDtSchemaType
                )?.gstPercentage?.toString() || ""
              : (saveConfirmation.data as GstCategorySchemaType)
                  ?.gstCategoryName || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "gst",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "gst",
          })
        }
        isSaving={
          saveConfirmation.type === "gst"
            ? saveMutation.isPending || updateMutation.isPending
            : saveConfirmation.type === "gstdt"
              ? saveDtMutation.isPending || updateDtMutation.isPending
              : saveCategoryMutation.isPending ||
                updateCategoryMutation.isPending
        }
      />
    </div>
  )
}
