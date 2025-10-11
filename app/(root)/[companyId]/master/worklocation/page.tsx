"use client"

import { useCallback, useEffect, useState } from "react"
import { IWorkLocation, IWorkLocationFilter } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { WorkLocationSchemaType } from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { WorkLocation } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
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

import { WorkLocationForm } from "./components/worklocation-form"
import { WorkLocationTable } from "./components/worklocation-table"

export default function WorkLocationPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.workLocation

  // Move queryClient to top for proper usage order
  const queryClient = useQueryClient()

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  // Fetch account groups from the API using useGet
  const [filters, setFilters] = useState<IWorkLocationFilter>({})
  const [isLocked, setIsLocked] = useState(false)

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IWorkLocationFilter)
    },
    []
  )

  const {
    data: workLocationsResponse,
    refetch,
    isLoading,
  } = useGet<IWorkLocation>(
    `${WorkLocation.get}`,
    "workLocations",
    filters.search
  )

  // Destructure with fallback values
  const { result: workLocationsResult, data: workLocationsData } =
    (workLocationsResponse as ApiResponse<IWorkLocation>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Handle result = -1 and result = -2 cases
  useEffect(() => {
    if (!workLocationsResponse) return

    if (workLocationsResponse.result === -1) {
      setFilters({})
    } else if (workLocationsResponse.result === -2 && !isLocked) {
      setIsLocked(true)
    } else if (workLocationsResponse.result !== -2) {
      setIsLocked(false)
    }
  }, [workLocationsResponse, isLocked])

  // Define mutations for CRUD operations
  const saveMutation = usePersist<WorkLocationSchemaType>(`${WorkLocation.add}`)
  const updateMutation = usePersist<WorkLocationSchemaType>(
    `${WorkLocation.add}`
  )
  const deleteMutation = useDelete(`${WorkLocation.delete}`)

  // State for modal and selected account group
  const [selectedWorkLocation, setSelectedWorkLocation] = useState<
    IWorkLocation | undefined
  >(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingWorkLocation, setExistingWorkLocation] =
    useState<IWorkLocation | null>(null)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    workLocationId: string | null
    workLocationName: string | null
  }>({
    isOpen: false,
    workLocationId: null,
    workLocationName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: WorkLocationSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler to Re-fetches data when called
  const handleRefresh = () => {
    refetch()
  }

  // Handler to open modal for creating a new account group
  const handleCreateWorkLocation = () => {
    setModalMode("create")
    setSelectedWorkLocation(undefined)
    setIsModalOpen(true)
  }

  // Handler to open modal for editing an account group
  const handleEditWorkLocation = (workLocation: IWorkLocation) => {
    setModalMode("edit")
    setSelectedWorkLocation(workLocation)
    setIsModalOpen(true)
  }

  // Handler to open modal for viewing an account group
  const handleViewWorkLocation = (workLocation: IWorkLocation | null) => {
    if (!workLocation) return
    setModalMode("view")
    setSelectedWorkLocation(workLocation)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: WorkLocationSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: WorkLocationSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the workLocations query
          queryClient.invalidateQueries({ queryKey: ["workLocations"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedWorkLocation) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          // Invalidate and refetch the workLocations query
          queryClient.invalidateQueries({ queryKey: ["workLocations"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  // Handler for deleting an account group
  const handleDeleteWorkLocation = (workLocationId: string) => {
    const workLocationToDelete = workLocationsData?.find(
      (ag) => ag.workLocationId.toString() === workLocationId
    )
    if (!workLocationToDelete) return

    // Open delete confirmation dialog with account group details
    setDeleteConfirmation({
      isOpen: true,
      workLocationId,
      workLocationName: workLocationToDelete.workLocationName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.workLocationId) {
      deleteMutation.mutateAsync(deleteConfirmation.workLocationId).then(() => {
        // Invalidate and refetch the workLocations query after successful deletion
        queryClient.invalidateQueries({ queryKey: ["workLocations"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        workLocationId: null,
        workLocationName: null,
      })
    }
  }

  // Handler for code availability check (memoized to prevent unnecessary re-renders)
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) {
        return
      }

      try {
        const response = await getById(
          `${WorkLocation.getByCode}/${trimmedCode}`
        )

        // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
          // Handle both array and single object responses
          const workLocationData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (workLocationData) {
            // Ensure all required fields are present
            const validWorklocationData: IWorkLocation = {
              workLocationId: workLocationData.workLocationId,
              workLocationCode: workLocationData.workLocationCode,
              workLocationName: workLocationData.workLocationName,
              address1: workLocationData.address1,
              address2: workLocationData.address2,
              city: workLocationData.city,
              postalCode: workLocationData.postalCode,
              countryId: workLocationData.countryId,
              countryName: workLocationData.countryName,
              isActive: workLocationData.isActive ?? true,
              createBy: workLocationData.createBy,
              editBy: workLocationData.editBy,
              createDate: workLocationData.createDate,
              editDate: workLocationData.editDate,
            }

            setExistingWorkLocation(validWorklocationData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing account group
  const handleLoadExistingWorkLocation = () => {
    if (existingWorkLocation) {
      setModalMode("edit")
      setSelectedWorkLocation(existingWorkLocation)
      setShowLoadDialog(false)
      setExistingWorkLocation(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            WorkLocations
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage workLocation information and settings
          </p>
        </div>
      </div>

      {/* WorkLocations Table */}
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
      ) : workLocationsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <WorkLocationTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
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
      ) : (
        <WorkLocationTable
          data={filters.search ? [] : workLocationsData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewWorkLocation : undefined}
          onDelete={canDelete ? handleDeleteWorkLocation : undefined}
          onEdit={canEdit ? handleEditWorkLocation : undefined}
          onCreate={canCreate ? handleCreateWorkLocation : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
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
              {modalMode === "create" && "Create WorkLocation"}
              {modalMode === "edit" && "Update WorkLocation"}
              {modalMode === "view" && "View WorkLocation"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new workLocation to the system database."
                : modalMode === "edit"
                  ? "Update workLocation information in the system database."
                  : "View workLocation details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <WorkLocationForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedWorkLocation
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={
              modalMode === "view" ||
              (modalMode === "create" && !canCreate) ||
              (modalMode === "edit" && !canEdit)
            }
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Account Group Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingWorkLocation}
        onCancel={() => setExistingWorkLocation(null)}
        code={existingWorkLocation?.workLocationCode}
        name={existingWorkLocation?.workLocationName}
        typeLabel="WorkLocation"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete WorkLocation"
        description="This action cannot be undone. This will permanently delete the workLocation from our servers."
        itemName={deleteConfirmation.workLocationName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            workLocationId: null,
            workLocationName: null,
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
          modalMode === "create" ? "Create WorkLocation" : "Update WorkLocation"
        }
        itemName={saveConfirmation.data?.workLocationName || ""}
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
    </div>
  )
}
