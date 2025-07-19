"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IEmployee, IEmployeeFilter } from "@/interfaces/employee"
import { EmployeeFormValues } from "@/schemas/employee"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Employee } from "@/lib/api-routes"
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
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { EmployeeForm } from "./components/employee-form"
import { EmployeesTable } from "./components/employee-table"

export default function EmployeePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.employee
  const [filters, setFilters] = useState<IEmployeeFilter>({})
  const {
    data: employeesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IEmployee>(`${Employee.get}`, "employees", filters.search)

  const { result: employeesResult, data: employeesData } =
    (employeesResponse as ApiResponse<IEmployee>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (employeesData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = useSave<EmployeeFormValues>(`${Employee.add}`)
  const updateMutation = useUpdate<EmployeeFormValues>(`${Employee.add}`)
  const deleteMutation = useDelete(`${Employee.delete}`)

  const [selectedEmployee, setSelectedEmployee] = useState<
    IEmployee | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    employeeId: string | null
    employeeName: string | null
  }>({
    isOpen: false,
    employeeId: null,
    employeeName: null,
  })

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

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

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployee>
        if (response.result === 1) {
          toast.success(response.message || "Employee created successfully")
          queryClient.invalidateQueries({ queryKey: ["employees"] })
        } else {
          toast.error(response.message || "Failed to create employee")
        }
      } else if (modalMode === "edit" && selectedEmployee) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IEmployee>
        if (response.result === 1) {
          toast.success(response.message || "Employee updated successfully")
          queryClient.invalidateQueries({ queryKey: ["employees"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update employee")
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleDeleteEmployee = (employeeId: string) => {
    const employeeToDelete = employeesData?.find(
      (e) => e.employeeId.toString() === employeeId
    )
    if (!employeeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      employeeId,
      employeeName: employeeToDelete.employeeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.employeeId) {
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.employeeId), {
        loading: `Deleting ${deleteConfirmation.employeeName}...`,
        success: `${deleteConfirmation.employeeName} has been deleted`,
        error: "Failed to delete employee",
      })
      setDeleteConfirmation({
        isOpen: false,
        employeeId: null,
        employeeName: null,
      })
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm">
            Manage employee information and settings
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
      ) : employeesResult === -2 ? (
        <LockSkeleton locked={true}>
          <EmployeesTable
            data={employeesData || []}
            onEmployeeSelect={handleViewEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onEditEmployee={handleEditEmployee}
            onCreateEmployee={handleCreateEmployee}
            onRefresh={() => {
              handleRefresh()
              toast("Refreshing data...Fetching the latest employee data.")
            }}
            onFilterChange={setFilters}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </LockSkeleton>
      ) : employeesResult ? (
        <EmployeesTable
          data={employeesData || []}
          onEmployeeSelect={handleViewEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onEditEmployee={handleEditEmployee}
          onCreateEmployee={handleCreateEmployee}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest employee data.")
          }}
          onFilterChange={setFilters}
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
          <Separator />
          <EmployeeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedEmployee
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({
            isOpen: open,
            employeeId: null,
            employeeName: null,
          })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteConfirmation.employeeName}? This action cannot be undone.`}
      />
    </div>
  )
}
