"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IVessel, IVesselFilter } from "@/interfaces/vessel"
import { VesselFormValues } from "@/schemas/vessel"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Vessel } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { VesselForm } from "./components/vessel-form"
import { VesselsTable } from "./components/vessel-table"

export default function VesselPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.vessel

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IVesselFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IVesselFilter)
    },
    []
  )
  const {
    data: vesselsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IVessel>(`${Vessel.get}`, "vessels", filters.search)

  const { result: vesselsResult, data: vesselsData } =
    (vesselsResponse as ApiResponse<IVessel>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (vesselsData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = usePersist<VesselFormValues>(`${Vessel.add}`)
  const updateMutation = usePersist<VesselFormValues>(`${Vessel.add}`)
  const deleteMutation = useDelete(`${Vessel.delete}`)

  const [selectedVessel, setSelectedVessel] = useState<IVessel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingVessel, setExistingVessel] = useState<IVessel | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    vesselId: string | null
    vesselName: string | null
  }>({
    isOpen: false,
    vesselId: null,
    vesselName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: VesselFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IVessel>(
    `${Vessel.getByCode}`,
    "vesselByCode",
    codeToCheck
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateVessel = () => {
    setModalMode("create")
    setSelectedVessel(null)
    setIsModalOpen(true)
  }

  const handleEditVessel = (vessel: IVessel) => {
    setModalMode("edit")
    setSelectedVessel(vessel)
    setIsModalOpen(true)
  }

  const handleViewVessel = (vessel: IVessel | null) => {
    if (!vessel) return
    setModalMode("view")
    setSelectedVessel(vessel)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: VesselFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: VesselFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["vessels"] })
        }
      } else if (modalMode === "edit" && selectedVessel) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["vessels"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteVessel = (vesselId: string) => {
    const vesselToDelete = vesselsData?.find(
      (v) => v.vesselId.toString() === vesselId
    )
    if (!vesselToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      vesselId,
      vesselName: vesselToDelete.vesselName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.vesselId) {
      deleteMutation.mutateAsync(deleteConfirmation.vesselId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["vessels"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        vesselId: null,
        vesselName: null,
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
        const vesselData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed vesselData:", vesselData)

        if (vesselData) {
          // Ensure all required fields are present
          const validVesselData: IVessel = {
            vesselId: vesselData.vesselId,
            vesselCode: vesselData.vesselCode,
            vesselName: vesselData.vesselName,
            vesselType: vesselData.vesselType || "",
            callSign: vesselData.callSign || "",
            imoCode: vesselData.imoCode || "",
            grt: vesselData.grt || "",
            licenseNo: vesselData.licenseNo || "",
            flag: vesselData.flag || "",
            companyId: vesselData.companyId,
            remarks: vesselData.remarks || "",
            isActive: vesselData.isActive ?? true,
            createBy: vesselData.createBy,
            editBy: vesselData.editBy,
            createDate: vesselData.createDate,
            editDate: vesselData.editDate,
          }

          console.log("Setting existing vessel:", validVesselData)
          setExistingVessel(validVesselData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing vessel
  const handleLoadExistingVessel = () => {
    if (existingVessel) {
      // Log the data we're about to set
      console.log("About to load vessel data:", {
        existingVessel,
        currentModalMode: modalMode,
        currentSelectedVessel: selectedVessel,
      })

      // Set the states
      setModalMode("edit")
      setSelectedVessel(existingVessel)
      setShowLoadDialog(false)
      setExistingVessel(null)
    }
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Vessels
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage vessel information and settings
          </p>
        </div>
      </div>

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
      ) : vesselsResult === -2 ? (
        <VesselsTable
          data={[]}
          onSelect={canView ? handleViewVessel : undefined}
          onDelete={canDelete ? handleDeleteVessel : undefined}
          onEdit={canEdit ? handleEditVessel : undefined}
          onCreate={canCreate ? handleCreateVessel : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          isLoading={false}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      ) : vesselsResult ? (
        <VesselsTable
          data={filters.search ? [] : vesselsData || []}
          onSelect={canView ? handleViewVessel : undefined}
          onDelete={canDelete ? handleDeleteVessel : undefined}
          onEdit={canEdit ? handleEditVessel : undefined}
          onCreate={canCreate ? handleCreateVessel : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          isLoading={isLoading}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {vesselsResult === 0 ? "No data available" : "Loading..."}
          </p>
        </div>
      )}

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
              {modalMode === "create" && "Create Vessel"}
              {modalMode === "edit" && "Update Vessel"}
              {modalMode === "view" && "View Vessel"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new vessel to the system database."
                : modalMode === "edit"
                  ? "Update vessel information in the system database."
                  : "View vessel details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <VesselForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedVessel
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

      {/* Load Existing Vessel Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingVessel}
        onCancel={() => setExistingVessel(null)}
        code={existingVessel?.vesselCode}
        name={existingVessel?.vesselName}
        typeLabel="Vessel"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Vessel"
        description="This action cannot be undone. This will permanently delete the vessel from our servers."
        itemName={deleteConfirmation.vesselName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            vesselId: null,
            vesselName: null,
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
        title={modalMode === "create" ? "Create Vessel" : "Update Vessel"}
        itemName={saveConfirmation.data?.vesselName || ""}
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
