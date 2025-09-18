"use client"

import { useCallback, useEffect, useState } from "react"
import { ITaskDetails } from "@/interfaces/checklist"
import { ICustomerLookup, IPortLookup } from "@/interfaces/lookup"
import { ITariff } from "@/interfaces/tariff"
import {
  BuildingIcon,
  CopyIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Task } from "@/lib/operations-utils"
import {
  deleteTariffDirect,
  saveTariffDirect,
  updateTariffDirect,
  useGetTariffByTask,
  useGetTariffCount,
} from "@/hooks/use-tariff"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import CustomerAutocomplete from "@/components/ui-custom/autocomplete-customer"
import PortAutocomplete from "@/components/ui-custom/autocomplete-port"

import { CopyCompanyRateForm } from "./components/copy-company-rate-form"
import { CopyRateForm } from "./components/copy-rate-form"
import { TariffForm } from "./components/tariff-form"
import { TariffTable } from "./components/tariff-table"

interface FilterFormValues extends Record<string, unknown> {
  customerId: number
  portId: number
}

// Define category mapping with Task enum values
const CATEGORY_CONFIG: Record<
  string,
  { id: string; label: string; taskId: Task | number }
> = {
  portExpenses: {
    id: "portExpenses",
    label: "Port Expenses",
    taskId: Task.PortExpenses,
  },
  launchServices: {
    id: "launchServices",
    label: "Launch Services",
    taskId: Task.LaunchServices,
  },
  equipmentUsed: {
    id: "equipmentUsed",
    label: "Equipment Used",
    taskId: Task.EquipmentUsed,
  },
  crewSignOn: {
    id: "crewSignOn",
    label: "Crew Sign On",
    taskId: Task.CrewSignOn,
  },
  crewSignOff: {
    id: "crewSignOff",
    label: "Crew Sign Off",
    taskId: Task.CrewSignOff,
  },
  crewMiscellaneous: {
    id: "crewMiscellaneous",
    label: "Crew Miscellaneous",
    taskId: Task.CrewMiscellaneous,
  },
  medicalAssistance: {
    id: "medicalAssistance",
    label: "Medical Assistance",
    taskId: Task.MedicalAssistance,
  },
  consignmentImport: {
    id: "consignmentImport",
    label: "Consignment Import",
    taskId: Task.ConsignmentImport,
  },
  consignmentExport: {
    id: "consignmentExport",
    label: "Consignment Export",
    taskId: Task.ConsignmentExport,
  },
  thirdParty: {
    id: "thirdParty",
    label: "Third Party",
    taskId: Task.ThirdParty,
  },
  freshWater: {
    id: "freshWater",
    label: "Fresh Water",
    taskId: Task.FreshWater,
  },
  techniciansSurveyors: {
    id: "techniciansSurveyors",
    label: "Technicians & Surveyors",
    taskId: Task.TechniciansSurveyors,
  },
  landingItems: {
    id: "landingItems",
    label: "Landing Items",
    taskId: Task.LandingItems,
  },
  otherService: {
    id: "otherService",
    label: "Other Service",
    taskId: Task.OtherService,
  },
  agencyRemuneration: {
    id: "agencyRemuneration",
    label: "Agency Remuneration",
    taskId: Task.AgencyRemuneration,
  },
  visaService: {
    id: "visaService",
    label: "Visa Service",
    taskId: Task.VisaService,
  },
}

