"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IDepartment, IDepartmentFilter } from "@/interfaces/department"
import { DepartmentFormValues } from "@/schemas/department"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Department } from "@/lib/api-routes"
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
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { DepartmentForm } from "./components/department-form"
import { DepartmentsTable } from "./components/department-table"

export default function DepartmentPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.department

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IDepartmentFilter>({})
  const {
    data: departmentsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IDepartment>(`${Department.get}`, "departments", filters.search)

  const { result: departmentsResult, data: departmentsData } =
    (departmentsResponse as ApiResponse<IDepartment>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (departmentsData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = usePersist<DepartmentFormValues>(`${Department.add}`)
  const updateMutation = usePersist<DepartmentFormValues>(`${Department.add}`)
  const deleteMutation = useDelete(`${Department.delete}`)

  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingDepartment, setExistingDepartment] =
    useState<IDepartment | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    departmentId: string | null
    departmentName: string | null
  }>({
    isOpen: false,
    departmentId: null,
    departmentName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetByParams<IDepartment>(
    `${Department.getByCode}`,
    "departmentByCode",
    codeToCheck || ""
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateDepartment = () => {
    setModalMode("create")
    setSelectedDepartment(null)
    setIsModalOpen(true)
  }

  const handleEditDepartment = (department: IDepartment) => {
    setModalMode("edit")
    setSelectedDepartment(department)
    setIsModalOpen(true)
  }

  const handleViewDepartment = (department: IDepartment | null) => {
    if (!department) return
    setModalMode("view")
    setSelectedDepartment(department)
    setIsModalOpen(true)
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: DepartmentFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: DepartmentFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: DepartmentFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["departments"] })
        }
      } else if (modalMode === "edit" && selectedDepartment) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["departments"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteDepartment = (departmentId: string) => {
    const departmentToDelete = departmentsData?.find(
      (d) => d.departmentId.toString() === departmentId
    )
    if (!departmentToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      departmentId,
      departmentName: departmentToDelete.departmentName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.departmentId) {
      deleteMutation.mutateAsync(deleteConfirmation.departmentId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["departments"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        departmentId: null,
        departmentName: null,
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
        const departmentData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed departmentData:", departmentData)

        if (departmentData) {
          // Ensure all required fields are present
          const validDepartmentData: IDepartment = {
            departmentId: departmentData.departmentId,
            companyId: departmentData.companyId,
            departmentCode: departmentData.departmentCode,
            departmentName: departmentData.departmentName,
            remarks: departmentData.remarks || "",
            isActive: departmentData.isActive ?? true,
            createBy: departmentData.createBy,
            editBy: departmentData.editBy,
            createDate: departmentData.createDate,
            editDate: departmentData.editDate,
          }

          console.log("Setting existing department:", validDepartmentData)
          setExistingDepartment(validDepartmentData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing department
  const handleLoadExistingDepartment = () => {
    if (existingDepartment) {
      // Log the data we're about to set
      console.log("About to load department data:", {
        existingDepartment,
        currentModalMode: modalMode,
        currentSelectedDepartment: selectedDepartment,
      })

      // Set the states
      setModalMode("edit")
      setSelectedDepartment(existingDepartment)
      setShowLoadDialog(false)
      setExistingDepartment(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground text-sm">
            Manage department information and settings
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
      ) : departmentsResult ? (
        <DepartmentsTable
          data={departmentsData || []}
          onDepartmentSelect={canView ? handleViewDepartment : undefined}
          onDeleteDepartment={canDelete ? handleDeleteDepartment : undefined}
          onEditDepartment={canEdit ? handleEditDepartment : undefined}
          onCreateDepartment={canCreate ? handleCreateDepartment : undefined}
          onRefresh={handleRefresh}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {departmentsResult === 0 ? "No data available" : "Loading..."}
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
              {modalMode === "create" && "Create Department"}
              {modalMode === "edit" && "Update Department"}
              {modalMode === "view" && "View Department"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new department to the system database."
                : modalMode === "edit"
                  ? "Update department information in the system database."
                  : "View department details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DepartmentForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedDepartment
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

      {/* Load Existing Department Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingDepartment}
        onCancel={() => setExistingDepartment(null)}
        code={existingDepartment?.departmentCode}
        name={existingDepartment?.departmentName}
        typeLabel="Department"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Department"
        description="This action cannot be undone. This will permanently delete the department from our servers."
        itemName={deleteConfirmation.departmentName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            departmentId: null,
            departmentName: null,
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
          modalMode === "create" ? "Create Department" : "Update Department"
        }
        itemName={saveConfirmation.data?.departmentName || ""}
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
