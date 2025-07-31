"use client"

import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IPayrollComponent,
  IPayrollComponentFilter,
  IPayrollEmployee,
  IPayrollPeriod,
  IPayrollPeriodFilter,
} from "@/interfaces/payroll"
import { toast } from "sonner"

import { PayrollComponent, PayrollPeriod } from "@/lib/api-routes"
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

import { ComplianceReporting } from "./components/compliance-reporting"
import { PayrollCalculation } from "./components/payroll-calculation"
import { PayrollComponentForm } from "./components/payroll-component-form"
import { PayrollComponentTable } from "./components/payroll-component-table"
import { PayrollDashboard } from "./components/payroll-dashboard"
import { PayrollEmployeeDetail } from "./components/payroll-employee-detail"
import { PayrollEmployeeTable } from "./components/payroll-employee-table"
import { PayrollPeriodForm } from "./components/payroll-period-form"
import { PayrollPeriodTable } from "./components/payroll-period-table"
import { PayslipGeneration } from "./components/payslip-generation"
import { SalaryPayment } from "./components/salary-payment"
import { SIFSubmission } from "./components/sif-submission"
import { WPSSIFGeneration } from "./components/wps-sif-generation"
import {
  dummyPayrollComponents,
  generatePayrollDataForAllEmployees,
} from "./dummy-employee-data"

