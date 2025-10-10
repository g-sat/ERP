"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ITask, ITaskFilter } from "@/interfaces/task"
import { TaskSchemaType } from "@/schemas/task"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Task } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
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

  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ITaskFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ITaskFilter)
    },
    []
  )
  const {
    data: tasksResponse,
    refetch,
    isLoading,
  } = useGet<ITask>(`${Task.get}`, "tasks", filters.search)

  const { result: tasksResult, data: tasksData } =
    (tasksResponse as ApiResponse<ITask>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<TaskSchemaType>(`${Task.add}`)
  const updateMutation = usePersist<TaskSchemaType>(`${Task.add}`)
  const deleteMutation = useDelete(`${Task.delete}`)

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingTask, setExistingTask] = useState<ITask | null>(null)

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
    data: TaskSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

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
  const handleFormSubmit = (data: TaskSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: TaskSchemaType) => {
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
  const handleCodeBlur = useCallback(
    async (code: string) => {
      // Skip if:
      // 1. In edit mode
      // 2. In read-only mode
      if (modalMode === "edit" || modalMode === "view") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
        const response = await getById(`${Task.getByCode}/${trimmedCode}`)
                // Check if response has data and it's not empty
        if (response?.result === 1 && response.data) {
                    // Handle both array and single object responses
          const taskData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

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
              createBy: taskData.createBy,
              editBy: taskData.editBy,
              createDate: taskData.createDate,
              editDate: taskData.editDate,
              createById: taskData.createById,
              editById: taskData.editById,
            }
            setExistingTask(validTaskData)
            setShowLoadDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalMode]
  )

  // Handler for loading existing task
  const handleLoadExistingTask = () => {
    if (existingTask) {
      // Log the data we're about to set
      // Set the states
      setModalMode("edit")
      setSelectedTask(existingTask)
      setShowLoadDialog(false)
      setExistingTask(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
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

      {/* Tasks Table */}
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
      ) : tasksResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <TasksTable
            data={[]}
            isLoading={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onCreate={() => {}}
            onRefresh={() => {}}
            onFilterChange={() => {}}
            moduleId={moduleId}
            transactionId={transactionId}
            canEdit={false}
            canDelete={false}
            canView={false}
            canCreate={false}
          />
        </LockSkeleton>
      ) : (
        <TasksTable
          data={filters.search ? [] : tasksData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewTask : undefined}
          onDelete={canDelete ? handleDeleteTask : undefined}
          onEdit={canEdit ? handleEditTask : undefined}
          onCreate={canCreate ? handleCreateTask : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
          // Pass permissions to table
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          canCreate={canCreate}
        />
      )}

      {/* Modal for Create, Edit, and View */}
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
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Task Dialog */}
      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingTask}
        onCancel={() => setExistingTask(null)}
        code={existingTask?.taskCode}
        name={existingTask?.taskName}
        typeLabel="Task"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
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
