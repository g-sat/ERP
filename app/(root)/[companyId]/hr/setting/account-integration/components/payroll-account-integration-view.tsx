"use client"

import { IPayrollComponentGLMapping } from "@/interfaces/payroll"

import { Badge } from "@/components/ui/badge"
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
  mapping: IPayrollComponentGLMapping | null
}

export function PayrollAccountIntegrationView({
  open,
  onOpenChange,
  mapping,
}: Props) {
  if (!mapping) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Account Integration Details</DialogTitle>
          <DialogDescription>
            View account integration mapping information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Company
                </label>
                <p className="text-sm">{mapping.companyName}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Department
                </label>
                <p className="text-sm">{mapping.departmentName}</p>
              </div>
            </div>
          </div>

          {/* Component Details */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Component Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Component Code
                </label>
                <p className="text-sm">{mapping.componentCode}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Component Name
                </label>
                <p className="text-sm">{mapping.componentName}</p>
              </div>
            </div>
          </div>

          {/* GL Account Details */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">GL Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Expense GL Code
                </label>
                <p className="text-sm">{mapping.expenseGLCode}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Expense GL Name
                </label>
                <p className="text-sm">{mapping.expenseGLName}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Status</h3>
            <div>
              <Badge variant={mapping.isActive ? "default" : "secondary"}>
                {mapping.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created By
                </label>
                <p className="text-sm">{mapping.createBy || "N/A"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Created Date
                </label>
                <p className="text-sm">
                  {mapping.createDate
                    ? new Date(mapping.createDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified By
                </label>
                <p className="text-sm">{mapping.editBy || "N/A"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified Date
                </label>
                <p className="text-sm">
                  {mapping.editDate
                    ? new Date(mapping.editDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
