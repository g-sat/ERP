"use client"

import { useCallback, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IPaymentType, IPaymentTypeFilter } from "@/interfaces/paymenttype"
import { PaymentTypeSchemaType } from "@/schemas/paymenttype"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { PaymentType } from "@/lib/api-routes"
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

import { PaymentTypeForm } from "./components/payment-type-form"
import { PaymentTypesTable } from "./components/payment-type-table"

export default function PaymentTypePage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.paymentType

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [filters, setFilters] = useState<IPaymentTypeFilter>({})

  // Filter handler wrapper
  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Filter change called with:", newFilters)
      setFilters(newFilters as IPaymentTypeFilter)
    },
    []
  )
  const {
    data: paymentTypesResponse,
    refetch,
    isLoading,
  } = useGet<IPaymentType>(`${PaymentType.get}`, "paymentTypes", filters.search)

  const { result: paymentTypesResult, data: paymentTypesData } =
    (paymentTypesResponse as ApiResponse<IPaymentType>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const saveMutation = usePersist<PaymentTypeSchemaType>(`${PaymentType.add}`)
  const updateMutation = usePersist<PaymentTypeSchemaType>(`${PaymentType.add}`)
  const deleteMutation = useDelete(`${PaymentType.delete}`)

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

    codeToCheck
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

  // State for save confirmation
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data: PaymentTypeSchemaType | null
  }>({
    isOpen: false,
    data: null,
  })

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmit = (data: PaymentTypeSchemaType) => {
    setSaveConfirmation({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (data: PaymentTypeSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
          setIsModalOpen(false)
        }
      } else if (modalMode === "edit" && selectedPaymentType) {
        const response = await updateMutation.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error)
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
      deleteMutation.mutateAsync(deleteConfirmation.paymentTypeId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
      })
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
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Payment Types
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage payment type information and settings
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
      ) : paymentTypesResult === -2 ||
        (!canView && !canEdit && !canDelete && !canCreate) ? (
        <LockSkeleton locked={true}>
          <PaymentTypesTable
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
        <PaymentTypesTable
          data={filters.search ? [] : paymentTypesData || []}
          isLoading={isLoading}
          onSelect={canView ? handleViewPaymentType : undefined}
          onDelete={canDelete ? handleDeletePaymentType : undefined}
          onEdit={canEdit ? handleEditPaymentType : undefined}
          onCreate={canCreate ? handleCreatePaymentType : undefined}
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
                ? selectedPaymentType || undefined
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Load Existing Payment Type Dialog */}
      <LoadConfirmation
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

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create" ? "Create Payment Type" : "Update Payment Type"
        }
        itemName={saveConfirmation.data?.paymentTypeName || ""}
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
