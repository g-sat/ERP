"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  IEmployeeSalaryComponent,
  IPayrollComponent,
} from "@/interfaces/payroll"
import { format } from "date-fns"
import { Plus } from "lucide-react"

import { PayrollComponent } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/format"
import { useGet } from "@/hooks/use-common"
import { useGetEmployeeSalaryDetailsById } from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { EmployeeSalaryComponentsForm } from "./components/forms/employee-salary-components"
import { EmployeeSalaryDetailsTable } from "./components/tables/employee-salary-details"

export default function SalaryDetailsPage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  const [addSalaryDialogOpen, setAddSalaryDialogOpen] = useState(false)

  // Use hook to fetch employee data
  const {
    data: employeeSalaryDetailsData,
    isLoading,
    error,
    refetch,
  } = useGetEmployeeSalaryDetailsById(employeeId)

  const {
    data: payrollComponentsData,
    isLoading: payrollComponentsLoading,
    refetch: payrollComponentsRefetch,
  } = useGet(PayrollComponent.getSalary, "payrollcomponentsalary")

  // Get the employee salary details from the response
  const employeeSalaryDetails =
    employeeSalaryDetailsData?.data as unknown as IEmployeeSalaryComponent[]

  // Get payroll components data
  const payrollComponents =
    (payrollComponentsData?.data as unknown as IPayrollComponent[]) || []

  // Handle null or empty salary details
  const hasSalaryData =
    employeeSalaryDetails && employeeSalaryDetails.length > 0

  // Show loading skeleton
  if (isLoading || payrollComponentsLoading) {
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

  const handleAddSalary = () => {
    setAddSalaryDialogOpen(true)
  }

  const handleCancelAdd = () => {
    setAddSalaryDialogOpen(false)
  }

  const handleSaveSuccess = () => {
    setAddSalaryDialogOpen(false)
    refetch() // Refresh the data after successful save
  }

  // Function to get fresh default salary components
  const getFreshDefaultSalaryComponents = () => {
    // Refetch payroll components to get latest data
    payrollComponentsRefetch()

    // Return current filtered data (will be updated after refetch)
    return payrollComponents
      .filter((component) => component.isSalaryComponent)
      .map((component) => ({
        employeeId: parseInt(employeeId),
        employeeName: "",
        employeeCode: "",
        payrollComponentId: component.payrollComponentId,
        componentName: component.componentName,
        componentType: component.componentType,
        amount: 0,
        effectiveFromDate: format(new Date(), clientDateFormat),
        createDate: format(new Date(), clientDateFormat),
      }))
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Salary Details</h2>
        {!hasSalaryData && (
          <Button onClick={handleAddSalary}>
            <Plus className="mr-2 h-4 w-4" />
            Add Salary Components
          </Button>
        )}
      </div>

      {!hasSalaryData ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-lg font-semibold text-gray-600">
              No Salary Components Found
            </div>
            <p className="mb-4 text-sm text-gray-500">
              This employee doesn&apos;t have any salary components configured
              yet.
            </p>
            <Button onClick={handleAddSalary}>
              <Plus className="mr-2 h-4 w-4" />
              Add Salary Components
            </Button>
          </div>
        </div>
      ) : (
        <EmployeeSalaryDetailsTable
          employeeSalaryDetails={employeeSalaryDetails}
        />
      )}

      {/* Add Salary Components Dialog */}
      <Dialog open={addSalaryDialogOpen} onOpenChange={setAddSalaryDialogOpen}>
        <DialogContent
          className="max-h-[90vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Salary Components</DialogTitle>
          </DialogHeader>
          <EmployeeSalaryComponentsForm
            employeeSalaryDetails={
              hasSalaryData
                ? employeeSalaryDetails
                : getFreshDefaultSalaryComponents()
            }
            onCancel={handleCancelAdd}
            onSaveSuccess={handleSaveSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