export default function TariffPage() {
  // Form for filter controls
  const form = useForm<FilterFormValues>({
    defaultValues: {
      customerId: 0,
      portId: 0,
    },
  })

  // Watch form values for conditional rendering
  const watchedCustomerId = form.watch("customerId")
  // const watchedPortId = form.watch("portId")

  // State management
  const [hasSearched, setHasSearched] = useState(false)
  const [activeCategory, setActiveCategory] = useState("portExpenses")
  const [currentTaskId, setCurrentTaskId] = useState(
    CATEGORY_CONFIG.portExpenses?.taskId || Task.PortExpenses
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isTabLoading, setIsTabLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // API parameters state
  const [apiParams, setApiParams] = useState<{
    customerId: number
    portId: number
  }>({
    customerId: 0,
    portId: 0,
  })

  // Tariff count API call using api-client.ts
  const {
    data: tariffCountResponse,
    refetch: refetchTariffCount,
    isLoading: isLoadingCount,
    error: tariffCountError,
  } = useGetTariffCount(apiParams.customerId, apiParams.portId)
  // Category-specific API calls using api-client.ts
  const {
    data: tariffByTaskResponse,
    refetch: refetchTariffByTask,
    isLoading: isLoadingTariffByTask,
    error: tariffByTaskError,
  } = useGetTariffByTask(
    apiParams.customerId,
    apiParams.portId,
    currentTaskId,
    hasSearched
  )

  // Direct API functions using api-client.ts for CRUD operations

  // Modal and selected tariff state
  const [selectedTariff, setSelectedTariff] = useState<ITariff | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [hasFormErrors, setHasFormErrors] = useState(false)

  // Copy forms state
  const [showCopyRateForm, setShowCopyRateForm] = useState(false)
  const [showCopyCompanyRateForm, setShowCopyCompanyRateForm] = useState(false)

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    tariffId: string | null
    tariffName: string | null
  }>({
    isOpen: false,
    tariffId: null,
    tariffName: null,
  })

  // Handle API errors
  useEffect(() => {
    if (tariffCountError) {
      console.error("Error fetching tariff count:", tariffCountError)
    }
    if (tariffByTaskError) {
      console.error("Error fetching tariff by task:", tariffByTaskError)
    }
  }, [tariffCountError, tariffByTaskError])

  // Handle both array and single object responses
  const rawTariffCountData = tariffCountResponse?.data
  const tariffCountData = rawTariffCountData
    ? Array.isArray(rawTariffCountData)
      ? rawTariffCountData[0]
      : (rawTariffCountData as ITaskDetails)
    : undefined

  // Process category-specific tariff data
  const rawTariffByTaskData = tariffByTaskResponse?.data
  const tariffByTaskData = rawTariffByTaskData
    ? Array.isArray(rawTariffByTaskData)
      ? rawTariffByTaskData
      : [rawTariffByTaskData]
    : []

  // Sequential API call handler
  const handleSearch = useCallback(async () => {
    const formValues = form.getValues()

    if (formValues.customerId === 0) {
      toast.error("Please select a customer first")
      return
    }

    setIsSearching(true)

    try {
      // Update API parameters
      const newApiParams = {
        customerId: formValues.customerId,
        portId: formValues.portId,
      }

      setApiParams(newApiParams)
      setHasSearched(true)

      // Wait for state to update, then trigger API calls
      setTimeout(async () => {
        try {
          await refetchTariffCount()
          await refetchTariffByTask()
          toast.success("Search completed successfully")
        } catch {
          toast.error("Failed to fetch tariff data")
        }
      }, 100)
    } catch {
      toast.error("Failed to fetch tariff data")
    } finally {
      setIsSearching(false)
    }
  }, [form, refetchTariffCount, refetchTariffByTask])

  // Handle category change - Only call task API, not count API
  const handleCategoryChange = useCallback(
    async (category: string) => {
      const taskId = CATEGORY_CONFIG[category]?.taskId

      // Update the active category and taskId first
      setActiveCategory(category)
      setCurrentTaskId(taskId || Task.PortExpenses)

      // Only proceed if we have valid search parameters
      if (mounted && hasSearched && apiParams.customerId > 0) {
        // Set tab loading state
        setIsTabLoading(true)

        // Show loading toast for better UX
        toast.info(
          `Loading ${CATEGORY_CONFIG[category]?.label || category} data...`
        )

        try {
          // Wait a bit for state to update, then call only the task API
          setTimeout(async () => {
            try {
              await refetchTariffByTask()
              toast.success(
                `${CATEGORY_CONFIG[category]?.label || category} data loaded successfully`
              )
            } catch {
              toast.error(
                `Failed to load ${CATEGORY_CONFIG[category]?.label || category} data`
              )
            } finally {
              setIsTabLoading(false)
            }
          }, 100)
        } catch {
          toast.error(
            `Failed to load ${CATEGORY_CONFIG[category]?.label || category} data`
          )
          setIsTabLoading(false)
        }
      } else {
        // Cannot load data: missing required parameters
      }
    },
    [mounted, hasSearched, apiParams.customerId, refetchTariffByTask]
  )

  // Clear filters handler
  const handleClear = () => {
    form.reset()
    setHasSearched(false)
    setApiParams({ customerId: 0, portId: 0 })
    setActiveCategory("portExpenses")
    setCurrentTaskId(CATEGORY_CONFIG.portExpenses?.taskId || Task.PortExpenses)
  }

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (apiParams.customerId > 0 && hasSearched) {
      // Set loading state
      setIsTabLoading(true)

      // Use Promise.all to ensure both API calls complete
      Promise.all([refetchTariffCount(), refetchTariffByTask()])
        .then(() => {
          toast.success("Data refreshed successfully")
        })
        .catch(() => {
          toast.error("Failed to refresh data")
        })
        .finally(() => {
          setIsTabLoading(false)
        })
    } else {
      toast.error(
        "Please select customer and port, then search before refreshing"
      )
    }
  }, [
    apiParams.customerId,
    hasSearched,
    refetchTariffCount,
    refetchTariffByTask,
  ])

  // CRUD handlers
  const handleCreateTariff = () => {
    setSelectedTariff(undefined)
    setModalMode("create")
    setHasFormErrors(false) // Reset form errors when creating new tariff
    setIsModalOpen(true)
  }

  const handleEditTariff = (tariff: ITariff) => {
    setSelectedTariff(tariff)
    setModalMode("edit")
    setHasFormErrors(false) // Reset form errors when editing tariff
    setIsModalOpen(true)
  }

  const handleDeleteConfirmation = (tariffId: string, task: string) => {
    setDeleteConfirmation({
      isOpen: true,
      tariffId,
      tariffName: task,
    })
  }

  const handleDeleteTariff = async () => {
    if (deleteConfirmation.tariffId) {
      try {
        const response = await deleteTariffDirect(deleteConfirmation.tariffId)
        if (response?.result === 1) {
          setDeleteConfirmation({
            isOpen: false,
            tariffId: null,
            tariffName: null,
          })
          toast.success(response.message || "Tariff deleted successfully")
          refetchTariffByTask()
        } else {
          const errorMessage = response?.message || "Failed to delete tariff"
          toast.error(errorMessage)
        }
      } catch (error) {
        console.error("Error deleting tariff:", error)
        toast.error("Failed to delete tariff")
      }
    }
  }

  const handleSaveTariff = async (data: ITariff) => {
    const tariffData = {
      ...data,
    }

    try {
      if (modalMode === "create") {
        const response = await saveTariffDirect(tariffData)
        if (response?.result === 1) {
          setIsModalOpen(false)
          toast.success(response.message || "Tariff added successfully")
          refetchTariffByTask()
        } else {
          const errorMessage = response?.message || "Failed to add tariff"
          toast.error(errorMessage)
        }
      } else if (modalMode === "edit" && selectedTariff?.tariffId) {
        const response = await updateTariffDirect(tariffData)
        if (response?.result === 1) {
          setIsModalOpen(false)
          toast.success(response.message || "Tariff updated successfully")
          refetchTariffByTask()
        } else {
          const errorMessage = response?.message || "Failed to update tariff"
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error("Error saving tariff:", error)
      toast.error("Failed to save tariff")
    }
  }

  // Customer and Port change handlers
  const handleCustomerChange = useCallback(
    (selectedCustomer: ICustomerLookup | null) => {
      if (selectedCustomer) {
        form.setValue("customerId", selectedCustomer.customerId || 0)
      } else {
        form.setValue("customerId", 0)
      }
      // Reset search state when customer changes
      setHasSearched(false)
    },
    [form]
  )

  const handlePortChange = useCallback(
    (selectedPort: IPortLookup | null) => {
      if (selectedPort) {
        form.setValue("portId", selectedPort.portId || 0)
      } else {
        form.setValue("portId", 0)
      }
      // Reset search state when port changes
      setHasSearched(false)
    },
    [form]
  )

  // Generate categories with counts using ITaskDetails structure
  const categories = Object.values(CATEGORY_CONFIG).map((config) => {
    let count = 0

    // Only calculate counts if mounted and we have data
    if (mounted && tariffCountData && typeof tariffCountData === "object") {
      // Map task IDs to ITaskDetails properties
      const taskCountMap: Record<number, keyof ITaskDetails> = {
        [Task.PortExpenses]: "portExpense",
        [Task.LaunchServices]: "launchService",
        [Task.EquipmentUsed]: "equipmentUsed",
        [Task.CrewSignOn]: "crewSignOn",
        [Task.CrewSignOff]: "crewSignOff",
        [Task.CrewMiscellaneous]: "crewMiscellaneous",
        [Task.MedicalAssistance]: "medicalAssistance",
        [Task.ConsignmentImport]: "consignmentImport",
        [Task.ConsignmentExport]: "consignmentExport",
        [Task.ThirdParty]: "thirdParty",
        [Task.FreshWater]: "freshWater",
        [Task.TechniciansSurveyors]: "technicianSurveyor",
        [Task.LandingItems]: "landingItems",
        [Task.OtherService]: "otherService",
        [Task.AgencyRemuneration]: "agencyRemuneration",
        [Task.VisaService]: "visaService",
      }

      const propertyName = taskCountMap[config.taskId as number]
      if (propertyName && propertyName in tariffCountData) {
        count = (tariffCountData as ITaskDetails)[propertyName] || 0
      }
    }

    return {
      ...config,
      count,
    }
  })

  // Determine loading state
  const isLoading =
    isLoadingCount || isLoadingTariffByTask || isSearching || isTabLoading

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Tariff Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage tariff rates and configurations
          </p>
        </div>

        {/* Top right action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCopyRateForm(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title="Copy Rates"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowCopyCompanyRateForm(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title="Copy Company Rates"
          >
            <BuildingIcon className="h-4 w-4" />
          </Button>
          {watchedCustomerId > 0 && (
            <Button
              onClick={handleCreateTariff}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Tariff
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-card mb-3 rounded-lg border p-4">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
          {/* Customer Selection */}
          <div>
            <CustomerAutocomplete
              form={form}
              name="customerId"
              label="Customer"
              isRequired={true}
              onChangeEvent={handleCustomerChange}
            />
          </div>

          {/* Port Selection */}
          <div>
            <PortAutocomplete
              form={form}
              name="portId"
              label="Port"
              onChangeEvent={handlePortChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Search Button - Only show when customer is selected */}
            {watchedCustomerId > 0 && (
              <Button
                onClick={handleSearch}
                disabled={isSearching || watchedCustomerId === 0}
                className="flex items-center gap-2"
              >
                <SearchIcon className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <XIcon className="h-4 w-4" />
              Clear
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={!hasSearched || isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCcwIcon
                className={`h-4 w-4 ${isTabLoading ? "animate-spin" : ""}`}
              />
              {isTabLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {mounted && hasSearched && (
        <Tabs
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="mb-6"
        >
          <div className="overflow-x-auto">
            <TabsList className="touch-target flex h-14 w-max">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-fluid-xs relative flex items-center space-x-2 px-4 py-2"
                  disabled={isTabLoading && activeCategory === category.id}
                >
                  {category.label}
                  {isTabLoading && activeCategory === category.id && (
                    <RefreshCcwIcon className="h-3 w-3 animate-spin" />
                  )}
                  <Badge
                    variant={
                      isLoading ||
                      (isTabLoading && activeCategory === category.id)
                        ? "secondary"
                        : category.count && category.count > 0
                          ? "destructive"
                          : "outline"
                    }
                    className="text-fluid-xs font-medium"
                  >
                    {isLoading ||
                    (isTabLoading && activeCategory === category.id)
                      ? "..."
                      : category.count || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      {/* Placeholder for tabs during SSR */}
      {!mounted && hasSearched && (
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex h-14 w-max">
              {Object.values(CATEGORY_CONFIG).map((category) => (
                <div
                  key={category.id}
                  className="relative flex items-center space-x-2 px-4 py-2"
                >
                  {category.label}
                  <Badge variant="outline" className="text-xs font-medium">
                    0
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {mounted && (
        <>
          {isLoading ? (
            <DataTableSkeleton columnCount={8} rowCount={10} />
          ) : tariffCountError || tariffByTaskError ? (
            <div className="flex items-center justify-center p-8 text-red-600">
              <p>Error loading tariff data. Please try refreshing the page.</p>
            </div>
          ) : hasSearched ? (
            <TariffTable
              data={(tariffByTaskData as ITariff[]) || []}
              isLoading={isLoading}
              onDeleteTariff={handleDeleteConfirmation}
              onEditTariff={handleEditTariff}
              onRefresh={() => {
                handleRefresh()
              }}
            />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p>Select a customer and click Search to view tariffs</p>
            </div>
          )}
        </>
      )}

      {/* Placeholder for data table during SSR */}
      {!mounted && hasSearched && (
        <DataTableSkeleton columnCount={8} rowCount={10} />
      )}

      {/* Tariff Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open && hasFormErrors) {
            toast.error("Please fix form errors before closing")
            return
          }
          setIsModalOpen(open)
        }}
      >
        <DialogContent
          className="max-h-[70vh] w-[80vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            if (hasFormErrors) {
              e.preventDefault()
              toast.error("Please fix form errors before closing")
              return
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create"
                ? "Add Tariff"
                : modalMode === "edit"
                  ? "Edit Tariff"
                  : "Tariff Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new tariff to the system."
                : modalMode === "edit"
                  ? "Edit the tariff details."
                  : "View tariff details."}
            </DialogDescription>
          </DialogHeader>
          <TariffForm
            tariff={selectedTariff}
            onSave={handleSaveTariff}
            onClose={() => setIsModalOpen(false)}
            mode={modalMode}
            customerId={watchedCustomerId || apiParams.customerId}
            portId={apiParams.portId}
            taskId={
              CATEGORY_CONFIG[activeCategory]?.taskId || Task.PortExpenses
            }
            onValidationError={setHasFormErrors}
          />
        </DialogContent>
      </Dialog>

      {/* Copy Rate Form */}
      {showCopyRateForm && (
        <Dialog open={showCopyRateForm} onOpenChange={setShowCopyRateForm}>
          <DialogContent
            className="max-h-[70vh] w-[80vw] !max-w-none overflow-y-auto"
            onPointerDownOutside={(e) => {
              if (hasFormErrors) {
                e.preventDefault()
                toast.error("Please fix form errors before closing")
                return
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Copy Rates</DialogTitle>
              <DialogDescription>
                Copy rates between customers
              </DialogDescription>
            </DialogHeader>
            <CopyRateForm onClose={() => setShowCopyRateForm(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Copy Company Rate Form */}
      {showCopyCompanyRateForm && (
        <Dialog
          open={showCopyCompanyRateForm}
          onOpenChange={setShowCopyCompanyRateForm}
        >
          <DialogContent
            className="max-h-[70vh] w-[80vw] !max-w-none overflow-y-auto"
            onPointerDownOutside={(e) => {
              if (hasFormErrors) {
                e.preventDefault()
                toast.error("Please fix form errors before closing")
                return
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Copy Company Rates</DialogTitle>
              <DialogDescription>
                Copy rates between companies
              </DialogDescription>
            </DialogHeader>
            <CopyCompanyRateForm
              onClose={() => setShowCopyCompanyRateForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={() =>
          setDeleteConfirmation({
            isOpen: false,
            tariffId: null,
            tariffName: null,
          })
        }
        onConfirm={handleDeleteTariff}
        title="Delete Tariff"
        description={`Are you sure you want to delete the tariff "${deleteConfirmation.tariffName}"? This action cannot be undone.`}
      />
    </div>
  )
}
