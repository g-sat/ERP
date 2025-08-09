"use client"

import { IDesignation } from "@/interfaces/designation"

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
  designation: IDesignation | null
}

export function DesignationView({ open, onOpenChange, designation }: Props) {
  if (!designation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Designation Details</DialogTitle>
          <DialogDescription>
            View complete information about this designation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Designation Code
                </label>
                <p className="text-sm">{designation.designationCode || "—"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Designation Name
                </label>
                <p className="text-sm font-medium">
                  {designation.designationName}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {designation.remarks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Remarks
                </label>
                <p className="text-sm">{designation.remarks}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={designation.isActive ? "default" : "secondary"}
                className={
                  designation.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {designation.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created By
                </label>
                <p className="text-sm">ID: {designation.createBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created Date
                </label>
                <p className="text-sm">
                  {new Date(designation.createDate).toLocaleDateString()}
                </p>
              </div>
              {designation.editBy && (
                <>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited By
                    </label>
                    <p className="text-sm">ID: {designation.editBy}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited Date
                    </label>
                    <p className="text-sm">
                      {new Date(designation.editDate!).toLocaleDateString()}
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
