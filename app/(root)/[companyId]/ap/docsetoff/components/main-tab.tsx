// main-tab.tsx - IMPROVED VERSION
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  calculateAllocationAmounts,
  calculateTotalExchangeGainLoss,
} from "@/helpers/ap-docsetoff-calculations"
import { IApDocsetoffDt, IApOutTransaction } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ApDocsetoffDtSchemaType, ApDocsetoffHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ApOutStandingTransactionsDialog from "@/components/accounttransaction/ap-outstandingtransactions-dialog"

import PaymentDetailsTable from "./docsetoff-details-table"
import PaymentForm from "./docsetoff-form"

interface MainProps {
  form: UseFormReturn<ApDocsetoffHdSchemaType>
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

  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
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
        dataDetails as unknown as IApDocsetoffDt[],
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

  // Watch currency and docsetoff total fields
  const currencyId = form.watch("currencyId")
  const payCurrencyId = form.watch("payCurrencyId")
  const payTotAmt = form.watch("payTotAmt")
  const payTotLocalAmt = form.watch("payTotLocalAmt")

  // Sync totals when currencyId and payCurrencyId are the same
  useEffect(() => {
    if (currencyId && payCurrencyId && currencyId === payCurrencyId) {
      if (payTotAmt !== undefined && payTotAmt !== null) {
        form.setValue("totAmt", payTotAmt, { shouldDirty: true })
      }
      if (payTotLocalAmt !== undefined && payTotLocalAmt !== null) {
        form.setValue("totLocalAmt", payTotLocalAmt, { shouldDirty: true })
      }
    }
  }, [currencyId, payCurrencyId, payTotAmt, payTotLocalAmt, form])

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

