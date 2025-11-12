"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  autoAllocateAmounts,
  calauteLocalAmtandGainLoss,
  calculateManualAllocation,
  calculateUnallocated,
  validateAllocation as validateAllocationHelper,
} from "@/helpers/ar-docSetOff-calculations"
import { IArOutTransaction } from "@/interfaces"
import { IArDocSetOffDt } from "@/interfaces/ar-docsetoff"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ArDocSetOffDtSchemaType,
  ArDocSetOffHdSchemaType,
} from "@/schemas/ar-docsetoff"
import { useAuthStore } from "@/stores/auth-store"
import { Plus, RotateCcw, Zap } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { ARTransactionId } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ArOutStandingTransactionsDialog from "@/components/accounttransaction/ar-outstandingtransactions-dialog"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"

import DocSetOffDetailsTable from "./docSetOff-details-table"
import DocSetOffForm from "./docSetOff-form"

interface MainProps {
  form: UseFormReturn<ArDocSetOffHdSchemaType>
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
  const [dataDetails, setDataDetails] = useState<ArDocSetOffDtSchemaType[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [pendingBulkDeleteItemNos, setPendingBulkDeleteItemNos] = useState<
    number[]
  >([])
  const dialogParamsRef = useRef<{
    customerId?: number
    currencyId?: number
    accountDate?: string
    isRefund?: boolean
    documentId?: string
    transactionId: number
  } | null>(null)

  const watchedDataDetails = form.watch("data_details")

  useEffect(() => {
    setDataDetails(watchedDataDetails || [])
  }, [watchedDataDetails])

  // Calculate sum of balAmt (balance amounts) from docSetOff details
  const totalBalanceAmt = useMemo(() => {
    return dataDetails.reduce((sum, detail) => {
      const balAmt =
        Number((detail as unknown as IArDocSetOffDt).docBalAmt) || 0
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

  const removeReceiptDetails = useCallback(
    (itemNos: number[]) => {
      if (!itemNos || itemNos.length === 0) return

      const normalizedItemNos = itemNos
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
      if (normalizedItemNos.length === 0) return

      const itemsToRemove = new Set(normalizedItemNos)
      const currentData = form.getValues("data_details") || []
      const updatedData = currentData.filter(
        (item) => !itemsToRemove.has(item.itemNo)
      )

      if (updatedData.length === currentData.length) {
        return
      }

      const resetData = updatedData.map((item) => ({
        ...item,
        allocAmt: 0,
      }))
      const resetArr = resetData as unknown as IArDocSetOffDt[]

      const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
      const exhRate = Number(form.getValues("exhRate")) || 1
      for (let i = 0; i < resetArr.length; i++) {
        calauteLocalAmtandGainLoss(resetArr, i, exhRate, dec)
      }

      const finalResetData: ArDocSetOffDtSchemaType[] = resetData.map(
        (item, index) => ({
          ...item,
          allocLocalAmt: resetArr[index]?.allocLocalAmt || 0,
          exhGainLoss: resetArr[index]?.exhGainLoss || 0,
        })
      )

      const resetSumAllocAmt = 0
      const resetSumExhGainLoss = 0

      const balAmt = Number(form.getValues("balAmt")) || 0
      const { unAllocAmt } = calculateUnallocated(balAmt, resetSumAllocAmt, dec)

      form.setValue("data_details", finalResetData, {
        shouldDirty: true,
        shouldTouch: true,
      })
      setDataDetails(finalResetData)
      form.setValue("allocTotAmt", resetSumAllocAmt, { shouldDirty: true })
      form.setValue("exhGainLoss", resetSumExhGainLoss, { shouldDirty: true })
      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      setIsAllocated(false)
      form.trigger("data_details")
      setRefreshKey((prev) => prev + 1)
    },
    [decimals, form]
  )

  const handleDelete = (itemNo: number) => {
    removeReceiptDetails([itemNo])
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const validItemNos = selectedItemNos.filter((itemNo) =>
      Number.isFinite(itemNo)
    )
    if (validItemNos.length === 0) return

    const uniqueItemNos = Array.from(new Set(validItemNos))
    setPendingBulkDeleteItemNos(uniqueItemNos)
    setIsBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = useCallback(() => {
    if (pendingBulkDeleteItemNos.length === 0) return
    removeReceiptDetails(pendingBulkDeleteItemNos)
    setPendingBulkDeleteItemNos([])
  }, [pendingBulkDeleteItemNos, removeReceiptDetails])

  const handleBulkDeleteCancel = useCallback(() => {
    setPendingBulkDeleteItemNos([])
  }, [])

  const handleBulkDeleteDialogChange = useCallback((open: boolean) => {
    setIsBulkDeleteDialogOpen(open)
    if (!open) {
      setPendingBulkDeleteItemNos([])
    }
  }, [])

  const bulkDeleteItemName = useMemo(() => {
    if (pendingBulkDeleteItemNos.length === 0) return undefined

    const matches = dataDetails.filter((detail) =>
      pendingBulkDeleteItemNos.includes(detail.itemNo)
    )

    if (matches.length === 0) {
      return `Selected items (${pendingBulkDeleteItemNos.length})`
    }

    const lines = matches.slice(0, 10).map((detail) => {
      const docNo = detail.documentNo ? detail.documentNo.toString().trim() : ""
      return docNo ? `Document ${docNo}` : `Item No ${detail.itemNo}`
    })

    if (matches.length > 10) {
      lines.push(`...and ${matches.length - 10} more`)
    }

    return lines.join("<br/>")
  }, [dataDetails, pendingBulkDeleteItemNos])

  const handleDataReorder = (newData: IArDocSetOffDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as ArDocSetOffDtSchemaType[]
    )
    setDataDetails(newData as unknown as ArDocSetOffDtSchemaType[])
  }

  // ==================== HELPER FUNCTIONS ====================

  const validateAllocation = useCallback((data: ArDocSetOffDtSchemaType[]) => {
    if (!validateAllocationHelper(data as unknown as IArDocSetOffDt[])) {
      return false
    }
    return true
  }, [])

  // Helper function to update allocation calculations
  const updateAllocationCalculations = useCallback(
    (
      updatedData: ArDocSetOffDtSchemaType[],
      rowIndex: number,
      allocValue: number
    ): number | undefined => {
      const arr = updatedData as unknown as IArDocSetOffDt[]
      if (rowIndex === -1 || rowIndex >= arr.length) return

      const exhRate = Number(form.getValues("exhRate"))
      const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
      const balAmt = Number(form.getValues("balAmt")) || 0

      // console.log(
      //   "updateAllocationCalculations",
      //   arr,
      //   rowIndex,
      //   allocValue,
      //   totAmt,
      //   dec
      // )

      const { result, wasAutoSetToZero } = calculateManualAllocation(
        arr,
        rowIndex,
        allocValue,
        dec
      )

      // Show toast if allocation was auto-set to zero due to remaining amount <= 0
      if (wasAutoSetToZero) {
        console.log(
          "updateAllocationCalculations wasAutoSetToZero",
          wasAutoSetToZero
        )
        toast.error("Now it's auto set to zero. Please check the allocation.")
      }

      const clampedValue =
        typeof result?.allocAmt === "number"
          ? Number(result.allocAmt)
          : Number(arr[rowIndex]?.allocAmt) || 0

      // Clamp to the absolute balance of the current row as a final safety check
      const balanceLimit = Math.abs(Number(arr[rowIndex]?.docBalAmt) || 0)
      const adjustedValue =
        Math.abs(clampedValue) > balanceLimit
          ? Math.sign(clampedValue) * balanceLimit
          : clampedValue

      if (adjustedValue !== clampedValue) {
        arr[rowIndex].allocAmt = adjustedValue
        if (adjustedValue === 0) {
          toast.error(
            "Allocation exceeds remaining balance. It has been reset."
          )
        }
      }

      // console.log(
      //   "updateAllocationCalculations calculateManualAllocation",
      //   arr,
      //   rowIndex,
      //   allocValue,
      //   totAmt,
      //   dec
      // )

      calauteLocalAmtandGainLoss(arr, rowIndex, exhRate, dec)

      const totalPositiveAlloc = arr.reduce(
        (sum, r) => sum + (Number(r.allocAmt) > 0 ? Number(r.allocAmt) : 0),
        0
      )
      const totalNegativeAllocAbs = arr.reduce(
        (sum, r) =>
          sum + (Number(r.allocAmt) < 0 ? Math.abs(Number(r.allocAmt)) : 0),
        0
      )
      const totalAllocated = Math.min(totalPositiveAlloc, totalNegativeAllocAbs)
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
      form.setValue("allocTotAmt", totalAllocated, { shouldDirty: true })
      form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
      form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })

      const { unAllocAmt } = calculateUnallocated(balAmt, totalAllocated, dec)
      form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
      form.trigger("data_details")
      setRefreshKey((prev) => prev + 1)

      return arr[rowIndex].allocAmt as number
    },
    [form, decimals]
  )

  // Handle cell edit for allocAmt field
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      if (field !== "allocAmt") return

      // console.log("handleCellEdit", itemNo, field, value)

      const currentData = form.getValues("data_details") || []
      const currentItem = currentData.find((item) => item.itemNo === itemNo)
      const currentValue = currentItem?.allocAmt || 0

      if (currentValue === value) {
        return currentValue
      }

      // Don't allow manual entry when totAmt = 0
      const headerBalAmt = Number(form.getValues("balAmt")) || 0
      if (headerBalAmt === 0) {
        toast.error(
          "Balance Amount is zero. Cannot manually allocate. Please use Auto Allocation or enter Balance Amount."
        )
        // Set amount to 0
        const updatedData = [...currentData]

        const arr = updatedData as unknown as IArDocSetOffDt[]
        const rowIndex = arr.findIndex((r) => r.itemNo === itemNo)
        if (rowIndex === -1) return

        const finalValue = updateAllocationCalculations(
          updatedData,
          rowIndex,
          0
        )
        return finalValue ?? 0
      } else {
        // console.log("handleCellEdit else", itemNo, field, value)
        // When balAmt > 0, allow manual entry with validation
        const updatedData = [...currentData]
        const arr = updatedData as unknown as IArDocSetOffDt[]
        const rowIndex = arr.findIndex((r) => r.itemNo === itemNo)
        if (rowIndex === -1) return

        // console.log(
        //   "handleCellEdit else updateAllocationCalculations",
        //   rowIndex,
        //   value
        // )
        const finalValue = updateAllocationCalculations(
          updatedData,
          rowIndex,
          value
        )
        return finalValue
      }
    },
    [form, updateAllocationCalculations]
  )

  // ==================== MAIN FUNCTIONS ====================

  const handleAutoAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (!validateAllocation(currentData)) return

    const balAmt = Number(form.getValues("balAmt")) || 0
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    const { updatedDetails: details, appliedTotal } = autoAllocateAmounts(
      currentData as unknown as IArDocSetOffDt[],
      dec
    )
    const updatedData = details as unknown as ArDocSetOffDtSchemaType[]

    const arr = updatedData as unknown as IArDocSetOffDt[]
    const exhRate = Number(form.getValues("exhRate")) || 1
    for (let i = 0; i < arr.length; i++) {
      calauteLocalAmtandGainLoss(arr, i, exhRate, dec)
    }
    const sumAllocLocalAmt = arr.reduce(
      (s, r) => s + (Number(r.allocLocalAmt) || 0),
      0
    )
    const sumExhGainLoss = arr.reduce(
      (s, r) => s + (Number(r.exhGainLoss) || 0),
      0
    )

    const totalAllocated = appliedTotal ?? 0

    // If balAmt was 0, update it with the calculated allocation total
    const finalBalAmt = balAmt === 0 ? totalAllocated : balAmt

    const { unAllocAmt } = calculateUnallocated(
      finalBalAmt,
      totalAllocated,
      dec
    )

    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(updatedData)

    form.setValue("allocTotAmt", totalAllocated, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
    form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
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
    const arr = updatedData as unknown as IArDocSetOffDt[]
    const exhRate = Number(form.getValues("exhRate")) || 1
    const dec = decimals[0] || { amtDec: 2, locAmtDec: 2 }
    for (let i = 0; i < arr.length; i++) {
      calauteLocalAmtandGainLoss(arr, i, exhRate, dec)
    }
    const sumAllocAmt = 0
    const sumAllocLocalAmt = 0
    const sumExhGainLoss = 0
    const balAmt = Number(form.getValues("balAmt")) || 0
    const { unAllocAmt } = calculateUnallocated(balAmt, sumAllocAmt, dec)

    form.setValue("data_details", updatedData, {
      shouldDirty: true,
      shouldTouch: true,
    })
    setDataDetails(updatedData)
    form.setValue("allocTotAmt", sumAllocAmt, { shouldDirty: true })
    form.setValue("allocTotLocalAmt", sumAllocLocalAmt, { shouldDirty: true })
    form.setValue("exhGainLoss", sumExhGainLoss, { shouldDirty: true })
    form.setValue("unAllocTotAmt", unAllocAmt, { shouldDirty: true })
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
      isRefund: false,
      documentId: form.getValues("setoffId") || "0",
      transactionId: ARTransactionId.docsetoff,
    }

    setShowTransactionDialog(true)
  }, [customerId, currencyId, accountDate, form])

  const handleAddSelectedTransactions = useCallback(
    (transactions: IArOutTransaction[]) => {
      const currentData = form.getValues("data_details") || []
      const nextItemNo =
        currentData.length > 0
          ? Math.max(...currentData.map((d) => d.itemNo)) + 1
          : 1

      const newDetails: ArDocSetOffDtSchemaType[] = transactions.map(
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

      setDataDetails(updatedData)
      form.trigger("data_details")
      setShowTransactionDialog(false)
    },
    [form, companyId]
  )

  return (
    <div className="w-full">
      <DocSetOffForm
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
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            onClick={handleSelectTransaction}
            disabled={!isCustomerSelected}
            className={
              !isCustomerSelected
                ? "cursor-not-allowed px-3 py-1 text-xs opacity-50"
                : "px-3 py-1 text-xs"
            }
            title="Select outstanding transactions"
          >
            <Plus className="h-4 w-4" />
            Select Txn
          </Button>
          <Button
            size="sm"
            onClick={handleAutoAllocation}
            // disabled={isAllocated || dataDetails.length === 0}
            // className={
            //   isAllocated || dataDetails.length === 0
            //     ? "cursor-not-allowed opacity-50"
            //     : ""
            // }
            className="px-3 py-1 text-xs"
            title="Auto allocate amounts"
          >
            <Zap className="h-4 w-4" />
            Auto Alloc
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetAllocation}
            disabled={!isAllocated}
            className={
              !isAllocated
                ? "cursor-not-allowed px-3 py-1 text-xs opacity-50"
                : "px-3 py-1 text-xs"
            }
            title="Reset all allocations"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Alloc
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

        <DocSetOffDetailsTable
          key={refreshKey}
          data={(dataDetails as unknown as IArDocSetOffDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onDataReorder={
            handleDataReorder as (newData: IArDocSetOffDt[]) => void
          }
          onCellEdit={handleCellEdit}
        />
      </div>

      <DeleteConfirmation
        open={isBulkDeleteDialogOpen}
        onOpenChange={handleBulkDeleteDialogChange}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={handleBulkDeleteCancel}
        itemName={bulkDeleteItemName}
        description="Selected docSetOff details will be removed. This action cannot be undone."
      />

      {/* Transaction Selection Dialog */}
      {showTransactionDialog && dialogParamsRef.current && (
        <ArOutStandingTransactionsDialog
          open={showTransactionDialog}
          onOpenChangeAction={setShowTransactionDialog}
          customerId={dialogParamsRef.current.customerId}
          currencyId={dialogParamsRef.current.currencyId}
          accountDate={dialogParamsRef.current.accountDate}
          isRefund={dialogParamsRef.current.isRefund}
          documentId={dialogParamsRef.current.documentId}
          transactionId={dialogParamsRef.current.transactionId}
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
