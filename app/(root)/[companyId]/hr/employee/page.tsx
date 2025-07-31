"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IEmployee, IEmployeeFilter } from "@/interfaces/employee"
import { EmployeeFormValues } from "@/schemas/employee"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Employee } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { EmployeeForm } from "./components/employee-form"
import { EmployeesTable } from "./components/employee-table"

export default function EmployeePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.employee

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  // State for filters
  const [filters, setFilters] = useState<IEmployeeFilter>({})
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0)

  // Form for company selection
  const companyForm = useForm()

  // Data fetching
  const {
    data: employeesResponse,
    refetch: refetchEmployee,
    isLoading: isLoadingEmployee,
    isRefetching: isRefetchingEmployee,
  } = useGet<IEmployee>(`${Employee.get}`, "employees", filters.search)

  // Extract data from responses
  const allEmployeesData =
    (employeesResponse as ApiResponse<IEmployee>)?.data || []

  // Filter employees by selected company
  const employeesData = selectedCompanyId
    ? allEmployeesData.filter(
        (employee) => employee.companyId === selectedCompanyId
      )
    : allEmployeesData

  // Mutations
  const saveMutation = usePersist<EmployeeFormValues>(`${Employee.add}`)
  const updateMutation = usePersist<EmployeeFormValues>(`${Employee.add}`)
  const deleteMutation = useDelete(`${Employee.delete}`)

  // State management
  const [selectedEmployee, setSelectedEmployee] = useState<
    IEmployee | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "employee" as const,
  })

  // Duplicate detection states
  const [showLoadDialogEmployee, setShowLoadDialogEmployee] = useState(false)
  const [existingEmployee, setExistingEmployee] = useState<IEmployee | null>(
    null
  )

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchEmployee()
  }, [filters.search])

  // Action handlers
  const handleCreateEmployee = () => {
    setModalMode("create")
    setSelectedEmployee(undefined)
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee: IEmployee) => {
    setModalMode("edit")
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleViewEmployee = (employee: IEmployee | undefined) => {
    if (!employee) return
    setModalMode("view")
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  // Filter handlers
  const handleEmployeeFilterChange = (filters: IEmployeeFilter) => {
    setFilters(filters)
  }

  // Company change handler
  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId)
    // Clear search filters when company changes
    setFilters({})
    // No API call needed - data is filtered client-side
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IEmployee>,
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
  const handleEmployeeSubmit = async (data: EmployeeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployee>
        if (
          handleApiResponse(
            response,
            "Employee created successfully",
            "Create Employee"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["employees"] })
        }
      } else if (modalMode === "edit" && selectedEmployee) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployee>
        if (
          handleApiResponse(
            response,
            "Employee updated successfully",
            "Update Employee"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["employees"] })
        }
      }
    } catch (error) {
      console.error("Employee form submission error:", error)
      toast.error("Failed to process employee request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (data: EmployeeFormValues) => {
    try {
      await handleEmployeeSubmit(data)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred during form submission")
    }
  }

  // Delete handlers
  const handleDeleteEmployee = (employeeId: string) => {
    const employeeToDelete = employeesData?.find(
      (e) => e.employeeId.toString() === employeeId
    )
    if (!employeeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: employeeId,
      name: employeeToDelete.employeeName?.trim() || employeeToDelete.code,
      type: "employee",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    toast.promise(deleteMutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.name}`,
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "employee",
    })
  }

  // Load existing records
  const handleLoadExistingEmployee = () => {
    if (existingEmployee) {
      setModalMode("edit")
      setSelectedEmployee(existingEmployee)
      setShowLoadDialogEmployee(false)
      setExistingEmployee(null)
    }
  }

  // Loading state
  if (isLoadingEmployee || isRefetchingEmployee) {
    return (
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
    )
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Employee</h1>
          <p className="text-muted-foreground text-sm">
            Manage employee information and settings
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-4">
          <CompanyAutocomplete
            form={companyForm}
            name="companyId"
            label="Select Company"
            onChangeEvent={(selectedOption) => {
              if (selectedOption) {
                handleCompanyChange(selectedOption.companyId)
              } else {
                handleCompanyChange(0)
              }
            }}
          />
        </div>
        {(employeesResponse as ApiResponse<IEmployee>)?.result === -2 ? (
          <LockSkeleton locked={true}>
            <EmployeesTable
              data={employeesData}
              onEmployeeSelect={handleViewEmployee}
              onDeleteEmployee={canDelete ? handleDeleteEmployee : undefined}
              onEditEmployee={canEdit ? handleEditEmployee : undefined}
              onCreateEmployee={canCreate ? handleCreateEmployee : undefined}
              onRefresh={refetchEmployee}
              onFilterChange={handleEmployeeFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          </LockSkeleton>
        ) : (
          <EmployeesTable
            data={employeesData}
            onEmployeeSelect={handleViewEmployee}
            onDeleteEmployee={canDelete ? handleDeleteEmployee : undefined}
            onEditEmployee={canEdit ? handleEditEmployee : undefined}
            onCreateEmployee={canCreate ? handleCreateEmployee : undefined}
            onRefresh={refetchEmployee}
            onFilterChange={handleEmployeeFilterChange}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        )}
      </div>

      {/* Employee Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[90vh] w-[90vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Employee"}
              {modalMode === "edit" && "Update Employee"}
              {modalMode === "view" && "View Employee"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new employee to the system database."
                : modalMode === "edit"
                  ? "Update employee information in the system database."
                  : "View employee details."}
            </DialogDescription>
          </DialogHeader>

          <EmployeeForm
            initialData={modalMode !== "create" ? selectedEmployee : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialogs */}
      <LoadExistingDialog
        open={showLoadDialogEmployee}
        onOpenChange={setShowLoadDialogEmployee}
        onLoad={handleLoadExistingEmployee}
        onCancel={() => setExistingEmployee(null)}
        code={existingEmployee?.code}
        name={existingEmployee?.employeeName?.trim() || existingEmployee?.code}
        typeLabel="Employee"
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
            type: "employee",
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
