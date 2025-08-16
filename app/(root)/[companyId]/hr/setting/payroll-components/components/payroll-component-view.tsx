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
  component: IPayrollComponent | null
}

export function PayrollComponentView({
  open,
  onOpenChange,
  component,
}: PayrollComponentViewProps) {
  if (!component) return null

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
                <p className="text-sm">{component.componentCode}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Component Name
                </label>
                <p className="text-sm font-medium">{component.componentName}</p>
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
                <div className="mt-1">{getTypeBadge(component)}</div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sort Order
                </label>
                <p className="text-sm">{component.sortOrder}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Is Bonus Component
                </label>
                <p className="text-sm">{component.isBonus ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Is Leave Component
                </label>
                <p className="text-sm">{component.isLeave ? "Yes" : "No"}</p>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Is Salary Component
              </label>
              <p className="text-sm">
                {component.isSalaryComponent ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div>
              <Badge
                variant={component.isActive ? "default" : "secondary"}
                className={
                  component.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {component.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Additional Information */}
          {component.remarks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Remarks
                </label>
                <p className="mt-1 text-sm">{component.remarks}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Created By
              </label>
              <p className="text-sm">{component.createBy || "—"}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Created Date
              </label>
              <p className="text-sm">
                {component.createDate
                  ? new Date(component.createDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {component.editBy && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified By
                </label>
                <p className="text-sm">{component.editBy}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Modified Date
                </label>
                <p className="text-sm">
                  {component.editDate
                    ? new Date(component.editDate).toLocaleDateString()
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
