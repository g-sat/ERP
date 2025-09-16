"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ITask, ITaskFilter } from "@/interfaces/task"
import { TaskFormValues } from "@/schemas/task"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Task } from "@/lib/api-routes"
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
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { TaskForm } from "./components/task-form"
import { TasksTable } from "./components/task-table"

export default function TaskPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.task

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<ITaskFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as ITaskFilter)
    },
    []
  )
  const {
    data: tasksResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ITask>(`${Task.get}`, "tasks", filters.search)

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

  const saveMutation = usePersist<TaskFormValues>(`${Task.add}`)
  const updateMutation = usePersist<TaskFormValues>(`${Task.add}`)
  const deleteMutation = useDelete(`${Task.delete}`)

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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: TaskFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<ITask>(
    `${Task.getByCode}`,
    "taskByCode",
    codeToCheck
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

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: TaskFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: TaskFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        }
      } else if (modalMode === "edit" && selectedTask) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
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
      deleteMutation.mutateAsync(deleteConfirmation.taskId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
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
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Tasks
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage task information and settings
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
      ) : tasksResult === -2 ? (
        <LockSkeleton locked={true}>
          <TasksTable
            data={[]}
            onSelect={canView ? handleViewTask : undefined}
            onDelete={canDelete ? handleDeleteTask : undefined}
            onEdit={canEdit ? handleEditTask : undefined}
            onCreate={canCreate ? handleCreateTask : undefined}
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
        </LockSkeleton>
      ) : tasksResult ? (
        <TasksTable
          data={filters.search ? [] : tasksData || []}
          onSelect={canView ? handleViewTask : undefined}
          onDelete={canDelete ? handleDeleteTask : undefined}
          onEdit={canEdit ? handleEditTask : undefined}
          onCreate={canCreate ? handleCreateTask : undefined}
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
            {tasksResult === 0 ? "No data available" : "Loading..."}
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

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={modalMode === "create" ? "Create Task" : "Update Task"}
        itemName={saveConfirmation.data?.taskName || ""}
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
