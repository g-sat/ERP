"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IDesignation, IDesignationFilter } from "@/interfaces/designation"
import { DesignationFormValues } from "@/schemas/designation"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Designation } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { DesignationForm } from "./components/designation-form"
import { DesignationsTable } from "./components/designation-table"

export default function DesignationPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.designation

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<IDesignationFilter>({})
  const {
    data: designationsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IDesignation>(`${Designation.get}`, "designations", filters.search)

  const { result: designationsResult, data: designationsData } =
    (designationsResponse as ApiResponse<IDesignation>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (designationsData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = usePersist<DesignationFormValues>(`${Designation.add}`)
  const updateMutation = usePersist<DesignationFormValues>(`${Designation.add}`)
  const deleteMutation = useDelete(`${Designation.delete}`)

  const [selectedDesignation, setSelectedDesignation] =
    useState<IDesignation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingDesignation, setExistingDesignation] =
    useState<IDesignation | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    designationId: string | null
    designationName: string | null
  }>({
    isOpen: false,
    designationId: null,
    designationName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetByParams<IDesignation>(
    `${Designation.getByCode}`,
    "designationByCode",
    codeToCheck || ""
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateDesignation = () => {
    setModalMode("create")
    setSelectedDesignation(null)
    setIsModalOpen(true)
  }

  const handleEditDesignation = (designation: IDesignation) => {
    setModalMode("edit")
    setSelectedDesignation(designation)
    setIsModalOpen(true)
  }

  const handleViewDesignation = (designation: IDesignation | null) => {
    if (!designation) return
    setModalMode("view")
    setSelectedDesignation(designation)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: DesignationFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IDesignation>
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["designations"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedDesignation) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IDesignation>
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["designations"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteDesignation = (designationId: string) => {
    const designationToDelete = designationsData?.find(
      (d) => d.designationId.toString() === designationId
    )
    if (!designationToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      designationId,
      designationName: designationToDelete.designationName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.designationId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.designationId),
        {
          loading: `Deleting ${deleteConfirmation.designationName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["designations"] })
            return `${deleteConfirmation.designationName} has been deleted`
          },
          error: "Failed to delete designation",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        designationId: null,
        designationName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = async (code: string) => {
    // Skip if:
    // 1. In edit mode
    // 2. In read-only mode
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    setCodeToCheck(trimmedCode)
    try {
      const response = await checkCodeAvailability()
      console.log("Full API Response:", response)

      // Check if response has data and it's not empty
      if (response?.data?.result === 1 && response.data.data) {
        console.log("Response data:", response.data.data)

        // Handle both array and single object responses
        const designationData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed designationData:", designationData)

        if (designationData) {
          // Ensure all required fields are present
          const validDesignationData: IDesignation = {
            designationId: designationData.designationId,
            companyId: designationData.companyId,
            designationCode: designationData.designationCode,
            designationName: designationData.designationName,
            remarks: designationData.remarks || "",
            isActive: designationData.isActive ?? true,
            createBy: designationData.createBy,
            editBy: designationData.editBy,
            createDate: designationData.createDate,
            editDate: designationData.editDate,
          }

          console.log("Setting existing designation:", validDesignationData)
          setExistingDesignation(validDesignationData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing designation
  const handleLoadExistingDesignation = () => {
    if (existingDesignation) {
      // Log the data we're about to set
      console.log("About to load designation data:", {
        existingDesignation,
        currentModalMode: modalMode,
        currentSelectedDesignation: selectedDesignation,
      })

      // Set the states
      setModalMode("edit")
      setSelectedDesignation(existingDesignation)
      setShowLoadDialog(false)
      setExistingDesignation(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Designations</h1>
          <p className="text-muted-foreground text-sm">
            Manage designation information and settings
          </p>
        </div>
      </div>

      {isLoading || isRefetching ? (
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
      ) : designationsResult ? (
        <DesignationsTable
          data={designationsData || []}
          onDesignationSelect={handleViewDesignation}
          onDeleteDesignation={canDelete ? handleDeleteDesignation : undefined}
          onEditDesignation={canEdit ? handleEditDesignation : undefined}
          onCreateDesignation={handleCreateDesignation}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest designation data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div>No data available</div>
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
              {modalMode === "create" && "Create Designation"}
              {modalMode === "edit" && "Update Designation"}
              {modalMode === "view" && "View Designation"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new designation to the system database."
                : modalMode === "edit"
                  ? "Update designation information in the system database."
                  : "View designation details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DesignationForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedDesignation
                : null
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Designation Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingDesignation}
        onCancel={() => setExistingDesignation(null)}
        code={existingDesignation?.designationCode}
        name={existingDesignation?.designationName}
        typeLabel="Designation"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Designation"
        description="This action cannot be undone. This will permanently delete the designation from our servers."
        itemName={deleteConfirmation.designationName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            designationId: null,
            designationName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
