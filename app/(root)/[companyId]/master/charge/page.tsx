"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { ICharge, IChargeFilter } from "@/interfaces/charge"
import { ChargeFormValues } from "@/schemas/charge"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Charge } from "@/lib/api-routes"
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
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { ChargeForm } from "./components/charge-form"
import { ChargesTable } from "./components/charge-table"

export default function ChargePage() {
  const params = useParams()
  const companyId = params.companyId as string
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.charge

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<IChargeFilter>({})

  const {
    data: chargesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<ICharge>(`${Charge.get}`, "charges", companyId, filters.search)

  const { result: chargesResult, data: chargesData } =
    (chargesResponse as ApiResponse<ICharge>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = useSave<ChargeFormValues>(
    `${Charge.add}`,
    "charges",
    companyId
  )
  const updateMutation = useUpdate<ChargeFormValues>(
    `${Charge.add}`,
    "charges",
    companyId
  )
  const deleteMutation = useDelete(`${Charge.delete}`, "charges", companyId)

  const [selectedCharge, setSelectedCharge] = useState<ICharge | undefined>(
    undefined
  )
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

  const { refetch: checkCodeAvailability } = useGetById<ICharge>(
    `${Charge.getByCode}`,
    "chargeByCode",
    companyId,
    codeToCheck,
    {
      enabled: !!codeToCheck && codeToCheck.trim() !== "",
    }
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateCharge = () => {
    setModalMode("create")
    setSelectedCharge(undefined)
    setIsModalOpen(true)
  }

  const handleEditCharge = (charge: ICharge) => {
    console.log("Edit Charge:", charge)
    setModalMode("edit")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  const handleViewCharge = (charge: ICharge | undefined) => {
    if (!charge) return
    setModalMode("view")
    setSelectedCharge(charge)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: ChargeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ICharge>
        if (response.result === 1) {
          toast.success("Charge created successfully")
          queryClient.invalidateQueries({ queryKey: ["charges"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create charge")
        }
      } else if (modalMode === "edit" && selectedCharge) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ICharge>
        if (response.result === 1) {
          toast.success("Charge updated successfully")
          queryClient.invalidateQueries({ queryKey: ["charges"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update charge")
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
      toast.promise(deleteMutation.mutateAsync(deleteConfirmation.chargeId), {
        loading: `Deleting ${deleteConfirmation.chargeName}...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["charges"] })
          return `${deleteConfirmation.chargeName} has been deleted`
        },
        error: "Failed to delete charge",
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
          const validChargeData: ICharge = {
            chargeId: chargeData.chargeId,
            chargeCode: chargeData.chargeCode,
            chargeName: chargeData.chargeName,
            taskId: chargeData.taskId,
            chargeOrder: chargeData.chargeOrder || 0,
            itemNo: chargeData.itemNo || 0,
            glId: chargeData.glId || 0,
            remarks: chargeData.remarks || "",
            isActive: chargeData.isActive ?? true,
            companyId: chargeData.companyId,
            createById: chargeData.createById || 0,
            editById: chargeData.editById || 0,
            createBy: chargeData.createBy,
            editBy: chargeData.editBy,
            createDate: chargeData.createDate,
            editDate: chargeData.editDate,
          }

          console.log("Setting existing charge:", validChargeData)
          setExistingCharge(validChargeData)
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
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Charges</h1>
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
          onChargeSelect={handleViewCharge}
          onDeleteCharge={canDelete ? handleDeleteCharge : undefined}
          onEditCharge={canEdit ? handleEditCharge : undefined}
          onCreateCharge={handleCreateCharge}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest charge data.")
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
                ? selectedCharge
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
    </div>
  )
}
