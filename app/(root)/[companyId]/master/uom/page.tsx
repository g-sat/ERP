"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IUom, IUomDt, IUomFilter } from "@/interfaces/uom"
import { UomDtFormValues, UomFormValues } from "@/schemas/uom"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { Uom, UomDt } from "@/lib/api-routes"
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
import { LoadConfirmation } from "@/components/load-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { UomForm } from "./components/uom-form"
import { UomTable } from "./components/uom-table"
import { UomDtForm } from "./components/uomdt-form"
import { UomDtTable } from "./components/uomdt-table"

export default function UomPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.uom
  const transactionIdDt = MasterTransactionId.uomDt

  const { hasPermission } = usePermissionStore()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreateDt = hasPermission(moduleId, transactionIdDt, "isCreate")
  const canViewDt = hasPermission(moduleId, transactionIdDt, "isRead")
  const canEditDt = hasPermission(moduleId, transactionIdDt, "isEdit")
  const canDeleteDt = hasPermission(moduleId, transactionIdDt, "isDelete")

  // State for filters
  const [filters, setFilters] = useState<IUomFilter>({})
  const [dtFilters, setDtFilters] = useState<IUomFilter>({})

  // Data fetching
  const {
    data: uomsResponse,
    refetch: refetchUom,
    isLoading: isLoadingUom,
  } = useGet<IUom>(`${Uom.get}`, "uoms", filters.search)

  const {
    data: uomDtResponse,
    refetch: refetchUomDt,
    isLoading: isLoadingUomDt,
  } = useGet<IUomDt>(`${UomDt.get}`, "uomsdt", dtFilters.search)

  // Extract data from responses
  const uomsData = (uomsResponse as ApiResponse<IUom>)?.data || []
  const uomDtData = (uomDtResponse as ApiResponse<IUomDt>)?.data || []

  // Mutations
  const saveMutation = usePersist<UomFormValues>(`${Uom.add}`)
  const updateMutation = usePersist<UomFormValues>(`${Uom.add}`)
  const deleteMutation = useDelete(`${Uom.delete}`)

  const saveDtMutation = usePersist<UomDtFormValues>(`${UomDt.add}`)
  const updateDtMutation = usePersist<UomDtFormValues>(`${UomDt.add}`)
  const deleteDtMutation = useDelete(`${UomDt.delete}`)

  // State management
  const [selectedUom, setSelectedUom] = useState<IUom | undefined>()
  const [selectedUomDt, setSelectedUomDt] = useState<IUomDt | undefined>()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDtModalOpen, setIsDtModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "uom" as "uom" | "uomdt",
  })

  // Duplicate detection states
  const [showLoadDialogUom, setShowLoadDialogUom] = useState(false)
  const [existingUom, setExistingUom] = useState<IUom | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchUom()
  }, [filters.search, refetchUom])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchUomDt()
  }, [dtFilters.search, refetchUomDt])

  // Action handlers
  const handleCreateUom = () => {
    setModalMode("create")
    setSelectedUom(undefined)
    setIsModalOpen(true)
  }

  const handleEditUom = (uom: IUom) => {
    setModalMode("edit")
    setSelectedUom(uom)
    setIsModalOpen(true)
  }

  const handleViewUom = (uom: IUom | null) => {
    if (!uom) return
    setModalMode("view")
    setSelectedUom(uom)
    setIsModalOpen(true)
  }

  const handleCreateUomDt = () => {
    setModalMode("create")
    setSelectedUomDt(undefined)
    setIsDtModalOpen(true)
  }

  const handleEditUomDt = (uomDt: IUomDt) => {
    setModalMode("edit")
    setSelectedUomDt(uomDt)
    setIsDtModalOpen(true)
  }

  const handleViewUomDt = (uomDt: IUomDt | null) => {
    if (!uomDt) return
    setModalMode("view")
    setSelectedUomDt(uomDt)
    setIsDtModalOpen(true)
  }

  // Filter handlers
  const handleUomFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IUomFilter)
    },
    []
  )

  const handleUomDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setDtFilters(newFilters as IUomFilter)
    },
    []
  )

  // Helper function for API responses
  const handleApiResponse = (response: ApiResponse<IUom | IUomDt>) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: UomFormValues | UomDtFormValues | null
    type: "uom" | "uomdt"
  }>({
    isOpen: false,
    data: null,
    type: "uom",
  })

  // Specialized form handlers
  const handleUomSubmit = async (data: UomFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IUom>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["uoms"] })
        }
      } else if (modalMode === "edit" && selectedUom) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IUom>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["uoms"] })
        }
      }
    } catch (error) {
      console.error("UOM form submission error:", error)
    }
  }

  const handleUomDtSubmit = async (data: UomDtFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<IUomDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["uomsdt"] })
        }
      } else if (modalMode === "edit" && selectedUomDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<IUomDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["uomsdt"] })
        }
      }
    } catch (error) {
      console.error("UOM Details form submission error:", error)
    }
  }

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (data: UomFormValues | UomDtFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: isDtModalOpen ? "uomdt" : "uom",
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: UomFormValues | UomDtFormValues
  ) => {
    try {
      if (saveConfirmation.type === "uomdt") {
        await handleUomDtSubmit(data as UomDtFormValues)
        setIsDtModalOpen(false)
      } else {
        await handleUomSubmit(data as UomFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDeleteUom = (uomId: string) => {
    const uomToDelete = uomsData.find((c) => c.uomId.toString() === uomId)
    if (!uomToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: uomId,
      name: uomToDelete.uomName,
      type: "uom",
    })
  }

  const handleDeleteUomDt = (uomId: string) => {
    const uomDtToDelete = uomDtData.find((c) => c.uomId.toString() === uomId)
    if (!uomDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: uomId,
      name: uomDtToDelete.uomName,
      type: "uomdt",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "uom":
        mutation = deleteMutation
        break
      case "uomdt":
        mutation = deleteDtMutation
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
      type: "uom",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${Uom.getByCode}/${trimmedCode}`
      )) as ApiResponse<IUom>

      if (response.result === 1 && response.data) {
        const uomData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (uomData) {
          setExistingUom(uomData as IUom)
          setShowLoadDialogUom(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingUom = () => {
    if (existingUom) {
      setModalMode("edit")
      setSelectedUom(existingUom)
      setShowLoadDialogUom(false)
      setExistingUom(null)
    }
  }

  const queryClient = useQueryClient()

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">UOM</h1>
          <p className="text-muted-foreground text-sm">
            Manage UOM information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="uom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="uom">UOM</TabsTrigger>
          <TabsTrigger value="uomdt">UOM Details</TabsTrigger>
        </TabsList>

        <TabsContent value="uom" className="space-y-4">
          {isLoadingUom ? (
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
          ) : (uomsResponse as ApiResponse<IUom>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <UomTable
                data={uomsData}
                isLoading={isLoadingUom}
                onSelect={canView ? handleViewUom : undefined}
                onDelete={canDelete ? handleDeleteUom : undefined}
                onEdit={canEdit ? handleEditUom : undefined}
                onCreate={canCreate ? handleCreateUom : undefined}
                onRefresh={refetchUom}
                onFilterChange={handleUomFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <UomTable
              data={uomsData}
              isLoading={isLoadingUom}
              onSelect={canView ? handleViewUom : undefined}
              onDelete={canDelete ? handleDeleteUom : undefined}
              onEdit={canEdit ? handleEditUom : undefined}
              onCreate={canCreate ? handleCreateUom : undefined}
              onRefresh={refetchUom}
              onFilterChange={handleUomFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="uomdt" className="space-y-4">
          {isLoadingUomDt ? (
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
          ) : (uomDtResponse as ApiResponse<IUomDt>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <UomDtTable
                data={uomDtData}
                onSelect={canViewDt ? handleViewUomDt : undefined}
                onDelete={canDeleteDt ? handleDeleteUomDt : undefined}
                onEdit={canEditDt ? handleEditUomDt : undefined}
                onCreate={canCreateDt ? handleCreateUomDt : undefined}
                onRefresh={refetchUomDt}
                onFilterChange={handleUomDtFilterChange}
                moduleId={moduleId}
                transactionId={transactionIdDt}
                canView={canViewDt}
                canCreate={canCreateDt}
                canEdit={canEditDt}
                canDelete={canDeleteDt}
              />
            </LockSkeleton>
          ) : (
            <UomDtTable
              data={uomDtData}
              onSelect={canViewDt ? handleViewUomDt : undefined}
              onDelete={canDeleteDt ? handleDeleteUomDt : undefined}
              onEdit={canEditDt ? handleEditUomDt : undefined}
              onCreate={canCreateDt ? handleCreateUomDt : undefined}
              onRefresh={refetchUomDt}
              onFilterChange={handleUomDtFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdDt}
              canView={canViewDt}
              canCreate={canCreateDt}
              canEdit={canEditDt}
              canDelete={canDeleteDt}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* UOM Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create UOM"}
              {modalMode === "edit" && "Update UOM"}
              {modalMode === "view" && "View UOM"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new UOM to the system database."
                : modalMode === "edit"
                  ? "Update UOM information in the system database."
                  : "View UOM details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <UomForm
            initialData={modalMode !== "create" ? selectedUom : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* UOM Details Form Dialog */}
      <Dialog open={isDtModalOpen} onOpenChange={setIsDtModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create UOM Details"}
              {modalMode === "edit" && "Update UOM Details"}
              {modalMode === "view" && "View UOM Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add new UOM details to the system database."
                : modalMode === "edit"
                  ? "Update UOM details information."
                  : "View UOM details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <UomDtForm
            initialData={modalMode !== "create" ? selectedUomDt : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsDtModalOpen(false)}
            isSubmitting={
              saveDtMutation.isPending || updateDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialog */}
      <LoadConfirmation
        open={showLoadDialogUom}
        onOpenChange={setShowLoadDialogUom}
        onLoad={handleLoadExistingUom}
        onCancel={() => setExistingUom(null)}
        code={existingUom?.uomCode}
        name={existingUom?.uomName}
        typeLabel="UOM"
        isLoading={saveMutation.isPending || updateMutation.isPending}
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
            type: "uom",
          })
        }
        isDeleting={
          deleteConfirmation.type === "uom"
            ? deleteMutation.isPending
            : deleteDtMutation.isPending
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
          saveConfirmation.type === "uom"
            ? (saveConfirmation.data as UomFormValues)?.uomName || ""
            : (saveConfirmation.data as UomDtFormValues)?.uomId?.toString() ||
              ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "uom",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "uom",
          })
        }
        isSaving={
          saveConfirmation.type === "uom"
            ? saveMutation.isPending || updateMutation.isPending
            : saveDtMutation.isPending || updateDtMutation.isPending
        }
      />
    </div>
  )
}
