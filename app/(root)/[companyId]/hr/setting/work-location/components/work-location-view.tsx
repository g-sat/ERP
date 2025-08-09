"use client"

import { IWorkLocation } from "@/interfaces/worklocation"

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
  workLocation: IWorkLocation | null
}

export function WorkLocationView({ open, onOpenChange, workLocation }: Props) {
  if (!workLocation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Work Location Details</DialogTitle>
          <DialogDescription>
            View complete information about this work location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Code
                </label>
                <p className="text-sm">
                  {workLocation.workLocationCode || "—"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Name
                </label>
                <p className="text-sm font-medium">
                  {workLocation.workLocationName}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Address Line 1
                </label>
                <p className="text-sm">{workLocation.address1 || "—"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Address Line 2
                </label>
                <p className="text-sm">{workLocation.address2 || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    City
                  </label>
                  <p className="text-sm">{workLocation.city || "—"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Postal Code
                  </label>
                  <p className="text-sm">{workLocation.postalCode || "—"}</p>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Country
                </label>
                <p className="text-sm">{workLocation.countryName || "—"}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={workLocation.isActive ? "default" : "secondary"}
                className={
                  workLocation.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {workLocation.isActive ? "Active" : "Inactive"}
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
                <p className="text-sm">ID: {workLocation.createBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created Date
                </label>
                <p className="text-sm">
                  {new Date(workLocation.createDate).toLocaleDateString()}
                </p>
              </div>
              {workLocation.editBy && (
                <>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited By
                    </label>
                    <p className="text-sm">ID: {workLocation.editBy}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited Date
                    </label>
                    <p className="text-sm">
                      {new Date(workLocation.editDate!).toLocaleDateString()}
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
