"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { ITemplateFilter, ITemplateHd } from "@/interfaces/template"
import { TemplateHdSchemaType } from "@/schemas/template"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Template } from "@/lib/api-routes"
import { ModuleId, OperationsTransactionId } from "@/lib/utils"
import {
  useDelete,
  useGetById,
  useGetWithPagination,
  usePersist,
} from "@/hooks/use-common"
import { useUserSettingDefaults } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { TemplateDetailsTable } from "./components/template-details-table"
import { TemplateForm, TemplateFormRef } from "./components/template-form"
import { TemplateTable } from "./components/template-table"

export default function TemplatePage() {
  const moduleId = ModuleId.operations
  const transactionId = OperationsTransactionId.template

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const params = useParams()
  const companyId = Number(params?.companyId) || 0

  // Get user settings for default page size
  const { defaults } = useUserSettingDefaults()

  // Fetch templates from the API using useGetWithPagination
  const [filters, setFilters] = useState<ITemplateFilter>({})
  const [isLocked, setIsLocked] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    defaults?.common?.masterGridTotalRecords || 50
  )

  // Update page size when user settings change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ITemplateFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Page size change handler
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  const {
    data: templatesResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<ITemplateHd>(
    `${Template.get}`,
    "templates",
    filters.search,
    currentPage,
    pageSize
  )

  // Destructure with fallback values
  const {
    result: templatesResult,
    data: templatesData,
    totalRecords,
  } = (templatesResponse as ApiResponse<ITemplateHd>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!templatesResponse) return

    if (templatesResponse.result === -1) {
      setFilters({})
    } else if (templatesResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (templatesResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [templatesResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<TemplateHdSchemaType>(`${Template.add}`)
  const updateMutation = usePersist<TemplateHdSchemaType>(`${Template.add}`)
  const deleteMutation = useDelete(`${Template.delete}/${companyId}`)

  // State for modal and selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [hasFormErrors, setHasFormErrors] = useState(false)

  // Form ref for triggering submission
  const formRef = useRef<TemplateFormRef>(null)

  // Fetch template by ID when editing/viewing
  const { data: templateByIdResponse, isLoading: isLoadingTemplateById } =
    useGetById<ITemplateHd>(
      `${Template.getById}`,
      "template",
      selectedTemplateId || ""
    )

  // Extract template data from response
  const selectedTemplate =
    templateByIdResponse?.result === 1 && templateByIdResponse?.data
      ? Array.isArray(templateByIdResponse.data)
        ? templateByIdResponse.data[0]
        : templateByIdResponse.data
      : undefined

  // Details view state
  const [showDetailsView, setShowDetailsView] = useState(false)
  const [selectedTemplateForDetails, _setSelectedTemplateForDetails] =
    useState<ITemplateHd | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    templateId: string | null
    templateName: string | null
  }>({
    isOpen: false,
    templateId: null,
    templateName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: ITemplateHd | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new template
  const handleCreateTemplate = () => {
    setModalMode("create")
    setSelectedTemplateId(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing a template
  const handleEditTemplate = (template: ITemplateHd) => {
    setModalMode("edit")
    setSelectedTemplateId(template.templateId.toString())
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing a template
  const handleViewTemplate = (template: ITemplateHd | null) => {
    if (!template) return
    setModalMode("view")
    setSelectedTemplateId(template.templateId.toString())
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: ITemplateHd) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Convert ITemplateHd to TemplateHdSchemaType for API
  const convertToSchema = (data: ITemplateHd): TemplateHdSchemaType => {
    return {
      templateId: data.templateId,
      templateName: data.templateName,
      taskId: data.taskId,
      chargeId: data.chargeId,
      isActive: data.isActive,
      editVersion: data.editVersion || 0,
      data_details: data.data_details || [],
    }
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: ITemplateHd) => {
    try {
      const schemaData = convertToSchema(data)
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(schemaData)
        if (response.result === 1) {
          // Invalidate and refetch the templates query
          queryClient.invalidateQueries({ queryKey: ["templates"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedTemplateId) {
        const response = await updateMutation.mutateAsync(schemaData)
        if (response.result === 1) {
          // Invalidate and refetch the templates query
          queryClient.invalidateQueries({ queryKey: ["templates"] })
          queryClient.invalidateQueries({
            queryKey: ["template", selectedTemplateId],
          })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting a template
  const handleDeleteTemplate = (template: ITemplateHd) => {
    // Open delete confirmation dialog with template details
    setDeleteConfirmation({
      isOpen: true,
      templateId: template.templateId.toString(),
      templateName: template.templateName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.templateId) {
      deleteMutation.mutateAsync(deleteConfirmation.templateId).then(() => {
        // Invalidate and refetch the templates query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["templates"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        templateId: null,
        templateName: null,
      })
    }
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Template Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage templates and their details
          </p>
        </div>
      </div>

      {/* Templates Table */}
      {isLoading ? (
        <DataTableSkeleton
          columnCount={8}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : templatesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <TemplateTable
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
            canView={false}
            canCreate={false}
            canEdit={false}
            canDelete={false}
          />
        </LockSkeleton>
      ) : (
        <TemplateTable
          data={templatesData || []}
          isLoading={isLoading}
          totalRecords={totalRecords}
          onSelect={canView ? handleViewTemplate : undefined}
          onDeleteAction={canDelete ? handleDeleteTemplate : undefined}
          onEditAction={canEdit ? handleEditTemplate : undefined}
          onCreateAction={canCreate ? handleCreateTemplate : undefined}
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
          if (!open && hasFormErrors) {
            return
          }
          setIsModalOpen(open)
        }}
      >
        <DialogContent
          className="max-h-[90vh] w-[70vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            if (hasFormErrors) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>
                  {modalMode === "create" && "Create Template"}
                  {modalMode === "edit" && "Update Template"}
                  {modalMode === "view" && "View Template"}
                </DialogTitle>
                <DialogDescription>
                  {modalMode === "create"
                    ? "Add a new template to the system database."
                    : modalMode === "edit"
                      ? "Update template information in the system database."
                      : "View template details."}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 pr-10">
                {modalMode !== "view" && (
                  <Button
                    type="button"
                    onClick={() => formRef.current?.submit()}
                  >
                    {modalMode === "create" ? "Save" : "Update"}
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <Separator />
          {isLoadingTemplateById &&
          (modalMode === "edit" || modalMode === "view") ? (
            <div className="flex items-center justify-center p-8">
              <p>Loading template details...</p>
            </div>
          ) : (
            <TemplateForm
              ref={formRef}
              initialData={
                modalMode === "edit" || modalMode === "view"
                  ? selectedTemplate
                  : undefined
              }
              onSaveAction={handleFormSubmit}
              onCloseAction={() => setIsModalOpen(false)}
              mode={modalMode}
              companyId={companyId}
              onValidationError={setHasFormErrors}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={showDetailsView} onOpenChange={setShowDetailsView}>
        <DialogContent className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
            <DialogDescription>
              View details for template:{" "}
              {selectedTemplateForDetails?.templateName}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplateForDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Template Name
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedTemplateForDetails.templateName}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Task</Label>
                  <p className="text-sm font-medium">
                    {selectedTemplateForDetails.taskName || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Charge
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedTemplateForDetails.chargeName || "-"}
                  </p>
                </div>
              </div>
              {selectedTemplateForDetails.data_details &&
                selectedTemplateForDetails.data_details.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">
                      Template Details
                    </h4>
                    <TemplateDetailsTable
                      data={selectedTemplateForDetails.data_details}
                      canEdit={false}
                      canDelete={false}
                      canView={true}
                      canCreate={false}
                    />
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Template"
        description="This action cannot be undone. This will permanently delete the template from our servers."
        itemName={deleteConfirmation.templateName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({
            isOpen: false,
            templateId: null,
            templateName: null,
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
        title={modalMode === "create" ? "Create Template" : "Update Template"}
        itemName={saveConfirmation.data?.templateName || ""}
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
