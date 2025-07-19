"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPortRegion, IPortRegionFilter } from "@/interfaces/portregion"
import { PortRegionFormValues } from "@/schemas/portregion"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { PortRegion } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetById,
  useSave,
  useUpdate,
} from "@/hooks/use-common"
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

import { PortRegionForm } from "./components/portregion-form"
import { PortRegionsTable } from "./components/portregion-table"

export default function PortRegionPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.port_region

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<IPortRegionFilter>({})
  const {
    data: portRegionsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IPortRegion>(`${PortRegion.get}`, "portregions", filters.search)

  const { result: portregionsResult, data: portregionsData } =
    (portRegionsResponse as ApiResponse<IPortRegion>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = useSave<PortRegionFormValues>(`${PortRegion.add}`)
  const updateMutation = useUpdate<PortRegionFormValues>(`${PortRegion.add}`)
  const deleteMutation = useDelete(`${PortRegion.delete}`)

  const [selectedPortRegion, setSelectedPortRegion] =
    useState<IPortRegion | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingPortRegion, setExistingPortRegion] =
    useState<IPortRegion | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    portRegionId: string | null
    portRegionName: string | null
  }>({
    isOpen: false,
    portRegionId: null,
    portRegionName: null,
  })

  const { refetch: checkCodeAvailability } = useGetById<IPortRegion>(
    `${PortRegion.getByCode}`,
    "portRegionByCode",
    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleCreatePortRegion = () => {
    setModalMode("create")
    setSelectedPortRegion(null)
    setIsModalOpen(true)
  }

  const handleEditPortRegion = (portregion: IPortRegion) => {
    console.log("Edit PortRegion:", portregion)
    setModalMode("edit")
    setSelectedPortRegion(portregion)
    setIsModalOpen(true)
  }

  const handleViewPortRegion = (portregion: IPortRegion | null) => {
    if (!portregion) return
    setModalMode("view")
    setSelectedPortRegion(portregion)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: PortRegionFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IPortRegion>

        if (response.result === 1) {
          toast.success("PortRegion created successfully")
          queryClient.invalidateQueries({ queryKey: ["portregions"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create portregion")
        }
      } else if (modalMode === "edit" && selectedPortRegion) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IPortRegion>

        if (response.result === 1) {
          toast.success("PortRegion updated successfully")
          queryClient.invalidateQueries({ queryKey: ["portregions"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update portregion")
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

  const handleDeletePortRegion = (portRegionId: string) => {
    const portregionToDelete = portregionsData?.find(
      (p) => p.portRegionId.toString() === portRegionId
    )
    if (!portregionToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      portRegionId,
      portRegionName: portregionToDelete.portRegionName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.portRegionId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.portRegionId),
        {
          loading: `Deleting ${deleteConfirmation.portRegionName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["portregions"] })
            return `${deleteConfirmation.portRegionName} has been deleted`
          },
          error: "Failed to delete portregion",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        portRegionId: null,
        portRegionName: null,
      })
    }
  }

  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    setCodeToCheck(trimmedCode)
    try {
      const response = await checkCodeAvailability()
      console.log("Full API Response:", response)

      if (response?.data?.result === 1 && response.data.data) {
        console.log("Response data:", response.data.data)

        const portregionData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed portregionData:", portregionData)

        if (portregionData) {
          const validPortRegionData: IPortRegion = {
            portRegionId: portregionData.portRegionId,
            portRegionCode: portregionData.portRegionCode,
            portRegionName: portregionData.portRegionName,
            companyId: portregionData.companyId,
            remarks: portregionData.remarks || "",
            isActive: portregionData.isActive ?? true,
            createBy: portregionData.createBy,
            editBy: portregionData.editBy,
            createDate: portregionData.createDate,
            editDate: portregionData.editDate,
          }

          console.log("Setting existing portregion:", validPortRegionData)
          setExistingPortRegion(validPortRegionData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  const handleLoadExistingPortRegion = () => {
    if (existingPortRegion) {
      console.log("About to load portregion data:", {
        existingPortRegion,
        currentModalMode: modalMode,
        currentSelectedPortRegion: selectedPortRegion,
      })

      setModalMode("edit")
      setSelectedPortRegion(existingPortRegion)
      setShowLoadDialog(false)
      setExistingPortRegion(null)
    }
  }

  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedPortRegion) {
      console.log("Selected PortRegion Updated:", {
        portRegionId: selectedPortRegion.portRegionId,
        portRegionCode: selectedPortRegion.portRegionCode,
        portRegionName: selectedPortRegion.portRegionName,
        fullObject: selectedPortRegion,
      })
    }
  }, [selectedPortRegion])

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">PortRegions</h1>
          <p className="text-muted-foreground text-sm">
            Manage portregion information and regional settings
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
      ) : portregionsResult ? (
        <PortRegionsTable
          data={portregionsData || []}
          onPortRegionSelect={handleViewPortRegion}
          onDeletePortRegion={canDelete ? handleDeletePortRegion : undefined}
          onEditPortRegion={canEdit ? handleEditPortRegion : undefined}
          onCreatePortRegion={handleCreatePortRegion}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest portregion data.")
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
              {modalMode === "create" && "Create PortRegion"}
              {modalMode === "edit" && "Update PortRegion"}
              {modalMode === "view" && "View PortRegion"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new portregion to the system database."
                : modalMode === "edit"
                  ? "Update portregion information in the system database."
                  : "View portregion details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <PortRegionForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedPortRegion
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

      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingPortRegion}
        onCancel={() => setExistingPortRegion(null)}
        code={existingPortRegion?.portRegionCode}
        name={existingPortRegion?.portRegionName}
        typeLabel="Port Region"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete PortRegion"
        description="This action cannot be undone. This will permanently delete the portregion from our servers."
        itemName={deleteConfirmation.portRegionName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            portRegionId: null,
            portRegionName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
