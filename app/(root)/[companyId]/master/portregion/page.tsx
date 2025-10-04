"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPortRegion, IPortRegionFilter } from "@/interfaces/portregion"
import { PortRegionSchemaType } from "@/schemas/portregion"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { PortRegion } from "@/lib/api-routes"
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
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { PortRegionForm } from "./components/portregion-form"
import { PortRegionsTable } from "./components/portregion-table"

export default function PortRegionPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.portRegion

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IPortRegionFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IPortRegionFilter)
    },
    []
  )
  const {
    data: portRegionsResponse,
    refetch,
    isLoading,
  } = useGet<IPortRegion>(`${PortRegion.get}`, "portregions", filters.search)

  const { result: portregionsResult, data: portregionsData } =
    (portRegionsResponse as ApiResponse<IPortRegion>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<PortRegionSchemaType>(`${PortRegion.add}`)
  const updateMutation = usePersist<PortRegionSchemaType>(`${PortRegion.add}`)
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
    codeToCheck
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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: PortRegionSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: PortRegionSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: PortRegionSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<IPortRegion>

        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["portregions"] })
        }
      } else if (modalMode === "edit" && selectedPortRegion) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<IPortRegion>

        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["portregions"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
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
      deleteMutation.mutateAsync(deleteConfirmation.portRegionId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["portregions"] })
      })
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
            countryId: portregionData.countryId,
            countryCode: portregionData.countryCode,
            countryName: portregionData.countryName,
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
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Port Regions
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage port region information and regional settings
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
      ) : portregionsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <PortRegionsTable
            data={[]}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            isLoading={false}
            canEdit={false}
            canDelete={false}
            canView={false}
            canCreate={false}
          />
        </LockSkeleton>
      ) : portregionsResult ? (
        <PortRegionsTable
          data={filters.search ? [] : portregionsData || []}
          onSelect={canView ? handleViewPortRegion : undefined}
          onDelete={canDelete ? handleDeletePortRegion : undefined}
          onEdit={canEdit ? handleEditPortRegion : undefined}
          onCreate={canCreate ? handleCreatePortRegion : undefined}
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
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      <LoadConfirmation
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

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create" ? "Create Port Region" : "Update Port Region"
        }
        itemName={saveConfirmation.data?.portRegionName || ""}
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
