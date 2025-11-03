"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  autoAllocateAmounts,
  calauteLocalAmtandGainLoss,
  calculateManualAllocation,
  calculateUnallocated,
  validateAllocation as validateAllocationHelper,
} from "@/helpers/ar-receipt-calculations"
import { IArOutTransaction, IArReceiptDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArReceiptDtSchemaType, ArReceiptHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { Plus, RotateCcw, Zap } from "lucide-react"
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
  isCancelled?: boolean
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
  isCancelled = false,
}: MainProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [isAllocated, setIsAllocated] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dataDetails, setDataDetails] = useState<ArReceiptDtSchemaType[]>([])
  const dialogParamsRef = useRef<{
    customerId: number
    currencyId: number
    accountDate: string
  } | null>(null)

  const watchedDataDetails = form.watch("data_details")

  useEffect(() => {
    setDataDetails(watchedDataDetails || [])
  }, [watchedDataDetails])

  // Calculate sum of balAmt (balance amounts) from receipt details
  const totalBalanceAmt = useMemo(() => {
    return dataDetails.reduce((sum, detail) => {
      const balAmt = Number((detail as unknown as IArReceiptDt).docBalAmt) || 0
      return sum + balAmt
    }, 0)
  }, [dataDetails])

  // Clear dialog params when dialog closes
  useEffect(() => {
    if (!showTransactionDialog) {
      dialogParamsRef.current = null
    }
  }, [showTransactionDialog])

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

  const handleDelete = (itemNo: number) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter((item) => item.itemNo !== itemNo)

    // Reset all allocations to 0 for remaining records
    const resetData = updatedData.map((item) => ({
      ...item,
      allocAmt: 0,
    }))
    const resetArr = resetData as unknown as IArReceiptDt[]

    // Recalculate local amounts and gain/loss after reset
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    const exhRate = Number(form.getValues("exhRate")) || 1
    for (let i = 0; i < resetArr.length; i++) {
      calauteLocalAmtandGainLoss(resetArr, i, exhRate, dec)
    }

    // Update reset data with calculated values
    const finalResetData: ArReceiptDtSchemaType[] = resetData.map(
      (item, index) => ({
        ...item,
        allocLocalAmt: resetArr[index]?.allocLocalAmt || 0,
        exhGainLoss: resetArr[index]?.exhGainLoss || 0,
      })
    )

    // Reset sums
    const resetSumAllocAmt = 0
    const resetSumAllocLocalAmt = 0
    const resetSumExhGainLoss = 0

    // Recalculate unallocated amounts
    const totAmt = Number(form.getValues("totAmt")) || 0
    const totLocalAmt = Number(form.getValues("totLocalAmt")) || 0
    const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
      totAmt,
      totLocalAmt,
      resetSumAllocAmt,
      resetSumAllocLocalAmt,
      dec
    )

    // Update form values
    form.setValue("data_details", finalResetData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(finalResetData)
    form.setValue("allocTotAmt", resetSumAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", resetSumAllocLocalAmt, {
      shouldDirty: true,
    })
    form.setValue("exhGainLoss", resetSumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
      shouldDirty: true,
    })
    setIsAllocated(false)
    form.trigger("data_details")
    setRefreshKey((prev) => prev + 1)
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => !selectedItemNos.includes(item.itemNo)
    )

    // Reset all allocations to 0 for remaining records
    const resetData = updatedData.map((item) => ({
      ...item,
      allocAmt: 0,
    }))
    const resetArr = resetData as unknown as IArReceiptDt[]

    // Recalculate local amounts and gain/loss after reset
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    const exhRate = Number(form.getValues("exhRate")) || 1
    for (let i = 0; i < resetArr.length; i++) {
      calauteLocalAmtandGainLoss(resetArr, i, exhRate, dec)
    }

    // Update reset data with calculated values
    const finalResetData: ArReceiptDtSchemaType[] = resetData.map(
      (item, index) => ({
        ...item,
        allocLocalAmt: resetArr[index]?.allocLocalAmt || 0,
        exhGainLoss: resetArr[index]?.exhGainLoss || 0,
      })
    )

    // Reset sums
    const resetSumAllocAmt = 0
    const resetSumAllocLocalAmt = 0
    const resetSumExhGainLoss = 0

    // Recalculate unallocated amounts
    const totAmt = Number(form.getValues("totAmt")) || 0
    const totLocalAmt = Number(form.getValues("totLocalAmt")) || 0
    const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
      totAmt,
      totLocalAmt,
      resetSumAllocAmt,
      resetSumAllocLocalAmt,
      dec
    )

    // Update form values
    form.setValue("data_details", finalResetData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(finalResetData)
    form.setValue("allocTotAmt", resetSumAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", resetSumAllocLocalAmt, {
      shouldDirty: true,
    })
    form.setValue("exhGainLoss", resetSumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
      shouldDirty: true,
    })
    setIsAllocated(false)
    form.trigger("data_details")
    setRefreshKey((prev) => prev + 1)
  }

  const handleDataReorder = (newData: IArReceiptDt[]) => {
    form.setValue("data_details", newData as unknown as ArReceiptDtSchemaType[])
    setDataDetails(newData as unknown as ArReceiptDtSchemaType[])
  }

  // ==================== HELPER FUNCTIONS ====================

  const validateAllocation = useCallback((data: ArReceiptDtSchemaType[]) => {
    if (!validateAllocationHelper(data as unknown as IArReceiptDt[])) {
      return false
    }
    return true
  }, [])

  // Helper function to update allocation calculations
  const updateAllocationCalculations = useCallback(
    (
      updatedData: ArReceiptDtSchemaType[],
      rowIndex: number,
      allocValue: number
    ) => {
      // console.log(
      //   "updateAllocationCalculations",
      //   updatedData,
      //   rowIndex,
      //   allocValue
      // )
      const arr = updatedData as unknown as IArReceiptDt[]
      if (rowIndex === -1 || rowIndex >= arr.length) return

      const exhRate = Number(form.getValues("exhRate"))
      const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
      const totAmt = Number(form.getValues("totAmt")) || 0

      calculateManualAllocation(arr, rowIndex, allocValue, totAmt, dec)

      calauteLocalAmtandGainLoss(arr, rowIndex, exhRate, dec)

      const sumAllocAmt = arr.reduce((s, r) => s + (Number(r.allocAmt) || 0), 0)
      const sumAllocLocalAmt = arr.reduce(
        (s, r) => s + (Number(r.allocLocalAmt) || 0),
        0
      )
      const sumExhGainLoss = arr.reduce(
        (s, r) => s + (Number(r.exhGainLoss) || 0),
        0
      )

      form.setValue("data_details", updatedData, {
        shouldDirty: true,
        shouldTouch: true,
      })
      setDataDetails(updatedData)
      form.setValue("allocTotAmt", sumAllocAmt, { shouldDirty: true })
      form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
      form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })

      const totLocalAmt = Number(form.getValues("totLocalAmt"))

      const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
        totAmt,
        totLocalAmt,
        sumAllocAmt,
        sumAllocLocalAmt,
        dec
      )

      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, {
        shouldDirty: true,
      })
      form.trigger("data_details")
      setRefreshKey((prev) => prev + 1)
    },
    [form, decimals]
  )

  // Handle cell edit for allocAmt field
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      if (field !== "allocAmt") return

      const currentData = form.getValues("data_details") || []
      const currentItem = currentData.find((item) => item.itemNo === itemNo)
      const currentValue = currentItem?.allocAmt || 0

      if (currentValue === value) {
        return
      }

      // Don't allow manual entry when totAmt = 0
      const headerTotAmt = Number(form.getValues("totAmt")) || 0
      // console.log("headerTotAmt", headerTotAmt)
      if (headerTotAmt === 0) {
        // console.log("Don't allow manual entry when totAmt = 0")
        toast.error(
          "Total Amount is zero. Cannot manually allocate. Please use Auto Allocation or enter Total Amount."
        )
        // Set amount to 0
        const updatedData = [...currentData]

        // console.log("updatedData", updatedData)
        const arr = updatedData as unknown as IArReceiptDt[]
        const rowIndex = arr.findIndex((r) => r.itemNo === itemNo)
        if (rowIndex === -1) return

        updateAllocationCalculations(updatedData, rowIndex, 0)
        return
      } else {
        // When totAmt > 0, allow manual entry with validation
        // console.log("When totAmt > 0, allow manual entry with validation")
        const updatedData = [...currentData]
        const arr = updatedData as unknown as IArReceiptDt[]
        const rowIndex = arr.findIndex((r) => r.itemNo === itemNo)
        if (rowIndex === -1) return

        updateAllocationCalculations(updatedData, rowIndex, value)
      }
    },
    [form, updateAllocationCalculations]
  )

  // ==================== MAIN FUNCTIONS ====================

  const handleAutoAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (!validateAllocation(currentData)) return

    const totAmt = Number(form.getValues("totAmt")) || 0
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    const result = autoAllocateAmounts(
      currentData as unknown as IArReceiptDt[],
      totAmt,
      dec
    )
    const updatedData =
      result.updatedDetails as unknown as ArReceiptDtSchemaType[]

    const arr = updatedData as unknown as IArReceiptDt[]
    const exhRate = Number(form.getValues("exhRate")) || 1
    for (let i = 0; i < arr.length; i++) {
      calauteLocalAmtandGainLoss(arr, i, exhRate, dec)
    }
    const totLocalAmt = Number(form.getValues("totLocalAmt")) || 0
    const sumAllocAmt = arr.reduce((s, r) => s + (Number(r.allocAmt) || 0), 0)
    const sumAllocLocalAmt = arr.reduce(
      (s, r) => s + (Number(r.allocLocalAmt) || 0),
      0
    )
    const sumExhGainLoss = arr.reduce(
      (s, r) => s + (Number(r.exhGainLoss) || 0),
      0
    )

    // If totAmt was 0, update it with the calculated sumAllocAmt
    const finalTotAmt = totAmt === 0 ? sumAllocAmt : totAmt

    const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
      finalTotAmt,
      totLocalAmt,
      sumAllocAmt,
      sumAllocLocalAmt,
      dec
    )

    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(updatedData)

    // Update totAmt if it was 0
    if (totAmt === 0) {
      form.setValue("totAmt", sumAllocAmt, { shouldDirty: true })
      form.setValue("totLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
      form.setValue("recTotAmt", sumAllocAmt, { shouldDirty: true })
      form.setValue("recTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
    }

    form.setValue("allocTotAmt", sumAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
    form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, { shouldDirty: true })
    form.trigger("data_details")
    setRefreshKey((prev) => prev + 1)
    setIsAllocated(true)
  }, [form, validateAllocation, decimals])

  const handleResetAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (currentData.length === 0) {
      return
    }

    const updatedData = currentData.map((item) => ({
      ...item,
      allocAmt: 0,
    }))
    const arr = updatedData as unknown as IArReceiptDt[]
    const exhRate = Number(form.getValues("exhRate")) || 1
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    for (let i = 0; i < arr.length; i++) {
      calauteLocalAmtandGainLoss(arr, i, exhRate, dec)
    }
    const sumAllocAmt = 0
    const sumAllocLocalAmt = 0
    const sumExhGainLoss = 0
    const totAmt = Number(form.getValues("totAmt")) || 0
    const totLocalAmt = Number(form.getValues("totLocalAmt")) || 0
    const { unAllocAmt, unAllocLocalAmt } = calculateUnallocated(
      totAmt,
      totLocalAmt,
      sumAllocAmt,
      sumAllocLocalAmt,
      dec
    )

    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(updatedData)
    form.setValue("allocTotAmt", sumAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
    form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
    form.setValue("unAllocTotLocalAmt", unAllocLocalAmt, { shouldDirty: true })
    form.trigger("data_details")
    setRefreshKey((prev) => prev + 1)
    setIsAllocated(false)
  }, [form, decimals])

  // Check if customer is selected
  const customerId = form.watch("customerId")
  const currencyId = form.watch("currencyId")
  const accountDate = form.watch("accountDate")
  const isCustomerSelected = customerId && customerId > 0

  const handleSelectTransaction = useCallback(() => {
    if (!customerId || !currencyId || !accountDate) {
      return
    }

    dialogParamsRef.current = {
      customerId,
      currencyId,
      accountDate: accountDate?.toString() || "",
    }

    setShowTransactionDialog(true)
  }, [customerId, currencyId, accountDate])

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

      setDataDetails(updatedData)
      form.trigger("data_details")
      setShowTransactionDialog(false)
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
        isCancelled={isCancelled}
        dataDetails={dataDetails}
      />

      <div className="px-2 pt-1">
        {/* Control Row */}
        <div className="mb-2 flex items-center gap-1">
          <Button
            onClick={handleSelectTransaction}
            disabled={!isCustomerSelected}
            className={
              !isCustomerSelected ? "cursor-not-allowed opacity-50" : ""
            }
          >
            <Plus className="h-4 w-4" />
            Select Transaction
          </Button>
          <Button
            onClick={handleAutoAllocation}
            disabled={isAllocated || dataDetails.length === 0}
            className={
              isAllocated || dataDetails.length === 0
                ? "cursor-not-allowed opacity-50"
                : ""
            }
          >
            <Zap className="h-4 w-4" />
            Auto Allocation
          </Button>
          <Button
            variant="destructive"
            onClick={handleResetAllocation}
            disabled={!isAllocated}
            className={!isAllocated ? "cursor-not-allowed opacity-50" : ""}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Allocation
          </Button>
          <Badge
            variant="secondary"
            className="border-blue-200 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
          >
            Total Alloc: {(form.getValues("allocTotAmt") || 0).toFixed(amtDec)}
          </Badge>
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800"
          >
            Total Local:{" "}
            {(form.getValues("allocTotLocalAmt") || 0).toFixed(locAmtDec)}
          </Badge>
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800"
          >
            Balance Amt: {totalBalanceAmt.toFixed(amtDec)}
          </Badge>
        </div>

        <ReceiptDetailsTable
          key={refreshKey}
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