  const handleDataReorder = (newData: IApDocsetoffDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as ApDocsetoffDtSchemaType[]
    )
  }

  // ==================== SMALL REUSABLE FUNCTIONS (SEQUENCE) ====================

  // 1. Validation Function
  const validateAllocation = useCallback((data: ApDocsetoffDtSchemaType[]) => {
    if (data.length === 0) {
      toast.warning("No docsetoff details to allocate")
      return false
    }
    return true
  }, [])

  // 2. Calculate Allocation Amounts (docAllocAmt, docAllocLocal, centDiff, exhGainLoss)
  const calculateItemAllocation = useCallback(
    (item: ApDocsetoffDtSchemaType, allocAmt: number) => {
      const allocationResults = calculateAllocationAmounts(
        allocAmt,
        item.docExhRate || 1,
        item.docExhRate || 1,
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
        docAllocAmt: allocationResults.docAllocAmt,
        docAllocLocalAmt: allocationResults.docAllocLocalAmt,
        centDiff: allocationResults.centDiff,
        exhGainLoss: allocationResults.exhGainLoss,
        allocLocalAmt: allocationResults.allocLocalAmt,
      }
    },
    [decimals]
  )

  // 3. Update Totals in Badges (Total Alloc, Total Local)
  const calculateTotalAllocations = useCallback(
    (data: ApDocsetoffDtSchemaType[]) => {
      const totalAllocAmt = data.reduce(
        (sum, item) => sum + (item.allocAmt || 0),
        0
      )
      const totalAllocLocalAmt = data.reduce(
        (sum, item) => sum + (item.allocLocalAmt || 0),
        0
      )
      return { totalAllocAmt, totalAllocLocalAmt }
    },
    []
  )

  // 4. Update Header Amounts
  const updateHeaderAmounts = useCallback(
    (
      data: ApDocsetoffDtSchemaType[],
      totAmt?: number,
      totLocalAmt?: number
    ) => {
      const { totalAllocAmt, totalAllocLocalAmt } =
        calculateTotalAllocations(data)

      // If totAmt and totLocalAmt are provided, use them; otherwise use calculated totals
      const headerTotAmt = totAmt !== undefined ? totAmt : totalAllocAmt
      const headerTotLocalAmt =
        totLocalAmt !== undefined ? totLocalAmt : totalAllocLocalAmt

      form.setValue("totAmt", headerTotAmt)
      form.setValue("totLocalAmt", headerTotLocalAmt)
      form.setValue("payTotAmt", headerTotAmt)
      form.setValue("payTotLocalAmt", headerTotLocalAmt)

      // Calculate and update exchange gain/loss
      const totalExhGainLoss = calculateTotalExchangeGainLoss(
        data as unknown as IApDocsetoffDt[],
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
    [form, decimals, calculateTotalAllocations]
  )

  // Handle cell edit for editable columns (FOLLOWS SAME SEQUENCE AS AUTO ALLOCATION)
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      const currentData = form.getValues("data_details") || []

      // SEQUENCE 1: Validation (implicit - data exists)

      // SEQUENCE 2 & 3: Update allocAmt and calculate all related values
      const updatedData = currentData.map((item) => {
        if (item.itemNo === itemNo) {
          // If editing allocAmt, recalculate all dependent fields
          if (field === "allocAmt") {
            const calculatedValues = calculateItemAllocation(item, value)
            return {
              ...item,
              allocAmt: value,
              allocLocalAmt: calculatedValues.allocLocalAmt,
              docAllocAmt: calculatedValues.docAllocAmt,
              docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
              centDiff: calculatedValues.centDiff,
              exhGainLoss: calculatedValues.exhGainLoss,
            }
          }
          // If editing allocLocalAmt, just update it (allocAmt is primary)
          else if (field === "allocLocalAmt") {
            return { ...item, allocLocalAmt: value }
          }
          // For other fields, just update the field
          else {
            return { ...item, [field]: value }
          }
        }
        return item
      })

      // SEQUENCE 4 & 5: Update badges and calculate totals (happens in updateHeaderAmounts)
      // SEQUENCE 6: Update headers
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })
      updateHeaderAmounts(updatedData)

      form.trigger("data_details")
    },
    [form, calculateItemAllocation, updateHeaderAmounts]
  )

  // ==================== HELPER FUNCTIONS ====================

  const calculateAmountSums = useCallback((data: ApDocsetoffDtSchemaType[]) => {
    const positiveSum = data.reduce(
      (sum, item) => sum + (item.docBalAmt > 0 ? item.docBalAmt : 0),
      0
    )
    const negativeSum = data.reduce(
      (sum, item) => sum + (item.docBalAmt < 0 ? item.docBalAmt : 0),
      0
    )
    return { positiveSum, negativeSum }
  }, [])

  const resetHeaderAmounts = useCallback(() => {
    form.setValue("totAmt", 0)
    form.setValue("totLocalAmt", 0)
    form.setValue("payTotAmt", 0)
    form.setValue("payTotLocalAmt", 0)
    form.setValue("exhGainLoss", 0)
  }, [form])

  // Helper: Full allocation (Case 1: totAmt = 0)
  const allocateFullAmounts = useCallback(
    (data: ApDocsetoffDtSchemaType[]) => {
      return data.map((item) => {
        const allocAmt = item.docBalAmt || 0

        // Use the reusable calculation function
        const calculatedValues = calculateItemAllocation(item, allocAmt)

        return {
          ...item,
          allocAmt,
          allocLocalAmt: calculatedValues.allocLocalAmt,
          docAllocAmt: calculatedValues.docAllocAmt,
          docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
          centDiff: calculatedValues.centDiff,
          exhGainLoss: calculatedValues.exhGainLoss,
        }
      })
    },
    [calculateItemAllocation]
  )

  // Helper: Proportional allocation (Case 2: totAmt > 0)
  const allocateProportionally = useCallback(
    (
      data: ApDocsetoffDtSchemaType[],
      totAmt: number,
      _totLocalAmt: number,
      usePositive: boolean
    ) => {
      let remainingAmt = totAmt

      return data.map((item, index) => {
        const docBalAmt = item.docBalAmt || 0

        // Skip items that don't match the selected type
        if (usePositive && docBalAmt < 0) {
          const calculatedValues = calculateItemAllocation(item, docBalAmt)
          return {
            ...item,
            allocAmt: docBalAmt,
            allocLocalAmt: calculatedValues.allocLocalAmt,
            docAllocAmt: calculatedValues.docAllocAmt,
            docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
            centDiff: calculatedValues.centDiff,
            exhGainLoss: calculatedValues.exhGainLoss,
          }
        }
        if (!usePositive && docBalAmt >= 0) {
          return {
            ...item,
            allocAmt: 0,
            allocLocalAmt: 0,
            docAllocAmt: 0,
            docAllocLocalAmt: 0,
            centDiff: 0,
            exhGainLoss: 0,
          }
        }

        // Check if this is the last item matching the selected type
        const isLastMatchingItem =
          index === data.length - 1 ||
          data
            .slice(index + 1)
            .every((nextItem) =>
              usePositive ? nextItem.docBalAmt < 0 : nextItem.docBalAmt >= 0
            )

        let allocAmt: number

        // Allocate amounts
        if (isLastMatchingItem) {
          allocAmt = usePositive
            ? Math.min(remainingAmt, docBalAmt)
            : Math.max(remainingAmt, docBalAmt)
        } else {
          allocAmt = docBalAmt
        }

        // Deduct from remaining
        remainingAmt -= allocAmt

        // Use the reusable calculation function
        const calculatedValues = calculateItemAllocation(item, allocAmt)

        return {
          ...item,
          allocAmt,
          allocLocalAmt: calculatedValues.allocLocalAmt,
          docAllocAmt: calculatedValues.docAllocAmt,
          docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
          centDiff: calculatedValues.centDiff,
          exhGainLoss: calculatedValues.exhGainLoss,
        }
      })
    },
    [calculateItemAllocation]
  )

  // Main Auto Allocation Function (USES SMALL FUNCTIONS IN SEQUENCE)
  const handleAutoAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []
    const totAmt = form.getValues("totAmt") || 0

    // SEQUENCE 1: Validation
    if (!validateAllocation(currentData)) return

    // Case 1: Full allocation (totAmt = 0)
    if (totAmt === 0) {
      // SEQUENCE 2 & 3: Update allocAmt and calculate allocLocalAmt
      const updatedData = allocateFullAmounts(currentData)

      // SEQUENCE 4: Update badges (calculated inside updateHeaderAmounts)
      // SEQUENCE 5: Calculate detail items (docAllocAmt, etc - done in allocateFullAmounts)
      // SEQUENCE 6: Update headers
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })
      updateHeaderAmounts(updatedData)

      setIsAllocated(true)
      toast.success("Auto allocation completed")
      return
    }

    // Case 2: Proportional allocation (totAmt > 0)
    const { positiveSum, negativeSum } = calculateAmountSums(currentData)
    const usePositive = Math.abs(positiveSum) >= Math.abs(negativeSum)
    const totLocalAmt = form.getValues("totLocalAmt") || totAmt

    // SEQUENCE 2 & 3: Update allocAmt and calculate allocLocalAmt
    const updatedData = allocateProportionally(
      currentData,
      totAmt,
      totLocalAmt,
      usePositive
    )

    // SEQUENCE 4: Update badges (calculated inside updateHeaderAmounts)
    // SEQUENCE 5: Calculate detail items (docAllocAmt, etc - done in allocateProportionally)
    // SEQUENCE 6: Update headers
    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    updateHeaderAmounts(updatedData, totAmt, totLocalAmt)

    setIsAllocated(true)
    toast.success("Auto allocation completed")
  }, [
    form,
    validateAllocation,
    allocateFullAmounts,
    calculateAmountSums,
    allocateProportionally,
    updateHeaderAmounts,
  ])

  // Reset Allocation Function
  const handleResetAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (currentData.length === 0) {
      toast.warning("No docsetoff details to reset")
      return
    }

    // Reset all allocation amounts to 0
    const updatedData = currentData.map((item) => ({
      ...item,
      allocAmt: 0,
      allocLocalAmt: 0,
      docAllocAmt: 0,
      docAllocLocalAmt: 0,
      centDiff: 0,
      exhGainLoss: 0,
    }))

    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })

    // Reset all header amounts
    resetHeaderAmounts()

    setIsAllocated(false)
    toast.success(
      `Reset ${currentData.length} allocation(s) and all header amounts to 0`
    )
  }, [form, resetHeaderAmounts])

  const handleSelectTransaction = useCallback(() => {
    const supplierId = form.getValues("supplierId")
    const currencyId = form.getValues("currencyId")
    const accountDate = form.getValues("accountDate")
    const paymentTypeId = form.getValues("paymentTypeId")

    if (!supplierId || !currencyId || !accountDate || !paymentTypeId) {
      toast.warning(
        "Please select Supplier, Currency, Account Date and Docsetoff Type first"
      )
      return
    }

    dialogParamsRef.current = {
      supplierId,
      currencyId,
      accountDate: accountDate?.toString() || "",
    }

    setShowTransactionDialog(true)
  }, [form])

  const handleAddSelectedTransactions = useCallback(
    (transactions: IApOutTransaction[]) => {
      const currentData = form.getValues("data_details") || []
      const nextItemNo =
        currentData.length > 0
          ? Math.max(...currentData.map((d) => d.itemNo)) + 1
          : 1

      const newDetails: ApDocsetoffDtSchemaType[] = transactions.map(
        (transaction, index) => ({
          companyId: companyId,
          setoffId: form.getValues("setoffId") || "0",
          setoffNo: form.getValues("setoffNo") || "",
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
        })
      )

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
          data={(dataDetails as unknown as IApDocsetoffDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDataReorder={
            handleDataReorder as (newData: IApDocsetoffDt[]) => void
          }
          onCellEdit={handleCellEdit}
        />
      </div>

      {/* Transaction Selection Dialog */}
      {showTransactionDialog && dialogParamsRef.current && (
        <ApOutStandingTransactionsDialog
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
