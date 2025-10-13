"use client"

import { useCallback, useEffect, useState } from "react"
import { IApOutTransaction } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"

import { getById } from "@/lib/api-client"
import { Account } from "@/lib/api-routes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import OutStandingTransactionsTable from "./outstandingtransactions-table"

interface OutStandingTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: number
  currencyId?: number
  accountDate?: string
  visible: IVisibleFields
  onAddSelected?: (transactions: IApOutTransaction[]) => void
}

export default function OutStandingTransactionsDialog({
  open,
  onOpenChange,
  supplierId,
  currencyId,
  accountDate,
  visible,
  onAddSelected,
}: OutStandingTransactionsDialogProps) {
  const [outTransactions, setOutTransactions] = useState<IApOutTransaction[]>(
    []
  )
  const [_isLoading, setIsLoading] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectedTotAmt, setSelectedTotAmt] = useState<number>(0)
  const [selectedTotLocalAmt, setSelectedTotLocalAmt] = useState<number>(0)

  // Load transactions when dialog opens
  useEffect(() => {
    if (!open || !supplierId || !currencyId || !accountDate) return

    const loadTransactions = async () => {
      setIsLoading(true)
      setSelectedTransactions([])

      try {
        const response = await getById(
          `${Account.getApOutstandTransaction}/${supplierId}/${currencyId}/${accountDate}`
        )

        console.log("response", response)

        if (response?.result === 1) {
          setOutTransactions(response.data || [])
        } else {
          setOutTransactions([])
          console.error(
            "Failed to fetch outstanding transactions:",
            response?.message
          )
        }
      } catch (error) {
        console.error("Error fetching outstanding transactions:", error)
        setOutTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
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
    setSelectedTotAmt(totAmt)
    setSelectedTotLocalAmt(totLocalAmt)
  }, [selectedTransactions, outTransactions, calculateSelectedTotals])

  const handleBulkSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedTransactions(selectedIds)
  }, [])

  const handleAddSelected = useCallback(() => {
    if (selectedTransactions.length === 0) return

    const selectedTransactionsData = selectedTransactions
      .map((docId) => {
        return outTransactions.find((t) => t.documentId.toString() === docId)
      })
      .filter((t): t is IApOutTransaction => t !== undefined)

    if (onAddSelected) {
      onAddSelected(selectedTransactionsData)
    }

    // Reset selection and close dialog
    setSelectedTransactions([])
    onOpenChange(false)
  }, [selectedTransactions, outTransactions, onAddSelected, onOpenChange])

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
      <DialogContent className="flex h-[90vh] w-[90vw] !max-w-none flex-col overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>AP Transaction List</DialogTitle>
          <DialogDescription>
            Select outstanding transactions to add to the payment.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Input Fields */}
        <div className="flex gap-4 py-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Selected Total Amount</label>
            <Input
              value={selectedTotAmt.toFixed(2)}
              readOnly
              className="bg-muted/5 w-[150px] text-right"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Selected Total Local Amount
            </label>
            <Input
              value={selectedTotLocalAmt.toFixed(2)}
              readOnly
              className="bg-muted/5 w-[150px] text-right"
            />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="flex-1 overflow-hidden">
          <OutStandingTransactionsTable
            data={outTransactions}
            visible={visible}
            onRefresh={handleRefresh}
            onFilterChange={handleFilterChange}
            onSelect={handleSelect}
            onBulkSelectionChange={handleBulkSelectionChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {selectedTransactions.length} transaction(s) selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedTransactions.length === 0}
              >
                Selected Item ({selectedTransactions.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
