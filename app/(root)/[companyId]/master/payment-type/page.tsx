"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { IPaymentType, IPaymentTypeFilter } from "@/interfaces/paymenttype"
import { PaymentTypeFormValues } from "@/schemas/paymenttype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { PaymentType } from "@/lib/api-routes"
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

import { PaymentTypeForm } from "./components/payment-type-form"
import { PaymentTypesTable } from "./components/payment-type-table"

export default function PaymentTypePage() {
  const params = useParams()
  const companyId = params.companyId as string
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.payment_type

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const [filters, setFilters] = useState<IPaymentTypeFilter>({})
  const {
    data: paymentTypesResponse,
    refetch,
    isLoading,
    isRefetching,
  } = useGet<IPaymentType>(
    `${PaymentType.get}`,
    "paymenttypes",
    companyId,
    filters.search
  )

  const { result: paymentTypesResult, data: paymentTypesData } =
    (paymentTypesResponse as ApiResponse<IPaymentType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  useEffect(() => {
    if (paymentTypesData?.length > 0) {
      refetch()
    }
  }, [filters])

  const saveMutation = useSave<PaymentTypeFormValues>(
    `${PaymentType.add}`,
    "paymenttypes",
    companyId
  )
  const updateMutation = useUpdate<PaymentTypeFormValues>(
    `${PaymentType.add}`,
    "paymenttypes",
    companyId
  )
  const deleteMutation = useDelete(
    `${PaymentType.delete}`,
    "paymenttypes",
    companyId
  )

  const [selectedPaymentType, setSelectedPaymentType] =
    useState<IPaymentType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  // State for code availability check
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [existingPaymentType, setExistingPaymentType] =
    useState<IPaymentType | null>(null)
  const [codeToCheck, setCodeToCheck] = useState<string>("")

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    paymentTypeId: string | null
    paymentTypeName: string | null
  }>({
    isOpen: false,
    paymentTypeId: null,
    paymentTypeName: null,
  })

  // Add API call for checking code availability
  const { refetch: checkCodeAvailability } = useGetById<IPaymentType>(
    `${PaymentType.getByCode}`,
    "paymentTypeByCode",
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

  const handleCreatePaymentType = () => {
    setModalMode("create")
    setSelectedPaymentType(null)
    setIsModalOpen(true)
  }

  const handleEditPaymentType = (paymentType: IPaymentType) => {
    setModalMode("edit")
    setSelectedPaymentType(paymentType)
    setIsModalOpen(true)
  }

  const handleViewPaymentType = (paymentType: IPaymentType | null) => {
    if (!paymentType) return
    setModalMode("view")
    setSelectedPaymentType(paymentType)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: PaymentTypeFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<IPaymentType>
        if (response.result === 1) {
          toast.success("Payment type created successfully")
          queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to create payment type")
        }
      } else if (modalMode === "edit" && selectedPaymentType) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as unknown as ApiResponse<IPaymentType>
        if (response.result === 1) {
          toast.success("Payment type updated successfully")
          queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
          setIsModalOpen(false)
        } else {
          toast.error(response.message || "Failed to update payment type")
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

  const handleDeletePaymentType = (paymentTypeId: string) => {
    const paymentTypeToDelete = paymentTypesData?.find(
      (p) => p.paymentTypeId.toString() === paymentTypeId
    )
    if (!paymentTypeToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      paymentTypeId,
      paymentTypeName: paymentTypeToDelete.paymentTypeName,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.paymentTypeId) {
      toast.promise(
        deleteMutation.mutateAsync(deleteConfirmation.paymentTypeId),
        {
          loading: `Deleting ${deleteConfirmation.paymentTypeName}...`,
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
            return `${deleteConfirmation.paymentTypeName} has been deleted`
          },
          error: "Failed to delete payment type",
        }
      )
      setDeleteConfirmation({
        isOpen: false,
        paymentTypeId: null,
        paymentTypeName: null,
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
        const paymentTypeData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        console.log("Processed paymentTypeData:", paymentTypeData)

        if (paymentTypeData) {
          // Ensure all required fields are present
          const validPaymentTypeData: IPaymentType = {
            paymentTypeId: paymentTypeData.paymentTypeId,
            paymentTypeCode: paymentTypeData.paymentTypeCode,
            paymentTypeName: paymentTypeData.paymentTypeName,
            companyId: paymentTypeData.companyId,
            remarks: paymentTypeData.remarks || "",
            isActive: paymentTypeData.isActive ?? true,
            createBy: paymentTypeData.createBy,
            editBy: paymentTypeData.editBy,
            createDate: paymentTypeData.createDate,
            editDate: paymentTypeData.editDate,
          }

          console.log("Setting existing payment type:", validPaymentTypeData)
          setExistingPaymentType(validPaymentTypeData)
          setShowLoadDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing payment type
  const handleLoadExistingPaymentType = () => {
    if (existingPaymentType) {
      // Log the data we're about to set
      console.log("About to load payment type data:", {
        existingPaymentType,
        currentModalMode: modalMode,
        currentSelectedPaymentType: selectedPaymentType,
      })

      // Set the states
      setModalMode("edit")
      setSelectedPaymentType(existingPaymentType)
      setShowLoadDialog(false)
      setExistingPaymentType(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Payment Types</h1>
          <p className="text-muted-foreground text-sm">
            Manage payment type information and settings
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
      ) : paymentTypesResult === -2 ? (
        <LockSkeleton locked={true}>
          <PaymentTypesTable
            data={paymentTypesData || []}
            onPaymentTypeSelect={handleViewPaymentType}
            onDeletePaymentType={
              canDelete ? handleDeletePaymentType : undefined
            }
            onEditPaymentType={canEdit ? handleEditPaymentType : undefined}
            onCreatePaymentType={handleCreatePaymentType}
            onRefresh={() => {
              handleRefresh()
              toast("Refreshing data...Fetching the latest payment type data.")
            }}
            onFilterChange={setFilters}
            moduleId={moduleId}
            transactionId={transactionId}
            companyId={companyId}
          />
        </LockSkeleton>
      ) : paymentTypesResult ? (
        <PaymentTypesTable
          data={paymentTypesData || []}
          onPaymentTypeSelect={handleViewPaymentType}
          onDeletePaymentType={canDelete ? handleDeletePaymentType : undefined}
          onEditPaymentType={canEdit ? handleEditPaymentType : undefined}
          onCreatePaymentType={handleCreatePaymentType}
          onRefresh={() => {
            handleRefresh()
            toast("Refreshing data...Fetching the latest payment type data.")
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
              {modalMode === "create" && "Create Payment Type"}
              {modalMode === "edit" && "Update Payment Type"}
              {modalMode === "view" && "View Payment Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new payment type to the system database."
                : modalMode === "edit"
                  ? "Update payment type information in the system database."
                  : "View payment type details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <PaymentTypeForm
            initialData={
              modalMode === "edit" || modalMode === "view"
                ? selectedPaymentType
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

      {/* Load Existing Payment Type Dialog */}
      <LoadExistingDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExistingPaymentType}
        onCancel={() => setExistingPaymentType(null)}
        code={existingPaymentType?.paymentTypeCode}
        name={existingPaymentType?.paymentTypeName}
        typeLabel="Payment Type"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete Payment Type"
        description="This action cannot be undone. This will permanently delete the payment type from our servers."
        itemName={deleteConfirmation.paymentTypeName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            paymentTypeId: null,
            paymentTypeName: null,
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
