"use client"

import { useCallback, useEffect, useState } from "react"
import { IWorkLocation, IWorkLocationFilter } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { WorkLocationSchemaType } from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { WorkLocation } from "@/lib/api-routes"
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

import { WorklocationForm } from "./components/worklocation-form"
import { WorklocationsTable } from "./components/worklocation-table"

export default function WorklocationPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.workLocation

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IWorkLocationFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IWorkLocationFilter)
    },
    []
  )
  const {
    data: worklocationsResponse,
    refetch,
    isLoading,
  } = useGet<IWorkLocation>(
    `${WorkLocation.get}`,
    "worklocations",
    filters.search
  )

  const { result: worklocationsResult, data: worklocationsData } =
    (worklocationsResponse as ApiResponse<IWorkLocation>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<WorkLocationSchemaType>(`${WorkLocation.add}`)
  const updateMutation = usePersist<WorkLocationSchemaType>(
    `${WorkLocation.add}`
  )
  const deleteMutation = useDelete(`${WorkLocation.delete}`)

  const [selectedWorklocation, setSelectedWorklocation] =
    useState<IWorkLocation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingWorklocation, setExistingWorklocation] =
    useState<IWorkLocation | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    workLocationId: string | null
    workLocationName: string | null
  }>({
    isOpen: false,
    workLocationId: null,
    workLocationName: null,
  })

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: WorkLocationSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  const { refetch: checkCodeAvailability } = useGetById<IWorkLocation>(
    `${WorkLocation.getByCode}`,
    "worklocationByCode",
    codeToCheck
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateWorklocation = () => {
    setModalMode("create")
    setSelectedWorklocation(null)
    setIsModalOpen(true)
  }

  const handleEditWorklocation = (worklocation: IWorkLocation) => {
    console.log("Edit WorkLocation:", worklocation)
    setModalMode("edit")
    setSelectedWorklocation(worklocation)
    setIsModalOpen(true)
  }

  const handleViewWorklocation = (worklocation: IWorkLocation | null) => {
    if (!worklocation) return
    setModalMode("view")
    setSelectedWorklocation(worklocation)
    setIsModalOpen(true)
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: WorkLocationSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: WorkLocationSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["worklocations"] })
        }
      } else if (modalMode === "edit" && selectedWorklocation) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["worklocations"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteWorklocation = (workLocationId: string) => {
    const worklocationToDelete = worklocationsData?.find(
      (p) => p.workLocationId.toString() === workLocationId
    )
    if (!worklocationToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      workLocationId,
      workLocationName: worklocationToDelete.workLocationName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.workLocationId) {
      deleteMutation.mutateAsync(deleteConfirmation.workLocationId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["worklocations"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        workLocationId: null,
        workLocationName: null,
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

        const worklocationData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed worklocationData:", worklocationData)

        if (worklocationData) {
          const validWorklocationData: IWorkLocation = {
            workLocationId: worklocationData.workLocationId,
            workLocationCode: worklocationData.workLocationCode,
            workLocationName: worklocationData.workLocationName,
            address1: worklocationData.address1,
            address2: worklocationData.address2,
            city: worklocationData.city,
            postalCode: worklocationData.postalCode,
            countryId: worklocationData.countryId,
            countryName: worklocationData.countryName,
            isActive: worklocationData.isActive ?? true,
            createBy: worklocationData.createBy,
            editBy: worklocationData.editBy,
            createDate: worklocationData.createDate,
            editDate: worklocationData.editDate,
          }

          console.log("Setting existing worklocation:", validWorklocationData)
          setExistingWorklocation(validWorklocationData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  const handleLoadExistingWorklocation = () => {
    if (existingWorklocation) {
      console.log("About to load worklocation data:", {
        existingWorklocation,
        currentModalMode: modalMode,
        currentSelectedWorklocation: selectedWorklocation,
      })

      setModalMode("edit")
      setSelectedWorklocation(existingWorklocation)
      setShowLoadDialog(false)
      setExistingWorklocation(null)
    }
  }

  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedWorklocation) {
      console.log("Selected WorkLocation Updated:", {
        worklocationId: selectedWorklocation.workLocationId,
        worklocationCode: selectedWorklocation.workLocationCode,
        worklocationName: selectedWorklocation.workLocationName,
        fullObject: selectedWorklocation,
      })
    }
  }, [selectedWorklocation])

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Work Locations
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage worklocation information and settings
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
      ) : worklocationsResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <WorklocationsTable
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
      ) : worklocationsResult ? (
        <WorklocationsTable
          data={filters.search ? [] : worklocationsData || []}
          onSelect={canView ? handleViewWorklocation : undefined}
          onDelete={canDelete ? handleDeleteWorklocation : undefined}
          onEdit={canEdit ? handleEditWorklocation : undefined}
          onCreate={canCreate ? handleCreateWorklocation : undefined}
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
            {worklocationsResult === 0 ? "No data available" : "Loading..."}
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
              {modalMode === "create" && "Create WorkLocation"}
              {modalMode === "edit" && "Update WorkLocation"}
              {modalMode === "view" && "View WorkLocation"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new worklocation to the system database."
                : modalMode === "edit"
                  ? "Update worklocation information in the system database."
                  : "View worklocation details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <WorklocationForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedWorklocation
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
        onLoad={handleLoadExistingWorklocation}
        onCancel={() => setExistingWorklocation(null)}
        code={existingWorklocation?.workLocationCode}
        name={existingWorklocation?.workLocationName}
        typeLabel="WorkLocation"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete WorkLocation"
        description="This action cannot be undone. This will permanently delete the worklocation from our servers."
        itemName={deleteConfirmation.workLocationName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            workLocationId: null,
            workLocationName: null,
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
          modalMode === "create" ? "Create WorkLocation" : "Update WorkLocation"
        }
        itemName={saveConfirmation.data?.workLocationName || ""}
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
