"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IVoyage, IVoyageFilter } from "@/interfaces/voyage"
import { VoyageFormValues } from "@/schemas/voyage"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Voyage } from "@/lib/api-routes"
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
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { VoyageForm } from "./components/voyage-form"
import { VoyagesTable } from "./components/voyage-table"

export default function VoyagePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.voyage

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<IVoyageFilter>({})
  const {
    data: voyagesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IVoyage>(`${Voyage.get}`, "voyages", filters.search)

  const { result: voyagesResult, data: voyagesData } =
    (voyagesResponse as ApiResponse<IVoyage>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (filters.search !== undefined) {
      refetch()
    }
  }, [filters.search])

  const saveMutation = usePersist<VoyageFormValues>(`${Voyage.add}`)
  const updateMutation = usePersist<VoyageFormValues>(`${Voyage.add}`)
  const deleteMutation = useDelete(`${Voyage.delete}`)

  const [selectedVoyage, setSelectedVoyage] = useState<IVoyage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingVoyage, setExistingVoyage] = useState<IVoyage | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    voyageId: string | null
    voyageNo: string | null
  }>({
    isOpen: false,
    voyageId: null,
    voyageNo: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IVoyage>(
    `${Voyage.getByCode}`,
    "voyageByCode",

    codeToCheck
  )

  const queryClient = useQueryClient()

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateVoyage = () => {
    setModalMode("create")
    setSelectedVoyage(null)
    setIsModalOpen(true)
  }

  const handleEditVoyage = (voyage: IVoyage) => {
    setModalMode("edit")
    setSelectedVoyage(voyage)
    setIsModalOpen(true)
  }

  const handleViewVoyage = (voyage: IVoyage | null) => {
    if (!voyage) return
    setModalMode("view")
    setSelectedVoyage(voyage)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: VoyageFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<VoyageFormValues>
        if (response.result === 1) {
          toast.success(response.message || "Voyage created successfully")
          queryClient.invalidateQueries({ queryKey: ["voyages"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create voyage")
        }
      } else if (modalMode === "edit" && selectedVoyage) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<VoyageFormValues>
        if (response.result === 1) {
          toast.success(response.message || "Voyage updated successfully")
          queryClient.invalidateQueries({ queryKey: ["voyages"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update voyage")
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

  const handleDeleteVoyage = (voyageId: string) => {
    const voyageToDelete = voyagesData?.find(
      (v) => v.voyageId.toString() === voyageId
    )
    if (!voyageToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      voyageId,
      voyageNo: voyageToDelete.voyageNo,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.voyageId) {
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.voyageId), {
        loading: `Deleting ${deleteConfirmation.voyageNo}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["voyages"] })
          return `${deleteConfirmation.voyageNo} has been deleted`
        },
        error: "Failed to delete voyage",
      })
      setDeleteConfirmation({
        isOpen: false,
        voyageId: null,
        voyageNo: null,
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
        const voyageData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed voyageData:", voyageData)

        if (voyageData) {
          // Ensure all required fields are present
          const validVoyageData: IVoyage = {
            voyageId: voyageData.voyageId,
            voyageNo: voyageData.voyageNo,
            referenceNo: voyageData.referenceNo,
            vesselId: voyageData.vesselId,
            bargeId: voyageData.bargeId,
            remarks: voyageData.remarks || "",
            isActive: voyageData.isActive ?? true,
            createBy: voyageData.createBy,
            editBy: voyageData.editBy,
            createDate: voyageData.createDate,
            editDate: voyageData.editDate,
          }

          console.log("Setting existing voyage:", validVoyageData)
          setExistingVoyage(validVoyageData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing voyage
  const handleLoadExistingVoyage = () => {
    if (existingVoyage) {
      // Log the data we're about to set
      console.log("About to load voyage data:", {
        existingVoyage,
        currentModalMode: modalMode,
        currentSelectedVoyage: selectedVoyage,
      })

      // Set the states
      setModalMode("edit")
      setSelectedVoyage(existingVoyage)
      setShowLoadDialog(false)
      setExistingVoyage(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Voyages</h1>
          <p className="text-muted-foreground text-sm">
            Manage voyage information and settings
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
      ) : voyagesResult ? (
        <VoyagesTable
          data={voyagesData || []}
          onVoyageSelect={handleViewVoyage}
          onDeleteVoyage={canDelete ? handleDeleteVoyage : undefined}
          onEditVoyage={canEdit ? handleEditVoyage : undefined}
          onCreateVoyage={handleCreateVoyage}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest voyage data.")
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
              {modalMode === "create" && "Create Voyage"}
              {modalMode === "edit" && "Update Voyage"}
              {modalMode === "view" && "View Voyage"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new voyage to the system database."
                : modalMode === "edit"
                  ? "Update voyage information in the system database."
                  : "View voyage details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <VoyageForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedVoyage
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

      {/* Load Existing Voyage Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingVoyage}
        onCancel={() => setExistingVoyage(null)}
        code={existingVoyage?.voyageNo}
        name={existingVoyage?.voyageNo}
        typeLabel="Account Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Voyage"
        description="This action cannot be undone. This will permanently delete the voyage from our servers."
        itemName={deleteConfirmation.voyageNo || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            voyageId: null,
            voyageNo: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
