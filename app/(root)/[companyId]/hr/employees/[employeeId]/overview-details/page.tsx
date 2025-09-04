"use client"

import { useParams } from "next/navigation"
import {
  IEmployee,
  IEmployeeBank,
  IEmployeeBasic,
  IEmployeePersonalDetails,
} from "@/interfaces/employee"

import {
  useGetEmployeeBankById,
  useGetEmployeeBasicById,
  useGetEmployeeById,
  useGetEmployeePersonalDetailsById,
} from "@/hooks/use-employee"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { EmployeeOverview } from "./components/employee-overview"

export default function EmployeeOverviewPage() {
  const params = useParams()
  const employeeId = params.employeeId as string

  const {
    data: employeeData,
    isLoading,
    error,
  } = useGetEmployeeById(employeeId)

  const {
    data: employeeBasicData,
    isLoading: isLoadingBasic,
    error: errorBasic,
  } = useGetEmployeeBasicById(employeeId)
  const employeeBasic = employeeBasicData?.data as unknown as IEmployeeBasic

  const {
    data: employeePersonalData,
    isLoading: isLoadingPersonal,
    error: errorPersonal,
  } = useGetEmployeePersonalDetailsById(employeeId)
  const employeePersonal =
    employeePersonalData?.data as unknown as IEmployeePersonalDetails

  const {
    data: employeeBankData,
    isLoading: isLoadingBank,
    error: errorBank,
  } = useGetEmployeeBankById(employeeId)
  const employeeBank = employeeBankData?.data as unknown as IEmployeeBank

  // Show loading skeleton if any data is loading
  if (isLoading || isLoadingBasic || isLoadingPersonal || isLoadingBank) {
    return <DataTableSkeleton columnCount={7} />
  }

  // Show error if any data failed to load
  if (error || errorBasic || errorPersonal || errorBank) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading employee details:{" "}
          {error?.message ||
            errorBasic?.message ||
            errorPersonal?.message ||
            errorBank?.message}
        </div>
      </div>
    )
  }

  // Check if employee exists
  if (!employeeData?.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">Employee not found.</div>
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

  // Check if all required data is available
  if (!employeeBasic) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          Employee details not found. Please try again.
        </div>
      </div>
    )
  }

  return (
    <EmployeeOverview
      employee={employee}
      employeeBasic={employeeBasic}
      employeePersonal={employeePersonal}
      employeeBank={employeeBank}
    />
  )
}
