"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { IPayRunHistory } from "@/interfaces/payrun"
import { toast } from "sonner"

import { useGet, usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PayRunHistoryTable() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedPayRunId, setSelectedPayRunId] = useState<number | null>(null)

  const { data: payRunData, refetch } = useGet<IPayRunHistory[]>(
    `/hr/payrollruns/history`,
    "pay-history"
  )
  const payRun = payRunData?.data as unknown as IPayRunHistory[]

  // Use usePersist for posting account
  const { mutate: postAccount, isPending: isPosting } = usePersist(
    `/hr/payrollruns/account-post/${selectedPayRunId}`
  )

  const handleRowClick = (payrollRunId: number) => {
    // Navigate to the payrun details page
    router.push(`/${companyId}/hr/payruns/${payrollRunId}/summary`)
  }

  const handlePostAction = (payrollRunId: number) => {
    setSelectedPayRunId(payrollRunId)
    setShowConfirmDialog(true)
  }

  const handleConfirmPost = () => {
    if (!selectedPayRunId) return

    // Use usePersist to call the account-post API
    postAccount(
      {
        payRunId: selectedPayRunId,
      },
      {
        onSuccess: (response: { result?: number }) => {
          if (response?.result === 1) {
            toast.success("Payroll run posted successfully!")
            setShowConfirmDialog(false)
            setSelectedPayRunId(null)
            // Refresh the table data
            refetch()
          } else {
            toast.error("Failed to post payroll run")
          }
        },
        onError: (error: Error) => {
          console.error("Error posting payroll run:", error)
          toast.error("Failed to post payroll run")
          setShowConfirmDialog(false)
          setSelectedPayRunId(null)
        },
      }
    )
  }

  const handleCancelPost = () => {
    setShowConfirmDialog(false)
    setSelectedPayRunId(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-medium">PAYMENT DATE</th>
                <th className="p-4 text-left font-medium">PAYROLL NAME</th>
                <th className="p-4 text-left font-medium">PAY PERIOD</th>
                <th className="p-4 text-left font-medium">STATUS</th>
                <th className="p-4 text-left font-medium">POST</th>
              </tr>
            </thead>
            <tbody>
              {payRun && Array.isArray(payRun) ? (
                payRun.map((payRun) => (
                  <tr
                    key={payRun.payrollRunId}
                    className="hover:bg-muted/50 cursor-pointer border-b"
                    onClick={() => handleRowClick(payRun.payrollRunId)}
                  >
                    <td className="p-4">
                      {new Date(payRun.payDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">{payRun.payName}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{payRun.payPeriodStart}</p>
                        <p className="text-muted-foreground text-sm">
                          to {payRun.payPeriodEnd}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="default"
                        className={
                          payRun.status === "Paid"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {payRun.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {payRun.isPost ? (
                        <span className="font-medium text-green-600">
                          Posted
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click when clicking button
                            handlePostAction(payRun.payrollRunId)
                          }}
                        >
                          Not Posted
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground p-4 text-center"
                  >
                    {payRun ? "No payroll history found" : "Loading..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Post Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to post this payroll run? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelPost}
              disabled={isPosting}
            >
              No, Cancel
            </Button>
            <Button
              onClick={handleConfirmPost}
              className="bg-green-600 hover:bg-green-700"
              disabled={isPosting}
            >
              {isPosting ? "Posting..." : "Yes, Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
