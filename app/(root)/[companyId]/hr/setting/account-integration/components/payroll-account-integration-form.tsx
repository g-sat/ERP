"use client"

import React, { useState } from "react"
import {
  PayrollComponentGLMappingFormData,
  componentGLMappingSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import PayrollComponentAutocomplete from "@/components/ui-custom/autocomplete-payrollcomponent"

interface Props {
  initialData?: PayrollComponentGLMappingFormData
  onSave(data: PayrollComponentGLMappingFormData): void
}

export function PayrollAccountIntegrationForm({ initialData, onSave }: Props) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    initialData?.companyId || null
  )

  const form = useForm<PayrollComponentGLMappingFormData>({
    resolver: zodResolver(componentGLMappingSchema),
    defaultValues: {
      mappingId: initialData?.mappingId ?? 0,
      componentId: initialData?.componentId ?? 0,
      companyId: initialData?.companyId ?? 0,
      departmentId: initialData?.departmentId ?? 0,
      glId: initialData?.glId ?? 0,
      isActive: initialData?.isActive ?? true,
    },
    mode: "onChange",
  })

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        mappingId: initialData.mappingId,
        componentId: initialData.componentId,
        companyId: initialData.companyId,
        departmentId: initialData.departmentId,
        glId: initialData.glId,
        isActive: initialData.isActive,
      })
      setSelectedCompanyId(initialData.companyId)
    } else {
      form.reset({
        mappingId: 0,
        componentId: 0,
        companyId: 0,
        departmentId: 0,
        glId: 0,
        isActive: true,
      })
      setSelectedCompanyId(null)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form
        id="payroll-account-integration-form"
        onSubmit={form.handleSubmit(onSave)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <CompanyAutocomplete
            form={form}
            name="companyId"
            label="Company"
            isRequired
            onChangeEvent={(company) => {
              const companyId = company?.companyId || null
              setSelectedCompanyId(companyId)
              form.setValue("departmentId", 0)
              form.setValue("glId", 0)
            }}
          />
          <PayrollComponentAutocomplete
            form={form}
            name="componentId"
            label="Payroll Component"
            isRequired
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DepartmentAutocomplete
            form={form}
            name="departmentId"
            label="Department"
            isRequired
          />
          <ChartOfAccountAutocomplete
            form={form}
            name="glId"
            label="Expense GL Account"
            isRequired
            companyId={selectedCompanyId || 0}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked)}
          />
          <label
            htmlFor="isActive"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active
          </label>
        </div>
      </form>
    </Form>
  )
}
