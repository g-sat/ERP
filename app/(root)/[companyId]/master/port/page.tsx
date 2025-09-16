"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPort, IPortFilter } from "@/interfaces/port"
import { PortFormValues } from "@/schemas/port"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Port } from "@/lib/api-routes"
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

import { PortForm } from "./components/port-form"
import { PortsTable } from "./components/port-table"

export default function PortPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.port

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IPortFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IPortFilter)
    },
    []
  )
  const {
    data: portsResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IPort>(`${Port.get}`, "ports", filters.search)

  const { result: portsResult, data: portsData } =
    (portsResponse as ApiResponse<IPort>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<PortFormValues>(`${Port.add}`)
  const updateMutation = usePersist<PortFormValues>(`${Port.add}`)
  const deleteMutation = useDelete(`${Port.delete}`)

  const [selectedPort, setSelectedPort] = useState<IPort | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingPort, setExistingPort] = useState<IPort | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    portId: string | null
    portName: string | null
  }>({
    isOpen: false,
    portId: null,
    portName: null,
  })

  const { refetch: checkCodeAvailability } = useGetById<IPort>(
    `${Port.getByCode}`,
    "portByCode",
    codeToCheck
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleCreatePort = () => {
    setModalMode("create")
    setSelectedPort(null)
    setIsModalOpen(true)
  }

  const handleEditPort = (port: IPort) => {
    console.log("Edit Port:", port)
    setModalMode("edit")
    setSelectedPort(port)
    setIsModalOpen(true)
  }

  const handleViewPort = (port: IPort | null) => {
    if (!port) return
    setModalMode("view")
    setSelectedPort(port)
    setIsModalOpen(true)
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: PortFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: PortFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: PortFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["ports"] })
        }
      } else if (modalMode === "edit" && selectedPort) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["ports"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeletePort = (portId: string) => {
    const portToDelete = portsData?.find((b) => b.portId.toString() === portId)
    if (!portToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      portId,
      portName: portToDelete.portName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.portId) {
      deleteMutation.mutateAsync(deleteConfirmation.portId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["ports"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        portId: null,
        portName: null,
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

        const portData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed portData:", portData)

        if (portData) {
          const validPortData: IPort = {
            portId: portData.portId,
            portCode: portData.portCode,
            portName: portData.portName,
            portRegionId: portData.portRegionId,
            portRegionCode: portData.portRegionCode,
            portRegionName: portData.portRegionName,
            companyId: portData.companyId,
            remarks: portData.remarks || "",
            isActive: portData.isActive ?? true,
            createBy: portData.createBy,
            editBy: portData.editBy,
            createDate: portData.createDate,
            editDate: portData.editDate,
          }

          console.log("Setting existing port:", validPortData)
          setExistingPort(validPortData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  const handleLoadExistingPort = () => {
    if (existingPort) {
      console.log("About to load port data:", {
        existingPort,
        currentModalMode: modalMode,
        currentSelectedPort: selectedPort,
      })

      setModalMode("edit")
      setSelectedPort(existingPort)
      setShowLoadDialog(false)
      setExistingPort(null)
    }
  }

  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedPort) {
      console.log("Selected Port Updated:", {
        portId: selectedPort.portId,
        portCode: selectedPort.portCode,
        portName: selectedPort.portName,
        fullObject: selectedPort,
      })
    }
  }, [selectedPort])

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Ports
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage port information and regional settings
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
      ) : portsResult === -2 ? (
        <PortsTable
          data={[]}
          onSelect={canView ? handleViewPort : undefined}
          onDelete={canDelete ? handleDeletePort : undefined}
          onEdit={canEdit ? handleEditPort : undefined}
          onCreate={canCreate ? handleCreatePort : undefined}
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
      ) : portsResult ? (
        <PortsTable
          data={filters.search ? [] : portsData || []}
          onSelect={canView ? handleViewPort : undefined}
          onDelete={canDelete ? handleDeletePort : undefined}
          onEdit={canEdit ? handleEditPort : undefined}
          onCreate={canCreate ? handleCreatePort : undefined}
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
            {portsResult === 0 ? "No data available" : "Loading..."}
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
              {modalMode === "create" && "Create Port"}
              {modalMode === "edit" && "Update Port"}
              {modalMode === "view" && "View Port"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new port to the system database."
                : modalMode === "edit"
                  ? "Update port information in the system database."
                  : "View port details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <PortForm
            initialData={
              modalMode === "edit" || modalMode === "view" ? selectedPort : null
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
        onLoad={handleLoadExistingPort}
        onCancel={() => setExistingPort(null)}
        code={existingPort?.portCode}
        name={existingPort?.portName}
        typeLabel="Port"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Port"
        description="This action cannot be undone. This will permanently delete the port from our servers."
        itemName={deleteConfirmation.portName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            portId: null,
            portName: null,
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
        title={modalMode === "create" ? "Create Port" : "Update Port"}
        itemName={saveConfirmation.data?.portName || ""}
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
