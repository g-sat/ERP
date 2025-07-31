"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IVessel, IVesselFilter } from "@/interfaces/vessel"
import { VesselFormValues } from "@/schemas/vessel"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

  const [filters, setFilters] = useState<IVesselFilter>({})
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

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IVessel>(
    `${Vessel.getByCode}`,
    "vesselByCode",

    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
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

  const handleFormSubmit = async (data: VesselFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<IVessel>
        if (response.result === 1) {
          toast.success("Vessel created successfully")
          queryClient.invalidateQueries({ queryKey: ["vessels"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create vessel")
        }
      } else if (modalMode === "edit" && selectedVessel) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<IVessel>
        if (response.result === 1) {
          toast.success("Vessel updated successfully")
          queryClient.invalidateQueries({ queryKey: ["vessels"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update vessel")
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
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
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.vesselId), {
        loading: `Deleting ${deleteConfirmation.vesselName}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["vessels"] })
          return `${deleteConfirmation.vesselName} has been deleted`
        },
        error: "Failed to delete vessel",
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
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Vessels</h1>
          <p className="text-muted-foreground text-sm">
            Manage vessel information and settings
          </p>
        </div>
      </div>

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
      ) : vesselsResult ? (
        <VesselsTable
          data={vesselsData || []}
          onVesselSelect={handleViewVessel}
          onDeleteVessel={canDelete ? handleDeleteVessel : undefined}
          onEditVessel={canEdit ? handleEditVessel : undefined}
          onCreateVessel={handleCreateVessel}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest vessel data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div>No data available</div>
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
        typeLabel="Account Type"
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
    </div>
  )
}
