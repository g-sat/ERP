"use client"

import React from "react"
import { IPayrollComponentGLMapping } from "@/interfaces/payroll"
import {
  PayrollComponentGLMappingFormData,
  payrollComponentGLMappingSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import PayrollComponentAutocomplete from "@/components/ui-custom/autocomplete-payrollcomponent"

interface PayrollAccountIntegrationFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMapping: IPayrollComponentGLMapping | null
  onSubmit: (data: PayrollComponentGLMappingFormData) => void
  onCancel: () => void
}

export function PayrollAccountIntegrationForm({
  isOpen,
  onOpenChange,
  editingMapping,
  onSubmit,
  onCancel,
}: PayrollAccountIntegrationFormProps) {
  const form = useForm<PayrollComponentGLMappingFormData>({
    resolver: zodResolver(payrollComponentGLMappingSchema),
    defaultValues: {
      mappingId: editingMapping?.mappingId || 0,
      payrollComponentId: editingMapping?.payrollComponentId || 0,
      companyId: editingMapping?.companyId || 0,
      departmentId: editingMapping?.departmentId || 0,
      expenseGLId: editingMapping?.expenseGLId || 0,
      isActive: editingMapping?.isActive ?? true,
    },
  })

  const handleFormSubmit = (data: PayrollComponentGLMappingFormData) => {
    console.log("Form submitted with data:", data)
    onSubmit(data)
    onOpenChange(false)
    form.reset()
  }

  // Debug form state
  console.log("Form values:", form.watch())
  console.log("Form errors:", form.formState.errors)
  console.log("Form is valid:", form.formState.isValid)

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
    form.reset()
  }

  // Reset form when editingMapping changes
  React.useEffect(() => {
    console.log("Resetting form with editingMapping:", editingMapping)
    if (editingMapping) {
      form.reset({
        mappingId: editingMapping.mappingId,
        payrollComponentId: editingMapping.payrollComponentId,
        companyId: editingMapping.companyId,
        departmentId: editingMapping.departmentId,
        expenseGLId: editingMapping.expenseGLId,
        isActive: editingMapping.isActive ?? true,
      })
    } else {
      form.reset({
        mappingId: 0,
        payrollComponentId: 0,
        companyId: 0,
        departmentId: 0,
        expenseGLId: 0,
        isActive: true,
      })
    }
  }, [editingMapping, form])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMapping ? "Edit Account Mapping" : "Create Account Mapping"}
          </DialogTitle>
          <DialogDescription>
            Configure GL account mappings for payroll components
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("Form onSubmit event triggered")
              form.handleSubmit(handleFormSubmit, (errors) => {
                console.error("Form validation errors:", errors)
              })(e)
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <CompanyAutocomplete
                form={form}
                name="companyId"
                label="Company"
                isRequired={true}
              />
              <PayrollComponentAutocomplete
                form={form}
                name="payrollComponentId"
                label="Payroll Component"
                isRequired={true}
              />
            </div>
            <DepartmentAutocomplete
              form={form}
              name="departmentId"
              label="Department"
              isRequired={true}
            />

            <ChartOfAccountAutocomplete
              form={form}
              name="expenseGLId"
              label="Expense GL Account"
              isRequired={true}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this mapping
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  console.log("Test button clicked")
                  const values = form.getValues()
                  console.log("Current form values:", values)
                  console.log("Form errors:", form.formState.errors)
                  console.log("Form is valid:", form.formState.isValid)
                  form.handleSubmit(handleFormSubmit)()
                }}
              >
                Test Submit
              </Button>
              <Button
                type="submit"
                onClick={() => console.log("Submit button clicked")}
              >
                {editingMapping ? "Update Mapping" : "Create Mapping"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
