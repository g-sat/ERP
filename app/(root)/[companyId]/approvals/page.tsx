"use client"

import { useEffect, useState } from "react"
import {
  ApprovalAction,
  ApprovalLevel,
  ApprovalLevelFilter,
  ApprovalProcess,
  ApprovalProcessFilter,
  ApprovalRequest,
  ApprovalRequestFilter,
} from "@/interfaces/approval"
import { ApiResponse } from "@/interfaces/auth"
import {
  ApprovalLevelFormValues,
  ApprovalProcessFormValues,
} from "@/schemas/approval"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { Building2, Users } from "lucide-react"
import { toast } from "sonner"

import {
  ApprovalAction as ApprovalActionAPI,
  ApprovalLevel as ApprovalLevelAPI,
  ApprovalProcess as ApprovalProcessAPI,
  ApprovalRequest as ApprovalRequestAPI,
} from "@/lib/api-routes"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { ApprovalLevelForm } from "./components/approval-level-form"
import { ApprovalLevelTable } from "./components/approval-level-table"
import { ApprovalProcessForm } from "./components/approval-process-form"
import { ApprovalProcessTable } from "./components/approval-process-table"
import { ApprovalRequestDetail } from "./components/approval-request-detail"
import { ApproverView } from "./components/approver-view"
import { RequesterView } from "./components/requester-view"

