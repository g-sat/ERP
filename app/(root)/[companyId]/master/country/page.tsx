"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { ICountry, ICountryFilter } from "@/interfaces/country"
import { CountryFiltersValues, CountryFormValues } from "@/schemas/country"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Country } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetById,
  useSave,
  useUpdate,
} from "@/hooks/use-common-v1"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
// Import the CRUD hooks
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { CountryForm } from "./components/country-form"
import { CountriesTable } from "./components/country-table"

export default function CountryPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.country

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  // Fetch countries from the API using useGet
  const [filters, setFilters] = useState<ICountryFilter>({})

  // page.tsx
  const {
    data: countriesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ICountry>(`${Country.get}`, "countries", companyId, filters.search)

  // Destructure with fallback values
  const { result: countriesResult, data: countriesdata } =
    (countriesResponse as ApiResponse<ICountry>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = useSave<CountryFormValues>(
    `${Country.add}`,
    "countries",
    companyId
  )
  const updateMutation = useUpdate<CountryFormValues>(
    `${Country.add}`,
    "countries",
    companyId
  )
  const deleteMutation = useDelete(`${Country.delete}`, "countries", companyId)

  // State for modal and selected country
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCountry, setExistingCountry] = useState<ICountry | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    countryId: string | null
    countryName: string | null
  }>({
    isOpen: false,
    countryId: null,
    countryName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ICountry>(
    `${Country.getByCode}`,
    "countryByCode",
    companyId,
    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
  )

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new country
  const handleCreateCountry = () => {
    setModalMode("create")
    setSelectedCountry(null)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing a country
  const handleEditCountry = (country: ICountry) => {
    console.log("Edit Country:", country)
    setModalMode("edit")
    setSelectedCountry(country)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing a country
  const handleViewCountry = (country: ICountry | null) => {
    if (!country) return
    setModalMode("view")
    setSelectedCountry(country)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit)
  const handleFormSubmit = async (data: CountryFormValues) => {
    try {
      if (modalMode === "create") {
        // Create a new country using the save mutation with toast feedback
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ICountry>

        if (response.result === 1) {
          toast.success("Country created successfully")
          queryClient.invalidateQueries({ queryKey: ["countries"] }) // Triggers refetch
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create country")
        }
      } else if (modalMode === "edit" && selectedCountry) {
        // Update the selected country using the update mutation with toast feedback
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ICountry>

        if (response.result === 1) {
          toast.success("Country updated successfully")
          queryClient.invalidateQueries({ queryKey: ["countries"] }) // Triggers refetch
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update country")
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      // Handle API error response
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  // Handler for deleting a country
  const handleDeleteCountry = (countryId: string) => {
    const countryToDelete = countriesdata?.find(
      (c) => c.countryId.toString() === countryId
    )
    if (!countryToDelete) return

    // Open delete confirmation dialog with country details
    setDeleteConfirmation({
      isOpen: true,
      countryId,
      countryName: countryToDelete.countryName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.countryId) {
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.countryId), {
        loading: `Deleting ${deleteConfirmation.countryName}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["countries"] }) // Triggers refetch
          return `${deleteConfirmation.countryName} has been deleted`
        },
        error: "Failed to delete country",
      })
      setDeleteConfirmation({
        isOpen: false,
        countryId: null,
        countryName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = async (code: string) => {
    // Skip if:
    // 1. In edit mode
    // 2. In read-only mode
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    setCodeToCheck(trimmedCode)
    try {
      const response = await checkCodeAvailability()
      console.log("Full API Response:", response)

      // Check if response has data and it's not empty
      if (response?.data?.result === 1 && response.data.data) {
        console.log("Response data:", response.data.data)

        // Handle both array and single object responses
        const countryData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed countryData:", countryData)

        if (countryData) {
          // Ensure all required fields are present
          const validCountryData: ICountry = {
            countryId: countryData.countryId,
            countryCode: countryData.countryCode,
            countryName: countryData.countryName,
            phoneCode: countryData.phoneCode || "",
            companyId: countryData.companyId,
            remarks: countryData.remarks || "",
            isActive: countryData.isActive ?? true,
            createBy: countryData.createBy,
            editBy: countryData.editBy,
            createDate: countryData.createDate,
            editDate: countryData.editDate,
          }

          console.log("Setting existing country:", validCountryData)
          setExistingCountry(validCountryData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing country
  const handleLoadExistingCountry = () => {
    if (existingCountry) {
      // Log the data we're about to set
      console.log("About to load country data:", {
        existingCountry,
        currentModalMode: modalMode,
        currentSelectedCountry: selectedCountry,
      })

      // Set the states
      setModalMode("edit")
      setSelectedCountry(existingCountry)
      setShowLoadDialog(false)
      setExistingCountry(null)
    }
  }

  const queryClient = useQueryClient()

  // Add useEffect hooks to track state changes
  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedCountry) {
      console.log("Selected Country Updated:", {
        countryId: selectedCountry.countryId,
        countryCode: selectedCountry.countryCode,
        countryName: selectedCountry.countryName,
        // Log all other relevant fields
        fullObject: selectedCountry,
      })
    }
  }, [selectedCountry])

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
          <p className="text-muted-foreground text-sm">
            Manage country information and regional settings
          </p>
        </div>
      </div>

      {/* Countries Table */}
      {isLoading || isRefetching ? (
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : countriesResult ? (
        <CountriesTable
          data={countriesdata || []}
          isLoading={isLoading || isRefetching}
          onCountrySelect={handleViewCountry}
          onDeleteCountry={canDelete ? handleDeleteCountry : undefined}
          onEditCountry={canEdit ? handleEditCountry : undefined}
          onCreateCountry={handleCreateCountry}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest country data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
          companyId={companyId}
          // onFilterChange={(filters) => {
          //   toast.info("Filter applied", {
          //     description: `Search: ${filters.search || "none"}, Sort: ${filters.sortBy || "none"} ${filters.sortOrder || ""}`,
          //   })
          // }}
        />
      ) : (
        <div>No data available</div>
      )}

      {/* Modal for Create, Edit, and View */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Country"}
              {modalMode === "edit" && "Update Country"}
              {modalMode === "view" && "View Country"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new country to the system database."
                : modalMode === "edit"
                  ? "Update country information in the system database."
                  : "View country details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CountryForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedCountry
                : null
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Country Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCountry}
        onCancel={() => setExistingCountry(null)}
        code={existingCountry?.countryCode}
        name={existingCountry?.countryName}
        typeLabel="Country"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Country"
        description="This action cannot be undone. This will permanently delete the country from our servers."
        itemName={deleteConfirmation.countryName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            countryId: null,
            countryName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
