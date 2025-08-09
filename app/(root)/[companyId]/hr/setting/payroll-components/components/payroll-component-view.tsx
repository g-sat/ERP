"use client"

import { IPayrollComponent } from "@/interfaces/payroll"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PayrollComponentViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payrollComponent: IPayrollComponent | null
}

export function PayrollComponentView({
  open,
  onOpenChange,
  payrollComponent,
}: PayrollComponentViewProps) {
  if (!payrollComponent) return null

  const getTypeBadge = (component: IPayrollComponent) => {
    if (component.componentType === "Earning") {
      return <Badge variant="default">Earning</Badge>
    }
    return <Badge variant="secondary">Deduction</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payroll Component Details</DialogTitle>
          <DialogDescription>
            View payroll component information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Component Code
                </label>
                <p className="text-sm">{payrollComponent.componentCode}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Component Name
                </label>
                <p className="text-sm font-medium">
                  {payrollComponent.componentName}
                </p>
              </div>
            </div>
          </div>

          {/* Component Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Component Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Type
                </label>
                <div className="mt-1">{getTypeBadge(payrollComponent)}</div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sort Order
                </label>
                <p className="text-sm">{payrollComponent.sortOrder}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Is Bonus Component
                </label>
                <p className="text-sm">
                  {payrollComponent.isBonus ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Is Leave Component
                </label>
                <p className="text-sm">
                  {payrollComponent.isLeave ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Is Salary Component
              </label>
              <p className="text-sm">
                {payrollComponent.isSalaryComponent ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={payrollComponent.isActive ? "default" : "secondary"}
                className={
                  payrollComponent.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {payrollComponent.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Additional Information */}
          {payrollComponent.remarks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Remarks
                </label>
                <p className="mt-1 text-sm">{payrollComponent.remarks}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Created By
              </label>
              <p className="text-sm">{payrollComponent.createBy || "—"}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Created Date
              </label>
              <p className="text-sm">
                {payrollComponent.createDate
                  ? new Date(payrollComponent.createDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {payrollComponent.editBy && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified By
                </label>
                <p className="text-sm">{payrollComponent.editBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified Date
                </label>
                <p className="text-sm">
                  {payrollComponent.editDate
                    ? new Date(payrollComponent.editDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
