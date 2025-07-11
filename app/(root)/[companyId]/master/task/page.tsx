"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { ITask, ITaskFilter } from "@/interfaces/task"
import { TaskFormValues } from "@/schemas/task"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Task } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetById,
  useSave,
  useUpdate,
} from "@/hooks/use-common-v1"
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
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { TaskForm } from "./components/task-form"
import { TasksTable } from "./components/task-table"

export default function TaskPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.task

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<ITaskFilter>({})
  const {
    data: tasksResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ITask>(`${Task.get}`, "tasks", companyId, filters.search)

  const { result: tasksResult, data: tasksData } =
    (tasksResponse as ApiResponse<ITask>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (tasksData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = useSave<TaskFormValues>(
    `${Task.add}`,
    "tasks",
    companyId
  )
  const updateMutation = useUpdate<TaskFormValues>(
    `${Task.add}`,
    "tasks",
    companyId
  )
  const deleteMutation = useDelete(`${Task.delete}`, "tasks", companyId)

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingTask, setExistingTask] = useState<ITask | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    taskId: string | null
    taskName: string | null
  }>({
    isOpen: false,
    taskId: null,
    taskName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ITask>(
    `${Task.getByCode}`,
    "taskByCode",
    companyId,
    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateTask = () => {
    setModalMode("create")
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: ITask) => {
    setModalMode("edit")
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleViewTask = (task: ITask | null) => {
    if (!task) return
    setModalMode("view")
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: TaskFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<ITask>
        if (response.result === 1) {
          toast.success("Task created successfully")
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create task")
        }
      } else if (modalMode === "edit" && selectedTask) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<ITask>
        if (response.result === 1) {
          toast.success("Task updated successfully")
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update task")
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

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasksData?.find((b) => b.taskId.toString() === taskId)
    if (!taskToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      taskId,
      taskName: taskToDelete.taskName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.taskId) {
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.taskId), {
        loading: `Deleting ${deleteConfirmation.taskName}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
          return `${deleteConfirmation.taskName} has been deleted`
        },
        error: "Failed to delete task",
      })
      setDeleteConfirmation({
        isOpen: false,
        taskId: null,
        taskName: null,
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
        const taskData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed taskData:", taskData)

        if (taskData) {
          // Ensure all required fields are present
          const validTaskData: ITask = {
            taskId: taskData.taskId,
            taskCode: taskData.taskCode,
            taskName: taskData.taskName,
            taskOrder: taskData.taskOrder || 0,
            companyId: taskData.companyId,
            remarks: taskData.remarks || "",
            isActive: taskData.isActive ?? true,
            isOwn: taskData.isOwn ?? true,
            createBy: taskData.createBy,
            editBy: taskData.editBy,
            createDate: taskData.createDate,
            editDate: taskData.editDate,
            createById: taskData.createById,
            editById: taskData.editById,
          }

          console.log("Setting existing task:", validTaskData)
          setExistingTask(validTaskData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing task
  const handleLoadExistingTask = () => {
    if (existingTask) {
      // Log the data we're about to set
      console.log("About to load task data:", {
        existingTask,
        currentModalMode: modalMode,
        currentSelectedTask: selectedTask,
      })

      // Set the states
      setModalMode("edit")
      setSelectedTask(existingTask)
      setShowLoadDialog(false)
      setExistingTask(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Manage task information and settings
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
      ) : tasksResult === -2 ? (
        <LockSkeleton locked={true}>
          <TasksTable
            data={tasksData || []}
            onTaskSelect={handleViewTask}
            onDeleteTask={canDelete ? handleDeleteTask : undefined}
            onEditTask={canEdit ? handleEditTask : undefined}
            onCreateTask={handleCreateTask}
            onRefresh={() => {
              handleRefresh()
              toast("Refreshing data...Fetching the latest task data.")
            }}
            onFilterChange={setFilters}
            moduleId={moduleId}
            transactionId={transactionId}
            companyId={companyId}
          />
        </LockSkeleton>
      ) : tasksResult ? (
        <TasksTable
          data={tasksData || []}
          onTaskSelect={handleViewTask}
          onDeleteTask={canDelete ? handleDeleteTask : undefined}
          onEditTask={canEdit ? handleEditTask : undefined}
          onCreateTask={handleCreateTask}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest task data.")
          }}
          onFilterChange={setFilters}
          moduleId={moduleId}
          transactionId={transactionId}
          companyId={companyId}
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
              {modalMode === "create" && "Create Task"}
              {modalMode === "edit" && "Update Task"}
              {modalMode === "view" && "View Task"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new task to the system database."
                : modalMode === "edit"
                  ? "Update task information in the system database."
                  : "View task details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <TaskForm
            initialData={
              modalMode === "edit" || modalMode === "view" ? selectedTask : null
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Task Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingTask}
        onCancel={() => setExistingTask(null)}
        code={existingTask?.taskCode}
        name={existingTask?.taskName}
        typeLabel="Task"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Task"
        description="This action cannot be undone. This will permanently delete the task from our servers."
        itemName={deleteConfirmation.taskName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            taskId: null,
            taskName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
