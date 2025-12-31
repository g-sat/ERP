"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IGeoLocation, IGeoLocationFilter } from "@/interfaces/geolocation"
import { GeoLocationSchemaType } from "@/schemas/geolocation"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { GeoLocation } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGetWithPagination, usePersist } from "@/hooks/use-common"
import { useUserSettingDefaults } from "@/hooks/use-settings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { GeoLocationForm } from "./components/geolocation-form"
import { GeoLocationsTable } from "./components/geolocation-table"

export default function GeoLocationPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.geoLocation

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<IGeoLocationFilter>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Get user setting defaults
  const { defaults } = useUserSettingDefaults()

  // Update page size when defaults change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IGeoLocationFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const {
    data: geolocationsResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<IGeoLocation>(
    `${GeoLocation.get}`,
    "geolocations",
    filters.search,
    currentPage,
    pageSize
  )

  const {
    result: geolocationsResult,
    data: geolocationsData,
    totalRecords,
  } = (geolocationsResponse as ApiResponse<IGeoLocation>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  const saveMutation = usePersist<GeoLocationSchemaType>(`${GeoLocation.add}`)
  const updateMutation = usePersist<GeoLocationSchemaType>(`${GeoLocation.add}`)
  const deleteMutation = useDelete(`${GeoLocation.delete}`)

  const [selectedGeoLocation, setSelectedGeoLocation] =
    useState<IGeoLocation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingGeoLocation, setExistingGeoLocation] =
    useState<IGeoLocation | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    geoLocationId: string | null
    geoLocationName: string | null
  }>({
    isOpen: false,
    geoLocationId: null,
    geoLocationName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: GeoLocationSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateGeoLocation = () => {
    setModalMode("create")
    setSelectedGeoLocation(null)
    setIsModalOpen(true)
  }

  const handleEditGeoLocation = (geolocation: IGeoLocation) => {
    setModalMode("edit")
    setSelectedGeoLocation(geolocation)
    setIsModalOpen(true)
  }

  const handleViewGeoLocation = (geolocation: IGeoLocation | null) => {
    if (!geolocation) return
    setModalMode("view")
    setSelectedGeoLocation(geolocation)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: GeoLocationSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: GeoLocationSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["geolocations"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedGeoLocation) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["geolocations"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteGeoLocation = (geoLocationId: string) => {
    const geolocationToDelete = geolocationsData?.find(
      (b) => b.geoLocationId.toString() === geoLocationId
    )
    if (!geolocationToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      geoLocationId,
      geoLocationName: geolocationToDelete.geoLocationName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.geoLocationId) {
      deleteMutation.mutateAsync(deleteConfirmation.geoLocationId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["geolocations"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        geoLocationId: null,
        geoLocationName: null,
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
        const response = await getById(
          `${GeoLocation.getByCode}/${trimmedCode}`
        )
        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const geolocationData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (geolocationData) {
            // Ensure all required fields are present
            const validGeoLocationData: IGeoLocation = {
              geoLocationId: geolocationData.geoLocationId,
              geoLocationCode: geolocationData.geoLocationCode,
              geoLocationName: geolocationData.geoLocationName,
              companyId: geolocationData.companyId,
              portId: geolocationData.portId,
              latitude: geolocationData.latitude,
              longitude: geolocationData.longitude,
              remarks: geolocationData.remarks || null,
              isActive: geolocationData.isActive ?? true,
              createBy: geolocationData.createBy,
              editBy: geolocationData.editBy,
              createDate: geolocationData.createDate,
              editDate: geolocationData.editDate,
              createById: geolocationData.createById,
              editById: geolocationData.editById,
            }
            setExistingGeoLocation(validGeoLocationData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing geolocation
  const handleLoadExistingGeoLocation = () => {
    if (existingGeoLocation) {
      // Set the states
      setModalMode("edit")
      setSelectedGeoLocation(existingGeoLocation)
      setShowLoadDialog(false)
      setExistingGeoLocation(null)
    }
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Geo Locations
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage geo location information and settings
          </p>
        </div>
      </div>

      {/* GeoLocations Table */}
      {isLoading ? (
        <DataTableSkeleton
          columnCount={11}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "10rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : geolocationsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <GeoLocationsTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDeleteAction={() => {}}
            onEditAction={() => {}}
            onCreateAction={() => {}}
            onRefreshAction={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            canEdit={false}
            canDelete={false}
            canView={false}
            canCreate={false}
          />
        </LockSkeleton>
      ) : (
        <GeoLocationsTable
          data={geolocationsData || []}
          isLoading={isLoading}
          totalRecords={totalRecords}
          onSelect={canView ? handleViewGeoLocation : undefined}
          onDeleteAction={canDelete ? handleDeleteGeoLocation : undefined}
          onEditAction={canEdit ? handleEditGeoLocation : undefined}
          onCreateAction={canCreate ? handleCreateGeoLocation : undefined}
          onRefreshAction={handleRefresh}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
          serverSidePagination={true}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
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
              {modalMode === "create" && "Create GeoLocation"}
              {modalMode === "edit" && "Update GeoLocation"}
              {modalMode === "view" && "View GeoLocation"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new geo location to the system database."
                : modalMode === "edit"
                  ? "Update geo location information in the system database."
                  : "View geo location details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <GeoLocationForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedGeoLocation
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

      {/* Load Existing GeoLocation Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingGeoLocation}
        onCancelAction={() => setExistingGeoLocation(null)}
        code={existingGeoLocation?.geoLocationCode}
        name={existingGeoLocation?.geoLocationName}
        typeLabel="GeoLocation"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete GeoLocation"
        description="This action cannot be undone. This will permanently delete the geo location from our servers."
        itemName={deleteConfirmation.geoLocationName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({
            isOpen: false,
            geoLocationId: null,
            geoLocationName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create" ? "Create GeoLocation" : "Update GeoLocation"
        }
        itemName={saveConfirmation.data?.geoLocationName || ""}
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
        onCancelAction={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
