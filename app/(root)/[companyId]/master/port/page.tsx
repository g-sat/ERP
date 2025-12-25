"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPort, IPortFilter } from "@/interfaces/port"
import { PortSchemaType } from "@/schemas/port"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Port } from "@/lib/api-routes"
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

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<IPortFilter>({})
  const { defaults } = useUserSettingDefaults()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    defaults?.common?.masterGridTotalRecords || 50
  )

  // Update page size when user settings change
  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords)
    }
  }, [defaults?.common?.masterGridTotalRecords])

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IPortFilter)
      setCurrentPage(1) // Reset to first page when filtering
    },
    []
  )

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Page size change handler
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  const {
    data: portsResponse,
    refetch,
    isLoading,
  } = useGetWithPagination<IPort>(
    `${Port.get}`,
    "ports",
    filters.search,
    currentPage,
    pageSize
  )

  const {
    result: portsResult,
    data: portsData,
    totalRecords,
  } = (portsResponse as ApiResponse<IPort>) ?? {
    result: 0,
    message: "",
    data: [],
    totalRecords: 0,
  }

  const saveMutation = usePersist<PortSchemaType>(`${Port.add}`)
  const updateMutation = usePersist<PortSchemaType>(`${Port.add}`)
  const deleteMutation = useDelete(`${Port.delete}`)

  const [selectedPort, setSelectedPort] = useState<IPort | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingPort, setExistingPort] = useState<IPort | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    portId: string | null
    portName: string | null
  }>({
    isOpen: false,
    portId: null,
    portName: null,
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreatePort = () => {
    setModalMode("create")
    setSelectedPort(null)
    setIsModalOpen(true)
  }

  const handleEditPort = (port: IPort) => {
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
    data: PortSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: PortSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: PortSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["ports"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedPort) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["ports"] })
          setIsModalOpen(false)
        }
      }
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

  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${Port.getByCode}/${trimmedCode}`)
        if (response?.result === 1 && response.data) {
          const portData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (portData) {
            const validPortData: IPort = {
              portId: portData.portId,
              portCode: portData.portCode,
              portName: portData.portName,
              portShortName: portData.portShortName || "",
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
            setExistingPort(validPortData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  const handleLoadExistingPort = () => {
    if (existingPort) {
      setModalMode("edit")
      setSelectedPort(existingPort)
      setShowLoadDialog(false)
      setExistingPort(null)
    }
  }

  useEffect(() => {}, [modalMode])

  useEffect(() => {
    if (selectedPort) {
    }
  }, [selectedPort])

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
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
      ) : portsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <PortsTable
            data={[]}
            onSelect={() => {}}
            onDeleteAction={() => {}}
            onEditAction={() => {}}
            onCreateAction={() => {}}
            onRefreshAction={() => {}}
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
      ) : portsResult ? (
        <PortsTable
          data={portsData || []}
          onSelect={canView ? handleViewPort : undefined}
          onDeleteAction={canDelete ? handleDeletePort : undefined}
          onEditAction={canEdit ? handleEditPort : undefined}
          onCreateAction={canCreate ? handleCreatePort : undefined}
          onRefreshAction={handleRefresh}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
          serverSidePagination={true}
          moduleId={moduleId}
          transactionId={transactionId}
          isLoading={isLoading}
          totalRecords={totalRecords}
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
        onLoad={handleLoadExistingPort}
        onCancelAction={() => setExistingPort(null)}
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
        onCancelAction={() =>
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
