"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { ICustomerLookup, IPortLookup } from "@/interfaces/lookup"
import { ITariff, ITariffFilter } from "@/interfaces/tariff"
import {
  CopyIcon,
  CopyPlusIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common-v1"
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

import { TariffForm } from "./components/tariff-form"
import { TariffTable } from "./components/tariff-table"

interface FilterFormValues extends Record<string, unknown> {
  customerId: number
  portId: number
}

export default function TariffPage() {
  const params = useParams()
  const companyId = params.companyId as string

  // Form for filter controls
  const form = useForm<FilterFormValues>({
    defaultValues: {
      customerId: 0,
      portId: 0,
    },
  })

  // State for filters
  const [filters, setFilters] = useState<ITariffFilter>({})
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Fetch tariffs data from API
  const {
    data: tariffsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ITariff>(`gettariff`, "tariffs", companyId, filters.search)

  // Destructure with fallback values
  const { data: tariffsData } = tariffsResponse ?? { data: [] }

  // Define mutations for CRUD operations
  const saveMutation = useSave<ITariff>(`savetariff`, "tariffs", companyId)
  const updateMutation = useUpdate<ITariff>(`savetariff`, "tariffs", companyId)
  const deleteMutation = useDelete(`deletetariff`, "tariffs", companyId)

  // State for modal and selected tariff
  const [selectedTariff, setSelectedTariff] = useState<ITariff | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    tariffId: string | null
    tariffName: string | null
  }>({
    isOpen: false,
    tariffId: null,
    tariffName: null,
  })

  // Handler to search with current filters
  const handleSearch = () => {
    const formValues = form.getValues()
    setFilters({
      search: searchQuery,
      customer: formValues.customerId.toString(),
      port: formValues.portId.toString(),
    })
  }

  // Handler to clear filters
  const handleClear = () => {
    setSearchQuery("")
    form.reset()
    setFilters({})
  }

  // Handler to refresh data
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new tariff
  const handleCreateTariff = () => {
    setSelectedTariff(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  // Handler to edit a tariff
  const handleEditTariff = (tariff: ITariff) => {
    setSelectedTariff(tariff)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  // Handler to view a tariff
  const handleViewTariff = (tariff: ITariff) => {
    setSelectedTariff(tariff)
    setModalMode("view")
    setIsModalOpen(true)
  }

  // Handler to open delete confirmation
  const handleDeleteConfirmation = (tariffId: string, task: string) => {
    setDeleteConfirmation({
      isOpen: true,
      tariffId,
      tariffName: task,
    })
  }

  // Handler to delete a tariff
  const handleDeleteTariff = () => {
    if (deleteConfirmation.tariffId) {
      deleteMutation.mutate(deleteConfirmation.tariffId, {
        onSuccess: () => {
          setDeleteConfirmation({
            isOpen: false,
            tariffId: null,
            tariffName: null,
          })
          toast.success("Tariff deleted successfully")
          refetch()
        },
        onError: (error) => {
          console.error("Error deleting tariff:", error)
          toast.error("Failed to delete tariff")
        },
      })
    }
  }

  // Handler to save or update a tariff
  const handleSaveTariff = (data: ITariff) => {
    if (modalMode === "create") {
      saveMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false)
          toast.success("Tariff added successfully")
          refetch()
        },
        onError: (error) => {
          console.error("Error adding tariff:", error)
          toast.error("Failed to add tariff")
        },
      })
    } else if (modalMode === "edit" && selectedTariff?.tariffId) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false)
          toast.success("Tariff updated successfully")
          refetch()
        },
        onError: (error) => {
          console.error("Error updating tariff:", error)
          toast.error("Failed to update tariff")
        },
      })
    }
  }

  // Handle customer selection
  const handleCustomerChange = React.useCallback(
    (selectedCustomer: ICustomerLookup | null) => {
      // Additional logic when customer changes
      console.log("Selected customer:", selectedCustomer)
    },
    []
  )

  // Handle port selection
  const handlePortChange = React.useCallback(
    (selectedPort: IPortLookup | null) => {
      // Additional logic when port changes
      console.log("Selected port:", selectedPort)
    },
    []
  )

  // Handler for filter change from table component
  const handleFilterChange = (newFilters: ITariffFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const [activeCategory, setActiveCategory] = useState("portExpenses")

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }
  // Define categories with their corresponding counts and labels
  const categories = [
    {
      id: "portExpenses",
      label: "Port Expenses",
      count: 1,
      //count: data.filter((t) => t.category === "portExpenses").length,
    },
    { id: "launchServices", label: "Launch Services", count: 0 },
    { id: "equipmentUsed", label: "Equipment Used", count: 1 },
    { id: "crewSignOn", label: "Crew Sign On", count: 2 },
    { id: "crewSignOff", label: "Crew Sign Off", count: 2 },
    { id: "crewMiscellaneous", label: "Crew Miscellaneous", count: 2 },
    { id: "medicalAssistance", label: "Medical Assistance", count: 3 },
    { id: "consignmentImport", label: "Consignment Import", count: 15 },
    { id: "consignmentExport", label: "Consignment Export", count: 8 },
    { id: "thirdParty", label: "Third Party", count: 5 },
    { id: "freshWater", label: "Fresh Water", count: 3 },
    { id: "techniciansSurveyors", label: "Technicians & Surveyors", count: 7 },
    { id: "landingItems", label: "Landing Items", count: 4 },
    { id: "otherService", label: "Other Service", count: 6 },
    { id: "agencyRemuneration", label: "Agency Remuneration", count: 2 },
  ]

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Tariff</h1>
      {/* Filter controls moved from table component to main page */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {/* Customer filter */}
          <div className="flex flex-col gap-2">
            {/* Customer */}
            <CustomerAutocomplete
              form={form}
              name="customerId"
              label="Customer"
              isRequired={true}
              onChangeEvent={handleCustomerChange}
            />
          </div>

          {/* Port filter */}
          <div className="flex flex-col gap-2">
            {/* Customer */}
            <PortAutocomplete
              form={form}
              name="portId"
              label="Port"
              isRequired={true}
              onChangeEvent={handlePortChange}
            />
          </div>

          <Button onClick={handleSearch}>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <XIcon className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCcwIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              title="Add Tariff"
              size={"icon"}
              onClick={handleCreateTariff}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              title="Copy Tariff Customer to Customer"
              size={"icon"}
              onClick={() => {}}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              title="Copy Tariff Company to Company"
              size={"icon"}
              onClick={() => {}}
            >
              <CopyPlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Category tabs */}
        <Tabs
          defaultValue="portExpenses"
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <div className="overflow-x-auto">
            <TabsList className="flex h-10 w-max">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 px-4 py-2 whitespace-nowrap transition-colors"
                >
                  {category.label}
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white",
                      category.id === "portExpenses" && "bg-[#673AB7]",
                      category.id === "launchServices" &&
                        "bg-gray-200 text-gray-600",
                      category.id === "equipmentUsed" && "bg-orange-500",
                      category.id === "crewSignOn" && "bg-green-600",
                      category.id === "crewSignOff" && "bg-red-600",
                      category.id === "crewMiscellaneous" && "bg-teal-500",
                      category.id === "medicalAssistance" && "bg-yellow-400",
                      category.id === "consignmentImport" && "bg-orange-500",
                      category.id === "consignmentExport" && "bg-blue-500",
                      category.id === "thirdParty" && "bg-purple-500",
                      category.id === "freshWater" && "bg-cyan-500",
                      category.id === "techniciansSurveyors" && "bg-indigo-500",
                      category.id === "landingItems" && "bg-emerald-500",
                      category.id === "otherService" && "bg-rose-500",
                      category.id === "agencyRemuneration" && "bg-amber-500"
                    )}
                  >
                    {category.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {isLoading || isRefetching ? (
        <DataTableSkeleton columnCount={8} rowCount={10} />
      ) : (
        <TariffTable
          data={tariffsData || []}
          isLoading={isLoading || isRefetching}
          onTariffSelect={handleViewTariff}
          onDeleteTariff={handleDeleteConfirmation}
          onEditTariff={handleEditTariff}
          onCreateTariff={handleCreateTariff}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          companyId={companyId}
        />
      )}

      {/* Tariff Modal using Drawer for right-side panel */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[750px]">
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

          <div className="py-4">
            <TariffForm
              tariff={selectedTariff}
              onSave={handleSaveTariff}
              mode={modalMode}
            />
          </div>
        </DialogContent>
      </Dialog>

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
