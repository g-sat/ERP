"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { IPayrollComponent, ISalaryComponent } from "@/interfaces/payroll"
import { format } from "date-fns"
import { Plus } from "lucide-react"

import { SalaryComponent } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/format"
import { useGet } from "@/hooks/use-common"
import {
  useGetEmployeeSalaryDetailsById,
  useGetEmployeeSalaryDetailsHistoryById,
} from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { SalaryComponentsForm } from "./components/forms/employee-salary-components"
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

  // Use hook to fetch employee data
  const {
    data: employeeSalaryDetailsHistoryData,
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: historyRefetch,
  } = useGetEmployeeSalaryDetailsHistoryById(employeeId)

  const {
    data: componentsData,
    isLoading: componentsLoading,
    refetch: componentsRefetch,
  } = useGet(SalaryComponent.getSalary, "payrollcomponentsalary")

  // Get the employee salary details from the response
  const employeeSalaryDetails =
    employeeSalaryDetailsData?.data as unknown as ISalaryComponent[]

  const employeeSalaryDetailsHistory =
    employeeSalaryDetailsHistoryData?.data as unknown as ISalaryComponent[]

  // Get payroll components data
  const components =
    (componentsData?.data as unknown as IPayrollComponent[]) || []

  console.log("employeeSalaryDetailsData", employeeSalaryDetailsData)
  console.log("employeeSalaryDetails", employeeSalaryDetails)
  console.log("components", components)

  // Handle null or empty salary details
  const hasSalaryData =
    employeeSalaryDetails === null
      ? false
      : employeeSalaryDetails && employeeSalaryDetails.length > 0

  console.log("hasSalaryData", hasSalaryData)

  // Show loading skeleton
  if (isLoading || componentsLoading) {
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
    debugger
    // Refetch payroll components to get latest data
    //componentsRefetch()

    // Return current filtered data (will be updated after refetch)
    return components
      .filter((component) => component.isSalaryComponent)
      .map((component) => ({
        employeeId: parseInt(employeeId),
        employeeName: "",
        employeeCode: "",
        componentId: component.componentId,
        componentName: component.componentName,
        componentType: component.componentType,
        amount: 0,
        effectiveFromDate: format(new Date(), clientDateFormat),
        createDate: format(new Date(), clientDateFormat),
      }))
  }

  return (
    <div className="flex-1 space-y-4">
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
          <SalaryComponentsForm
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
