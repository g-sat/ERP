"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICreditTerm,
  ICreditTermDt,
  ICreditTermFilter,
} from "@/interfaces/creditterm"
import {
  CreditTermDtFormValues,
  CreditTermFormValues,
} from "@/schemas/creditterm"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { CreditTerm, CreditTermDt } from "@/lib/api-routes"
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

import { CreditTermForm } from "./components/creditterm-form"
import { CreditTermsTable } from "./components/creditterm-table"
import { CreditTermDtForm } from "./components/credittermdt-form"
import { CreditTermDtsTable } from "./components/credittermdt-table"

export default function CreditTermPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.creditTerm
  const transactionIdDt = MasterTransactionId.creditTermDt

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

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
  const [filters, setFilters] = useState<ICreditTermFilter>({})
  const [dtFilters, setDtFilters] = useState<ICreditTermFilter>({})

  // Data fetching
  const {
    data: creditTermsResponse,
    refetch: refetchCreditTerm,
    isLoading: isLoadingCreditTerm,
  } = useGet<ICreditTerm>(`${CreditTerm.get}`, "creditterms", filters.search)

  const {
    data: creditTermsDtResponse,
    refetch: refetchCreditTermDt,
    isLoading: isLoadingCreditTermDt,
  } = useGet<ICreditTermDt>(
    `${CreditTermDt.get}`,
    "credittermsdt",
    dtFilters.search
  )

  // Extract data from responses with fallback values
  const { result: creditTermsResult, data: creditTermsData } =
    (creditTermsResponse as ApiResponse<ICreditTerm>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: creditTermsDtResult, data: creditTermsDtData } =
    (creditTermsDtResponse as ApiResponse<ICreditTermDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<CreditTermFormValues>(`${CreditTerm.add}`)
  const updateMutation = usePersist<CreditTermFormValues>(`${CreditTerm.add}`)
  const deleteMutation = useDelete(`${CreditTerm.delete}`)

  const saveDtMutation = usePersist<CreditTermDtFormValues>(
    `${CreditTermDt.add}`
  )
  const updateDtMutation = usePersist<CreditTermDtFormValues>(
    `${CreditTermDt.add}`
  )
  const deleteDtMutation = useDelete(`${CreditTermDt.delete}`)

  // State management
  const [selectedCreditTerm, setSelectedCreditTerm] = useState<
    ICreditTerm | undefined
  >()
  const [selectedCreditTermDt, setSelectedCreditTermDt] = useState<
    ICreditTermDt | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDtModalOpen, setIsDtModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "creditterm" as "creditterm" | "credittermdt",
  })

  // Duplicate detection states
  const [showLoadDialogCreditTerm, setShowLoadDialogCreditTerm] =
    useState(false)
  const [existingCreditTerm, setExistingCreditTerm] =
    useState<ICreditTerm | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchCreditTerm()
  }, [filters.search, refetchCreditTerm])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchCreditTermDt()
  }, [dtFilters.search, refetchCreditTermDt])

  // Action handlers
  const handleCreateCreditTerm = () => {
    setModalMode("create")
    setSelectedCreditTerm(undefined)
    setIsModalOpen(true)
  }

  const handleEditCreditTerm = (creditTerm: ICreditTerm) => {
    setModalMode("edit")
    setSelectedCreditTerm(creditTerm)
    setIsModalOpen(true)
  }

  const handleViewCreditTerm = (creditTerm: ICreditTerm | null) => {
    if (!creditTerm) return
    setModalMode("view")
    setSelectedCreditTerm(creditTerm)
    setIsModalOpen(true)
  }

  const handleCreateCreditTermDt = () => {
    setModalMode("create")
    setSelectedCreditTermDt(undefined)
    setIsDtModalOpen(true)
  }

  const handleEditCreditTermDt = (creditTermDt: ICreditTermDt) => {
    setModalMode("edit")
    setSelectedCreditTermDt(creditTermDt)
    setIsDtModalOpen(true)
  }

  const handleViewCreditTermDt = (creditTermDt: ICreditTermDt | null) => {
    if (!creditTermDt) return
    setModalMode("view")
    setSelectedCreditTermDt(creditTermDt)
    setIsDtModalOpen(true)
  }

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("CreditTerm filter change called with:", newFilters)
      setFilters(newFilters as ICreditTermFilter)
    },
    []
  )

  const handleDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("CreditTerm Dt filter change called with:", newFilters)
      setDtFilters(newFilters as ICreditTermFilter)
    },
    []
  )

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<ICreditTerm | ICreditTermDt>
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleCreditTermSubmit = async (data: CreditTermFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ICreditTerm>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["creditterms"] })
        }
      } else if (modalMode === "edit" && selectedCreditTerm) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ICreditTerm>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["creditterms"] })
        }
      }
    } catch (error) {
      console.error("Credit term form submission error:", error)
    }
  }

  const handleCreditTermDtSubmit = async (data: CreditTermDtFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICreditTermDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["credittermsdt"] })
        }
      } else if (modalMode === "edit" && selectedCreditTermDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICreditTermDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["credittermsdt"] })
        }
      }
    } catch (error) {
      console.error("Credit term details form submission error:", error)
    }
  }

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: CreditTermFormValues | CreditTermDtFormValues | null
    type: "creditterm" | "credittermdt"
  }>({
    isOpen: false,
    data: null,
    type: "creditterm",
  })

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data: CreditTermFormValues | CreditTermDtFormValues
  ) => {
    let type: "creditterm" | "credittermdt" = "creditterm"
    if (isDtModalOpen) type = "credittermdt"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: CreditTermFormValues | CreditTermDtFormValues
  ) => {
    try {
      if (saveConfirmation.type === "credittermdt") {
        await handleCreditTermDtSubmit(data as CreditTermDtFormValues)
        setIsDtModalOpen(false)
      } else {
        await handleCreditTermSubmit(data as CreditTermFormValues)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDeleteCreditTerm = (creditTermId: string) => {
    const creditTermToDelete = creditTermsData.find(
      (c) => c.creditTermId.toString() === creditTermId
    )
    if (!creditTermToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: creditTermId,
      name: creditTermToDelete.creditTermCode,
      type: "creditterm",
    })
  }

  const handleDeleteCreditTermDt = (creditTermId: string) => {
    const creditTermDtToDelete = creditTermsDtData.find(
      (c) => c.creditTermId.toString() === creditTermId
    )
    if (!creditTermDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: creditTermId,
      name: creditTermDtToDelete.creditTermCode,
      type: "credittermdt",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "creditterm":
        mutation = deleteMutation
        break
      case "credittermdt":
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
      type: "creditterm",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = await getData(`${CreditTerm.getByCode}/${trimmedCode}`)

      if (response.data.result === 1 && response.data.data) {
        const creditTermData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        if (creditTermData) {
          setExistingCreditTerm(creditTermData as ICreditTerm)
          setShowLoadDialogCreditTerm(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingCreditTerm = () => {
    if (existingCreditTerm) {
      setModalMode("edit")
      setSelectedCreditTerm(existingCreditTerm)
      setShowLoadDialogCreditTerm(false)
      setExistingCreditTerm(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Credit Terms
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage credit terms information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="creditterm" className="space-y-4">
        <TabsList>
          <TabsTrigger value="creditterm">Credit Terms</TabsTrigger>
          <TabsTrigger value="credittermdt">Credit Term Details</TabsTrigger>
        </TabsList>

        <TabsContent value="creditterm" className="space-y-4">
          {isLoadingCreditTerm ? (
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
          ) : creditTermsResult === -2 ? (
            <LockSkeleton locked={true}>
              <CreditTermsTable
                data={[]}
                isLoading={false}
                onSelect={canView ? handleViewCreditTerm : undefined}
                onDelete={canDelete ? handleDeleteCreditTerm : undefined}
                onEdit={canEdit ? handleEditCreditTerm : undefined}
                onCreate={canCreate ? handleCreateCreditTerm : undefined}
                onRefresh={refetchCreditTerm}
                onFilterChange={handleFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                canEdit={canEdit}
                canDelete={canDelete}
                canView={canView}
                canCreate={canCreate}
              />
            </LockSkeleton>
          ) : creditTermsResult ? (
            <CreditTermsTable
              data={filters.search ? [] : creditTermsData || []}
              isLoading={isLoadingCreditTerm}
              onSelect={canView ? handleViewCreditTerm : undefined}
              onDelete={canDelete ? handleDeleteCreditTerm : undefined}
              onEdit={canEdit ? handleEditCreditTerm : undefined}
              onCreate={canCreate ? handleCreateCreditTerm : undefined}
              onRefresh={refetchCreditTerm}
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
                {creditTermsResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="credittermdt" className="space-y-4">
          {isLoadingCreditTermDt ? (
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
          ) : creditTermsDtResult === -2 ? (
            <LockSkeleton locked={true}>
              <CreditTermDtsTable
                data={[]}
                isLoading={false}
                onSelect={canViewDt ? handleViewCreditTermDt : undefined}
                onDelete={canDeleteDt ? handleDeleteCreditTermDt : undefined}
                onEdit={canEditDt ? handleEditCreditTermDt : undefined}
                onCreate={canCreateDt ? handleCreateCreditTermDt : undefined}
                onRefresh={refetchCreditTermDt}
                onFilterChange={handleDtFilterChange}
                moduleId={moduleId}
                transactionId={transactionIdDt}
                canEdit={canEditDt}
                canDelete={canDeleteDt}
                canView={canViewDt}
                canCreate={canCreateDt}
              />
            </LockSkeleton>
          ) : creditTermsDtResult ? (
            <CreditTermDtsTable
              data={dtFilters.search ? [] : creditTermsDtData || []}
              isLoading={isLoadingCreditTermDt}
              onSelect={canViewDt ? handleViewCreditTermDt : undefined}
              onDelete={canDeleteDt ? handleDeleteCreditTermDt : undefined}
              onEdit={canEditDt ? handleEditCreditTermDt : undefined}
              onCreate={canCreateDt ? handleCreateCreditTermDt : undefined}
              onRefresh={refetchCreditTermDt}
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
                {creditTermsDtResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Credit Term Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Credit Term"}
              {modalMode === "edit" && "Update Credit Term"}
              {modalMode === "view" && "View Credit Term"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new credit term to the system database."
                : modalMode === "edit"
                  ? "Update credit term information in the system database."
                  : "View credit term details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CreditTermForm
            initialData={
              modalMode !== "create" ? selectedCreditTerm : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Credit Term Details Form Dialog */}
      <Dialog open={isDtModalOpen} onOpenChange={setIsDtModalOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Credit Term Details"}
              {modalMode === "edit" && "Update Credit Term Details"}
              {modalMode === "view" && "View Credit Term Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add new credit term details to the system database."
                : modalMode === "edit"
                  ? "Update credit term details information."
                  : "View credit term details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CreditTermDtForm
            initialData={
              modalMode !== "create" ? selectedCreditTermDt : undefined
            }
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
      <LoadExistingDialog
        open={showLoadDialogCreditTerm}
        onOpenChange={setShowLoadDialogCreditTerm}
        onLoad={handleLoadExistingCreditTerm}
        onCancel={() => setExistingCreditTerm(null)}
        code={existingCreditTerm?.creditTermCode}
        name={existingCreditTerm?.creditTermName}
        typeLabel="Credit Term"
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
            type: "creditterm",
          })
        }
        isDeleting={
          deleteConfirmation.type === "creditterm"
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
          saveConfirmation.type === "creditterm"
            ? (saveConfirmation.data as CreditTermFormValues)?.creditTermCode ||
              ""
            : (
                saveConfirmation.data as CreditTermDtFormValues
              )?.creditTermId.toString() || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(
              saveConfirmation.data as
                | CreditTermFormValues
                | CreditTermDtFormValues
            )
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "creditterm",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "creditterm",
          })
        }
        isSaving={
          saveConfirmation.type === "creditterm"
            ? saveMutation.isPending || updateMutation.isPending
            : saveDtMutation.isPending || updateDtMutation.isPending
        }
      />
    </div>
  )
}
