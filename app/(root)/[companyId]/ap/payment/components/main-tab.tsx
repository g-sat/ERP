// main-tab.tsx - IMPROVED VERSION
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  calculateAllocationAmounts,
  calculateTotalExchangeGainLoss,
} from "@/helpers/ap-payment-calculations"
import { IApOutTransaction, IApPaymentDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApPaymentDtSchemaType,
  ApPaymentHdSchemaType,
} from "@/schemas/ap-payment"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  const [editingDetail, setEditingDetail] =
    useState<ApPaymentDtSchemaType | null>(null)

  // State for transaction selection dialog
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)

  // State for allocation status
  const [isAllocated, setIsAllocated] = useState(false)
  const dialogParamsRef = useRef<{
    supplierId: number
    currencyId: number
    accountDate: string
  } | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  // Calculate sum of allocAmt and allocLocalAmt
  const totalAllocAmt = dataDetails.reduce(
    (sum, item) => sum + (item.allocAmt || 0),
    0
  )
  const totalAllocLocalAmt = dataDetails.reduce(
    (sum, item) => sum + (item.allocLocalAmt || 0),
    0
  )

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

  // Update header exhGainLoss when details change
  useEffect(() => {
    if (dataDetails.length > 0) {
      const totalExhGainLoss = calculateTotalExchangeGainLoss(
        dataDetails as unknown as IApPaymentDt[],
        decimals[0] || {
          amtDec: 2,
          locAmtDec: 2,
          ctyAmtDec: 2,
          priceDec: 2,
          qtyDec: 2,
          exhRateDec: 4,
          dateFormat: "DD/MM/YYYY",
          longDateFormat: "DD/MM/YYYY",
        }
      )
      form.setValue("exhGainLoss", totalExhGainLoss)
    } else {
      form.setValue("exhGainLoss", 0)
    }
  }, [dataDetails, form, decimals])

  // Check allocation status when data details change
  useEffect(() => {
    if (dataDetails.length === 0) {
      setIsAllocated(false)
      return
    }

    // Check if any detail has allocation amounts > 0
    const hasAllocations = dataDetails.some(
      (detail) => (detail.allocAmt || 0) > 0 || (detail.allocLocalAmt || 0) > 0
    )
    setIsAllocated(hasAllocations)
  }, [dataDetails])

  // Watch currency and payment total fields
  const currencyId = form.watch("currencyId")
  const payCurrencyId = form.watch("payCurrencyId")
  const payTotAmt = form.watch("payTotAmt")
  const payTotLocalAmt = form.watch("payTotLocalAmt")

  // Sync totals when currencyId and payCurrencyId are the same
  useEffect(() => {
    if (currencyId && payCurrencyId && currencyId === payCurrencyId) {
      // When currencies match, sync the totals
      if (payTotAmt !== undefined && payTotAmt !== null) {
        form.setValue("totAmt", payTotAmt, { shouldDirty: true })
      }
      if (payTotLocalAmt !== undefined && payTotLocalAmt !== null) {
        form.setValue("totLocalAmt", payTotLocalAmt, { shouldDirty: true })
      }

      console.log("Currencies match - syncing totals:", {
        currencyId,
        payCurrencyId,
        payTotAmt,
        payTotLocalAmt,
      })
    }
  }, [currencyId, payCurrencyId, payTotAmt, payTotLocalAmt, form])

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

  // Helper: Calculate sum of positive and negative amounts
  const calculateAmountSums = useCallback((data: ApPaymentDtSchemaType[]) => {
    // Step 1: Calculate sum of all positive docBalAmt values
    const positiveSum = data.reduce(
      (sum, item) => sum + (item.docBalAmt > 0 ? item.docBalAmt : 0),
      0
    )

    // Step 2: Calculate sum of all negative docBalAmt values
    const negativeSum = data.reduce(
      (sum, item) => sum + (item.docBalAmt < 0 ? item.docBalAmt : 0),
      0
    )

    // Step 3: Return both sums
    return { positiveSum, negativeSum }
  }, [])

  // Helper: Calculate total allocations
  const calculateTotalAllocations = useCallback(
    (data: ApPaymentDtSchemaType[]) => {
      // Step 1: Sum all allocAmt values from payment details
      const totalAllocAmt = data.reduce(
        (sum, item) => sum + (item.allocAmt || 0),
        0
      )

      // Step 2: Sum all allocLocalAmt values from payment details
      const totalAllocLocalAmt = data.reduce(
        (sum, item) => sum + (item.allocLocalAmt || 0),
        0
      )

      // Step 3: Return total allocations
      return { totalAllocAmt, totalAllocLocalAmt }
    },
    []
  )

  // Helper: Update payment header amounts
  const updatePaymentHeaderAmounts = useCallback(
    (totAmt: number, totLocalAmt: number) => {
      // Step 1: Update total amount in header
      form.setValue("totAmt", totAmt)

      // Step 2: Update total local amount in header
      form.setValue("totLocalAmt", totLocalAmt)

      // Step 3: Update payment total amount (sync with totAmt)
      form.setValue("payTotAmt", totAmt)

      // Step 4: Update payment total local amount (sync with totLocalAmt)
      form.setValue("payTotLocalAmt", totLocalAmt)

      // Step 5: Calculate and update total exchange gain/loss from all details
      const totalExhGainLoss = calculateTotalExchangeGainLoss(
        dataDetails as unknown as IApPaymentDt[],
        decimals[0] || {
          amtDec: 2,
          locAmtDec: 2,
          ctyAmtDec: 2,
          priceDec: 2,
          qtyDec: 2,
          exhRateDec: 4,
          dateFormat: "DD/MM/YYYY",
          longDateFormat: "DD/MM/YYYY",
        }
      )
      form.setValue("exhGainLoss", totalExhGainLoss)
    },
    [form, dataDetails, decimals]
  )

  // Helper: Reset header amounts
  const resetHeaderAmounts = useCallback(() => {
    // Step 1: Reset all header amounts (totAmt, totLocalAmt, payTotAmt, payTotLocalAmt) to 0
    updatePaymentHeaderAmounts(0, 0)
  }, [updatePaymentHeaderAmounts])

  // Helper: Full allocation (Case 1: totAmt = 0)
  const allocateFullAmounts = useCallback(
    (data: ApPaymentDtSchemaType[]) => {
      // Step 1: Map through each payment detail item
      // Step 2: Assign full docBalAmt to allocAmt for each item
      // Step 3: Assign full docBalLocalAmt to allocLocalAmt for each item
      // Step 4: Calculate allocation amounts and exchange gain/loss
      return data.map((item) => {
        const allocAmt = item.docBalAmt || 0
        const allocLocalAmt = item.docBalLocalAmt || 0

        // Calculate allocation amounts using the new function
        const allocationResults = calculateAllocationAmounts(
          allocAmt,
          item.docExhRate || 1, // Use document exchange rate
          item.docExhRate || 1, // Use document exchange rate for docExhRate
          item.docTotLocalAmt || 0,
          decimals[0] || {
            amtDec: 2,
            locAmtDec: 2,
            ctyAmtDec: 2,
            priceDec: 2,
            qtyDec: 2,
            exhRateDec: 4,
            dateFormat: "DD/MM/YYYY",
            longDateFormat: "DD/MM/YYYY",
          }
        )

        return {
          ...item,
          allocAmt,
          allocLocalAmt,
          docAllocAmt: allocationResults.docAllocAmt,
          docAllocLocalAmt: allocationResults.docAllocLocalAmt,
          centDiff: allocationResults.centDiff,
          exhGainLoss: allocationResults.exhGainLoss,
        }
      })
    },
    [decimals]
  )

  // Helper: Proportional allocation (Case 2: totAmt > 0)
  const allocateProportionally = useCallback(
    (
      data: ApPaymentDtSchemaType[],
      totAmt: number,
      totLocalAmt: number,
      usePositive: boolean
    ) => {
      // Step 1: Initialize remaining amounts to track what's left to allocate
      let remainingAmt = totAmt
      let remainingLocalAmt = totLocalAmt

      // Step 2: Map through each payment detail item
      return data.map((item, index) => {
        const docBalAmt = item.docBalAmt || 0
        const docBalLocalAmt = item.docBalLocalAmt || 0

        // Step 3: Skip items that don't match the selected type (positive/negative)
        if (usePositive && docBalAmt < 0) {
          // For negative items when allocating positive, set full docBalAmt
          return { ...item, allocAmt: docBalAmt, allocLocalAmt: docBalLocalAmt }
        }
        if (!usePositive && docBalAmt >= 0) {
          // For positive items when allocating negative, set to 0
          return { ...item, allocAmt: 0, allocLocalAmt: 0 }
        }

        // Step 4: Check if this is the last item matching the selected type
        const isLastMatchingItem =
          index === data.length - 1 ||
          data
            .slice(index + 1)
            .every((nextItem) =>
              usePositive ? nextItem.docBalAmt < 0 : nextItem.docBalAmt >= 0
            )

        let allocAmt: number
        let allocLocalAmt: number

        // Step 5: Allocate amounts based on whether it's the last matching item
        if (isLastMatchingItem) {
          // Step 5a: For last item, allocate remaining amount (not exceeding docBalAmt)
          allocAmt = usePositive
            ? Math.min(remainingAmt, docBalAmt)
            : Math.max(remainingAmt, docBalAmt)
          allocLocalAmt = usePositive
            ? Math.min(remainingLocalAmt, docBalLocalAmt)
            : Math.max(remainingLocalAmt, docBalLocalAmt)
        } else {
          // Step 5b: For other items, allocate full docBalAmt
          allocAmt = docBalAmt
          allocLocalAmt = docBalLocalAmt
        }

        // Step 6: Deduct allocated amounts from remaining
        remainingAmt -= allocAmt
        remainingLocalAmt -= allocLocalAmt

        // Step 7: Calculate allocation amounts and exchange gain/loss
        const allocationResults = calculateAllocationAmounts(
          allocAmt,
          item.docExhRate || 1, // Use document exchange rate
          item.docExhRate || 1, // Use document exchange rate for docExhRate
          item.docTotLocalAmt || 0,
          decimals[0] || {
            amtDec: 2,
            locAmtDec: 2,
            ctyAmtDec: 2,
            priceDec: 2,
            qtyDec: 2,
            exhRateDec: 4,
            dateFormat: "DD/MM/YYYY",
            longDateFormat: "DD/MM/YYYY",
          }
        )

        // Step 8: Return updated item with allocated amounts and calculated values
        return {
          ...item,
          allocAmt,
          allocLocalAmt,
          docAllocAmt: allocationResults.docAllocAmt,
          docAllocLocalAmt: allocationResults.docAllocLocalAmt,
          centDiff: allocationResults.centDiff,
          exhGainLoss: allocationResults.exhGainLoss,
        }
      })
    },
    [decimals]
  )

  // Main Auto Allocation Function
  const handleAutoAllocation = useCallback(() => {
    // Step 1: Get current payment details and total amount from form
    const currentData = form.getValues("data_details") || []
    const totAmt = form.getValues("totAmt") || 0

    // Step 2: Validate that there are payment details to allocate
    if (currentData.length === 0) {
      toast.warning("No payment details to allocate")
      return
    }

    // Case 1: Full allocation (totAmt = 0)
    if (totAmt === 0) {
      // Step 3a: Allocate full docBalAmt to allocAmt for all items
      const updatedData = allocateFullAmounts(currentData)

      // Step 4a: Calculate sum of all allocated amounts
      const { totalAllocAmt, totalAllocLocalAmt } =
        calculateTotalAllocations(updatedData)

      // Step 5a: Update form with allocated details
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })

      // Step 6a: Update all header amounts (totAmt, totLocalAmt, payTotAmt, payTotLocalAmt)
      updatePaymentHeaderAmounts(totalAllocAmt, totalAllocLocalAmt)

      // Step 7a: Set allocation status and show success message
      setIsAllocated(true)
      toast.success("Auto allocation completed")
      return
    }

    // Case 2: Proportional allocation (totAmt > 0)
    // Step 3b: Calculate sum of positive and negative amounts
    const { positiveSum, negativeSum } = calculateAmountSums(currentData)

    // Step 4b: Determine whether to use positive or negative amounts (higher absolute value)
    const usePositive = Math.abs(positiveSum) >= Math.abs(negativeSum)

    // Step 5b: Get total local amount from form
    const totLocalAmt = form.getValues("totLocalAmt") || totAmt

    // Step 6b: Allocate amounts proportionally based on totAmt
    const updatedData = allocateProportionally(
      currentData,
      totAmt,
      totLocalAmt,
      usePositive
    )

    // Step 7b: Update form with allocated details
    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })

    // Step 8b: Update payment header amounts to match totAmt and totLocalAmt
    form.setValue("payTotAmt", totAmt)
    form.setValue("payTotLocalAmt", totLocalAmt)

    // Step 9b: Set allocation status and show success message
    setIsAllocated(true)
    toast.success("Auto allocation completed")
  }, [
    form,
    allocateFullAmounts,
    calculateTotalAllocations,
    calculateAmountSums,
    allocateProportionally,
    updatePaymentHeaderAmounts,
  ])

  // Reset Allocation Function
  const handleResetAllocation = useCallback(() => {
    // Step 1: Get current payment details from form
    const currentData = form.getValues("data_details") || []

    // Step 2: Validate that there are payment details to reset
    if (currentData.length === 0) {
      toast.warning("No payment details to reset")
      return
    }

    // Step 3: Reset all allocation amounts to 0 for each detail item
    const updatedData = currentData.map((item) => ({
      ...item,
      allocAmt: 0,
      allocLocalAmt: 0,
      docAllocAmt: 0,
      docAllocLocalAmt: 0,
      centDiff: 0,
      exhGainLoss: 0,
    }))

    // Step 4: Update form with reset detail data
    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })

    // Step 5: Reset all header amounts (totAmt, totLocalAmt, payTotAmt, payTotLocalAmt) to 0
    resetHeaderAmounts()

    // Step 6: Reset allocation status and show success message
    setIsAllocated(false)
    toast.success(
      `Reset ${currentData.length} allocation(s) and all header amounts to 0`
    )
  }, [form, resetHeaderAmounts])

  // Handle Select Transaction button click
  const handleSelectTransaction = useCallback(() => {
    // Step 1: Get required values from form
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

    // Step 2: Validate that all required fields are filled
    if (!supplierId || !currencyId || !accountDate || !paymentTypeId) {
      toast.warning(
        "Please select Supplier, Currency, Account Date and Payment Type first"
      )
      return
    }

    // Step 3: Store dialog parameters in ref to prevent infinite re-renders
    dialogParamsRef.current = {
      supplierId,
      currencyId,
      accountDate: accountDate?.toString() || "",
    }

    console.log("Setting dialog params:", dialogParamsRef.current)

    // Step 4: Open the outstanding transactions dialog
    setShowTransactionDialog(true)
    console.log("Dialog should be opening now")
  }, [form])

  // Handle adding selected transactions to payment details
  const handleAddSelectedTransactions = useCallback(
    (transactions: IApOutTransaction[]) => {
      // Step 1: Get current payment details from form
      const currentData = form.getValues("data_details") || []

      // Step 2: Calculate next item number for new details
      const nextItemNo =
        currentData.length > 0
          ? Math.max(...currentData.map((d) => d.itemNo)) + 1
          : 1

      // Step 3: Convert selected outstanding transactions to payment detail format
      const newDetails: ApPaymentDtSchemaType[] = transactions.map(
        (transaction, index) => {
          return {
            companyId: companyId,
            paymentId: form.getValues("paymentId") || "0",
            paymentNo: form.getValues("paymentNo") || "",
            itemNo: nextItemNo + index,
            transactionId: transaction.transactionId,
            documentId: String(transaction.documentId),
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

      // Step 4: Merge new details with existing payment details
      const updatedData = [...currentData, ...newDetails]

      // Step 5: Update form with merged data
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })

      // Step 6: Trigger form validation for payment details
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

      <div className="px-2 pt-1">
        {/* Control Row */}
        <div className="mb-2 flex items-center gap-2">
          <Button onClick={handleSelectTransaction}>Select Transaction</Button>
          <Button
            onClick={handleAutoAllocation}
            disabled={isAllocated}
            className={isAllocated ? "cursor-not-allowed opacity-50" : ""}
          >
            Auto Allocation
          </Button>
          <Button
            variant="destructive"
            onClick={handleResetAllocation}
            disabled={!isAllocated}
            className={!isAllocated ? "cursor-not-allowed opacity-50" : ""}
          >
            Reset Allocation
          </Button>
          <Badge
            variant="secondary"
            className="border-blue-200 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
          >
            Total Alloc: {totalAllocAmt.toFixed(amtDec)}
          </Badge>
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800"
          >
            Total Local: {totalAllocLocalAmt.toFixed(locAmtDec)}
          </Badge>
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
          existingDocumentIds={dataDetails.map((detail) =>
            Number(detail.documentId)
          )}
        />
      )}
    </div>
  )
}