export default function ApprovalsPage() {
  const { hasPermission } = usePermissionStore()

  // Permission checks
  const canEditProcess = hasPermission(1, 1, "isEdit") // Replace with actual module/transaction IDs
  const canDeleteProcess = hasPermission(1, 1, "isDelete")
  const canViewProcess = hasPermission(1, 1, "isRead")
  const canCreateProcess = hasPermission(1, 1, "isCreate")

  const canEditLevel = hasPermission(1, 2, "isEdit")
  const canDeleteLevel = hasPermission(1, 2, "isDelete")
  const canViewLevel = hasPermission(1, 2, "isRead")
  const canCreateLevel = hasPermission(1, 2, "isCreate")

  // Filters
  const [processFilters, setProcessFilters] = useState<ApprovalProcessFilter>(
    {}
  )
  const [levelFilters, setLevelFilters] = useState<ApprovalLevelFilter>({})
  const [requestFilters, setRequestFilters] = useState<ApprovalRequestFilter>(
    {}
  )

  // Data fetching
  const {
    data: processesResponse,
    refetch: refetchProcesses,
    isLoading: isLoadingProcesses,
    isRefetching: isRefetchingProcesses,
  } = useGet<ApprovalProcess>(
    `${ApprovalProcessAPI.get}`,
    "approval-processes",
    processFilters.search
  )

  const {
    data: levelsResponse,
    refetch: refetchLevels,
    isLoading: isLoadingLevels,
    isRefetching: isRefetchingLevels,
  } = useGet<ApprovalLevel>(
    `${ApprovalLevelAPI.get}`,
    "approval-levels",
    levelFilters.search
  )

  const {
    data: requestsResponse,
    refetch: refetchRequests,
    isLoading: isLoadingRequests,
    isRefetching: isRefetchingRequests,
  } = useGet<ApprovalRequest>(
    `${ApprovalRequestAPI.get}`,
    "approval-requests",
    requestFilters.search
  )

  const { data: actionsResponse } = useGet<ApprovalAction>(
    `${ApprovalActionAPI.get}`,
    "approval-actions"
  )

  // Data extraction
  const { data: processesData } =
    (processesResponse as ApiResponse<ApprovalProcess>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { data: levelsData } =
    (levelsResponse as ApiResponse<ApprovalLevel>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { data: requestsData } =
    (requestsResponse as ApiResponse<ApprovalRequest>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { data: actionsData } =
    (actionsResponse as ApiResponse<ApprovalAction>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveProcessMutation = useSave(`${ApprovalProcessAPI.add}`)
  const updateProcessMutation = useUpdate(`${ApprovalProcessAPI.add}`)
  const deleteProcessMutation = useDelete(`${ApprovalProcessAPI.delete}`)

  const saveLevelMutation = useSave(`${ApprovalLevelAPI.add}`)
  const updateLevelMutation = useUpdate(`${ApprovalLevelAPI.add}`)
  const deleteLevelMutation = useDelete(`${ApprovalLevelAPI.delete}`)

  // State management
  const [selectedProcess, setSelectedProcess] = useState<
    ApprovalProcess | undefined
  >(undefined)
  const [selectedLevel, setSelectedLevel] = useState<ApprovalLevel | undefined>(
    undefined
  )

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null)
  const [viewMode, setViewMode] = useState<"requester" | "approver">(
    "requester"
  )
  const [currentUserId] = useState(1) // Mock current user ID - replace with actual auth

  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    id: string | null
    name: string | null
    type: "process" | "level"
  }>({
    isOpen: false,
    id: null,
    name: null,
    type: "process",
  })

  const queryClient = useQueryClient()

  // Effects for refetching data
  useEffect(() => {
    if (processFilters.search !== undefined) {
      refetchProcesses()
    }
  }, [processFilters.search])

  useEffect(() => {
    if (levelFilters.search !== undefined) {
      refetchLevels()
    }
  }, [levelFilters.search])

  useEffect(() => {
    if (requestFilters.search !== undefined) {
      refetchRequests()
    }
  }, [requestFilters.search])

  // Process handlers
  const handleCreateProcess = () => {
    setModalMode("create")
    setSelectedProcess(undefined)
    setIsProcessModalOpen(true)
  }

  const handleEditProcess = (process: ApprovalProcess) => {
    setModalMode("edit")
    setSelectedProcess(process)
    setIsProcessModalOpen(true)
  }

  const handleViewProcess = (process: ApprovalProcess | undefined) => {
    if (!process) return
    setModalMode("view")
    setSelectedProcess(process)
    setIsProcessModalOpen(true)
  }

  const handleDeleteProcess = (processId: string) => {
    const processToDelete = processesData?.find(
      (p) => p.processId.toString() === processId
    )
    if (!processToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: processId,
      name: processToDelete.processName,
      type: "process",
    })
  }

  // Level handlers
  const handleCreateLevel = () => {
    setModalMode("create")
    setSelectedLevel(undefined)
    setIsLevelModalOpen(true)
  }

  const handleEditLevel = (level: ApprovalLevel) => {
    setModalMode("edit")
    setSelectedLevel(level)
    setIsLevelModalOpen(true)
  }

  const handleViewLevel = (level: ApprovalLevel | undefined) => {
    if (!level) return
    setModalMode("view")
    setSelectedLevel(level)
    setIsLevelModalOpen(true)
  }

  const handleDeleteLevel = (levelId: string) => {
    const levelToDelete = levelsData?.find(
      (l) => l.levelId.toString() === levelId
    )
    if (!levelToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: levelId,
      name: levelToDelete.levelName,
      type: "level",
    })
  }

  // Form submission handlers
  const handleProcessFormSubmit = async (data: ApprovalProcessFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveProcessMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(
            response.message || "Approval process created successfully"
          )
          queryClient.setQueryData<ApiResponse<ApprovalProcess>>(
            ["approval-processes"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = { ...old, data: [...old.data, response.data] }
              return newData as ApiResponse<ApprovalProcess>
            }
          )
        } else {
          toast.error(response.message || "Failed to create approval process")
        }
      } else if (modalMode === "edit" && selectedProcess) {
        const response = await updateProcessMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(
            response.message || "Approval process updated successfully"
          )
          queryClient.setQueryData<ApiResponse<ApprovalProcess>>(
            ["approval-processes"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = {
                ...old,
                data: old.data.map((process) =>
                  process.processId === selectedProcess.processId
                    ? response.data
                    : process
                ),
              }
              return newData as ApiResponse<ApprovalProcess>
            }
          )
        } else {
          toast.error(response.message || "Failed to update approval process")
        }
      }
      setIsProcessModalOpen(false)
    } catch (error) {
      console.error("Error in process form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleLevelFormSubmit = async (data: ApprovalLevelFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveLevelMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(
            response.message || "Approval level created successfully"
          )
          queryClient.setQueryData<ApiResponse<ApprovalLevel>>(
            ["approval-levels"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = { ...old, data: [...old.data, response.data] }
              return newData as ApiResponse<ApprovalLevel>
            }
          )
        } else {
          toast.error(response.message || "Failed to create approval level")
        }
      } else if (modalMode === "edit" && selectedLevel) {
        const response = await updateLevelMutation.mutateAsync(data)
        if (response.result === 1) {
          toast.success(
            response.message || "Approval level updated successfully"
          )
          queryClient.setQueryData<ApiResponse<ApprovalLevel>>(
            ["approval-levels"],
            (old) => {
              if (!old) return { result: 1, message: "", data: [] }
              const newData = {
                ...old,
                data: old.data.map((level) =>
                  level.levelId === selectedLevel.levelId
                    ? response.data
                    : level
                ),
              }
              return newData as ApiResponse<ApprovalLevel>
            }
          )
        } else {
          toast.error(response.message || "Failed to update approval level")
        }
      }
      setIsLevelModalOpen(false)
    } catch (error) {
      console.error("Error in level form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "process":
        mutation = deleteProcessMutation
        break
      case "level":
        mutation = deleteLevelMutation
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.type}`,
    })
    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "process",
    })
  }

  // Handlers for request detail view
  const handleViewRequest = (request: ApprovalRequest) => {
    setSelectedRequest(request)
    setIsRequestDetailOpen(true)
  }

  const handleApproveRequest = async (requestId: number, comments: string) => {
    // TODO: Implement approval logic
    console.log("Approving request:", requestId, "with comments:", comments)
    toast.success("Request approved successfully")
    setIsRequestDetailOpen(false)
    refetchRequests()
  }

  const handleRejectRequest = async (requestId: number, comments: string) => {
    // TODO: Implement rejection logic
    console.log("Rejecting request:", requestId, "with comments:", comments)
    toast.success("Request rejected")
    setIsRequestDetailOpen(false)
    refetchRequests()
  }

  const handleFilterChange = (search: string) => {
    setRequestFilters({ search })
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Approval Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage approval processes, levels, requests, and actions
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 rounded-md border p-1">
            <Button
              variant={viewMode === "requester" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("requester")}
            >
              Requester View
            </Button>
            <Button
              variant={viewMode === "approver" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("approver")}
            >
              Approver View
            </Button>
          </div>
          <Button
            onClick={() => setIsProcessDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Process
          </Button>
        </div>
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === "requester" ? (
        <RequesterView
          requests={requestsData || []}
          levels={levelsData || []}
          isLoading={isLoadingRequests || isRefetchingRequests}
          onViewRequest={handleViewRequest}
          onRefresh={refetchRequests}
          onFilterChange={handleFilterChange}
        />
      ) : (
        <ApproverView
          requests={requestsData || []}
          levels={levelsData || []}
          currentUserId={currentUserId}
          isLoading={isLoadingRequests || isRefetchingRequests}
          onViewRequest={handleViewRequest}
          onRefresh={refetchRequests}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Process Dialog */}
      <Dialog
        open={isProcessModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsProcessModalOpen(false)
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
              {modalMode === "create" && "Create Approval Process"}
              {modalMode === "edit" && "Update Approval Process"}
              {modalMode === "view" && "View Approval Process"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new approval process to the system."
                : modalMode === "edit"
                  ? "Update approval process information."
                  : "View approval process details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ApprovalProcessForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedProcess
                : undefined
            }
            submitAction={handleProcessFormSubmit}
            onCancel={() => setIsProcessModalOpen(false)}
            isSubmitting={
              saveProcessMutation.isPending || updateProcessMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Level Dialog */}
      <Dialog
        open={isLevelModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsLevelModalOpen(false)
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
              {modalMode === "create" && "Create Approval Level"}
              {modalMode === "edit" && "Update Approval Level"}
              {modalMode === "view" && "View Approval Level"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new approval level to the system."
                : modalMode === "edit"
                  ? "Update approval level information."
                  : "View approval level details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ApprovalLevelForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedLevel
                : undefined
            }
            submitAction={handleLevelFormSubmit}
            onCancel={() => setIsLevelModalOpen(false)}
            isSubmitting={
              saveLevelMutation.isPending || updateLevelMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Process Dialog with Tabs */}
      <Dialog
        open={isProcessDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsProcessDialogOpen(false)
          }
        }}
      >
        <DialogContent
          className="max-h-[80vh] overflow-y-auto sm:max-w-4xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Process Management
            </DialogTitle>
            <DialogDescription>
              Manage approval processes and their associated levels
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <Tabs defaultValue="processes" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="processes"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Processes
              </TabsTrigger>
              <TabsTrigger value="levels" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Levels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processes" className="space-y-4">
              {isLoadingProcesses || isRefetchingProcesses ? (
                <DataTableSkeleton
                  columnCount={6}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "20rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <ApprovalProcessTable
                  data={processesData || []}
                  isLoading={isLoadingProcesses}
                  onProcessSelect={
                    canViewProcess ? handleViewProcess : undefined
                  }
                  onDeleteProcess={
                    canDeleteProcess ? handleDeleteProcess : undefined
                  }
                  onEditProcess={canEditProcess ? handleEditProcess : undefined}
                  onCreateProcess={
                    canCreateProcess ? handleCreateProcess : undefined
                  }
                  onRefresh={refetchProcesses}
                  onFilterChange={setProcessFilters}
                />
              )}
            </TabsContent>

            <TabsContent value="levels" className="space-y-4">
              {isLoadingLevels || isRefetchingLevels ? (
                <DataTableSkeleton
                  columnCount={6}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "20rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <ApprovalLevelTable
                  data={levelsData || []}
                  isLoading={isLoadingLevels}
                  onLevelSelect={canViewLevel ? handleViewLevel : undefined}
                  onDeleteLevel={canDeleteLevel ? handleDeleteLevel : undefined}
                  onEditLevel={canEditLevel ? handleEditLevel : undefined}
                  onCreateLevel={canCreateLevel ? handleCreateLevel : undefined}
                  onRefresh={refetchLevels}
                  onFilterChange={setLevelFilters}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Request Detail Dialog */}
      <Dialog
        open={isRequestDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsRequestDetailOpen(false)
            setSelectedRequest(null)
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          {selectedRequest && (
            <ApprovalRequestDetail
              request={selectedRequest}
              levels={levelsData || []}
              actions={actionsData || []}
              currentUserId={currentUserId}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onCancel={() => setIsRequestDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={`Delete ${deleteConfirmation.type.toUpperCase()}`}
        description={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type} from our servers.`}
        itemName={deleteConfirmation.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            id: null,
            name: null,
            type: "process",
          })
        }
        isDeleting={
          deleteConfirmation.type === "process"
            ? deleteProcessMutation.isPending
            : deleteLevelMutation.isPending
        }
      />
    </div>
  )
}
