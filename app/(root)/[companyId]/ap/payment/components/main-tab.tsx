// main-tab.tsx - IMPROVED VERSION
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IApOutTransaction, IApPaymentDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApPaymentDtSchemaType,
  ApPaymentHdSchemaType,
} from "@/schemas/ap-payment"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import OutStandingTransactionsDialog from "@/components/accounttransaction/outstandingtransactions-dialog"

import PaymentDetailsTable from "./payment-details-table"
import PaymentForm from "./payment-form"

interface MainProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
}: MainProps) {
  const [editingDetail, setEditingDetail] =
    useState<ApPaymentDtSchemaType | null>(null)

  // State for transaction selection dialog
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const dialogParamsRef = useRef<{
    supplierId: number
    currencyId: number
    accountDate: string
  } | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  // Clear editingDetail when data_details is reset/cleared
  useEffect(() => {
    if (dataDetails.length === 0 && editingDetail) {
      setEditingDetail(null)
    }
  }, [dataDetails.length, editingDetail])

  // Clear dialog params when dialog closes
  useEffect(() => {
    if (!showTransactionDialog) {
      dialogParamsRef.current = null
    }
  }, [showTransactionDialog])

  // Recalculate header totals when details change
  // Removed automatic calculation - totals should be manually entered in header
  // useEffect(() => {
  //   if (dataDetails.length === 0) {
  //     // Reset all amounts to 0 if no details
  //     form.setValue("totAmt", 0)
  //     form.setValue("totLocalAmt", 0)
  //     return
  //   }

  //   // Calculate base currency totals
  //   const totals = calculateTotalAmounts(
  //     dataDetails as unknown as IApPaymentDt[],
  //     amtDec
  //   )
  //   form.setValue("totAmt", totals.totAmt)

  //   // Calculate local currency totals (always calculate)
  //   const localAmounts = calculateLocalAmounts(
  //     dataDetails as unknown as IApPaymentDt[],
  //     locAmtDec
  //   )
  //   form.setValue("totLocalAmt", localAmounts.totLocalAmt)

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dataDetails.length, amtDec, locAmtDec, ctyAmtDec])

  const _handleAddRow = (rowData: IApPaymentDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as ApPaymentDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as ApPaymentDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )
    }

    // Trigger form validation
    form.trigger("data_details")
  }

  const handleDelete = (itemNo: number) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter((item) => item.itemNo !== itemNo)
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => !selectedItemNos.includes(item.itemNo)
    )
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
  }

  const handleEdit = (detail: IApPaymentDt) => {
    // console.log("Editing detail:", detail)
    // Convert IApPaymentDt to ApPaymentDtSchemaType and set for editing
    setEditingDetail(detail as unknown as ApPaymentDtSchemaType)
    // console.log("Editing editingDetail:", editingDetail)
  }

  const _handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: IApPaymentDt[]) => {
    form.setValue("data_details", newData as unknown as ApPaymentDtSchemaType[])
  }

  // Handle cell edit for editable columns
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      const currentData = form.getValues("data_details") || []
      const updatedData = currentData.map((item) => {
        if (item.itemNo === itemNo) {
          return { ...item, [field]: value }
        }
        return item
      })
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })
      form.trigger("data_details")
    },
    [form]
  )

  // Handle Select Transaction button click
  const handleSelectTransaction = useCallback(() => {
    const supplierId = form.getValues("supplierId")
    const currencyId = form.getValues("currencyId")
    const accountDate = form.getValues("accountDate")
    const paymentTypeId = form.getValues("paymentTypeId")

    console.log("Select Transaction clicked:", {
      supplierId,
      currencyId,
      accountDate,
      paymentTypeId,
    })

    if (!supplierId || !currencyId || !accountDate || !paymentTypeId) {
      toast.warning(
        "Please select Supplier, Currency, Account Date and Payment Type first"
      )
      return
    }

    // Store the values in ref to prevent infinite re-renders
    dialogParamsRef.current = {
      supplierId,
      currencyId,
      accountDate: accountDate?.toString() || "",
    }

    console.log("Setting dialog params:", dialogParamsRef.current)
    setShowTransactionDialog(true)
    console.log("Dialog should be opening now")
  }, [form])

  // Handle adding selected transactions to payment details
  const handleAddSelectedTransactions = useCallback(
    (transactions: IApOutTransaction[]) => {
      const currentData = form.getValues("data_details") || []
      const nextItemNo =
        currentData.length > 0
          ? Math.max(...currentData.map((d) => d.itemNo)) + 1
          : 1

      // Convert selected transactions to payment details
      const newDetails: ApPaymentDtSchemaType[] = transactions.map(
        (transaction, index) => {
          return {
            companyId: companyId,
            paymentId: form.getValues("paymentId") || "0",
            paymentNo: form.getValues("paymentNo") || "",
            itemNo: nextItemNo + index,
            transactionId: transaction.transactionId,
            documentId: Number(transaction.documentId),
            documentNo: transaction.documentNo,
            referenceNo: transaction.referenceNo,
            docCurrencyId: transaction.currencyId,
            docCurrencyCode: transaction.currencyCode || "",
            docExhRate: transaction.exhRate,
            docAccountDate: transaction.accountDate,
            docDueDate: transaction.dueDate,
            docTotAmt: transaction.totAmt,
            docTotLocalAmt: transaction.totLocalAmt,
            docBalAmt: transaction.balAmt,
            docBalLocalAmt: transaction.balLocalAmt,
            allocAmt: 0,
            allocLocalAmt: 0,
            docAllocAmt: 0,
            docAllocLocalAmt: 0,
            centDiff: 0,
            exhGainLoss: 0,
            editVersion: 0,
          } as ApPaymentDtSchemaType
        }
      )

      // Add to existing details
      const updatedData = [...currentData, ...newDetails]
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })

      form.trigger("data_details")
    },
    [form, companyId]
  )

  return (
    <div className="w-full">
      <PaymentForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />

      <div className="p-2">
        {/* Control Row */}
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={handleSelectTransaction}>Select Transaction</Button>
          <Button>Auto Allocation</Button>
          <Input value="0.00" readOnly className="w-[120px] text-right" />
          <Input value="0.00" readOnly className="w-[120px] text-right" />
          <Button variant="outline">Reset Allocation</Button>
        </div>
        <PaymentDetailsTable
          data={(dataDetails as unknown as IApPaymentDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit as (template: IApPaymentDt) => void}
          onRefresh={() => {}} // Add refresh logic if needed
          onFilterChange={() => {}} // Add filter logic if needed
          onDataReorder={handleDataReorder as (newData: IApPaymentDt[]) => void}
          onCellEdit={handleCellEdit}
        />
      </div>

      {/* Transaction Selection Dialog */}
      {showTransactionDialog && dialogParamsRef.current && (
        <OutStandingTransactionsDialog
          open={showTransactionDialog}
          onOpenChange={setShowTransactionDialog}
          supplierId={dialogParamsRef.current.supplierId}
          currencyId={dialogParamsRef.current.currencyId}
          accountDate={dialogParamsRef.current.accountDate}
          visible={visible}
          onAddSelected={handleAddSelectedTransactions}
          existingDocumentIds={dataDetails.map((detail) => detail.documentId)}
        />
      )}
    </div>
  )
}
