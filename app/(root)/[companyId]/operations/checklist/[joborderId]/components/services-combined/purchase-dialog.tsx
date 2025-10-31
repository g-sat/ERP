"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IPurchaseData, ISavePurchaseData } from "@/interfaces/checklist"
import { useQuery } from "@tanstack/react-query"

import { getData, saveData } from "@/lib/api-client"
import { JobOrder_Purchase } from "@/lib/api-routes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { PurchaseTable } from "./purchase-table"

interface PurchaseDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  title?: string
  description?: string
  jobOrderId: number
  taskId: number
  serviceId: number
  isConfirmed: boolean
  onSave?: (purchaseData: IPurchaseData[]) => void
  onCancel?: () => void
}

export function PurchaseDialog({
  open,
  onOpenChangeAction,
  title = "Purchase",
  description = "Manage purchase details for this service.",
  jobOrderId,
  taskId,
  serviceId,
  isConfirmed,
  onSave,
  onCancel,
}: PurchaseDialogProps) {
  const [purchaseData, setPurchaseData] = useState<IPurchaseData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([])
  const isUpdatingRef = useRef(false)

  // Handle save action
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)

      console.log("selectedIds", selectedIds)
      console.log("purchaseData", purchaseData)

      // Prepare the data to send to API - map ALL items with isAllocated based on selection
      const purchaseListData: ISavePurchaseData[] = purchaseData.map(
        (item) => ({
          jobOrderId,
          taskId,
          serviceId,
          moduleId: item.moduleId,
          transactionId: item.transactionId,
          documentId: item.documentId,
          itemNo: item.itemNo,
          // Set isAllocated to true if item is in selectedIds, false otherwise
          isAllocated: selectedIds.includes(
            `${item.documentId}_${item.itemNo}`
          ),
        })
      )

      console.log("purchaseListData", purchaseListData)

      // Call the API
      await saveData(JobOrder_Purchase.saveBulkList, purchaseListData)

      // Reset unsaved changes flag
      setHasUnsavedChanges(false)

      // Call parent onSave callback if provided
      if (onSave) {
        onSave(purchaseData)
      }

      // Close dialog after successful save
      onOpenChangeAction(false)
    } catch (error) {
      console.error("Error saving purchase list:", error)
    } finally {
      setIsSaving(false)
    }
  }, [
    purchaseData,
    selectedIds,
    jobOrderId,
    taskId,
    serviceId,
    onSave,
    onOpenChangeAction,
  ])

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    onOpenChangeAction(false)
  }, [onCancel, onOpenChangeAction])

  // Handle bulk selection changes from table
  const handleBulkSelectionChange = useCallback((selectedIds: string[]) => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    setSelectedIds(selectedIds)
    // Note: hasUnsavedChanges will be updated automatically by useEffect
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 0)
  }, [])

  // Fetch purchase data when dialog opens
  const { data: purchaseResponse, isLoading } = useQuery({
    queryKey: [`purchase-list-${jobOrderId}-${taskId}-${serviceId}`],
    queryFn: async () => {
      const response = await getData(
        `${JobOrder_Purchase.getList}/${jobOrderId}/${taskId}/${serviceId}`
      )
      return response
    },
    enabled: open, // Only fetch when dialog is open
    staleTime: 0.5 * 60 * 1000, // 0.5 minutes
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Update data when API response is received
  useEffect(() => {
    if (purchaseResponse) {
      // Check if result is -1 (error case)
      if (purchaseResponse.result === -1) {
        onOpenChangeAction(false)
        alert(purchaseResponse.message || "No purchase data available")
        return
      }

      // Check if we have valid data
      if (purchaseResponse.result === 1 && purchaseResponse.data) {
        // Set all purchase data
        setPurchaseData(purchaseResponse.data)

        // Pre-select all items that are already allocated
        const preSelectedIds = purchaseResponse.data
          .filter((item: IPurchaseData) => item.isAllocated === true)
          .map((item: IPurchaseData) => `${item.documentId}_${item.itemNo}`)

        setInitialSelectedIds(preSelectedIds)
        setSelectedIds(preSelectedIds)
        setHasUnsavedChanges(false)
      } else {
        // Set empty arrays if no data
        setPurchaseData([])
        setSelectedIds([])
        setInitialSelectedIds([])
        setHasUnsavedChanges(false)
      }
    }
  }, [purchaseResponse, onOpenChangeAction])

  // Set unsaved changes when selections change from initial state
  useEffect(() => {
    const hasChanged =
      selectedIds.length !== initialSelectedIds.length ||
      !selectedIds.every((id) => initialSelectedIds.includes(id))
    setHasUnsavedChanges(hasChanged)
  }, [selectedIds, initialSelectedIds])

  const totalCount = purchaseData.length
  const allocatedCount = purchaseData.filter(
    (item) => item.isAllocated === true
  ).length
  const unallocatedCount = purchaseData.filter(
    (item) => item.isAllocated === false
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent
        className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <>
          {/* Data Summary */}
          <div className="bg-muted/30 mb-4 rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">
                    Total: {totalCount} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">
                    Allocated: {allocatedCount} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="text-muted-foreground">
                    Unallocated: {unallocatedCount} items
                  </span>
                </div>
              </div>
              {totalCount > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium">
                    Purchase data available
                  </span>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="mb-4 flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">
                  Loading purchase data...
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Please wait while we fetch the purchase list
                </p>
              </div>
            </div>
          ) : totalCount === 0 ? (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                <span className="text-sm font-medium">
                  No purchase data available for this service.
                </span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <PurchaseTable
                data={purchaseData}
                isLoading={isLoading}
                isConfirmed={isConfirmed}
                initialSelectedIds={initialSelectedIds}
                selectedIds={selectedIds}
                onBulkSelectionChange={handleBulkSelectionChange}
              />
            </div>
          )}
        </>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={
              isLoading || isConfirmed || isSaving || !hasUnsavedChanges
            }
          >
            {isSaving ? "Saving..." : "Save Selected Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PurchaseDialog
