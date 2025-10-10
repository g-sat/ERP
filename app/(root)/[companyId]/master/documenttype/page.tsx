"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IDocumentType, IDocumentTypeFilter } from "@/interfaces/documenttype"
import { DocumentTypeSchemaType } from "@/schemas/documenttype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { DocumentType } from "@/lib/api-routes"
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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { DocumentTypeForm } from "./components/document-type-form"
import { DocumentTypesTable } from "./components/document-type-table"

export default function DocumentTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.documentType

  const queryClient = useQueryClient()
  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch document types from the API using useGet
  const [filters, setFilters] = useState<IDocumentTypeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IDocumentTypeFilter)
    },
    []
  )

  const {
    data: documentTypesResponse,
    refetch,
    isLoading,
  } = useGet<IDocumentType>(
    `${DocumentType.get}`,
    "documentTypes",
    filters.search
  )

  // Destructure with fallback values
  const { result: documentTypesResult, data: documentTypesData } =
    (documentTypesResponse as ApiResponse<IDocumentType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<DocumentTypeSchemaType>(`${DocumentType.add}`)
  const updateMutation = usePersist<DocumentTypeSchemaType>(
    `${DocumentType.add}`
  )
  const deleteMutation = useDelete(`${DocumentType.delete}`)

  // State for modal and selected document type
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<IDocumentType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingDocumentType, setExistingDocumentType] =
    useState<IDocumentType | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    documentTypeId: string | null
    documentTypeName: string | null
  }>({
    isOpen: false,
    documentTypeId: null,
    documentTypeName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: DocumentTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new document type
  const handleCreateDocumentType = () => {
    setModalMode("create")
    setSelectedDocumentType(null)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an document type
  const handleEditDocumentType = (documentType: IDocumentType) => {
    setModalMode("edit")
    setSelectedDocumentType(documentType)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an document type
  const handleViewDocumentType = (documentType: IDocumentType | null) => {
    if (!documentType) return
    setModalMode("view")
    setSelectedDocumentType(documentType)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: DocumentTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: DocumentTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["documentTypes"] })
        }
      } else if (modalMode === "edit" && selectedDocumentType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["documentTypes"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an document type
  const handleDeleteDocumentType = (documentTypeId: string) => {
    const documentTypeToDelete = documentTypesData?.find(
      (at) => at.docTypeId.toString() === documentTypeId
    )
    if (!documentTypeToDelete) return

    // Open delete confirmation dialog with document type details
    setDeleteConfirmation({
      isOpen: true,
      documentTypeId,
      documentTypeName: documentTypeToDelete.docTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.documentTypeId) {
      deleteMutation.mutateAsync(deleteConfirmation.documentTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["documentTypes"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        documentTypeId: null,
        documentTypeName: null,
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
        const response = await getById(
          `${Documenttype.getByCode}/${trimmedCode}`
        )
                // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
                    // Handle both array and single object responses
          const documentTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (documentTypeData) {
            // Ensure all required fields are present
            const validDocumentTypeData: IDocumentType = {
              docTypeId: documentTypeData.docTypeId,
              docTypeCode: documentTypeData.docTypeCode,
              docTypeName: documentTypeData.docTypeName,
              remarks: documentTypeData.remarks || "",
              isActive: documentTypeData.isActive ?? true,
              companyId: documentTypeData.companyId,
              createBy: documentTypeData.createBy,
              editBy: documentTypeData.editBy,
              createDate: documentTypeData.createDate,
              editDate: documentTypeData.editDate,
            }
            setExistingDocumentType(validDocumentTypeData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing document type
  const handleLoadExistingDocumentType = () => {
    if (existingDocumentType) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedDocumentType(existingDocumentType)
      setShowLoadDialog(false)
      setExistingDocumentType(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Document Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage document type information and settings
          </p>
        </div>
      </div>

      {/* Document Types Table */}
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
      ) : documentTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <DocumentTypesTable
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
        <DocumentTypesTable
          data={filters.search ? [] : documentTypesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewDocumentType : undefined}
          onDelete={canDelete ? handleDeleteDocumentType : undefined}
          onEdit={canEdit ? handleEditDocumentType : undefined}
          onCreate={canCreate ? handleCreateDocumentType : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
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
              {modalMode === "create" && "Create Document Type"}
              {modalMode === "edit" && "Update Document Type"}
              {modalMode === "view" && "View Document Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new document type to the system database."
                : modalMode === "edit"
                  ? "Update document type information in the system database."
                  : "View document type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DocumentTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedDocumentType || undefined
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Document Type Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingDocumentType}
        onCancel={() => setExistingDocumentType(null)}
        code={existingDocumentType?.docTypeCode}
        name={existingDocumentType?.docTypeName}
        typeLabel="Document Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Document Type"
        description="This action cannot be undone. This will permanently delete the document type from our servers."
        itemName={deleteConfirmation.documentTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            documentTypeId: null,
            documentTypeName: null,
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
          modalMode === "create"
            ? "Create Document Type"
            : "Update Document Type"
        }
        itemName={saveConfirmation.data?.docTypeName || ""}
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
        onCancel={() =>
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
