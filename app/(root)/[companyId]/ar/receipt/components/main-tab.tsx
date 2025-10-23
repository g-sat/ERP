// main-tab.tsx - IMPROVED VERSION
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  calculateMultiplierAmount,
  calculateSubtractionAmount,
} from "@/helpers/account"
import {
  calculateHeaderAmountsForFullAllocation,
  calculateHeaderAmountsForProportionalAllocation,
  calculateTotalAllocationAmounts,
  calculateTotalExchangeGainLoss,
  validateAllocation as validateAllocationCalc,
} from "@/helpers/ar-receipt-calculations"
import { IArOutTransaction, IArReceiptDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArReceiptDtSchemaType, ArReceiptHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ArOutStandingTransactionsDialog from "@/components/accounttransaction/ar-outstandingtransactions-dialog"

import ReceiptDetailsTable from "./receipt-details-table"
import ReceiptForm from "./receipt-form"

interface MainProps {
  form: UseFormReturn<ArReceiptHdSchemaType>
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
    customerId: number
    currencyId: number
    accountDate: string
  } | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  // Calculate sum of allocAmt and allocLocalAmt using helper functions
  const { totalAllocAmt, totalAllocLocalAmt } = calculateTotalAllocationAmounts(
    dataDetails as unknown as IArReceiptDt[],
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

  // Update header form with allocation totals
  useEffect(() => {
    form.setValue("allocTotAmt", totalAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", totalAllocLocalAmt, { shouldDirty: true })
  }, [totalAllocAmt, totalAllocLocalAmt, form])

  // Clear dialog params when dialog closes
  useEffect(() => {
    if (!showTransactionDialog) {
      dialogParamsRef.current = null
    }
  }, [showTransactionDialog])

  // Update header exhGainLoss when details change (SEQUENCE 6)
  useEffect(() => {
    if (dataDetails.length > 0) {
      const totalExhGainLoss = calculateTotalExchangeGainLoss(
        dataDetails as unknown as IArReceiptDt[],
        decimals[0]
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

  // Watch currency fields for sync logic
  const currencyId = form.watch("currencyId")
  const recCurrencyId = form.watch("recCurrencyId")

  // Sync totals when currencyId and recCurrencyId are the same
  // But only when totAmt = 0 (full allocation), not during proportional allocation
  // This effect only runs when currencies change, not when recTotAmt changes
  useEffect(() => {
    const currentTotAmt = form.getValues("totAmt") || 0
    const currentRecTotAmt = form.getValues("recTotAmt") || 0
    const currentRecTotLocalAmt = form.getValues("recTotLocalAmt") || 0

    // Only sync when:
    // 1. Both currencies are set and the same
    // 2. totAmt is 0 (full allocation mode)
    // 3. recTotAmt has a value
    // 4. recTotAmt is different from current totAmt (avoid unnecessary updates)
    if (
      currencyId &&
      recCurrencyId &&
      currencyId === recCurrencyId &&
      currentTotAmt === 0 &&
      currentRecTotAmt > 0 &&
      currentRecTotAmt !== currentTotAmt
    ) {
      form.setValue("totAmt", currentRecTotAmt, { shouldDirty: true })
      form.setValue("totLocalAmt", currentRecTotLocalAmt, { shouldDirty: true })
    }
  }, [currencyId, recCurrencyId, form])

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

  const handleDataReorder = (newData: IArReceiptDt[]) => {
    form.setValue("data_details", newData as unknown as ArReceiptDtSchemaType[])
  }

  // ==================== SMALL REUSABLE FUNCTIONS (SEQUENCE) ====================

  // 1. Validation Function (SEQUENCE 1)
  const validateAllocation = useCallback((data: ArReceiptDtSchemaType[]) => {
    if (!validateAllocationCalc(data as unknown as IArReceiptDt[])) {
      toast.warning("No receipt details to allocate")
      return false
    }
    return true
  }, [])

  // 2. Calculate Allocation Amounts (SEQUENCE 2)
  const calculateItemAllocation = useCallback(
    (item: ArReceiptDtSchemaType, allocAmt: number) => {
      const currentExhRate = form.getValues("exhRate") || 1
      const docExhRate = item.docExhRate || 1

      // Calculate allocLocalAmt = allocAmt * currentExhRate
      const allocLocalAmt = calculateMultiplierAmount(
        allocAmt,
        currentExhRate,
        decimals[0]?.locAmtDec || 2
      )

      // Calculate docAllocLocalAmt = allocAmt * docExhRate
      const docAllocLocalAmt = calculateMultiplierAmount(
        allocAmt,
        docExhRate,
        decimals[0]?.locAmtDec || 2
      )

      // Calculate centDiff = docAllocLocalAmt - allocLocalAmt
      const centDiff = calculateSubtractionAmount(
        docAllocLocalAmt,
        allocLocalAmt,
        decimals[0]?.locAmtDec || 2
      )

      // Exchange gain/loss equals cent difference
      const exhGainLoss = centDiff

      return {
        allocLocalAmt,
        docAllocAmt: allocAmt,
        docAllocLocalAmt,
        centDiff,
        exhGainLoss,
      }
    },
    [form, decimals]
  )

  // 4. Calculate Unallocated Amounts (SEPARATE FUNCTION)
  const updateUnallocatedAmounts = useCallback(
    (data: ArReceiptDtSchemaType[]) => {
      const currentTotAmt = form.getValues("totAmt") || 0
      const currentExhRate = form.getValues("exhRate") || 1

      if (currentTotAmt > 0) {
        const unallocatedAmounts =
          calculateHeaderAmountsForProportionalAllocation(
            data as unknown as IArReceiptDt[],
            currentTotAmt,
            currentExhRate,
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

        form.setValue("unAllocTotAmt", unallocatedAmounts.unAllocTotAmt)
        form.setValue(
          "unAllocTotLocalAmt",
          unallocatedAmounts.unAllocTotLocalAmt
        )
      }
    },
    [form, decimals]
  )

  // 5. Update Header Amounts (SEQUENCE 5 - only for full allocation when totAmt = 0)
  const updateHeaderAmounts = useCallback(
    (data: ArReceiptDtSchemaType[]) => {
      const headerAmounts = calculateHeaderAmountsForFullAllocation(
        data as unknown as IArReceiptDt[],
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

      form.setValue("totAmt", headerAmounts.totAmt)
      form.setValue("totLocalAmt", headerAmounts.totLocalAmt)
      form.setValue("recTotAmt", headerAmounts.recTotAmt)
      form.setValue("recTotLocalAmt", headerAmounts.recTotLocalAmt)
      form.setValue("exhGainLoss", headerAmounts.exhGainLoss)

      // Calculate unallocated amounts after setting all header values
      updateUnallocatedAmounts(data)
    },
    [form, decimals, updateUnallocatedAmounts]
  )

  // Handle cell edit for editable columns (FOLLOWS ALLOCATION CALCULATION LOGIC)
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      const currentData = form.getValues("data_details") || []
      const currentTotAmt = form.getValues("totAmt") || 0
      const currentExhRate = form.getValues("exhRate") || 1

      // SEQUENCE 1: Update the specific item
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

      // SEQUENCE 2: Calculate total allocation amounts
      const { totalAllocAmt, totalAllocLocalAmt } =
        calculateTotalAllocationAmounts(
          updatedData as unknown as IArReceiptDt[],
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

      // Calculate total exchange gain/loss (sum of all centDiff)
      const totalExhGainLoss = calculateTotalExchangeGainLoss(
        updatedData as unknown as IArReceiptDt[],
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

      // SEQUENCE 3: Calculate unallocated amounts (pending allocation logic)
      let unAllocTotAmt = 0
      let unAllocTotLocalAmt = 0

      if (currentTotAmt > 0) {
        // Proportional allocation: unAllocTotAmt = totAmt - totalAllocAmt
        unAllocTotAmt = currentTotAmt - totalAllocAmt
        unAllocTotLocalAmt = unAllocTotAmt * currentExhRate
      } else {
        // Full allocation: totAmt = totalAllocAmt, unAllocTotAmt = 0
        unAllocTotAmt = 0
        unAllocTotLocalAmt = 0
      }

      // SEQUENCE 4: Update form values
      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })

      // Update header amounts based on allocation mode

      // Full allocation mode: update all header amounts
      form.setValue("totAmt", totalAllocAmt, { shouldDirty: true })
      form.setValue("totLocalAmt", totalAllocLocalAmt, { shouldDirty: true })
      form.setValue("recTotAmt", totalAllocAmt, { shouldDirty: true })
      form.setValue("recTotLocalAmt", totalAllocLocalAmt, {
        shouldDirty: true,
      })
      form.setValue("unAllocTotAmt", unAllocTotAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
        shouldDirty: true,
      })

      // Update allocation totals in header
      form.setValue("allocTotAmt", totalAllocAmt, { shouldDirty: true })
      form.setValue("allocTotLocalAmt", totalAllocLocalAmt, {
        shouldDirty: true,
      })

      // Update exchange gain/loss in header
      form.setValue("exhGainLoss", totalExhGainLoss, { shouldDirty: true })

      form.trigger("data_details")
    },
    [form, calculateItemAllocation, decimals]
  )

  // ==================== HELPER FUNCTIONS ====================

  const resetHeaderAmounts = useCallback(() => {
    form.setValue("totAmt", 0)
    form.setValue("totLocalAmt", 0)
    form.setValue("recTotAmt", 0)
    form.setValue("recTotLocalAmt", 0)
    form.setValue("unAllocTotAmt", 0)
    form.setValue("unAllocTotLocalAmt", 0)
    form.setValue("allocTotAmt", 0)
    form.setValue("allocTotLocalAmt", 0)
    form.setValue("exhGainLoss", 0)
  }, [form])

  // Helper: Full allocation (Case 1: totAmt = 0)
  const allocateFullAmounts = useCallback(
    (data: ArReceiptDtSchemaType[]) => {
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

  // Auto Allocation Function for totAmt = 0 (Full Allocation)
  const handleFullAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    // SEQUENCE 1: Validation
    if (!validateAllocation(currentData)) return

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
    toast.success("Full allocation completed")
  }, [form, validateAllocation, allocateFullAmounts, updateHeaderAmounts])

  // Helper: Proportional allocation (Case 2: totAmt > 0) - Based on image example
  const allocateProportionally = useCallback(
    (
      data: ArReceiptDtSchemaType[],
      totAmt: number,
      _totLocalAmt: number,
      _usePositive: boolean
    ) => {
      // Step 1: Sort by negative amounts first (prioritize credit notes/negative balances)
      const sortedData = [...data].sort((a, b) => {
        const aBal = a.docBalAmt || 0
        const bBal = b.docBalAmt || 0

        // Negative amounts first, then positive amounts
        if (aBal < 0 && bBal >= 0) return -1
        if (aBal >= 0 && bBal < 0) return 1
        return 0
      })

      // Step 2: Process allocation sequentially with pending allocation amount
      let pendingAllocationAmt = totAmt
      const updatedData: ArReceiptDtSchemaType[] = []

      for (const item of sortedData) {
        const docBalAmt = item.docBalAmt || 0
        let allocAmt = 0

        if (docBalAmt < 0) {
          // For negative amounts (credit notes): pendingAmt = pendingAmt - (-amount) = pendingAmt + amount
          // This means we "add back" the credit amount to our available allocation
          pendingAllocationAmt = pendingAllocationAmt - docBalAmt // Subtracting negative = adding
          allocAmt = docBalAmt // Allocate the full negative amount
        } else if (docBalAmt > 0) {
          // For positive amounts (invoices): pendingAmt = pendingAmt - amount
          // This means we "subtract" the invoice amount from our available allocation
          if (pendingAllocationAmt >= docBalAmt) {
            // We have enough pending amount to cover this invoice
            pendingAllocationAmt = pendingAllocationAmt - docBalAmt
            allocAmt = docBalAmt // Allocate the full positive amount
          } else {
            // We don't have enough pending amount, allocate what we have
            allocAmt = pendingAllocationAmt
            pendingAllocationAmt = 0
          }
        }

        // Use the reusable calculation function
        const calculatedValues = calculateItemAllocation(item, allocAmt)

        updatedData.push({
          ...item,
          allocAmt,
          allocLocalAmt: calculatedValues.allocLocalAmt,
          docAllocAmt: calculatedValues.docAllocAmt,
          docAllocLocalAmt: calculatedValues.docAllocLocalAmt,
          centDiff: calculatedValues.centDiff,
          exhGainLoss: calculatedValues.exhGainLoss,
        })
      }

      return updatedData
    },
    [calculateItemAllocation]
  )

  // Helper: Calculate unallocated amounts for totAmt > 0 (SEQUENCE 5)
  const calculateUnallocatedAmounts = useCallback(
    (data: ArReceiptDtSchemaType[], totAmt: number) => {
      const exchangeRate = form.getValues("exhRate") || 1
      return calculateHeaderAmountsForProportionalAllocation(
        data as unknown as IArReceiptDt[],
        totAmt,
        exchangeRate,
        decimals[0]
      )
    },
    [form, decimals]
  )

  // Auto Allocation Function for totAmt > 0 (Proportional Allocation)
  const handleProportionalAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []
    const totAmt = form.getValues("totAmt") || 0

    // SEQUENCE 1: Validation
    if (!validateAllocation(currentData)) return

    // SEQUENCE 2 & 3: Update allocAmt and calculate allocLocalAmt using new logic
    const updatedData = allocateProportionally(
      currentData,
      totAmt,
      0, // totLocalAmt not used in new logic
      false // usePositive not used in new logic
    )

    // SEQUENCE 4: Calculate unallocated amounts only (no header updates)
    const { unAllocTotAmt, unAllocTotLocalAmt } = calculateUnallocatedAmounts(
      updatedData,
      totAmt
    )

    // Update unallocated amounts in form
    form.setValue("unAllocTotAmt", unAllocTotAmt, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", unAllocTotLocalAmt, {
      shouldDirty: true,
    })

    // SEQUENCE 5: Update data details only
    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })

    setIsAllocated(true)
    toast.success("Proportional allocation completed")
  }, [
    form,
    validateAllocation,
    allocateProportionally,
    calculateUnallocatedAmounts,
  ])

  // Main Auto Allocation Function (Routes to appropriate function)
  const handleAutoAllocation = useCallback(() => {
    const totAmt = form.getValues("totAmt") || 0

    if (totAmt === 0) {
      handleFullAllocation()
    } else {
      handleProportionalAllocation()
    }
  }, [handleFullAllocation, handleProportionalAllocation, form])

  // Reset Allocation Function
  const handleResetAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (currentData.length === 0) {
      toast.warning("No receipt details to reset")
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
      `Reset ${currentData.length} allocation(s) and all header amounts (including unallocated amounts) to 0`
    )
  }, [form, resetHeaderAmounts])

  const handleSelectTransaction = useCallback(() => {
    const customerId = form.getValues("customerId")
    const currencyId = form.getValues("currencyId")
    const accountDate = form.getValues("accountDate")
    const paymentTypeId = form.getValues("paymentTypeId")

    if (!customerId || !currencyId || !accountDate || !paymentTypeId) {
      toast.warning(
        "Please select Customer, Currency, Account Date and Receipt Type first"
      )
      return
    }

    dialogParamsRef.current = {
      customerId,
      currencyId,
      accountDate: accountDate?.toString() || "",
    }

    setShowTransactionDialog(true)
  }, [form])

  const handleAddSelectedTransactions = useCallback(
    (transactions: IArOutTransaction[]) => {
      const currentData = form.getValues("data_details") || []
      const nextItemNo =
        currentData.length > 0
          ? Math.max(...currentData.map((d) => d.itemNo)) + 1
          : 1

      const newDetails: ArReceiptDtSchemaType[] = transactions.map(
        (transaction, index) => ({
          companyId: companyId,
          receiptId: form.getValues("receiptId") || "0",
          receiptNo: form.getValues("receiptNo") || "",
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
      <ReceiptForm
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
        <ReceiptDetailsTable
          data={(dataDetails as unknown as IArReceiptDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDataReorder={handleDataReorder as (newData: IArReceiptDt[]) => void}
          onCellEdit={handleCellEdit}
        />
      </div>

      {/* Transaction Selection Dialog */}
      {showTransactionDialog && dialogParamsRef.current && (
        <ArOutStandingTransactionsDialog
          open={showTransactionDialog}
          onOpenChange={setShowTransactionDialog}
          customerId={dialogParamsRef.current.customerId}
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
