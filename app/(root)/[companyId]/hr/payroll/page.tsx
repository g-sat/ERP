"use client"

import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPayrollEmployee } from "@/interfaces/payroll"
import { PayrollEmployeeFormData } from "@/schemas/payroll"
import { toast } from "sonner"

import { PayrollEmployee } from "@/lib/api-routes"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
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

import { ComplianceReporting } from "./components/compliance-reporting"
import { PayrollCalculation } from "./components/payroll-calculation"
import { PayrollDashboard } from "./components/payroll-dashboard"
import { PayrollEmployeeBulkForm } from "./components/payroll-employee-bulk-form"
import { PayrollEmployeeDetail } from "./components/payroll-employee-detail"
import { PayrollEmployeeForm } from "./components/payroll-employee-form"
import { PayrollEmployeeTable } from "./components/payroll-employee-table"
import { PayslipGeneration } from "./components/payslip-generation"
import { SalaryPayment } from "./components/salary-payment"
import { SIFSubmission } from "./components/sif-submission"
import { WPSSIFGeneration } from "./components/wps-sif-generation"

export default function PayrollPage() {
  // Permissions
  const canCreateEmployee = true
  const canEditEmployee = true
  const canDeleteEmployee = true

  // State for filters
  const [employeeFilters, setEmployeeFilters] = useState<{ search?: string }>(
    {}
  )

  const {
    data: payrollEmployeeResponse,
    refetch: refetchPayrollEmployee,
    isLoading: isLoadingPayrollEmployee,
    error: payrollEmployeeError,
  } = useGet<IPayrollEmployee>(
    `${PayrollEmployee.get}`,
    "payrollemployee",
    (employeeFilters.search as string) || undefined
  )

  // Extract data from responses
  const payrollEmployeeData =
    (payrollEmployeeResponse as ApiResponse<IPayrollEmployee>)?.data || []

  // State for dialogs
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isEmployeeBulkDialogOpen, setIsEmployeeBulkDialogOpen] =
    useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // State for selected items
  const [selectedEmployee, setSelectedEmployee] = useState<
    IPayrollEmployee | undefined
  >()
  const [editingEmployee, setEditingEmployee] =
    useState<IPayrollEmployee | null>(null)

  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    type: string
  } | null>(null)

  // Employee mutations
  const { mutate: saveEmployee } = usePersist<PayrollEmployeeFormData>(
    PayrollEmployee.add
  )
  const { mutate: updateEmployee } = usePersist<PayrollEmployeeFormData>(
    PayrollEmployee.update
  )
  const { mutate: deleteEmployee } = useDelete(PayrollEmployee.delete)

  // Filter handlers
  const handleEmployeeFilterChange = (filters: { search?: string }) => {
    setEmployeeFilters(filters)
  }

  const handleViewEmployee = (employee: IPayrollEmployee | undefined) => {
    setSelectedEmployee(employee)
  }

  const handleEmployeeSubmit = async (data: PayrollEmployeeFormData) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        updateEmployee(data, {
          onSuccess: (response) => {
            if (response.result === 1) {
              toast.success("Payroll employee updated successfully")
              refetchPayrollEmployee()
              setIsEmployeeDialogOpen(false)
              setEditingEmployee(null)
            } else {
              toast.error(
                `Failed to update payroll employee: ${response.message}`
              )
            }
          },
          onError: () => {
            toast.error("Failed to update payroll employee")
          },
        })
      } else {
        // Create new employee
        saveEmployee(data, {
          onSuccess: (response) => {
            if (response.result === 1) {
              toast.success("Payroll employee created successfully")
              refetchPayrollEmployee()
              setIsEmployeeDialogOpen(false)
            } else {
              toast.error(
                `Failed to create payroll employee: ${response.message}`
              )
            }
          },
          onError: () => {
            toast.error("Failed to create payroll employee")
          },
        })
      }
    } catch (error) {
      console.error("Error in employee submit:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const handleEmployeeBulkSubmit = async (data: PayrollEmployeeFormData[]) => {
    try {
      // Process each employee individually
      const promises = data.map(
        (employeeData) =>
          new Promise((resolve, reject) => {
            saveEmployee(employeeData, {
              onSuccess: (response) => {
                if (response.result === 1) {
                  resolve(response)
                } else {
                  reject(new Error(response.message))
                }
              },
              onError: () => {
                reject(new Error("Failed to save employee"))
              },
            })
          })
      )

      await Promise.all(promises)
      toast.success(`${data.length} payroll employees created successfully`)
      refetchPayrollEmployee()
      setIsEmployeeBulkDialogOpen(false)
    } catch (error) {
      console.error("Error in bulk employee submit:", error)
      toast.error("Failed to create some payroll employees")
    }
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "employee") {
      deleteEmployee(itemToDelete.id, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Payroll employee deleted successfully")
            refetchPayrollEmployee()
          } else {
            toast.error(
              `Failed to delete payroll employee: ${response.message}`
            )
          }
        },
        onError: () => {
          toast.error("Failed to delete payroll employee")
        },
      })
    }

    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  // Check permissions - allow view access even without create/edit/delete permissions
  if (!canCreateEmployee && !canEditEmployee && !canDeleteEmployee) {
    return (
      <LockSkeleton locked={false}>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Payroll Management
            </h2>
          </div>
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
              <TabsTrigger value="calculation">Payroll Calculation</TabsTrigger>
              <TabsTrigger value="payslip">Payslip Generation</TabsTrigger>
              <TabsTrigger value="wps">WPS SIF Generation</TabsTrigger>
              <TabsTrigger value="sif">SIF Submission</TabsTrigger>
              <TabsTrigger value="payment">Salary Payment</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Reporting</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="space-y-4">
              <PayrollDashboard
                payrollPeriodData={[]}
                payrollEmployeeData={payrollEmployeeData}
                payrollComponentData={[]}
                payrollTaxData={[]}
                payrollBankTransferData={[]}
              />
            </TabsContent>

            <TabsContent value="employees" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Employee Payroll</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage employee payroll processing and payments
                  </p>
                </div>
              </div>
              <Separator />
              {payrollEmployeeError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-4">
                  <p className="text-sm">
                    Failed to load payroll employees. Please try again.
                  </p>
                </div>
              )}
              {isLoadingPayrollEmployee ? (
                <DataTableSkeleton columnCount={8} />
              ) : (
                <PayrollEmployeeTable
                  data={payrollEmployeeData}
                  onView={handleViewEmployee}
                  onFilterChange={handleEmployeeFilterChange}
                  onRefresh={refetchPayrollEmployee}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Employee Detail Dialog */}
          <Dialog
            open={isEmployeeDialogOpen}
            onOpenChange={setIsEmployeeDialogOpen}
          >
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Employee Payroll Details</DialogTitle>
                <DialogDescription>
                  Detailed view of employee payroll information
                </DialogDescription>
              </DialogHeader>
              <PayrollEmployeeDetail employee={selectedEmployee} />
            </DialogContent>
          </Dialog>
        </div>
      </LockSkeleton>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Payroll Management
        </h2>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
          <TabsTrigger value="calculation">Payroll Calculation</TabsTrigger>
          <TabsTrigger value="payslip">Payslip Generation</TabsTrigger>
          <TabsTrigger value="wps">WPS SIF Generation</TabsTrigger>
          <TabsTrigger value="sif">SIF Submission</TabsTrigger>
          <TabsTrigger value="payment">Salary Payment</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PayrollDashboard
            payrollPeriodData={[]}
            payrollEmployeeData={payrollEmployeeData}
            payrollComponentData={[]}
            payrollTaxData={[]}
            payrollBankTransferData={[]}
          />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Employee Payroll</h3>
              <p className="text-muted-foreground text-sm">
                Manage employee payroll processing and payments
              </p>
            </div>
          </div>
          <Separator />
          {payrollEmployeeError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-4">
              <p className="text-sm">
                Failed to load payroll employees. Please try again.
              </p>
            </div>
          )}
          {isLoadingPayrollEmployee ? (
            <DataTableSkeleton columnCount={8} />
          ) : (
            <PayrollEmployeeTable
              data={payrollEmployeeData}
              onView={handleViewEmployee}
              onFilterChange={handleEmployeeFilterChange}
              onRefresh={refetchPayrollEmployee}
            />
          )}
        </TabsContent>

        <TabsContent value="calculation" className="space-y-4">
          <PayrollCalculation employees={payrollEmployeeData} />
        </TabsContent>

        <TabsContent value="payslip" className="space-y-4">
          <PayslipGeneration employees={payrollEmployeeData} />
        </TabsContent>

        <TabsContent value="wps" className="space-y-4">
          <WPSSIFGeneration employees={payrollEmployeeData} />
        </TabsContent>

        <TabsContent value="sif" className="space-y-4">
          <SIFSubmission employees={payrollEmployeeData} />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <SalaryPayment employees={payrollEmployeeData} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceReporting employees={payrollEmployeeData} />
        </TabsContent>
      </Tabs>

      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setItemToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Confirmation"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />

      {/* Employee Detail Dialog */}
      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Payroll Details</DialogTitle>
            <DialogDescription>
              Detailed view of employee payroll information
            </DialogDescription>
          </DialogHeader>
          <PayrollEmployeeDetail employee={selectedEmployee} />
        </DialogContent>
      </Dialog>

      {/* Employee Form Dialog */}
      <PayrollEmployeeForm
        isOpen={isEmployeeDialogOpen}
        onClose={() => {
          setIsEmployeeDialogOpen(false)
          setEditingEmployee(null)
        }}
        onSubmit={handleEmployeeSubmit}
        initialData={editingEmployee || undefined}
        isSubmitting={false}
      />

      {/* Employee Bulk Form Dialog */}
      <PayrollEmployeeBulkForm
        isOpen={isEmployeeBulkDialogOpen}
        onClose={() => setIsEmployeeBulkDialogOpen(false)}
        onSubmit={handleEmployeeBulkSubmit}
        isSubmitting={false}
      />
    </div>
  )
}
