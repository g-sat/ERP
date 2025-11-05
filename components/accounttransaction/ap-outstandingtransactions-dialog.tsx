"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IApOutTransaction } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { useAuthStore } from "@/stores/auth-store"
import { format, parse } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getById } from "@/lib/api-client"
import { Account } from "@/lib/api-routes"
import { clientDateFormat } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CustomNumberInput } from "@/components/custom"

import ApOutStandingTransactionsTable from "./ap-outstandingtransactions-table"

interface ApOutStandingTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: number
  currencyId?: number
  accountDate?: string
  visible: IVisibleFields
  onAddSelected?: (transactions: IApOutTransaction[]) => void
  existingDocumentIds?: number[] // Array of already selected document IDs
}

export default function ApOutStandingTransactionsDialog({
  open,
  onOpenChange,
  supplierId,
  currencyId,
  accountDate,
  visible,
  onAddSelected,
  existingDocumentIds = [],
}: ApOutStandingTransactionsDialogProps) {
  console.log("Dialog component rendered with props:", {
    open,
    supplierId,
    currencyId,
    accountDate,
  })
  const [outTransactions, setOutTransactions] = useState<IApOutTransaction[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  // Create a minimal form for the summary fields
  const summaryForm = useForm<{
    selectedTotAmt: number
    selectedTotLocalAmt: number
  }>({
    defaultValues: {
      selectedTotAmt: 0,
      selectedTotLocalAmt: 0,
    },
  })

  // Use ref to prevent duplicate API calls
  const isLoadingRef = useRef(false)
  const lastLoadParamsRef = useRef<string>("")

  // Initialize selected transactions with existing ones when dialog opens
  useEffect(() => {
    if (
      open &&
      outTransactions.length > 0 &&
      selectedTransactions.length === 0
    ) {
      setSelectedTransactions(existingDocumentIds.map(String))
    }
  }, [
    open,
    outTransactions.length,
    existingDocumentIds,
    selectedTransactions.length,
  ])

  // Load transactions when dialog opens
  useEffect(() => {
    console.log("useEffect triggered with:", {
      open,
      supplierId,
      currencyId,
      accountDate,
    })

    if (!open || !supplierId || !currencyId || !accountDate) {
      console.log("Dialog conditions not met:", {
        open,
        supplierId,
        currencyId,
        accountDate,
      })
      return
    }

    // Create a unique key for current params
    const paramsKey = `${supplierId}-${currencyId}-${accountDate}`

    // Prevent duplicate calls with same parameters (only if actively loading)
    if (isLoadingRef.current && lastLoadParamsRef.current === paramsKey) {
      console.log("API call already in progress, skipping duplicate")
      return
    }

    // Reset the flag for this new effect run
    if (lastLoadParamsRef.current !== paramsKey) {
      isLoadingRef.current = false
    }

    console.log("All conditions met, proceeding with API call")

    const loadTransactions = async () => {
      // Set loading flag and store params
      isLoadingRef.current = true
      lastLoadParamsRef.current = paramsKey

      console.log("Loading transactions with params:", {
        supplierId,
        currencyId,
        accountDate,
      })

      setIsLoading(true)
      setSelectedTransactions([])

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error("API call timeout - taking too long")
        toast.error("Request timeout", {
          description:
            "Loading transactions is taking too long. Please try again.",
        })
        setIsLoading(false)
        isLoadingRef.current = false
        setOutTransactions([])
      }, 30000) // 30 second timeout

      try {
        // Format the date properly for the API (YYYY-MM-DD format)
        const dt = format(
          parse(accountDate, clientDateFormat, new Date()),
          "yyyy-MM-dd"
        )
        const url = `${Account.getApOutstandTransaction}/${supplierId}/${currencyId}/${dt}`
        console.log("API URL:", url)
        console.log("Formatted date:", dt)
        console.log("Starting API call at:", new Date().toISOString())

        const response = await getById(url)

        console.log("API call completed at:", new Date().toISOString())
        console.log("API Response:", response)

        // Clear timeout since API call completed
        clearTimeout(timeoutId)

        console.log("Response received, updating state...")
        console.log("Response result:", response?.result)
        console.log("Response data length:", response?.data?.length)

        if (response?.result === 1) {
          // Show all transactions (don't filter)
          const allTransactions = response.data || []

          console.log("Setting transactions:", allTransactions.length, "items")
          setOutTransactions(allTransactions)
          console.log("Transactions loaded successfully!")
          console.log("Already selected document IDs:", existingDocumentIds)
        } else {
          console.log("Response result is not 1, setting empty array")
          setOutTransactions([])
          const errorMsg = response?.message || "Failed to load transactions"
          console.error("Failed to fetch outstanding transactions:", errorMsg)
          toast.error("Failed to load transactions", {
            description: errorMsg,
          })
        }
      } catch (error) {
        // Clear timeout on error
        clearTimeout(timeoutId)

        console.error("Error fetching outstanding transactions:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        toast.error("Error loading transactions", {
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        })
        setOutTransactions([])
      } finally {
        console.log("Finally block - resetting loading state")
        setIsLoading(false)
        isLoadingRef.current = false
      }
    }

    // Call the function immediately
    loadTransactions()

    // No cleanup function - let the request complete naturally
    // State updates are safe and loading state will always be reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supplierId, currencyId, accountDate])

  // Function to calculate totals for selected transactions
  const calculateSelectedTotals = useCallback(
    (selectedIds: string[], transactions: IApOutTransaction[]) => {
      console.log("selectedIds", selectedIds)
      console.log("transactions", transactions)

      if (selectedIds.length === 0) {
        return { totAmt: 0, totLocalAmt: 0 }
      }

      let totAmt = 0
      let totLocalAmt = 0

      selectedIds.forEach((docId) => {
        console.log("docId", docId)
        console.log("transactions", transactions)
        const transaction = transactions.find(
          (t) => t.documentId.toString() === docId
        )
        if (transaction) {
          totAmt += transaction.balAmt || 0
          totLocalAmt += transaction.balLocalAmt || 0
        }
      })

      console.log("totAmt", totAmt)
      console.log("totLocalAmt", totLocalAmt)

      return { totAmt, totLocalAmt }
    },
    []
  )

  // Calculate totals when selection changes
  useEffect(() => {
    const { totAmt, totLocalAmt } = calculateSelectedTotals(
      selectedTransactions,
      outTransactions
    )
    // Update form values
    summaryForm.setValue("selectedTotAmt", totAmt)
    summaryForm.setValue("selectedTotLocalAmt", totLocalAmt)
  }, [
    selectedTransactions,
    outTransactions,
    calculateSelectedTotals,
    summaryForm,
  ])

  const handleBulkSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedTransactions(selectedIds)
  }, [])

  const handleAddSelected = useCallback(() => {
    if (selectedTransactions.length === 0) return

    // Filter to only include newly selected transactions (not existing ones)
    const newlySelectedIds = selectedTransactions.filter(
      (docId) => !existingDocumentIds.includes(Number(docId))
    )

    if (newlySelectedIds.length === 0) {
      console.log("No new transactions selected")
      onOpenChange(false)
      return
    }

    const selectedTransactionsData = newlySelectedIds
      .map((docId) => {
        return outTransactions.find((t) => t.documentId.toString() === docId)
      })
      .filter((t): t is IApOutTransaction => t !== undefined)

    console.log(
      "Adding newly selected transactions:",
      selectedTransactionsData.length
    )

    if (onAddSelected) {
      onAddSelected(selectedTransactionsData)
    }

    // Reset selection and close dialog
    setSelectedTransactions([])
    onOpenChange(false)
  }, [
    selectedTransactions,
    outTransactions,
    onAddSelected,
    onOpenChange,
    existingDocumentIds,
  ])

  const handleCancel = useCallback(() => {
    setSelectedTransactions([])
    onOpenChange(false)
  }, [onOpenChange])

  const handleRefresh = useCallback(() => {
    // Refresh is handled by the useEffect when dialog opens
  }, [])

  const handleFilterChange = useCallback(() => {}, [])

  const handleSelect = useCallback((_transaction: IApOutTransaction | null) => {
    // Optional: handle single selection if needed
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-[80vw] !max-w-none flex-col overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>AP Transaction List</DialogTitle>
          <DialogDescription>
            Select outstanding transactions to add to the payment.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Input Fields and Action Buttons */}
        <div className="flex items-end justify-between gap-4 pb-4">
          <div className="flex gap-4">
            <CustomNumberInput
              form={summaryForm}
              name="selectedTotAmt"
              label="Total Amount"
              isDisabled={true}
              round={amtDec}
              className="w-[150px]"
            />
            <CustomNumberInput
              form={summaryForm}
              name="selectedTotLocalAmt"
              label="Total Local Amount"
              isDisabled={true}
              round={locAmtDec}
              className="w-[150px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={
                selectedTransactions.filter(
                  (docId) => !existingDocumentIds.includes(Number(docId))
                ).length === 0
              }
            >
              Add Selected (
              {
                selectedTransactions.filter(
                  (docId) => !existingDocumentIds.includes(Number(docId))
                ).length
              }
              )
            </Button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">
                  Loading outstanding transactions...
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Fetching available transactions for payment
                </p>
              </div>
            </div>
          ) : (
            <ApOutStandingTransactionsTable
              data={outTransactions}
              visible={visible}
              onRefresh={handleRefresh}
              onFilterChange={handleFilterChange}
              onSelect={handleSelect}
              onBulkSelectionChange={handleBulkSelectionChange}
              initialSelectedIds={existingDocumentIds.map(String)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
