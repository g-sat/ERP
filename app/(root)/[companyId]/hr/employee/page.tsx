"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IEmployee,
  IEmployeeCategory,
  IEmployeeFilter,
} from "@/interfaces/employee"
import { EmployeeCategoryValues, EmployeeFormValues } from "@/schemas/employee"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { Employee, EmployeeCategory } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common"
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
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { EmployeeCategoryForm } from "./components/employee-category-form"
import { EmployeeCategoryTable } from "./components/employee-category-table"
import { EmployeeForm } from "./components/employee-form"
import { EmployeesTable } from "./components/employee-table"

export default function EmployeePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.employee
  const transactionIdCategory = MasterTransactionId.employee_category

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

  // State for filters
  const [filters, setFilters] = useState<IEmployeeFilter>({})
  const [categoryFilters, setCategoryFilters] = useState<IEmployeeFilter>({})

  // Data fetching
  const {
    data: employeesResponse,
    refetch: refetchEmployee,
    isLoading: isLoadingEmployee,
    isRefetching: isRefetchingEmployee,
  } = useGet<IEmployee>(`${Employee.get}`, "employees", filters.search)

  const {
    data: employeeCategoryResponse,
    refetch: refetchEmployeeCategory,
    isLoading: isLoadingEmployeeCategory,
    isRefetching: isRefetchingEmployeeCategory,
  } = useGet<IEmployeeCategory>(
    `${EmployeeCategory.get}`,
    "employeecategory",
    categoryFilters.search
  )

  // Extract data from responses
  const employeesData =
    (employeesResponse as ApiResponse<IEmployee>)?.data || []
  const employeeCategoryData =
    (employeeCategoryResponse as ApiResponse<IEmployeeCategory>)?.data || []

  // Mutations
  const saveMutation = useSave<EmployeeFormValues>(`${Employee.add}`)
  const updateMutation = useUpdate<EmployeeFormValues>(`${Employee.add}`)
  const deleteMutation = useDelete(`${Employee.delete}`)

  const saveCategoryMutation = useSave<EmployeeCategoryValues>(
    `${EmployeeCategory.add}`
  )
  const updateCategoryMutation = useUpdate<EmployeeCategoryValues>(
    `${EmployeeCategory.add}`
  )
  const deleteCategoryMutation = useDelete(`${EmployeeCategory.delete}`)

  // State management
  const [selectedEmployee, setSelectedEmployee] = useState<
    IEmployee | undefined
  >()
  const [selectedEmployeeCategory, setSelectedEmployeeCategory] = useState<
    IEmployeeCategory | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "employee" as "employee" | "employeecategory",
  })

  // Duplicate detection states
  const [showLoadDialogEmployee, setShowLoadDialogEmployee] = useState(false)
  const [existingEmployee, setExistingEmployee] = useState<IEmployee | null>(
    null
  )

  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingEmployeeCategory, setExistingEmployeeCategory] =
    useState<IEmployeeCategory | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchEmployee()
  }, [filters.search])

  useEffect(() => {
    if (categoryFilters.search !== undefined) refetchEmployeeCategory()
  }, [categoryFilters.search])

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

  const handleCreateEmployeeCategory = () => {
    setModalMode("create")
    setSelectedEmployeeCategory(undefined)
    setIsCategoryModalOpen(true)
  }

  const handleEditEmployeeCategory = (employeeCategory: IEmployeeCategory) => {
    setModalMode("edit")
    setSelectedEmployeeCategory(employeeCategory)
    setIsCategoryModalOpen(true)
  }

  const handleViewEmployeeCategory = (
    employeeCategory: IEmployeeCategory | undefined
  ) => {
    if (!employeeCategory) return
    setModalMode("view")
    setSelectedEmployeeCategory(employeeCategory)
    setIsCategoryModalOpen(true)
  }

  // Filter handlers
  const handleEmployeeFilterChange = (filters: IEmployeeFilter) => {
    setFilters(filters)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<IEmployee | IEmployeeCategory>,
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

  const handleEmployeeCategorySubmit = async (data: EmployeeCategoryValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployeeCategory>
        if (
          handleApiResponse(
            response,
            "Employee Category created successfully",
            "Create Employee Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["employeecategory"] })
        }
      } else if (modalMode === "edit" && selectedEmployeeCategory) {
        const response = (await updateCategoryMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployeeCategory>
        if (
          handleApiResponse(
            response,
            "Employee Category updated successfully",
            "Update Employee Category"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["employeecategory"] })
        }
      }
    } catch (error) {
      console.error("Employee Category form submission error:", error)
      toast.error("Failed to process employee category request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data: EmployeeFormValues | EmployeeCategoryValues
  ) => {
    try {
      if (isCategoryModalOpen) {
        await handleEmployeeCategorySubmit(data as EmployeeCategoryValues)
        setIsCategoryModalOpen(false)
      } else {
        await handleEmployeeSubmit(data as EmployeeFormValues)
        setIsModalOpen(false)
      }
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
      name:
        `${employeeToDelete.firstName || ""} ${employeeToDelete.lastName || ""}`.trim() ||
        employeeToDelete.code,
      type: "employee",
    })
  }

  const handleDeleteEmployeeCategory = (employeeCategoryId: string) => {
    const employeeCategoryToDelete = employeeCategoryData?.find(
      (c) => c.empCategoryId.toString() === employeeCategoryId
    )
    if (!employeeCategoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: employeeCategoryId,
      name: employeeCategoryToDelete.empCategoryName,
      type: "employeecategory",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "employee":
        mutation = deleteMutation
        break
      case "employeecategory":
        mutation = deleteCategoryMutation
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
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

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = await getData(`${Employee.getByCode}/${trimmedCode}`)

      if (response.data.result === 1 && response.data.data) {
        const employeeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        if (employeeData) {
          setExistingEmployee(employeeData as IEmployee)
          setShowLoadDialogEmployee(true)
        }
      }

      const responseCategory = await getData(
        `${EmployeeCategory.getByCode}/${trimmedCode}`
      )

      if (responseCategory.data.result === 1 && responseCategory.data.data) {
        const employeeCategoryData = Array.isArray(responseCategory.data.data)
          ? responseCategory.data.data[0]
          : responseCategory.data.data

        if (employeeCategoryData) {
          setExistingEmployeeCategory(employeeCategoryData as IEmployeeCategory)
          setShowLoadDialogCategory(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
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

  const handleLoadExistingCategory = () => {
    if (existingEmployeeCategory) {
      setModalMode("edit")
      setSelectedEmployeeCategory(existingEmployeeCategory)
      setShowLoadDialogCategory(false)
      setExistingEmployeeCategory(null)
    }
  }

  // Loading state
  if (
    isLoadingEmployee ||
    isRefetchingEmployee ||
    isLoadingEmployeeCategory ||
    isRefetchingEmployeeCategory
  ) {
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

      <Tabs defaultValue="employee" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employee">Employee</TabsTrigger>
          <TabsTrigger value="employeecategory">Employee Category</TabsTrigger>
        </TabsList>

        <TabsContent value="employee" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="employeecategory" className="space-y-4">
          {(employeeCategoryResponse as ApiResponse<IEmployeeCategory>)
            ?.result === -2 ? (
            <LockSkeleton locked={true}>
              <EmployeeCategoryTable
                data={employeeCategoryData}
                onEmployeeCategorySelect={handleViewEmployeeCategory}
                onDeleteEmployeeCategory={
                  canDeleteCategory ? handleDeleteEmployeeCategory : undefined
                }
                onEditEmployeeCategory={
                  canEditCategory ? handleEditEmployeeCategory : undefined
                }
                onCreateEmployeeCategory={
                  canCreateCategory ? handleCreateEmployeeCategory : undefined
                }
                onRefresh={refetchEmployeeCategory}
                onFilterChange={setCategoryFilters}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
              />
            </LockSkeleton>
          ) : (
            <EmployeeCategoryTable
              data={employeeCategoryData}
              onEmployeeCategorySelect={handleViewEmployeeCategory}
              onDeleteEmployeeCategory={
                canDeleteCategory ? handleDeleteEmployeeCategory : undefined
              }
              onEditEmployeeCategory={
                canEditCategory ? handleEditEmployeeCategory : undefined
              }
              onCreateEmployeeCategory={
                canCreateCategory ? handleCreateEmployeeCategory : undefined
              }
              onRefresh={refetchEmployeeCategory}
              onFilterChange={setCategoryFilters}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Employee Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto"
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

      {/* Employee Category Form Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent
          className="sm:max-w-3xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Employee Category"}
              {modalMode === "edit" && "Update Employee Category"}
              {modalMode === "view" && "View Employee Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new employee category to the system database."
                : modalMode === "edit"
                  ? "Update employee category information."
                  : "View employee category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <EmployeeCategoryForm
            initialData={
              modalMode !== "create" ? selectedEmployeeCategory : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsCategoryModalOpen(false)}
            isSubmitting={
              saveCategoryMutation.isPending || updateCategoryMutation.isPending
            }
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
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
        name={
          `${existingEmployee?.firstName || ""} ${existingEmployee?.lastName || ""}`.trim() ||
          existingEmployee?.code
        }
        typeLabel="Employee"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingCategory}
        onCancel={() => setExistingEmployeeCategory(null)}
        code={existingEmployeeCategory?.empCategoryCode}
        name={existingEmployeeCategory?.empCategoryName}
        typeLabel="Employee Category"
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
            type: "employee",
          })
        }
        isDeleting={
          deleteConfirmation.type === "employee"
            ? deleteMutation.isPending
            : deleteCategoryMutation.isPending
        }
      />
    </div>
  )
}
