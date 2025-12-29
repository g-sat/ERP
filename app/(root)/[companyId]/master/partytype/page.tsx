"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPartyType, IPartyTypeFilter } from "@/interfaces/partytype"
import { PartyTypeSchemaType } from "@/schemas/partytype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { PartyType } from "@/lib/api-routes"
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

import { PartyTypeForm } from "./components/partytype-form"
import { PartyTypesTable } from "./components/partytype-table"

export default function PartyTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.partyType

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<IPartyTypeFilter>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Get user setting defaults
  const { defaults } = useUserSettingDefaults()

  // Update page size when defaults change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IPartyTypeFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])
  const {
    data: partyTypesResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<IPartyType>(
    `${PartyType.get}`,
    "partyTypes",
    filters.search,
    currentPage,
    pageSize
  )

  const {
    result: partyTypesResult,
    data: partyTypesData,
    totalRecords,
  } = (partyTypesResponse as ApiResponse<IPartyType>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  const saveMutation = usePersist<PartyTypeSchemaType>(`${PartyType.add}`)
  const updateMutation = usePersist<PartyTypeSchemaType>(`${PartyType.add}`)
  const deleteMutation = useDelete(`${PartyType.delete}`)

  const [selectedPartyType, setSelectedPartyType] = useState<IPartyType | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingPartyType, setExistingPartyType] = useState<IPartyType | null>(
    null
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    partyTypeId: string | null
    partyTypeName: string | null
  }>({
    isOpen: false,
    partyTypeId: null,
    partyTypeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: PartyTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreatePartyType = () => {
    setModalMode("create")
    setSelectedPartyType(null)
    setIsModalOpen(true)
  }

  const handleEditPartyType = (partyType: IPartyType) => {
    setModalMode("edit")
    setSelectedPartyType(partyType)
    setIsModalOpen(true)
  }

  const handleViewPartyType = (partyType: IPartyType | null) => {
    if (!partyType) return
    setModalMode("view")
    setSelectedPartyType(partyType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: PartyTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: PartyTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["partyTypes"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedPartyType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["partyTypes"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeletePartyType = (partyTypeId: string) => {
    const partyTypeToDelete = partyTypesData?.find(
      (b) => b.partyTypeId.toString() === partyTypeId
    )
    if (!partyTypeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      partyTypeId,
      partyTypeName: partyTypeToDelete.partyTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.partyTypeId) {
      deleteMutation.mutateAsync(deleteConfirmation.partyTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["partyTypes"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        partyTypeId: null,
        partyTypeName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${PartyType.getByCode}/${trimmedCode}`)
        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const partyTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (partyTypeData) {
            // Ensure all required fields are present
            const validPartyTypeData: IPartyType = {
              partyTypeId: partyTypeData.partyTypeId,
              partyTypeCode: partyTypeData.partyTypeCode,
              partyTypeName: partyTypeData.partyTypeName,
              companyId: partyTypeData.companyId,
              remarks: partyTypeData.remarks || "",
              isActive: partyTypeData.isActive ?? true,
              createBy: partyTypeData.createBy,
              editBy: partyTypeData.editBy,
              createDate: partyTypeData.createDate,
              editDate: partyTypeData.editDate,
              createById: partyTypeData.createById,
              editById: partyTypeData.editById,
            }
            setExistingPartyType(validPartyTypeData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing party type
  const handleLoadExistingPartyType = () => {
    if (existingPartyType) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedPartyType(existingPartyType)
      setShowLoadDialog(false)
      setExistingPartyType(null)
    }
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Party Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage party type information and settings
          </p>
        </div>
      </div>

      {/* Party Types Table */}
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
      ) : partyTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <PartyTypesTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDeleteAction={() => {}}
            onEditAction={() => {}}
            onCreateAction={() => {}}
            onRefreshAction={() => {}}
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
        <PartyTypesTable
          data={partyTypesData || []}
          isLoading={isLoading}
          totalRecords={totalRecords}
          onSelect={canView ? handleViewPartyType : undefined}
          onDeleteAction={canDelete ? handleDeletePartyType : undefined}
          onEditAction={canEdit ? handleEditPartyType : undefined}
          onCreateAction={canCreate ? handleCreatePartyType : undefined}
          onRefreshAction={handleRefresh}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
          serverSidePagination={true}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      )}

      {/* Modal for Create, Edit, and View */}
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
              {modalMode === "create" && "Create Party Type"}
              {modalMode === "edit" && "Update Party Type"}
              {modalMode === "view" && "View Party Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new party type to the system database."
                : modalMode === "edit"
                  ? "Update party type information in the system database."
                  : "View party type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <PartyTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedPartyType
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

      {/* Load Existing Party Type Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingPartyType}
        onCancelAction={() => setExistingPartyType(null)}
        code={existingPartyType?.partyTypeCode}
        name={existingPartyType?.partyTypeName}
        typeLabel="Party Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Party Type"
        description="This action cannot be undone. This will permanently delete the party type from our servers."
        itemName={deleteConfirmation.partyTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({
            isOpen: false,
            partyTypeId: null,
            partyTypeName: null,
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
        title={
          modalMode === "create" ? "Create Party Type" : "Update Party Type"
        }
        itemName={saveConfirmation.data?.partyTypeName || ""}
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
