"use client"

import { IDepartment } from "@/interfaces/department"

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
  department: IDepartment | null
}

export function DepartmentView({ open, onOpenChange, department }: Props) {
  if (!department) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Department Details</DialogTitle>
          <DialogDescription>
            View complete information about this department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Department Code
                </label>
                <p className="text-sm">{department.departmentCode || "-"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Department Name
                </label>
                <p className="text-sm font-medium">
                  {department.departmentName}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {department.remarks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Remarks
                </label>
                <p className="text-sm">{department.remarks}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={department.isActive ? "default" : "secondary"}
                className={
                  department.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {department.isActive ? "Active" : "Inactive"}
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
                <p className="text-sm">ID: {department.createBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created Date
                </label>
                <p className="text-sm">
                  {new Date(department.createDate).toLocaleDateString()}
                </p>
              </div>
              {department.editBy && (
                <>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited By
                    </label>
                    <p className="text-sm">ID: {department.editBy}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Edited Date
                    </label>
                    <p className="text-sm">
                      {new Date(department.editDate!).toLocaleDateString()}
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
