// main-tab.tsx - IMPROVED VERSION
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  handleScenarioC,
  validateAllocation as validateAllocationHelper,
} from "@/helpers/ar-receipt-calculations"
import { IArOutTransaction, IArReceiptDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ArReceiptDtSchemaType, ArReceiptHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { Plus, RotateCcw, Zap } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

// import { toast } from "sonner"

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
  const [lastScenarioCalled, setLastScenarioCalled] = useState<string>("None")
  const dialogParamsRef = useRef<{
    customerId: number
    currencyId: number
    accountDate: string
  } | null>(null)

  // Watch data_details for reactive updates
  const watchedDataDetails = form.watch("data_details")

  // Update local state when form data changes
  useEffect(() => {
    console.log("DataDetails updated from form:", watchedDataDetails)
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
    form.setValue("data_details", updatedData)
    setDataDetails(updatedData)
    form.trigger("data_details")

    // Clear allocation status if no data left
    if (updatedData.length === 0) {
      setIsAllocated(false)
    }
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => !selectedItemNos.includes(item.itemNo)
    )
    form.setValue("data_details", updatedData)
    setDataDetails(updatedData)
    form.trigger("data_details")

    // Clear allocation status if no data left
    if (updatedData.length === 0) {
      setIsAllocated(false)
    }
  }

  const handleDataReorder = (newData: IArReceiptDt[]) => {
    form.setValue("data_details", newData as unknown as ArReceiptDtSchemaType[])
    setDataDetails(newData as unknown as ArReceiptDtSchemaType[])
  }

  // ==================== HELPER FUNCTIONS ====================

  // Validation Function
  const validateAllocation = useCallback((data: ArReceiptDtSchemaType[]) => {
    if (!validateAllocationHelper(data as unknown as IArReceiptDt[])) {
      // toast.warning("No receipt details to allocate")
      return false
    }
    return true
  }, [])

  // Common function to call Scenario C and update form
  const callScenarioC = useCallback(
    (data: ArReceiptDtSchemaType[], source: string = "unknown") => {
      const totAmt = form.getValues("totAmt") || 0
      const exhRate = form.getValues("exhRate") || 1

      console.log(`🔄 SCENARIO C CALLED from: ${source}`)
      console.log(`📊 Input data:`, {
        totAmt,
        exhRate,
        dataLength: data.length,
      })

      // Update scenario tracking
      setLastScenarioCalled(`Scenario C (${source})`)

      // Call Scenario C
      const result = handleScenarioC(
        data as unknown as IArReceiptDt[],
        totAmt,
        exhRate,
        decimals[0] || { amtDec: 2, locAmtDec: 2 }
      )

      // Debug: Log the result to see what we're getting
      console.log("✅ Scenario C result:", result)

      // Update form with results
      console.log("Setting form data_details to:", result.updatedDetails)
      form.setValue(
        "data_details",
        result.updatedDetails as unknown as ArReceiptDtSchemaType[],
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      )

      // Verify the form was updated
      const updatedFormData = form.getValues("data_details")
      console.log("Form data_details after setValue:", updatedFormData)

      // Update local state as well
      setDataDetails(
        result.updatedDetails as unknown as ArReceiptDtSchemaType[]
      )

      // Update header amounts
      form.setValue("unAllocTotAmt", result.unAllocTotAmt, {
        shouldDirty: true,
      })
      form.setValue("unAllocTotLocalAmt", result.unAllocTotLocalAmt, {
        shouldDirty: true,
      })
      form.setValue("allocTotAmt", result.sumAllocAmt, { shouldDirty: true })
      form.setValue("allocTotLocalAmt", result.sumAllocLocalAmt, {
        shouldDirty: true,
      })
      form.setValue("exhGainLoss", result.sumExhGainLoss, { shouldDirty: true })

      // Trigger form validation and re-render
      form.trigger("data_details")

      // Force re-render by updating the form state
      form.trigger()

      // Force component re-render
      setRefreshKey((prev) => prev + 1)
    },
    [form, decimals]
  )

  // Handle cell edit for allocAmt field - call Scenario C
  const handleCellEdit = useCallback(
    (itemNo: number, field: string, value: number) => {
      if (field !== "allocAmt") return

      const currentData = form.getValues("data_details") || []

      // Find the current value for this item
      const currentItem = currentData.find((item) => item.itemNo === itemNo)
      const currentValue = currentItem?.allocAmt || 0

      console.log(`Cell edit - Item ${itemNo}: ${currentValue} → ${value}`)

      // Only proceed if value actually changed
      if (currentValue === value) {
        console.log(`Value unchanged for item ${itemNo} - skipping calculation`)
        return
      }

      // Update the specific item with new allocAmt
      const updatedData = currentData.map((item) => {
        if (item.itemNo === itemNo) {
          return {
            ...item,
            allocAmt: value,
          }
        }
        return item
      })

      console.log(
        `Value changed for item ${itemNo} - triggering Scenario C calculation`
      )
      // Call Scenario C with updated data
      callScenarioC(updatedData, "Cell Edit")
    },
    [form, callScenarioC]
  )

  // ==================== MAIN FUNCTIONS ====================

  // 1.1 Auto Allocation Button - calls Scenario C
  const handleAutoAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    // Validation
    if (!validateAllocation(currentData)) return

    // For auto allocation, we need to set allocAmt to docBalAmt for each item
    const updatedData = currentData.map((item) => ({
      ...item,
      allocAmt: item.docBalAmt || 0, // Set allocAmt to the balance amount
    }))

    console.log("Auto allocation - original data:", currentData)
    console.log("Auto allocation - updated data with allocAmt:", updatedData)

    // Call Scenario C with updated data
    callScenarioC(updatedData, "Auto Allocation")

    setIsAllocated(true)
    // toast.success("Auto allocation completed")
  }, [form, validateAllocation, callScenarioC])

  // 1.2 Reset Button - pass zero amounts and call Scenario C
  const handleResetAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []

    if (currentData.length === 0) {
      // toast.warning("No receipt details to reset")
      return
    }

    // Reset all allocation amounts to 0
    const updatedData = currentData.map((item) => ({
      ...item,
      allocAmt: 0,
    }))

    // Call Scenario C with reset data
    callScenarioC(updatedData, "Reset Allocation")

    setIsAllocated(false)
    // toast.success(`Reset ${currentData.length} allocation(s)`)
  }, [form, callScenarioC])

  // Check if customer is selected
  const customerId = form.watch("customerId")
  const currencyId = form.watch("currencyId")
  const accountDate = form.watch("accountDate")
  const isCustomerSelected = customerId && customerId > 0

  const handleSelectTransaction = useCallback(() => {
    if (!customerId || !currencyId || !accountDate) {
      // toast.warning("Please select Customer, Currency, Account Date first")
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

      // Update local state
      setDataDetails(updatedData)

      // Force form validation and re-render
      form.trigger("data_details")

      // Close the dialog
      setShowTransactionDialog(false)
      // toast.success(`Added ${transactions.length} transaction(s)`)
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
        onScenarioCalled={setLastScenarioCalled}
      />

      <div className="px-2 pt-1">
        {/* Control Row */}
        <div className="flex items-center gap-1">
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
        {/* Debug: Show current data details */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 bg-gray-100 p-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Debug Info:</strong>
                <br />
                <strong>Data Details Count:</strong> {dataDetails.length}
                <br />
                <strong>Last Scenario Called:</strong> {lastScenarioCalled}
                <br />
                <strong>Is Allocated:</strong> {isAllocated ? "Yes" : "No"}
              </div>
              <div>
                <strong>First Item:</strong>
                <br />
                <pre className="max-h-20 overflow-auto text-xs">
                  {JSON.stringify(dataDetails[0] || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
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
