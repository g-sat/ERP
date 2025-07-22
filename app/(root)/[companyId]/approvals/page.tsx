"use client"

import { useEffect, useState } from "react"
import {
  ApprovalAction,
  ApprovalActionFilter,
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
import {
  BarChart3,
  Building2,
  CheckCircle,
  Eye,
  FileText,
  Settings,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import {
  ApprovalAction as ApprovalActionAPI,
  ApprovalLevel as ApprovalLevelAPI,
  ApprovalProcess as ApprovalProcessAPI,
  ApprovalRequest as ApprovalRequestAPI,
} from "@/lib/api-routes"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { ApprovalActionTable } from "./components/approval-action-table"
import { ApprovalLevelForm } from "./components/approval-level-form"
import { ApprovalLevelTable } from "./components/approval-level-table"
import { ApprovalProcessForm } from "./components/approval-process-form"
import { ApprovalProcessTable } from "./components/approval-process-table"
import { ApprovalRequestTable } from "./components/approval-request-table"

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
  const [actionFilters, setActionFilters] = useState<ApprovalActionFilter>({})

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

  const {
    data: actionsResponse,
    refetch: refetchActions,
    isLoading: isLoadingActions,
    isRefetching: isRefetchingActions,
  } = useGet<ApprovalAction>(
    `${ApprovalActionAPI.get}`,
    "approval-actions",
    actionFilters.search
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
  const [isApprovalStructureModalOpen, setIsApprovalStructureModalOpen] =
    useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)

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

  useEffect(() => {
    if (actionFilters.search !== undefined) {
      refetchActions()
    }
  }, [actionFilters.search])

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

  // Get status counts for dashboard
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    }

    requestsData?.forEach((request) => {
      switch (request.status) {
        case "Pending":
          counts.pending++
          break
        case "Approved":
          counts.approved++
          break
        case "Rejected":
          counts.rejected++
          break
        case "Cancelled":
          counts.cancelled++
          break
      }
    })

    return counts
  }

  const statusCounts = getStatusCounts()

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsApprovalStructureModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Approval Structure
          </Button>
          <Button
            onClick={() => setIsProcessDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Process
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Request Status Overview
          </CardTitle>
          <CardDescription>
            Current status distribution of approval requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Pending</p>
                <p className="text-muted-foreground text-xs">
                  Awaiting approval
                </p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {statusCounts.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Approved</p>
                <p className="text-muted-foreground text-xs">
                  Successfully approved
                </p>
              </div>
              <Badge variant="default" className="text-lg font-bold">
                {statusCounts.approved}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-muted-foreground text-xs">Request denied</p>
              </div>
              <Badge variant="destructive" className="text-lg font-bold">
                {statusCounts.rejected}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Cancelled</p>
                <p className="text-muted-foreground text-xs">
                  Request cancelled
                </p>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {statusCounts.cancelled}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {isLoadingRequests || isRefetchingRequests ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "15rem",
                "15rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : (requestsResponse as ApiResponse<ApprovalRequest>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <ApprovalRequestTable
                data={requestsData || []}
                isLoading={isLoadingRequests}
                onRefresh={refetchRequests}
                onFilterChange={setRequestFilters}
              />
            </LockSkeleton>
          ) : (
            <ApprovalRequestTable
              data={requestsData || []}
              isLoading={isLoadingRequests}
              onRefresh={refetchRequests}
              onFilterChange={setRequestFilters}
            />
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {isLoadingActions || isRefetchingActions ? (
            <DataTableSkeleton
              columnCount={7}
              filterCount={2}
              cellWidths={[
                "10rem",
                "15rem",
                "10rem",
                "10rem",
                "10rem",
                "15rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : (actionsResponse as ApiResponse<ApprovalAction>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <ApprovalActionTable
                data={actionsData || []}
                isLoading={isLoadingActions}
                onRefresh={refetchActions}
                onFilterChange={setActionFilters}
              />
            </LockSkeleton>
          ) : (
            <ApprovalActionTable
              data={actionsData || []}
              isLoading={isLoadingActions}
              onRefresh={refetchActions}
              onFilterChange={setActionFilters}
            />
          )}
        </TabsContent>
      </Tabs>

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

      {/* Approval Structure Dialog */}
      <Dialog
        open={isApprovalStructureModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsApprovalStructureModalOpen(false)
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
              <Settings className="h-5 w-5" />
              Approval Structure Overview
            </DialogTitle>
            <DialogDescription>
              View all approval processes and their associated levels
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-6">
            {processesData?.map((process) => {
              const processLevels =
                levelsData?.filter(
                  (level) => level.processId === process.processId
                ) || []
              return (
                <Card key={process.processId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {process.processName}
                      </div>
                      <Badge
                        variant={process.isActive ? "default" : "secondary"}
                      >
                        {process.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Process ID: {process.processId} | Module ID:{" "}
                      {process.moduleId}
                      {process.transactionId &&
                        ` | Transaction ID: ${process.transactionId}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {processLevels.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Approval Levels:
                        </h4>
                        <div className="grid gap-3">
                          {processLevels
                            .sort((a, b) => a.levelNumber - b.levelNumber)
                            .map((level) => (
                              <div
                                key={level.levelId}
                                className="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                                    {level.levelNumber}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {level.levelName}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                      User Role ID: {level.userRoleId}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {level.isFinal && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Final Level
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground py-6 text-center">
                        <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>No approval levels configured for this process</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            {(!processesData || processesData.length === 0) && (
              <div className="text-muted-foreground py-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-medium">
                  No Approval Processes
                </h3>
                <p>No approval processes have been configured yet.</p>
              </div>
            )}
          </div>
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
