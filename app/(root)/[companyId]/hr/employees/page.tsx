"use client"

import { useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { IEmployeeBasic } from "@/interfaces/employee"

import { useDeleteEmployee, useGetEmployees } from "@/hooks/use-employee"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { EmployeeListTable } from "./components/employee-list-table"

export default function EmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] =
    useState<IEmployeeBasic | null>(null)

  const companyId = params.companyId as string

  // Use hooks for data fetching and mutations
  const { data, isLoading, refetch } = useGetEmployees()
  const deleteMutation = useDeleteEmployee()

  const handleEdit = useCallback(
    (employee: IEmployeeBasic) => {
      // Navigate to individual employee page using the correct path with company ID
      router.push(`/${companyId}/hr/employees/${employee.employeeId}`)
    },
    [router, companyId]
  )

  const handleView = useCallback(
    (employee: IEmployeeBasic) => {
      // Navigate to individual employee page using the correct path with company ID
      router.push(`/${companyId}/hr/employees/${employee.employeeId}`)
    },
    [router, companyId]
  )

  const handleDelete = useCallback((employee: IEmployeeBasic) => {
    setEmployeeToDelete(employee)
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete.employeeId.toString())
      setDeleteConfirmOpen(false)
      setEmployeeToDelete(null)
    }
  }, [deleteMutation, employeeToDelete])

  // Show employee list table
  return (
    <div className="@container flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      </div>
      {isLoading ? (
        <DataTableSkeleton columnCount={7} />
      ) : (
        <EmployeeListTable
          data={(data?.data as unknown as IEmployeeBasic[]) || []}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={refetch}
        />
      )}

      <DeleteConfirmation
        open={deleteConfirmOpen}
        onOpenChange={(isOpen) => setDeleteConfirmOpen(isOpen)}
        title="Delete Employee"
        description="This action cannot be undone. This will permanently delete the employee from our servers."
        itemName={employeeToDelete?.employeeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
