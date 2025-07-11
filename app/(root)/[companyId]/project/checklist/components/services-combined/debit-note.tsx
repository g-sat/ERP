import { useEffect, useState } from "react"
import { IDebitNoteDt, IDebitNoteHd, IJobOrderHd } from "@/interfaces/checklist"
import { DebitNoteDtFormValues } from "@/schemas/checklist"

import { TaskIdToName } from "@/lib/project-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import DebitNoteForm from "./debit-note-form"
import DebitNoteTable from "./debit-note-table"

const DebitNote = ({
  jobData,
  taskId,
  debitNoteHd,
  isConfirmed,
  companyId,
}: {
  jobData: IJobOrderHd
  taskId: number
  debitNoteHd?: IDebitNoteHd
  isConfirmed?: boolean
  companyId: string
}) => {
  const [details, setDetails] = useState<IDebitNoteDt[]>(
    debitNoteHd?.debitNoteDetails ?? []
  )
  console.log(isConfirmed, "isConfirmed debit note")
  console.log("debitNoteHd from debit note", debitNoteHd)
  console.log("details from debit note", debitNoteHd?.debitNoteDetails)

  // Update details when debitNoteHd changes
  useEffect(() => {
    setDetails(debitNoteHd?.debitNoteDetails ?? [])
  }, [debitNoteHd])

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [formKey, setFormKey] = useState(0) // Key to force form reset
  const [editingItem, setEditingItem] = useState<IDebitNoteDt | undefined>()

  // Helper to safely update details from form data
  const handleDetailSave = (data: DebitNoteDtFormValues) => {
    if (editingItem) {
      // Update existing item
      setDetails((prev) =>
        prev.map((item) =>
          item.itemNo === editingItem.itemNo ? { ...item, ...data } : item
        )
      )
    } else {
      // Add new item
      const newItem: IDebitNoteDt = {
        companyId: jobData.companyId,
        debitNoteId: debitNoteHd?.debitNoteId || 0,
        debitNoteNo: debitNoteHd?.debitNoteNo || "",
        itemNo: details.length + 1, // Auto-increment item number
        taskId: data.taskId,
        taskName: data.taskName,
        chargeId: data.chargeId,
        chargeName: data.chargeName,
        glId: data.glId,
        glName: data.glName,
        qty: data.qty,
        unitPrice: data.unitPrice,
        amtLocal: data.amtLocal,
        amt: data.amt,
        totAmt: data.totAmt,
        gstId: data.gstId,
        gstName: data.gstName,
        gstPercentage: data.gstPercentage,
        gstAmt: data.gstAmt,
        totAftGstAmt: data.totAftGstAmt,
        remarks: data.remarks,
        editVersion: data.editVersion,
        isServiceCharge: data.isServiceCharge,
        serviceCharge: data.serviceCharge,
      }
      setDetails((prev) => [...prev, newItem])
    }
    setShowFormDialog(false)
    setEditingItem(undefined)
  }

  // Handle edit item
  const handleEditItem = (item: IDebitNoteDt) => {
    setEditingItem(item)
    setShowFormDialog(true)
  }

  // Handle delete item
  const handleDeleteItem = (itemNo: number) => {
    setDetails((prev) => prev.filter((item) => item.itemNo !== itemNo))
  }

  // Handle dialog close and clear data
  const handleDialogClose = () => {
    setShowFormDialog(false)
    setEditingItem(undefined)
    // Reset form by changing the key
    setFormKey((prev) => prev + 1)
  }

  // Calculate totals
  const totals = details.reduce(
    (acc, item) => {
      acc.subTotal += item.totAmt || 0
      acc.gstTotal += item.gstAmt || 0
      acc.grandTotal += item.totAftGstAmt || 0
      return acc
    },
    { subTotal: 0, gstTotal: 0, grandTotal: 0 }
  )

  // Get task name by task ID from the debit note header
  const taskName = TaskIdToName[taskId] || "Unknown Task"

  return (
    <div className="@container">
      {/* Header Section */}
      <div className="bg-card mb-6 rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Job Order:</span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {jobData.jobOrderNo}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Debit Note:</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                {debitNoteHd?.debitNoteNo || "N/A"}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Charge:</span>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 hover:bg-purple-200"
              >
                {debitNoteHd?.chargeName || "N/A"}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Task:</span>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200"
              >
                {taskName}
              </Badge>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="rounded-md bg-blue-50 p-3 text-center">
              <div className="text-xs font-medium text-blue-600">
                Total Items
              </div>
              <div className="text-lg font-bold text-blue-800">
                {details.length}
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-3 text-center">
              <div className="text-xs font-medium text-green-600">
                Sub Total
              </div>
              <div className="text-lg font-bold text-green-800">
                ${totals.subTotal.toFixed(2)}
              </div>
            </div>
            <div className="rounded-md bg-purple-50 p-3 text-center">
              <div className="text-xs font-medium text-purple-600">
                GST Total
              </div>
              <div className="text-lg font-bold text-purple-800">
                ${totals.gstTotal.toFixed(2)}
              </div>
            </div>
            <div className="rounded-md bg-orange-50 p-3 text-center">
              <div className="text-xs font-medium text-orange-600">
                Grand Total
              </div>
              <div className="text-lg font-bold text-orange-800">
                ${totals.grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <DebitNoteTable
          data={details}
          onDebitNoteSelect={(item) => {
            // Handle view action - open form in view mode
            if (item) {
              setEditingItem(item)
              setShowFormDialog(true)
            }
          }}
          onEditDebitNote={handleEditItem}
          onDeleteDebitNote={(itemNo) => handleDeleteItem(Number(itemNo))}
          onCreateDebitNote={() => {
            setEditingItem(undefined)
            setShowFormDialog(true)
          }}
          isConfirmed={isConfirmed}
          companyId={companyId}
        />

        {/* Action Buttons */}
        <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              disabled={isConfirmed}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete{" "}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isConfirmed}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Delete Selected
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={handleDialogClose}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Debit Note Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={handleDialogClose}>
        <DialogContent
          className="w-[70vw] !max-w-none"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">
              {isConfirmed && editingItem
                ? "View Debit Note Details"
                : editingItem
                  ? "Edit Debit Note Details"
                  : "Create Debit Note Details"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isConfirmed && editingItem
                ? "View debit note details for this job order."
                : editingItem
                  ? "Update debit note details for this job order."
                  : "Add new debit note details for this job order."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-1">
            <DebitNoteForm
              key={formKey}
              initialData={editingItem}
              submitAction={handleDetailSave}
              onCancel={handleDialogClose}
              isSubmitting={false}
              isConfirmed={isConfirmed}
              companyId={companyId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DebitNote
