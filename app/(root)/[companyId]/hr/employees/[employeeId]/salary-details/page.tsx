"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  IPayrollComponent,
  ISalaryComponent,
  ISalaryHistory,
} from "@/interfaces/payroll"
import { format } from "date-fns"
import { Plus } from "lucide-react"

import { SalaryComponent } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/date-utils"
import { useGet } from "@/hooks/use-common"
import {
  useGetEmployeeSalaryDetailsById,
  useGetEmployeeSalaryHistory,
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
    isLoading: salaryHistoryLoading,
  } = useGetEmployeeSalaryHistory(employeeId)

  const { data: componentsData, isLoading: componentsLoading } = useGet(
    SalaryComponent.getSalary,
    "payrollcomponentsalary"
  )

  // Get the employee salary details from the response
  const employeeSalaryDetails =
    (employeeSalaryDetailsData?.data as unknown as ISalaryComponent[]) || []

  const salaryHistory =
    (employeeSalaryDetailsHistoryData?.data as unknown as ISalaryHistory[]) ||
    []

  // Get payroll components data
  const components =
    (componentsData?.data as unknown as IPayrollComponent[]) || []

  // Handle null or empty salary details
  const hasSalaryData =
    employeeSalaryDetails === null
      ? false
      : employeeSalaryDetails && employeeSalaryDetails.length > 0

  // Show loading skeleton
  if (isLoading || componentsLoading || salaryHistoryLoading) {
    return <DataTableSkeleton columnCount={7} />
  }

  // Show error if data failed to load
  if (error) {
    return (
      <div className="bg-muted/50 flex h-32 items-center justify-center rounded-lg border">
        <div className="text-center">
          <div className="text-destructive text-sm font-medium">
            Error loading employee details
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{error.message}</p>
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
    <div className="space-y-3">
      {!hasSalaryData ? (
        <div className="bg-muted/50 flex h-32 items-center justify-center rounded-lg border">
          <div className="text-center">
            <div className="text-muted-foreground text-sm font-medium">
              No Salary Components Found
            </div>
            <p className="text-muted-foreground mt-1 mb-3 text-xs">
              This employee doesn&apos;t have any salary components configured
              yet.
            </p>
            <Button size="sm" onClick={handleAddSalary}>
              <Plus className="mr-1 h-3 w-3" />
              Add Salary Components
            </Button>
          </div>
        </div>
      ) : (
        <EmployeeSalaryDetailsTable
          employeeSalaryDetails={employeeSalaryDetails}
          salaryHistory={salaryHistory}
        />
      )}

      {/* Add Salary Components Dialog */}
      <Dialog open={addSalaryDialogOpen} onOpenChange={setAddSalaryDialogOpen}>
        <DialogContent
          className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto sm:w-[80vw]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg">Add Salary Components</DialogTitle>
          </DialogHeader>
          <SalaryComponentsForm
            employeeSalaryDetails={
              hasSalaryData
                ? employeeSalaryDetails
                : getFreshDefaultSalaryComponents()
            }
            onCancelAction={handleCancelAdd}
            onSaveSuccess={handleSaveSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
