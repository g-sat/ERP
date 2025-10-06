"use client"

import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { format } from "date-fns"
import { UseFormReturn } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface HistoryProps {
  form: UseFormReturn<GLContraHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function History({
  form,
  isEdit,
  moduleId,
  transactionId,
}: HistoryProps) {
  const { watch } = form
  const contra = watch()

  const getStatusInfo = () => {
    if (contra.isCancel) {
      return {
        status: "Cancelled",
        variant: "destructive" as const,
        date: contra.cancelDate,
        by: contra.cancelById,
        remarks: contra.cancelRemarks,
      }
    }
    if (contra.isPost) {
      return {
        status: "Posted",
        variant: "default" as const,
        date: contra.postDate,
        by: contra.postById,
        remarks: "Transaction has been posted to GL",
      }
    }
    if (contra.appStatusId && contra.appStatusId > 0) {
      return {
        status: "Pending Approval",
        variant: "secondary" as const,
        date: contra.appDate,
        by: contra.appById,
        remarks: "Awaiting approval",
      }
    }
    return {
      status: "Draft",
      variant: "outline" as const,
      date: contra.createDate,
      by: contra.createById,
      remarks: "Draft transaction",
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>
                  Date:{" "}
                  {statusInfo.date
                    ? format(new Date(statusInfo.date), "dd/MM/yyyy HH:mm")
                    : "N/A"}
                </p>
                <p>By: User ID {statusInfo.by || "N/A"}</p>
                {statusInfo.remarks && <p>Remarks: {statusInfo.remarks}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Creation Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Creation Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Created By</p>
              <p className="text-muted-foreground text-sm">
                User ID: {contra.createById || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Created Date</p>
              <p className="text-muted-foreground text-sm">
                {contra.createDate
                  ? format(new Date(contra.createDate), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Information */}
      {contra.editById && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Last Edit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Edited By</p>
                <p className="text-muted-foreground text-sm">
                  User ID: {contra.editById}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Edit Date</p>
                <p className="text-muted-foreground text-sm">
                  {contra.editDate
                    ? format(new Date(contra.editDate), "dd/MM/yyyy HH:mm")
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Edit Version</p>
              <p className="text-muted-foreground text-sm">
                Version: {contra.editVersion || 0} (Edit Count:{" "}
                {contra.editVer || 0})
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posting Information */}
      {contra.isPost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Posting Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Posted By</p>
                <p className="text-muted-foreground text-sm">
                  User ID: {contra.postById || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Post Date</p>
                <p className="text-muted-foreground text-sm">
                  {contra.postDate
                    ? format(new Date(contra.postDate), "dd/MM/yyyy HH:mm")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Information */}
      {contra.appStatusId && contra.appStatusId > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Approval Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Approval Status</p>
                <p className="text-muted-foreground text-sm">
                  Status ID: {contra.appStatusId}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Approved By</p>
                <p className="text-muted-foreground text-sm">
                  User ID: {contra.appById || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Approval Date</p>
              <p className="text-muted-foreground text-sm">
                {contra.appDate
                  ? format(new Date(contra.appDate), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Information */}
      {contra.isCancel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Cancellation Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Cancelled By</p>
                <p className="text-muted-foreground text-sm">
                  User ID: {contra.cancelById || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Cancel Date</p>
                <p className="text-muted-foreground text-sm">
                  {contra.cancelDate
                    ? format(new Date(contra.cancelDate), "dd/MM/yyyy HH:mm")
                    : "N/A"}
                </p>
              </div>
            </div>
            {contra.cancelRemarks && (
              <div className="mt-4">
                <p className="text-sm font-medium">Cancel Remarks</p>
                <p className="text-muted-foreground text-sm">
                  {contra.cancelRemarks}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Contra Number</p>
              <p className="text-muted-foreground text-sm">
                {contra.contraNo || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Reference Number</p>
              <p className="text-muted-foreground text-sm">
                {contra.referenceNo || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Module From</p>
              <p className="text-muted-foreground text-sm">
                {contra.moduleFrom || "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-muted-foreground text-sm">
                {contra.totAmt ? contra.totAmt.toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Local Amount</p>
              <p className="text-muted-foreground text-sm">
                {contra.totLocalAmt ? contra.totLocalAmt.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
