"use client"

import React from "react"
import { IEmployeeBank } from "@/interfaces/employee"
import { EmployeeBankValues, employeeBankSchema } from "@/schemas/employee"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useSaveEmployeeBank } from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ChartOfAccountAutocomplete } from "@/components/autocomplete"
import CustomInput from "@/components/custom/custom-input"

interface Props {
  employee?: IEmployeeBank
  companyId?: number
  onCancel?: () => void
}

export function EmployeePaymentForm({ employee, companyId, onCancel }: Props) {
  const saveMutation = useSaveEmployeeBank()

  // Debug logging
  console.log("Employee data in payment dialog:", employee)

  const form = useForm<EmployeeBankValues>({
    resolver: zodResolver(employeeBankSchema),
    defaultValues: {
      employeeId: employee?.employeeId || 0,
      bankName: employee?.bankName || "",
      accountNo: employee?.accountNo || "",
      swiftCode: employee?.swiftCode || "",
      iban: employee?.iban || "",
      glId: employee?.glId || 0,
    },
  })

  // Reset form when employee data changes
  React.useEffect(() => {
    if (employee) {
      form.reset({
        employeeId: employee.employeeId || 0,
        bankName: employee.bankName || "",
        accountNo: employee.accountNo || "",
        swiftCode: employee.swiftCode || "",
        iban: employee.iban || "",
        glId: employee.glId || 0,
      })
    }
  }, [employee, form])

  const onSubmit = (data: EmployeeBankValues) => {
    console.log("🔘 Submit button clicked!")
    console.log("Form data:", data)
    console.log("Form is valid:", form.formState.isValid)
    console.log("Form errors:", form.formState.errors)

    saveMutation.mutate(data)
    form.reset()
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            form={form}
            label="Bank Name"
            name="bankName"
            placeholder="Enter bank name"
          />
          <CustomInput
            form={form}
            label="Account Number"
            name="accountNo"
            placeholder="Enter account number"
          />
          <CustomInput
            form={form}
            label="Swift Code"
            name="swiftCode"
            placeholder="Enter swift code"
          />
          <CustomInput
            form={form}
            label="IBAN Number"
            name="iban"
            placeholder="Enter IBAN number"
          />
          <ChartOfAccountAutocomplete
            form={form}
            label="GL Account"
            name="glId"
            companyId={companyId || 0}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
