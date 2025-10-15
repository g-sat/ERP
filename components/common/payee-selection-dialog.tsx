"use client"

import * as React from "react"
import {
  ICustomerLookup,
  IEmployeeLookup,
  ISupplierLookup,
} from "@/interfaces/lookup"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  CompanyCustomerAutocomplete,
  CompanySupplierAutocomplete,
  EmployeeAutocomplete,
} from "@/components/autocomplete"

interface PayeeSelectionDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  onSelectPayeeAction: (
    payeeName: string,
    payeeType: "customer" | "supplier" | "employee"
  ) => void
  companyId: number
}

interface CustomerFormValues extends Record<string, unknown> {
  customerId: number
}

interface SupplierFormValues extends Record<string, unknown> {
  supplierId: number
}

interface EmployeeFormValues extends Record<string, unknown> {
  employeeId: number
}

export default function PayeeSelectionDialog({
  open,
  onOpenChangeAction,
  onSelectPayeeAction,
  companyId,
}: PayeeSelectionDialogProps) {
  const [payeeType, setPayeeType] = React.useState<
    "customer" | "supplier" | "employee"
  >("supplier")
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<ICustomerLookup | null>(null)
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<ISupplierLookup | null>(null)
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<IEmployeeLookup | null>(null)

  // Create forms for autocomplete components
  const customerForm = useForm<CustomerFormValues>({
    defaultValues: {
      customerId: 0,
    },
  })

  const supplierForm = useForm<SupplierFormValues>({
    defaultValues: {
      supplierId: 0,
    },
  })

  const employeeForm = useForm<EmployeeFormValues>({
    defaultValues: {
      employeeId: 0,
    },
  })

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (open) {
      setPayeeType("supplier" as const)
      setSelectedCustomer(null)
      setSelectedSupplier(null)
      setSelectedEmployee(null)
      customerForm.reset({ customerId: 0 })
      supplierForm.reset({ supplierId: 0 })
      employeeForm.reset({ employeeId: 0 })
    }
  }, [open, customerForm, supplierForm, employeeForm])

  const handleConfirm = () => {
    if (payeeType === "customer" && selectedCustomer) {
      onSelectPayeeAction(selectedCustomer.customerName || "", "customer")
      onOpenChangeAction(false)
    } else if (payeeType === "supplier" && selectedSupplier) {
      onSelectPayeeAction(selectedSupplier.supplierName || "", "supplier")
      onOpenChangeAction(false)
    } else if (payeeType === "employee" && selectedEmployee) {
      onSelectPayeeAction(selectedEmployee.employeeName || "", "employee")
      onOpenChangeAction(false)
    }
  }

  const handleCancel = () => {
    onOpenChangeAction(false)
  }

  const isConfirmDisabled =
    (payeeType === "customer" && !selectedCustomer) ||
    (payeeType === "supplier" && !selectedSupplier) ||
    (payeeType === "employee" && !selectedEmployee)

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Payee</DialogTitle>
          <DialogDescription>
            Choose a customer, supplier, or employee as the payee for this
            receipt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Payee Type Selection */}
          <div className="flex flex-col gap-2">
            <Label>Payee Type</Label>
            <RadioGroup
              value={payeeType}
              onValueChange={(value) =>
                setPayeeType(value as "customer" | "supplier" | "employee")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supplier" id="supplier" />
                <Label htmlFor="supplier" className="font-normal">
                  Supplier
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="font-normal">
                  Customer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee" className="font-normal">
                  Employee
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Customer/Supplier/Employee Selection */}
          {payeeType === "customer" ? (
            <CompanyCustomerAutocomplete
              form={customerForm}
              name="customerId"
              label="Select Customer"
              companyId={companyId}
              isRequired={true}
              onChangeEvent={setSelectedCustomer}
            />
          ) : payeeType === "supplier" ? (
            <CompanySupplierAutocomplete
              form={supplierForm}
              name="supplierId"
              label="Select Supplier"
              isRequired={true}
              onChangeEvent={setSelectedSupplier}
              companyId={companyId}
            />
          ) : (
            <EmployeeAutocomplete
              form={employeeForm}
              name="employeeId"
              label="Select Employee"
              isRequired={true}
              onChangeEvent={setSelectedEmployee}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
