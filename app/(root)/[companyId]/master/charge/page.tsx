"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ICharge, IChargeFilter } from "@/interfaces/charge"
import { ChargeFormValues } from "@/schemas/charge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { Charge } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import {
  useDelete,
  useGet,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"
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

import { ChargeForm } from "./components/charge-form"
import { ChargesTable } from "./components/charge-table"

export default function ChargePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.charge

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IChargeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = (newFilters: {
    search?: string
    sortOrder?: string
  }) => {
    setFilters(newFilters as IChargeFilter)
  }

  const {
    data: chargesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ICharge>(`${Charge.get}`, "charges", filters.search)

  const { result: chargesResult, data: chargesData } =
    (chargesResponse as ApiResponse<ICharge>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<ChargeFormValues>(`${Charge.add}`)
  const updateMutation = usePersist<ChargeFormValues>(`${Charge.add}`)
  const deleteMutation = useDelete(`${Charge.delete}`)

  const [selectedCharge, setSelectedCharge] = useState<ICharge | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingCharge, setExistingCharge] = useState<ICharge | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    chargeId: string | null
    chargeName: string | null
  }>({
    isOpen: false,
    chargeId: null,
    chargeName: null,
  })

  const { refetch: checkCodeAvailability } = useGetByParams<ICharge>(
    `${Charge.getByCode}`,
    "chargeByCode",
    codeToCheck || ""
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateCharge = () => {
    setModalMode("create")
    setSelectedCharge(null)
    setIsModalOpen(true)
  }

  const handleEditCharge = (charge: ICharge) => {
    console.log("Edit Charge:", charge)
    setModalMode("edit")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  const handleViewCharge = (charge: ICharge | null) => {
    if (!charge) return
    setModalMode("view")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: ChargeFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: ChargeFormValues) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: ChargeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["charges"] })
        }
      } else if (modalMode === "edit" && selectedCharge) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["charges"] })
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDeleteCharge = (chargeId: string) => {
    const chargeToDelete = chargesData?.find(
      (b) => b.chargeId.toString() === chargeId
    )
    if (!chargeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      chargeId,
      chargeName: chargeToDelete.chargeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.chargeId) {
      deleteMutation.mutateAsync(deleteConfirmation.chargeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["charges"] })
      })
      setDeleteConfirmation({
        isOpen: false,
        chargeId: null,
        chargeName: null,
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

        const chargeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed chargeData:", chargeData)

        if (chargeData) {
          const validChargeData: ChargeFormValues = {
            chargeId: chargeData.chargeId,
            chargeCode: chargeData.chargeCode,
            chargeName: chargeData.chargeName,
            taskId: chargeData.taskId,
            chargeOrder: chargeData.chargeOrder || 0,
            itemNo: chargeData.itemNo || 0,
            glId: chargeData.glId || 0,
            remarks: chargeData.remarks || "",
            isActive: chargeData.isActive ?? true,
          }

          console.log("Setting existing charge:", validChargeData)
          setExistingCharge(validChargeData as ICharge)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  const handleLoadExistingCharge = () => {
    if (existingCharge) {
      console.log("About to load charge data:", {
        existingCharge,
        currentModalMode: modalMode,
        currentSelectedCharge: selectedCharge,
      })

      setModalMode("edit")
      setSelectedCharge(existingCharge)
      setShowLoadDialog(false)
      setExistingCharge(null)
    }
  }

  const queryClient = useQueryClient()

  useEffect(() => {
    console.log("Modal Mode Updated:", modalMode)
  }, [modalMode])

  useEffect(() => {
    if (selectedCharge) {
      console.log("Selected Charge Updated:", {
        chargeId: selectedCharge.chargeId,
        chargeCode: selectedCharge.chargeCode,
        chargeName: selectedCharge.chargeName,
        fullObject: selectedCharge,
      })
    }
  }, [selectedCharge])

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Charges
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage charge information and settings
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
      ) : chargesResult ? (
        <ChargesTable
          data={chargesData || []}
          onSelect={canView ? handleViewCharge : undefined}
          onDelete={canDelete ? handleDeleteCharge : undefined}
          onEdit={canEdit ? handleEditCharge : undefined}
          onCreate={canCreate ? handleCreateCharge : undefined}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          moduleId={moduleId}
          transactionId={transactionId}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {chargesResult === 0 ? "No data available" : "Loading..."}
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
              {modalMode === "create" && "Create Charge"}
              {modalMode === "edit" && "Update Charge"}
              {modalMode === "view" && "View Charge"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new charge to the system database."
                : modalMode === "edit"
                  ? "Update charge information in the system database."
                  : "View charge details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ChargeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedCharge || undefined
                : undefined
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
        onLoad={handleLoadExistingCharge}
        onCancel={() => setExistingCharge(null)}
        code={existingCharge?.chargeCode}
        name={existingCharge?.chargeName}
        typeLabel="Charge"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Charge"
        description="This action cannot be undone. This will permanently delete the charge from our servers."
        itemName={deleteConfirmation.chargeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            chargeId: null,
            chargeName: null,
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
        title={modalMode === "create" ? "Create Charge" : "Update Charge"}
        itemName={saveConfirmation.data?.chargeName || ""}
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
