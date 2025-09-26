"use client"

import { useCallback, useEffect, useState } from "react"
import { Receipt } from "lucide-react"

import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Debit Note Item Interface
export interface IDebitNoteItem {
  DebitNoteId: number
  TaskId: number
  TaskName?: string
  DebitNoteNo: string
  ItemNo: number
  ActualItemNo?: number
}

// Save Debit Note Item Interface
export interface ISaveDebitNoteItemNo {
  debitNoteId: number
  debitNoteNo: string
  itemNo: number
}

interface DebitNoteItemsTableProps {
  jobOrderId: string
}

export function DebitNoteItemsTable({ jobOrderId }: DebitNoteItemsTableProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [debitNoteData, setDebitNoteData] = useState<IDebitNoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("DebitNoteItemsTable - jobOrderId:", jobOrderId)

  // Fetch debit note data
  const fetchDebitNoteData = useCallback(async () => {
    if (!jobOrderId) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get(
        `/operations/GetDebitNote/${jobOrderId}`
      )
      if (response.data.result === 1) {
        const data = response.data.data || []
        setDebitNoteData(data)
      } else {
        setError("Failed to fetch debit note data")
      }
    } catch (err) {
      console.error("Error fetching debit note data:", err)
      setError("Error fetching debit note data")
    } finally {
      setLoading(false)
    }
  }, [jobOrderId])

  // Save debit note data
  const saveDebitNoteData = async () => {
    if (!debitNoteData.length) return

    setSaving(true)
    setError(null)

    try {
      const saveData: ISaveDebitNoteItemNo[] = debitNoteData.map((item) => ({
        debitNoteId: item.DebitNoteId,
        debitNoteNo: item.DebitNoteNo,
        itemNo: item.ItemNo,
      }))

      const response = await apiClient.post(
        "/operations/SaveDebitNoteItemNo",
        saveData
      )
      if (response.data.result === 1) {
        console.log("Debit note data saved successfully")
        setShowDialog(false)
      } else {
        setError("Failed to save debit note data")
      }
    } catch (err) {
      console.error("Error saving debit note data:", err)
      setError("Error saving debit note data")
    } finally {
      setSaving(false)
    }
  }

  // Load data when dialog opens
  useEffect(() => {
    if (showDialog && jobOrderId) {
      fetchDebitNoteData()
    }
  }, [showDialog, jobOrderId, fetchDebitNoteData])

  return (
    <>
      {/* Debit Note No. Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setShowDialog(true)
        }}
      >
        <Receipt className="mr-1 h-4 w-4" />
      </Button>

      {/* Debit Note Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="h-[600px] w-[800px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Debit Note Details</DialogTitle>
            <DialogDescription>
              Manage debit note number and item number for this job order.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Loading debit note data...
                </div>
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Debit Note No.</TableHead>
                      <TableHead>Item No.</TableHead>
                      <TableHead>Actual Item No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debitNoteData.length > 0 ? (
                      debitNoteData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.DebitNoteNo}</TableCell>
                          <TableCell>{item.ItemNo}</TableCell>
                          <TableCell>{item.ActualItemNo || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-muted-foreground text-center"
                        >
                          No debit note data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            <Button
              onClick={saveDebitNoteData}
              disabled={saving || loading || debitNoteData.length === 0}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
