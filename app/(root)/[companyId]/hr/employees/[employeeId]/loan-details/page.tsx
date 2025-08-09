"use client"

import { useParams } from "next/navigation"
import { IEmployee } from "@/interfaces/employee"

import { useGetEmployeeById } from "@/hooks/use-employee"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { EmployeeLoans } from "./components/employee-loans"

export default function LoanPage() {
  const params = useParams()
  const employeeId = params.employeeId as string

  // Use hook to fetch employee data
  const {
    data: employeeData,
    isLoading,
    error,
  } = useGetEmployeeById(employeeId)

  // Show loading skeleton
  if (isLoading) {
    return <DataTableSkeleton columnCount={7} />
  }

  // Show error if data failed to load
  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading employee details: {error.message}
        </div>
      </div>
    )
  }

  // Check if employee exists
  if (!employeeData?.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">Employee not found</div>
      </div>
    )
  }

  // Get the employee from the response
  const employee = employeeData?.data as unknown as IEmployee

  if (!employee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          Employee not found in response
        </div>
      </div>
    )
  }

  return <EmployeeLoans />
}
