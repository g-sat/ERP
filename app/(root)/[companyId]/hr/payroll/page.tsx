"use client"

import { useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IPayrollComponent,
  IPayrollComponentFilter,
  IPayrollComponentGLMapping,
  IPayrollComponentGroup,
  IPayrollEmployee,
  IPayrollPeriod,
  IPayrollPeriodFilter,
} from "@/interfaces/payroll"
import {
  PayrollComponentGLMappingFormData,
  PayrollComponentGroupFormData,
} from "@/schemas/payroll"
import { toast } from "sonner"

import {
  PayrollComponent,
  PayrollComponentGLMapping,
  PayrollComponentGroup,
  PayrollEmployee,
  PayrollPeriod,
} from "@/lib/api-routes"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
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
import { PayrollAccountIntegrationForm } from "./components/payroll-account-integration-form"
import { PayrollAccountIntegrationTable } from "./components/payroll-account-integration-table"
import { PayrollCalculation } from "./components/payroll-calculation"
import { PayrollComponentForm } from "./components/payroll-component-form"
import { PayrollComponentGroupForm } from "./components/payroll-component-group-form"
import { PayrollComponentGroupTable } from "./components/payroll-component-group-table"
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
  const [employeeFilters, setEmployeeFilters] = useState<{ search?: string }>(
    {}
  )
  const [accountIntegrationFilters, setAccountIntegrationFilters] = useState<{
    search?: string
    companyId?: number
  }>({})

  // Account Integration state
  const [isAccountIntegrationFormOpen, setIsAccountIntegrationFormOpen] =
    useState(false)
  const [editingAccountIntegration, setEditingAccountIntegration] =
    useState<IPayrollComponentGLMapping | null>(null)

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

  const {
    data: payrollComponentGroupResponse,
    refetch: refetchPayrollComponentGroup,
    isLoading: isLoadingPayrollComponentGroup,
    error: payrollComponentGroupError,
  } = useGet<IPayrollComponentGroup>(
    `${PayrollComponentGroup.get}`,
    "payrollcomponentgroup",
    componentFilters.search
  )

  const {
    data: payrollComponentGLMappingResponse,
    refetch: refetchPayrollComponentGLMapping,
    isLoading: isLoadingPayrollComponentGLMapping,
    error: payrollComponentGLMappingError,
  } = useGet<IPayrollComponentGLMapping>(
    `${PayrollComponentGLMapping.get}`,
    "payrollcomponentglmapping",
    accountIntegrationFilters.search
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
  const payrollPeriodData =
    (payrollPeriodResponse as ApiResponse<IPayrollPeriod>)?.data || []
  const payrollComponentData =
    (payrollComponentResponse as ApiResponse<IPayrollComponent>)?.data || []
  const payrollComponentGroupData =
    (payrollComponentGroupResponse as ApiResponse<IPayrollComponentGroup>)
      ?.data || []

  const payrollComponentGLMappingData =
    (
      payrollComponentGLMappingResponse as ApiResponse<IPayrollComponentGLMapping>
    )?.data || []
  const payrollEmployeeData =
    (payrollEmployeeResponse as ApiResponse<IPayrollEmployee>)?.data || []

  // State for dialogs
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isComponentGroupDialogOpen, setIsComponentGroupDialogOpen] =
    useState(false)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // State for selected items
  const [selectedPeriod, setSelectedPeriod] = useState<
    IPayrollPeriod | undefined
  >()
  const [selectedComponent, setSelectedComponent] = useState<
    IPayrollComponent | undefined
  >()
  const [selectedComponentGroupId, setSelectedComponentGroupId] = useState<
    string | undefined
  >()
  const [selectedEmployee, setSelectedEmployee] = useState<
    IPayrollEmployee | undefined
  >()
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    type: string
  } | null>(null)

  // Get component group by ID for editing
  const { data: selectedComponentGroupResponse } =
    useGetById<IPayrollComponentGroup>(
      `${PayrollComponentGroup.getById}`,
      "selectedComponentGroup",
      selectedComponentGroupId || ""
    )

  console.log("selectedComponentGroupResponse", selectedComponentGroupResponse)

  // Extract selected component group data from byId response
  const selectedComponentGroupData = (
    selectedComponentGroupResponse as ApiResponse<IPayrollComponentGroup>
  )?.data?.[0]

  console.log("selectedComponentGroupData", selectedComponentGroupData)

  // Extract component group details from the selected component group
  const selectedComponentGroupDataDetails =
    selectedComponentGroupData?.data_details || []

  console.log(
    "selectedComponentGroupDataDetails",
    selectedComponentGroupDataDetails
  )

  // Mutations using use-common hooks
  const { mutate: savePeriod } = usePersist<IPayrollPeriod>(PayrollPeriod.add)
  const { mutate: updatePeriod } = usePersist<IPayrollPeriod>(
    PayrollPeriod.update
  )
  const { mutate: deletePeriod } = useDelete(PayrollPeriod.delete)

  const { mutate: saveComponent } = usePersist<IPayrollComponent>(
    PayrollComponent.add
  )
  const { mutate: updateComponent } = usePersist<IPayrollComponent>(
    PayrollComponent.update
  )
  const { mutate: deleteComponent } = useDelete(PayrollComponent.delete)

  const { mutate: saveComponentGroup } =
    usePersist<PayrollComponentGroupFormData>(PayrollComponentGroup.add)
  const { mutate: updateComponentGroup } =
    usePersist<PayrollComponentGroupFormData>(PayrollComponentGroup.update)
  const { mutate: deleteComponentGroup } = useDelete(
    PayrollComponentGroup.delete
  )

  const { mutate: saveAccountIntegration } =
    usePersist<PayrollComponentGLMappingFormData>(PayrollComponentGLMapping.add)
  const { mutate: updateAccountIntegration } =
    usePersist<PayrollComponentGLMappingFormData>(
      PayrollComponentGLMapping.update
    )
  const { mutate: deleteAccountIntegration } = useDelete(
    PayrollComponentGLMapping.delete
  )

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

  // Handlers for Payroll Component Group
  const handleCreateComponentGroup = () => {
    setSelectedComponentGroupId(undefined)
    setIsComponentGroupDialogOpen(true)
  }

  const handleEditComponentGroup = (group: IPayrollComponentGroup) => {
    setSelectedComponentGroupId(group.componentGroupId.toString())
    setIsComponentGroupDialogOpen(true)
  }

  // Filter handlers
  const handlePeriodFilterChange = (filters: IPayrollPeriodFilter) => {
    setPeriodFilters(filters)
  }

  const handleComponentFilterChange = (filters: IPayrollComponentFilter) => {
    setComponentFilters(filters)
  }

  const handleEmployeeFilterChange = (filters: { search?: string }) => {
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
      refetchPayrollComponentGroup()
      refetchPayrollEmployee()
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

  const handleComponentGroupSubmit = async (
    data: PayrollComponentGroupFormData
  ) => {
    if (selectedComponentGroupData) {
      // Update existing component group
      updateComponentGroup(
        {
          ...data,
        },
        {
          onSuccess: (response) => {
            if (response.result === 1) {
              toast.success("Component group updated successfully")
              setIsComponentGroupDialogOpen(false)
              refetchPayrollComponentGroup()
            } else {
              toast.error(
                `Failed to update component group: ${response.message}`
              )
            }
          },
          onError: () => {
            toast.error("Failed to update component group")
          },
        }
      )
    } else {
      // Create new component group
      saveComponentGroup(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Component group created successfully")
            setIsComponentGroupDialogOpen(false)
            refetchPayrollComponentGroup()
          } else {
            toast.error(`Failed to create component group: ${response.message}`)
          }
        },
        onError: () => {
          toast.error("Failed to create component group")
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

  const handleDeleteComponentGroup = (group: IPayrollComponentGroup) => {
    setItemToDelete({
      id: group.componentGroupId.toString(),
      type: "componentGroup",
    })
    setIsDeleteDialogOpen(true)
  }

  const handleAccountIntegrationSubmit = async (
    data: PayrollComponentGLMappingFormData
  ) => {
    console.log("Parent handleAccountIntegrationSubmit called with:", data)
    try {
      if (data.mappingId && data.mappingId > 0) {
        // Update existing mapping
        updateAccountIntegration(data, {
          onSuccess: (response) => {
            if (response.result === 1) {
              refetchPayrollComponentGLMapping()
            }
          },
          onError: () => {
            toast.error("Failed to update account integration mapping")
          },
        })
      } else {
        // Create new mapping
        saveAccountIntegration(data, {
          onSuccess: (response) => {
            if (response.result === 1) {
              refetchPayrollComponentGLMapping()
            }
          },
          onError: () => {
            toast.error("Failed to create account integration mapping")
          },
        })
      }
    } catch (error) {
      console.error("Error in account integration submit:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const handleDeleteAccountIntegration = (
    mapping: IPayrollComponentGLMapping
  ) => {
    setItemToDelete({
      id: mapping.mappingId.toString(),
      type: "accountIntegration",
    })
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
    } else if (itemToDelete.type === "componentGroup") {
      deleteComponentGroup(itemToDelete.id, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Component group deleted successfully")
            refetchPayrollComponentGroup()
          } else {
            toast.error(`Failed to delete component group: ${response.message}`)
          }
        },
        onError: () => {
          toast.error("Failed to delete component group")
        },
      })
    } else if (itemToDelete.type === "accountIntegration") {
      deleteAccountIntegration(itemToDelete.id, {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Account integration mapping deleted successfully")
            refetchPayrollComponentGLMapping()
          } else {
            toast.error(
              `Failed to delete account integration mapping: ${response.message}`
            )
          }
        },
        onError: () => {
          toast.error("Failed to delete account integration mapping")
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
              onRefresh={refetchPayrollPeriod}
            />
          )}
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Tabs defaultValue="components-list" className="w-full">
            <TabsList>
              <TabsTrigger value="components-list">Components</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="account-integration">
                Account Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components-list" className="space-y-4">
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
                  onDelete={
                    canEditComponent ? handleDeleteComponent : undefined
                  }
                  onView={handleViewComponent}
                  onFilterChange={handleComponentFilterChange}
                  onRefresh={refetchPayrollComponent}
                />
              )}
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Component Groups</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage payroll component groups and their configurations
                  </p>
                </div>
                <button
                  onClick={handleCreateComponentGroup}
                  className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Create Group
                </button>
              </div>
              <Separator />
              {payrollComponentGroupError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-4">
                  <p className="text-sm">
                    Failed to load payroll component groups. Please try again.
                  </p>
                </div>
              )}
              {isLoadingPayrollComponentGroup ? (
                <DataTableSkeleton columnCount={6} />
              ) : (
                <PayrollComponentGroupTable
                  data={payrollComponentGroupData}
                  onEdit={handleEditComponentGroup}
                  onDelete={handleDeleteComponentGroup}
                  onRefresh={refetchPayrollComponentGroup}
                />
              )}
            </TabsContent>

            <TabsContent value="account-integration" className="space-y-4">
              <PayrollAccountIntegrationTable
                mappings={payrollComponentGLMappingData}
                onView={(mapping) => console.log("View mapping:", mapping)}
                onEdit={(mapping) => {
                  setEditingAccountIntegration(mapping)
                  setIsAccountIntegrationFormOpen(true)
                }}
                onDelete={handleDeleteAccountIntegration}
                onCreate={() => {
                  setEditingAccountIntegration(null)
                  setIsAccountIntegrationFormOpen(true)
                }}
                onRefresh={refetchPayrollComponentGLMapping}
              />
            </TabsContent>
          </Tabs>
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

      <Dialog
        open={isComponentGroupDialogOpen}
        onOpenChange={setIsComponentGroupDialogOpen}
      >
        <DialogContent
          className="max-h-[80vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedComponentGroupData
                ? "Edit Component Group"
                : "Create Component Group"}
            </DialogTitle>
            <DialogDescription>
              {selectedComponentGroupData
                ? "Update the component group details"
                : "Create a new component group and select components"}
            </DialogDescription>
          </DialogHeader>
          <PayrollComponentGroupForm
            onSubmit={handleComponentGroupSubmit}
            onCancel={() => setIsComponentGroupDialogOpen(false)}
            initialData={selectedComponentGroupData || undefined}
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

      {/* Account Integration Form Dialog */}
      <PayrollAccountIntegrationForm
        isOpen={isAccountIntegrationFormOpen}
        onOpenChange={setIsAccountIntegrationFormOpen}
        editingMapping={editingAccountIntegration}
        onSubmit={handleAccountIntegrationSubmit}
        onCancel={() => {
          setIsAccountIntegrationFormOpen(false)
          setEditingAccountIntegration(null)
        }}
      />
    </div>
  )
}
