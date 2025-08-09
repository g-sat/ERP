"use client"

import { IEmployerDetails } from "@/interfaces/employer-details"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  employerDetails: IEmployerDetails | null
}

export function EmployerDetailsView({
  open,
  onOpenChange,
  employerDetails,
}: Props) {
  if (!employerDetails) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employer Details</DialogTitle>
          <DialogDescription>
            View complete information about this employer details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Establishment ID
                </label>
                <p className="text-sm font-medium">
                  {employerDetails.establishmentId}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Employer Ref No
                </label>
                <p className="text-sm">
                  {employerDetails.employerRefno || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* WPS Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">WPS Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  WPS Bank Code
                </label>
                <p className="text-sm">{employerDetails.wpsBankCode || "—"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  WPS File Reference
                </label>
                <p className="text-sm">
                  {employerDetails.wpsFileReference || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bank Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Bank Account Number
                </label>
                <p className="text-sm">
                  {employerDetails.bankAccountNumber || "—"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  IBAN
                </label>
                <p className="text-sm">{employerDetails.iban || "—"}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {employerDetails.remarks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Remarks
                </label>
                <p className="text-sm">{employerDetails.remarks}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={employerDetails.isActive ? "default" : "secondary"}
                className={
                  employerDetails.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {employerDetails.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Additional Information (Metadata) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created By
                </label>
                <p className="text-sm">ID: {employerDetails.createBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created Date
                </label>
                <p className="text-sm">
                  {new Date(employerDetails.createDate).toLocaleDateString()}
                </p>
              </div>
              {employerDetails.editBy && (
                <>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited By
                    </label>
                    <p className="text-sm">ID: {employerDetails.editBy}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited Date
                    </label>
                    <p className="text-sm">
                      {new Date(employerDetails.editDate!).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
