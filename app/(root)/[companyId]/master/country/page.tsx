"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ICountry } from "@/interfaces/country"
import { CountrySchemaType } from "@/schemas/country"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Country } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
// Import the CRUD hooks
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { CountryForm } from "./components/country-form"
import { CountriesTable } from "./components/country-table"

export default function CountryPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.country

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  // Fetch countries from the API using useGet
  const [filters, setFilters] = useState<{
    search?: string
    sortOrder?: string
  }>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters)
    },
    []
  )

  // page.tsx
  const {
    data: countriesResponse,
    refetch,
    isLoading,
  } = useGet<ICountry>(`${Country.get}`, "countries", filters.search)

  // Destructure with fallback values
  const { result: countriesResult, data: countriesdata } =
    (countriesResponse as ApiResponse<ICountry>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Define mutations for CRUD operations
  const saveMutation = usePersist<CountrySchemaType>(`${Country.add}`)
  const updateMutation = usePersist<CountrySchemaType>(`${Country.add}`)
  const deleteMutation = useDelete(`${Country.delete}`)

  // State for modal and selected country
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCountry, setExistingCountry] = useState<ICountry | null>(null)

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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: CountrySchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

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

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: CountrySchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: CountrySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the countries query
          queryClient.invalidateQueries({ queryKey: ["countries"] })
        }
      } else if (modalMode === "edit" && selectedCountry) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the countries query
          queryClient.invalidateQueries({ queryKey: ["countries"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
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
      deleteMutation.mutateAsync(deleteConfirmation.countryId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["countries"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        countryId: null,
        countryName: null,
      })
    }
  }

  // Handler for code availability check
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${Country.getByCode}/${trimmedCode}`)
                // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
                    // Handle both array and single object responses
          const countryData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

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
            setExistingCountry(validCountryData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing country
  const handleLoadExistingCountry = () => {
    if (existingCountry) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedCountry(existingCountry)
      setShowLoadDialog(false)
      setExistingCountry(null)
    }
  }

  // Add useEffect hooks to track state changes
  useEffect(() => {
  }, [modalMode])

  useEffect(() => {
    if (selectedCountry) {
    }
  }, [selectedCountry])

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Countries
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage country information and regional settings
          </p>
        </div>
      </div>

      {/* Countries Table */}
      {isLoading ? (
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
      ) : countriesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <CountriesTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onCreate={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            canView={false}
            canCreate={false}
            canEdit={false}
            canDelete={false}
          />
        </LockSkeleton>
      ) : countriesResult ? (
        <CountriesTable
          data={filters.search ? [] : countriesdata || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewCountry : undefined}
          onCreate={canCreate ? handleCreateCountry : undefined}
          onEdit={canEdit ? handleEditCountry : undefined}
          onDelete={canDelete ? handleDeleteCountry : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canView={canView}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {countriesResult === 0 ? "No data available" : "Loading..."}
          </p>
        </div>
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
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Country Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingCountry}
        onCancel={() => setExistingCountry(null)}
        code={existingCountry?.countryCode}
        name={existingCountry?.countryName}
        typeLabel="Country"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={modalMode === "create" ? "Create Country" : "Update Country"}
        itemName={saveConfirmation.data?.countryName || ""}
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
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