export default function PayrollPage() {
  // Permissions
  const canCreatePeriod = true
  const canEditPeriod = true
  const canDeletePeriod = true

  const canCreateComponent = true
  const canEditComponent = true
  const canDeleteComponent = true

  // State for filters
  const [periodFilters, setPeriodFilters] = useState<IPayrollPeriodFilter>({})
  const [componentFilters, setComponentFilters] =
    useState<IPayrollComponentFilter>({})
  const [employeeFilters, setEmployeeFilters] = useState<
    Record<string, unknown>
  >({})

  // Dummy data for demonstration
  const [payrollEmployeeData, setPayrollEmployeeData] = useState<
    IPayrollEmployee[]
  >(generatePayrollDataForAllEmployees())

  // Debug: Log the generated data
  console.log("Generated payroll employee data:", payrollEmployeeData)
  console.log("Number of employees:", payrollEmployeeData.length)

  // Data fetching using use-common hooks
  const {
    data: payrollPeriodResponse,
    refetch: refetchPayrollPeriod,
    isLoading: isLoadingPayrollPeriod,
    error: payrollPeriodError,
  } = useGet<IPayrollPeriod>(
    `${PayrollPeriod.get}`,
    "payrollperiod",
    periodFilters.search
  )

  const {
    data: payrollComponentResponse,
    refetch: refetchPayrollComponent,
    isLoading: isLoadingPayrollComponent,
    error: payrollComponentError,
  } = useGet<IPayrollComponent>(
    `${PayrollComponent.get}`,
    "payrollcomponent",
    componentFilters.search
  )

  // Extract data from responses
  const payrollPeriodData =
    (payrollPeriodResponse as ApiResponse<IPayrollPeriod>)?.data || []
  const payrollComponentData =
    (payrollComponentResponse as ApiResponse<IPayrollComponent>)?.data || []

  // State for dialogs
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // State for selected items
  const [selectedPeriod, setSelectedPeriod] = useState<
    IPayrollPeriod | undefined
  >()
  const [selectedComponent, setSelectedComponent] = useState<
    IPayrollComponent | undefined
  >()
  const [selectedEmployee, setSelectedEmployee] = useState<
    IPayrollEmployee | undefined
  >()
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    type: string
  } | null>(null)

  // Mutations using use-common hooks
  const { mutate: savePeriod } = useSave<IPayrollPeriod>(PayrollPeriod.add)
  const { mutate: updatePeriod } = useUpdate<IPayrollPeriod>(
    PayrollPeriod.update
  )
  const { mutate: deletePeriod } = useDelete(PayrollPeriod.delete)

  const { mutate: saveComponent } = useSave<IPayrollComponent>(
    PayrollComponent.add
  )
  const { mutate: updateComponent } = useUpdate<IPayrollComponent>(
    PayrollComponent.update
  )
  const { mutate: deleteComponent } = useDelete(PayrollComponent.delete)

  // Handlers for Payroll Period
  const handleCreatePeriod = () => {
    setSelectedPeriod(undefined)
    setIsPeriodDialogOpen(true)
  }

  const handleEditPeriod = (period: IPayrollPeriod) => {
    setSelectedPeriod(period)
    setIsPeriodDialogOpen(true)
  }

  const handleViewPeriod = (period: IPayrollPeriod | undefined) => {
    setSelectedPeriod(period)
    setIsPeriodDialogOpen(true)
  }

  // Handlers for Payroll Component
  const handleCreateComponent = () => {
    setSelectedComponent(undefined)
    setIsComponentDialogOpen(true)
  }

  const handleEditComponent = (component: IPayrollComponent) => {
    setSelectedComponent(component)
    setIsComponentDialogOpen(true)
  }

  const handleViewComponent = (component: IPayrollComponent | undefined) => {
    setSelectedComponent(component)
    setIsComponentDialogOpen(true)
  }

  // Filter handlers
  const handlePeriodFilterChange = (filters: IPayrollPeriodFilter) => {
    setPeriodFilters(filters)
  }

  const handleComponentFilterChange = (filters: IPayrollComponentFilter) => {
    setComponentFilters(filters)
  }

  const handleEmployeeFilterChange = (filters: Record<string, unknown>) => {
    setEmployeeFilters(filters)
  }

  const handleViewEmployee = (employee: IPayrollEmployee | undefined) => {
    setSelectedEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  // API response handler
  const handleApiResponse = (
    response: ApiResponse<IPayrollPeriod | IPayrollComponent>,
    successMessage: string,
    errorPrefix: string
  ) => {
    if (response.result === 1) {
      toast.success(successMessage)
      setIsPeriodDialogOpen(false)
      setIsComponentDialogOpen(false)
      refetchPayrollPeriod()
      refetchPayrollComponent()
    } else {
      toast.error(`${errorPrefix}: ${response.message}`)
    }
  }

  // Form submission handlers
  const handlePeriodSubmit = async (data: Partial<IPayrollPeriod>) => {
    if (selectedPeriod) {
      // Update existing period
      updatePeriod(
        { ...data, payrollPeriodId: selectedPeriod.payrollPeriodId },
        {
          onSuccess: (response) => {
            handleApiResponse(
              response,
              "Payroll period updated successfully",
              "Failed to update payroll period"
            )
          },
          onError: () => {
            toast.error("Failed to update payroll period")
          },
        }
      )
    } else {
      // Create new period
      savePeriod(data, {
        onSuccess: (response) => {
          handleApiResponse(
            response,
            "Payroll period created successfully",
            "Failed to create payroll period"
          )
        },
        onError: () => {
          toast.error("Failed to create payroll period")
        },
      })
    }
  }

  const handleComponentSubmit = async (data: Partial<IPayrollComponent>) => {
    if (selectedComponent) {
      // Update existing component
      updateComponent(
        { ...data, payrollComponentId: selectedComponent.payrollComponentId },
        {
          onSuccess: (response) => {
            handleApiResponse(
              response,
              "Payroll component updated successfully",
              "Failed to update payroll component"
            )
          },
          onError: () => {
            toast.error("Failed to update payroll component")
          },
        }
      )
    } else {
      // Create new component
      saveComponent(data, {
        onSuccess: (response) => {
          handleApiResponse(
            response,
            "Payroll component created successfully",
            "Failed to create payroll component"
          )
        },
        onError: () => {
          toast.error("Failed to create payroll component")
        },
      })
    }
  }

  // Delete handlers
  const handleDeletePeriod = (periodId: string) => {
    setItemToDelete({ id: periodId, type: "period" })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteComponent = (componentId: string) => {
    setItemToDelete({ id: componentId, type: "component" })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "period") {
      deletePeriod(itemToDelete.id, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Payroll period deleted successfully")
            refetchPayrollPeriod()
          } else {
            toast.error(`Failed to delete payroll period: ${response.message}`)
          }
        },
        onError: () => {
          toast.error("Failed to delete payroll period")
        },
      })
    } else if (itemToDelete.type === "component") {
      deleteComponent(itemToDelete.id, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Payroll component deleted successfully")
            refetchPayrollComponent()
          } else {
            toast.error(
              `Failed to delete payroll component: ${response.message}`
            )
          }
        },
        onError: () => {
          toast.error("Failed to delete payroll component")
        },
      })
    }

    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  // Check permissions - allow view access even without create/edit/delete permissions
  if (
    !canCreatePeriod &&
    !canEditPeriod &&
    !canDeletePeriod &&
    !canCreateComponent &&
    !canEditComponent &&
    !canDeleteComponent
  ) {
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
              <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
              <TabsTrigger value="components">Payroll Components</TabsTrigger>
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
                payrollPeriodData={payrollPeriodData}
                payrollEmployeeData={payrollEmployeeData}
                payrollComponentData={payrollComponentData}
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
              <PayrollEmployeeTable
                data={payrollEmployeeData}
                onView={handleViewEmployee}
                onFilterChange={handleEmployeeFilterChange}
              />
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
          <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
          <TabsTrigger value="components">Payroll Components</TabsTrigger>
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
            payrollPeriodData={payrollPeriodData}
            payrollEmployeeData={payrollEmployeeData}
            payrollComponentData={dummyPayrollComponents}
            payrollTaxData={[]}
            payrollBankTransferData={[]}
          />
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Payroll Periods</h3>
              <p className="text-muted-foreground text-sm">
                Manage payroll periods and their status
              </p>
            </div>
            {canCreatePeriod && (
              <button
                onClick={handleCreatePeriod}
                className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Create Period
              </button>
            )}
          </div>
          <Separator />
          {payrollPeriodError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-4">
              <p className="text-sm">
                Failed to load payroll periods. Please try again.
              </p>
            </div>
          )}
          {isLoadingPayrollPeriod ? (
            <DataTableSkeleton columnCount={6} />
          ) : (
            <PayrollPeriodTable
              data={payrollPeriodData}
              onEdit={canEditPeriod ? handleEditPeriod : undefined}
              onDelete={canEditPeriod ? handleDeletePeriod : undefined}
              onView={handleViewPeriod}
              onFilterChange={handlePeriodFilterChange}
            />
          )}
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Payroll Components</h3>
              <p className="text-muted-foreground text-sm">
                Configure earnings and deductions components
              </p>
            </div>
            {canCreateComponent && (
              <button
                onClick={handleCreateComponent}
                className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Create Component
              </button>
            )}
          </div>
          <Separator />
          {payrollComponentError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-4">
              <p className="text-sm">
                Failed to load payroll components. Please try again.
              </p>
            </div>
          )}
          {isLoadingPayrollComponent ? (
            <DataTableSkeleton columnCount={8} />
          ) : (
            <PayrollComponentTable
              data={payrollComponentData}
              onEdit={canEditComponent ? handleEditComponent : undefined}
              onDelete={canEditComponent ? handleDeleteComponent : undefined}
              onView={handleViewComponent}
              onFilterChange={handleComponentFilterChange}
            />
          )}
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
          <PayrollEmployeeTable
            data={payrollEmployeeData}
            onView={handleViewEmployee}
            onFilterChange={handleEmployeeFilterChange}
          />
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

      {/* Dialogs */}
      <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPeriod ? "Edit Payroll Period" : "Create Payroll Period"}
            </DialogTitle>
            <DialogDescription>
              {selectedPeriod
                ? "Update the payroll period details"
                : "Create a new payroll period for salary processing"}
            </DialogDescription>
          </DialogHeader>
          <PayrollPeriodForm
            onSubmit={handlePeriodSubmit}
            initialData={selectedPeriod}
            onCancel={() => setIsPeriodDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isComponentDialogOpen}
        onOpenChange={setIsComponentDialogOpen}
      >
        <DialogContent
          className="max-h-[80vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedComponent
                ? "Edit Payroll Component"
                : "Create Payroll Component"}
            </DialogTitle>
            <DialogDescription>
              {selectedComponent
                ? "Update the payroll component details"
                : "Create a new payroll component for earnings or deductions"}
            </DialogDescription>
          </DialogHeader>
          <PayrollComponentForm
            onSubmit={handleComponentSubmit}
            initialData={selectedComponent}
            onCancel={() => setIsComponentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
    </div>
  )
}
