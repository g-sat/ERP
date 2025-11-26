"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ITemplateDt,
  ITemplateFilter,
  ITemplateHd,
} from "@/interfaces/template"
import { TemplateDtSchemaType, TemplateHdSchemaType } from "@/schemas/template"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { Save, Trash } from "lucide-react"

import { getData } from "@/lib/api-client"
import { Template } from "@/lib/api-routes"
import { ModuleId, OperationsTransactionId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { TemplateDetailsForm } from "./components/template-details-form"
import { TemplateDetailsTable } from "./components/template-details-table"
import { TemplateForm } from "./components/template-form"
import { TemplateTable } from "./components/template-table"

export default function TemplatePage() {
  const moduleId = ModuleId.operations
  const transactionId = OperationsTransactionId.template

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch templates from the API using useGet
  const [filters, setFilters] = useState<ITemplateFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ITemplateFilter)
    },
    []
  )

  const {
    data: templatesResponse,
    refetch,
    isLoading,
  } = useGet<ITemplateHd>(`${Template.get}`, "templates", filters.search)

  // Destructure with fallback values
  const { result: templatesResult, data: templatesData } =
    (templatesResponse as ApiResponse<ITemplateHd>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Add API call for checking code availability
  // Fetch history data
  // const { data: templateResponse } = useGetById<ITemplateHd>(
  //   `${Template.getById}/${templateId}`,
  //   "templateHistory"
  // )

  // Define mutations for CRUD operations
  const saveMutation = usePersist<TemplateHdSchemaType>(`${Template.add}`)
  const updateMutation = usePersist<TemplateHdSchemaType>(`${Template.add}`)
  const deleteMutation = useDelete(`${Template.delete}`)

  // State for modal and selected template
  const [selectedTemplate, setSelectedTemplate] = useState<
    ITemplateHd | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for template details
  const [templateDetails, setTemplateDetails] = useState<ITemplateDt[]>([])

  // Ref for template form to access form data
  const templateFormRef = useRef<{
    getFormData: () => TemplateHdSchemaType
  } | null>(null)

  // State for details management
  const [_selectedDetail, setSelectedDetail] = useState<
    ITemplateDt | undefined
  >(undefined)
  const [shouldResetDetailForm, setShouldResetDetailForm] = useState(false)

  // Reset the shouldResetDetailForm flag after it's been used (like debit note)
  useEffect(() => {
    if (shouldResetDetailForm) {
      setShouldResetDetailForm(false)
    }
  }, [shouldResetDetailForm])

  // State to track if template form is filled (for new templates)
  const [isFormFilled, setIsFormFilled] = useState(false)

  // State to track current form data (for new templates)
  const [currentFormData, setCurrentFormData] =
    useState<TemplateHdSchemaType | null>(null)
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingTemplate, setExistingTemplate] = useState<ITemplateHd | null>(
    null
  )

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
    data: TemplateHdSchemaType | null
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
    setSelectedTemplate(undefined)
    setIsFormFilled(false)
    setCurrentFormData(null)
    setTemplateDetails([])
    setIsModalOpen(true)
  }

  // Handler to open modal for editing a template
  const handleEditTemplate = async (template: ITemplateHd) => {
    const response = (await getData(
      `${Template.getById}/${template.templateId}`
    )) as ApiResponse<ITemplateHd>

    if (response.result === 1 && response.data) {
      const templateData = Array.isArray(response.data)
        ? response.data[0]
        : response.data
      template = templateData

      setModalMode("edit")
      setSelectedTemplate(template)
      setIsFormFilled(true) // For edit mode, form is considered filled
      setCurrentFormData(null) // Clear form data for edit mode

      setTemplateDetails(templateData.data_details || [])

      setIsModalOpen(true)
    }
  }

  // Handler to open modal for viewing a template
  const handleViewTemplate = (template: ITemplateHd | null) => {
    if (!template) return
    setModalMode("view")
    setSelectedTemplate(template)
    setIsFormFilled(true) // For view mode, form is considered filled
    setCurrentFormData(null) // Clear form data for view mode
    setTemplateDetails([]) // Reset details
    setIsModalOpen(true)
  }

  // Handler to track when form is filled (for new templates)
  const handleFormChange = (data: TemplateHdSchemaType) => {
    setCurrentFormData(data)
    const isFilled = Boolean(
      data.templateName &&
        data.templateName.trim() !== "" &&
        data.taskId > 0 &&
        data.chargeId > 0
    )
    setIsFormFilled(isFilled)
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: TemplateHdSchemaType) => {
    try {
      // Combine header and details data
      const combinedData = {
        ...data,
        data_details: templateDetails,
      }

      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(combinedData)
        if (response.result === 1) {
          // Invalidate and refetch the templates query
          queryClient.invalidateQueries({ queryKey: ["templates"] })
        }
      } else if (modalMode === "edit" && selectedTemplate) {
        const response = await updateMutation.mutateAsync(combinedData)
        if (response.result === 1) {
          // Invalidate and refetch the templates query
          queryClient.invalidateQueries({ queryKey: ["templates"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    const templateToDelete = templatesData?.find(
      (template) => template.templateId.toString() === templateId
    )
    if (!templateToDelete) return

    // Open delete confirmation dialog with template details
    setDeleteConfirmation({
      isOpen: true,
      templateId,
      templateName: templateToDelete.templateName,
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

  // Handler for loading existing template
  const handleLoadExistingTemplate = () => {
    if (existingTemplate) {
      // Set the states
      setModalMode("edit")
      setSelectedTemplate(existingTemplate)
      setShowLoadDialog(false)
      setExistingTemplate(null)
    }
  }

  const queryClient = useQueryClient()

  // Save handler for template form
  const handleSave = async () => {
    try {
      // Get form data from template form
      const formData = templateFormRef.current?.getFormData()
      if (!formData) {
        console.error("No form data available")
        return
      }

      // Validate form data
      if (!formData.templateName || formData.templateName.trim() === "") {
        console.error("Template name is required")
        return
      }

      if (!formData.taskId || formData.taskId <= 0) {
        console.error("Task is required")
        return
      }

      if (!formData.chargeId || formData.chargeId <= 0) {
        console.error("Charge is required")
        return
      }

      // Combine header and details data
      const combinedData = {
        ...formData,
        data_details: templateDetails,
      }

      // Show save confirmation
      setSaveConfirmation({
        isOpen: true,
        data: combinedData,
      })
    } catch (error) {
      console.error("Error in save handler:", error)
    }
  }

  const handleDeleteDetail = (itemNo: string) => {
    // Remove specific item from array
    setTemplateDetails((prev) =>
      prev.filter((detail) => detail.itemNo.toString() !== itemNo)
    )
  }

  // Handler for updating a template detail
  const handleUpdateDetail = (updatedDetail: ITemplateDt) => {
    setTemplateDetails((prev) =>
      prev.map((detail) =>
        detail.itemNo === updatedDetail.itemNo ? updatedDetail : detail
      )
    )
    setSelectedDetail(undefined)
  }

  // Additional details handlers - Handle both add and edit
  const handleDetailFormSubmit = (data: TemplateDtSchemaType) => {
    if (_selectedDetail) {
      // Edit existing detail
      const updatedDetail: ITemplateDt = {
        ..._selectedDetail,
        chargeId: data.chargeId,
        chargeName: data.chargeName || "", // Use chargeName from form data
        remarks: data.remarks || "",
        editVersion: data.editVersion,
        isServiceCharge: data.isServiceCharge,
        serviceCharge: data.serviceCharge,
      }
      handleUpdateDetail(updatedDetail)
    } else {
      // Add new detail
      const newDetail: ITemplateDt = {
        templateId: selectedTemplate?.templateId ?? 0,
        itemNo: (templateDetails?.length ?? 0) + 1, // Next item number
        chargeId: data.chargeId,
        chargeName: data.chargeName || "", // Use chargeName from form data
        remarks: data.remarks || "",
        editVersion: data.editVersion,
        isServiceCharge: data.isServiceCharge,
        serviceCharge: data.serviceCharge,
      }

      // Add to existing array
      setTemplateDetails((prev) => [...prev, newDetail])
    }

    // Reset form after successful addition/update
    setSelectedDetail(undefined)
    setShouldResetDetailForm(true)
  }

  const handleViewDetail = (detail: ITemplateDt | null) => {
    if (!detail) return
    setSelectedDetail(detail)
  }

  // Handler for editing a template detail
  const handleEditDetail = (detail: ITemplateDt) => {
    setSelectedDetail(detail)
    // The form will be pre-filled with this detail data
    setShouldResetDetailForm(false) // Don't reset when editing
  }

  // Check if template form is fully filled
  // For new templates, we need to check if the form has been filled
  // For existing templates, we check selectedTemplate
  const isTemplateFormComplete = Boolean(
    modalMode === "create"
      ? isFormFilled // For new templates, check if form is filled
      : selectedTemplate?.templateName &&
          selectedTemplate?.taskId &&
          selectedTemplate?.chargeId &&
          selectedTemplate.templateName.trim() !== "" &&
          selectedTemplate.taskId > 0 &&
          selectedTemplate.chargeId > 0
  )

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Templates
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage template information and settings
          </p>
        </div>
      </div>

      {/* Templates Table */}
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
          data={filters.search ? [] : templatesData || []}
          isLoading={isLoading}
          onSelect={handleViewTemplate}
          onDeleteAction={handleDeleteTemplate}
          onEditAction={handleEditTemplate}
          onCreateAction={handleCreateTemplate}
          onRefreshAction={handleRefresh}
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
          className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader className="border-b pb-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
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
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSave}
                  disabled={!isTemplateFormComplete}
                  className="h-8 px-2"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (modalMode === "edit" && selectedTemplate) {
                      handleDeleteTemplate(
                        selectedTemplate.templateId.toString()
                      )
                    }
                  }}
                  disabled={modalMode !== "edit" || !selectedTemplate}
                  className="h-8 px-2"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="@container">
            {/* Header Form Section */}
            <div className="bg-card mb-2 rounded-lg border p-4 shadow-sm">
              <TemplateForm
                ref={templateFormRef}
                initialData={
                  modalMode === "edit" || modalMode === "view"
                    ? selectedTemplate
                    : undefined
                }
                onCancelAction={() => setIsModalOpen(false)}
                isReadOnly={modalMode === "view"}
                onCodeBlur={() => {}}
                onChange={handleFormChange}
              />
            </div>

            {/* Details Form Section - Always visible like debit note */}
            <div className="bg-card mb-2 rounded-lg border p-4 shadow-sm">
              <TemplateDetailsForm
                initialData={_selectedDetail} // Pass selected detail for editing
                submitAction={handleDetailFormSubmit}
                onCancelAction={() => setSelectedDetail(undefined)}
                isSubmitting={false}
                isReadOnly={!isTemplateFormComplete}
                shouldReset={shouldResetDetailForm}
                onReset={() => setShouldResetDetailForm(false)}
                taskId={
                  modalMode === "create"
                    ? currentFormData?.taskId
                    : selectedTemplate?.taskId
                }
              />
            </div>

            {/* Details Table Section - Always visible like debit note */}
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="max-h-[50vh] overflow-auto p-4">
                <TemplateDetailsTable
                  data={templateDetails}
                  isLoading={false}
                  onSelect={handleViewDetail}
                  onDeleteAction={handleDeleteDetail}
                  onBulkDeleteAction={() => {}}
                  onEditAction={handleEditDetail}
                  onCreateAction={() => setSelectedDetail(undefined)}
                  onRefreshAction={() => {}}
                  onFilterChange={() => {}}
                  onDataReorder={() => {}}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Existing Template Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingTemplate}
        onCancelAction={() => setExistingTemplate(null)}
        code={existingTemplate?.templateName}
        name={existingTemplate?.templateName}
        typeLabel="Template"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

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
